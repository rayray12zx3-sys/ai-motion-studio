#!/usr/bin/env python3
# Original APP input is used only after checking a protected Actions credential.
"""Private Drive bridge for a manually authorized single S08 GitHub Actions run.
Uses a drive.file offline OAuth grant stored ONLY in an environment secret.
Never emits access tokens, Drive IDs, source URLs, response bodies or media.
"""
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import urllib.request
import urllib.error
import urllib.parse

API = "https://www.googleapis.com"
SIZE_CAP = 3_000_000
OUTPUT_CAP = 32_000_000
SCOPE = "https://www.googleapis.com/auth/drive.file"
IDS = re.compile(r"^[A-Za-z0-9_-]{15,160}$")

class TransferFailure(RuntimeError):
    pass

def config():
    try:
        c = json.loads(os.environ["S08_DRIVE_CONFIG_JSON"])
        src, folder = c["source_file_id"], c["destination_folder_id"]
        if not isinstance(src, str) or not isinstance(folder, str) or not IDS.fullmatch(src) or not IDS.fullmatch(folder):
            raise ValueError()
        if c.get("auth_mode") != "oauth_refresh" or c.get("scope") != SCOPE or c.get("publishing_status") != "production":
            raise ValueError()
        for key in ("client_id", "client_secret", "refresh_token"):
            if not isinstance(c.get(key), str) or not c[key] or len(c[key]) > 4096 or any(ord(x) < 32 for x in c[key]):
                raise ValueError()
        if not c["client_id"].endswith(".apps.googleusercontent.com"):
            raise ValueError()
    except (KeyError, ValueError, TypeError, json.JSONDecodeError):
        raise TransferFailure("MISSING_OR_INVALID_SECRET_CONFIG")
    return refresh(c), src, folder


def refresh(c):
    # Fixed endpoint; do not follow redirects or print response/exception bodies.
    payload = urllib.parse.urlencode({"client_id": c["client_id"],
        "client_secret": c["client_secret"], "refresh_token": c["refresh_token"],
        "grant_type": "refresh_token"}).encode()
    q = urllib.request.Request("https://oauth2.googleapis.com/token", data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"}, method="POST")
    try:
        with urllib.request.build_opener(RejectRedirect()).open(q, timeout=30) as r:
            raw = r.read(65537)
        if len(raw) > 65536:
            raise ValueError()
        obj = json.loads(raw)
        token = obj["access_token"]
        if (not isinstance(token, str) or not token or len(token) > 8192 or
            any(ord(x) < 32 for x in token) or obj.get("token_type", "").lower() != "bearer" or
            not 60 <= int(obj["expires_in"]) <= 7200 or
            set(obj.get("scope", SCOPE).split()) != {SCOPE}):
            raise ValueError()
        return token
    except Exception:
        raise TransferFailure("OAUTH_REFRESH_FAILED_REAUTHORIZE_NO_DETAILS_LOGGED") from None


class RejectRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args):
        raise TransferFailure("OAUTH_REDIRECT_REJECTED")

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, new_url):
        from urllib.parse import urlsplit
        p = urlsplit(new_url)
        host = (p.hostname or "").lower()
        google_media = (host.endswith(".googleusercontent.com") or
                        host == "drive.usercontent.google.com" or
                        host == "googleusercontent.com")
        if p.scheme != "https" or not google_media:
            raise TransferFailure("UNTRUSTED_DOWNLOAD_REDIRECT")
        # Never forward the OAuth Authorization header across hosts.
        return urllib.request.Request(new_url, headers={"Accept": "application/octet-stream"})

def request(url, token, *, payload=None, mime=None, limit=SIZE_CAP):
    if not url.startswith(API + "/"):
        raise TransferFailure("UNTRUSTED_DRIVE_ENDPOINT")
    h = {"Authorization": "Bearer " + token, "Accept": "application/json"}
    if mime:
        h["Content-Type"] = mime
    q = urllib.request.Request(url, data=payload, headers=h,
                               method="POST" if payload is not None else "GET")
    try:
        with urllib.request.build_opener(NoRedirect()).open(q, timeout=90) as r:
            raw = r.read(limit + 1)
            if len(raw) > limit:
                raise TransferFailure("RESPONSE_TOO_LARGE")
            return raw
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError):
        raise TransferFailure("DRIVE_REQUEST_FAILED_NO_DETAILS_LOGGED")

def sha(data):
    return hashlib.sha256(data).hexdigest()

def pull(out):
    token, source, folder = config()
    path = Path(out)
    if path.exists():
        raise TransferFailure("REFUSE_REPLACE_ARCHIVE")
    validate_folder(token, folder)
    blob = request(API + "/drive/v3/files/" + source + "?alt=media",
                   token, limit=SIZE_CAP)
    from s08_ephemeral_archive_gate import EXPECTED_SHA256
    if sha(blob) != EXPECTED_SHA256:
        raise TransferFailure("SOURCE_ARCHIVE_DIGEST_FAILED")
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "xb") as f:
        f.write(blob)
    print("S08_PRIVATE_SOURCE_SHA256_PASS")

def validate_folder(token, config_folder):
    # Caller supplies the already validated folder, never discover other Drive files.
    raw = request(API + "/drive/v3/files/" + config_folder +
        "?fields=id,mimeType,trashed,capabilities(canAddChildren),permissions(type,role)", token, limit=65536)
    try:
        obj = json.loads(raw)
        if (obj["id"] != config_folder or obj["mimeType"] != "application/vnd.google-apps.folder" or
            obj.get("trashed", True) or not obj.get("capabilities", {}).get("canAddChildren") or
            not obj.get("permissions") or any(p.get("type") != "user" for p in obj["permissions"])):
            raise ValueError()
    except (ValueError, KeyError, TypeError):
        raise TransferFailure("PRIVATE_DESTINATION_VALIDATION_FAILED") from None


def upload_one(token, folder, path, name, mime):
    payload = Path(path).read_bytes()
    if len(payload) > OUTPUT_CAP:
        raise TransferFailure("OUTPUT_TOO_LARGE")
    boundary = "S08HYBRIDBOUNDARY"
    metadata = json.dumps({"name": name, "parents": [folder],
                           "mimeType": mime}).encode()
    header = (b"--" + boundary.encode() + b"\r\n"
              b"Content-Type: application/json; charset=utf-8\r\n\r\n"
              + metadata + b"\r\n--" + boundary.encode() + b"\r\n"
              + b"Content-Type: " + mime.encode() + b"\r\n\r\n")
    body = header + payload + b"\r\n--" + boundary.encode() + b"--\r\n"
    res = request(API + "/upload/drive/v3/files?uploadType=multipart&fields=id",
                  token, payload=body, mime="multipart/related; boundary=" + boundary,
                  limit=65536)
    try:
        output_id = json.loads(res)["id"]
    except (ValueError, KeyError):
        raise TransferFailure("DRIVE_UPLOAD_RECEIPT_INVALID")
    if not IDS.fullmatch(output_id):
        raise TransferFailure("DRIVE_UPLOADED_FILE_ID_INVALID")
    # Read back original bytes to independently verify cloud persistence.
    remote = request(API + "/drive/v3/files/" + output_id + "?alt=media",
                     token, limit=OUTPUT_CAP)
    if sha(remote) != sha(payload):
        raise TransferFailure("DRIVE_UPLOAD_READBACK_SHA_MISMATCH")
    return output_id

def push(video, receipt):
    token, _, folder = config()
    video = Path(video)
    receipt = Path(receipt)
    validate_folder(token, folder)
    if not video.is_file() or not receipt.is_file():
        raise TransferFailure("OUTPUTS_MISSING")
    prefix = "S08_HF95_" + sha(video.read_bytes())[:12]
    upload_one(token, folder, video, prefix + "_UNAPPROVED.mp4", "video/mp4")
    upload_one(token, folder, receipt, prefix + "_TECH_QA.json", "application/json")
    print("PRIVATE_DRIVE_VIDEO_AND_QA_SHA_READBACK_PASS")

if __name__ == "__main__":
    try:
        if len(sys.argv) == 3 and sys.argv[1] == "pull":
            pull(sys.argv[2])
        elif len(sys.argv) == 4 and sys.argv[1] == "push":
            push(sys.argv[2], sys.argv[3])
        else:
            raise TransferFailure("USAGE")
    except Exception as exc:
        label = str(exc) if isinstance(exc, TransferFailure) else "REDACTED_FAILURE"
        print("BLOCKED_NO_PASS:" + label, file=sys.stderr)
        sys.exit(2)

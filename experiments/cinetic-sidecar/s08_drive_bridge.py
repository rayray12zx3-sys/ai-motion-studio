#!/usr/bin/env python3
# Original APP input is used only after checking a protected Actions credential.
"""Private Drive bridge for a manually authorized single S08 GitHub Actions run.
Uses a short-lived OAuth access token stored ONLY in an Actions secret.
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

API = "https://www.googleapis.com"
SIZE_CAP = 3_000_000
IDS = re.compile(r"^[A-Za-z0-9_-]{15,160}$")

class TransferFailure(RuntimeError):
    pass

def config():
    try:
        c = json.loads(os.environ["S08_DRIVE_CONFIG_JSON"])
        token = c["access_token"]
        src, folder = c["source_file_id"], c["destination_folder_id"]
        if not token or not IDS.fullmatch(src) or not IDS.fullmatch(folder):
            raise ValueError()
        return token, src, folder
    except (KeyError, ValueError, TypeError, json.JSONDecodeError):
        raise TransferFailure("MISSING_OR_INVALID_SECRET_CONFIG")

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
    token, source, _ = config()
    path = Path(out)
    if path.exists():
        raise TransferFailure("REFUSE_REPLACE_ARCHIVE")
    blob = request(API + "/drive/v3/files/" + source + "?alt=media",
                   token, limit=SIZE_CAP)
    from s08_ephemeral_archive_gate import EXPECTED_SHA256
    if sha(blob) != EXPECTED_SHA256:
        raise TransferFailure("SOURCE_ARCHIVE_DIGEST_FAILED")
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "xb") as f:
        f.write(blob)
    print("S08_PRIVATE_SOURCE_SHA256_PASS")

def upload_one(token, folder, path, name, mime):
    payload = Path(path).read_bytes()
    if len(payload) > SIZE_CAP:
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
                     token, limit=SIZE_CAP)
    if sha(remote) != sha(payload):
        raise TransferFailure("DRIVE_UPLOAD_READBACK_SHA_MISMATCH")
    return output_id

def push(video, receipt):
    token, _, folder = config()
    video = Path(video)
    receipt = Path(receipt)
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

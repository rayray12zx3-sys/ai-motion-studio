#!/usr/bin/env python3
"""Prepare app-created, PRIVATE Drive staging under an existing drive.file grant.

Only creates an empty ZIP placeholder and an empty output folder in My Drive.
Never consumes real media; never prints IDs, tokens, payloads, API responses.
The owner must supply bytes to the placeholder via an authorized Drive account.
"""
import json
import os
import urllib.parse
import s08_drive_bridge as bridge

INPUT_NAME = "S08_HF95_APP_OWNED_INPUT_PENDING_20261022.zip"
OUTPUT_NAME = "S08_HF95_APP_OWNED_OUTPUT_PENDING_20261022"
FOLDER_TYPE = "application/vnd.google-apps.folder"
INPUT_TYPE = "application/zip"


def pending_config():
    try:
        wrapper = json.loads(os.environ["S08_DRIVE_CONFIG_JSON"])
        if set(wrapper) != {"status", "protected_oauth_config"} or wrapper["status"] != "PENDING_FILE_GRANT":
            raise ValueError()
        c = wrapper["protected_oauth_config"]
        if (c.get("auth_mode") != "oauth_refresh" or c.get("scope") != bridge.SCOPE
                or c.get("publishing_status") != "production"):
            raise ValueError()
        for name in ("client_id", "client_secret", "refresh_token"):
            if not isinstance(c.get(name), str) or not c[name]:
                raise ValueError()
        return c
    except (KeyError, ValueError, TypeError):
        raise bridge.TransferFailure("PENDING_GRANT_REQUIRED") from None


def exact_app_created(token, name, kind):
    expression = "name = '" + name + "' and trashed = false"
    url = (bridge.API + "/drive/v3/files?" +
           urllib.parse.urlencode({"q": expression, "fields": "nextPageToken,files(id,name,mimeType,trashed)",
                                  "pageSize": 10, "spaces": "drive"}))
    obj = json.loads(bridge.request(url, token, limit=65536))
    if not isinstance(obj, dict) or obj.get("nextPageToken"):
        raise bridge.TransferFailure("STAGING_LIST_AMBIGUOUS")
    items = obj.get("files", [])
    if not isinstance(items, list) or len(items) > 1:
        raise bridge.TransferFailure("STAGING_DUPLICATE_REJECTED")
    for item in items:
        if (item.get("name") != name or item.get("mimeType") != kind
                or item.get("trashed", True) or not bridge.IDS.fullmatch(item.get("id", ""))):
            raise bridge.TransferFailure("STAGING_ITEM_INVALID")
    return items[0]["id"] if items else None


def prepare_one(token, name, kind):
    existing = exact_app_created(token, name, kind)
    if existing:
        return existing
    body = json.dumps({"name": name, "mimeType": kind}).encode()
    res = json.loads(bridge.request(bridge.API + "/drive/v3/files?fields=id,name,mimeType",
                                   token, payload=body, mime="application/json", limit=65536))
    if (res.get("name") != name or res.get("mimeType") != kind or
            not bridge.IDS.fullmatch(res.get("id", ""))):
        raise bridge.TransferFailure("STAGING_CREATE_RECEIPT_INVALID")
    return res["id"]


def stage():
    token = bridge.refresh(pending_config())
    source = prepare_one(token, INPUT_NAME, INPUT_TYPE)
    folder = prepare_one(token, OUTPUT_NAME, FOLDER_TYPE)
    # Permission proof for app-created files, still NO PRIVATE MEDIA.
    source_meta = json.loads(bridge.request(bridge.API + "/drive/v3/files/" + source +
        "?fields=id,mimeType,trashed,size,capabilities(canDownload)",
        token, limit=65536))
    folder_meta = json.loads(bridge.request(bridge.API + "/drive/v3/files/" + folder +
        "?fields=id,mimeType,trashed,capabilities(canAddChildren)",
        token, limit=65536))
    if (source_meta.get("id") != source or source_meta.get("mimeType") != INPUT_TYPE or
        source_meta.get("trashed", True) or
        str(source_meta.get("size", "0")) != "0" or
        not source_meta.get("capabilities", {}).get("canDownload") or
        folder_meta.get("id") != folder or folder_meta.get("mimeType") != FOLDER_TYPE or
        folder_meta.get("trashed", True) or
        not folder_meta.get("capabilities", {}).get("canAddChildren")):
        raise bridge.TransferFailure("STAGING_APP_ACCESS_NOT_CONFIRMED")
    print("S08_PRIVATE_APP_OWNED_STAGING_CREATED_AND_ACCESS_VERIFIED")
    print("NO_PRIVATE_MEDIA_DOWNLOADED_OR_UPLOADED")


if __name__ == "__main__":
    try:
        stage()
    except Exception as error:
        code = str(error) if isinstance(error, bridge.TransferFailure) else "REDACTED_STAGING_FAILURE"
        print("BLOCKED_NO_PASS:" + code, file=__import__("sys").stderr)
        raise SystemExit(2)

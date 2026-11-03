#!/usr/bin/env python3
"""Create only a new empty app-owned v22s candidate input; preserve v22r input."""
import json
import sys
import s08_app_owned_stage as stage
import s08_drive_bridge as bridge

NEW_NAME = "S08_HF95_APP_OWNED_INPUT_V22S_PRIVATE.zip"

def main():
    pending = stage.pending_config()
    token = bridge.refresh(pending)
    folder = stage.exact_app_created(token, stage.OUTPUT_NAME, stage.FOLDER_TYPE)
    if not folder:
        raise bridge.TransferFailure("EXISTING_PRIVATE_OUTPUT_FOLDER_REQUIRED")
    # Preserve the old input untouched; only app-created empty files are allowed.
    created = stage.prepare_one(token, NEW_NAME, stage.INPUT_TYPE)
    data = json.loads(bridge.request(
        bridge.API + "/drive/v3/files/" + created +
        "?fields=id,name,mimeType,trashed,size,capabilities(canDownload)",
        token, limit=65536))
    if (data.get("id") != created or data.get("name") != NEW_NAME or
        data.get("mimeType") != stage.INPUT_TYPE or
        data.get("trashed", True) or str(data.get("size", "0")) != "0" or
        not data.get("capabilities", {}).get("canDownload")):
        raise bridge.TransferFailure("CANDIDATE_PLACEHOLDER_NOT_EMPTY_OR_UNAUTHORIZED")
    print("S08_V22S_PRIVATE_EMPTY_PLACEHOLDER_READY_NO_MEDIA")

if __name__=="__main__":
    try:
        main()
    except Exception as err:
        print("BLOCKED_NO_PASS:"+(str(err) if isinstance(err,bridge.TransferFailure) else "REDACTED"),file=sys.stderr)
        raise SystemExit(2)

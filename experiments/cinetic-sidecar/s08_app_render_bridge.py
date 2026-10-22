#!/usr/bin/env python3
"""Verified app-created staging -> existing S08 private Drive bridge.

Never upgrades the protected PENDING_FILE_GRANT secret. A single disposable
Python process resolves only the two app-created, privately staged items,
verifies exact metadata and parent restrictions, then passes a temporary
in-memory ready config to the unchanged media bridge. No secret is written
to GitHub, logs, PR artifacts or GITHUB_ENV.
"""
import json
import os
import sys

import s08_app_owned_stage as stage
import s08_drive_bridge as bridge

EXPECTED_SOURCE_SIZE = "305622"


def stage_ready_config():
    pending = stage.pending_config()
    token = bridge.refresh(pending)
    source = stage.exact_app_created(token, stage.INPUT_NAME, stage.INPUT_TYPE)
    folder = stage.exact_app_created(token, stage.OUTPUT_NAME, stage.FOLDER_TYPE)
    if not source or not folder or source == folder:
        raise bridge.TransferFailure("STAGING_FILES_MISSING")

    source_data = json.loads(bridge.request(bridge.API + "/drive/v3/files/" + source +
        "?fields=id,name,mimeType,trashed,size,parents,capabilities(canDownload)",
        token, limit=65536))
    folder_data = json.loads(bridge.request(bridge.API + "/drive/v3/files/" + folder +
        "?fields=id,name,mimeType,trashed,parents,capabilities(canAddChildren),permissions(type)",
        token, limit=65536))

    # Existing original Drive folder ID comes only from the protected secret.
    # The original source file ID is never used to fetch media in this route.
    if (source_data.get("id") != source or
        source_data.get("name") != stage.INPUT_NAME or
        source_data.get("mimeType") != stage.INPUT_TYPE or
        source_data.get("trashed", True) or
        str(source_data.get("size")) != EXPECTED_SOURCE_SIZE or
        source_data.get("parents") != [folder] or
        not source_data.get("capabilities", {}).get("canDownload") or
        folder_data.get("id") != folder or
        folder_data.get("name") != stage.OUTPUT_NAME or
        folder_data.get("mimeType") != stage.FOLDER_TYPE or
        folder_data.get("trashed", True) or
        folder_data.get("parents") != [pending["destination_folder_id"]] or
        not folder_data.get("capabilities", {}).get("canAddChildren") or
        not isinstance(folder_data.get("permissions"), list) or
        not folder_data["permissions"] or
        any(p.get("type") != "user" for p in folder_data["permissions"])):
        raise bridge.TransferFailure("PRIVATE_STAGING_ACCESS_OR_PARENT_INVALID")

    ready = dict(pending)
    ready["source_file_id"] = source
    ready["destination_folder_id"] = folder
    return ready


def command(action, args):
    ready = stage_ready_config()
    if action == "probe" and not args:
        print("APP_OWNED_STAGING_METADATA_PASS")
        return
    if action == "pull" and len(args) == 1:
        # The existing bridge independently verifies the SHA of the actual ZIP.
        os.environ["S08_DRIVE_CONFIG_JSON"] = json.dumps(ready)
        bridge.pull(args[0])
        return
    if action == "push" and 2 <= len(args) <= 4:
        os.environ["S08_DRIVE_CONFIG_JSON"] = json.dumps(ready)
        bridge.push(*args)
        return
    raise bridge.TransferFailure("USAGE")


if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            raise bridge.TransferFailure("USAGE")
        command(sys.argv[1], sys.argv[2:])
    except Exception as error:
        label = str(error) if isinstance(error, bridge.TransferFailure) else "REDACTED_STAGING_BRIDGE_FAILURE"
        print("BLOCKED_NO_PASS:" + label, file=sys.stderr)
        raise SystemExit(2)

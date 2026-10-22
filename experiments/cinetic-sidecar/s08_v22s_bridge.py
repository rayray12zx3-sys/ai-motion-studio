#!/usr/bin/env python3
"""Preserve v22r and use only app-created v22s input in restricted Drive."""
import json
import os
import sys
from pathlib import Path
import s08_app_owned_stage as stage
import s08_app_render_bridge as staged
import s08_drive_bridge as bridge
from s08_v22s_archive_gate import EXPECTED_SHA256

stage.INPUT_NAME = "S08_HF95_APP_OWNED_INPUT_V22S_PRIVATE.zip"
staged.EXPECTED_SOURCE_SIZE = "306735"

def verified_ready():
    return staged.stage_ready_config()

def run(action,paths):
    ready=verified_ready()
    if action=="probe" and not paths:
        print("S08_V22S_PRIVATE_STAGING_VERIFIED_NO_MEDIA")
        return
    os.environ["S08_DRIVE_CONFIG_JSON"]=json.dumps(ready)
    if action=="pull" and len(paths)==1:
        path=Path(paths[0])
        if path.exists():
            raise bridge.TransferFailure("REFUSE_REPLACE_ARCHIVE")
        token,source,folder=bridge.config()
        bridge.validate_folder(token,folder)
        blob=bridge.request(bridge.API+"/drive/v3/files/"+source+"?alt=media",token,limit=bridge.SIZE_CAP)
        if bridge.sha(blob)!=EXPECTED_SHA256:
            raise bridge.TransferFailure("V22S_ARCHIVE_SHA_MISMATCH")
        path.parent.mkdir(parents=True,exist_ok=True)
        with open(path,"xb") as stream:stream.write(blob)
        print("S08_V22S_SOURCE_SHA256_PASS")
        return
    if action=="push" and 2<=len(paths)<=4:
        bridge.push(*paths)
        return
    raise bridge.TransferFailure("USAGE")

if __name__=="__main__":
    try: run(sys.argv[1],sys.argv[2:])
    except Exception as error:
        print("BLOCKED_NO_PASS:"+(str(error) if isinstance(error,bridge.TransferFailure) else "REDACTED"),file=sys.stderr)
        raise SystemExit(2)

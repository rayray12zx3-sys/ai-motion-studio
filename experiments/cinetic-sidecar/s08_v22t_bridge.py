#!/usr/bin/env python3
"""Preserve v22r and use only app-created v22t input in restricted Drive."""
import json
import os
import sys
from pathlib import Path
import s08_app_owned_stage as stage
import s08_app_render_bridge as staged
import s08_drive_bridge as bridge
from s08_v22t_archive_gate import EXPECTED_SHA256

from s08_v22t_stage import NEW_NAME
EXPECTED_SOURCE_SIZE = "306841"

def verified_ready():
    pending=stage.pending_config()
    token=bridge.refresh(pending)
    source=stage.exact_app_created(token,NEW_NAME,stage.INPUT_TYPE)
    folder=stage.exact_app_created(token,stage.OUTPUT_NAME,stage.FOLDER_TYPE)
    if not source or not folder or source==folder:
        raise bridge.TransferFailure("V22T_PRIVATE_STAGING_MISSING")
    src=json.loads(bridge.request(bridge.API+"/drive/v3/files/"+source+
        "?fields=id,name,mimeType,trashed,size,parents,capabilities(canDownload)",token,limit=65536))
    dst=json.loads(bridge.request(bridge.API+"/drive/v3/files/"+folder+
        "?fields=id,name,mimeType,trashed,parents,capabilities(canAddChildren),permissions(type)",
        token,limit=65536))
    if (src.get("id")!=source or src.get("name")!=NEW_NAME or
        src.get("mimeType")!=stage.INPUT_TYPE or src.get("trashed",True) or
        str(src.get("size"))!=EXPECTED_SOURCE_SIZE or src.get("parents")!=[folder] or
        not src.get("capabilities",{}).get("canDownload") or
        dst.get("id")!=folder or dst.get("name")!=stage.OUTPUT_NAME or
        dst.get("mimeType")!=stage.FOLDER_TYPE or dst.get("trashed",True) or
        dst.get("parents")!=[pending["destination_folder_id"]] or
        not dst.get("capabilities",{}).get("canAddChildren") or
        not isinstance(dst.get("permissions"),list) or not dst["permissions"] or
        any(p.get("type")!="user" for p in dst["permissions"])):
        raise bridge.TransferFailure("V22T_PRIVATE_PARENT_OR_SCOPE_INVALID")
    return dict(pending,source_file_id=source,destination_folder_id=folder)

def run(action,paths):
    ready=verified_ready()
    if action=="probe" and not paths:
        print("S08_V22T_PRIVATE_STAGING_VERIFIED_NO_MEDIA")
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
            raise bridge.TransferFailure("V22T_ARCHIVE_SHA_MISMATCH")
        path.parent.mkdir(parents=True,exist_ok=True)
        with open(path,"xb") as stream:stream.write(blob)
        print("S08_V22T_SOURCE_SHA256_PASS")
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

#!/usr/bin/env python3
"""Owner-only metadata probe. Never downloads or uploads media or promotes grants."""
import json
import os
import sys
import s08_drive_bridge as bridge


def probe():
    try:
        saved = json.loads(os.environ.pop('S08_DRIVE_CONFIG_JSON'))
        if saved.get('status') != 'PENDING_FILE_GRANT':
            raise ValueError()
        os.environ['S08_DRIVE_CONFIG_JSON'] = json.dumps(saved['protected_oauth_config'])
        token, source, folder = bridge.config()
    except bridge.TransferFailure as exc:
        allowed = {'OAUTH_REFRESH_FAILED_'+v for v in ('INVALID_CLIENT','INVALID_GRANT','INVALID_REQUEST','UNAUTHORIZED_CLIENT','INVALID_SCOPE','ACCESS_DENIED')}
        print(str(exc) if str(exc) in allowed else 'PENDING_GRANT_PROBE_CONFIG_OR_REFRESH_FAILED')
        return 2
    except Exception:
        print('PENDING_GRANT_PROBE_CONFIG_OR_REFRESH_FAILED')
        return 2
    finally:
        os.environ.pop('S08_DRIVE_CONFIG_JSON', None)
    print('OAUTH_REFRESH_PASS')
    source_ok = folder_ok = False
    try:
        obj = json.loads(bridge.request(bridge.API+'/drive/v3/files/'+source+
            '?fields=id,mimeType,trashed,size,capabilities(canDownload)',token,limit=65536))
        source_ok = (obj.get('id')==source and obj.get('mimeType')=='application/zip' and
            obj.get('trashed') is False and str(obj.get('size'))=='305622' and
            obj.get('capabilities',{}).get('canDownload') is True)
    except Exception:
        pass
    print('SOURCE_METADATA_ACCESS_PASS' if source_ok else 'SOURCE_METADATA_ACCESS_BLOCKED')
    try:
        bridge.validate_folder(token,folder)
        folder_ok = True
    except Exception:
        pass
    print('DESTINATION_METADATA_ACCESS_PASS' if folder_ok else 'DESTINATION_METADATA_ACCESS_BLOCKED')
    print('MEDIA_NOT_ACCESSED_GRANT_NOT_PROMOTED')
    return 0 if source_ok and folder_ok else 3


if __name__ == '__main__':
    sys.exit(probe())

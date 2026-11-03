#!/usr/bin/env python3
"""Version-specific immutable SHA gate for PRIVATE visual-parity candidate."""
import sys
import s08_ephemeral_archive_gate as original
EXPECTED_SHA256 = "f0ad2de50147eac5e942d28f35046b735e6cf690a6767450a0be7a9b2f746512"

def verify_extract(archive,destination):
    original.EXPECTED_SHA256 = EXPECTED_SHA256
    original.verify_extract(archive,destination)

if __name__=="__main__":
    try:
        if len(sys.argv)!=3: raise ValueError("USAGE")
        verify_extract(sys.argv[1],sys.argv[2])
    except Exception:
        print("BLOCKED_NO_PASS:V22S_PRIVATE_ARCHIVE_INVALID",file=sys.stderr)
        raise SystemExit(2)

#!/usr/bin/env python3
"""Version-specific immutable SHA gate for PRIVATE visual-parity candidate."""
import sys
import s08_ephemeral_archive_gate as original
EXPECTED_SHA256 = "c118d1e9024d623c4eed9ac2c6e0ad4ba5c0ce08b707c9bccf298f84aefe342a"

def verify_extract(archive,destination):
    original.EXPECTED_SHA256 = EXPECTED_SHA256
    original.verify_extract(archive,destination)

if __name__=="__main__":
    try:
        if len(sys.argv)!=3: raise ValueError("USAGE")
        verify_extract(sys.argv[1],sys.argv[2])
    except Exception:
        print("BLOCKED_NO_PASS:V22T_PRIVATE_ARCHIVE_INVALID",file=sys.stderr)
        raise SystemExit(2)

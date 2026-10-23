#!/usr/bin/env python3
"""Version-specific immutable SHA gate for PRIVATE visual-parity candidate."""
import sys
import s08_ephemeral_archive_gate as original
EXPECTED_SHA256 = "1bb6278ccca698dbcb7a656257822865c909abac0f477dcff7c817c806c6cfb0"

def verify_extract(archive,destination):
    original.EXPECTED_SHA256 = EXPECTED_SHA256
    original.verify_extract(archive,destination)

if __name__=="__main__":
    try:
        if len(sys.argv)!=3: raise ValueError("USAGE")
        verify_extract(sys.argv[1],sys.argv[2])
    except Exception:
        print("BLOCKED_NO_PASS:V22U_PRIVATE_ARCHIVE_INVALID",file=sys.stderr)
        raise SystemExit(2)

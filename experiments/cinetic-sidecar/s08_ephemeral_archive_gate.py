#!/usr/bin/env python3
"""Validate and extract a hash-pinned private S08 archive inside an ephemeral runner.
The repository contains no APP assets. Never print ZIP members or credentials.
"""
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import shutil
import stat
import sys
import zipfile

EXPECTED_SHA256 = "7841ebaf03c9a376d8f80601de3fcc15dc6707efbb4771a48e80a2ca4f4b1ae3"
EXPECTED_FILES = frozenset({"index.html", "scene.js", "manifest.json",
    "test_scene.cjs", "test_full_seek.cjs"})
ALLOWED_EXTENSIONS = frozenset({".html", ".js", ".cjs", ".json", ".png",
    ".mp4", ".md", ".ps1", ".py", ".txt"})
MAX_EXTRACTED_BYTES = 8000000

def digest(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for b in iter(lambda: f.read(262144), b""):
            h.update(b)
    return h.hexdigest()

def verify_extract(archive, destination):
    archive, destination = Path(archive), Path(destination)
    if not archive.is_file() or digest(archive) != EXPECTED_SHA256:
        raise ValueError("SOURCE_SHA_MISMATCH")
    if destination.exists():
        raise ValueError("DESTINATION_EXISTS")
    with zipfile.ZipFile(archive) as z:
        infos = z.infolist()
        names = {i.filename for i in infos}
        if not EXPECTED_FILES.issubset(names) or len(infos) > 80:
            raise ValueError("ARCHIVE_MANIFEST_INVALID")
        if sum(i.file_size for i in infos) > MAX_EXTRACTED_BYTES:
            raise ValueError("ARCHIVE_EXTRACT_TOO_LARGE")
        seen = set()
        for i in infos:
            name = i.filename
            p = PurePosixPath(name)
            if (name.startswith("/") or chr(92) in name or ".." in p.parts or
                ":" in name or not p.parts or i.is_dir() or
                p.suffix.lower() not in ALLOWED_EXTENSIONS or
                p.as_posix().lower() in seen):
                raise ValueError("ARCHIVE_MEMBER_REJECTED")
            seen.add(p.as_posix().lower())
            if stat.S_IFMT(i.external_attr >> 16) == stat.S_IFLNK:
                raise ValueError("ARCHIVE_SYMLINK_REJECTED")
        manifest = json.loads(z.read("manifest.json"))
        if (manifest.get("schema") != "s08-v22r-private-cinetic-hyperframes-job-v1"
            or manifest.get("frames") != 95 or manifest.get("fps") != 30 or
            manifest.get("width") != 540 or manifest.get("height") != 960):
            raise ValueError("SOURCE_TIMELINE_INVALID")
        for filename, sha in manifest["assets"].items():
            entry = "inputs/" + filename
            if entry not in names or hashlib.sha256(z.read(entry)).hexdigest() != sha:
                raise ValueError("ASSET_DIGEST_INVALID")
        html = z.read("index.html").decode("utf-8")
        scene = z.read("scene.js").decode("utf-8")
        if ('data-composition-id=' not in html or
            'data-duration="3.1666666667"' not in html or
            'data-no-timeline' not in html or
            'hf-seek' not in scene):
            raise ValueError("SCENE_CONTRACT_INVALID")
        destination.mkdir(parents=True)
        for i in infos:
            target = destination.joinpath(*PurePosixPath(i.filename).parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            with z.open(i, "r") as src, open(target, "xb") as dst:
                shutil.copyfileobj(src, dst)
    print("PRIVATE_SOURCE_HASH_MANIFEST_AND_SCENE_PASS")

if __name__ == "__main__":
    try:
        if len(sys.argv) != 3:
            raise ValueError("USAGE_INPUT_ZIP_AND_NEW_OUTPUT_DIR")
        verify_extract(sys.argv[1], sys.argv[2])
    except Exception as e:
        print("BLOCKED_NO_PASS:" + (str(e) if isinstance(e, ValueError) else
              type(e).__name__), file=sys.stderr)
        sys.exit(2)

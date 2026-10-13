#!/usr/bin/env python3
"""Private R&D: convert independently authored animated icons to alpha ProRes MOV.

This does NOT establish a legal license: a real creator/product license must
be manually verified separately. No remote fetch, public output, AE or paid API.
"""
import argparse
import hashlib
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

P2 = Path(__file__).resolve().parents[1]
PRIVATE = (P2 / "artifacts" / "private").resolve()
PNG_PATTERN = re.compile(r"^(.*?)([0-9]{5,6})\.png$", re.IGNORECASE)
MIN_FRAMES, MAX_FRAMES = 2, 300


def reject(message):
    raise ValueError(message)


def within(item, root):
    return item == root or root in item.parents


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def inspect(path, count=False):
    args = ["ffprobe", "-v", "error"]
    if count:
        args += ["-count_frames"]
    args += ["-show_streams", "-show_format", "-of", "json", str(path)]
    return json.loads(subprocess.run(args, capture_output=True, text=True, check=True).stdout)


def video(meta):
    return next((s for s in meta.get("streams", []) if s.get("codec_type") == "video"), None)


def sources(kind, source):
    if kind == "gif":
        if not source.is_file() or source.suffix.lower() != ".gif":
            reject("Expected a local authored-animation GIF file")
        return [source]
    if kind != "png-sequence" or not source.is_dir():
        reject("Expected a local frame-sequence directory")
    files = sorted((p.resolve() for p in source.iterdir() if p.is_file() and
                    p.suffix.lower() == ".png"), key=lambda p: p.name)
    if not MIN_FRAMES <= len(files) <= MAX_FRAMES:
        reject("PNG sequence requires 2..300 local frames")
    matches = [PNG_PATTERN.match(p.name) for p in files]
    if not all(matches):
        reject("PNG frames require one common prefix and five/six-digit numbering")
    prefixes = {m.group(1) for m in matches}
    indices = sorted(int(m.group(2)) for m in matches)
    if len(prefixes) != 1 or indices != list(range(indices[0], indices[-1] + 1)):
        reject("Mixed names or missing/duplicate sequence numbers")
    return sorted(files, key=lambda p: int(PNG_PATTERN.match(p.name).group(2)))


def validate(kind, source, output):
    src, out = Path(source).expanduser().resolve(), Path(output).expanduser().resolve()
    if out.suffix.lower() != ".mov" or not within(out, PRIVATE):
        reject("Output must be an ignored private .mov file")
    if out.exists() or out.with_suffix(".private-qc.json").exists():
        reject("Private review overwrite forbidden")
    if within(src, P2.parents[1]) and not within(src, PRIVATE):
        reject("Third-party sources must not be committed under the public repo tree")
    found = sources(kind, src)
    if len(found) > MAX_FRAMES:
        reject("Too many input frames")
    for f in found:
        if not f.is_file() or f.stat().st_size > 24_000_000 or (
                within(f, P2.parents[1]) and not within(f, PRIVATE)):
            reject("Invalid/misplaced or oversized original frame")
    sample = video(inspect(found[0], count=kind == "gif"))
    if sample is None or sample.get("width", 0) < 2 or sample.get("height", 0) < 2:
        reject("Source does not have a decodable video/image stream")
    if max(sample["width"], sample["height"]) > 4096:
        reject("Icon dimensions exceed bounded private conversion")
    if sample.get("codec_name") != ("gif" if kind == "gif" else "png"):
        reject("Source content/extension mismatch")
    if kind == "gif":
        count = int(sample.get("nb_read_frames") or 0)
        if not MIN_FRAMES <= count <= MAX_FRAMES:
            reject("Authored animation must have 2..300 decoded GIF frames")
        raw = inspect(found[0])
        duration = float(raw.get("format", {}).get("duration") or 0)
        if not 0 < duration <= 12:
            reject("Bounded authored GIF must finish within 12s")
    return {"kind": kind, "source": src, "files": found, "output": out,
            "dimensions": [sample["width"], sample["height"]]}


def convert(plan):
    dest = plan["output"]
    dest.parent.mkdir(parents=True, exist_ok=True)
    # Numbered private copies avoid shell globs, non-ASCII parsing ambiguity,
    # and modifying any original downloaded PNG sequence.
    with tempfile.TemporaryDirectory(prefix="private-frames-", dir=PRIVATE) as temp:
        if plan["kind"] == "png-sequence":
            for i, original in enumerate(plan["files"]):
                shutil.copyfile(original, Path(temp) / f"{i:06d}.png")
            args = ["-framerate", "30", "-start_number", "0",
                    "-i", str(Path(temp) / "%06d.png")]
        else:
            args = ["-ignore_loop", "1", "-i", str(plan["source"])]
        cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-n",
               *args, "-map", "0:v:0", "-vf", "fps=30,format=yuva444p10le",
               "-c:v", "prores_ks", "-profile:v", "4", "-pix_fmt", "yuva444p10le",
               "-threads", "2", "-an", "-frames:v", str(MAX_FRAMES), str(dest)]
        try:
            subprocess.run(cmd, check=True, capture_output=True, text=True)
            result = video(inspect(dest, count=True))
            if not result or result.get("codec_name") != "prores" or not (
                    result.get("pix_fmt", "").startswith("yuva")):
                reject("Converted MOV is not ProRes with an alpha-capable format")
            count = int(result.get("nb_read_frames") or 0)
            if not MIN_FRAMES <= count <= MAX_FRAMES:
                reject("Converted MOV did not decode bounded frames")
            if result.get("avg_frame_rate") != "30/1":
                reject("Converted MOV did not retain 30fps")
            # Technical alpha-capable format is not proof the source actually
            # contains transparent pixels. Optical/art review remains pending.
            report = {"status": "PRIVATE_FORMAT_PROOF_ONLY",
                      "source_count": len(plan["files"]), "kind": plan["kind"],
                      "source_sha256": [sha256(f) for f in plan["files"]],
                      "output_sha256": sha256(dest), "frames": count, "fps": 30,
                      "alpha_pixels_confirmed": False,
                      "legal_license": "REQUIRES_SEPARATE_HUMAN_REVIEW",
                      "public_release": False, "production_state_modified": False}
            dest.with_suffix(".private-qc.json").write_text(
                json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            return {"status": report["status"], "frames": count,
                    "fps": 30, "commercial_approval": False}
        except Exception:
            if dest.exists():
                dest.unlink()
            raise


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--source", type=Path, required=True)
    ap.add_argument("--kind", choices=("gif", "png-sequence"), required=True)
    ap.add_argument("--output", type=Path, required=True)
    ap.add_argument("--authored-animation-reviewed", action="store_true",
                    help="Input is an actual creator-authored effect, NOT a template demo GIF")
    ap.add_argument("--private-preview-only", action="store_true")
    ap.add_argument("--probe-only", action="store_true")
    opts = ap.parse_args()
    if not opts.authored_animation_reviewed or not opts.private_preview_only:
        ap.error("Explicit authored-role and private-only review declarations required")
    plan = validate(opts.kind, opts.source, opts.output)
    if opts.probe_only:
        print(json.dumps({"status": "PRIVATE_PREFLIGHT_ONLY",
                          "input_count": len(plan["files"]), "output_written": False}))
    else:
        print(json.dumps(convert(plan)))


if __name__ == "__main__":
    main()

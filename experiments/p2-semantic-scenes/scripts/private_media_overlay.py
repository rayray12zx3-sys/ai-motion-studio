#!/usr/bin/env python3
"""Isolated PRIVATE-only non-AE MP4/PNG overlay proof.

Never uploads media, receipts, paths or output to public CI. No connection to
ai-video-template, production-state, or the canonical scene compiler.
Requires FFmpeg/FFprobe locally. Technical pass != commercial/art approval.
"""
import argparse
import hashlib
import json
import math
import subprocess
from pathlib import Path

P2 = Path(__file__).resolve().parents[1]
PRIVATE = (P2 / "artifacts" / "private").resolve()
PROFILE = (1080, 1920, 30)
ALPHA = ("rgba", "bgra", "argb", "abgr", "yuva", "gbrap")


def fail(message):
    raise ValueError(message)


def inside(child, parent):
    return child == parent or parent in child.parents


def file_hash(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def probe(path, count=False):
    args = ["ffprobe", "-v", "error"]
    if count:
        args.append("-count_frames")
    args += ["-show_streams", "-show_format", "-of", "json", str(path)]
    result = subprocess.run(args, check=True, capture_output=True, text=True)
    return json.loads(result.stdout)


def video_stream(metadata):
    return next((s for s in metadata.get("streams", []) if s.get("codec_type") == "video"), None)


def fraction(value):
    n, d = value.split("/")
    return float(n) / float(d)


def preflight(base, asset, output, mode, start_frame, end_frame, opacity):
    base, asset, output = (Path(p).expanduser().resolve() for p in (base, asset, output))
    if not base.is_file() or base.suffix.lower() != ".mp4":
        fail("Base must be a real local MP4")
    if not asset.is_file() or asset.suffix.lower() not in (".mp4", ".mov", ".png"):
        fail("Asset must be a local MP4, ProRes MOV or PNG, not an AE preset or URL")
    if inside(asset, P2.parents[1]) and not inside(asset, PRIVATE):
        fail("Third-party source media may not live in the public repo tree")
    if output.suffix.lower() != ".mp4" or not inside(output, PRIVATE):
        fail("Output must be MP4 inside ignored P2 artifacts/private")
    if output.exists() or output.with_suffix(".private-qc.json").exists() or output in (base, asset):
        fail("Refuse to overwrite an input or existing private review")
    if mode not in ("screen", "alpha"):
        fail("Unsupported explicit compositing mode")
    if not isinstance(opacity, (int, float)) or not math.isfinite(opacity) or not (0.05 <= opacity <= 1):
        fail("Opacity must be bounded from 0.05 to 1")
    b = video_stream(probe(base, count=True))
    if not b or b.get("codec_name") != "h264":
        fail("Base requires verified H.264 video")
    if (b.get("width"), b.get("height")) != PROFILE[:2]:
        fail("Isolated profile must be 1080x1920")
    if abs(fraction(b.get("avg_frame_rate", "0/1")) - PROFILE[2]) > 0.001:
        fail("Isolated profile must be 30 fps")
    frames = int(b.get("nb_read_frames", "0"))
    if frames < 30 or frames > 3600:
        fail("Cannot verify 30..3600 decoded input frames")
    if not (isinstance(start_frame, int) and isinstance(end_frame, int)
            and 0 <= start_frame < end_frame <= frames):
        fail("Overlay window is outside the decoded base film")
    metadata = probe(asset)
    a = video_stream(metadata)
    if not a or a.get("width", 0) < 2 or a.get("height", 0) < 2:
        fail("Could not decode local asset dimensions")
    if asset.suffix.lower() == ".png" and a.get("codec_name") != "png":
        fail("PNG extension and decoded media disagree")
    if asset.suffix.lower() == ".mp4" and (a.get("codec_type") != "video" or
            a.get("codec_name") not in ("h264", "hevc", "mpeg4", "vp9", "av1", "prores")):
        fail("Unsupported local video codec")
    if asset.suffix.lower() == ".mov" and a.get("codec_name") != "prores":
        fail("MOV currently supports only local decoded ProRes footage")
    if asset.suffix.lower() != ".png":
        try:
            duration = float(a.get("duration") or metadata.get("format", {}).get("duration") or 0)
        except (ValueError, TypeError):
            fail("Missing source video duration")
        if not math.isfinite(duration) or duration <= 0 or (end_frame-start_frame) > duration * PROFILE[2] + .4:
            fail("One-shot source is shorter than effect window; do not silently loop")
    if mode == "alpha" and not any(a.get("pix_fmt", "").startswith(v) for v in ALPHA):
        fail("Alpha mode requires decoded alpha pixels; use screen for black-background footage")
    return dict(base=base, asset=asset, output=output, frames=frames,
                fps=PROFILE[2], mode=mode, opacity=opacity,
                start=start_frame, end=end_frame)


def filters(plan):
    start, end, opacity = plan["start"], plan["end"], plan["opacity"]
    t0, t1 = start / PROFILE[2], (end - 1) / PROFILE[2]
    resize = ("scale=1080:1920:force_original_aspect_ratio=decrease:"
              "flags=lanczos,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:")
    if plan["mode"] == "screen":
        # RGB planar, not YUV: a black overlay is the neutral screen element.
        expr = (f"if(between(T,{t0:.6f},{t1:.6f}),"
                f"min(255,A+{opacity:.6f}*B*(255-A)/255),A)")
        return ("[0:v]fps=30,format=gbrp,setpts=PTS-STARTPTS[base];"
                f"[1:v]fps=30,{resize}color=black,format=gbrp,"
                f"setpts=PTS-STARTPTS+{t0:.6f}/TB[asset];"
                f"[base][asset]blend=all_expr='{expr}':shortest=0:repeatlast=0,format=yuv420p[out]")
    return ("[0:v]fps=30,format=rgba,setpts=PTS-STARTPTS[base];"
            f"[1:v]fps=30,{resize}color=black@0,format=rgba,"
            f"colorchannelmixer=aa={opacity:.6f},setpts=PTS-STARTPTS+{t0:.6f}/TB[asset];"
            f"[base][asset]overlay=0:0:format=auto:"
            f"enable='between(t,{t0:.6f},{t1:.6f})',format=yuv420p[out]")


def render(plan):
    dest = plan["output"]
    dest.parent.mkdir(parents=True, exist_ok=True)
    asset_input = (["-loop", "1", "-framerate", "30"] if plan["asset"].suffix.lower() == ".png"
                   else [])
    args = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-n",
            "-i", str(plan["base"]), *asset_input, "-i", str(plan["asset"]),
            "-filter_complex", filters(plan), "-map", "[out]",
            "-map", "0:a?", "-c:v", "libx264", "-preset", "medium",
            "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30",
            "-c:a", "copy", "-frames:v", str(plan["frames"]),
            "-t", str(plan["frames"] / plan["fps"]), "-movflags", "+faststart",
            str(dest)]
    try:
        subprocess.run(args, check=True, capture_output=True, text=True)
        out = video_stream(probe(dest, count=True))
        if not out or int(out.get("nb_read_frames", "0")) != plan["frames"] or (
                out.get("width"), out.get("height")) != PROFILE[:2]:
            fail("Full encoded review failed frame/dimension verification")
        report = {
            "status": "PRIVATE_TECHNICAL_REVIEW_ONLY",
            "source_sha256": file_hash(plan["asset"]),
            "base_sha256": file_hash(plan["base"]),
            "output_sha256": file_hash(dest),
            "frames": plan["frames"], "fps": plan["fps"],
            "mode": plan["mode"], "start_frame": plan["start"],
            "end_frame_exclusive": plan["end"], "opacity": plan["opacity"],
            "no_after_effects": True, "source_license": "NOT_INFERRED",
            "output_art": "PENDING_HUMAN", "publication_rights": "PENDING_HUMAN",
            "production_state_modified": False,
        }
        qc = dest.with_suffix(".private-qc.json")
        if qc.exists():
            fail("Refuse to overwrite private QC")
        qc.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        return report
    except Exception:
        # An incomplete output can never be mistaken for a completed render.
        if dest.exists():
            dest.unlink()
        raise


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--base", required=True, type=Path)
    ap.add_argument("--asset", required=True, type=Path)
    ap.add_argument("--output", required=True, type=Path)
    ap.add_argument("--start-frame", required=True, type=int)
    ap.add_argument("--end-frame", required=True, type=int, help="Exclusive")
    ap.add_argument("--mode", choices=("screen", "alpha"), required=True)
    ap.add_argument("--opacity", type=float, default=0.45)
    ap.add_argument("--private-preview-only", action="store_true")
    ap.add_argument("--probe-only", action="store_true")
    opt = ap.parse_args()
    if not opt.private_preview_only:
        ap.error("Explicit --private-preview-only required; not a publication/licensing grant")
    plan = preflight(opt.base, opt.asset, opt.output, opt.mode, opt.start_frame,
                     opt.end_frame, opt.opacity)
    if opt.probe_only:
        print(json.dumps({"status": "PRIVATE_PREFLIGHT_ONLY", "frames": plan["frames"],
                          "mode": plan["mode"], "output_written": False}))
    else:
        result = render(plan)
        # Do not print path, vendor filenames, license files or private media URLs.
        print(json.dumps({k: result[k] for k in
              ("status", "frames", "fps", "output_art", "publication_rights")}))


if __name__ == "__main__":
    main()

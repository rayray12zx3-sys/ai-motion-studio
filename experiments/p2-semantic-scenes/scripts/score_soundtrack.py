#!/usr/bin/env python3
"""Isolated P2: licensed local soundtrack + authored UI cue evidence.

No download, network, provider, original media publication or ART/RIGHTS PASS.
Only the two already source-verified author CC BY 4.0 MP3 recordings are
supported; extending this catalog requires new source and license verification.
"""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

from av_audit import audit, inspect_cues, probe

TRACKS = {
    "cipher": {
        "title": "Cipher", "artist": "Kevin MacLeod", "bpm": 150,
        "sha256": "d3d0614535a61d748e2fd8d5117fc4d781022a7624794802a2462d8af3fdd522",
        "page": "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100844",
        "start": 12.0, "fade_in": 0.28, "fade_out": 0.85, "target_lufs": -18,
    },
    "floating-cities": {
        "title": "Floating Cities", "artist": "Kevin MacLeod", "bpm": 120,
        "sha256": "e7365652410d1fbc8a14d87537855d625c1a5fa8b7de8c626f47c13256ef2ddd",
        "page": "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600018",
        "start": 0.0, "fade_in": 0.38, "fade_out": 1.2, "target_lufs": -20,
    },
}

def sha256(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def command(argv):
    p = subprocess.run(argv, capture_output=True, text=True, check=False)
    if p.returncode:
        raise RuntimeError("Media command failed: " + p.stderr[-900:])
    return p.stdout

def video_packet_hash(path):
    return command(["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error",
                    "-i", str(path), "-map", "0:v:0", "-c:v", "copy",
                    "-f", "hash", "-hash", "sha256", "-"]).strip()

def verify_inputs(video, music, credits, cues, track_key):
    if track_key not in TRACKS:
        raise ValueError("Unsupported/unverified P2 music source")
    t = TRACKS[track_key]
    for p in (video, music, credits, cues):
        if not Path(p).is_file():
            raise ValueError("Missing authorized local input")
    if sha256(music) != t["sha256"]:
        raise ValueError("Music bytes do not match prior verified original source")
    notice = Path(credits).read_text(encoding="utf-8")
    if any(x not in notice for x in
           (t["title"], t["artist"], t["page"], "CC BY 4.0",
            "https://creativecommons.org/licenses/by/4.0/")):
        raise ValueError("Credit file lacks author, exact track, source, or license")
    if not any(x in notice.lower() for x in ("edited", "fade", "modified", "剪輯", "修改")):
        raise ValueError("Credit file must disclose musical excerpt changes")
    media = probe(video)
    streams = [s for s in media["streams"] if s["codec_type"] == "video"]
    if len(streams) != 1 or streams[0]["codec_name"] != "h264":
        raise ValueError("Expected one H.264 source video")
    fps = streams[0]["avg_frame_rate"]
    n, d = map(int, fps.split("/"))
    if n <= 0 or d <= 0:
        raise ValueError("Invalid video frame rate")
    frames = int(streams[0].get("nb_read_frames") or streams[0].get("nb_frames"))
    seconds = frames * d / n
    if frames < 24 or seconds <= 0:
        raise ValueError("Invalid encoded film length")
    audio = probe(music)
    if not any(s["codec_type"] == "audio" for s in audio["streams"]):
        raise ValueError("Music input has no audio")
    if float(audio["format"]["duration"]) < t["start"] + seconds + 0.01:
        raise ValueError("Licensed source excerpt is too short")
    cue_data = json.loads(Path(cues).read_text(encoding="utf-8"))
    if not isinstance(cue_data, list):
        raise ValueError("Expected bounded creative cue list")
    authored_cues = inspect_cues(cue_data, frames)
    if not authored_cues or not any(c["kind"] == "interaction" for c in authored_cues):
        raise ValueError("A meaningful product interaction cue is required")
    return t, frames, n / d, seconds, authored_cues

def beat_hypotheses(cues, fps, bpm):
    """Authored GRID only. It does not establish a recording's audible phase."""
    period = 60 * fps / bpm
    return [
        {"frame": c["frame"], "kind": c["kind"],
         "distance_to_zero_phase_grid_frames":
             round(abs((c["frame"]/period)-round(c["frame"]/period))*period, 2)}
        for c in cues
    ]

def mix(video, music, credits, cues, track_key, output):
    video, music, credits, cues, output = map(Path, (video, music, credits, cues, output))
    if output.resolve() in (video.resolve(), music.resolve()):
        raise ValueError("Refusing to overwrite source input")
    if output.exists():
        raise FileExistsError("Existing output is protected against overwrite")
    t, frames, fps, seconds, intended = verify_inputs(video, music, credits, cues, track_key)
    output.parent.mkdir(parents=True, exist_ok=True)
    fade_out_start = max(0.0, seconds - t["fade_out"])
    af = ("atrim=start={}:duration={},asetpts=PTS-STARTPTS,"
          "highpass=f=36,lowpass=f=16000,afade=t=in:st=0:d={},"
          "afade=t=out:st={}:d={},loudnorm=I={}:LRA=8:TP=-2.5,"
          "aresample=48000,aformat=channel_layouts=stereo").format(
              t["start"], seconds, t["fade_in"], fade_out_start,
              t["fade_out"], t["target_lufs"])
    before = video_packet_hash(video)
    try:
        command(["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-n",
                 "-i", str(video), "-i", str(music),
                 "-filter_complex", "[1:a:0]" + af + "[music]",
                 "-map", "0:v:0", "-map", "[music]", "-c:v", "copy",
                 "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
                 "-frames:v", str(frames), "-t", str(seconds),
                 "-movflags", "+faststart", str(output)])
        after = video_packet_hash(output)
        if before != after:
            raise ValueError("Video packet stream changed during licensed-audio mix")
        report = audit(output, expected_frames=frames, cues=intended)
        if report["audio"]["status"] != "MEASURED_NOT_LISTENED":
            raise ValueError("Output music is not decodable")
        out = {
            "workflow": "p2-licensed-score-v1",
            "film_sha256": sha256(output),
            "video_stream_preserved": True,
            "video_hash": after,
            "music_track": t["title"],
            "artist": t["artist"],
            "license": "CC BY 4.0, PUBLIC ATTRIBUTION/CHANGE NOTICE REQUIRED",
            "source_mp3_sha256": t["sha256"],
            "official_source": t["page"],
            "excerpt_from_seconds": t["start"],
            "source_credits_verified_as_text_only": True,
            "audio_beat_theory_not_actual_listening":
                beat_hypotheses(intended, fps, t["bpm"]),
            "decoded_audio_frame_review": report,
            "status": {
                "codec_and_audio_decoded": "PASS",
                "creative_full_speed_review": "NOT_PERFORMED",
                "song_phrase_and_motion_sync": "PENDING_LISTENING",
                "human_art_review": "PENDING",
                "commercial_media_rights": "NOT_CLEARED",
            },
        }
        output.with_suffix(".qc.json").write_text(
            json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
        return out
    except Exception:
        output.unlink(missing_ok=True)
        raise

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--video", type=Path, required=True)
    parser.add_argument("--music", type=Path, required=True)
    parser.add_argument("--credits", type=Path, required=True)
    parser.add_argument("--cues", type=Path, required=True)
    parser.add_argument("--track", choices=sorted(TRACKS), required=True)
    parser.add_argument("--output", type=Path, required=True)
    opt = parser.parse_args()
    result = mix(opt.video, opt.music, opt.credits, opt.cues, opt.track, opt.output)
    print(json.dumps({"film_sha256": result["film_sha256"],
                      "technical": "PASS", "art": "PENDING",
                      "audition": "NOT_PERFORMED"}, indent=2))

if __name__ == "__main__":
    main()

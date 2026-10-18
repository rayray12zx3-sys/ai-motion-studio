#!/usr/bin/env python3
"""Synthetic-only, reproducible OFL font/alpha MOV QA. No user/private content."""
import hashlib
import json
import os
import pathlib
import subprocess
import tempfile
import urllib.request

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

FONTS = [
    ("huninn", "CJK", "justfont/open-huninn-font", "master", "font/jf-openhuninn-2.1.ttf", "49ce714ce7fcb394e89ab74de62d80f22ea41771", "LICENSE"),
    ("iansui", "CJK", "ButTaiwan/iansui", "main", "fonts/ttf/Iansui-Regular.ttf", "3dcc17971252ea3c23f1eac4e6277e762f4566d0", "OFL.txt"),
    ("wenkai_tc", "CJK", "lxgw/LxgwWenKaiTC", "main", "fonts/TTF/LXGWWenKaiTC-Regular.ttf", "badae37821982559892cd32082e139b248f8490a", "OFL.txt"),
    ("mantou", "CJK", "mant0u0/MantouSans", "main", "Font/MantouSans-Regular.ttf", "31378b66447d79261e697ff2cd430cb63a8a87e2", "OFL.txt"),
    ("pixel7", "CJK", "scott0107000/BoutiqueBitmap7x7", "main", "BoutiqueBitmap7x7_1.71.ttf", "e0c4ab243bb40b5d6cddadee52d6a169c9d4f5d5", "OFL.txt"),
    ("pixel9", "CJK", "scott0107000/BoutiqueBitmap9x9", "main", "BoutiqueBitmap9x9_1.93.ttf", "61d05843a7aeb6251974cb9d51f127b9a1b11a45", "OFL.txt"),
    ("tasa_explorer", "Latin", "google/fonts", "main", "ofl/tasaexplorer/TASAExplorer%5Bwght%5D.ttf", "2786199e97ff0cdd31c24d9a37f75cce3928ca06", "ofl/tasaexplorer/OFL.txt"),
    ("tasa_orbiter", "Latin", "google/fonts", "main", "ofl/tasaorbiter/TASAOrbiter%5Bwght%5D.ttf", "5b8f847f89da118db69518c01ec82c8a4126140e", "ofl/tasaorbiter/OFL.txt"),
]
CJK_TEXT = "繁體中文，動態！"
CJK_TEST = "繁體中文，字型設計！影片動態？不同字距與清晰標點ABC123"
LATIN_TEXT = "DESIGN 2026"
LATIN_TEST = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?.,:;-"
WIDTH, HEIGHT, FPS, FRAMES = 640, 360, 24, 48

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "AI-Motion-Synthetic-Font-QA/1"})
    with urllib.request.urlopen(req, timeout=65) as response:
        return response.read()

def run_cmd(argv, **kwargs):
    return subprocess.run(argv, check=True, **kwargs)

def verify_and_render(record, tempdir):
    name, kind, repo, ref, path, pinned, license_path = record
    font_url = f"https://raw.githubusercontent.com/{repo}/{ref}/{path}"
    license_url = f"https://raw.githubusercontent.com/{repo}/{ref}/{license_path}"
    binary = fetch(font_url)
    actual = hashlib.sha1(b"blob " + str(len(binary)).encode() + b"\\0" + binary).hexdigest()
    if actual != pinned:
        raise RuntimeError(f"{name}: Git blob pin mismatch ({actual})")
    notice = fetch(license_url).decode("utf-8-sig")
    if "SIL OPEN FONT LICENSE" not in notice.upper() or "Version 1.1" not in notice:
        raise RuntimeError(f"{name}: unconfirmed OFL 1.1")
    font_path = pathlib.Path(tempdir) / f"{name}.ttf"
    font_path.write_bytes(binary)
    tt = TTFont(font_path)
    cmap = tt.getBestCmap() or {}
    wanted = CJK_TEST if kind == "CJK" else LATIN_TEST
    missing = sorted(set(c for c in wanted if not c.isspace() and ord(c) not in cmap))
    if missing:
        raise RuntimeError(f"{name}: glyphs missing: {missing}")
    text = CJK_TEXT if kind == "CJK" else LATIN_TEXT
    face = ImageFont.truetype(str(font_path), 57 if kind == "CJK" else 61)
    alpha_samples = []
    output = pathlib.Path(tempdir) / f"{name}.mov"
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba",
           "-s", f"{WIDTH}x{HEIGHT}", "-r", str(FPS), "-i", "-",
           "-an", "-c:v", "prores_ks", "-profile:v", "4",
           "-pix_fmt", "yuva444p10le", str(output)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    for i in range(FRAMES):
        frame = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        drawer = ImageDraw.Draw(frame)
        x = WIDTH // 2 + round(32 * (1 - i / (FRAMES - 1)))
        y = HEIGHT // 2
        drawer.text((x, y), text, font=face, anchor="mm", fill=(250, 248, 245, 255))
        bbox = frame.getchannel("A").getbbox()
        if bbox is None or bbox[0] < 25 or bbox[2] > WIDTH - 25 or bbox[1] < 20 or bbox[3] > HEIGHT - 20:
            raise RuntimeError(f"{name}: frame {i} unsafe text bounds {bbox}")
        if i in (0, FRAMES - 1):
            alpha_samples.append(bbox)
        proc.stdin.write(frame.tobytes())
    proc.stdin.close()
    err = proc.stderr.read().decode("utf-8", "replace")
    if proc.wait() != 0:
        raise RuntimeError(f"{name}: encoding failed {err[-700:]}")
    meta = json.loads(run_cmd(["ffprobe", "-v", "error", "-select_streams", "v:0",
                    "-show_entries", "stream=codec_name,profile,pix_fmt,width,height,nb_frames",
                    "-of", "json", str(output)], capture_output=True, text=True).stdout)
    s = meta["streams"][0]
    if s["codec_name"] != "prores" or str(s.get("profile")) != "4444" or "yuva" not in s["pix_fmt"] or int(s.get("nb_frames", 0)) != FRAMES:
        raise RuntimeError(f"{name}: codec/pixfmt/frames failed {s}")
    decoded = run_cmd(["ffmpeg", "-v", "error", "-i", str(output), "-frames:v", "1",
                       "-pix_fmt", "rgba", "-f", "rawvideo", "pipe:1"], capture_output=True).stdout
    if len(decoded) != WIDTH * HEIGHT * 4:
        raise RuntimeError(f"{name}: failed to decode exact RGBA frame")
    alpha = decoded[3::4]
    if min(alpha) != 0 or max(alpha) != 255:
        raise RuntimeError(f"{name}: decoded alpha range not 0..255")
    return {"font": name, "role": kind, "sha256": hashlib.sha256(binary).hexdigest(),
            "official_blob_sha1": actual, "license": "SIL OFL 1.1",
            "license_text_sha256": hashlib.sha256(notice.encode()).hexdigest(),
            "cmap_count": len(cmap), "missing_test_glyphs": missing,
            "codec": s["codec_name"], "profile": s["profile"], "pix_fmt": s["pix_fmt"],
            "fps": FPS, "frames": FRAMES, "resolution": [WIDTH, HEIGHT],
            "decoded_alpha_min_max": [min(alpha), max(alpha)],
            "first_last_text_bounds": alpha_samples, "status": "PASS"}

def main():
    pathlib.Path("out/font-portable").mkdir(parents=True, exist_ok=True)
    results = []
    with tempfile.TemporaryDirectory(prefix="font-portable-") as d:
        for font in FONTS:
            result = verify_and_render(font, d)
            results.append(result)
            print(font[0], "PASS", result["sha256"], flush=True)
    report = {"scenario": "PUBLIC_SYNTHETIC_ONLY", "font_binary_exported": False,
              "private_copy_used": False, "status": "PASS", "total": len(results), "results": results}
    pathlib.Path("out/font-portable/qa.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print("ALL_FONT_PORTABLE_REBUILD_PASS", len(results))

if __name__ == "__main__":
    main()

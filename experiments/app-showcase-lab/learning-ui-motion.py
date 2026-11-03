#!/usr/bin/env python3
"""Public, original synthetic 9:16 UI motion specimen, 30fps 95 frames.
Not real APP UI, not a verified product interaction, and not licensed production film.
No private source or source excerpts ever enter GitHub Actions.
"""
import argparse, hashlib, json, math, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W,H,FPS,N=540,960,30,95
UI=(105,102,435,844)
AQUA=(120,225,207)
RED=(244,114,79)
PAPER=(247,237,223)
INK=(10,24,33)

def ease(v):
    t=max(0,min(1,v))
    return t*t*(3-2*t)

def render_ui(frame, fonts):
    im=Image.new("RGB",(330,742),(18,35,48))
    d=ImageDraw.Draw(im)
    d.rounded_rectangle((20,30,310,710),radius=25,fill=(30,57,70),outline=(67,109,117),width=2)
    d.text((40,61),"FICTIONAL UI  /  DEMO",font=fonts["sm"],fill=(178,215,207))
    d.line((43,101,286,101),fill=(99,148,149),width=2)
    d.text((43,134),"ECHO",font=fonts["big"],fill=PAPER)
    d.text((44,221),"選擇對應詞義",font=fonts["cn"],fill=(202,226,220))
    for k,(label,y) in enumerate([("回聲",289),("光線",410),("雨滴",531)]):
        chosen=k==0 and frame>=30
        d.rounded_rectangle((39,y,290,y+88),radius=14,
            fill=(40,90,90) if chosen else (24,48,59),
            outline=AQUA if chosen else (68,103,113),width=3)
        d.text((63,y+22),label,font=fonts["cn"],fill=PAPER)
        if chosen and frame>=57:
            d.ellipse((251,y+27,274,y+50),fill=AQUA)
            d.line([(257,y+39),(262,y+44),(269,y+33)],fill=INK,width=3)
    d.text((36,679),"SYNTHETIC • NOT ACTUAL APP",font=fonts["sm"],fill=(225,157,139))
    return im

def outer_stage(frame, fonts):
    im=Image.new("RGBA",(W,H),INK+(255,))
    d=ImageDraw.Draw(im)
    t=frame/(N-1)
    for y in range(H):
        d.line((0,y,W,y),fill=(11+int(y*10/H),30+int(y*14/H),41+int(y*18/H),255))
    # Repeated arcs evoke practice intervals, don't resemble a card+headline template.
    for k in range(6):
        r=365+k*67+int(9*math.sin(t*4+k))
        x,y=501,385-int(65*ease(t))
        d.arc((x-r,y-r,x+r,y+r),126,252,fill=(33+k*6,93+k*7,100+k*5,255),width=3+k%2)
    d.polygon([(0,0),(413,0),(0,244)],fill=(15,48,58,255))
    d.text((22,31),"RECALL / PRACTICE",font=fonts["en"],fill=PAPER)
    d.text((24,79),"ANIMATED SOURCE-SAFE STUDY",font=fonts["sm"],fill=(156,199,194))
    d.rounded_rectangle((78,70,461,872),radius=35,fill=(5,15,25,255),
                        outline=(132,160,154,255),width=4)
    d.rounded_rectangle((96,89,443,857),radius=18,fill=(11,31,40,255))
    # Stage title belongs to bottom edge of the device; not an informational footer.
    reveal=int(35*(1-ease(frame/14)))
    d.text((20-reveal,891),"反覆練習",font=fonts["title"],fill=PAPER,
           stroke_width=1,stroke_fill=INK)
    d.line((22,926,253,926),fill=RED+(255,),width=5)
    d.text((17,948),"PUBLIC SYNTHETIC MOTION TEST",font=fonts["sm"],fill=(188,206,196))
    return im

def overlay(frame):
    """Alpha is zero inside exact source UI slot; no fake native feedback."""
    im=Image.new("RGBA",(W,H),(0,0,0,0))
    d=ImageDraw.Draw(im)
    if 28<=frame<=57:
        p=ease((frame-28)/29)
        a=int(200*(1-p))
        d.arc((-9-int(25*p),145-int(25*p),555+int(25*p),852+int(25*p)),
              89,267,fill=AQUA+(a,),width=4)
    if 54<=frame<=92:
        p=ease((frame-54)/38)
        a=int(210*(1-p))
        d.line([(23,850),(84,850)],fill=RED+(a,),width=7)
        d.line([(470,852),(525,852)],fill=AQUA+(a,),width=7)
        px=int(34-8*math.sin(p*math.pi)); py=int(743-491*p)
        d.ellipse((px-8,py-8,px+8,py+8),fill=(246,211,129,220))
    d.rectangle((UI[0],UI[1],UI[2]-1,UI[3]-1),fill=(0,0,0,0))
    if im.getchannel("A").crop(UI).getbbox() is not None:
        raise RuntimeError("overlay violated source-UI pixel safety zone")
    return im

def compose(frame, fonts):
    stage=outer_stage(frame,fonts)
    ui=render_ui(frame,fonts)
    stage.paste(ui,(UI[0],UI[1]))
    ov=overlay(frame)
    merged=Image.alpha_composite(stage,ov)
    if merged.crop(UI).convert("RGB").tobytes()!=ui.tobytes():
        raise RuntimeError("exact synthetic source UI pixels changed before compression")
    return merged,ov

def run(output, font_path):
    output=Path(output)
    if output.exists():raise ValueError("refuse to overwrite existing output")
    output.mkdir(parents=True)
    fonts={k:ImageFont.truetype(font_path,v) for k,v in
           {"sm":13,"en":24,"cn":29,"big":62,"title":39}.items()}
    cmd=lambda codec,name: ["ffmpeg","-nostdin","-hide_banner","-loglevel","error","-y",
       "-f","rawvideo","-pix_fmt","rgba","-video_size","540x960","-framerate","30",
       "-i","pipe:0","-an"] + codec + [str(output/name)]
    mp4=subprocess.Popen(cmd(["-c:v","libx264","-pix_fmt","yuv420p","-crf","19"],"preview.mp4"),stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    mov=subprocess.Popen(cmd(["-c:v","prores_ks","-profile:v","4","-pix_fmt","yuva444p10le"],"overlay-alpha.mov"),stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    for f in range(N):
        combined,fx=compose(f,fonts)
        mp4.stdin.write(combined.tobytes())
        mov.stdin.write(fx.tobytes())
        if f in (0,12,29,45,57,70,82,94):
            combined.convert("RGB").save(output/("frame-%03d.png"%f))
    for p in (mp4,mov):
        p.stdin.close()
    for p in (mp4,mov):
        err=p.stderr.read().decode(errors="replace")
        if p.wait()!=0: raise RuntimeError("video render failed: "+err[-1200:])
    report={"status":"TECHNICAL_DEMO_ONLY_USER_ART_PENDING",
      "synthetic":True,"genuine_app_ui":False,"fps":FPS,"frames":N,
      "width":W,"height":H,"duration":N/FPS,"ui_rect":list(UI),
      "source_ui_pixels_preserved":"pre-encode RGBA composition equality checked each frame; H264 is lossy",
      "true_alpha":"ProRes4444 overlay only; independent decode still required",
      "real_app_integration":"NOT_PERFORMED; no private assets in public CI",
      "native_premiere":"NOT_TESTED","commercial_rights":"NOT_CLEARED",
      "paid_provider_calls":0}
    for filename in ("preview.mp4","overlay-alpha.mov"):
        report[filename+"_sha256"]=hashlib.sha256((output/filename).read_bytes()).hexdigest()
    (output/"technical-manifest.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    print("GENERIC_SOURCE_SAFE_APP_MOTION_RENDERED",N)
    return report

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("output")
    p.add_argument("--font",required=True)
    a=p.parse_args()
    run(a.output,a.font)

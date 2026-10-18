#!/usr/bin/env python3
"""Public SYNTHETIC-only font qualification. No private copy, logos or font distribution."""
import hashlib, io, json, math, pathlib, subprocess, tempfile, urllib.request
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont, ImageChops

FONTS = [
 ("chiron_round","昭源環方","chiron-fonts/chiron-go-round-tc","release","VAR_OTF/ChironGoRoundTCVF.otf","a928538495d1f7dc8a349422cedbbf996197a3fb","LICENSE.md","柔軟應變","round"),
 ("chiron_hei","昭源黑體","chiron-fonts/chiron-hei-hk","release","VAR_OTF/ChironHeiHKVF.otf","911772b9d88c0c96fef0daea6cd2e89e68c0db53","LICENSE.md","構築可能","modern"),
 ("chiron_sung","昭源宋體","chiron-fonts/chiron-sung-hk","release","VAR_OTF/ChironSungHKVF.otf","add9f3977179965416857be316ef8d3a58310c35","LICENSE.md","留白之間","editorial"),
 ("genwan","源雲明體","ButTaiwan/genwan-font","master","ttc/GenWanMin2-R.ttc","4d8b651a2c2f5d8a6ae24bd323a121128881b08d","SIL_Open_Font_License_1.1.txt","時間的質地","nostalgic"),
]
# Source pins are authoritative raw Git-object hashes, not mutable branch names.
# Correct pinned Git-object hash for the GenWan TTC (read from official git tree).

W,H,FPS,N=1280,720,24,60
QA_TEXT="繁體中文，標題！影像設計與質感。字距、筆畫、變形？"
OUT=pathlib.Path("out/premium-font-v1")
OUT.mkdir(parents=True,exist_ok=True)

def fetch(url):
    request=urllib.request.Request(url,headers={"User-Agent":"AI-Motion-Studio-Public-Synthetic-Only/1"})
    with urllib.request.urlopen(request,timeout=100) as r:return r.read()

def blob_sha(b):
    return hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()

def ffprobe(p):
    r=subprocess.run(["ffprobe","-v","error","-select_streams","v:0","-show_entries","stream=codec_name,profile,pix_fmt,width,height,nb_frames","-of","json",str(p)],capture_output=True,text=True,check=True)
    return json.loads(r.stdout)["streams"][0]

def run(font_record,ix,working):
    key,title,repo,branch,p,expected,license_path,copy,style=font_record
    url=f"https://raw.githubusercontent.com/{repo}/{branch}/{p}"
    licurl=f"https://raw.githubusercontent.com/{repo}/{branch}/{license_path}"
    b=fetch(url); actual=blob_sha(b)
    if actual!=expected:raise RuntimeError(f"{key}: SHA pinned mismatch actual={actual}")
    lic=fetch(licurl).decode("utf-8-sig")
    if "SIL OPEN FONT LICENSE" not in lic.upper() or "Version 1.1" not in lic:raise RuntimeError(f"{key}: license not verified")
    path=working/(key+(".ttc" if p.endswith(".ttc") else ".otf"));path.write_bytes(b)
    ft=TTFont(path,index=0,lazy=True)
    cmap=ft.getBestCmap() or {}
    missing=sorted(set(c for c in QA_TEXT+copy if not c.isspace() and ord(c) not in cmap))
    if missing:raise RuntimeError(f"{key} missing CJK glyphs: {missing}")
    axes={x.axisTag:{"min":x.minValue,"default":x.defaultValue,"max":x.maxValue} for x in ft["fvar"].axes} if "fvar" in ft else {}
    if key.startswith("chiron") and "wght" not in axes:raise RuntimeError(f"{key}: expected REAL wght variable font axis")
    # Record actual axes from SFNT; never claim wdth if it isn't present.
    sfnt_kind="variable" if axes else "static_ttc"
    background=("#14252a","#fbf7f0","#172332","#33241f")[ix]
    ink=("#f7eada","#182c34","#f0e1c7","#f9e7cb")[ix]
    accent=("#9fdfca","#bb6749","#dfa96f","#e59c6a")[ix]
    mov=OUT/(key+"-alpha.mov")
    cmd=["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","rgba","-s",f"{W}x{H}","-r",str(FPS),"-i","-","-c:v","prores_ks","-profile:v","4","-pix_fmt","yuva444p10le",str(mov)]
    ff=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    preview=[]
    old_boxes=[]
    font=ImageFont.truetype(str(path),index=0,size=137)
    variable_ok=False
    tags=list(axes)
    if "wght" in axes:
        info=axes["wght"]
        # Apply real font-axis interpolation each frame; this is distinct from bitmap scale.
        low=max(info["min"], min(info["max"],325))
        high=max(info["min"], min(info["max"],790))
        if high<=low:raise RuntimeError(f"{key}: no usable variable-weight range")
    for i in range(N):
        t=i/(N-1);entry=min(1,max(0,i/13))
        hold=math.sin(min(1,entry)*math.pi/2)
        rgba=Image.new("RGBA",(W,H),(0,0,0,0))
        d=ImageDraw.Draw(rgba)
        if "wght" in axes:
            chosen=low+(high-low)*(.5-.5*math.cos(math.pi*t))
            values=[chosen if tag=="wght" else axes[tag]["default"] for tag in tags]
            font.set_variation_by_axes(values);variable_ok=True
        box=d.textbbox((0,0),copy,font=font,stroke_width=0)
        tw,th=box[2]-box[0],box[3]-box[1]
        if tw>1030 or th>280:raise RuntimeError(f"{key}: text overflow width {tw}")
        # Per-font semantic movement: modern horizontal tightening / round elasticity /
        # editorial subtle baseline rise / ink-bleed vertical unfolding.
        scale=1
        if style=="modern":scale=.93+.07*hold
        if style=="round":scale=.91+.09*hold
        if style=="editorial":scale=1.025-.025*hold
        if style=="nostalgic":scale=.98+.02*hold
        ox=int(30*(1-hold)) if style=="modern" else 0
        oy=int(38*(1-hold)) if style in ("editorial","nostalgic") else 0
        textlayer=Image.new("RGBA",(tw+40,th+40),(0,0,0,0))
        ImageDraw.Draw(textlayer).text((20-box[0],20-box[1]),copy,font=font,fill=ink)
        neww=max(1,int(textlayer.width*scale))
        textlayer=textlayer.resize((neww,textlayer.height),Image.Resampling.LANCZOS)
        bx=(W-neww)//2+ox;by=(H-textlayer.height)//2+oy
        rgba.alpha_composite(textlayer,(bx,by))
        # Non-overlapping secondary accent is NOT embedded in primary font;
        # keep animation semantics tied to main headline.
        d=ImageDraw.Draw(rgba)
        progress=math.floor(270*hold)
        y=520 if style in ("editorial","nostalgic") else 506
        d.rounded_rectangle((W//2-135,y,W//2-135+progress,y+5),radius=2,fill=accent)
        m=rgba.getchannel("A");bb=m.getbbox()
        if not bb or bb[0]<64 or bb[2]>W-64 or bb[1]<60 or bb[3]>H-60:
            raise RuntimeError(f"{key}: unsafe clipping/frame {i} bbox={bb}")
        if i in (0,30,59):old_boxes.append(bb)
        ff.stdin.write(rgba.tobytes())
        if i%6==0:
            rgb=Image.new("RGB",(W,H),background);rgb.paste(rgba,mask=m)
            sm=rgb.resize((640,360),Image.Resampling.LANCZOS)
            dd=ImageDraw.Draw(sm)
            dd.text((30,21),f"{ix+1:02d} / {key.upper()}",font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",25),fill=accent)
            preview.append(sm)
    ff.stdin.close();err=ff.stderr.read().decode("utf-8","replace");code=ff.wait()
    if code:raise RuntimeError(f"{key}: ffmpeg error {err[-800:]}")
    info=ffprobe(mov)
    if info["codec_name"]!="prores" or info.get("profile")!="4444" or "yuva" not in info["pix_fmt"] or int(info.get("nb_frames",0))!=N:raise RuntimeError(f"{key}: MOV spec failure {info}")
    decoded=subprocess.check_output(["ffmpeg","-v","error","-i",str(mov),"-frames:v","1","-pix_fmt","rgba","-f","rawvideo","pipe:1"])
    if len(decoded)!=W*H*4 or min(decoded[3::4])!=0 or max(decoded[3::4])!=255:raise RuntimeError(f"{key}: true alpha decode not confirmed")
    ft.close()
    return {"id":key,"name":title,"sha256":hashlib.sha256(b).hexdigest(),"git_blob_sha1":actual,
            "license":"SIL OFL 1.1","license_sha256":hashlib.sha256(lic.encode()).hexdigest(),
            "role":"CJK","regional_variant":"TW/TC" if key in ("chiron_round","genwan") else "HK-derived: Taiwan-shaping visual review required",
            "cmap_size":len(cmap),"fvar_axes":axes,"real_weight_axis_tested":variable_ok,"font_kind":sfnt_kind,
            "technical_render":"PASS","prores":info,"alpha":"PASS","first_mid_last_bbox":old_boxes},preview

def main():
    results=[];previews=[]
    with tempfile.TemporaryDirectory(prefix="ai-motion-premium-private-runtime-") as p:
        for i,z in enumerate(FONTS):
            a,b=run(z,i,pathlib.Path(p));results.append(a);previews+=b
            print("PASS",a["id"],a["font_kind"],a["fvar_axes"],flush=True)
    durations=[100]*len(previews)
    gif=OUT/"ONE_GIF_PREMIUM_FONTS.gif"
    previews[0].save(gif,save_all=True,append_images=previews[1:],duration=durations,loop=0,optimize=True)
    data={"status":"PASS","actual_fonts":len(results),"synthetic_only":True,"private_data_used":False,
          "font_binaries_exported":False,"gif_duration_ms":sum(durations),
          "gpu_or_paid_worker":False,"results":results}
    (OUT/"qa.json").write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding="utf-8")
    print("ALL_PASS",len(results),gif,flush=True)
if __name__=="__main__":main()

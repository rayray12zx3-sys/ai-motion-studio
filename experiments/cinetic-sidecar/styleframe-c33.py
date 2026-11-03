#!/usr/bin/env python3
"""C3.3: original reproducible cinematic styleframes. Static concept art, never art approval."""
import argparse
import json
from pathlib import Path

W, H = 1280, 720
INK = "#0d1d27"
PAPER = "#f0e8d8"
CORAL = "#e9755e"

def defs():
    return """
<defs>
 <linearGradient id="sky" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#0d172b"/>
  <stop offset=".47" stop-color="#31546a"/><stop offset="1" stop-color="#93b8b1"/></linearGradient>
 <linearGradient id="water" x1="0" y1="0" x2=".1" y2="1"><stop stop-color="#94b8ba"/>
  <stop offset=".24" stop-color="#376a78"/><stop offset="1" stop-color="#122d43"/></linearGradient>
 <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ede3d2"/>
  <stop offset="1" stop-color="#b6b2a4"/></linearGradient>
 <pattern id="grain" width="84" height="72" patternUnits="userSpaceOnUse">
  <circle cx="7" cy="28" r=".9" fill="#f0f8ee" opacity=".31"/>
  <circle cx="67" cy="62" r="1.1" fill="#081c27" opacity=".27"/>
  <circle cx="37" cy="11" r=".8" fill="#c1d3d0" opacity=".4"/>
  <path d="M21 44h1 M57 37h1" stroke="#f6f0dc" opacity=".25"/>
 </pattern>
 <filter id="soft"><feGaussianBlur stdDeviation="18"/></filter>
 <clipPath id="edge"><rect width="1280" height="720"/></clipPath>
</defs>"""

def txt(x, y, value, size=64, fill=PAPER, weight=700):
    return '<text x="%s" y="%s" font-family="Noto Sans CJK TC, Noto Sans CJK, sans-serif" font-size="%s" font-weight="%s" fill="%s">%s</text>' % (
        x, y, size, weight, fill, value)

def line(path, color, width=2, extra=""):
    return '<path d="%s" fill="none" stroke="%s" stroke-width="%s" %s/>' % (path,color,width,extra)

def wrap(content):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">'
            + defs() + '<g clip-path="url(#edge)">' + content + '</g></svg>')

def cloud():
    return (
        '<path d="M0 337C179 139 344 187 469 174C646 72 807 160 909 217C1047 157 1179 259 1280 298V0H0Z" fill="#203849"/>'
        '<path d="M-42 246C129 161 256 186 359 192C455 120 571 141 680 152C828 48 992 160 1337 111V0H0Z" fill="#112436" opacity=".92"/>'
        '<path d="M-60 352Q220 229 455 297T924 254T1332 313" stroke="#839ba8" stroke-width="5" fill="none" opacity=".28"/>'
        + "".join(line("M%d %d l-22 135" % (105+178*i,288+33*(i%3)),"#badbd5",2,'opacity=".47"') for i in range(7)))

def sea(level=449):
    return (
        '<path d="M0 %d Q220 %d 423 %dT847 %dT1280 %d V720H0Z" fill="url(#water)"/>' % (level,level-16,level+11,level-8,level+6)
        + line("M0 %d Q230 %d 480 %dT938 %dT1280 %d" %(level,level-19,level+2,level-9,level-2),"#d3e7df",4,'opacity=".81"')
        + "".join(line("M%d %d q77 -7 160 0t164 0" % ((i*71)%213,level+24+i*14),
                       "#c4e2df",1.4,'opacity="%.2f"'%(.16+(i%4)*.07)) for i in range(16)))

def raindrop(x,y,scale=1):
    return ('<g transform="translate(%d %d) scale(%.3f)">'%(x,y,scale)
        +'<ellipse cy="19" rx="60" ry="74" fill="#e9755e" opacity=".25" filter="url(#soft)"/>'
        +'<path d="M0 -57C-12 -23 -30 -8 -30 14C-30 40 -13 52 0 52C20 52 33 37 30 14C26 -9 13 -32 0 -57Z" fill="#e9755e"/>'
        +line("M-11 4 Q-9 -9 -4 -20","#ffe4d6",5,'stroke-linecap="round"')+'</g>')

def perforations():
    return ("".join('<rect x="%d" y="7" width="14" height="16" rx="3" fill="#172e37"/>'%(x)
              +'<rect x="%d" y="183" width="14" height="16" rx="3" fill="#172e37"/>'%(x)
              for x in range(15,300,29)))

def frame(x,y,i,scale=1,rotation=0):
    shot=[
        '<path d="M7 125Q47 54 91 107Q137 43 182 94Q232 62 291 131V158H7Z" fill="#597d84"/>'
        +line("M65 162l-10 26m66-29l-8 29m70-31l-9 29","#c2dbd3",4),
        '<path d="M0 155Q94 136 156 154T300 155V208H0Z" fill="#518b97"/>'
        +'<path d="M157 43Q129 91 132 113Q135 145 159 145Q187 143 186 112Q185 86 157 43Z" fill="#e9755e"/>',
        '<path d="M0 142H300V208H0Z" fill="#417e8c"/>'
        +'<ellipse cx="149" cy="163" rx="120" ry="35" fill="none" stroke="#a9dfdb" stroke-width="5"/>'
        +'<ellipse cx="149" cy="163" rx="55" ry="15" fill="none" stroke="#e9755e" stroke-width="4"/>'
    ][i]
    return ('<g transform="translate(%s %s) rotate(%s) scale(%.3f)">'%(x,y,rotation,scale)
      +'<rect x="11" y="14" width="300" height="208" rx="7" fill="#04121b" opacity=".45" filter="url(#soft)"/>'
      +'<rect width="300" height="208" rx="7" fill="#172e37" stroke="#dee6da" stroke-width="3"/>'
      +'<rect width="300" height="208" fill="url(#grain)" opacity=".72"/>'
      +shot
      +'<path d="M0 0H300V27H0Z M0 179H300V208H0Z" fill="#e7e0d4"/>'
      +perforations()
      +'<circle cx="284" cy="32" r="5" fill="#e9755e"/>'
      +'</g>')

def first():
    scene = '<rect width="1280" height="720" fill="url(#sky)"/>'+cloud()+sea(486)
    scene += '<rect width="1280" height="720" fill="url(#grain)" opacity=".7"/>'
    scene += '<rect width="535" height="720" fill="#0c1b25" opacity=".68"/>'
    scene += frame(681,88,0,.93,-8)+frame(967,182,1,.76,10)+frame(775,438,2,.72,-6)
    scene += raindrop(1103,93,.85)
    scene += line("M79 181H453","#cadbd5",1,'opacity=".6"')
    scene += '<rect x="79" y="248" width="7" height="170" fill="#e9755e"/>'
    scene += txt(113,337,"散落鏡頭",76)
    scene += txt(116,388,"三段畫面",28,"#d2e0d9",400)
    scene += txt(116,613,"01  /  FRAGMENTS",16,"#e9755e",400)
    return wrap(scene)

def second():
    scene='<rect width="1280" height="720" fill="url(#paper)"/>'
    scene+='<rect width="1280" height="720" fill="url(#grain)" opacity=".72"/>'
    scene+='<path d="M0 0H1280V107H0Z" fill="#162b35"/>'
    scene+=txt(79,69,"CUT / SEQUENCE",22,"#eceadd",400)
    scene+=line("M79 137H1202","#8b9b9b",1.2)
    scene+='<path d="M79 150H200" stroke="#e9755e" stroke-width="6"/>'
    scene+='<rect x="80" y="187" width="6" height="211" fill="#cf6b56"/>'
    scene+=txt(112,277,"剪出節奏",75,"#19343c")
    scene+=txt(112,332,"畫面相接",27,"#4e6871",400)
    scene+=line("M112 359H440","#647d80",1.5,'opacity=".58"')
    scene+=txt(82,568,"02  /  EDITING",20,"#3c5864",400)
    scene+='<rect x="496" y="184" width="743" height="364" rx="5" fill="#122b36" stroke="#476775" stroke-width="2"/>'
    scene+='<rect x="503" y="189" width="729" height="31" fill="#e4dfd2"/>'
    scene+='<rect x="503" y="479" width="729" height="31" fill="#e4dfd2"/>'
    scene+=''.join('<rect x="%d" y="196" width="17" height="15" rx="2" fill="#1c3642"/>'%i+
                   '<rect x="%d" y="484" width="17" height="17" rx="2" fill="#1c3642"/>'%i
                   for i in range(515,1211,30))
    scene+=frame(511,263,0,.73)+frame(750,263,1,.73)+frame(989,263,2,.73)
    scene+=line("M873 220V511","#e9755e",4)
    scene+='<polygon points="859,220 887,220 873,238" fill="#e9755e"/>'
    scene+=txt(522,539,"SHOT 01",15,"#d1c6af",400)
    scene+=txt(769,539,"SHOT 02",15,"#d1c6af",400)
    scene+=txt(1008,539,"SHOT 03",15,"#d1c6af",400)
    scene+='<rect x="80" y="630" width="1108" height="7" rx="3" fill="#869a95"/>'
    scene+='<rect x="80" y="630" width="332" height="7" rx="3" fill="#406777"/>'
    scene+='<rect x="418" y="630" width="414" height="7" rx="3" fill="#e9755e"/>'
    scene+='<rect x="838" y="630" width="350" height="7" rx="3" fill="#406777"/>'
    scene+=line("M412 617V650 M832 617V650","#29434b",2)
    scene+=txt(80,677,"00:00",17,"#54696d",400)
    scene+=txt(789,677,"05:24",17,"#54696d",400)
    scene+=txt(1125,677,"08:00",17,"#54696d",400)
    return wrap(scene)

def third():
    scene='<rect width="1280" height="720" fill="url(#sky)"/>'+cloud()+sea(419)
    scene+='<ellipse cx="851" cy="504" rx="359" ry="74" fill="#102533" opacity=".35"/>'
    scene+='<ellipse cx="851" cy="494" rx="300" ry="59" fill="none" stroke="#c4ded9" stroke-width="8"/>'
    scene+='<ellipse cx="851" cy="494" rx="232" ry="43" fill="none" stroke="#f4cfbf" stroke-width="5"/>'
    scene+='<ellipse cx="851" cy="494" rx="160" ry="30" fill="none" stroke="#e9755e" stroke-width="5"/>'
    scene+='<ellipse cx="851" cy="494" rx="83" ry="15" fill="none" stroke="#d4f2ee" stroke-width="6"/>'
    scene+=line("M812 481Q838 413 850 467Q869 409 893 484","#e7f7ef",6,'stroke-linecap="round"')
    scene+=raindrop(852,363,.85)
    scene+='<rect width="551" height="720" fill="#0b1b28" opacity=".75"/>'
    scene+='<rect x="80" y="241" width="7" height="178" fill="#e9755e"/>'
    scene+=txt(113,352,"故事成形",77)
    scene+=txt(116,406,"水面回應",28,"#d2e6e0",400)
    scene+=txt(115,620,"03  /  RESOLUTION",16,"#e9755e",400)
    scene+='<rect width="1280" height="720" fill="url(#grain)" opacity=".7"/>'
    return wrap(scene)

FRAMES=[
  {"id":"01","slug":"fragments","title":"散落鏡頭","at":"01.0s","intent":"Three physical weather shots, moody storm depth, one recurring coral cue"},
  {"id":"02","slug":"assembly","title":"剪出節奏","at":"03.7s","intent":"A genuine physical filmstrip, quiet editorial layout, red playhead as narrative handoff"},
  {"id":"03","slug":"resolution","title":"故事成形","at":"07.0s","intent":"A cinematic drop-to-water cause-and-effect shot with more material depth"},
]
DRAW=[first,second,third]

def generate(folder):
    folder=Path(folder)
    if folder.exists():
        raise ValueError("Refusing to overwrite previously inspected styleframes")
    folder.mkdir(parents=True)
    for meta,draw in zip(FRAMES,DRAW):
        svg=draw()
        if "<script" in svg or "<image" in svg or "<foreignObject" in svg or "href=" in svg or "url(http" in svg or "https://" in svg:
            raise ValueError("Disallowed remote/script source in SVG")
        (folder/("styleframe-"+meta["id"]+".svg")).write_text(svg,encoding="utf-8")
    manifest={
        "status":"C3_3_RENDERED_SOURCE_ART_PENDING_INDEPENDENT_VISUAL_AND_USER_REVIEW",
        "frames":FRAMES,"width":W,"height":H,
        "creative_source":"original programmatic SVG; no borrowed reference assets",
        "fonts":"Noto Sans CJK TC on inspected host, not font provenance for production",
        "reference_urls":[
            "https://www.ordinaryfolk.co/project/school-of-motion-manifesto",
            "https://www.buck.co/work/google-vids",
            "https://buck.co/work/illumina"],
        "premiere":"NOT_TESTED",
        "commercial_runtime_licensing":"NOT_APPROVED",
        "production_adoption":"NO",
        "user_art_approval":"PENDING"
    }
    (folder/"styleframes-manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    return manifest

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("output_directory")
    args=parser.parse_args()
    m=generate(args.output_directory)
    print(json.dumps({"status":m["status"],"count":len(m["frames"])},ensure_ascii=False))

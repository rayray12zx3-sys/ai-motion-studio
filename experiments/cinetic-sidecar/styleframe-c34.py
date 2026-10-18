#!/usr/bin/env python3
"""C3.4: scene-driven SVG look development. Fully original, no external images/media.
A storyboard is a physical prop inside the storm world, NOT a three-page presentation.
Do not use this module to render or certify a finished video.
"""
import argparse
import importlib.util
import json
import math
from pathlib import Path

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("original_c33_art_library", HERE/"styleframe-c33.py")
art=importlib.util.module_from_spec(spec)
spec.loader.exec_module(art)

IVORY="#f5eddf"
RED="#e9755e"
DARK="#0c1d29"

def lettering(x,y,text,size=104,angle=0,color=IVORY,stroke=DARK):
    """Only real scene-dependent typography, with coordinates owned by story props."""
    return (
      '<g data-scene-title="true" transform="translate(%d %d) rotate(%d)">' % (x,y,angle)
      + ('<text x="0" y="0" font-family="Noto Sans CJK TC, Noto Sans CJK, sans-serif" '
         'font-size="%d" font-weight="700" fill="%s" stroke="%s" stroke-width="2.5" '
         'stroke-linejoin="round" paint-order="stroke">%s</text></g>' % (size,color,stroke,text))
    )

def mist():
    return (
      '<path d="M-30 344C177 263 351 303 487 327S782 245 989 294S1241 250 1310 273" '
      'fill="none" stroke="#d8e7dc" stroke-width="42" opacity=".045"/>'
      +'<path d="M-12 159Q327 88 567 183T1291 145" fill="none" stroke="#d8e7dc" stroke-width="17" opacity=".13"/>'
      +'<path d="M-2 564Q318 509 611 548T1288 517" fill="none" stroke="#f1e9df" stroke-width="30" opacity=".08"/>')

def raindrops(count,low=1):
    # Deterministic hand-placed storm parallax lines (not procedural random noise)
    segments=[(62,65,119),(175,192,92),(293,9,148),(482,125,90),(608,15,144),
              (760,64,120),(865,204,97),(1027,18,151),(1173,210,100),(1241,43,141)]
    return "".join(art.line("M%d %d l-17 %d"%(x,y,d*low),"#d8e7e0",2 if i%3==0 else 1.4,
             'opacity="%.2f"'%(.27+(i%3)*.1)) for i,(x,y,d) in enumerate(segments[:count]))

def fragments():
    # Negative space belongs to the weather, not a reserved 500px title sidebar.
    s='<rect width="1280" height="720" fill="url(#sky)"/>'+art.cloud()+mist()+art.sea(568)
    s+='<rect width="1280" height="720" fill="url(#grain)" opacity=".67"/>'
    s+=raindrops(10)
    # Each shot has a unique physical position/rotation/scale, not equal-weight cards.
    s+=art.frame(82,435,0,.91,-16)
    s+=art.frame(808,55,1,1.06,13)
    s+=art.frame(939,475,2,.69,-8)
    # Unequal title fragments float in separate gaps between film and cloud masses.
    s+=lettering(276,247,"散落",114,-11)
    s+=lettering(499,393,"鏡頭",123,9)
    # A single red story cue, not a red status icon on each heading.
    s+=art.raindrop(770,350,.72)
    # Cloud in foreground travels OVER edges of the words, creating physical depth.
    s+='<path d="M-25 411Q192 373 308 423T549 418T791 418T1299 384" fill="none" stroke="#9bb1af" stroke-width="13" opacity=".21"/>'
    s+='<path d="M186 575Q390 531 587 572T999 564" stroke="#e1eee8" opacity=".15" stroke-width="26" fill="none"/>'
    return art.wrap(s)

def ribbon():
    # Literal diagonal strip slices across the ENTIRE image.
    # Typography is split and attached to the dynamic film trajectory, not left/right.
    s='<rect width="1280" height="720" fill="url(#sky)"/>'+art.cloud()+art.sea(655)
    s+=mist()+raindrops(7)
    s+='<path d="M-133 690Q322 596 579 431T1392 113" fill="none" stroke="#071924" stroke-width="253" opacity=".42"/>'
    s+='<path d="M-133 666Q322 565 579 410T1392 100" fill="none" stroke="#d9d3c7" stroke-width="233"/>'
    s+='<path d="M-133 666Q322 565 579 410T1392 100" fill="none" stroke="#142c36" stroke-width="196"/>'
    s+='<path d="M-133 666Q322 565 579 410T1392 100" fill="none" stroke="#587581" stroke-width="2" opacity=".8"/>'
    # Distinct photograms use larger optical scale; positions follow the physical diagonal.
    s+=art.frame(78,451,0,.78,-20)
    s+=art.frame(474,290,1,.90,-20)
    s+=art.frame(923,97,2,.83,-19)
    # Coral cut cursor is attached to the join between the real shots.
    s+=art.line("M816 178L907 398",RED,7,'stroke-linecap="square"')
    s+='<path d="M791 194L818 149L840 209Z" fill="#f2a78e"/>'
    # words near the film and scissors, explicitly NOT a separate headline panel.
    s+=lettering(310,160,"剪出",110,-9)
    s+=lettering(700,658,"節奏",124,-16)
    s+='<path d="M574 548Q652 542 714 493" fill="none" stroke="#fbf2e8" stroke-width="3" opacity=".63"/>'
    s+=art.raindrop(866,424,.65)
    s+='<rect width="1280" height="720" fill="url(#grain)" opacity=".40"/>'
    return art.wrap(s)

def splash():
    # No separate typographic presentation zone; characters inhabit the storm/ripple.
    s='<rect width="1280" height="720" fill="url(#sky)"/>'+art.cloud()+mist()+raindrops(10)
    s+=art.sea(439)
    # Light shafts are scene depth, not drop-shadow UI decoration.
    s+='<path d="M441 64L593 440L750 437L520 82Z" fill="#c5e7e3" opacity=".055"/>'
    s+='<path d="M833 48L725 432L846 432L940 60Z" fill="#dfe9da" opacity=".06"/>'
    s+='<ellipse cx="690" cy="524" rx="440" ry="106" fill="#102637" opacity=".33"/>'
    for rx,ry,st,sw in [(408,91,"#749ea7",7),(347,77,"#c9ece2",6),
                        (283,61,"#f2dfd0",6),(207,46,RED,5),(124,27,"#d0f1e9",5)]:
        s+='<ellipse cx="690" cy="513" rx="%d" ry="%d" fill="none" stroke="%s" stroke-width="%d" opacity=".8"/>'%(rx,ry,st,sw)
    # Asymmetric water impact/spray: actual differing silhouettes, not just 5 ellipses.
    s+='<path d="M569 506Q611 461 637 475Q654 403 687 463Q716 407 736 466Q779 444 827 506" '
    s+='fill="none" stroke="#dff4ec" stroke-width="8" stroke-linecap="round"/>'
    s+='<path d="M613 499Q642 470 662 496Q702 441 720 499Q758 473 791 502" '
    s+='fill="none" stroke="#d5b8a9" stroke-width="3" opacity=".85"/>'
    for x,y,r in [(576,448,5),(616,400,3),(734,399,4),(817,445,6),(766,378,3),(650,371,4)]:
        s+='<circle cx="%d" cy="%d" r="%d" fill="#ddf4ec" opacity=".81"/>'%(x,y,r)
    s+=art.raindrop(689,365,.78)
    # Each pair is split on opposite flanks of the real splash: not sidebar/body/footer.
    s+=lettering(141,324,"故事",123,-9)
    s+=lettering(911,324,"成形",122,11)
    # Foreground water crosses lower character silhouettes (controlled partial occlusion).
    s+='<path d="M-35 649Q199 585 411 625T836 618T1322 632" fill="none" stroke="#91c0c1" stroke-width="18" opacity=".26"/>'
    s+='<rect width="1280" height="720" fill="url(#grain)" opacity=".66"/>'
    return art.wrap(s)

FRAMES=[
 {"id":"01","title":"散落鏡頭","description":"Words hang between falling fragments of real film and atmospheric clouds; clouds cross title layer"},
 {"id":"02","title":"剪出節奏","description":"One diagonal physical filmstrip cuts across whole composition, broken title follows film direction"},
 {"id":"03","title":"故事成形","description":"An actual red drop impacts expanding water rings; words straddle the impact rather than occupying a panel"}
]
DRAW=[fragments,ribbon,splash]
def generate(directory):
    dest=Path(directory)
    if dest.exists():raise ValueError("C3.4 refuses to overwrite previous candidate artifacts")
    dest.mkdir(parents=True)
    for item,draw in zip(FRAMES,DRAW):
        svg=draw()
        # A standard SVG xmlns attribute is allowed; external links and scripts are not.
        if any(x in svg for x in ("<script","<image","<foreignObject","href=","url(http","https://")):
            raise ValueError("remote asset or active SVG forbidden")
        (dest/("styleframe-"+item["id"]+".svg")).write_text(svg,encoding="utf-8")
    result={
      "gate":"C34_SOURCE_PREVIEW_CREATED_ART_STILL_PENDING",
      "resolution":[1280,720],
      "source":"Original synthetic SVG and reusable original weather/film primitives from C3.3",
      "typographicLayout":"scene-driven only; three different layouts, title integrated with props",
      "safety":{"remoteMedia":False,"privateMedia":False,"newProductionDependencies":False,
                "windowsPremiere":"NOT_TESTED","commercialRights":"NOT_CLEARED",
                "humanArtApproval":"PENDING","film":"NOT_RENDERED"},
      "frames":FRAMES
    }
    (dest/"styleframes-manifest.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    return result
if __name__=="__main__":
    p=argparse.ArgumentParser();p.add_argument("directory");args=p.parse_args()
    z=generate(args.directory)
    print("C34_SCENE_DRIVEN_SOURCE_CREATED",len(z["frames"]))

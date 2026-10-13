#!/usr/bin/env python3
"""Original, offline, deterministic motion-graphics R&D.
Independent transparent overlay modules. Synthetic-only examples. Not a
production renderer migration, copy/claim approval, or replacement for app UI.
"""
import argparse, hashlib, json, math, os, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W,H,FPS=1080,1920,30
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'out'
FONT_R='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
FONT_B='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
if not Path(FONT_R).exists():
    FONT_R='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';FONT_B=FONT_R
_fonts={}
def font(px,bold=False):
    key=(int(px),bold)
    if key not in _fonts:_fonts[key]=ImageFont.truetype(FONT_B if bold else FONT_R,key[0])
    return _fonts[key]

def clamp(x):return max(0.,min(1.,x))
def smooth(x):x=clamp(x);return x*x*(3-2*x)
def outback(x):
    x=clamp(x)-1
    return 1+2.5*x*x*x+1.5*x*x
def lerp(a,b,t):return a+(b-a)*t
def fade(t,a,b):return smooth((t-a)/(b-a))
def hide(t,a,b):return 1-fade(t,a,b)
def rgba(c,a=255):return (*c,int(clamp(a/255)*255))
NAVY=(9,29,49); CYAN=(39,209,222); BLUE=(69,156,255); GOLD=(255,183,72); GREEN=(100,234,168); WHITE=(245,249,255); MUTE=(161,190,215)

def canvas():return Image.new('RGBA',(W,H),(0,0,0,0))
def rr(draw, box, radius, fill, outline=None, width=2):draw.rounded_rectangle(tuple(map(int,box)),radius=radius,fill=fill,outline=outline,width=width)
def poly(draw,points,fill,width=5):draw.line(points,fill=fill,width=width,joint='curve')
def centered(draw,s,x,y,px,color=WHITE,bold=False,anchor='mm'):
    draw.text((int(x),int(y)),str(s),font=font(px,bold),fill=color,anchor=anchor,stroke_width=0)
def halo(img,x,y,r,c,a=115):
    # lightweight concentric semi-transparent halo; local visual accent, no global blur
    d=ImageDraw.Draw(img,'RGBA')
    for v in range(5,0,-1):
        rad=int(r*(0.6+v*.23))
        d.ellipse((x-rad,y-rad,x+rad,y+rad),fill=(*c,int(a/(v*6))))

def confetti(d,t,x,y,index,start=0.0,fall=1.0):
    # deterministic radial particles with stagger and deceleration
    angle=index*2.399963+0.3
    q=clamp((t-start-index*.021)/fall)
    if q<=0 or q>=1:return
    r=(70+index%7*22)*(1-(1-q)**2)
    xx=x+math.cos(angle)*r+16*math.sin(t*3+index)
    yy=y+math.sin(angle)*r-95*q+120*q*q
    a=int(255*math.sin(math.pi*q)**.55)
    palette=(CYAN,BLUE,GOLD,GREEN,WHITE)
    c=palette[index%len(palette)]
    size=4+(index%4)*3
    d.rounded_rectangle((xx-size,yy-size*.35,xx+size,yy+size*.35),radius=2,fill=(*c,a))

def draw_card(img,box,edge=CYAN,shade=(13,38,68),alpha=243,radius=32,weight=3):
    d=ImageDraw.Draw(img,'RGBA')
    rr(d,box,radius,(*shade,alpha),outline=(*edge,min(255,alpha)),width=weight)
    x0,y0,x1,y1=box
    rr(d,(x0+15,y0+15,x1-15,y0+20),2,(*edge,90))

def ring(d,cx,cy,r,color,q,stroke=11,start=-90):
    if q>0:d.arc((cx-r,cy-r,cx+r,cy+r),start,start+min(359.5,360*q),fill=(*color,230),width=stroke)

def diamond(d,cx,cy,r,color,alpha=230):d.polygon([(cx,cy-r),(cx+r,cy),(cx,cy+r),(cx-r,cy)],fill=(*color,alpha))

def arrow(d,x0,y0,x1,y1,color,stroke=9,amt=1.0):
    amt=clamp(amt)
    if amt<=0:return
    x2=lerp(x0,x1,amt);y2=lerp(y0,y1,amt)
    poly(d,[(x0,y0),(x2,y2)],(*color,int(230*amt)),stroke)
    if amt>.9:
        ang=math.atan2(y1-y0,x1-x0)
        d.polygon([(x1,y1),(x1-21*math.cos(ang-.55),y1-21*math.sin(ang-.55)),
                   (x1-21*math.cos(ang+.55),y1-21*math.sin(ang+.55))],fill=(*color,230))

def titleblock(img,index,title,subtitle,section_alpha=1.0):
    d=ImageDraw.Draw(img,'RGBA')
    d.rounded_rectangle((85,232,995,367),radius=32,fill=(*NAVY,int(216*section_alpha)))
    d.rounded_rectangle((85,232,105,367),radius=9,fill=(*CYAN,int(255*section_alpha)))
    d.text((135,255),f'MOTION  /  {index}',font=font(29,True),fill=(*MUTE,int(240*section_alpha)))
    d.text((135,297),title,font=font(58,True),fill=(*WHITE,int(255*section_alpha)))
    if subtitle:d.text((96,382),subtitle,font=font(29),fill=(*WHITE,int(215*section_alpha)))

def stage_recall(img,t,spec):
    d=ImageDraw.Draw(img,'RGBA')
    titleblock(img,'01',spec.get('heading','學習流程'),spec.get('subheading','純原創教學概念動畫'))
    # Design: question moves to a real active recall gesture, then expands into 3 timed revisit nodes.
    reveal=fade(t,.08,.7)
    q=outback((t-.18)/.68)
    shift=fade(t,2.22,3.08)
    cx=int(540+130*(1-q));cy=int(780-164*shift-55*(1-q))
    halo(img,cx,cy,185,CYAN,int(110*reveal))
    ww=int(640*max(.1,q)*(1-.12*shift)); hh=int(360*(1-.18*shift))
    draw_card(img,(cx-ww//2,cy-hh//2,cx+ww//2,cy+hh//2),edge=CYAN)
    d=ImageDraw.Draw(img,'RGBA')
    if q>.7:
        a=int(255*reveal)
        centered(d,'Q',cx,cy-78,106,(*CYAN,a),True)
        centered(d,spec.get('question','提出問題'),cx,cy+44,72,(*WHITE,a),True)
        rr(d,(cx-180,cy+106,cx+180,cy+112),3,(*CYAN,110))
    # orbiting dotted particles animate during recall
    recall=fade(t,1.05,1.42)*hide(t,2.3,2.8)
    if recall:
        ring(d,cx,cy,246,GOLD,(t*0.51)%1,10)
        for k in range(9):
            a=t*1.4+2*math.pi*k/9
            r=248+6*math.sin(t*7+k)
            x=cx+math.cos(a)*r;y=cy+math.sin(a)*r
            d.ellipse((x-5,y-5,x+5,y+5),fill=(*GOLD,int(140*recall)))
        centered(d,spec.get('recall','思考整理'),540,1178,83,(*WHITE,int(255*recall)),True)
    # migrate from active card to deterministic calendar arcs
    pulse=fade(t,2.15,2.8)
    path_start=(540,cy+hh//2+30);path_end=(540,1130)
    arrow(d,*path_start,*path_end,GOLD,stroke=12,amt=pulse)
    # independent easing. calendar panels pop in sequence, not just opacity
    labs=spec.get('revisit_labels',['步驟 1','步驟 2','步驟 3'])
    for k in range(3):
        x=245+k*295;y=1330
        z=outback((t-2.75-k*.30)/.42)
        if z<=0:continue
        z=max(.01,z);size=int(244*z)
        rect=(x-size//2,y-int(120*z),x+size//2,y+int(120*z))
        halo(img,x,y,79,GREEN,90)
        draw_card(img,rect,edge=GREEN if k==2 else BLUE,shade=(12,47,57),alpha=248,radius=23)
        d=ImageDraw.Draw(img,'RGBA')
        if z>.55:
            centered(d,str(k+1),x,y-38,int(63*min(1,z)),(*GREEN,255),True)
            centered(d,labs[k],x,y+50,int(37*min(1,z)),WHITE,True)
        if t>=3.45+k*.29:
            ring(d,x,y,125,GREEN,smooth((t-(3.45+k*.29))/.55),stroke=8)
    fin=fade(t,3.94,4.36)
    if fin:
        rr(d,(116,1640,964,1774),27,(*NAVY,int(238*fin)),outline=(*GREEN,int(210*fin)),width=3)
        centered(d,spec.get('finish','分段回顧'),540,1707,70,(*WHITE,int(fin*255)),True)

def stage_highlight(img,t,spec):
    d=ImageDraw.Draw(img,'RGBA')
    titleblock(img,'02',spec.get('heading','介面操作提示'),spec.get('subheading','可用於已授權的原創來源畫面'))
    # transparent outside deliberate lower-half mobile target. parameterized placement
    cx=int(spec.get('target_x',540));cy=int(spec.get('target_y',1090))
    rx=int(spec.get('target_radius',270));
    cutoff=float(spec.get('active_until_seconds',3.7))
    activation=fade(t,.1,.5)*hide(t,cutoff-.30,cutoff)
    # lively corner brackets moving toward center, no reconstructed UI
    for k in range(4):
        dx=(-1 if k in (0,2) else 1); dy=(-1 if k in (0,1) else 1)
        q=smooth((t-.18)/.6);off=lerp(100,0,q)
        x=cx+dx*(rx+off);y=cy+dy*(rx*.85+off)
        L=92
        pts=[(x-dx*L,y),(x,y),(x,y-dy*L)]
        poly(d,pts,(*CYAN,int(230*activation)),10)
    ring(d,cx,cy,rx+25,CYAN,(t*.76)%1,9)
    if t>1.0:
        q=fade(t,1.05,2.18)
        source=(cx+160,cy-170);dest=(cx+4,cy+60)
        x=lerp(source[0],dest[0],smooth(q));y=lerp(source[1],dest[1],smooth(q))
        rr(d,(x-19,y-19,x+19,y+19),14,(*GOLD,int(250*hide(t,3.23,3.57))))
        ring(d,int(x),int(y),51,GOLD,.5+.5*math.sin(t*11),7)
    popstart=min(2.36,cutoff-1.10)
    pop=fade(t,popstart,popstart+.28)*hide(t,cutoff-.42,cutoff)
    if pop:
        halo(img,cx,cy-470,83,GREEN,int(145*pop))
        rr(d,(cx-244,cy-557,cx+244,cy-410),28,(*NAVY,int(245*pop)),outline=(*GREEN,int(235*pop)),width=4)
        centered(d,spec.get('indicator','操作重點'),cx,cy-481,60,(*WHITE,int(255*pop)),True)
    # animated progress bars are purely illustrative timing guides, not app progress
    prog=fade(t,0.3,2.75)
    rr(d,(200,1630,880,1647),8,(*NAVY,int(200*activation)))
    rr(d,(200,1630,200+int(680*prog),1647),8,(*CYAN,int(220*activation)))

def stage_reward(img,t,spec):
    d=ImageDraw.Draw(img,'RGBA');titleblock(img,'03',spec.get('heading','操作事件視覺回饋'),spec.get('subheading','僅在事件成功被確認後使用'))
    activation=fade(t,.25,.58)
    cx,cy=540,1060
    radius=235+34*math.sin(t*3)
    halo(img,cx,cy,int(radius),GOLD,int(120*activation))
    if activation>0:
        for k in range(28):
            angle=math.pi*2*k/28+t*.20
            rad=(180+25*math.sin(t*3+k))*activation
            x=cx+math.cos(angle)*rad;y=cy+math.sin(angle)*rad
            sz=6+(k%3)*4
            diamond(d,x,y,sz,(GOLD if k%2 else CYAN),int(165*activation))
        ring(d,cx,cy,208,CYAN,min(1,(t-.37)/1.0),14)
        ring(d,cx,cy,247,GOLD,(t*.27)%1,6)
    z=outback((t-.58)/.57)
    if z>.05:
        s=min(1.08,z);size=int(170*s)
        vertices=[(cx+math.cos(-math.pi/2+j*math.pi/5)*(size if j%2==0 else size*.46),
                   cy+math.sin(-math.pi/2+j*math.pi/5)*(size if j%2==0 else size*.46)) for j in range(10)]
        d.polygon(vertices,fill=(*GOLD,int(min(255,245*activation))))
        vertices2=[(cx+math.cos(-math.pi/2+j*math.pi/5)*(size*.73 if j%2==0 else size*.33),
                   cy+math.sin(-math.pi/2+j*math.pi/5)*(size*.73 if j%2==0 else size*.33)) for j in range(10)]
        d.polygon(vertices2,fill=(*WHITE,int(min(255,235*activation))))
    for k in range(35):confetti(d,t,cx,cy,k,start=.7,fall=2.9)
    textreveal=fade(t,1.40,1.84)
    if textreveal:
        rr(d,(180,1370,900,1540),35,(*NAVY,int(235*textreveal)),outline=(*GOLD,int(220*textreveal)),width=4)
        centered(d,spec.get('indicator','完成提示'),540,1454,87,(*WHITE,int(255*textreveal)),True)
        # CTA safe without score or position numbers
    if t>2.3:
        ring(d,cx,cy,300,GREEN,((t-2.3)*.65)%1,8)

def stage_compare(img,t,spec):
    d=ImageDraw.Draw(img,'RGBA');titleblock(img,'04',spec.get('heading','資訊對比動畫'),spec.get('subheading','只呈現已核准的資料；以下為結構示意'))
    a=outback((t-.32)/.55);b=outback((t-.85)/.55)
    lx,rx=300,780
    for i,(cx,z,edge,heading) in enumerate([(lx,a,BLUE,spec.get('left','起始狀態')),(rx,b,GREEN,spec.get('right','後續狀態'))]):
        if z<=0:continue
        z=max(0.03,min(1.07,z));rr(d,(cx-int(204*z),790-int(260*z),cx+int(204*z),790+int(260*z)),36,(*NAVY,235),outline=(*edge,233),width=5)
        if z>.75:
            centered(d,heading,cx,592,53,(*WHITE,int(255*clamp(z))),True)
            centered(d,'—',cx,798,98,(*edge,255),True)
            centered(d,spec.get('placeholder','待資料驗證'),cx,926,34,MUTE)
    arrow(d,520,790,560,790,GOLD,stroke=10,amt=fade(t,1.65,2.06))
    # animated mechanical comparison baseline, no actual scores implied
    q=fade(t,2.1,3.15)
    rr(d,(177,1250,903,1265),7,(*MUTE,85))
    # Continuous time-position feedback represents the movement between phases.
    rr(d,(177,1250,177+int(726*clamp(t/3.98)),1265),7,(*CYAN,210))
    for k in range(2):
        x=253+k*505;y=1360
        ring(d,x,y,58,(BLUE if k==0 else GREEN),q,8)
        centered(d,str(k+1),x,y,47,(BLUE if k==0 else GREEN),True)
    footer=fade(t,2.9,3.35)
    if footer:centered(d,'範例不提供任何成效數字',540,1605,39,(*WHITE,int(215*footer)),True)

def stage_cta(img,t,spec):
    d=ImageDraw.Draw(img,'RGBA');titleblock(img,'05',spec.get('heading','通用 CTA 動畫'),spec.get('subheading','正式文字與品牌素材另行審核'))
    cx,cy=540,1020;rr(d,(137,770,943,1312),50,(*NAVY,int(210*fade(t,.10,.7))),outline=(*CYAN,int(205*fade(t,.10,.7))),width=4)
    for i in range(12):
        ang=i*math.pi/6+t*.4;rad=278+10*math.sin(t*4+i)
        xx=cx+math.cos(ang)*rad;yy=cy+math.sin(ang)*rad
        diamond(d,xx,yy,8,(GOLD if i%3==0 else CYAN),int(150*fade(t,.4,.8)))
    z=outback((t-.38)/.6)
    if z>0:centered(d,spec.get('headline','開始探索'),cx,922,int(90*min(1.1,z)),(*WHITE,int(240*clamp(z))),True)
    btn=outback((t-1.10)/.52)
    if btn>0:
        bw=int(600*max(.02,btn));bh=int(134*max(.02,btn));rr(d,(cx-bw//2,1040-bh//2,cx+bw//2,1040+bh//2),36,(*GOLD,255))
        if btn>.85:centered(d,spec.get('button','查看更多'),cx,1042,62,NAVY,True)
    if t>2.0:
        ring(d,cx,1040,390,CYAN,(t*.45)%1,7)
        for k in range(18):confetti(d,t,cx,1040,k,start=2.3,fall=1.4)

MODES={'recall_cycle':(stage_recall,5.),'interaction_focus':(stage_highlight,4.),'event_reward':(stage_reward,4.),'comparison':(stage_compare,4.),'cta_reveal':(stage_cta,4.)}

def validate_spec(spec):
    if not isinstance(spec,dict):raise ValueError('Expected local JSON object')
    accepted={'mode','heading','subheading','question','recall','finish','revisit_labels','target_x','target_y','target_radius','active_until_seconds','indicator','left','right','placeholder','headline','button'}
    if any(k not in accepted for k in spec):raise ValueError('Unsupported specification field')
    if spec.get('mode') not in MODES:raise ValueError('Unsupported motion technique')
    for k,v in spec.items():
        if isinstance(v,str) and (len(v)>70 or '\n' in v or '<' in v):raise ValueError('Unsafe/unbounded text')
    if 'revisit_labels' in spec and (not isinstance(spec['revisit_labels'],list) or len(spec['revisit_labels'])!=3 or any(not isinstance(x,str) or len(x)>8 for x in spec['revisit_labels'])):raise ValueError('Expected three short labels')
    for k,lo,hi in [('target_x',150,930),('target_y',700,1400),('target_radius',140,280)]:
        if k in spec and (type(spec[k]) not in (int,float) or not lo<=spec[k]<=hi):raise ValueError('Target out of safe bounds')
    if 'active_until_seconds' in spec and (spec['mode']!='interaction_focus' or type(spec['active_until_seconds']) not in (int,float) or not .8<=spec['active_until_seconds']<=4):
        raise ValueError('Invalid focus event cutoff')
    return spec

def render_one(spec,outdir):
    mode=spec['mode'];fn,duration=MODES[mode];frames=int(duration*FPS)
    outdir.mkdir(parents=True,exist_ok=True)
    mov=outdir/f'{mode}_ALPHA.mov';mp4=outdir/f'{mode}_PREVIEW.mp4'
    if mov.exists() or mp4.exists():raise FileExistsError('Refusing to overwrite renders')
    ff=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgba','-s',f'{W}x{H}','-r',str(FPS),'-i','pipe:0','-an','-c:v','prores_ks','-profile:v','4','-pix_fmt','yuva444p10le','-alpha_bits','16','-vendor','apl0','-threads','4',str(mov)]
    proc=subprocess.Popen(ff,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    samples=[0,int(frames*.12),int(frames*.27),int(frames*.43),int(frames*.60),int(frames*.78),frames-1]
    shot=[];lumas=[]
    try:
        for i in range(frames):
            img=canvas();fn(img,i/FPS,spec)
            if mode=='interaction_focus' and 'active_until_seconds' in spec:
                cutoff=spec['active_until_seconds'];q=hide(i/FPS,cutoff-.22,cutoff)
                img.putalpha(img.getchannel('A').point(lambda a:int(a*q)))
            if i in samples:
                shot.append((i,img.copy()))
                lumas.append(img.getchannel('A').getbbox())
            proc.stdin.write(img.tobytes())
            if (i+1)%60==0:print(f'{mode}: {i+1}/{frames}',flush=True)
        proc.stdin.close();ret=proc.wait(timeout=200)
        if ret:raise RuntimeError(proc.stderr.read().decode()[-1400:])
    except BaseException:
        proc.kill();proc.wait();raise
    # build preview by compositing the same actual ProRes alpha frames onto an original dark gradient.
    background=f'color=c=0x101c30:size={W}x{H}:rate={FPS}:duration={duration}'
    cv=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','lavfi','-i',background,'-i',str(mov),'-filter_complex',
        '[0:v][1:v]overlay=0:0:shortest=1:format=auto,format=yuv420p[v]','-map','[v]','-an','-c:v','libx264','-preset','veryfast','-crf','20','-movflags','+faststart',str(mp4)]
    subprocess.run(cv,check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,timeout=180)
    # compose contact sheet from original rendered RGBA images, with a consistent dark preview backing.
    tiles=[]
    for i,img in shot:
        back=Image.new('RGBA',(W,H),(16,28,48,255));back.alpha_composite(img)
        frame=back.convert('RGB');frame.thumbnail((270,480))
        d=ImageDraw.Draw(frame)
        rr(d,(3,3,115,32),7,(6,19,32),outline=CYAN,width=1)
        d.text((10,7),f'{i/FPS:.2f}s',font=font(18,True),fill=WHITE)
        tiles.append(frame)
    cw=270*len(tiles);sheet=Image.new('RGB',(cw,480),(12,24,40))
    for k,img in enumerate(tiles):sheet.paste(img,(270*k,0))
    contact=outdir/f'{mode}_CONTACT.jpg';sheet.save(contact,quality=89)
    def probe(path):
        raw=subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_entries','stream=codec_name,pix_fmt,width,height,r_frame_rate,nb_read_frames:format=duration,size','-of','json',str(path)])
        return json.loads(raw)
    sha=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
    meta={'mode':mode,'original_only':True,'framerate':FPS,'duration_seconds':duration,'frames_expected':frames,
          'renders':{'mov':{'file':mov.name,'probe':probe(mov),'sha256':sha(mov)},'mp4':{'file':mp4.name,'probe':probe(mp4),'sha256':sha(mp4)}},
          'readback':{'sample_frame_indices':samples,'sample_alpha_bboxes':[list(b) if b else None for b in lumas]},
          'creative_review':'PENDING_HUMAN','commercial_approval':'PENDING','source_rights':'ORIGINAL_SYNTHETIC_ONLY',
          'limitations':'Offline hand-authored original motion vocabulary; no AI vision, no private app media, no actual score/learning efficacy claims; isolated R&D not official renderer.'}
    (outdir/f'{mode}_QC.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2))
    print(json.dumps({'mode':mode,'mov_mb':round(mov.stat().st_size/1e6,1),'mp4_mb':round(mp4.stat().st_size/1e6,2),'contact':contact.name,'alpha_pixfmt':meta['renders']['mov']['probe']['streams'][0]['pix_fmt']},ensure_ascii=False),flush=True)
    return meta

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--mode',choices=[*MODES,'all'])
    ap.add_argument('--spec',type=Path)
    ap.add_argument('--out',type=Path,default=OUT)
    args=ap.parse_args()
    if args.spec:
        if not args.spec.is_file() or args.spec.stat().st_size>4096:raise ValueError('Expected local bounded JSON')
        spec=validate_spec(json.loads(args.spec.read_text()))
        render_one(spec,args.out)
    else:
        for m in MODES if args.mode=='all' else [args.mode]:
            spec=validate_spec({'mode':m})
            render_one(spec,args.out)
if __name__=='__main__':main()

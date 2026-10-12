#!/usr/bin/env python3
"""Offline deterministic frame capture with Chromium; GSAP is locally vendored."""
import argparse, json, hashlib, os, subprocess, sys, time, threading, functools
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
parser=argparse.ArgumentParser()
parser.add_argument('--film',choices=['thread','focus'],required=True)
parser.add_argument('--sample',action='store_true')
parser.add_argument('--start',type=int,default=0)
parser.add_argument('--end',type=int,default=360)
parser.add_argument('--encode',action='store_true')
args=parser.parse_args()
shots=[0,15,36,60,77,88,112,143,167,183,207,231,250,274,292,315,345] if args.sample else range(args.start,args.end)
folder=ROOT/'artifacts'/(args.film+'_samples' if args.sample else args.film+'_frames')
folder.mkdir(parents=True,exist_ok=True)
print('Rendering',args.film,'samples?',args.sample,'frames',len(shots),'target',folder, flush=True)
t0=time.time()
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
handler=functools.partial(QuietHandler,directory=str(ROOT))
server=ThreadingHTTPServer(('127.0.0.1',0),handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu-sandbox'])
    page=browser.new_page(viewport={'width':540,'height':960},device_scale_factor=2,color_scheme='light')
    # The container browser policy blocks URL navigation, including loopback.
    # Load authored code directly into an about:blank document with no network.
    page.set_content('<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#111721}canvas{display:block;width:540px;height:960px}</style></head><body><canvas id="stage" width="1080" height="1920"></canvas></body></html>')
    page.add_script_tag(content=(ROOT/'vendor/gsap-3.15.0.min.js').read_text(encoding='utf-8'))
    # The authoring script reads the film choice from document.location; for an
    # about:blank document, expose a deterministic URLSearchParams override.
    page.evaluate("(name)=>{ const Base=URLSearchParams;window.URLSearchParams=class extends Base {constructor(s){super('?film='+name)}}}",args.film)
    page.add_script_tag(content=(ROOT/'film.js').read_text(encoding='utf-8'))
    page.wait_for_function('typeof window.seekFrame==="function" && typeof window.filmAudit==="function"')
    print('Audit:',page.evaluate('window.filmAudit()'),flush=True)
    for i,n in enumerate(shots):
        a=page.evaluate('(n)=>window.seekFrame(n)',int(n))
        page.locator('canvas').screenshot(path=str(folder/(f'{n:04d}.png')),animations='disabled',type='png')
        if (i+1)%60==0:print(f' frames {i+1}/{len(shots)} elapsed={time.time()-t0:.1f}s',flush=True)
    browser.close()
server.shutdown()
print('Completed',len(shots),'in',round(time.time()-t0,1),'seconds',flush=True)
if args.encode:
    # Film is exactly 360 authored frames, 30fps, lossless source PNG for H.264.
    audio=ROOT/'artifacts'/(args.film+'_audio.wav')
    out=ROOT/'artifacts'/(f'AMS_Original_{args.film}_12s_1080x1920_30fps.mp4')
    run=['ffmpeg','-hide_banner','-loglevel','error','-y','-framerate','30','-start_number','0','-i',str(folder/'%04d.png'),'-i',str(audio),'-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-r','30','-c:a','aac','-b:a','160k','-t','12','-movflags','+faststart',str(out)]
    print('Encoding',out.name,flush=True);subprocess.run(run,check=True)
    data=subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=codec_name,width,height,r_frame_rate,nb_frames','-show_entries','format=duration,size','-of','json',str(out)])
    print(data.decode(),flush=True)
    print('SHA256',hashlib.sha256(out.read_bytes()).hexdigest(),flush=True)
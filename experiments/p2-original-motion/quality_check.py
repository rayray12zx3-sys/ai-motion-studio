#!/usr/bin/env python3
"""Reproducible source-based technical QC; no ART or RIGHTS PASS assumed."""
from pathlib import Path
import cv2, numpy as np, json, hashlib, subprocess, math, re
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parent; ART=ROOT/'artifacts'
all_report={}
for film in ['thread','focus']:
 source=ART/(f'AMS_Original_{film}_12s_1080x1920_30fps.mp4')
 meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=codec_name,codec_type,width,height,r_frame_rate,nb_frames,sample_rate,channels','-show_entries','format=duration,size','-of','json',str(source)]))
 v=next(s for s in meta['streams'] if s['codec_type']=='video');a=next(s for s in meta['streams'] if s['codec_type']=='audio')
 assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1080,1920,'30/1',360),(film, v)
 assert v['codec_name']=='h264' and a['codec_name']=='aac' and int(a['sample_rate'])==48000
 assert abs(float(meta['format']['duration'])-12)<.05
 cap=cv2.VideoCapture(str(source));gray_prev=None
 diffs=[];means=[];names=[];blank=[];frames=[]
 picks={0,16,38,58,88,110,141,165,193,222,245,278,305,335,359}
 for i in range(360):
  ok,bgr=cap.read();assert ok,(film,i)
  im=cv2.cvtColor(cv2.resize(bgr,(144,256)),cv2.COLOR_BGR2GRAY)
  diff=float(np.mean(np.abs(im.astype(np.float32)-gray_prev.astype(np.float32)))) if gray_prev is not None else 0
  diffs.append(diff);means.append(float(im.mean()))
  if i in picks:frames.append((i,Image.fromarray(cv2.cvtColor(cv2.resize(bgr,(360,640)),cv2.COLOR_BGR2RGB))))
  if gray_prev is not None and (im.std()<2 or diff>110):blank.append({'frame':i,'std':round(float(im.std()),1),'difference':round(diff,1)})
  gray_prev=im
 assert not cap.read()[0],(film,'extra frame')
 cap.release()
 # Difference spikes may reflect authored major transitions; report, never blanket-pass art.
 top=sorted(enumerate(diffs),key=lambda z:z[1],reverse=True)[:12]
 labels=[]
 for i,vv in top:
  labels.append({'frame':i,'time_s':round(i/30,3),'mean_absolute_luma_delta':round(vv,2),
                 'cut_zone':bool(abs(i-290)<=4 or abs(i-288)<=4 or abs(i-186)<=6 or abs(i-195)<=6 or abs(i-75)<=6)})
 # Choose contact sheet 5x3 of separately decoded, not authored screenshot frames.
 sheet=Image.new('RGB',(5*360,3*(640+30)),(23,27,32));draw=ImageDraw.Draw(sheet)
 for j,(i,im) in enumerate(frames):
  x=(j%5)*360;y=(j//5)*670
  sheet.paste(im,(x,y+30));draw.text((x+12,y+5),f'{i:03d} / {i/30:.2f}s',fill='white')
 contact=ART/(f'AMS_Original_{film}_ContactSheet.jpg');sheet.save(contact,quality=86)
 fsum={'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'mp4_name':source.name,
       'video':v,'audio':a,'format':meta['format'],'visual_luma_mean_range':[round(min(means),2),round(max(means),2)],
       'mean_absolute_frame_delta':round(float(np.mean(diffs[1:])),2),'largest_transitions':labels,
       'potential_blank_or_extreme':[x for x in blank[:15]],'contact':contact.name,
       'technical_status':'PASS_CODEC_AND_FRAMES; MOTION_VISUAL_REVIEW_PENDING',
       'art_status':'NOT_APPROVED','rights_status':'ORIGINAL_SYNTHETIC_REVIEW_REQUIRED'}
 all_report[film]=fsum
 print(film,fsum['sha256'], 'delta avg', fsum['mean_absolute_frame_delta'],'top spikes',labels[:5], 'blank',len(blank),flush=True)
report=ART/'P2_motion_qc_report.json';report.write_text(json.dumps(all_report,indent=2,ensure_ascii=False))
print(report, flush=True)
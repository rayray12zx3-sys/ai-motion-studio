#!/usr/bin/env python3
"""Real, licensed music master for existing original P2 rough-cut videos.
Original H264 frame stream is copied without re-rendering. No synthetic audio
from v2 is mapped. Requires legally acquired music sources + credit notice.
"""
import hashlib
import json
import re
import os
import subprocess
from pathlib import Path

HERE=Path(__file__).resolve().parent
# Sources/films are intentionally not committed to GitHub; set these environment
# variables to local private paths when reproducing an authorized edit.
ROOT=Path(os.environ.get('P2_FILM_DIR', HERE/'input-films')).resolve()
SOURCES=Path(os.environ.get('P2_MUSIC_DIR', HERE/'sources')).resolve()
OUT=Path(os.environ.get('P2_OUTPUT_DIR', HERE/'outputs')).resolve()
OUT.mkdir(exist_ok=True)

FILMS=[
 dict(key='ARC',input=ROOT/'AMS_Original_thread_12s_1080x1920_30fps.mp4',music=SOURCES/'ARC_Cipher.mp3',start=12.0,fade_in=.28,fade_out=.85,target=-18,output=OUT/'P2_ARC_12s_v3_Licensed_Cipher_Music.mp4', title='Cipher',artist='Kevin MacLeod',isrc='USUAN1100844'),
 dict(key='FOCUS',input=ROOT/'AMS_Original_focus_12s_1080x1920_30fps.mp4',music=SOURCES/'FOCUS_Floating_Cities.mp3',start=0.,fade_in=.38,fade_out=1.2,target=-20,output=OUT/'P2_FOCUS_12s_v3_Licensed_Floating_Cities_Music.mp4',title='Floating Cities',artist='Kevin MacLeod',isrc='USUAN1600018'),
]

def run(args):
 p=subprocess.run(args,capture_output=True,text=True)
 if p.returncode: raise RuntimeError(f'Exit {p.returncode}: {args}\n{p.stderr[-2200:]}')
 return p.stdout,p.stderr

def probe(p):
 a,_=run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)])
 return json.loads(a)

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()

def frames(p):
 j,_=run(['ffprobe','-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=nb_read_frames','-of','default=noprint_wrappers=1:nokey=1',str(p)])
 return int(j.strip())

def integrated_loudness(p):
 _,e=run(['ffmpeg','-nostats','-hide_banner','-i',str(p),'-vn','-filter_complex','ebur128=peak=true','-f','null','-'])
 # Final EBU R128 summary
 m=re.search(r'Summary:\s*(.+)',e,re.S)
 if not m: raise RuntimeError('Missing EBU R128 summary')
 data=m.group(1)
 loud=re.search(r'Integrated loudness:\s*I:\s*([-\d.]+) LUFS',data)
 peak=re.search(r'True peak:\s*Peak:\s*([-\d.]+) dBFS',data)
 return {'integrated_lufs':float(loud.group(1)) if loud else None,'true_peak_dbfs':float(peak.group(1)) if peak else None}

report={'purpose':'Replace synthetic/weird audio with separately licensed real music','rights':'CC BY 4.0; attribution and modification notice mandatory when published','film_video_unchanged':True,'source_audio_only':True,'outputs':[]}
for f in FILMS:
 for k in ('input','music'):
  if not f[k].is_file():raise FileNotFoundError(f[k])
 src_info=probe(f['input'])
 assert int(frames(f['input']))==360
 assert abs(float(src_info['format']['duration'])-12)<.03
 # Entire original audio is dropped. Each licensed track is time-indexed from a known clip offset.
 af=f"atrim=start={f['start']}:duration=12,asetpts=PTS-STARTPTS,highpass=f=36,lowpass=f=16000,afade=t=in:st=0:d={f['fade_in']},afade=t=out:st={12-f['fade_out']}:d={f['fade_out']},loudnorm=I={f['target']}:LRA=8:TP=-2.5,aresample=48000,aformat=channel_layouts=stereo"
 args=['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(f['input']),'-i',str(f['music']),
    '-filter_complex',f'[1:a]{af}[music]','-map','0:v:0','-map','[music]',
    '-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-t','12',
    '-movflags','+faststart','-metadata',f"title=AI Motion Studio | {f['key']} | CC BY Licensed Music",
    '-metadata',f"artist={f['artist']}",
    '-metadata',f"comment=Music {f['title']} by {f['artist']}, licensed CC BY 4.0; edited 12s excerpt with fades and loudness processing. See MUSIC-CREDITS.md",
    str(f['output'])]
 run(args)
 info=probe(f['output'])
 st=info['streams'];aud=next(x for x in st if x['codec_type']=='audio');vid=next(x for x in st if x['codec_type']=='video')
 assert frames(f['output'])==360
 assert vid['codec_name']=='h264'
 assert aud['codec_name']=='aac' and aud['sample_rate']=='48000'
 assert abs(float(info['format']['duration'])-12)<.03
 loud=integrated_loudness(f['output'])
 assert loud['true_peak_dbfs']<-.1, loud
 report['outputs'].append({'film':f['key'],'track':f['title'],'composer':f['artist'],'isrc':f['isrc'],'excerpt_start_s':f['start'],'excerpt_duration_s':12,'fade_in_s':f['fade_in'],'fade_out_s':f['fade_out'],'target_lufs':f['target'],'original_music_sha256':sha(f['music']),'video_sha256_before':sha(f['input']),'final_mp4':f['output'].name,'final_mp4_sha256':sha(f['output']),'decoded_frames':frames(f['output']),'actual_audio_loudness':loud,'actual_duration_s':float(info['format']['duration']),'res':f"{vid['width']}x{vid['height']}",'fps':vid['r_frame_rate']})
 print(f['key'],f['output'],loud, 'sha256=',sha(f['output']))
(OUT/'P2_Licensed_Music_QC.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'MUSIC-CREDITS.md').write_bytes((HERE/'MUSIC-CREDITS.md').read_bytes())
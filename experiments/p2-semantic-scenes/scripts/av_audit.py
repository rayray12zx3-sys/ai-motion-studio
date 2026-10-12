#!/usr/bin/env python3
"""P2 offline full decoded-frame + soundtrack cue evidence, never ART_PASS.

The scanner consumes a LOCAL MP4, not private/cloud URLs. FFmpeg and FFprobe
are invoked for actual decoded media, not trusted source-side screenshot tags.
All silence, continuity and alignment findings are advisory, not AI review.
"""
import argparse
import array
import hashlib
import json
import math
import statistics
import subprocess
from pathlib import Path

SAMPLE_W,SAMPLE_H=96,170
RAW_BYTES=SAMPLE_W*SAMPLE_H
def run(argv):
    p=subprocess.run(argv,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if p.returncode:
        raise RuntimeError("Decoder failed (exit "+str(p.returncode)+"): "+p.stderr.decode(errors='replace')[-700:])
    return p.stdout

def probe(path):
    return json.loads(run(['ffprobe','-v','error','-show_streams','-show_format',
                           '-count_frames','-of','json',str(path)]))

def gray_difference(a,b):
    if len(a)!=len(b) or not a:raise ValueError('Different/empty decoded frames')
    return sum(abs(x-y) for x,y in zip(a,b))/len(a)

def frame_stats(raw):
    if len(raw)%RAW_BYTES:raise ValueError('Truncated grayscale decode')
    count=len(raw)//RAW_BYTES
    if count<2:raise ValueError('At least two actual decoded frames required')
    deltas=[0.0];blanks=[];means=[]
    previous=None
    for frame in range(count):
        p=memoryview(raw)[frame*RAW_BYTES:(frame+1)*RAW_BYTES]
        mean=sum(p)/len(p);means.append(mean)
        sigma=math.sqrt(sum((int(v)-mean)**2 for v in p)/len(p))
        if sigma<2.0:blanks.append(frame)
        if previous is not None:deltas.append(gray_difference(p,previous))
        previous=p
    return deltas,blanks,means

def near_cue(frame,cues,tolerance=4):
    return [c for c in cues if abs(frame-c['frame'])<=tolerance]

def inspect_cues(raw,frames):
    if not raw:return []
    if not isinstance(raw,list) or len(raw)>30:raise ValueError('Too many intended cues')
    output=[]
    for c in raw:
        if not isinstance(c,dict) or type(c.get('frame')) is not int or c['frame']<0 or c['frame']>=frames:
            raise ValueError('Invalid cue frame')
        if c.get('kind') not in ('cut','interaction','transition','impact','hold'):
            raise ValueError('Unsupported cue type')
        reason=c.get('reason','')
        if not isinstance(reason,str) or not 5<=len(reason)<=160:
            raise ValueError('Cue requires a creative cause')
        output.append({'frame':c['frame'],'kind':c['kind'],'reason':reason})
    return output

def audio_rms(path):
    raw=run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-i',str(path),
             '-vn','-f','s16le','-ar','12000','-ac','1','pipe:1'])
    pcm=array.array('h')
    pcm.frombytes(raw[:len(raw)//2*2])
    hop=240
    series=[]
    for i in range(0,len(pcm)-hop+1,hop):
        block=pcm[i:i+hop]
        series.append(math.sqrt(sum(v*v for v in block)/hop)/32768)
    if not series:return {'status':'DECODED_AUDIO_EMPTY'}
    deltas=[max(0,series[i]-series[i-1]) for i in range(1,len(series))]
    ordered=sorted(range(len(deltas)),key=lambda i:deltas[i],reverse=True)
    peaks=[]
    for index in ordered:
        if len(peaks)>=16:break
        at=(index+1)*hop/12000
        if deltas[index]<0.004:break
        if all(abs(at-b['seconds'])>.12 for b in peaks):
            peaks.append({'seconds':round(at,3),'positive_rms_change':round(deltas[index],4)})
    peaks.sort(key=lambda p:p['seconds'])
    return {'status':'MEASURED_NOT_LISTENED','rms_median':round(statistics.median(series),4),
            'rms_max':round(max(series),4),'candidate_energy_rises':peaks,
            'note':'Audio energy is not beat phase, timbre, musical phrase or actual listening.'}

def audit(path,expected_frames=None,cues=None):
    path=Path(path)
    if not path.is_file():raise FileNotFoundError(path)
    media=probe(path)
    videos=[s for s in media['streams'] if s['codec_type']=='video']
    audios=[s for s in media['streams'] if s['codec_type']=='audio']
    if len(videos)!=1:raise ValueError('Exactly one video stream required')
    video=videos[0]
    if video['codec_name']!='h264':raise ValueError('This P2 gate expects H.264')
    raw=run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-i',str(path),
             '-an','-vf','scale=96:170:flags=area,format=gray',
             '-f','rawvideo','-pix_fmt','gray','pipe:1'])
    deltas,blanks,means=frame_stats(raw)
    if expected_frames is not None and len(deltas)!=expected_frames:
        raise ValueError('Actual decoded frame count differs from expected')
    approved_cues=inspect_cues(cues or [],len(deltas))
    med=statistics.median(deltas[1:])
    deviations=[abs(x-med) for x in deltas[1:]]
    mad=statistics.median(deviations)
    threshold=max(13.0,med+8*mad)
    spikes=[{'frame':i,'time_s':round(i*float(video['avg_frame_rate'].split('/')[1])/
          float(video['avg_frame_rate'].split('/')[0]),3),'luma_delta':round(v,2),
          'intent_cues':[c['kind'] for c in near_cue(i,approved_cues)]}
            for i,v in enumerate(deltas) if i>0 and v>=threshold]
    spikes.sort(key=lambda z:z['luma_delta'],reverse=True)
    sound=audio_rms(path) if audios else {'status':'NO_AUDIO_STREAM'}
    if sound['status']=='MEASURED_NOT_LISTENED' and approved_cues:
        sound['cue_signal_distances']=[
          {'frame':c['frame'],'kind':c['kind'],
           'nearest_energy_rise_ms':round(min(abs(p['seconds']-c['frame']*
               float(video['avg_frame_rate'].split('/')[1])/
               float(video['avg_frame_rate'].split('/')[0]))
             for p in sound['candidate_energy_rises'])*1000)
           if sound['candidate_energy_rises'] else None}
          for c in approved_cues]
    return {
       'schema':'p2-av-advisory-v1','input_basename':path.name,
       'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
       'video':{'codec':video['codec_name'],'width':video['width'],'height':video['height'],
                'decoded_frames':len(deltas),'fps':video.get('avg_frame_rate'),
                'seconds':float(media['format']['duration'])},
       'decoded_frame_audit':{'blank_candidates':blanks[:100],
          'mean_luma_range':[round(min(means),2),round(max(means),2)],
          'median_luma_delta':round(med,3),'spike_threshold':round(threshold,2),
          'top_frame_spikes':spikes[:40],
          'unmapped_spikes':[s['frame'] for s in spikes if not s['intent_cues']][:40]},
       'cues':approved_cues,'audio':sound,'technical_decode':'PASS',
       'scene_transition_judgment':'NEEDS_FULL_SPEED_VISUAL_REVIEW',
       'music_alignment':'NOT_VALIDATED_BY_ENERGY_PROXIMITY',
       'type_composition':'NOT_VALIDATED_BY_PIXEL_AVERAGES',
       'human_creative_approval':'PENDING','rights':'PENDING',
       'warning':'Unexpected luma changes and missing energy peaks are review hints, not automatic art fail/pass.'
    }

def cli():
    ap=argparse.ArgumentParser()
    ap.add_argument('mp4',type=Path)
    ap.add_argument('--expected-frames',type=int)
    ap.add_argument('--cues',type=Path,help='Local JSON list of authored cue/frame/why, not a URL')
    ap.add_argument('--output',type=Path)
    opt=ap.parse_args()
    cues=json.loads(opt.cues.read_text(encoding='utf-8')) if opt.cues else None
    report=audit(opt.mp4,opt.expected_frames,cues)
    output=json.dumps(report,ensure_ascii=False,indent=2)
    if opt.output:
        opt.output.parent.mkdir(exist_ok=True,parents=True)
        opt.output.write_text(output,encoding='utf-8')
    print(output)

if __name__=='__main__':cli()

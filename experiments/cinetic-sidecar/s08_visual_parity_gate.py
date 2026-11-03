#!/usr/bin/env python3
"""Reference-image parity gate for a private S08 fast-APP visual baseline.

This generic script never downloads, uploads, prints, or publishes private
frames; it compares two local videos supplied by the protected runner.
Numeric similarity does NOT imply user art approval or legal/Premiere PASS.
"""
import argparse
import json
import subprocess
from pathlib import Path

WIDTH, HEIGHT, FRAMES = 540, 960, 95
FRAME_BYTES = WIDTH * HEIGHT * 3
KEY_FRAMES = (45,47,48,49,50,51,52,53,66,68,69,70,71,72,73,74)
ROIS = {'card':(82,458,263,568),'road':(50,488,720,790),'full':(0,540,0,960)}
LIMITS = {'card':10.0,'road':3.0,'full':7.0}

def read_exact(source,size):
    parts=[]
    while size>0:
        buf=source.read(size)
        if not buf: raise ValueError('BAD_FRAME_COUNT_OR_DECODE')
        size-=len(buf);parts.append(buf)
    return b''.join(parts)

def decode_selected(path):
    # An actual all-frame FFmpeg decoder, with no shell, remote URL or logging
    # of the source bytes. The caller supplies only local private paths.
    cmd=['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-i',str(path),
        '-f','rawvideo','-pix_fmt','rgb24','-vsync','0','pipe:1']
    selected={}
    with subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE) as proc:
        for frame in range(FRAMES):
            data=read_exact(proc.stdout,FRAME_BYTES)
            if frame in KEY_FRAMES: selected[frame]=data
        if proc.stdout.read(1): raise ValueError('EXTRA_VIDEO_FRAMES')
        if proc.wait(timeout=15)!=0: raise ValueError('PRIVATE_VIDEO_DECODE_FAILED')
    if len(selected)!=len(KEY_FRAMES): raise ValueError('REVIEW_FRAME_SET_INCOMPLETE')
    return selected

def roi_error(reference,candidate,region):
    x1,x2,y1,y2=region
    if len(reference)!=FRAME_BYTES or len(candidate)!=FRAME_BYTES:
        raise ValueError('INVALID_RAW_FRAME_DIMENSIONS')
    stride=WIDTH*3
    total=0
    for y in range(y1,y2):
        offset=y*stride+x1*3
        for a,b in zip(reference[offset:offset+(x2-x1)*3],
                       candidate[offset:offset+(x2-x1)*3]):
            total+=abs(a-b)
    return total/((x2-x1)*(y2-y1)*3)

def compare(reference,candidate):
    if set(reference)!=set(KEY_FRAMES) or set(candidate)!=set(KEY_FRAMES):
        raise ValueError('MISSING_FRAMES')
    return {key:round(sum(roi_error(reference[i],candidate[i],roi)
                   for i in KEY_FRAMES)/len(KEY_FRAMES),3) for key,roi in ROIS.items()}

def main():
    p=argparse.ArgumentParser()
    p.add_argument('reference',type=Path)
    p.add_argument('candidate',type=Path)
    p.add_argument('--report',required=True,type=Path)
    args=p.parse_args()
    if not args.reference.is_file() or not args.candidate.is_file():
        raise ValueError('LOCAL_REFERENCE_AND_CANDIDATE_REQUIRED')
    metrics=compare(decode_selected(args.reference),decode_selected(args.candidate))
    passed=all(metrics[k]<=LIMITS[k] for k in LIMITS)
    result={'schema':'s08-fast-app-parity-v1','reference':'v22r-local-immutable',
            'key_frame_count':len(KEY_FRAMES),'key_frames':list(KEY_FRAMES),
            'metrics_mae':metrics,'limits_mae':LIMITS,
            'numeric_parity':'PASS' if passed else 'FAIL',
            'user_art_approval':'PENDING','premiere_windows':'NOT_TESTED',
            'reminder':'Measured pixels are not complete visual or commercial approval'}
    args.report.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print('PRIVATE_PARITY_'+('NUMERIC_PASS' if passed else 'NUMERIC_FAIL'))
    if not passed: raise SystemExit(2)

if __name__=='__main__': main()

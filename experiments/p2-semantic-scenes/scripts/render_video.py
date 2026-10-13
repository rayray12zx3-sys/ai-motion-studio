#!/usr/bin/env python3
"""Offline optional R&D MP4 encoding. Requires CairoSVG, FFmpeg, local fonts.
No remote media or model inference; output is NOT artistically approved.
Default video-only because the user must authorize/attribute actual music.
"""
import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path

HERE=Path(__file__).resolve().parent.parent

def command(argv):
    return subprocess.run(argv,check=True,capture_output=True,text=True).stdout

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('film',nargs='?',choices=['board','caption'])
    ap.add_argument('--spec',type=Path,help='Explicit local ChatGPT-authored original JSON scene')
    ap.add_argument('--music-file',type=Path)
    ap.add_argument('--credits-file',type=Path)
    ap.add_argument('--music-offset',type=float,default=0)
    ap.add_argument('--smoke-frames',type=int,default=0,
                    help='R&D short proof only. Never claim full-film review for smoke.')
    opt=ap.parse_args()
    if (opt.film is None)==(opt.spec is None):
        ap.error('Choose exactly one of board, caption or --spec /local/original.json')
    if bool(opt.music_file)!=bool(opt.credits_file):
        ap.error('Music requires both local audio and explicit source/license credits')
    if opt.music_offset<0:ap.error('Music offset must be nonnegative')
    if opt.music_file:
        if not opt.music_file.is_file() or not opt.credits_file.is_file():
            ap.error('Local music/credit file missing')
        credits=opt.credits_file.read_text(encoding='utf-8')
        for required in ('Kevin MacLeod','CC BY 4.0'):
            # These proofs are specific to the established P2 licensed-music lane.
            # Other sources need a separate bounded credits verifier.
            if required not in credits:ap.error('Credits missing: '+required)
    try:
        import cairosvg
    except ImportError as e:
        raise SystemExit('R&D converter missing: install CairoSVG in this isolated execution environment') from e
    emit=['node',str(HERE/'scripts/emit-svg-frames.mjs')]
    emit+=['--spec',str(opt.spec)] if opt.spec else [opt.film]
    emit+=['--all']
    # JSON metadata is emitted by our own known script after compiler preflight.
    emitted=json.loads(command(emit))
    film_id=emitted['film']
    source=HERE/'artifacts'/film_id/'all'
    manifest=json.loads((source/'manifest.json').read_text(encoding='utf-8'))
    count=manifest['profile']['frames']
    fps=manifest['profile']['fps']
    if opt.smoke_frames:
        if opt.smoke_frames<2 or opt.smoke_frames>=count:ap.error('Smoke must be 2..frames-1')
        count=opt.smoke_frames
    target=HERE/'artifacts'/film_id/('smoke.mp4' if opt.smoke_frames else
        ('licensed_music_review.mp4' if opt.music_file else 'silent_review.mp4'))
    target.parent.mkdir(exist_ok=True,parents=True)
    if opt.spec and target.exists():
        raise FileExistsError('Preserve previous JSON-authored film; use another scene ID/version')
    args=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','image2pipe',
        '-framerate',str(fps),'-vcodec','png','-i','pipe:0']
    if opt.music_file:
        source_info=json.loads(command(['ffprobe','-v','error','-show_format',
                                         '-of','json',str(opt.music_file)]))
        duration=float(source_info['format']['duration'])
        if duration<opt.music_offset+count/fps:
            ap.error('Authorized music segment shorter than the film')
        args+=['-ss',str(opt.music_offset),'-i',str(opt.music_file),
                '-map','0:v:0','-map','1:a:0']
    args+=['-c:v','libx264','-pix_fmt','yuv420p','-preset','medium','-crf','20',
           '-r',str(fps)]
    if opt.music_file:
        args+=['-filter:a','afade=t=in:st=0:d=0.35,afade=t=out:st='+
              str(max(0,count/fps-0.8))+':d=0.8,aresample=48000',
               '-c:a','aac','-b:a','192k','-ar','48000']
    else:args+=['-an']
    args+=['-frames:v',str(count),'-t',str(count/fps),'-movflags','+faststart',str(target)]
    proc=subprocess.Popen(args,stdin=subprocess.PIPE)
    try:
        last_svg=None
        last_png=None
        unique_rasterized=0
        for frame in range(count):
            src=source/(f'{frame:04d}.svg')
            svg_bytes=src.read_bytes()
            # Reuse only byte-for-byte IDENTICAL consecutive authored frames.
            # Never infer visual equality: motion and type pixels stay unchanged.
            if svg_bytes==last_svg:
                png=last_png
            else:
                png=cairosvg.svg2png(bytestring=svg_bytes,
                                     output_width=manifest['profile']['width'],
                                     output_height=manifest['profile']['height'])
                last_svg=svg_bytes
                last_png=png
                unique_rasterized+=1
            proc.stdin.write(png)
        print('Rasterization: actual frames',count,
              'unique consecutive SVG rasterizations',unique_rasterized,flush=True)
    except Exception:
        proc.kill()
        raise
    finally:
        proc.stdin.close()
    if proc.wait()!=0:raise RuntimeError('FFmpeg frame export failed')
    meta=json.loads(command(['ffprobe','-v','error','-count_frames',
                             '-show_streams','-show_format','-of','json',str(target)]))
    stream=next(s for s in meta['streams'] if s['codec_type']=='video')
    assert stream['codec_name']=='h264'
    assert (stream['width'],stream['height'])==(manifest['profile']['width'],manifest['profile']['height'])
    assert int(stream['nb_read_frames'])==count
    assert stream['avg_frame_rate']==str(fps)+'/1' or float(stream['r_frame_rate'].split('/')[0])/float(stream['r_frame_rate'].split('/')[1])==fps
    if opt.music_file:assert any(s['codec_name']=='aac' for s in meta['streams'])
    else:assert not any(s['codec_type']=='audio' for s in meta['streams'])
    proof={
        'film':film_id,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),
        'frames':count,'fps':fps,'codec':stream['codec_name'],
        'audio':'LOCALLY_LICENSED_INPUT_NEEDS_AUDITION' if opt.music_file else 'NONE',
        'music_offset':opt.music_offset if opt.music_file else None,
        'referenceParity':'NOT_CLAIMED','art':'PENDING_HUMAN',
        'fullSpeedWatched':False,'musicAuditioned':False,
        'fontPixelPortability':'UNVERIFIED', 'output':target.name,
        'rights':'PENDING_FULL_OUTPUT_REVIEW',
    }
    (target.parent/(target.stem+'-qc.json')).write_text(json.dumps(proof,indent=2))
    print(json.dumps(proof,indent=2))

if __name__=='__main__': main()

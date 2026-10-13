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
    ap.add_argument('--widescreen',action='store_true',
                    help='Opt-in 1920x1080 split editorial R&D output (source scene spec remains unchanged)')
    ap.add_argument('--native-landscape',action='store_true',
                    help='Opt-in 1920x1080 native landscape scene layout (isolated experimental path)')
    ap.add_argument('--music-file',type=Path)
    ap.add_argument('--credits-file',type=Path)
    ap.add_argument('--music-offset',type=float,default=0)
    ap.add_argument('--smoke-frames',type=int,default=0,
                    help='R&D short proof only. Never claim full-film review for smoke.')
    ap.add_argument('--review-package',action='store_true',
                    help='Produce authored cues, decoded-MP4 audit and a reproducible local review manifest')
    opt=ap.parse_args()
    if (opt.film is None)==(opt.spec is None):
        ap.error('Choose exactly one of board, caption or --spec /local/original.json')
    if bool(opt.music_file)!=bool(opt.credits_file):
        ap.error('Music requires both local audio and explicit source/license credits')
    if opt.music_offset<0:ap.error('Music offset must be nonnegative')
    if opt.widescreen and opt.native_landscape:
        ap.error('Choose only one experimental landscape renderer')
    if opt.review_package and opt.smoke_frames:
        ap.error('A review package requires the complete film, not smoke frames')
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
    emitter=('emit-native-landscape-frames.mjs' if opt.native_landscape else
             'emit-widescreen-frames.mjs' if opt.widescreen else 'emit-svg-frames.mjs')
    emit=['node',str(HERE/'scripts'/emitter)]
    emit+=['--spec',str(opt.spec)] if opt.spec else [opt.film]
    emit+=['--all']
    # JSON metadata is emitted by our own known script after compiler preflight.
    emitted=json.loads(command(emit))
    film_id=emitted['film']
    source=HERE/'artifacts'/film_id/('native-landscape-all' if opt.native_landscape else
                                      'widescreen-all' if opt.widescreen else 'all')
    manifest=json.loads((source/'manifest.json').read_text(encoding='utf-8'))
    count=manifest['profile']['frames']
    fps=manifest['profile']['fps']
    if opt.smoke_frames:
        if opt.smoke_frames<2 or opt.smoke_frames>=count:ap.error('Smoke must be 2..frames-1')
        count=opt.smoke_frames
    target=HERE/'artifacts'/film_id/(('native_landscape_' if opt.native_landscape else
                                      'widescreen_' if opt.widescreen else '')+
        ('smoke.mp4' if opt.smoke_frames else
        ('licensed_music_review.mp4' if opt.music_file else 'silent_review.mp4')))
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
    if opt.review_package:
        # Reuse the original semantic contract and existing ALL-FRAME media
        # analyzer; do not invent a second QA implementation or an art verdict.
        spec_args=['--spec',str(opt.spec)] if opt.spec else [opt.film]
        command(['node',str(HERE/'scripts/score-cues.mjs'),*spec_args])
        cue_path=target.parent/'score-cues.json'
        if not cue_path.is_file():
            raise RuntimeError('Review incomplete: authored score cues missing')
        audit_path=target.parent/(target.stem+'-av-audit.json')
        command([sys.executable,str(HERE/'scripts/av_audit.py'),str(target),
                 '--expected-frames',str(count),'--cues',str(cue_path),
                 '--output',str(audit_path)])
        audited=json.loads(audit_path.read_text(encoding='utf-8'))
        if audited.get('technical_decode')!='PASS' or audited.get('sha256')!=proof['sha256'] or (
            audited.get('video',{}).get('decoded_frames')!=count):
            raise RuntimeError('Review incomplete: post-render decoded media evidence mismatch')
        review={
            'schema':'p2-local-review-package-v1','film':film_id,
            'spec_sha256':hashlib.sha256(opt.spec.read_bytes()).hexdigest() if opt.spec else None,
            'render_manifest_sha256':hashlib.sha256((source/'manifest.json').read_bytes()).hexdigest(),
            'video_filename':target.name,'video_sha256':proof['sha256'],
            'cue_filename':cue_path.name,'audit_filename':audit_path.name,
            'full_film_frames':count,'fps':fps,'technical_decode':'PASS',
            'human_creative_approval':'PENDING','reference_quality':'NOT_VALIDATED',
            'rights':'PENDING','music_audition':'PENDING' if opt.music_file else 'NO_AUDIO',
            'drive_preview_delivery':'NOT_PERFORMED_BY_THIS_LOCAL_COMMAND',
            'notes':'Synthetic original-only local R&D. Review manifest never proves artistic quality, source rights or a browser-playable Drive upload.'
        }
        # The manifest is written LAST: do not signal delivery if cue generation
        # or the actual independent H.264 decode failed.
        (target.parent/(target.stem+'-review-package.json')).write_text(
            json.dumps(review,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(proof,indent=2))

if __name__=='__main__': main()

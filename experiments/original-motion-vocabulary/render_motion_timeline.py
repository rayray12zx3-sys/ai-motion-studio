#!/usr/bin/env python3
"""Original-only motion graphics: 2-5 scene authored v1 timeline -> ACTUAL composite ProRes alpha MOV + MP4.

Opt-in isolated research. Does not edit the official production SceneSpec/Canvas renderer,
never loads external assets, and never infers artistic / rights approval from technical QC.
"""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

from PIL import Image
from render_motion import MODES, FPS, W, H, canvas, validate_spec

ID = re.compile(r'^[a-z][a-z0-9-]{0,31}$')


def compile_timeline(document):
    """Exact bounded contract; start/stop refer to actual source frames, not vague seconds."""
    if not isinstance(document, dict) or set(document) != {'version', 'kind', 'shots'}:
        raise ValueError('Exact isolated timeline fields version, kind, shots are required')
    if document['version'] != 1 or document['kind'] != 'original-motion-overlap':
        raise ValueError('Only synthetic research timeline v1 is permitted')
    shots = document['shots']
    if not isinstance(shots, list) or not 2 <= len(shots) <= 5:
        raise ValueError('2..5 authored original animated shots required')
    compiled, seen = [], set()
    cursor = 0
    for index, shot in enumerate(shots):
        if not isinstance(shot, dict) or set(shot) != {'id', 'spec', 'frames', 'overlap_in_frames'}:
            raise ValueError('Shot requires only id, spec, frames and overlap_in_frames')
        name = shot['id']
        if not isinstance(name, str) or not ID.fullmatch(name) or name in seen:
            raise ValueError('Each shot ID must be unique and non-sensitive')
        seen.add(name)
        spec = validate_spec(shot['spec'])  # forbids URLs, unknown media, unbounded text
        frames = shot['frames']
        overlap = shot['overlap_in_frames']
        if type(frames) is not int or not 75 <= frames <= int(MODES[spec['mode']][1] * FPS):
            raise ValueError('Shot length exceeds selected animation technique or 75 frame minimum')
        if type(overlap) is not int or overlap < 0 or overlap > 30 or (index == 0 and overlap):
            raise ValueError('Only inbound <=30f overlaps; first shot overlap must be zero')
        if index and overlap >= min(frames, compiled[-1]['frames']) // 2:
            raise ValueError('Overlap would destroy the distinct semantic action of a shot')
        start = cursor - overlap
        compiled.append({'id': name, 'mode': spec['mode'], 'spec': spec,
                         'start_frame': start, 'end_exclusive': start + frames,
                         'frames': frames, 'overlap_in_frames': overlap})
        cursor = start + frames
    if not 150 <= cursor <= 600:
        raise ValueError('Synthetic R&D video must be between 5s and 20s')
    return {'schema': 'original-mg-overlap-v1', 'profile': {'width': W, 'height': H, 'fps': FPS},
            'duration_frames': cursor, 'duration_seconds': cursor / FPS, 'shots': compiled,
            'input_policy': 'ORIGINAL_SYNTHETIC_ONLY', 'user_media_loaded': False,
            'art': 'PENDING_HUMAN', 'premiere_import': 'UNVERIFIED',
            'commercial_rights': 'NOT_CLEARED_BY_THIS_TECHNICAL_TEST'}


def active_frames(compiled, frame):
    active = [s for s in compiled['shots'] if s['start_frame'] <= frame < s['end_exclusive']]
    if len(active) > 2:
        raise RuntimeError('Unexpected triple visual overlap')
    return active


def render_frame(compiled, frame):
    if type(frame) is not int or not 0 <= frame < compiled['duration_frames']:
        raise ValueError('Actual frame seek out of range')
    shots = active_frames(compiled, frame)
    if not shots:
        raise RuntimeError('Gap in scene timeline')
    layers = []
    for s in shots:
        elapsed = frame - s['start_frame']
        t = elapsed / FPS
        frame_image = canvas()
        MODES[s['mode']][0](frame_image, t, s['spec'])
        # Fade on the inbound overlap by explicitly scaling ORIGINAL alpha.
        if s['overlap_in_frames'] and elapsed < s['overlap_in_frames']:
            q = (elapsed + 1) / (s['overlap_in_frames'] + 1)
            p = q * q * (3 - 2 * q)
            original_alpha = frame_image.getchannel('A')
            original_alpha = original_alpha.point(lambda v: int(v * p))
            frame_image.putalpha(original_alpha)
        # Fade the older scene out as the following scene enters.
        next_idx = compiled['shots'].index(s) + 1
        if next_idx < len(compiled['shots']):
            nxt = compiled['shots'][next_idx]
            if frame >= nxt['start_frame']:
                overlap = nxt['overlap_in_frames']
                q = (frame - nxt['start_frame'] + 1) / (overlap + 1)
                p = q * q * (3 - 2 * q)
                original_alpha = frame_image.getchannel('A')
                frame_image.putalpha(original_alpha.point(lambda v: int(v * (1 - p))))
        layers.append(frame_image)
    result = canvas()
    for img in layers:
        result = Image.alpha_composite(result, img)
    return result


def _probe(path, expected, alpha):
    data = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-count_frames',
        '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,nb_read_frames,pix_fmt',
        '-of', 'json', str(path)], timeout=60))['streams'][0]
    assert (data['width'], data['height'], data['r_frame_rate'], int(data['nb_read_frames'])) == (W, H, '30/1', expected)
    if alpha:
        assert data['codec_name'] == 'prores' and data['pix_fmt'].startswith('yuva'), data
    else:
        assert data['codec_name'] == 'h264', data
    return {'codec': data['codec_name'], 'width': W, 'height': H, 'fps': FPS,
            'decoded_frames': expected, 'pixel_format': data['pix_fmt'],
            'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}


def make_movie(compiled, dest):
    if dest.exists():
        raise FileExistsError('Refusing to overwrite any prior reviewer output')
    dest.mkdir(parents=True)
    total = compiled['duration_frames']
    movie = dest / 'timeline_ALPHA.mov'
    preview = dest / 'timeline_PREVIEW.mp4'
    # Raw RGBA FFmpeg stream -> true 4:4:4:4 ProRes, never a flat 9:16 screenshot.
    args = ['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgba',
            '-s',f'{W}x{H}','-r',str(FPS),'-i','pipe:0','-an','-c:v','prores_ks',
            '-profile:v','4','-pix_fmt','yuva444p10le','-alpha_bits','16',str(movie)]
    with (dest/'encode.stderr').open('wb') as err:
        proc = subprocess.Popen(args, stdin=subprocess.PIPE, stderr=err)
        samples = []
        try:
            for frame in range(total):
                image = render_frame(compiled, frame)
                proc.stdin.write(image.tobytes())
                if frame in {0, total//4, total//2, 3*total//4, total-1} or any(
                    frame in {s['start_frame'],s['end_exclusive']-1} for s in compiled['shots']):
                    tiny = image.resize((54,96))
                    samples.append({'frame':frame, 'shot_ids':[s['id'] for s in active_frames(compiled,frame)],
                                    'small_rgba_sha256':hashlib.sha256(tiny.tobytes()).hexdigest(),
                                    'has_transparency':tiny.getchannel('A').getextrema()[0] == 0,
                                    'has_visible_pixels':tiny.getchannel('A').getextrema()[1] > 0})
            proc.stdin.close()
            if proc.wait(timeout=240):
                raise RuntimeError('Alpha encode failed: '+(dest/'encode.stderr').read_text()[-1200:])
        except BaseException:
            if proc.stdin and not proc.stdin.closed:
                proc.stdin.close()
            proc.kill()
            proc.wait()
            raise
    # Show an original, literal neutral background only in the REVIEW MP4.
    duration = f'{total/FPS:.6f}'
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','lavfi',
        '-i',f'color=c=0x142035:s={W}x{H}:r={FPS}:d={duration}', '-i',str(movie),
        '-filter_complex','[0:v][1:v]overlay=shortest=1:format=auto,format=yuv420p[v]',
        '-map','[v]','-frames:v',str(total),'-an','-c:v','libx264','-preset','veryfast',
        '-crf','23','-movflags','+faststart',str(preview)],check=True,timeout=240)
    compiled['media'] = {'alpha_mov':_probe(movie,total,True), 'preview_mp4':_probe(preview,total,False)}
    compiled['samples'] = sorted(samples, key=lambda x:x['frame'])
    compiled['technical_gate'] = 'TECH_PASS'
    # The framework deliberately cannot mark an original-only sample ART_PASS.
    (dest/'timeline_manifest.json').write_text(json.dumps(compiled,ensure_ascii=False,indent=2)+'\n')
    return compiled


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--plan',required=True,type=Path)
    ap.add_argument('--out',required=True,type=Path)
    ap.add_argument('--dry-run',action='store_true')
    a=ap.parse_args()
    if not a.plan.is_file() or a.plan.stat().st_size>8192:
        raise ValueError('Small local original-only JSON timeline required')
    document=json.loads(a.plan.read_text())
    compiled=compile_timeline(document)
    result=compiled if a.dry_run else make_movie(compiled,a.out)
    print(json.dumps({'frames':result['duration_frames'],'shots':len(result['shots']),
        'art':result['art'],'technical_gate':result.get('technical_gate','NOT_RENDERED'),
        'output':str(a.out)},ensure_ascii=False))

if __name__=='__main__':main()

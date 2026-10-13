#!/usr/bin/env python3
"""Agent-authored bounded motion plan → original-only full preview + alpha layers.
No text-to-video AI API, no external media loader, no claim/art approval.
"""
import argparse,hashlib,json,re,subprocess
from pathlib import Path
from render_motion import MODES,FPS,render_one,validate_spec

ID_RE=re.compile(r'^[a-z][a-z0-9-]{0,31}$')

def compile_director_plan(plan):
    if not isinstance(plan,dict) or set(plan)!={'version','shots'} or plan['version']!=1:
        raise ValueError('Expected original-only director plan v1')
    shots=plan['shots']
    if not isinstance(shots,list) or not 2<=len(shots)<=8:
        raise ValueError('Director plan must contain 2..8 motion-graphics shots')
    ids=set();compiled=[];total=0
    for shot in shots:
        if not isinstance(shot,dict) or set(shot)!={'id','spec'}:
            raise ValueError('Each motion shot needs id and bounded spec only')
        identifier=shot['id']
        if not isinstance(identifier,str) or not ID_RE.fullmatch(identifier) or identifier in ids:
            raise ValueError('Invalid or duplicate shot ID')
        ids.add(identifier)
        spec=validate_spec(shot['spec'])
        frames=int(MODES[spec['mode']][1]*FPS)
        compiled.append({'id':identifier,'mode':spec['mode'],'start_frame':total,
            'end_frame_exclusive':total+frames,'frames':frames,'spec':spec})
        total+=frames
    if total>1200:raise ValueError('R&D director plan exceeds bounded 40s review')
    return {'schema':'original-director-motion-plan-v1','fps':FPS,'width':1080,'height':1920,
        'duration_frames':total,'duration_seconds':total/FPS,'shots':compiled,
        'creative_gate':'PENDING_HUMAN','technical_media_gate':'NOT_RENDERED',
        'input_policy':'ORIGINAL_SYNTHETIC_ONLY','right_to_publish':'NOT_GRANTED_BY_TECH_QC'}

def verify_full(path,frames):
    data=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames',
        '-show_entries','stream=codec_name,width,height,r_frame_rate,nb_read_frames','-of','json',str(path)]))['streams'][0]
    if data['codec_name']!='h264' or data['width']!=1080 or data['height']!=1920 or data['r_frame_rate']!='30/1' or int(data['nb_read_frames'])!=frames:
        raise RuntimeError('Combined director preview failed actual all-frame decode')
    return {'codec':data['codec_name'],'frames':int(data['nb_read_frames']),
       'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'status':'TECH_PASS'}

def run(plan,out,render=True):
    compiled=compile_director_plan(plan)
    if not render:return compiled
    if out.exists():raise FileExistsError('Will not overwrite a review package')
    out.mkdir(parents=True)
    manifest=out/'director_manifest.json'
    manifest.write_text(json.dumps(compiled,indent=2,ensure_ascii=False))
    previews=[]
    for entry in compiled['shots']:
        folder=out/entry['id']
        render_one(entry['spec'],folder)
        previews.append(folder/(entry['mode']+'_PREVIEW.mp4'))
    listfile=out/'_synthetic_concat.txt'
    listfile.write_text(''.join("file '"+str(path.resolve())+"'\n" for path in previews))
    master=out/'director_full_preview.mp4'
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0',
        '-i',str(listfile),'-c','copy','-movflags','+faststart',str(master)],check=True,timeout=90)
    compiled['actual_video']=verify_full(master,compiled['duration_frames'])
    compiled['technical_media_gate']='TECH_PASS'
    manifest.write_text(json.dumps(compiled,indent=2,ensure_ascii=False))
    return compiled

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--plan',type=Path,required=True)
    p.add_argument('--out',type=Path,required=True)
    p.add_argument('--dry-run',action='store_true')
    a=p.parse_args()
    if not a.plan.is_file() or a.plan.stat().st_size>8192:raise ValueError('Local bounded original-only plan required')
    plan=json.loads(a.plan.read_text())
    result=run(plan,a.out,not a.dry_run)
    print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=='__main__':main()

#!/usr/bin/env bash
set -euo pipefail
mkdir -p artifacts
echo "::group::Fetch composer's declared original catalog (do not guess mp3 filenames)"
curl --fail --location --silent --show-error --retry 2 --connect-timeout 12 --max-time 45 \
  "https://incompetech.com/music/royalty-free/pieces.json" --output /tmp/incompetech-pieces.json
python3 - <<'PY'
import json
d=json.load(open('/tmp/incompetech-pieces.json'))
print('Catalog type:', type(d).__name__, 'count:',len(d))
def walk(v):
 if isinstance(v,dict):
  if str(v.get('title','')).strip().lower() in ('cipher','floating cities'):
   print('Matching original track:',repr(v)[:1100])
  for x in v.values():walk(x)
 elif isinstance(v,list):
  for x in v:walk(x)
walk(d)
PY
echo "::endgroup::"
python3 - <<'PY'
import json,subprocess,os,urllib.parse
d=json.load(open('/tmp/incompetech-pieces.json'))
matches={}
def walk(v):
 if isinstance(v,dict):
  title=str(v.get('title','')).strip().lower()
  if title in ('cipher','floating cities') and isinstance(v.get('filename'),str):
   matches[title]=v['filename']
  for x in v.values():walk(x)
 elif isinstance(v,list):
  for x in v:walk(x)
walk(d)
for title,name in [('cipher','ARC_Cipher'),('floating cities','FOCUS_Floating_Cities')]:
 raw=matches.get(title)
 if not raw or '/' in raw or '\\' in raw or not raw.lower().endswith('.mp3'):raise SystemExit('Catalog is missing safe official filename for '+title)
 url='https://incompetech.com/music/royalty-free/mp3-royaltyfree/'+urllib.parse.quote(raw)
 print('Fetching official catalog file',title,raw,flush=True)
 subprocess.run(['curl','--fail','--location','--silent','--show-error','--retry','2','--connect-timeout','12','--max-time','90',url,'--output',f'artifacts/{name}.mp3'],check=True)
 if os.path.getsize(f'artifacts/{name}.mp3')<100000:raise SystemExit('MP3 file unexpectedly small: '+name)
 subprocess.run(['ffprobe','-v','error','-select_streams','a:0','-show_entries','stream=codec_name,sample_rate,channels,duration','-of','default=noprint_wrappers=1',f'artifacts/{name}.mp3'],check=True)
import hashlib
for p in sorted(__import__('pathlib').Path('artifacts').glob('*.mp3')):
 print('SHA256',p.name,hashlib.sha256(p.read_bytes()).hexdigest())
PY
cp MUSIC-CREDITS.md artifacts/MUSIC-CREDITS.md

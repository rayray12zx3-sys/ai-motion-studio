from playwright.sync_api import sync_playwright
from pathlib import Path
import json
base=Path(__file__).resolve().parents[1]
html=(base/'examples/orbital-circuit-lab.html').read_text()
for name in ('gsap.min.js','MorphSVGPlugin.min.js','DrawSVGPlugin.min.js','MotionPathPlugin.min.js'):
 js=(base/'node_modules/gsap/dist'/name).read_text()
 html=html.replace(f'<script src="../node_modules/gsap/dist/{name}"></script>',f'<script>\n{js}\n</script>')
spatial=(base/'src/spatial-graph.mjs').read_text().replace('export function ','function ')
stage=(base/'src/svg-stage.mjs').read_text().replace("import {transformPoint} from './spatial-graph.mjs';",'').replace('export function ','function ')
html=html.replace("import {compileSpatialGraph,auditFrameRange,auditBeatPlan} from '../src/spatial-graph.mjs';", spatial)
engine=(base/'src/scene-engine.mjs').read_text().replace('export const ', 'const ').replace('export function ','function ').replace('finite(', 'engineFinite(').replace('const finite=', 'const engineFinite=')
bridge=(base/'src/tech-stage-bridge.mjs').read_text().replace("import {createMotionEngine} from './scene-engine.mjs';",'').replace("import {createSvgStage} from './svg-stage.mjs';",'').replace('export function ','function ')
html=html.replace("import {createCodedSpatialStage} from '../src/tech-stage-bridge.mjs';", engine+'\n'+stage+'\n'+bridge)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-background-networking'])
 page=browser.new_page(viewport={'width':950,'height':1700})
 errors=[];warnings=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:warnings.append(m.text[:220]) if m.type in ('error','warning') else None)
 page.set_content(html,wait_until='load')
 page.wait_for_function('window.motionTechAudit !== undefined',timeout=13000)
 baseline={}
 for frame in [0,45,90,150,230,299]:
  info=page.evaluate('(f)=>window.seekFrame(f)',frame)
  baseline[str(frame)]=dict(issues=info['issues'],path=page.locator('#heroPath').get_attribute('d')[:100],satellite=page.locator('#satelliteSprite').get_attribute('transform'))
  page.locator('svg').screenshot(path=str(base/'examples'/f'frame-{frame:03}.png'))
 # Random-access video frames MUST be identical independent of seek order.
 page.evaluate('(f)=>window.seekFrame(f)',130)
 afterA=page.locator('#heroPath').get_attribute('d')
 page.evaluate('(f)=>window.seekFrame(f)',20)
 page.evaluate('(f)=>window.seekFrame(f)',130)
 afterB=page.locator('#heroPath').get_attribute('d')
 # Re-seeking must reproduce the *same rendered SVG image*, not just the path data.
 import hashlib
 shotA=page.locator('svg').screenshot()
 page.evaluate('(f)=>window.seekFrame(f)',8)
 page.evaluate('(f)=>window.seekFrame(f)',130)
 shotB=page.locator('svg').screenshot()
 full=page.evaluate('''() => {let bad=[], paths=new Set(), positions=new Set();for(let i=0;i<300;i++){const r=window.seekFrame(i);if(r.issues.length)bad.push({frame:i,issues:r.issues});paths.add(document.querySelector('#heroPath').getAttribute('d'));positions.add(document.querySelector('#satelliteFollower').getAttribute('transform'));}return {checkedFrames:300,issues:bad,distinctMorphShapes:paths.size,distinctOrbitPositions:positions.size};}''')
 data={'meta':page.evaluate('window.motionTechAudit'),'frames':baseline,'fullAudit':full,'seekOrderStable':afterA==afterB,'screenshotOrderStable':hashlib.sha256(shotA).hexdigest()==hashlib.sha256(shotB).hexdigest(),'warnings':warnings,'errors':errors}
 print(json.dumps(data,indent=2))
 (base/'browser-evidence.json').write_text(json.dumps(data,indent=2))
 browser.close()
 if warnings or errors or not data['seekOrderStable'] or not data['screenshotOrderStable'] or data['fullAudit']['issues'] or data['fullAudit']['distinctMorphShapes']<50 or data['fullAudit']['distinctOrbitPositions']<50 or any(v['issues'] for v in baseline.values()):
  raise SystemExit(1)

// Research-only source Canvas PNG samples from an original, asset-free v2 fixture.
// No v1 editor integration, user scene reading, video encoder, or network access.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {parseGeometryV2Scene,resizeGeometryV2Rect} from '../experiments/editor-geometry-v2/scene.mjs';
import {projectGeometryV2Frame} from '../experiments/editor-geometry-v2/geometry.mjs';
import {drawGeometryV2Frame} from '../experiments/editor-geometry-v2/paint.mjs';

const sha=data=>createHash('sha256').update(data).digest('hex');
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const runId=process.argv[2];
if(process.argv.length!==3||!/^[a-z][a-z0-9-]{0,39}$/.test(runId))
 throw Error('Usage: node scripts/preview-geometry-v2.mjs <unique-safe-run-id>');
const fixture=readFileSync(join(root,'experiments/editor-geometry-v2/original-synthetic.json'),'utf8');
const scene=parseGeometryV2Scene(fixture);
const dir=join(root,'out','geometry-v2-'+runId);
if(existsSync(dir))throw Error('Refusing to overwrite a previous v2 review folder');
mkdirSync(dir,{recursive:true});
const images=[];
const sample=(name,document,frame,output)=>{
 const pic=drawGeometryV2Frame(document,frame,{output});
 const png=pic.toBuffer('image/png'),bytes=Buffer.from(pic.getContext('2d').getImageData(
  0,0,pic.width,pic.height).data);
 writeFileSync(join(dir,name+'.png'),png);
 images.push({file:name+'.png',frame,output,png_sha256:sha(png),rgba_sha256:sha(bytes)});
};
for(const frame of [0,15,30,45,59]){
 sample('opaque-'+frame,scene,frame,'opaque');
 sample('alpha-'+frame,scene,frame,'transparent');
}
const resized=resizeGeometryV2Rect(scene,'panel',{width:.32,height:.12});
sample('comparison-narrow-panel',resized,30,'opaque');
const projection=projectGeometryV2Frame(scene,30);
const report={
 kind:'ISOLATED_GEOMETRY_V2_RESEARCH_ONLY',
 source_fixture:'experiments/editor-geometry-v2/original-synthetic.json',
 source_sha256:sha(Buffer.from(fixture)),
 fps:scene.fps,frames:scene.duration_frames,canvas:scene.canvas,
 samples:images,source_projection:projection,
 rect_geometry_verified_by_unit_tests:true,
 browser_konva_render_verified:false,
 text_pixel_parity_verified:false,
 video_export_verified:false,
 premiere_verified:false,
 human_creative_approval:false,
 v1_schema_or_renderer_modified:false
};
writeFileSync(join(dir,'review-report.json'),JSON.stringify(report,null,2)+'\n');
console.log('GEOMETRY_V2_RESEARCH_PREVIEW',JSON.stringify({
 location:'out/geometry-v2-'+runId,frames:scene.duration_frames,images:images.length,
 source_sha256:report.source_sha256,output_approval:'UNAPPROVED_RESEARCH_ONLY'
}));

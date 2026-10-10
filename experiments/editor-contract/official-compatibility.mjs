// Isolated S4 contract audit only: no root renderer/CLI modifications or production adapter.
// Deliberately refuses any claim of pixel parity or full scene roundtrip.
import {profiles,validateSpec} from '../../src/free/scene.mjs';
import {validateEditableScene} from './scene.mjs';

const officialKeys=Object.freeze(['landscape','vertical','smoke']);
const lostFeatures=Object.freeze([
 'object-identity-and-z-order','rectangles-and-custom-shapes','independent-clip-timing',
 'per-object-keyframe-timing-and-easing','position-scale-rotation-opacity',
 'per-layer-colors-and-style','neutral-background-and-composition',
 'exact-rendered-pixels','transparent-export-semantics'
]);
const equal=(a,b)=>a===b;
function checkProfile(key){
 if(typeof key!=='string'||!officialKeys.includes(key)||
    !Object.hasOwn(profiles,key))throw Error('Unknown official render profile');
 return profiles[key];
}
function changed(keys){
 return keys.some((key,i)=>i>0&&['x','y','scale','rotation','opacity'].some(field=>key[field]!==keys[0][field]));
}
export function inspectOfficialSceneGap(scene,profileName){
 validateEditableScene(scene);
 const target=checkProfile(profileName);
 const sizeMatches=equal(scene.canvas.width,target.width)&&equal(scene.canvas.height,target.height);
 const fpsMatches=scene.fps===target.fps;
 const durationMatches=scene.duration_frames===target.frames;
 const text=scene.layers.filter(layer=>layer.type==='text');
 const shape=scene.layers.filter(layer=>layer.type==='rect');
 const animated=scene.layers.filter(layer=>changed(layer.keys));
 const trimmed=scene.layers.filter(layer=>layer.start_frame!==0||layer.end_frame!==scene.duration_frames);
 const perObjectEasing=scene.layers.filter(layer=>layer.keys.some(key=>key.ease==='ease-out-cubic'));
 const namedTextSlots=text.length===2&&text.some(l=>l.id==='title')&&text.some(l=>l.id==='subtitle');
 return {
  kind:'OFFICIAL_SCENE_GAP_AUDIT_V1',
  profile:profileName,
  target:{width:target.width,height:target.height,fps:target.fps,frames:target.frames},
  neutral:{width:scene.canvas.width,height:scene.canvas.height,fps:scene.fps,frames:scene.duration_frames},
  profile_checks:{dimensions:sizeMatches,fps:fpsMatches,duration:durationMatches},
  scene_summary:{layers:scene.layers.length,text_layers:text.length,rect_layers:shape.length,
   animated_layer_ids:animated.map(x=>x.id).sort(),
   partial_clip_ids:trimmed.map(x=>x.id).sort(),
   individual_ease_ids:perObjectEasing.map(x=>x.id).sort(),
   named_official_copy_slots:namedTextSlots},
  official_api:{
   text_fields:['title','subtitle'],
   layout:'FIXED_INTERNAL_CANVAS_GRAPHICS',
   motion:'FIXED_GLOBAL_TIME_CURVES',
   background:'FIXED_GRADIENT',
   font:'LOCKED_FONT_FILES',
   arbitrary_object_tracks:false
  },
  parity_status:'NOT_PROVEN_NO_SHARED_GEOMETRY',
  possible_draft_bridge:'COPY_ONLY_WITH_EXPLICIT_LOSS_ACK',
  mandatory_visual_losses:[...lostFeatures],
  production_schema_changed:false,
  production_renderer_changed:false
 };
}
export function projectOfficialCopyOnly(scene,{acknowledgeVisualLosses=false}={}){
 validateEditableScene(scene);
 if(acknowledgeVisualLosses!==true)throw Error('Explicit irreversible visual-loss acknowledgement required');
 const text=scene.layers.filter(layer=>layer.type==='text');
 if(text.length!==2||text.some(l=>!['title','subtitle'].includes(l.id))||
   text.filter(l=>l.id==='title').length!==1||text.filter(l=>l.id==='subtitle').length!==1)
  throw Error('Exactly two explicitly named title/subtitle text layers required');
 const fields={
  title:text.find(l=>l.id==='title').text,
  subtitle:text.find(l=>l.id==='subtitle').text
 };
 // The actual unchanged official production font/text gate is authoritative.
 validateSpec(fields);
 return {
  kind:'COPY_ONLY_RND_NOT_SCENE_CONVERSION',
  official_text_candidate:{title:fields.title,subtitle:fields.subtitle},
  dropped_scene_features:[...lostFeatures],
  pixel_parity_claim:false,
  video_delivery_approved:false,
  official_renderer_changed:false
 };
}

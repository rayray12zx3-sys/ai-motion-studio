// Non-blocking, pure-data animation review advisory for existing S1 v1 scenes.
// Never modifies scenes, clip timing, interpolation, render output or QA pass/fail.
import {validateEditableScene} from './scene.mjs';

export function auditEditableMotion(scene,{opacityThreshold=0.1}={}){
 validateEditableScene(scene);
 if(typeof opacityThreshold!=='number'||!Number.isFinite(opacityThreshold)||
    opacityThreshold<=0||opacityThreshold>=1)
  throw Error('opacityThreshold must be a finite number between 0 and 1');
 const warnings=[];
 for(const layer of scene.layers){
  const first=layer.keys[0],last=layer.keys.at(-1);
  // The first rendered frame is exactly first.key.frame, by S1 contract.
  if(layer.start_frame>0&&first.opacity>opacityThreshold){
   warnings.push({
    code:'VISIBLE_CLIP_ENTRANCE',severity:'REVIEW_ONLY',
    layer_id:layer.id,layer_type:layer.type,
    boundary_frame:layer.start_frame,
    adjacent_frame:layer.start_frame-1,
    opacity:first.opacity,
    detail:'Layer begins above the review-only opacity threshold without a fade-in.'
   });
  }
  // Half-open [start,end) intervals remove the layer at end_frame. A final
  // opaque key can therefore disappear instantly even with valid encoded frames.
  // Do NOT warn at the video endpoint: no following frame exists to observe a cut.
  if(layer.end_frame<scene.duration_frames&&last.opacity>opacityThreshold){
   warnings.push({
    code:'VISIBLE_CLIP_EXIT',severity:'REVIEW_ONLY',
    layer_id:layer.id,layer_type:layer.type,
    boundary_frame:layer.end_frame,
    adjacent_frame:layer.end_frame-1,
    opacity:last.opacity,
    detail:'Layer ends above the review-only opacity threshold and may visibly pop out.'
   });
  }
 }
 return {
  kind:'S1_CLIP_BOUNDARY_MOTION_REVIEW_ONLY',
  scene_id:scene.id,fps:scene.fps,frames:scene.duration_frames,
  opacity_threshold:opacityThreshold,
  overall:'REVIEW_ONLY_NOT_A_RELEASE_GATE',
  warnings,
  warning_count:warnings.length,
  full_frame_qc:false,technical_codec_qc:false,creative_approval:false
 };
}

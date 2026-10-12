/**
 * Integration of the real GSAP coded-motion adapter (#99) with the spatial
 * graph, svg compositor, and a single frame-absolute seek entrypoint.
 * 2D/2.5D coded-animation research only, not main Canvas/Konva production.
 */
import {createMotionEngine} from './scene-engine.mjs';
import {createSvgStage} from './svg-stage.mjs';
export function createCodedSpatialStage({graph,svg,paintLayer,gsap,MorphSVGPlugin,DrawSVGPlugin,MotionPathPlugin}){
 const stage=createSvgStage({graph,svg,paintLayer});
 stage.renderFrame(0); // all GSAP targets attached to a live SVG before registration
 const engine=createMotionEngine({gsap,MorphSVGPlugin,DrawSVGPlugin,MotionPathPlugin,fps:graph.fps,duration:graph.frames/graph.fps});
 const timeline=engine.timeline;
 const validTime=(at,seconds)=>{if(!Number.isFinite(at)||!Number.isFinite(seconds)||at<0||seconds<=0||at+seconds>graph.frames/graph.fps)throw Error('Cue outside shot timeline')};
 const checkTarget=(target)=>{
  if(!target?.getAttribute)throw Error('Target must be a real SVG child object');
  if(target.hasAttribute('data-motion-id'))throw Error('Do not tween compositor-managed group transform; target its child instead');
  if(!svg.contains(target))throw Error('Target does not belong to this stage');
  return target;
 };
 const pathMorph=(target,{shape,at,seconds,type='rotational',smooth=28,ease='sine.inOut'}={})=>{
  checkTarget(target);validTime(at,seconds);
  if(typeof shape!=='string'||!shape.trim())throw Error('Morph needs verified original destination path');
  if(!['linear','rotational'].includes(type))throw Error('Unsupported MorphSVG type');
  if(!Number.isInteger(smooth)||smooth<0||smooth>100)throw Error('Unbounded point smoothing');
  timeline.to(target,{morphSVG:{shape,type,smooth},duration:seconds,ease},at);return stageApi;
 };
 const draw=(target,{at,seconds,from='0%',to='100%',ease='power2.inOut'}={})=>{
  checkTarget(target);validTime(at,seconds);
  timeline.fromTo(target,{drawSVG:from},{drawSVG:to,duration:seconds,ease},at);return stageApi;
 };
 const orbit=(target,{path,at,seconds,autoRotate=true,ease='none'}={})=>{
  checkTarget(target);checkTarget(path);validTime(at,seconds);
  timeline.fromTo(target,{motionPath:{path,align:path,alignOrigin:[.5,.5],start:0,end:0}},
   {motionPath:{path,align:path,alignOrigin:[.5,.5],start:0,end:1,autoRotate},duration:seconds,ease},at);
  return stageApi;
 };
 const spin=(target,{at,seconds,degrees,ease='none'}={})=>{
  checkTarget(target);validTime(at,seconds);if(!Number.isFinite(degrees))throw Error('Bad spin angle');
  timeline.fromTo(target,{rotation:0},{rotation:degrees,transformOrigin:'50% 50%',duration:seconds,ease},at);return stageApi;
 };
 const seekFrame=(frame)=>{
  const state=stage.renderFrame(frame);
  engine.seekFrame(frame);
  return {frame,issues:state.issues,paintIds:state.paintIds};
 };
 const stageApi=Object.freeze({pathMorph,draw,orbit,spin,seekFrame,engine,graph});
 return stageApi;
}

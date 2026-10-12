/**
 * Isolated, code-driven GSAP motion toolkit. A small adapter developed after two
 * actually rendered V4 coded films; not the shipped Studio renderer, and not a GUI.
 * GSAP core/plugins are external version-pinned dependencies, not bundled here.
 */
export const LAYER_ORDER = Object.freeze([
  "background", "outgoing", "stage", "panel-children",
  "foreground-satellite", "annotations", "fixed-hud"
]);

function assertFinite(name, number) {
  if (typeof number !== "number" || !Number.isFinite(number)) throw Error(name + " must be finite");
}
function element(el) {
  if (!el || typeof el.setAttribute !== "function") throw Error("Expected an existing SVG element");
  return el;
}
export function validateLayerOrder(root) {
  if (!root || typeof root.querySelectorAll !== "function") throw Error("SVG root is required");
  const layers=[...root.querySelectorAll("[data-layer]")].map(el=>({id:el.id||"",order:Number(el.getAttribute("data-layer"))}));
  if (layers.some(x=>!Number.isFinite(x.order))) throw Error("Invalid layer index");
  if (layers.some((x,i)=>i>0 && x.order<layers[i-1].order)) throw Error("SVG paint order does not match declared front/back layers");
  return layers;
}
/**
 * Key architectural rules:
 * - parent grouping owns enter/exit; children stagger only within that parent;
 * - panel and its shared SVG clip geometry update in the same function;
 * - satellites are painted AFTER curves/labels that they must occlude;
 * - timeline is paused and fully seekable frame-by-frame for offline film capture.
 * No arbitrary user-provided JavaScript expressions are evaluated.
 */
export function createMotionEngine({gsap, MorphSVGPlugin, DrawSVGPlugin, MotionPathPlugin, fps=30, duration=12}) {
  if (!gsap || typeof gsap.timeline!=="function") throw Error("Actual GSAP runtime required");
  if (![MorphSVGPlugin, DrawSVGPlugin, MotionPathPlugin].every(Boolean)) throw Error("Missing licensed GSAP plugin");
  assertFinite("fps",fps); assertFinite("duration",duration);
  if(fps<=0 || duration<=0) throw Error("Positive duration/fps required");
  gsap.registerPlugin(MorphSVGPlugin,DrawSVGPlugin,MotionPathPlugin);
  const timeline=gsap.timeline({paused:true,defaults:{ease:"power3.inOut"}});
  const register=(kind, target, opts)=>{
    element(target);
    const {at,seconds}=opts; assertFinite("at",at); assertFinite("seconds",seconds);
    if(at<0 || seconds<=0 || at+seconds>duration) throw Error("Animation outside timeline");
    if(kind==="morph"){
      if(!opts.from || !opts.to) throw Error("SVG morph needs two paths");
      timeline.fromTo(target,{morphSVG:opts.from},{morphSVG:opts.to,duration:seconds},at);
    } else if(kind==="draw"){
      timeline.fromTo(target,{drawSVG:opts.from??"0%"},{drawSVG:opts.to??"100%",duration:seconds},at);
    } else if(kind==="orbit"){
      element(opts.path);
      const path=opts.path;
      timeline.fromTo(target,
        {motionPath:{path,align:path,alignOrigin:[0.5,0.5],start:0,end:0}},
        {motionPath:{path,align:path,alignOrigin:[0.5,0.5],start:0,end:1},duration:seconds,ease:"none"},at);
    } else if(kind==="group"){
      timeline.fromTo(target,{opacity:opts.from??0},{opacity:opts.to??1,duration:seconds},at);
    } else throw Error("Unknown motion primitive");
    return engine;
  };
  const engine=Object.freeze({
    timeline,
    morph:(target,opts)=>register("morph",target,opts),
    draw:(target,opts)=>register("draw",target,opts),
    orbit:(target,opts)=>register("orbit",target,opts),
    group:(target,opts)=>register("group",target,opts),
    seekSeconds:(s)=>{assertFinite("time",s);timeline.time(Math.max(0,Math.min(duration,s)),true);return timeline.time();},
    seekFrame:(f)=>{assertFinite("frame",f);if(!Number.isInteger(f)||f<0||f>Math.round(duration*fps))throw Error("Bad frame");timeline.time(f/fps,true);return timeline.time();},
    frameCount:Math.round(duration*fps),
    version:gsap.version
  });
  return engine;
}

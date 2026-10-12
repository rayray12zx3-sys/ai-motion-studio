/** Deterministic, data-driven multi-shot renderer: 3D rigs + shader handoffs. */
export function createShotStagePlayer({timeline,rigs,renderer,transition} = {}) {
  if(!timeline||typeof timeline.at!=='function'||!Array.isArray(timeline.shots))throw Error('A compiled shot timeline is required');
  if(!rigs||typeof rigs!=='object'||!renderer||typeof renderer.render!=='function')throw Error('Scene rigs and a real render adapter required');
  if(!transition||typeof transition.render!=='function')throw Error('A shader transition adapter is required');
  const known=new Map();
  for(const {rig:key} of timeline.shots){
    if(known.has(key))continue;
    const value=rigs[key];
    if(!value||typeof value.seekFrame!=='function'||!value.scene||!value.camera)throw Error('Unrecognized or incomplete 3D rig: '+key);
    if(value.fps!==timeline.fps||value.frames<timeline.frames)throw Error('Incompatible frame profile in rig '+key);
    known.set(key,value);
  }
  for(const tr of timeline.transitions){
    const from=timeline.shots.find(s=>s.id===tr.from),to=timeline.shots.find(s=>s.id===tr.to);
    if(from.rig===to.rig)throw Error('A scene-to-scene GPU transition requires distinct rigs');
  }
  const seekFrame=(frame)=>{
    const beat=timeline.at(frame);
    const current=beat.rigs.map(key=>known.get(key));
    current.forEach(rig=>rig.seekFrame(frame));
    if(current.length===1){
      if(typeof renderer.setRenderTarget==='function')renderer.setRenderTarget(null);
      renderer.render(current[0].scene,current[0].camera);
    }else if(current.length===2){
      transition.render(current[0],current[1],beat.progress);
    }else throw Error('Invalid compositor arity');
    return Object.freeze({frame,active:beat.active,rigs:beat.rigs,progress:beat.progress,weights:beat.weights,shaderProgress:current.length===2?beat.progress:0});
  };
  return Object.freeze({seekFrame,frameCount:timeline.frames,shotCount:timeline.shots.length,rigCount:known.size});
}
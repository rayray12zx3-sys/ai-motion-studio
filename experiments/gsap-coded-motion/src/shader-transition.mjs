/**
 * Original GLSL GPU scene-to-scene wipe; specific key beats only. No LFS,
 * external media, procedural random state or wall-clock derived animation.
 */
export const VERTEX=`varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position.xy,0.0,1.0);}`;
export const FRAGMENT=`precision highp float; varying vec2 vUv;
 uniform sampler2D uFrom; uniform sampler2D uTo; uniform float uProgress; uniform vec2 uResolution;
 float hash(vec2 x){return fract(sin(dot(x,vec2(127.1,311.7)))*43758.5453);}
 void main(){
   float p=clamp(uProgress,0.,1.);
   // Resolution-pinned, spatially coherent threshold instead of a muddy opacity crossfade.
   vec2 v=vUv*uResolution/720.;
   float n=hash(floor(v*4.));
   float radial=length(vUv-.5)*.38;
   float threshold=clamp((p-.12+radial-.20*n)*4.,0.,1.);
   float clean=p<=0.0?0.0:(p>=1.0?1.0:threshold*threshold*(3.-2.*threshold));
   vec4 a=texture2D(uFrom,vUv),b=texture2D(uTo,vUv);
   float edge=(1.-smoothstep(.01,.042,abs(threshold-.5)))*p*(1.-p)*2.0;
   gl_FragColor=mix(a,b,clean)+vec4(.10,.32,.30,0.)*edge;
   // Resolve linear render-target pixels with the SAME ACES + output-colorspace
   // pipeline as directly rendering either source scene to the screen.
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
 }`;
export function createShaderTransition({THREE,renderer,width,height}={}){
 if(!THREE?.WebGLRenderTarget||!THREE?.ShaderMaterial||!renderer?.render)throw Error('Three.js WebGL and renderer required');
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1)throw Error('Invalid render size');
 const targetA=new THREE.WebGLRenderTarget(width,height),targetB=new THREE.WebGLRenderTarget(width,height);
 const uniforms={uFrom:{value:targetA.texture},uTo:{value:targetB.texture},uProgress:{value:0},uResolution:{value:new THREE.Vector2(width,height)}};
 const compositor=new THREE.Scene();const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms,vertexShader:VERTEX,fragmentShader:FRAGMENT,depthTest:false,depthWrite:false}));compositor.add(quad);
 const camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
 const render=(first,second,progress)=>{
  if(!Number.isFinite(progress)||progress<0||progress>1)throw Error('Transition progress must be 0..1');
  uniforms.uProgress.value=progress;
  // All frames, INCLUDING p=0 and p=1, traverse the same render-target,
  // ShaderMaterial, tone-mapping and color-space pipeline. Bypassing this
  // compositor for single-shot frames caused a real 128/152-frame exposure pop.
  renderer.setRenderTarget(targetA);renderer.render(first.scene,first.camera);
  renderer.setRenderTarget(targetB);renderer.render(second.scene,second.camera);
  renderer.setRenderTarget(null);renderer.render(compositor,camera);
 };
 const dispose=()=>{targetA.dispose();targetB.dispose();quad.geometry.dispose();quad.material.dispose()};
 return Object.freeze({render,dispose,uniforms,compositor});
}

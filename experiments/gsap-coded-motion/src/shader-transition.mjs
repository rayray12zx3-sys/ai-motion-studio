/**
 * Original GLSL GPU scene-to-scene wipe; specific key beats only. No LFS,
 * external media, procedural random state or wall-clock derived animation.
 */
export const VERTEX=`varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position.xy,0.0,1.0);}`;
export const FRAGMENT = `precision highp float; varying vec2 vUv;
 uniform sampler2D uFrom; uniform sampler2D uTo; uniform float uProgress; uniform vec2 uResolution;
 float hash(vec2 x){return fract(sin(dot(x,vec2(127.1,311.7)))*43758.5453);}
 float smoothNoise(vec2 x){
   vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
   float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));
   return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
 }
 void main(){
   float p=clamp(uProgress,0.,1.);
   vec2 center=(vUv-.5)*vec2(uResolution.x/uResolution.y,1.);
   float radius=length(center),angle=atan(center.y,center.x);
   // Continuous distance field: no tiled/floor-discontinuous cell threshold.
   float organic=.026*sin(5.*angle+2.*p)+.025*(smoothNoise(vUv*vec2(6.,9.))-.5);
   float frontier=.19+.69*radius+organic;
   float feather=.12;
   float blend=smoothstep(frontier-feather,frontier+feather,p);
   blend=p<=0.?0.:(p>=1.?1.:blend);
   vec4 before=texture2D(uFrom,vUv),after=texture2D(uTo,vUv);
   float proximity=1.-smoothstep(.00,feather*1.35,abs(p-frontier));
   float edge=proximity*sin(3.14159265*p)*.095;
   gl_FragColor=mix(before,after,blend)+vec4(vec3(.06,.22,.24)*edge,0.);
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
  renderer.setRenderTarget(targetA);renderer.render(first.scene,first.camera);
  renderer.setRenderTarget(targetB);renderer.render(second.scene,second.camera);
  uniforms.uProgress.value=progress;renderer.setRenderTarget(null);renderer.render(compositor,camera);
 };
 const dispose=()=>{targetA.dispose();targetB.dispose();quad.geometry.dispose();quad.material.dispose()};
 return Object.freeze({render,dispose,uniforms,compositor});
}

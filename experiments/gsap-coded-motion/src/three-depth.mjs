/**
 * Original reproducible real-3D scene; isolated Three.js R&D only.
 * It exposes a frame-based adapter, and never depends on requestAnimationFrame,
 * Date, unseeded randomness, external textures, remote fonts or network.
 * Three.js is passed in (must be real official MIT `three` runtime, not a GUI).
 */
export function createThreeDepthRig({THREE,width=1080,height=1920,fps=30,frames=300,palette='mint'}={}){
 if(!THREE?.Scene||!THREE?.MeshPhysicalMaterial||!THREE?.PerspectiveCamera)throw Error('Real Three.js runtime required');
 if(![width,height,fps,frames].every(x=>Number.isInteger(x)&&x>0))throw Error('Positive integer frame profile required');
 const color={mint:0x79f6d9,lavender:0xaa9cff,copper:0xf7b47c}[palette];if(!color)throw Error('Unknown licensed original palette');
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x07111e);
 const camera=new THREE.PerspectiveCamera(35,width/height,.08,90);camera.position.set(0,0,12);
 const stage=new THREE.Group();stage.name='object-parent-rig';scene.add(stage);
 const hero=new THREE.Group();hero.name='hero-inner-group';hero.scale.setScalar(.60);hero.position.y=-.15;stage.add(hero);
 const glass=new THREE.MeshPhysicalMaterial({color,metalness:.32,roughness:.16,clearcoat:.95,clearcoatRoughness:.08,transparent:true,opacity:.93});
 const core=new THREE.Mesh(new THREE.IcosahedronGeometry(1.35,5),glass);core.name='central-hero';hero.add(core);
 const ringMaterial=new THREE.MeshStandardMaterial({color:0xe1fff8,metalness:.65,roughness:.3,emissive:color,emissiveIntensity:.11});
 const rings=[0,1,2].map((i)=>{
  const g=new THREE.Group();g.name=`orbital-ring-${i}`;hero.add(g);
  const torus=new THREE.Mesh(new THREE.TorusGeometry(2.05+i*.37,.028+i*.009,12,120),ringMaterial.clone());g.add(torus);return g;
 });
 const markers=new THREE.Group();markers.name='orbit-markers';hero.add(markers);
 for(let i=0;i<8;i++){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(.17,.17,.17),new THREE.MeshStandardMaterial({color:i%2?0xb5b1fa:color,metalness:.45,roughness:.2}));
  mesh.name=`marker-${i}`;markers.add(mesh);
 }
 const key=new THREE.SpotLight(0xc7fffa,90,36,Math.PI/5,.5,1);key.position.set(5,5,9);key.target=hero;scene.add(key);
 const fill=new THREE.PointLight(0x819cff,25,25);fill.position.set(-5,-3,3);scene.add(fill);
 scene.add(new THREE.AmbientLight(0x7894af,1.3));
 const uniforms={uTime:{value:0},uHue:{value:palette==='mint'?0.43:palette==='copper'?0.92:0.71},uStrength:{value:.6}};
 const shaderMaterial=new THREE.ShaderMaterial({
  uniforms,
  vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`precision mediump float; varying vec2 vUv; uniform float uTime; uniform float uHue; uniform float uStrength;
   void main(){vec2 p=(vUv-.5)*vec2(1.,1.7);float r=length(p);float a=atan(p.y,p.x);
    float bands=pow(max(0.,sin(r*26.-uTime*1.3+sin(a*5.)*.38)),8.);
    float halo=exp(-r*2.4)*uStrength;vec3 base=mix(vec3(.015,.055,.08),vec3(.14,.18,.29),uHue);
    vec3 glow=mix(vec3(.15,.95,.74),vec3(.66,.51,1.0),uHue);
    gl_FragColor=vec4(base*halo+glow*bands*.13*halo,1.);}`,
  transparent:true,depthWrite:false
 });
 const energy=new THREE.Mesh(new THREE.PlaneGeometry(30,52,1,1),shaderMaterial);energy.position.z=-7;energy.name='procedural-energy-field';stage.add(energy);
 const smooth=(a,b,t)=>a+(b-a)*(t*t*(3-2*t));
 const seekFrame=(frame)=>{
  if(!Number.isInteger(frame)||frame<0||frame>=frames)throw Error('Frame outside seek domain');
  const t=frame/fps,p=frame/(frames-1);
  // True 3D: lighting/material/projection and nested groups, no impostor SVG parallax.
  stage.position.x=smooth(-.55,.32,p);stage.rotation.y=.08+Math.sin(t*.35)*.08;
  hero.rotation.y=.15+t*.18;hero.rotation.x=.05+Math.sin(t*.28)*.16;
  core.scale.setScalar(1+.045*Math.sin(t*1.5));
  for(let i=0;i<rings.length;i++){
   rings[i].rotation.set(i*.31+t*(.12+i*.03),i*.34+t*.10,(-i*.24)+t*(i===1?-.08:.16));
  }
  for(let i=0;i<markers.children.length;i++){
   const a=i*Math.PI/4+t*.6,z=Math.sin(a*1.8)*.55;
   markers.children[i].position.set(Math.cos(a)*2.66,Math.sin(a)*1.85,z);
   markers.children[i].rotation.set(t*.9,a,t*.4);
  }
  camera.position.set(Math.sin(t*.25)*1.1,.05+Math.sin(t*.18)*.5,12.2-.25*Math.sin(t*.3));
  camera.lookAt(.0,.0,-.1);
  uniforms.uTime.value=t;uniforms.uStrength.value=.55+.06*Math.sin(t*.5);
  scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  return Object.freeze({frame,time:t,heroX:hero.position.x,heroRotation:[hero.rotation.x,hero.rotation.y,hero.rotation.z],cameraPosition:camera.position.toArray(),markers:markers.children.map(m=>m.position.toArray()),shaderTime:uniforms.uTime.value});
 };
 const makeRenderer=({canvas}={})=>{
  if(!canvas)throw Error('Explicit real browser canvas required for GPU output');
  const renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:true,preserveDrawingBuffer:true});
  renderer.setSize(width,height,false);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  return renderer;
 };
 const renderFrame=(renderer,frame)=>{const s=seekFrame(frame);renderer.render(scene,camera);return s};
 seekFrame(0);
 return Object.freeze({scene,camera,hero,stage,rings,markers,uniforms,seekFrame,renderFrame,makeRenderer,width,height,frames,fps});
}

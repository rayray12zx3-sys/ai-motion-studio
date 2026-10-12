/**
 * Original real-volume, physically lit kinetic data sculpture, not a recolor
 * of the orbit rig. This remains an offline/isolated coded-motion experiment.
 * A third-party/LLM brief never supplies executable JavaScript or shaders.
 */
export function createDataSculptureRig({THREE,width=1080,height=1920,fps=30,frames=300,cameraPath=null}={}){
 if(!THREE?.InstancedMesh||!THREE?.BufferGeometry||!THREE?.PerspectiveCamera)throw Error('Real Three.js runtime required');
 if(![width,height,fps,frames].every(x=>Number.isInteger(x)&&x>0))throw Error('Positive integer film profile required');
 if(cameraPath&&(cameraPath.frames!==frames||typeof cameraPath.at!=='function'))throw Error('Invalid camera choreography');
 const scene=new THREE.Scene();
 scene.background=new THREE.Color(0x080c1b);
 const camera=new THREE.PerspectiveCamera(35,width/height,.08,90);camera.position.set(0,0,12.3);
 const stage=new THREE.Group();stage.name='data-sculpture-root';scene.add(stage);
 const hero=new THREE.Group();hero.name='data-sculpture-hero';hero.scale.setScalar(.57);stage.add(hero);
 const material=new THREE.MeshPhysicalMaterial({color:0xb4a8ff,metalness:.36,roughness:.19,clearcoat:1,clearcoatRoughness:.12,transparent:true,opacity:.89,side:THREE.DoubleSide});
 const strips=[];
 const segments=112,lanes=4;
 for(let lane=0;lane<lanes;lane++){
   const positions=new Float32Array((segments+1)*2*3),indices=[];
   for(let i=0;i<segments;i++){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
   const geometry=new THREE.BufferGeometry();
   geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
   geometry.setIndex(indices);
   const strip=new THREE.Mesh(geometry,material.clone());strip.name='deforming-ribbon-'+lane;
   hero.add(strip);strips.push(strip);
 }
 const instanced=new THREE.InstancedMesh(new THREE.BoxGeometry(.16,.16,.20),
   new THREE.MeshStandardMaterial({color:0xf0bdc1,metalness:.61,roughness:.27,emissive:0x3b183b,emissiveIntensity:.17}),28);
 instanced.name='volumetric-data-cells';hero.add(instanced);
 const anchors=new THREE.Group();anchors.name='spatial-anchors';hero.add(anchors);
 const rods=[];
 for(let i=0;i<6;i++){
  const group=new THREE.Group();group.name='floating-depth-frame-'+i;
  const rod=new THREE.Mesh(new THREE.TorusGeometry(.45+i*.15,.014,6,70),new THREE.MeshStandardMaterial({color:i%2?0xe9d8ff:0xa3fcdf,metalness:.72,roughness:.22,transparent:true,opacity:.70}));
  group.add(rod);anchors.add(group);rods.push(group);
 }
 const ambient=new THREE.AmbientLight(0x9ab5e8,1.25);scene.add(ambient);
 const key=new THREE.SpotLight(0xf0e3ff,75,35,Math.PI/5,.6,1);key.position.set(-4,5,8);key.target=hero;scene.add(key);
 const rim=new THREE.PointLight(0x7bfdce,34,22);rim.position.set(4,-3,-1);scene.add(rim);
 const uniforms={uTime:{value:0},uStrength:{value:.5}};
 const field=new THREE.Mesh(new THREE.PlaneGeometry(30,52),
  new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,
   vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:'precision mediump float;varying vec2 vUv;uniform float uTime;uniform float uStrength;void main(){vec2 q=(vUv-.5)*vec2(1.,1.8);float a=atan(q.y,q.x);float r=length(q);float waves=pow(max(0.,sin(16.*r-1.1*uTime+sin(a*7.)*.4)),9.);float halo=exp(-r*3.);gl_FragColor=vec4(vec3(.08,.055,.18)*halo*uStrength+vec3(.55,.35,.9)*waves*halo*.11,1.);}' }));
 field.name='volumetric-depth-field';field.position.z=-7;stage.add(field);
 const dummy=new THREE.Object3D();
 const seekFrame=frame=>{
  if(!Number.isInteger(frame)||frame<0||frame>=frames)throw Error('Frame outside seek domain');
  const t=frame/fps,u=frame/(frames-1);
  hero.rotation.y=-.16+t*.14;hero.rotation.x=.12+.1*Math.sin(t*.32);
  stage.position.x=-.25+u*.48;
  for(let lane=0;lane<lanes;lane++){
   const a=strips[lane].geometry.attributes.position;
   for(let i=0;i<=segments;i++){
    const v=i/segments,theta=v*Math.PI*3.1+lane*1.12+t*.22;
    const radius=1.18+.15*Math.sin(v*Math.PI*4+lane+t*.6);
    const y=(v-.5)*4.2;
    for(let side=0;side<2;side++){
     const radius2=radius+(side? .18:-.18);
     a.setXYZ(i*2+side,Math.sin(theta)*radius2,y+.16*Math.sin(theta*1.6),Math.cos(theta)*radius2+.18*lane-.25);
    }
   }
   a.needsUpdate=true;strips[lane].geometry.computeVertexNormals();
  }
  for(let i=0;i<instanced.count;i++){
   const k=i/instanced.count,theta=k*Math.PI*6.5+t*.11;
   dummy.position.set(Math.sin(theta)*2.0,(k-.5)*4.0,Math.cos(theta)*1.4);
   dummy.rotation.set(t*.2+k*2,theta*.6,t*.25);
   dummy.scale.setScalar(.7+.3*Math.sin(t*.4+k*5)**2);
   dummy.updateMatrix();instanced.setMatrixAt(i,dummy.matrix);
  }
  instanced.instanceMatrix.needsUpdate=true;
  rods.forEach((g,i)=>{
   const a=i*Math.PI/3+t*(i%2?-.17:.2);
   g.position.set(Math.cos(a)*(1.8+i*.06),Math.sin(a)*(1.25+i*.04),Math.sin(a*.7)*1.1);
   g.rotation.set(.35+a*.15,t*.22,a*.8);
  });
  if(cameraPath){const pose=cameraPath.at(frame);camera.position.set(pose.x,pose.y,pose.z);camera.lookAt(pose.lookX,pose.lookY,pose.lookZ);}
  else{camera.position.set(Math.sin(t*.20)*.42,Math.cos(t*.11)*.20,12.2);camera.lookAt(0,0,0);}
  uniforms.uTime.value=t;uniforms.uStrength.value=.55+.08*Math.sin(t*.24);
  scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  return Object.freeze({frame,time:t,rig:'volumetric-data-sculpture',cameraPosition:camera.position.toArray(),ribbonVertex0:strips[0].geometry.attributes.position.array.slice(0,9).join(','),cellMatrix0:instanced.instanceMatrix.array.slice(0,16).join(',')});
 };
 const makeRenderer=({canvas}={})=>{
  if(!canvas)throw Error('Real browser canvas required');
  const renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:true,preserveDrawingBuffer:true});
  renderer.setSize(width,height,false);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  return renderer;
 };
 const renderFrame=(renderer,frame)=>{const state=seekFrame(frame);renderer.render(scene,camera);return state;};
 seekFrame(0);
 return Object.freeze({scene,camera,stage,hero,strips,instanced,rods,seekFrame,renderFrame,makeRenderer,width,height,frames,fps,rigType:'volumetric-data-sculpture'});
}

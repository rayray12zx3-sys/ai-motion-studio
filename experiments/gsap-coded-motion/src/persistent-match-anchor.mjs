/**
 * Shared persistent visual motif across independent real 3D camera rigs.
 * Both shots own an original matching mesh anchored to the SAME screen-space
 * coordinates and apparent radius. A stable motif can survive a GPU shader
 * handoff without the visual identity popping or jumping.
 */
const smooth=x=>{const a=Math.max(0,Math.min(1,x));return a*a*(3-2*a)};
export function attachPersistentMatchAnchor({THREE,first,second,width,height,start,end,
 x=.5,y=.57,radiusPixels=80,distance=7,color=0xd4f8ef,fadeFrames=18}={}){
 if(!THREE?.TorusGeometry||!THREE?.Vector3||!first?.scene?.isScene||!second?.scene?.isScene||!first?.camera?.isPerspectiveCamera||!second?.camera?.isPerspectiveCamera)throw Error('Matching anchor needs two real 3D scenes and cameras');
 if(![width,height,start,end,x,y,radiusPixels,distance,fadeFrames].every(Number.isFinite)||width<=0||height<=0||start<fadeFrames||end<=start||x<0||x>1||y<0||y>1||radiusPixels<=0||distance<=.2||fadeFrames<=1)throw Error('Invalid persistent match contract');
 const meshes=[first,second].map((rig,i)=>{
  const geometry=new THREE.TorusGeometry(1,.027,8,112);
  const material=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0,depthTest:false,depthWrite:false,toneMapped:false});
  const mesh=new THREE.Mesh(geometry,material);
  mesh.name='persistent-match-anchor-'+(i?'second':'first');
  mesh.renderOrder=30;
  rig.scene.add(mesh);
  return mesh;
 });
 const seekFrame=frame=>{
  if(!Number.isInteger(frame)||frame<0||frame>=Math.min(first.frames,second.frames))throw Error('Persistent anchor frame outside film');
  const show=smooth((frame-(start-fadeFrames))/fadeFrames)*
   (1-smooth((frame-end)/fadeFrames));
  const centers=[];
  [first,second].forEach((rig,i)=>{
    const mesh=meshes[i],camera=rig.camera;
    camera.updateMatrixWorld(true);
    const view=new THREE.Vector3(2*x-1,1-2*y,.5).unproject(camera);
    const dir=view.sub(camera.position).normalize();
    mesh.position.copy(camera.position).addScaledVector(dir,distance);
    mesh.quaternion.copy(camera.quaternion);
    const worldRadius=radiusPixels*distance*2*Math.tan(camera.fov*Math.PI/360)/height;
    mesh.scale.setScalar(worldRadius);
    mesh.material.opacity=.69*show;
    mesh.updateWorldMatrix(true,false);
    const point=mesh.getWorldPosition(new THREE.Vector3()).project(camera);
    centers.push({x:(point.x+1)*width/2,y:(1-point.y)*height/2,opacity:mesh.material.opacity});
  });
  const dx=centers[0].x-centers[1].x,dy=centers[0].y-centers[1].y;
  return Object.freeze({frame,centers,matchErrorPixels:Math.hypot(dx,dy),visible:show>0});
 };
 return Object.freeze({meshes,seekFrame,screenTarget:Object.freeze({x:x*width,y:y*height,radiusPixels}),transition:Object.freeze({start,end})});
}

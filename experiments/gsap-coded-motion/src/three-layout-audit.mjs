/** Projection-based semantic-safe-area audit for actual Three.js + HTML films.
 * Conservative geometric check (not glyph, perceptual, or artistic approval).
 * Only inspect the authored foreground hero group, not atmosphere planes.
 */
export function projectHeroBounds({THREE,object,camera,width,height}) {
  if (!THREE?.Box3 || !object?.isObject3D || !camera?.isCamera) throw Error('Three.js object and camera required');
  if (![width,height].every(x=>Number.isFinite(x)&&x>0)) throw Error('Invalid viewport');
  object.updateWorldMatrix(true,true);
  camera.updateWorldMatrix(true,false);
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) throw Error('Hero must have three-dimensional geometry');
  const bounds = {left:Infinity,top:Infinity,right:-Infinity,bottom:-Infinity};
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]) {
    const p=new THREE.Vector3(x,y,z).project(camera);
    const px=(p.x+1)*width/2,py=(1-p.y)*height/2;
    bounds.left=Math.min(bounds.left,px);bounds.top=Math.min(bounds.top,py);
    bounds.right=Math.max(bounds.right,px);bounds.bottom=Math.max(bounds.bottom,py);
  }
  return bounds;
}
export function overlapArea(a,b){
  if (![a,b].every(q=>q&&[q.left,q.top,q.right,q.bottom].every(Number.isFinite)))throw Error('Invalid bounds');
  const w=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));
  const h=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  return w*h;
}
export function assertNoProtectedOcclusion({hero,protectedRegions,tolerancePixels=0}){
  if(!Array.isArray(protectedRegions))throw Error('Missing protected regions');
  const violations=protectedRegions.flatMap(({name,bounds})=>{
    const intersection=overlapArea(hero,bounds);
    return intersection>tolerancePixels?[{name,intersection}]:[];
  });
  return {passed:violations.length===0,violations};
}
export function htmlRectToCanvasDesign(rect,canvasRect,width,height){
  if(canvasRect.width<=0||canvasRect.height<=0)throw Error('Canvas not visible');
  return {left:(rect.left-canvasRect.left)*width/canvasRect.width,
          top:(rect.top-canvasRect.top)*height/canvasRect.height,
          right:(rect.right-canvasRect.left)*width/canvasRect.width,
          bottom:(rect.bottom-canvasRect.top)*height/canvasRect.height};
}

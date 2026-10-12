/** Detect sudden one-frame visual jumps; deliberately does NOT classify art quality. */
export function detectIsolatedPops(differences,{ratio=2.6,minDifference=1.3,neighborFloor=.75}={}){
 if(!Array.isArray(differences)||differences.length<3||![ratio,minDifference,neighborFloor].every(v=>Number.isFinite(v)&&v>0))throw Error('Invalid contiguous frame differences');
 if(differences.some(x=>!Number.isFinite(x)||x<0))throw Error('Invalid frame difference magnitude');
 const spikes=[];
 for(let i=1;i<differences.length-1;i++){
  const value=differences[i],neighbors=Math.max(neighborFloor,(differences[i-1]+differences[i+1])/2);
  if(value>minDifference&&value>ratio*neighbors)spikes.push({frame:i+1,difference:+value.toFixed(4),ratio:+(value/neighbors).toFixed(3)});
 }
 return spikes;
}

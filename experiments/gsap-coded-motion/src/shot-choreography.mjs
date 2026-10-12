/**
 * Deterministic, data-driven shot compiler for programmatic motion films.
 * Frame intervals are half-open [start, end). Adjacent shots may overlap only
 * for one deliberate shader handoff. No gaps or three-way crossfades.
 * This is a timeline contract, NOT an AI director or artistic approval.
 */
const fail=reason=>{throw Error(reason)};
const integer=(value,label)=>Number.isInteger(value)?value:fail(label+" must be an integer");
const smooth=t=>t*t*(3-2*t);
export function compileShotChoreography({fps=30,frames,shots}){
 integer(fps,"fps");integer(frames,"frames");
 if(fps<=0||frames<fps)fail("Positive fps and at least one second of frames required");
 if(!Array.isArray(shots)||shots.length<2||shots.length>8)fail("Need 2-8 authored shots");
 const seen=new Set();
 const normalized=shots.map(shot=>{
  if(!shot||typeof shot.id!=="string"||!/^[-a-z][a-z0-9-]*$/.test(shot.id)||seen.has(shot.id))fail("Unique safe shot id required");
  seen.add(shot.id);
  const {start,end}=shot;integer(start,shot.id+".start");integer(end,shot.id+".end");
  if(start<0||end>frames||end-start<Math.ceil(fps*.75))fail("Shot "+shot.id+" has invalid/too-short exposure");
  if(typeof shot.rig!=="string"||!/^[-a-z][a-z0-9-]*$/.test(shot.rig))fail("Shot "+shot.id+" needs a known rig name");
  if(shot.titleHold){
   const [from,to]=shot.titleHold;integer(from,shot.id+".titleHold.start");integer(to,shot.id+".titleHold.end");
   if(from<start||to>end||to-from<Math.ceil(fps*.75))fail(shot.id+": insufficient protected reading hold");
  }
  return Object.freeze({id:shot.id,rig:shot.rig,start,end,titleHold:shot.titleHold||null});
 });
 if(normalized[0].start!==0||normalized.at(-1).end!==frames)fail("Film must cover first and last frame");
 const transitions=[];
 for(let i=1;i<normalized.length;i++){
  const before=normalized[i-1],after=normalized[i];
  if(!(after.start>before.start&&after.end>before.end))fail("Shot starts and ends must increase monotonically");
  const overlap=before.end-after.start;
  if(overlap<2||overlap>fps*2)fail("Adjacent shots require an intentional 2-60-frame overlap");
  if(i>=2&&after.start<normalized[i-2].end)fail("Three-way shot overlap is not allowed");
  transitions.push(Object.freeze({from:before.id,to:after.id,start:after.start,end:before.end,frames:overlap}));
 }
 const at=frame=>{
  integer(frame,"frame");if(frame<0||frame>=frames)fail("Frame outside film");
  const active=normalized.filter(s=>s.start<=frame&&frame<s.end);
  if(active.length<1||active.length>2)fail("Timeline gap/overlap at frame "+frame);
  if(active.length===1)return Object.freeze({frame,seconds:frame/fps,active:[active[0].id],rigs:[active[0].rig],progress:0,weights:[1],handoff:null});
  const [a,b]=active,transition=transitions.find(tr=>tr.from===a.id&&tr.to===b.id);
  if(!transition)fail("No transition contract for frame "+frame);
  const linear=(frame-transition.start)/(transition.frames-1),progress=smooth(linear);
  return Object.freeze({frame,seconds:frame/fps,active:[a.id,b.id],rigs:[a.rig,b.rig],progress,weights:[1-progress,progress],handoff:transition});
 };
 const timeline=Object.freeze({fps,frames,shots:Object.freeze(normalized),transitions:Object.freeze(transitions),at});
 for(let f=0;f<frames;f++)at(f);
 return timeline;
}

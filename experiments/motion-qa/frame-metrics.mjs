/**
 * Original, dependency-free, deterministic RGBA motion diagnostic.
 * Input is in-memory pixels only. Never prints frames, source paths or media.
 * Heuristics are technical warnings, NOT visual quality or legal clearance.
 */
const int=(x,min,max)=>Number.isInteger(x)&&x>=min&&x<=max;
const finite=(x,min,max)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;

function validateSafeRect(s,width,height){
  if(s===undefined)return null;
  if(!s||!int(s.x,0,width-1)||!int(s.y,0,height-1)||
    !int(s.width,1,width)||!int(s.height,1,height)||
    s.x+s.width>width||s.y+s.height>height)
    throw new TypeError('Invalid conservative safe rectangle');
  return {x:s.x,y:s.y,width:s.width,height:s.height};
}
function boundingBox(minX,minY,maxX,maxY){
  return maxX<0?null:{left:minX,top:minY,right:maxX,bottom:maxY};
}
export function analyzeMotionFrames({
  frames,width,height,safeRect,
  alphaThreshold=8,colorDeltaThreshold=20,
  minVisiblePixels=1,maxCentroidJumpFraction=0.30,
  maxInternalRepeatedTransitions=2,allowedEndingRepeatedTransitions=0,
  allowedBlankFrameIndices=[],allowedCutFrameIndices=[],allowedHoldFrameRanges=[]
}={}){
  if(!int(width,2,4096)||!int(height,2,4096)||
    !Array.isArray(frames)||frames.length<2||frames.length>300||
    width*height*frames.length>50_000_000)
    throw new TypeError('Invalid or oversized in-memory RGBA motion sample');
  if(!int(alphaThreshold,0,254)||!int(colorDeltaThreshold,0,255)||
    !int(minVisiblePixels,0,width*height)||
    !finite(maxCentroidJumpFraction,0,1)||
    !int(maxInternalRepeatedTransitions,0,300)||
    !int(allowedEndingRepeatedTransitions,0,frames.length-1)||
    !Array.isArray(allowedBlankFrameIndices)||
    allowedBlankFrameIndices.some(f=>!int(f,0,frames.length-1))||
    !Array.isArray(allowedCutFrameIndices)||
    allowedCutFrameIndices.length>30||
    allowedCutFrameIndices.some(f=>!int(f,1,frames.length-1))||
    new Set(allowedCutFrameIndices).size!==allowedCutFrameIndices.length||
    !Array.isArray(allowedHoldFrameRanges)||
    allowedHoldFrameRanges.length>20||
    allowedHoldFrameRanges.some(r=>!r||!int(r.from,0,frames.length-2)||
      !int(r.to,r.from+1,frames.length-1)))
    throw new TypeError('Invalid motion QA thresholds or exemptions');
  const safe=validateSafeRect(safeRect,width,height);
  const blanks=new Set(allowedBlankFrameIndices);
  // Intent is declared by the editor, never inferred from a suspicious frame.
  // These exemptions suppress review warnings only; empty/unsafe alpha
  // remain hard blockers even on an approved cut or hold.
  const cuts=new Set(allowedCutFrameIndices);
  const holds=allowedHoldFrameRanges.map(r=>({from:r.from,to:r.to}));
  const isExpectedHold=(frame)=>holds.some(r=>frame>r.from&&frame<=r.to);
  const pixels=width*height;
  const report=[];
  const findings=[];
  const diagonal=Math.hypot(width,height);
  let previous=null;
  for(let frame=0;frame<frames.length;frame++){
    const data=frames[frame];
    if(!(data instanceof Uint8Array)&&!(data instanceof Uint8ClampedArray))
      throw new TypeError('RGBA frame must be Uint8Array or Uint8ClampedArray');
    if(data.length!==pixels*4)throw new TypeError('Invalid RGBA pixel count');
    let visible=0,unsafe=0,mx=0,my=0,minX=width,minY=height,maxX=-1,maxY=-1,different=0;
    for(let i=0;i<pixels;i++){
      const offset=i*4,a=data[offset+3],isVisible=a>alphaThreshold;
      const x=i%width,y=(i-x)/width;
      if(isVisible){
        visible++;mx+=x;my+=y;
        minX=Math.min(minX,x);minY=Math.min(minY,y);
        maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
        if(safe&&(x<safe.x||x>=safe.x+safe.width||
          y<safe.y||y>=safe.y+safe.height))unsafe++;
      }
      if(previous){
        const prevAlpha=previous[offset+3];
        // Avoid reading invisible RGB matte and per-pixel allocations.
        if(prevAlpha<=alphaThreshold&&!isVisible)continue;
        const alphaChanged=Math.abs(a-prevAlpha)>alphaThreshold;
        const rgbChanged=isVisible&&prevAlpha>alphaThreshold&&(
          Math.abs(data[offset]-previous[offset])>colorDeltaThreshold||
          Math.abs(data[offset+1]-previous[offset+1])>colorDeltaThreshold||
          Math.abs(data[offset+2]-previous[offset+2])>colorDeltaThreshold);
        if(alphaChanged||rgbChanged)different++;
      }
    }
    const centroid=visible?{x:mx/visible,y:my/visible}:null;
    const item={
      index:frame,visible_pixels:visible,unsafe_alpha_pixels:unsafe,
      bbox:boundingBox(minX,minY,maxX,maxY),
      centroid:centroid&&{x:Number(centroid.x.toFixed(4)),y:Number(centroid.y.toFixed(4))},
      changed_pixels_from_previous:previous?different:null,
      changed_fraction_from_previous:previous?Number((different/pixels).toFixed(7)):null
    };
    if(visible<minVisiblePixels&&!blanks.has(frame))
      findings.push({severity:'blocker',code:'UNEXPECTED_EMPTY_FRAME',frame});
    if(unsafe>0)
      findings.push({severity:'blocker',code:'ALPHA_OUTSIDE_DECLARED_SAFE_RECT',frame,pixels:unsafe});
    const old=report[frame-1];
    if(old?.centroid&&item.centroid){
      const jump=Math.hypot(item.centroid.x-old.centroid.x,
        item.centroid.y-old.centroid.y)/diagonal;
      if(jump>maxCentroidJumpFraction&&!cuts.has(frame))
        findings.push({severity:'review',code:'CENTROID_JUMP',frame,
          normalized_jump:Number(jump.toFixed(5))});
    }
    report.push(item);
    previous=data;
  }
  let repeatStart=null;
  const lastTransition=frames.length-1-allowedEndingRepeatedTransitions;
  for(let i=1;i<=lastTransition+1;i++){
    const repeating=i<=lastTransition&&report[i].changed_pixels_from_previous===0&&
      !cuts.has(i)&&!isExpectedHold(i);
    if(repeating&&repeatStart===null)repeatStart=i;
    if(!repeating&&repeatStart!==null){
      const repeats=i-repeatStart;
      if(repeats>maxInternalRepeatedTransitions)
        findings.push({severity:'review',code:'UNEXPECTED_FREEZE',
          from_frame:repeatStart-1,to_frame:i-1,repeated_transitions:repeats});
      repeatStart=null;
    }
  }
  const status=findings.some(f=>f.severity==='blocker')?'BLOCKED':
    findings.length?'REVIEW':'PASS';
  return {
    version:1,status,creative_approval:'HUMAN_REVIEW_REQUIRED',
    source_media_retained:false,
    sampled_frames:frames.length,profile:{width,height},safe_rect:safe,
    declared_editor_intent:{cut_frames:[...cuts].sort((a,b)=>a-b),hold_ranges:holds},
    metrics:report,findings
  };
}

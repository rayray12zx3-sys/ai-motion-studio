/**
 * Small opt-in creative-review feedback loop for the isolated original-only
 * P2 landscape research. It never edits the authored brief or declares art
 * quality. A deterministic diagnostics result selects an existing bounded
 * typography treatment per shot; the actual MP4 remains a separate gate.
 */
import {inspectNativeTypography} from './native-landscape-composition.mjs';

export function planNativeQualityRevision(plan){
  if(!plan||!Array.isArray(plan.shots)||plan.shots.length<1)
    throw Error('Expected previously validated authored semantic scene plan');
  const shotModes=Object.create(null);
  const evidence=[];
  let revisedCount=0;
  for(const shot of plan.shots){
    const before=inspectNativeTypography(plan,shot,'standard');
    const correction=before.status==='HEURISTIC_PASS'?before:
      inspectNativeTypography(plan,shot,'compact');
    if(correction.status!=='HEURISTIC_PASS')
      throw Error('No safe bounded native typography repair for '+shot.id);
    const revised=before.status!=='HEURISTIC_PASS';
    if(revised)revisedCount++;
    shotModes[shot.id]=revised?'compact':'standard';
    evidence.push({
      shotId:shot.id,
      original:before.status,
      problem:before.issue||null,
      chosenMode:shotModes[shot.id],
      revised:revised,
      final:correction.status,
      remainingSpaceToFooter:Math.round(933-correction.subtitleEnd),
      evidenceClass:'ESTIMATED_TEXT_LAYOUT_ONLY',
    });
  }
  const result={schema:'isolated-p2-native-typography-revision-v1',
    sourceContract:'UNCHANGED',
    shotModes: {...shotModes},
    revisedCount,
    decisions:evidence,
    status:revisedCount?'BOUNDED_PREVIEW_REPAIR':'NO_LAYOUT_REPAIR_REQUIRED',
    decodedMediaQA:'NOT_DONE_BY_THIS_PLANNER',
    pixelTypography:'NOT_MEASURED',
    fullSpeedArtReview:'PENDING_HUMAN',
    rightsReview:'PENDING',
    limitations:'Heuristic glyph-width/line-bounds correction only; no LLM judgment, pixel-perfect font measurement, occlusion or professional aesthetic signoff'};
  return result;
}

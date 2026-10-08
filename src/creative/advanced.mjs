import {createCanvas, loadImage} from '@napi-rs/canvas';
import {evaluateMultiObjectFrame, validateMultiObjectSpec} from './composition.mjs';
import {preciseEase} from './motion.mjs';
import {verifyLocalAssets} from './assets.mjs';
import {fontFamily, validateSpec} from '../free/scene.mjs';

const exact = (obj, keys) => obj !== null && typeof obj === 'object' && !Array.isArray(obj) &&
  Object.keys(obj).sort().join(',') === keys.slice().sort().join(',');
const validText = text => typeof text === 'string' && [...text].length <= 34;
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = (frame, start, end) => preciseEase(clamp((frame - start) / (end - start)));
const paper = '#F3F1EB', ink = '#17191C', muted = '#657078', red = '#CF443A', blue = '#2459C6';

export function validateAdvancedSpec(spec) {
  if (!exact(spec, ['motion', 'copy', 'asset_manifest'])) throw new Error('Unexpected advanced scene fields');
  validateMultiObjectSpec(spec.motion);
  if (!Array.isArray(spec.copy) || spec.copy.length !== spec.motion.segments.length) {
    throw new Error('Advanced film copy must match each segment');
  }
  spec.copy.forEach((beat, i) => {
    if (!exact(beat, ['segment_id', 'headline', 'subtitle']) ||
        beat.segment_id !== spec.motion.segments[i].id ||
        !validText(beat.headline) || !validText(beat.subtitle) ||
        [...beat.headline].length > 24) throw new Error('Invalid advanced beat text');
    validateSpec({title: beat.headline, subtitle: beat.subtitle});
  });
  if (!exact(spec.asset_manifest, ['version', 'assets']) ||
      !Array.isArray(spec.asset_manifest.assets) || spec.asset_manifest.assets.length !== 1 ||
      spec.asset_manifest.assets[0]?.id !== 'signal-art') {
    throw new Error('Pilot requires one approved local raster art');
  }
}

export async function loadAdvancedArt(spec, assetRoot) {
  validateAdvancedSpec(spec);
  const verified = verifyLocalAssets(spec.asset_manifest, assetRoot);
  const art = verified.get('signal-art');
  const image = await loadImage(art.bytes);
  if (image.width !== art.width || image.height !== art.height) {
    throw new Error('Decoded art does not match manifest');
  }
  return {image, record: {id: art.id, sha256: art.sha256, license: art.license, source: art.source}};
}

function fitFont(ctx, text, desired, maxWidth, min) {
  let size = desired;
  ctx.font = size + 'px ' + fontFamily;
  const actual = ctx.measureText(text).width;
  if (!Number.isFinite(actual) || actual <= 0) throw new Error('Unreadable text metrics');
  if (actual > maxWidth) size = Math.floor(size * maxWidth / actual);
  if (size < min) throw new Error('Advanced text exceeds safe area');
  ctx.font = size + 'px ' + fontFamily;
  if (ctx.measureText(text).width > maxWidth) throw new Error('Advanced text exceeds safe area');
  return size;
}

function rounded(ctx, x, y, w, h, radius) {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

function panel(ctx, x, y, w, h, radius, fill, stroke) {
  rounded(ctx, x, y, w, h, radius);
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) {ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(1, w * .0015); ctx.stroke();}
}

function label(ctx, text, x, y, size, colour = ink) {
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = Math.max(8, Math.round(size)) + 'px ' + fontFamily;
  ctx.fillStyle = colour; ctx.fillText(text, x, y);
}

function stageLayout(w, h) {
  const portrait = h > w;
  const margin = w * (portrait ? .075 : .074);
  return {portrait, margin,
    stage: {x: margin, y: h * (portrait ? .38 : .39), w: w - 2 * margin,
      h: h * (portrait ? .48 : .47)},
    typeY: h * .2, subtitleY: h * .3,
    titleSize: Math.max(14, Math.round(Math.min(w * (portrait ? .071 : .059), h * .095))),
    subtitleSize: Math.max(11, Math.round(Math.min(w * .028, h * .043)))};
}

// Neighboring beats exchange space over the SAME 32-frame window, instead of
// independently fading to zero and creating a blank/cut at frames 90/180/270.
export function advancedTransition(spec, frame) {
  const segments = spec.motion.segments;
  if (!Number.isInteger(frame) || frame < 0 || frame >= spec.motion.duration_frames) {
    throw new Error('Frame outside advanced transition');
  }
  const overlap = 16;
  for (let next = 1; next < segments.length; next++) {
    const boundary = segments[next].start;
    if (frame >= boundary - overlap && frame < boundary + overlap) {
      const progress = smooth(frame, boundary - overlap, boundary + overlap);
      return {current: next - 1, incoming: next, progress};
    }
  }
  return {current: segments.findIndex(s => frame >= s.start && frame < s.end),
    incoming: null, progress: 0};
}

function drawTypography(ctx, spec, frame, layout, w, h) {
  const transition = advancedTransition(spec, frame);
  const slots = transition.incoming === null ?
    [{index: transition.current, weight: 1, displacement: 0}] :
    [{index: transition.current, weight: 1 - transition.progress, displacement: -transition.progress},
      {index: transition.incoming, weight: transition.progress, displacement: 1 - transition.progress}];
  const {margin, titleSize, subtitleSize} = layout;
  ctx.save();
  ctx.beginPath(); ctx.rect(margin - 2, h * .087, w - margin * 2 + 4, h * .29); ctx.clip();
  for (const slot of slots) {
    if (slot.weight <= 0) continue;
    const beat = spec.copy[slot.index];
    const size = fitFont(ctx, beat.headline, titleSize, w * .77, Math.max(12, titleSize * .6));
    const subsize = fitFont(ctx, beat.subtitle, subtitleSize, w * .78, Math.max(9, subtitleSize * .66));
    const dy = slot.displacement * titleSize * 1.12;
    ctx.save(); ctx.globalAlpha = slot.weight;
    // Each old headline exits upward while the next rises through the same title slot.
    label(ctx, beat.headline, margin, layout.typeY + dy, size);
    label(ctx, beat.subtitle, margin, layout.subtitleY + dy * .62, subsize, muted);
    ctx.restore();
  }
  ctx.restore();
  // Stable editorial rail and beat marker. No opacity drop at shot changes.
  ctx.fillStyle = '#C6C3BA';
  ctx.fillRect(margin, h * .345, w * .19, Math.max(1, w * .0015));
  label(ctx, 'MOTION / STUDIO', margin, h * .073, Math.min(22, w * .016), muted);
  label(ctx, '0' + (transition.incoming === null ? transition.current + 1 :
    (transition.progress >= .5 ? transition.incoming + 1 : transition.current + 1)) +
    '   /   04', w - margin - Math.max(85, w * .1), h * .073, Math.min(20, w * .014), muted);
}

function grid(ctx, area, rows = 4) {
  ctx.lineWidth = Math.max(1, area.w * .0011);
  ctx.strokeStyle = '#D8D6CF';
  for (let n = 1; n < rows; n++) {
    const y = area.y + area.h * n / rows;
    ctx.beginPath(); ctx.moveTo(area.x + area.w * .07, y);
    ctx.lineTo(area.x + area.w * .93, y); ctx.stroke();
  }
}

function drawOpener(ctx, area, frame, art, staticEnd) {
  const t = staticEnd ? Math.min(frame, 329) : frame;
  const enter = smooth(t, 2, 28);
  const r = Math.min(area.w * .2, area.h * .37);
  const cx = area.x + area.w * .67, cy = area.y + area.h * .48;
  panel(ctx, area.x, area.y, area.w, area.h, area.w * .023, '#F9F7F2', '#DDD9D0');
  grid(ctx, area, 4);
  ctx.save(); ctx.translate(cx, cy);
  ctx.lineWidth = Math.max(2, area.w * .003);
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = i === 1 ? red : '#B4BAC0';
    ctx.globalAlpha = enter * (i === 1 ? .85 : .5);
    ctx.beginPath();
    ctx.arc(0, 0, r * (.4 + i * .3), -.5 * Math.PI + (t / 140) * (i % 2 ? 1 : -1),
      -.5 * Math.PI + (t / 140) * (i % 2 ? 1 : -1) + Math.PI * (1.35 + i * .15)); ctx.stroke();
  }
  ctx.restore();
  label(ctx, 'SIGNAL / 001', area.x + area.w * .08, area.y + area.h * .16, area.w * .026, muted);
  label(ctx, 'SHAPE', area.x + area.w * .08, area.y + area.h * .72, area.w * .073);
  label(ctx, 'BECOMES MOTION', area.x + area.w * .08, area.y + area.h * .81, area.w * .03, muted);
  // This is original checked artwork rather than a fake vector-placeholder claim.
  const icon = Math.min(area.w * .095, area.h * .2);
  ctx.globalAlpha = enter;
  ctx.drawImage(art.image, area.x + area.w * .08, area.y + area.h * .33, icon, icon);
  ctx.globalAlpha = 1;
}

function drawControl(ctx, area, frame) {
  const local = frame - 90;
  const p = smooth(local, -18, 38), click = smooth(local, 23, 44);
  panel(ctx, area.x, area.y, area.w, area.h, area.w * .023, '#EAEDEB', '#CFD5D3');
  const x = area.x + area.w * .065, y = area.y + area.h * .135;
  const cw = area.w * .87, ch = area.h * .76;
  panel(ctx, x, y, cw, ch, area.w * .022, '#FAFAF7', '#B6C3C5');
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = [red, '#E1B85D', '#4F9785'][i];
    ctx.beginPath(); ctx.arc(x + cw * (.07 + i * .05), y + ch * .09, Math.max(2, cw * .012), 0, Math.PI * 2); ctx.fill();
  }
  label(ctx, 'LIVE / INTERACTION', x + cw * .07, y + ch * .25, cw * .035, muted);
  // Persistent signal sits over the primary control; the control itself
  // evolves in a tangible UI, including progress and button state.
  panel(ctx, x + cw * .15, y + ch * .35, cw * .67, ch * .22, ch * .12, '#F2E0DD');
  ctx.fillStyle = '#CCD3D4';
  rounded(ctx, x + cw * .15, y + ch * .68, cw * .64, ch * .032, ch * .016); ctx.fill();
  ctx.fillStyle = blue;
  rounded(ctx, x + cw * .15, y + ch * .68, cw * .64 * (.1 + .78 * p), ch * .032, ch * .016);ctx.fill();
  panel(ctx, x + cw * .62, y + ch * .77, cw * .20, ch * .11, ch * .07, click > .5 ? blue : '#B2C5CD');
  ctx.fillStyle = '#fff';
  ctx.beginPath();ctx.arc(x + cw * (.665 + .11 * click), y + ch * .825, ch * .038, 0, Math.PI * 2);ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = Math.max(2, cw * .003);
  const cursorX = x + cw * (.28 + click * .49), cursorY = y + ch * (.53 + click * .2);
  ctx.beginPath();ctx.moveTo(cursorX, cursorY);ctx.lineTo(cursorX + cw * .035, cursorY + ch * .055);
  ctx.lineTo(cursorX + cw * .009, cursorY + ch * .045);ctx.closePath();ctx.fillStyle = ink;ctx.fill();
  ctx.strokeStyle = '#fff';ctx.stroke();
  if (local > 22 && local < 51) {
    ctx.strokeStyle = blue; ctx.globalAlpha = 1 - smooth(local, 22, 51);
    ctx.lineWidth = Math.max(1, cw * .004);
    ctx.beginPath();ctx.arc(cursorX, cursorY, ch * (.05 + smooth(local, 22, 51) * .11), 0, Math.PI * 2);ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function drawData(ctx, area, frame) {
  const local = frame - 180;
  const p = smooth(local, -14, 45);
  panel(ctx, area.x, area.y, area.w, area.h, area.w * .023, '#EFF3F3', '#CED4D6');
  label(ctx, 'PERFORMANCE / LIVE', area.x + area.w * .07, area.y + area.h * .13, area.w * .025, muted);
  label(ctx, '84.6', area.x + area.w * .07, area.y + area.h * .35, area.w * .097, ink);
  label(ctx, '+24.8%', area.x + area.w * .43, area.y + area.h * .325, area.w * .033, blue);
  const left = area.x + area.w * .08, bottom = area.y + area.h * .87, maxH = area.h * .31;
  grid(ctx, {x: area.x, y: area.y + area.h * .37, w: area.w, h: area.h * .5}, 4);
  for (let i = 0; i < 7; i++) {
    const bh = maxH * [.34,.57,.43,.79,.62,.91,.71][i] * smooth(local, -12 + i * 4, 35 + i * 4);
    ctx.fillStyle = i === 5 ? red : blue;
    const bw = area.w * .074, bx = left + i * area.w * .113;
    ctx.fillRect(bx, bottom - bh, bw, bh);
  }
  // Connected line plots evolving alongside bar geometry.
  ctx.save();
  ctx.beginPath();ctx.rect(left, area.y + area.h * .41, area.w * .81 * p, area.h * .49);ctx.clip();
  ctx.lineWidth = Math.max(2, area.w * .004);ctx.strokeStyle = red;ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const x = left + i * area.w * .113 + area.w * .037;
    const y = bottom - maxH * [.36,.48,.44,.64,.60,.86,.91][i] - area.h * .13;
    if (i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke();ctx.restore();
}

function drawResolve(ctx, area, frame, art) {
  const local = Math.min(frame - 270, 59); // last 30 frames are a deliberate static final hold
  const p = smooth(local, -16, 29);
  panel(ctx, area.x, area.y, area.w, area.h, area.w * .023, ink, '#323439');
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = '#394048';ctx.lineWidth = Math.max(1, area.w * .001);
    ctx.strokeRect(area.x + area.w * (.065 + i * .012),
      area.y + area.h * (.09 + i * .018),area.w * (.87 - i * .024),area.h * (.82 - i * .036));
  }
  const cx = area.x + area.w * .76, cy = area.y + area.h * .48;
  const size = Math.min(area.h * .40,area.w * .26);
  ctx.save();ctx.translate(cx,cy);
  ctx.rotate((1 - p) * -.16); ctx.globalAlpha = p;
  ctx.drawImage(art.image,-size/2,-size/2,size,size);
  ctx.restore();
  label(ctx, 'MAKE', area.x + area.w * .09, area.y + area.h * .46, area.w * .115, paper);
  label(ctx, 'IT MOVE.', area.x + area.w * .09, area.y + area.h * .64, area.w * .115, paper);
  label(ctx, 'DESIGN  /  MOTION  /  SYSTEM', area.x + area.w * .09,
    area.y + area.h * .83, area.w * .026, '#B6C6D7');
}

function renderStage(ctx, area, index, frame, art) {
  ctx.save();
  if (index === 0) drawOpener(ctx, area, frame, art, false);
  if (index === 1) drawControl(ctx, area, frame);
  if (index === 2) drawData(ctx, area, frame);
  if (index === 3) drawResolve(ctx, area, frame, art);
  ctx.restore();
}

function drawGraphics(ctx, spec, frame, layout, art) {
  const {stage} = layout, tr = advancedTransition(spec,frame);
  if (tr.incoming === null) {
    renderStage(ctx,stage,tr.current,frame,art);
  } else {
    // Spatial wipe with no empty frame: outgoing occupies right, incoming left.
    const cut = stage.x + stage.w * tr.progress;
    ctx.save();ctx.beginPath();ctx.rect(cut,stage.y,stage.x+stage.w-cut,stage.h);ctx.clip();
    renderStage(ctx,stage,tr.current,frame,art);ctx.restore();
    ctx.save();ctx.beginPath();ctx.rect(stage.x,stage.y,cut-stage.x,stage.h);ctx.clip();
    renderStage(ctx,stage,tr.incoming,frame,art);ctx.restore();
    ctx.fillStyle = red;
    ctx.fillRect(cut-Math.max(1,stage.w*.002),stage.y,Math.max(2,stage.w*.004),stage.h);
  }
}

function drawSignal(ctx, state, w, h, layout) {
  // Render the same persistent-ID object AFTER the visual system, so it stays
  // physically connected to every state rather than getting erased by a card.
  const signal = state.objects.find(o => o.id === 'signal');
  if (!signal || signal.opacity <= 0 || signal.reveal <= 0) return;
  ctx.save();
  ctx.translate(w * (.5 + state.camera.x), h * (.5 + state.camera.y));
  ctx.scale(state.camera.zoom,state.camera.zoom); ctx.translate(-w*.5,-h*.5);
  const bx = signal.x*w, by = signal.y*h, bw = signal.width*w, bh = signal.height*h;
  ctx.translate(bx,by);ctx.rotate(signal.rotation);
  ctx.globalAlpha = signal.opacity;
  ctx.beginPath();ctx.rect(0,0,bw*signal.reveal,bh);ctx.clip();
  ctx.fillStyle = signal.color;
  rounded(ctx,0,0,bw,bh,signal.radius*Math.min(w,h));ctx.fill();
  ctx.restore();
  // A tiny white locus is visible only in the control beat and tracks the object.
  if (state.segment_id === 'control') {
    ctx.save(); ctx.globalAlpha = smooth(state.frame,86,122);
    const x = bx + bw*.12, y = by + bh*.5;
    ctx.fillStyle = '#fff';ctx.beginPath();ctx.arc(x,y,Math.max(2,bh*.17),0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
}

export function drawAdvancedFrame(profile, frame, spec, art) {
  if (!profile || profile.fps !== 30 || profile.frames !== spec?.motion?.duration_frames ||
      !art?.image || !Number.isInteger(profile.width) || !Number.isInteger(profile.height) ||
      profile.width < 1 || profile.height < 1) throw new Error('Invalid advanced render context');
  const state = evaluateMultiObjectFrame(spec.motion,frame);
  const {width:w,height:h} = profile, canvas = createCanvas(w,h), ctx = canvas.getContext('2d');
  const layout = stageLayout(w,h);
  ctx.fillStyle = paper; ctx.fillRect(0,0,w,h);
  // Motion and stage exchange through a common time base; static final hold.
  drawGraphics(ctx,spec,frame,layout,art);
  drawSignal(ctx,state,w,h,layout);
  drawTypography(ctx,spec,frame,layout,w,h);
  // The pilot's end is a held composition, never a one-frame fade-to-nothing.
  return canvas;
}

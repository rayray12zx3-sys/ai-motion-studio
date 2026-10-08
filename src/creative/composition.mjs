import {createCanvas} from '@napi-rs/canvas';
import {preciseEase} from './motion.mjs';

// Standalone opt-in composition. No network, mutable frame history or arbitrary expressions.
const fields = ['x', 'y', 'width', 'height', 'radius', 'opacity', 'rotation', 'reveal'];
const cameraFields = ['x', 'y', 'zoom'];
const exact = (v, keys) => v !== null && typeof v === 'object' && !Array.isArray(v) &&
  Object.keys(v).sort().join(',') === keys.slice().sort().join(',');
const validId = id => typeof id === 'string' && /^[a-z][a-z0-9-]{0,47}$/.test(id);
const within = (value, low, high) => typeof value === 'number' && Number.isFinite(value) && value >= low && value <= high;
const shapeBounds = {x: [-.4,1.4], y: [-.4,1.4], width:[.002,1.2], height:[.002,1.2],
  radius:[0,.6], opacity:[0,1], rotation:[-Math.PI,Math.PI], reveal:[0,1]};
const cameraBounds = {x:[-.2,.2], y:[-.2,.2], zoom:[.75,1.5]};

function validateKeys(keys, duration, dimensions, limits, maximum) {
  if (!Array.isArray(keys) || keys.length < 2 || keys.length > maximum) throw new Error('Invalid timeline length');
  let previous = -1;
  for (const key of keys) {
    if (!exact(key, ['frame','ease',...dimensions]) ||
        !Number.isInteger(key.frame) || key.frame <= previous || key.frame >= duration ||
        !['linear','precise'].includes(key.ease)) throw new Error('Invalid timeline keyframe');
    previous = key.frame;
    for (const d of dimensions) {
      if (!within(key[d], ...limits[d])) throw new Error('Timeline value outside bound: ' + d);
    }
  }
  if (keys[0].frame !== 0 || keys.at(-1).frame !== duration - 1) throw new Error('Incomplete timeline coverage');
}

function interpolate(keys, frame, dimensions) {
  let index = 1;
  while (index < keys.length - 1 && frame > keys[index].frame) index++;
  const left = keys[index-1], right = keys[index];
  const amount = (frame - left.frame) / (right.frame - left.frame);
  const progress = right.ease === 'precise' ? preciseEase(amount) : amount;
  return Object.fromEntries(dimensions.map(d => [d, left[d] + (right[d] - left[d]) * progress]));
}

export function validateMultiObjectSpec(spec) {
  if (!exact(spec, ['version','fps','duration_frames','background','segments','camera','objects']) ||
      spec.version !== 1 || spec.fps !== 30 ||
      !Number.isInteger(spec.duration_frames) || spec.duration_frames < 360 || spec.duration_frames > 450 ||
      typeof spec.background !== 'string' || !/^#[a-fA-F0-9]{6}$/.test(spec.background)) {
    throw new Error('Invalid multi-object composition spec');
  }
  if (!Array.isArray(spec.segments) || spec.segments.length < 4 || spec.segments.length > 5) {
    throw new Error('Expected four or five segments');
  }
  let cursor = 0; const ids = new Set();
  for (const segment of spec.segments) {
    if (!exact(segment,['id','start','end']) || !validId(segment.id) || ids.has(segment.id) ||
        !Number.isInteger(segment.start) || !Number.isInteger(segment.end) ||
        segment.start !== cursor || segment.end - segment.start < 24 ||
        segment.end > spec.duration_frames) throw new Error('Discontinuous or invalid segments');
    ids.add(segment.id); cursor = segment.end;
  }
  if (cursor !== spec.duration_frames) throw new Error('Segment duration mismatch');
  validateKeys(spec.camera, spec.duration_frames, cameraFields, cameraBounds, 16);
  if (!Array.isArray(spec.objects) || spec.objects.length < 2 || spec.objects.length > 12) {
    throw new Error('Expected 2–12 objects');
  }
  const objectIds = new Set();
  for (const obj of spec.objects) {
    if (!exact(obj,['id','type','z','color','keyframes']) ||
        !validId(obj.id) || objectIds.has(obj.id) || obj.type !== 'rounded-rect' ||
        !Number.isInteger(obj.z) || obj.z < 0 || obj.z > 20 ||
        typeof obj.color !== 'string' || !/^#[a-fA-F0-9]{6}$/.test(obj.color)) {
      throw new Error('Invalid object properties');
    }
    objectIds.add(obj.id);
    validateKeys(obj.keyframes, spec.duration_frames, fields, shapeBounds, 24);
  }
  if (!objectIds.has('signal')) throw new Error('Persistent signal object required');
  const signal = spec.objects.find(o => o.id === 'signal');
  for (const segment of spec.segments) {
    const state = interpolate(signal.keyframes, segment.start, fields);
    if (state.opacity < .95 || state.reveal < .05) throw new Error('Signal object missing at segment boundary');
  }
}

export function evaluateMultiObjectFrame(spec, frame) {
  validateMultiObjectSpec(spec);
  if (!Number.isInteger(frame) || frame < 0 || frame >= spec.duration_frames) {
    throw new Error('Frame outside composition');
  }
  const segment = spec.segments.find(s => frame >= s.start && frame < s.end);
  return {frame, segment_id: segment.id,
    camera: interpolate(spec.camera, frame, cameraFields),
    objects: spec.objects.map(o => ({id:o.id, type:o.type, z:o.z, color:o.color,
      ...interpolate(o.keyframes, frame, fields)})).sort((a,b) => a.z-b.z || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))};
}

function roundedPath(ctx, w, h, r) {
  r = Math.max(0, Math.min(r, w/2, h/2));
  ctx.beginPath(); ctx.moveTo(r,0); ctx.lineTo(w-r,0); ctx.quadraticCurveTo(w,0,w,r);
  ctx.lineTo(w,h-r); ctx.quadraticCurveTo(w,h,w-r,h);
  ctx.lineTo(r,h); ctx.quadraticCurveTo(0,h,0,h-r);
  ctx.lineTo(0,r); ctx.quadraticCurveTo(0,0,r,0); ctx.closePath();
}
export function drawMultiObjectFrame(profile, frame, spec) {
  if (!profile || profile.fps !== 30 || !Number.isInteger(profile.width) ||
      !Number.isInteger(profile.height) || profile.width <= 0 || profile.height <= 0 ||
      profile.frames !== spec?.duration_frames) throw new Error('Composition profile mismatch');
  const state = evaluateMultiObjectFrame(spec, frame);
  const w = profile.width, h = profile.height;
  const canvas = createCanvas(w,h), ctx = canvas.getContext('2d');
  ctx.fillStyle = spec.background; ctx.fillRect(0,0,w,h);
  ctx.save();
  ctx.translate(w*(.5+state.camera.x),h*(.5+state.camera.y));
  ctx.scale(state.camera.zoom,state.camera.zoom);
  ctx.translate(-w*.5,-h*.5);
  for (const o of state.objects) {
    if (o.opacity <= 0 || o.reveal <= 0) continue;
    const bw = o.width*w, bh = o.height*h;
    ctx.save(); ctx.translate(o.x*w,o.y*h); ctx.rotate(o.rotation);
    ctx.globalAlpha = o.opacity;
    ctx.beginPath(); ctx.rect(0,0,bw*o.reveal,bh); ctx.clip();
    ctx.fillStyle = o.color; roundedPath(ctx,bw,bh,o.radius*Math.min(w,h)); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  return canvas;
}

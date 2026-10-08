import {createCanvas} from '@napi-rs/canvas';
import {fontFamily, validateSpec} from '../free/scene.mjs';
import {linearProgress, snapProgress} from './motion.mjs';

const fields = ['accent', 'layout', 'scene_id', 'style_id', 'subtitle', 'tempo', 'title'];
const accents = Object.freeze({coral: '#D13E32', cobalt: '#2459C6'});
const ink = '#18191C';
const paper = '#F3F1EB';

export const editorialExample = Object.freeze({
  scene_id: 'editorial-motion', style_id: 'editorial-motion',
  title: '精準動態', subtitle: '節奏設計',
  layout: 'stacked', accent: 'coral', tempo: 'measured',
});

export function validateEditorialSpec(spec) {
  if (!spec || typeof spec !== 'object' || Array.isArray(spec) ||
      Object.keys(spec).sort().join(',') !== fields.join(',')) {
    throw new Error('Editorial scene requires exactly seven fixed fields');
  }
  if (spec.scene_id !== 'editorial-motion' || spec.style_id !== 'editorial-motion' ||
      !['stacked', 'split'].includes(spec.layout) || !Object.hasOwn(accents, spec.accent) ||
      !['measured', 'brisk'].includes(spec.tempo)) {
    throw new Error('Unsupported editorial scene/style/layout/accent/tempo');
  }
  validateSpec({title: spec.title, subtitle: spec.subtitle});
  if ([...spec.title].length > 18 || [...spec.subtitle].length > 24) {
    throw new Error('Editorial text exceeds bounded pilot copy limit');
  }
}

function fittedFont(ctx, value, maxWidth, requested, minimum) {
  let size = requested;
  ctx.font = size + 'px ' + fontFamily;
  const width = ctx.measureText(value).width;
  if (!Number.isFinite(width)) throw new Error('Unmeasurable editorial text');
  if (width > maxWidth) size = Math.floor(size * maxWidth / width);
  if (size < minimum) throw new Error('Editorial text exceeds safe layout width');
  ctx.font = size + 'px ' + fontFamily;
  if (ctx.measureText(value).width > maxWidth) throw new Error('Editorial text exceeds safe layout width');
  return size;
}

// Layout and text-size preflight is driven by actual profile dimensions.
// For portrait, a split layout becomes a lower graphic module.
function resolveLayout(ctx, profile, spec) {
  validateEditorialSpec(spec);
  if (!profile || profile.fps !== 30 || !Number.isInteger(profile.width) ||
      !Number.isInteger(profile.height) || profile.width <= 0 || profile.height <= 0 ||
      !Number.isInteger(profile.frames) || profile.frames <= 0) {
    throw new Error('Invalid editorial rendering profile');
  }
  const {width: w, height: h} = profile;
  const portrait = h > w;
  const margin = Math.round(w * (portrait ? 0.095 : 0.085));
  const textX = margin;
  const textMaxWidth = w * (portrait ? 0.81 : (spec.layout === 'split' ? 0.53 : 0.73));
  const baseTitle = Math.round(Math.min(w * (portrait ? 0.115 : 0.095), h * 0.15));
  const baseSubtitle = Math.round(Math.min(w * (portrait ? 0.059 : 0.039), h * 0.09));
  const titleSize = fittedFont(ctx, spec.title, textMaxWidth, baseTitle, Math.round(baseTitle * 0.62));
  const subtitleSize = fittedFont(ctx, spec.subtitle, textMaxWidth, baseSubtitle, Math.round(baseSubtitle * 0.65));
  const titleY = Math.round(h * (portrait ? 0.405 : 0.465));
  const subtitleY = Math.round(h * (portrait ? 0.515 : 0.608));
  if (titleY + titleSize * 0.25 + h * 0.02 > subtitleY - subtitleSize ||
      subtitleY > h * 0.73) {
    throw new Error('Editorial text blocks collide or leave safe area');
  }
  let panel;
  if (portrait && spec.layout === 'split') {
    panel = {x: margin, y: Math.round(h * 0.665), w: w - margin * 2, h: Math.round(h * 0.2)};
  } else if (portrait) {
    panel = {x: Math.round(w * 0.72), y: Math.round(h * 0.685), w: Math.round(w * 0.18), h: Math.round(h * 0.14)};
  } else if (spec.layout === 'split') {
    panel = {x: Math.round(w * 0.7), y: Math.round(h * 0.27), w: Math.round(w * 0.215), h: Math.round(h * 0.55)};
  } else {
    panel = {x: Math.round(w * 0.83), y: Math.round(h * 0.42), w: Math.round(w * 0.09), h: Math.round(h * 0.24)};
  }
  return {portrait, margin, textX, textMaxWidth, titleSize, subtitleSize,
    titleY, subtitleY, panel};
}

export function getEditorialLayout(profile, spec) {
  const ctx = createCanvas(1, 1).getContext('2d');
  return resolveLayout(ctx, profile, spec);
}

function maskedText(ctx, value, x, y, size, progress, colour, maxWidth) {
  if (progress <= 0) return;
  ctx.save();
  ctx.font = size + 'px ' + fontFamily;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillStyle = colour;
  const top = y - size * 1.13;
  const height = size * 1.42;
  ctx.beginPath();
  ctx.rect(x - 2, top + (1 - progress) * height, maxWidth + 4, height * progress);
  ctx.clip();
  ctx.fillText(value, x, y + (1 - progress) * size * 0.48);
  ctx.restore();
}

function staggerText(ctx, value, x, y, size, frame, tempo, maxWidth) {
  const letters = [...value];
  ctx.font = size + 'px ' + fontFamily;
  const widths = letters.map(char => ctx.measureText(char).width);
  const total = widths.reduce((a, b) => a + b, 0);
  if (total > maxWidth + 1) throw new Error('Editorial stagger exceeds safe width');
  const step = tempo === 'brisk' ? 2 : 3;
  const entry = tempo === 'brisk' ? 35 : 44;
  const duration = tempo === 'brisk' ? 14 : 18;
  let cursor = x;
  for (let i = 0; i < letters.length; i++) {
    const p = snapProgress(frame, entry + i * step, entry + i * step + duration);
    maskedText(ctx, letters[i], cursor, y, size, p, ink, widths[i] + 1);
    cursor += widths[i];
  }
}

export function drawEditorialFrame(profile, frame, spec) {
  if (!Number.isInteger(frame) || !profile || frame < 0 || frame >= profile.frames) {
    throw new Error('Invalid editorial frame');
  }
  const {width: w, height: h} = profile;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  const layout = resolveLayout(ctx, profile, spec);
  const signal = accents[spec.accent];
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, w, h);

  // A structural rule, not a fade or decorative noise.
  const ruleProgress = snapProgress(frame, 0, spec.tempo === 'brisk' ? 12 : 18);
  const ruleLength = Math.round(w * (layout.portrait ? 0.43 : 0.32) * ruleProgress);
  ctx.fillStyle = signal;
  ctx.fillRect(layout.margin, Math.round(h * 0.16), ruleLength, Math.max(3, Math.round(w * 0.005)));

  const titleEntry = spec.tempo === 'brisk' ? [9, 39] : [12, 55];
  maskedText(ctx, spec.title, layout.textX, layout.titleY,
    layout.titleSize, snapProgress(frame, ...titleEntry), ink, layout.textMaxWidth);
  staggerText(ctx, spec.subtitle, layout.textX, layout.subtitleY,
    layout.subtitleSize, frame, spec.tempo, layout.textMaxWidth);

  const p = snapProgress(frame, spec.tempo === 'brisk' ? 70 : 92,
    spec.tempo === 'brisk' ? 108 : 132);
  const panel = layout.panel;
  ctx.fillStyle = signal;
  ctx.fillRect(panel.x, panel.y, Math.round(panel.w * p), panel.h);
  if (p > 0.97) {
    ctx.fillStyle = paper;
    const unit = Math.max(2, Math.round(Math.min(panel.w, panel.h) * 0.045));
    ctx.fillRect(panel.x + unit * 2, panel.y + unit * 2, Math.max(1, panel.w * 0.38), unit);
    ctx.fillRect(panel.x + unit * 2, panel.y + unit * 4, Math.max(1, panel.w * 0.21), unit);
  }
  // Thin neutral baseline cues preserve the typographic grid without extra assets.
  ctx.fillStyle = '#A6A7A7';
  ctx.fillRect(layout.margin, Math.round(h * 0.91), w - 2 * layout.margin, Math.max(1, Math.round(w * 0.0012)));
  return canvas;
}

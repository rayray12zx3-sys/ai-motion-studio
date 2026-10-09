import {createCanvas, GlobalFonts} from '@napi-rs/canvas';
import {readdirSync, readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const fontDirectory = join(dirname(fileURLToPath(import.meta.resolve('@fontsource/noto-sans-tc/package.json'))), 'files');
GlobalFonts.removeAll();
export const fontFiles = readdirSync(fontDirectory).filter(name => name.endsWith('-400-normal.woff2')).sort();
if (!fontFiles.length) throw new Error('Locked font package is empty');
const aliases = fontFiles.map((file, i) => {
  const alias = `MotionTC${i}`;
  if (!GlobalFonts.registerFromPath(join(fontDirectory, file), alias)) throw new Error('Locked font could not load');
  return alias;
});
export const fontFamily = aliases.map(a => `"${a}"`).join(',');
const fontCss = readFileSync(join(fontDirectory, '..', '400.css'), 'utf8');
const coverage = [...fontCss.matchAll(/unicode-range:\s*([^;]+);/g)].flatMap(match => match[1].split(',').map(token => {
  const bounds = /^U\+([0-9a-f]+)(?:-([0-9a-f]+))?$/i.exec(token.trim());
  if (!bounds) throw new Error('Unsupported locked font coverage metadata');
  return [parseInt(bounds[1], 16), parseInt(bounds[2] ?? bounds[1], 16)];
}));
if (!coverage.length) throw new Error('Locked font coverage is empty');
export const fontManifest = fontFiles.map(name => ({name,
  sha256: createHash('sha256').update(readFileSync(join(fontDirectory, name))).digest('hex')}));
export const profiles = Object.freeze({
  landscape: {width: 1920, height: 1080, fps: 30, frames: 180},
  vertical: {width: 1080, height: 1920, fps: 30, frames: 180},
  smoke: {width: 360, height: 640, fps: 30, frames: 30},
});
export const demo = Object.freeze({title: 'Motion Studio', subtitle: '確定性動畫・本機免費渲染'});

export function validateSpec(spec) {
  if (!spec || Object.keys(spec).some(k => !['title', 'subtitle'].includes(k)) ||
      ['title', 'subtitle'].some(k => typeof spec[k] !== 'string' || !spec[k].trim() || spec[k].length > 80 || /[\p{C}]/u.test(spec[k]))) {
    throw new Error('Scene requires bounded title/subtitle text only');
  }
  if (Object.values(spec).some(s => /[^\u0020-\u007e\u3000-\u303f\u3400-\u9fff\uff01-\uff60・]/u.test(s))) throw new Error('Unsupported glyph range');
  if (Object.values(spec).some(s => [...s].some(char => !coverage.some(([low, high]) => {
    const code = char.codePointAt(0); return code >= low && code <= high;
  })))) throw new Error('Text contains a glyph absent from locked font coverage');
}

const ease = t => 1 - (1 - Math.max(0, Math.min(1, t))) ** 3;
function wrappedText(ctx, text, x, y, width, size) {
  ctx.font = `${size}px ${fontFamily}`;
  const lines = [];
  let line = '';
  for (const char of text) {
    if (ctx.measureText(line + char).width > width && line) { lines.push(line); line = ''; }
    line += char;
  }
  lines.push(line);
  if (lines.length > 3) throw new Error('Text exceeds scene layout');
  lines.forEach((s, i) => ctx.fillText(s, x, y + (i - (lines.length - 1) / 2) * size * 1.25));
}

// Foreground painter is shared by both delivery modes; the legacy opaque
// renderer still draws directly onto the *same* background canvas (no second
// composite or pixel conversion) to preserve byte-for-byte RGBA compatibility.
function checkFrame(profile,frame,spec){
  validateSpec(spec);
  if(!profile||!Number.isInteger(frame)||frame<0||frame>=profile.frames)
    throw new Error('Invalid frame');
}
function paintForeground(ctx,profile,frame,spec){
  const {width:w,height:h,fps,frames}=profile;
  const t = frame / fps;
  const show = ease(t / 0.65) * Math.min(1, (frames - 1 - frame) / Math.max(1, fps * 0.4));
  ctx.globalAlpha = Math.max(0, show);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#f8fafc';
  const unit = Math.min(w, h);
  wrappedText(ctx, spec.title, w / 2, h * 0.44 + (1 - ease(t / 0.65)) * unit * 0.08, w * 0.78, unit * 0.075);
  ctx.fillStyle = '#b7ddf4';
  wrappedText(ctx, spec.subtitle, w / 2, h * 0.55, w * 0.8, unit * 0.034);
  ctx.fillStyle = '#43d8de';
  const length = unit * 0.42 * ease((t - 0.35) / 0.6);
  ctx.fillRect((w - length) / 2, h * 0.61, length, Math.max(2, unit * 0.004));
}

// Explicit opt-in: transparent RGBA foreground only. This is an in-memory
// Canvas and does not alter the existing render CLI or opaque MP4 outputs.
export function drawForegroundFrame(profile,frame,spec=demo){
  checkFrame(profile,frame,spec);
  const canvas=createCanvas(profile.width,profile.height);
  paintForeground(canvas.getContext('2d'),profile,frame,spec);
  return canvas;
}

export function drawFrame(profile,frame,spec=demo){
  checkFrame(profile,frame,spec);
  const {width:w,height:h}=profile;
  const canvas=createCanvas(w,h);
  const ctx=canvas.getContext('2d');
  const g=ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0,'#071326');g.addColorStop(1,'#18365a');
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  paintForeground(ctx,profile,frame,spec);
  return canvas;
}

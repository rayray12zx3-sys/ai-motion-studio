// S1 isolated, dependency-free neutral editor data model. NOT a production renderer.
// Frames are integer positions at exactly 30fps; clip ends are exclusive.
const FIELDS = ['x', 'y', 'scale', 'rotation', 'opacity'];
const LIMITS = {x: [-0.5, 1.5], y: [-0.5, 1.5], scale: [0.05, 3], rotation: [-Math.PI, Math.PI], opacity: [0, 1]};
const EASINGS = new Set(['linear', 'hold', 'ease-out-cubic']);
const PROFILES = new Set(['landscape', 'vertical', 'smoke']);
const ID = /^[a-z][a-z0-9-]{0,47}$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
const MAX_JSON_LENGTH = 65536;

function exact(value, keys) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype &&
    Object.keys(value).length === keys.length && keys.every(k => Object.hasOwn(value, k));
}
function bounded(value, low, high) {
  return typeof value === 'number' && Number.isFinite(value) && value >= low && value <= high;
}
function integer(value, low, high) {
  return Number.isSafeInteger(value) && value >= low && value <= high;
}
function reject(reason) { throw new Error('EditableSceneSpec: ' + reason); }

export function validateEditableSpec(spec) {
  if (!exact(spec, ['kind', 'version', 'id', 'profile', 'fps', 'durationFrames', 'layers']) ||
      spec.kind !== 'editable-scene-spec' || spec.version !== 1 ||
      typeof spec.id !== 'string' || !ID.test(spec.id) ||
      !PROFILES.has(spec.profile) || spec.fps !== 30 ||
      !integer(spec.durationFrames, 30, 450) ||
      !Array.isArray(spec.layers) || spec.layers.length < 1 || spec.layers.length > 12) {
    reject('invalid document header or layer count');
  }
  const ids = new Set();
  for (const layer of spec.layers) {
    const common = ['id', 'type', 'z', 'color', 'width', 'height', 'clip', 'keyframes', 'source'];
    if (!exact(layer, layer?.type === 'text' ? [...common, 'text', 'fontId'] : common) ||
        !['rect', 'text'].includes(layer.type) ||
        typeof layer.id !== 'string' || !ID.test(layer.id) || ids.has(layer.id) ||
        !integer(layer.z, 0, 100) || typeof layer.color !== 'string' || !HEX.test(layer.color) ||
        !bounded(layer.width, 0.001, 1.2) || !bounded(layer.height, 0.001, 1.2) ||
        !exact(layer.source, ['kind']) || layer.source.kind !== 'synthetic') {
      reject('invalid layer fields, duplicate ID or unsupported asset source');
    }
    ids.add(layer.id);
    if (layer.type === 'text' && (typeof layer.text !== 'string' ||
        !layer.text.trim() || [...layer.text].length > 80 || /\p{C}/u.test(layer.text) ||
        layer.fontId !== 'noto-sans-tc-400')) reject('invalid text or unlocked font');
    if (!exact(layer.clip, ['start', 'end']) ||
        !integer(layer.clip.start, 0, spec.durationFrames - 2) ||
        !integer(layer.clip.end, layer.clip.start + 2, spec.durationFrames)) {
      reject('invalid half-open clip interval');
    }
    if (!Array.isArray(layer.keyframes) || layer.keyframes.length < 2 || layer.keyframes.length > 24) {
      reject('invalid keyframe count');
    }
    let previous = -1;
    for (const key of layer.keyframes) {
      if (!exact(key, ['frame', 'ease', ...FIELDS]) ||
          !integer(key.frame, layer.clip.start, layer.clip.end - 1) ||
          key.frame <= previous || !EASINGS.has(key.ease) ||
          FIELDS.some(field => !bounded(key[field], ...LIMITS[field]))) {
        reject('invalid keyframe, easing or transform bounds');
      }
      previous = key.frame;
    }
    if (layer.keyframes[0].frame !== layer.clip.start ||
        layer.keyframes.at(-1).frame !== layer.clip.end - 1) reject('incomplete clip keyframe coverage');
  }
  return true;
}

function easing(kind, fraction) {
  if (kind === 'hold') return 0;
  if (kind === 'ease-out-cubic') return 1 - (1 - fraction) ** 3;
  return fraction;
}
function sample(keys, frame) {
  if (frame === keys.at(-1).frame) return Object.fromEntries(FIELDS.map(f => [f, keys.at(-1)[f]]));
  let rightIndex = 1;
  while (frame >= keys[rightIndex].frame) rightIndex++;
  const left = keys[rightIndex - 1], right = keys[rightIndex];
  const progress = easing(right.ease, (frame - left.frame) / (right.frame - left.frame));
  return Object.fromEntries(FIELDS.map(f => [f, left[f] + (right[f] - left[f]) * progress]));
}

export function evaluateEditableFrame(spec, frame) {
  validateEditableSpec(spec);
  if (!integer(frame, 0, spec.durationFrames - 1)) reject('frame outside document');
  const layers = spec.layers.filter(layer => frame >= layer.clip.start && frame < layer.clip.end)
    .map(layer => ({id: layer.id, type: layer.type, z: layer.z, color: layer.color,
      width: layer.width, height: layer.height,
      ...(layer.type === 'text' ? {text: layer.text, fontId: layer.fontId} : {}),
      ...sample(layer.keyframes, frame)}))
    .sort((a, b) => a.z - b.z || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return {frame, profile: spec.profile, layers};
}

// Canonical order makes save/reopen independent of insertion and object key order.
export function serializeEditableSpec(spec) {
  validateEditableSpec(spec);
  const layers = [...spec.layers].sort((a, b) => a.z - b.z || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map(layer => ({id: layer.id, type: layer.type, z: layer.z, color: layer.color,
      width: layer.width, height: layer.height, clip: {start: layer.clip.start, end: layer.clip.end},
      keyframes: layer.keyframes.map(k => ({frame: k.frame, ease: k.ease,
        x: k.x, y: k.y, scale: k.scale, rotation: k.rotation, opacity: k.opacity})),
      source: {kind: 'synthetic'},
      ...(layer.type === 'text' ? {text: layer.text, fontId: layer.fontId} : {})}));
  const json = JSON.stringify({kind: spec.kind, version: spec.version, id: spec.id,
    profile: spec.profile, fps: spec.fps, durationFrames: spec.durationFrames, layers});
  if (json.length > MAX_JSON_LENGTH) reject('serialized document exceeds size limit');
  return json;
}
export function parseEditableSpec(json) {
  if (typeof json !== 'string' || json.length > MAX_JSON_LENGTH) reject('invalid serialized document length');
  let spec;
  try { spec = JSON.parse(json); } catch { reject('malformed JSON'); }
  validateEditableSpec(spec);
  return JSON.parse(serializeEditableSpec(spec));
}

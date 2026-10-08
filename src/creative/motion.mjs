// Pure, bounded motion helpers for offline 30 fps Canvas scenes.
export const clamp01 = value => Math.max(0, Math.min(1, value));

export function linearProgress(frame, start, end) {
  if (!Number.isFinite(frame) || !Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new Error('Invalid motion interval');
  }
  return clamp01((frame - start) / (end - start));
}

// Fixed cubic-bezier(.7, 0, .2, 1); binary-search the x curve to avoid
// time-dependent state and runtime/browser easing dependencies.
export function preciseEase(value) {
  const t = clamp01(value);
  if (t === 0 || t === 1) return t;
  const x = u => 3 * (1 - u) ** 2 * u * 0.7 + 3 * (1 - u) * u ** 2 * 0.2 + u ** 3;
  const y = u => 3 * (1 - u) * u ** 2 + u ** 3;
  let low = 0, high = 1;
  for (let step = 0; step < 28; step++) {
    const mid = (low + high) / 2;
    if (x(mid) < t) low = mid;
    else high = mid;
  }
  return y((low + high) / 2);
}

export function snapProgress(frame, start, end) {
  return preciseEase(linearProgress(frame, start, end));
}

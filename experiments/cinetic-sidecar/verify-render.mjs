// Isolated C2 synthetic video verification; no user/company media inputs.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import ffmpeg from "ffmpeg-static";
import ffprobe from "ffprobe-static";

const folder = resolve(process.argv[2] || "out/cinetic-c2");
const plan = JSON.parse(readFileSync(join(folder, "validated-plan.json"), "utf8"));
const review = JSON.parse(readFileSync(join(folder, "review-gates.json"), "utf8"));
const font = JSON.parse(readFileSync(join(folder, "font-qa.json"), "utf8"));
const { width: W, height: H, fps, frames } = plan.render;
assert.equal(plan.engine, "cinetic-hyperframes");
assert.equal(plan.contentClass, "public-synthetic");
assert.equal(review.visual.status, "PENDING_INDEPENDENT_REVIEW");
assert.equal(review.artisticApproval.status, "PENDING_USER_APPROVAL");
assert.equal(review.commercialRights.status, "BLOCKED_PENDING_RUNTIME_AUDIT");
assert.equal(review.upstreamSelfCritiqueCanApprove, false);
assert.ok(font.resolvedFontFiles?.length > 0);

const hash = value => createHash("sha256").update(value).digest("hex");
function info(filename) {
  const path = join(folder, filename);
  const streams = JSON.parse(execFileSync(ffprobe.path, [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=codec_name,codec_tag_string,pix_fmt,width,height,r_frame_rate,nb_frames",
    "-of", "json", path
  ], { maxBuffer: 1024 * 1024 }).toString()).streams;
  const s = streams?.[0];
  assert.ok(s, filename + " missing video stream");
  assert.equal(s.width, W);
  assert.equal(s.height, H);
  assert.equal(s.r_frame_rate, fps + "/1");
  assert.equal(Number(s.nb_frames), frames);
  return s;
}
const mp4 = info("preview.mp4");
const mov = info("overlay-alpha.mov");
assert.equal(mp4.codec_name, "h264");
assert.equal(mov.codec_name, "prores");
assert.equal(mov.codec_tag_string, "ap4h");
assert.match(mov.pix_fmt, /^yuva444p/);

const sampleCandidates = [
  0, 8, Math.round(frames * .16), Math.round(frames * .33), Math.round(frames * .50),
  Math.round(frames * .66), Math.round(frames * .83), frames - 1,
  ...plan.beats.flatMap(b => [b.startFrame, Math.floor((b.startFrame+b.endFrame)/2), b.endFrame-1]),
];
const sampledFrames = [...new Set(sampleCandidates.filter(n => Number.isInteger(n) && n >= 0 && n < frames))].sort((a,b) => a-b);
function frame(media, index, pix_fmt) {
  const path = join(folder, media);
  const result = execFileSync(ffmpeg, [
    "-nostdin", "-v", "error", "-i", path,
    "-vf", "select=eq(n\\," + index + ")",
    "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", pix_fmt, "pipe:1"
  ], { maxBuffer: W * H * 4 + 65536 });
  assert.equal(result.length, W * H * (pix_fmt === "rgba" ? 4 : 3));
  return result;
}
const mp4Report = sampledFrames.map(index => ({ index, rgbSHA256: hash(frame("preview.mp4", index, "rgb24")) }));
assert.ok(new Set(mp4Report.map(x => x.rgbSHA256)).size >= 3, "no meaningful differences across sampled MP4 frames");

const alphaReport = sampledFrames.map(index => {
  const pixels = frame("overlay-alpha.mov", index, "rgba");
  let visible = 0, corner = 0, left = 0, right = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const a = pixels[(y * W + x) * 4 + 3];
    if (a > 8) visible++;
    if ((x < 8 || x >= W - 8) && (y < 8 || y >= H - 8) && a > 0) corner++;
    if (x < 8 && a > 0) left++;
    if (x >= W - 8 && a > 0) right++;
  }
  return { index, visibleAlphaPixels: visible, opaqueMarginCornerPixels: corner, leftNonzero: left, rightNonzero: right, rgbaSHA256: hash(pixels) };
});
if (["evidence-cards", "signal-ledger"].includes(plan.direction.visualMotif)) {
  assert.ok(alphaReport[0].visibleAlphaPixels > 1000, "Cinetic opening requires a visible synthetic story object from frame zero");
} else {
  assert.equal(alphaReport[0].visibleAlphaPixels, 0, "legacy abstract graph requires an empty first frame");
}
for (const x of alphaReport) {
  assert.equal(x.opaqueMarginCornerPixels, 0, "unwanted opaque corners");
  assert.equal(x.leftNonzero, 0, "left safe margin alpha leak");
  assert.equal(x.rightNonzero, 0, "right safe margin alpha leak");
}
assert.ok(alphaReport.slice(1).some(x => x.visibleAlphaPixels > 1000), "no visible alpha motion");
assert.ok(new Set(alphaReport.map(x => x.rgbaSHA256)).size >= 3, "alpha output appears stationary");

const report = {
  status: "SYNTHETIC_RENDER_TECHNICAL_QA_PASS_NOT_ART_APPROVAL",
  source: "ORIGINAL_PUBLIC_SYNTHETIC_ONLY",
  engine: "hyperframes-cli",
  enginePin: "0.8.143",
  director: "CINETIC_INSPIRED_CONTRACT_NOT_FULL_SKILL",
  render: { width: W, height: H, fps, frames, seconds: frames / fps },
  mp4: { codec: mp4.codec_name, bytes: statSync(join(folder, "preview.mp4")).size, sha256: hash(readFileSync(join(folder, "preview.mp4"))), frameSamples: mp4Report },
  alpha: { codec: mov.codec_name, pixFmt: mov.pix_fmt, tag: mov.codec_tag_string, bytes: statSync(join(folder, "overlay-alpha.mov")).size, sha256: hash(readFileSync(join(folder, "overlay-alpha.mov"))), frameSamples: alphaReport },
  font: { source: font.sourcePackage, shards: font.resolvedFontFiles },
  reviewStatus: review,
  nativeWindowsPremiere: "NOT_TESTED",
  commercialRights: "BLOCKED_PENDING_RUNTIME_AUDIT",
  userArt: "PENDING",
};
writeFileSync(join(folder, "technical-report.json"), JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
console.log("CINETIC_C2_SYNTHETIC_VIDEO_TECHNICAL_PASS", JSON.stringify({ mp4: report.mp4.sha256, mov: report.alpha.sha256, fontCount: report.font.shards.length }));

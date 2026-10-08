import {spawn, execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, writeFileSync, existsSync} from 'node:fs';
import {join, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import probe from 'ffprobe-static';
import {createCanvas, loadImage} from '@napi-rs/canvas';
import {profiles, demo, drawFrame, validateSpec, fontManifest} from '../src/free/scene.mjs';
import {drawEditorialFrame, validateEditorialSpec} from '../src/creative/editorial.mjs';

const ffmpeg = join(dirname(fileURLToPath(import.meta.resolve('ffmpeg-static/package.json'))), process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
const encoderHashes = {'win32-x64': '04e1307997530f9cf2fe35cba2ca7e8875ca91da02f89d6c7243df819c94ad00',
  'linux-x64': 'e7e7fb30477f717e6f55f9180a70386c62677ef8a4d4d1a5d948f4098aa3eb99'};
if (createHash('sha256').update(readFileSync(ffmpeg)).digest('hex') !== encoderHashes[`${process.platform}-${process.arch}`]) throw new Error('Encoder binary not approved');

if (process.argv.length > 5) throw new Error('Unexpected render arguments');
const profileName = process.argv[2] ?? 'smoke';
if (!Object.hasOwn(profiles, profileName)) throw new Error('Unknown delivery profile');
const profile = profiles[profileName];
// Private briefs stay outside Git. No URL, media/network input or provider is accepted.
const spec = process.argv[3] ? JSON.parse(readFileSync(process.argv[3], 'utf8')) : demo;
const creative = spec?.scene_id === 'editorial-motion';
const renderFrame = creative ? drawEditorialFrame : drawFrame;
if (creative) validateEditorialSpec(spec);
else validateSpec(spec);
// Check layout, Git provenance and environment before creating any output.
renderFrame(profile, 0, spec);
const outputKey = process.argv[4] ?? profileName;
if (!/^[a-z][a-z0-9-]{0,47}$/.test(outputKey)) throw new Error('Invalid output review directory');
if (Number(process.versions.node.split('.')[0]) !== 24) throw new Error('Node 24 is required');
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const gitRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {encoding: 'utf8', windowsHide: true}).trim();
if (resolve(process.cwd()) !== repoRoot || resolve(gitRoot) !== repoRoot) throw new Error('Run from the repository checkout root');
const source = execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8', windowsHide: true}).trim();
const dirty = Boolean(execFileSync('git', ['status', '--porcelain'], {encoding: 'utf8', windowsHide: true}).trim());
const directory = join('out', outputKey);
if (existsSync(directory)) throw new Error('Output directory already exists; use a fresh review directory');
mkdirSync(directory, {recursive: true});
const output = join(directory, 'motion.mp4');
if (existsSync(output)) throw new Error('Output already exists; use a fresh output directory');
const args = ['-hide_banner', '-loglevel', 'error', '-nostdin', '-n', '-f', 'rawvideo',
  '-pixel_format', 'rgba', '-video_size', `${profile.width}x${profile.height}`, '-framerate', String(profile.fps),
  '-i', 'pipe:0', '-an', '-c:v', 'libx264', '-threads', '1', '-preset', 'medium', '-crf', '18',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-map_metadata', '-1', output];
const processHandle = spawn(ffmpeg, args, {stdio: ['pipe', 'ignore', 'pipe'], windowsHide: true});
let errors = '';
processHandle.stderr.on('data', b => { errors += b.toString(); });
const completion = new Promise((resolve, reject) => {
  processHandle.on('error', reject);
  processHandle.on('close', code => code === 0 ? resolve() : reject(new Error(`Encoder exit ${code}: ${errors}`)));
});
completion.catch(() => {});
processHandle.stdin.on('error', () => {});
const selected = [0, Math.floor(profile.frames * 0.35), Math.floor(profile.frames * 0.7), profile.frames - 1];
const frameHashes = [];
try {
  for (let frame = 0; frame < profile.frames; frame++) {
    const canvas = renderFrame(profile, frame, spec);
    const data = Buffer.from(canvas.getContext('2d').getImageData(0, 0, profile.width, profile.height).data);
    frameHashes.push(createHash('sha256').update(data).digest('hex'));
    if (selected.includes(frame)) writeFileSync(join(directory, `frame-${frame}.png`), canvas.toBuffer('image/png'));
    if (!processHandle.stdin.write(data)) await Promise.race([
      once(processHandle.stdin, 'drain'),
      completion.then(() => { throw new Error('Encoder closed before all frames were sent'); }),
    ]);
  }
  processHandle.stdin.end();
  await completion;
} catch (error) { processHandle.kill(); await completion.catch(() => {}); throw error; }
const metadata = JSON.parse(execFileSync(probe.path, ['-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', output], {windowsHide: true}));
const video = metadata.streams.find(s => s.codec_type === 'video');
if (video?.codec_name !== 'h264' || video.width !== profile.width || video.height !== profile.height ||
    video.r_frame_rate !== `${profile.fps}/1` || Number(video.nb_read_frames) !== profile.frames) throw new Error('Render metadata mismatch');
const sheet = createCanvas(720, 480);
const ctx = sheet.getContext('2d'); ctx.fillStyle = '#101827'; ctx.fillRect(0, 0, 720, 480);
for (let i = 0; i < selected.length; i++) {
  const img = await loadImage(readFileSync(join(directory, `frame-${selected[i]}.png`)));
  const scale = Math.min(350 / img.width, 230 / img.height);
  ctx.drawImage(img, (i % 2) * 360 + (360 - img.width * scale) / 2,
    Math.floor(i / 2) * 240 + (240 - img.height * scale) / 2, img.width * scale, img.height * scale);
}
writeFileSync(join(directory, 'contact-sheet.png'), sheet.toBuffer('image/png'));
const sha256 = data => createHash('sha256').update(data).digest('hex');
writeFileSync(join(directory, 'render-report.json'), JSON.stringify({
  renderer: 'local-canvas-ffmpeg', profile, source_commit: source, source_dirty: dirty,
  node: process.version, lockfile_sha256: sha256(readFileSync('package-lock.json')),
  ffmpeg: execFileSync(ffmpeg, ['-version'], {encoding: 'utf8', windowsHide: true}).split('\n')[0],
  ffmpeg_binary_sha256: sha256(readFileSync(ffmpeg)), ffprobe_binary_sha256: sha256(readFileSync(probe.path)),
  scene_spec_sha256: sha256(Buffer.from(JSON.stringify(spec))), font_files: fontManifest, frame_hashes: frameHashes,
  output_sha256: sha256(readFileSync(output)), review_frames: selected,
  technical_qc: 'PASS', creative_qc: 'PENDING_HUMAN_REVIEW', approval: 'UNAPPROVED',
  external_calls: 0, paid_calls: 0,
}, null, 2) + '\n');
console.log(JSON.stringify({profile: profileName, frames: profile.frames, technical_qc: 'PASS', creative_qc: 'PENDING_HUMAN_REVIEW'}));

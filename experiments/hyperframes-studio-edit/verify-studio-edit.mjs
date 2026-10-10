import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const outDir = path.join(repoRoot, 'out');
const workDir = path.join(__dirname, 'work');

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(workDir, { recursive: true });

// Ensure ffmpeg-static and ffprobe-static are on PATH
try {
  const ffmpegStatic = execSync("node -p \"require('ffmpeg-static')\"", { encoding: 'utf8', cwd: repoRoot }).trim();
  const ffprobeStatic = execSync("node -p \"require('ffprobe-static').path\"", { encoding: 'utf8', cwd: repoRoot }).trim();
  const ffmpegDir = path.dirname(ffmpegStatic);
  const ffprobeDir = path.dirname(ffprobeStatic);
  process.env.PATH = `${ffmpegDir}:${ffprobeDir}:${process.env.PATH}`;
} catch (e) {
  console.warn('Could not auto-add ffmpeg-static/ffprobe-static to PATH:', e.message);
}

const flags = {
  STUDIO_RENDERED: false,
  NATIVE_CLIP_UI_CHANGED: false,
  ON_DISK_PERSISTED: false,
  REOPEN_PERSISTED: false,
  AFTER_EDIT_RENDERED: false,
  NATIVE_KEYFRAME_EDIT: 'NATIVE_KEYFRAME_EDIT_NOT_SUPPORTED_BY_THIS_FIXTURE',
};

const report = {
  timestamp: new Date().toISOString(),
  cliVersion: '0.8.143',
  flags,
  details: {},
};

async function ensurePlaywright() {
  try {
    const imported = await import('playwright-core');
    const chromium = imported.chromium ?? imported.default?.chromium;
    if (!chromium || typeof chromium.launch !== 'function') throw new Error('playwright-core did not expose Chromium launcher');
    return chromium;
  } catch (e) {
    console.log('Installing playwright-core for studio verification...');
    execSync('npm install --no-save --ignore-scripts --no-audit --no-fund playwright-core@1.55.0', { cwd: __dirname, stdio: 'inherit', timeout: 90000 });
    const imported = await import('playwright-core');
    const chromium = imported.chromium ?? imported.default?.chromium;
    if (!chromium || typeof chromium.launch !== 'function') throw new Error('playwright-core did not expose Chromium launcher');
    return chromium;
  }
}

function findChromePath() {
  const candidates = [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    process.env.CHROME_BIN,
  ].filter(Boolean);
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function runFFmpeg(args) {
  let ffmpegBin = 'ffmpeg';
  try {
    const staticPath = execSync("node -p \"require('ffmpeg-static')\"", { encoding: 'utf8', cwd: repoRoot }).trim();
    if (fs.existsSync(staticPath)) ffmpegBin = staticPath;
  } catch (_) {}
  execSync(`"${ffmpegBin}" -y ${args}`, { stdio: 'pipe' });
}

async function run() {
  console.log('--- Starting Native HyperFrames Studio Edit -> Persist -> Render Verification ---');

  // 1. Prepare ephemeral working copy
  const srcHtmlPath = path.join(repoRoot, 'experiments/hyperframes-original/index.html');
  const workHtmlPath = path.join(workDir, 'index.html');
  const preEditContent = fs.readFileSync(srcHtmlPath, 'utf8');
  fs.writeFileSync(workHtmlPath, preEditContent, 'utf8');

  const port = 3099;

  // Ensure port is clear
  try {
    execSync(`npx hyperframes@0.8.143 preview "${workDir}" --stop`, { stdio: 'pipe' });
  } catch (_) {}

  console.log(`Starting hyperframes preview on port ${port}...`);
  execSync(`npx hyperframes@0.8.143 preview "${workDir}" --port ${port} --no-open --background`, { stdio: 'inherit' });

  let chromium;
  try {
    chromium = await ensurePlaywright();
  } catch (err) {
    console.error('Failed to load playwright-core:', err);
    process.exit(1);
  }

  const executablePath = findChromePath();
  console.log('Launching browser with executable:', executablePath || 'playwright default');

  const launchOpts = { headless: true };
  if (executablePath) launchOpts.executablePath = executablePath;

  const browser = await chromium.launch(launchOpts);
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    const studioUrl = `http://localhost:${port}/#project/work`;
    console.log(`Navigating to Studio UI: ${studioUrl}`);
    await page.goto(studioUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.timeline-clip', { timeout: 15000 });

    const screenshotPath = path.join(outDir, 'hyperframes-studio-loaded.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`Captured Studio GUI screenshot at ${screenshotPath}`);
    flags.STUDIO_RENDERED = true;

    // Select named clip 'Card Title'
    const clip = page.locator('.timeline-clip').filter({ hasText: 'Card Title' }).first();
    const clipBox = await clip.boundingBox();
    if (!clipBox) throw new Error('Timeline clip "Card Title" bounding box not found');

    console.log('Original Card Title clip position:', clipBox);

    // Mouse drag interaction to move clip start position
    const startX = clipBox.x + clipBox.width / 2;
    const startY = clipBox.y + clipBox.height / 2;
    const dragDistanceX = 150; // shift right

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + dragDistanceX, startY, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(1000);

    const clipAfterBox = await clip.boundingBox();
    if (!clipAfterBox || Math.abs(clipAfterBox.x - clipBox.x) < 2) {
      throw new Error('Native clip pointer drag did not cause observable GUI movement');
    }

    // Read updated working copy from disk
    const postEditContent = fs.readFileSync(workHtmlPath, 'utf8');
    if (postEditContent === preEditContent) {
      throw new Error('On-disk index.html was not modified after Studio mouse drag interaction');
    }

    console.log('On-disk HTML file updated successfully after Studio drag interaction.');
    flags.ON_DISK_PERSISTED = true;

    // Check timing differences in postEditContent
    const preMatch = preEditContent.match(/id="card-title"[^>]*data-start="([^"]+)"/);
    const postMatch = postEditContent.match(/id="card-title"[^>]*data-start="([^"]+)"/);
    report.details.preEditStart = preMatch ? preMatch[1] : '0';
    report.details.postEditStart = postMatch ? postMatch[1] : 'unknown';
    if (!preMatch || !postMatch || !Number.isFinite(Number(postMatch[1])) || Number(postMatch[1]) === Number(preMatch[1])) {
      throw new Error('Named card-title persisted start time did not change');
    }
    flags.NATIVE_CLIP_UI_CHANGED = true;
    console.log(`card-title start time changed from ${report.details.preEditStart}s to ${report.details.postEditStart}s`);

    // Reload Studio and verify reopened state retains edited timing
    console.log('Reloading Studio page to verify persistent UI state...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.timeline-clip', { timeout: 15000 });

    const reloadedClipAttr = await page.locator('.timeline-clip').filter({ hasText: 'Card Title' }).first().getAttribute('data-clip-start');
    console.log('Reloaded clip data-clip-start:', reloadedClipAttr);
    if (reloadedClipAttr === null || Math.abs(Number(reloadedClipAttr) - Number(postMatch[1])) > 0.00001) {
      throw new Error('Reload did not retain the exact saved clip start time');
    }
    flags.REOPEN_PERSISTED = true;

  } finally {
    await browser.close();
    try {
      execSync(`npx hyperframes@0.8.143 preview "${workDir}" --stop`, { stdio: 'inherit' });
    } catch (_) {}
  }

  // Render Before and After MP4s using relative paths from repo root
  const relSrcHtml = path.relative(repoRoot, srcHtmlPath);
  const relWorkHtml = path.relative(repoRoot, workHtmlPath);
  const relBeforeMp4 = path.relative(repoRoot, path.join(outDir, 'hyperframes-before.mp4'));
  const relAfterMp4 = path.relative(repoRoot, path.join(outDir, 'hyperframes-after.mp4'));

  console.log('Rendering original pre-edit scene...');
  execSync(`npx hyperframes@0.8.143 render -c "${relSrcHtml}" -o "${relBeforeMp4}" --fps 30 --quality draft`, { cwd: repoRoot, stdio: 'inherit' });

  console.log('Rendering post-edit persistent scene...');
  execSync(`npx hyperframes@0.8.143 render -c "${relWorkHtml}" -o "${relAfterMp4}" --fps 30 --quality draft`, { cwd: repoRoot, stdio: 'inherit' });

  // Compare frames at t=0.1s (frame index 3) where Card Title start changed
  const absBeforeMp4 = path.join(outDir, 'hyperframes-before.mp4');
  const absAfterMp4 = path.join(outDir, 'hyperframes-after.mp4');
  const frameBeforePng = path.join(outDir, 'frame_before_f3.png');
  const frameAfterPng = path.join(outDir, 'frame_after_f3.png');

  runFFmpeg(`-i "${absBeforeMp4}" -vf select='eq(n\\,3)' -vframes 1 "${frameBeforePng}"`);
  runFFmpeg(`-i "${absAfterMp4}" -vf select='eq(n\\,3)' -vframes 1 "${frameAfterPng}"`);

  const bufBefore = fs.readFileSync(frameBeforePng);
  const bufAfter = fs.readFileSync(frameAfterPng);

  if (!bufBefore.length || !bufAfter.length || bufBefore.equals(bufAfter)) {
    throw new Error('Rendered frames before and after Studio edit are pixel-identical! Expected frame differences.');
  }

  console.log('Confirmed rendered frame pixel difference between pre-edit and post-edit video output.');
  flags.AFTER_EDIT_RENDERED = true;
  for (const key of ['STUDIO_RENDERED','NATIVE_CLIP_UI_CHANGED','ON_DISK_PERSISTED','REOPEN_PERSISTED','AFTER_EDIT_RENDERED']) {
    if (flags[key] !== true) throw new Error('Missing required Studio verification gate: ' + key);
  }

  report.details.frameBeforeSize = bufBefore.length;
  report.details.frameAfterSize = bufAfter.length;

  const reportPath = path.join(outDir, 'hyperframes-studio-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Saved Studio verification report to ${reportPath}`);
  console.log('--- Studio GUI Edit -> Persist -> Render Verification COMPLETE ---');
  console.log('Flags:', JSON.stringify(flags, null, 2));
}

run().catch(err => {
  console.error('Studio verification FAILED:', err);
  process.exit(1);
});

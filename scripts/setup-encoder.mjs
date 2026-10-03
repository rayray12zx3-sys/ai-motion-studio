// Installation-only network ingress, never imported by the renderer.
import {createHash} from 'node:crypto';
import {existsSync, readFileSync, writeFileSync, chmodSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';
const platform = `${process.platform}-${process.arch}`;
const hashes = {
  'win32-x64': '04e1307997530f9cf2fe35cba2ca7e8875ca91da02f89d6c7243df819c94ad00',
  'linux-x64': 'e7e7fb30477f717e6f55f9180a70386c62677ef8a4d4d1a5d948f4098aa3eb99',
};
if (!Object.hasOwn(hashes, platform)) throw new Error('Encoder binary for this platform has not been verified');
const destination = join(dirname(fileURLToPath(import.meta.resolve('ffmpeg-static/package.json'))), process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
const digest = b => createHash('sha256').update(b).digest('hex');
if (existsSync(destination)) {
  if (digest(readFileSync(destination)) !== hashes[platform]) throw new Error('Encoder hash mismatch; refusing replacement');
} else {
  const response = await fetch(`https://github.com/eugeneware/ffmpeg-static/releases/download/b6.1.1/ffmpeg-${platform}.gz`);
  if (!response.ok) throw new Error(`Encoder download failed (${response.status})`);
  const binary = gunzipSync(Buffer.from(await response.arrayBuffer()));
  if (digest(binary) !== hashes[platform]) throw new Error('Encoder download hash mismatch');
  writeFileSync(destination, binary, {flag: 'wx'});
  chmodSync(destination, 0o755);
}
console.log('Pinned encoder hash PASS');

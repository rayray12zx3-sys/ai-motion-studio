import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, existsSync, readdirSync, unlinkSync, rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

test('invalid scene/layout fails before any output mutation', () => {
  const temp = mkdtempSync(join(tmpdir(), 'motion-preflight-'));
  try {
    const output = resolve('out');
    const before = existsSync(output) ? readdirSync(output) : [];
    for (const title of ['字'.repeat(80), '\u3400']) {
      const brief = join(temp, 'synthetic.json');
      writeFileSync(brief, JSON.stringify({title, subtitle: '測試'}));
      const result = spawnSync(process.execPath, ['scripts/render.mjs', 'smoke', brief], {encoding: 'utf8', windowsHide: true});
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /scene layout|locked font coverage/);
      assert.deepEqual(existsSync(output) ? readdirSync(output) : [], before);
    }
  } finally {
    const brief = join(temp, 'synthetic.json');
    if (existsSync(brief)) unlinkSync(brief);
    rmdirSync(temp);
  }
});

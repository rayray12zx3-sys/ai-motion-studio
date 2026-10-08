import {readdirSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
const forbidden = /\bfetch\s*\(|https?:\/\/|Math\.random\s*\(|Date\.(now|parse)\s*\(|new\s+Date\s*\(|toLocale\w*\s*\(|process\.env|from\s+['"](?:https?|remotion|@remotion)[/'"]/;
for (const directory of ['src/free', 'src/creative', 'scripts']) {
  for (const file of readdirSync(directory).filter(s => s.endsWith('.mjs'))) {
    const path = join(directory, file);
    execFileSync(process.execPath, ['--check', path], {windowsHide: true});
    if (!['lint.mjs', 'setup-encoder.mjs'].includes(file) && forbidden.test(readFileSync(path, 'utf8'))) throw new Error(`Nondeterministic/paid runtime input: ${path}`);
  }
}
console.log('Syntax and deterministic production-source guards PASS');

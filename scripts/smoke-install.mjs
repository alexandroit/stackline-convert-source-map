import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || command + ' failed');
  return result.stdout;
}

const root = new URL('..', import.meta.url).pathname;
const workspace = await mkdtemp(join(tmpdir(), 'stackline-convert-source-map-'));
const artifact = join(workspace, 'artifact');
const direct = join(workspace, 'direct');
const replacement = join(workspace, 'replacement');
await mkdir(artifact);
await mkdir(direct);
await mkdir(replacement);

const packOutput = run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', artifact], root);
const filename = JSON.parse(packOutput)[0].filename;
const tarball = join(artifact, filename);

await writeFile(join(direct, 'package.json'), JSON.stringify({ private: true }, null, 2));
run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball], direct);
await writeFile(join(direct, 'commonjs.cjs'), [
  "const convert = require('@stackline/convert-source-map');",
  "if (convert.fromJSON('{\"version\":3}').getProperty('version') !== 3) throw new Error('CommonJS smoke failed');"
].join('\n'));
await writeFile(join(direct, 'module.mjs'), [
  "import convert, { fromJSON } from '@stackline/convert-source-map';",
  "if (convert.fromJSON('{\"version\":3}').getProperty('version') !== 3) throw new Error('ESM default smoke failed');",
  "if (fromJSON('{\"version\":3}').getProperty('version') !== 3) throw new Error('ESM named smoke failed');"
].join('\n'));
run(process.execPath, ['commonjs.cjs'], direct);
run(process.execPath, ['module.mjs'], direct);

await writeFile(join(replacement, 'package.json'), JSON.stringify({
  private: true,
  dependencies: { 'convert-source-map': 'file:' + tarball }
}, null, 2));
run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], replacement);
await writeFile(join(replacement, 'replacement.cjs'), [
  "const convert = require('convert-source-map');",
  "if (convert.fromJSON('{\"version\":3}').getProperty('version') !== 3) throw new Error('replacement smoke failed');"
].join('\n'));
run(process.execPath, ['replacement.cjs'], replacement);

const installed = JSON.parse(await readFile(join(direct, 'node_modules/@stackline/convert-source-map/package.json'), 'utf8'));
if (installed.name !== '@stackline/convert-source-map') throw new Error('Wrong installed package');
console.log('Packed CommonJS, ESM, and replacement-name installs verified');

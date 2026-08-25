import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = new URL('../', import.meta.url);
const output = new URL('../site-dist/', import.meta.url);
const packageJson = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));

await rm(output, { force: true, recursive: true });
await mkdir(output, { recursive: true });
await cp(new URL('docs-site/', root), output, { recursive: true });
await mkdir(new URL('guides/', output), { recursive: true });
await mkdir(new URL('examples/', output), { recursive: true });
await cp(new URL('MIGRATION.md', root), new URL('guides/migration.md', output));
await cp(new URL('COMPATIBILITY_CONTRACT.md', root), new URL('guides/compatibility.md', output));
const example = await readFile(new URL('examples/basic.js', root), 'utf8');
await writeFile(new URL('examples/basic.js', output), example.replace("require('..')", "require('@stackline/convert-source-map')"), 'utf8');

await build({
  entryPoints: [fileURLToPath(new URL('index.js', root))],
  outfile: fileURLToPath(new URL('package.js', output)),
  bundle: true,
  format: 'iife',
  globalName: 'StacklineConvertSourceMap',
  legalComments: 'eof',
  minify: true,
  platform: 'browser'
});

for (const file of ['index.html', 'llms.txt', 'llms-full.txt', 'sitemap.xml']) {
  const fileUrl = new URL(file, output);
  const template = await readFile(fileUrl, 'utf8');
  await writeFile(fileUrl, template.split('{{PACKAGE_VERSION}}').join(packageJson.version), 'utf8');
}

await writeFile(new URL('package-meta.json', output), `${JSON.stringify({
  name: packageJson.name,
  version: packageJson.version,
  runtimeDependencies: Object.keys(packageJson.dependencies || {}).length
}, null, 2)}\n`, 'utf8');

console.log(`Documentation built for ${packageJson.name}@${packageJson.version}`);

import { readFile, stat } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const site = new URL('../site-dist/', import.meta.url);
const packageJson = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const metadata = JSON.parse(await readFile(new URL('package-meta.json', site), 'utf8'));
const html = await readFile(new URL('index.html', site), 'utf8');
const app = await readFile(new URL('app.js', site), 'utf8');
const bundle = await readFile(new URL('package.js', site), 'utf8');
const robots = await readFile(new URL('robots.txt', site), 'utf8');
const sitemap = await readFile(new URL('sitemap.xml', site), 'utf8');
const llms = await readFile(new URL('llms.txt', site), 'utf8');
const llmsFull = await readFile(new URL('llms-full.txt', site), 'utf8');
const migration = await readFile(new URL('guides/migration.md', site), 'utf8');
const compatibility = await readFile(new URL('guides/compatibility.md', site), 'utf8');
const example = await readFile(new URL('examples/basic.js', site), 'utf8');
const image = await stat(new URL('assets/convert-source-map-flow.png', site));

assert(metadata.name === packageJson.name, 'documentation package name is stale');
assert(metadata.version === packageJson.version, 'documentation version is stale');
assert(metadata.runtimeDependencies === 0, 'documentation dependency count is stale');
assert(!html.includes('{{PACKAGE_VERSION}}') && !llms.includes('{{PACKAGE_VERSION}}'), 'version placeholder was not replaced');
assert(html.includes('<link rel="canonical" href="https://alexandro.net/docs/vanilla/convert-source-map/">'), 'canonical documentation URL is missing');
assert(html.includes('SoftwareSourceCode') && html.includes('index,follow'), 'indexable software metadata is missing');
assert(html.includes('./package.js') && bundle.includes('StacklineConvertSourceMap'), 'production package bundle is missing');
assert(app.includes('globalThis.StacklineConvertSourceMap'), 'playground does not use the package bundle');
assert(app.includes('removeComments'), 'comment removal is not wired to the playground');
assert(robots.includes('User-agent: *\nAllow: /'), 'documentation robots policy is not open');
assert(sitemap.includes('/convert-source-map/llms-full.txt'), 'documentation sitemap is incomplete');
assert(llms.includes('npm install @stackline/convert-source-map'), 'LLM install reference is missing');
assert(llmsFull.includes('TypeScript 3.9'), 'LLM compatibility reference is missing');
assert(migration.includes('convert-source-map@npm:@stackline/convert-source-map'), 'alias guide is missing');
assert(compatibility.includes('Preserved JavaScript API'), 'compatibility guide is missing the public contract');
assert(example.includes("require('@stackline/convert-source-map')"), 'executable example is missing');
assert(html.includes('./analytics.js'), 'documentation analytics is missing');
assert(!app.includes("gtag('event'"), 'playground must not record user input');
assert(image.size > 10000 && image.size < 500000, `documentation image has an invalid size: ${image.size} bytes`);

for (const [name, value] of Object.entries({ html, llms, llmsFull, migration, compatibility })) {
  assert(!/(127\.0\.0\.1|localhost|verdaccio)/i.test(value), `${name} exposes a private environment`);
}

console.log(JSON.stringify({ imageBytes: image.size, name: metadata.name, version: metadata.version }));

function assert(condition, message) { if (!condition) throw new Error(message); }

import { build } from 'esbuild';

const commonjs = await import('../index.js');
const esm = await import('../index.mjs');

if (typeof commonjs.default.fromJSON !== 'function') throw new Error('CommonJS entry is invalid');
if (typeof esm.fromJSON !== 'function') throw new Error('ESM entry is invalid');

await build({
  entryPoints: ['index.js'],
  bundle: true,
  format: 'iife',
  globalName: 'StacklineConvertSourceMap',
  platform: 'browser',
  write: false
});

console.log('CommonJS, ESM, and browser build verified');

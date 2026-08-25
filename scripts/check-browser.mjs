import { build } from 'esbuild';
import vm from 'node:vm';
import { TextDecoder, TextEncoder } from 'node:util';

const result = await build({
  entryPoints: ['index.js'],
  bundle: true,
  format: 'iife',
  globalName: 'StacklineConvertSourceMap',
  platform: 'browser',
  write: false
});

const context = {
  TextDecoder,
  TextEncoder,
  Uint8Array,
  atob: value => Buffer.from(value, 'base64').toString('binary'),
  btoa: value => Buffer.from(value, 'binary').toString('base64')
};
vm.createContext(context);
vm.runInContext(result.outputFiles[0].text, context);
vm.runInContext(`
  var input = { version: 3, sources: ['browser.js'], names: [], mappings: 'AAAA', sourcesContent: ['Ola, 世界'] };
  var comment = StacklineConvertSourceMap.fromObject(input).toComment();
  var output = StacklineConvertSourceMap.fromComment(comment).toObject();
  if (output.sourcesContent[0] !== 'Ola, 世界') throw new Error('browser round trip failed');
`, context);
console.log('Browser bundle verified without Buffer');

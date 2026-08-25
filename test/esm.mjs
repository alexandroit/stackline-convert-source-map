import convert, { fromJSON } from '../index.mjs';

if (convert.fromJSON('{"version":3}').getProperty('version') !== 3) {
  throw new Error('ESM default import failed');
}
if (fromJSON('{"version":3}').getProperty('version') !== 3) {
  throw new Error('ESM named import failed');
}

# Compatibility Contract

## Baseline

The behavioral oracle is `convert-source-map@2.0.0`, published from upstream
commit `f1ed815b4edacfa9c3c5552dd342e71a3cffbb0a`.

## Preserved JavaScript API

- `fromObject`, `fromJSON`, `fromURI`, `fromBase64`, and `fromComment`;
- `fromSource`, `fromMapFileComment`, and `fromMapFileSource`;
- `removeComments`, `removeMapFileComments`, and `generateMapFileComment`;
- converter methods `toObject`, `toJSON`, `toURI`, `toBase64`, `toComment`,
  `addProperty`, `setProperty`, and `getProperty`;
- fresh, non-enumerable `commentRegex` and `mapFileCommentRegex` getters in
  CommonJS;
- the version 2 `readMap(filename)` callback, including sync and async results;
- mutation of the object supplied to `fromObject`.

## Module and type contract

- CommonJS: `require('@stackline/convert-source-map')`;
- Node ESM: default and named imports through a thin wrapper;
- TypeScript: bundled declarations tested from 3.9 onward;
- browser: bundled operation without a global `Buffer`;
- runtime: Node.js 12 and newer.

The ESM regex exports are values captured during module initialization. CJS
retains the original fresh-getter behavior.

## Intentional hardening

- Source discovery accepts valid same-line CSS block comments and ignores
  source-map-looking text inside ordinary strings.
- URI data is split at its first comma rather than its last comma.
- Invalid comments and missing readers fail with controlled errors.
- `addProperty` works with null-prototype and `hasOwnProperty`-shadowing maps.
- `setProperty('__proto__', value)` creates an own property without changing
  the object's prototype.
- Public regexes no longer allow a whitespace match to traverse many lines.

## Not promised

- Parsing a complete JavaScript, CSS, or template grammar;
- validating Source Map v3 field semantics;
- fetching or reading external maps without a caller callback;
- accepting unsupported MIME types or multiline sourceMappingURL values;
- running on end-of-life Node.js versions below 12.

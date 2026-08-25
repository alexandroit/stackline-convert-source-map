# @stackline/convert-source-map

> A maintained, typed, `convert-source-map`-compatible parser for Node.js and
> browser build pipelines.

[![npm version](https://img.shields.io/npm/v/@stackline/convert-source-map.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/convert-source-map)
[![npm downloads](https://img.shields.io/npm/dm/@stackline/convert-source-map.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/convert-source-map)
[![CI](https://img.shields.io/github/actions/workflow/status/alexandroit/stackline-convert-source-map/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/alexandroit/stackline-convert-source-map/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@stackline/convert-source-map.svg?style=flat-square)](LICENSE)

**[Docs and playground](https://alexandro.net/docs/vanilla/convert-source-map/)** |
**[npm](https://www.npmjs.com/package/@stackline/convert-source-map)** |
**[GitHub](https://github.com/alexandroit/stackline-convert-source-map)** |
**[Migration](MIGRATION.md)** |
**[Security](SECURITY.md)** |
**[Changelog](CHANGELOG.md)**

**Current package version:** `1.0.1`

## Why this package?

`convert-source-map` is still a core build-tool primitive. Its latest public
release is from 2022, while its parser still exposes avoidable compatibility
and resource-consumption edge cases.

This fork preserves the version 2 CommonJS API while adding:

- one-pass source comment discovery and removal;
- hardened, fresh regex getters for callers that use the legacy regex API;
- URI source maps containing literal commas;
- inline CSS maps placed after generated CSS on the same line;
- defensive support for `__proto__`, `prototype`, and `constructor` properties;
- synchronous and asynchronous map readers;
- CommonJS, ESM, TypeScript, and browser verification;
- zero runtime dependencies;
- preserved MIT attribution to the original project.

No CVE or GHSA is claimed for the upstream package. The resource behavior and
defensive changes are backed by regression tests and documented in
[SECURITY.md](SECURITY.md).

## Compatibility at a glance

| Item | Value |
| :--- | :--- |
| Package | `@stackline/convert-source-map@1.0.1` |
| API baseline | `convert-source-map@2.0.0` |
| Runtime | Node.js 12+, browser bundles |
| Modules | CommonJS and native ESM wrapper |
| Types | First-party TypeScript declarations |
| Runtime dependencies | Zero |

## Installation

Install under the Stackline name:

```bash
npm install @stackline/convert-source-map
```

Or replace the original package without changing imports:

```bash
npm install convert-source-map@npm:@stackline/convert-source-map
```

Existing CommonJS remains unchanged:

```js
const convert = require('convert-source-map');
```

## Quick start

```js
const convert = require('@stackline/convert-source-map');

const map = {
  version: 3,
  file: 'bundle.js',
  sources: ['input.js'],
  names: [],
  mappings: 'AAAA'
};

const comment = convert.fromObject(map).toComment();
const restored = convert.fromComment(comment).toObject();
```

## ESM

The ESM wrapper exposes both named and default imports over the same CommonJS
implementation:

```js
import convert, { fromComment } from '@stackline/convert-source-map';

const map = fromComment(comment).toObject();
```

## API

### Input converters

- `fromObject(object)` keeps the supplied object as the mutable backing map;
- `fromJSON(json)` parses JSON;
- `fromURI(uri)` decodes URI-encoded JSON;
- `fromBase64(base64)` decodes UTF-8 base64 JSON;
- `fromComment(comment)` parses an inline data-URI comment;
- `fromSource(source)` returns the last inline map or `null`;
- `fromMapFileComment(comment, readMap)` reads an external map;
- `fromMapFileSource(source, readMap)` finds and reads the last external map.

`readMap(filename)` may return a string or a promise-like value. It controls all
file-system or network access; this package performs neither by itself.

### Converter methods

- `toObject()` returns a JSON copy;
- `toJSON(space?)`, `toURI()`, and `toBase64()` encode the map;
- `toComment(options?)` creates line or block data-URI comments;
- `addProperty(key, value)` adds a previously absent own property;
- `setProperty(key, value)` safely creates or replaces an own data property;
- `getProperty(key)` returns a map property.

### Comment utilities

- `removeComments(source)` removes inline data-URI map comments;
- `removeMapFileComments(source)` removes external map comments;
- `generateMapFileComment(file, options?)` creates an external-map comment;
- `commentRegex` and `mapFileCommentRegex` remain fresh CommonJS getters.

For ESM, regex exports are snapshots because ESM bindings cannot reproduce a
property getter on a namespace. Parsing functions always create their own state.

## TypeScript

Declarations are included and remain compatible with TypeScript 3.9 through the
current tested compiler:

```ts
import { fromObject, SourceMapConverter } from '@stackline/convert-source-map';

const converter: SourceMapConverter = fromObject({ version: 3 });
```

## Compatibility

The runtime supports Node.js 12 and newer. Browser bundles use `TextEncoder`,
`TextDecoder`, `btoa`, and `atob`, with UTF-8 fallbacks when text codecs are not
available. See [COMPATIBILITY_CONTRACT.md](COMPATIBILITY_CONTRACT.md) for the
preserved contract and intentional hardening.

## Release evidence

The release gate verifies:

- 19 focused regression tests;
- 10 differential compatibility scenarios against `convert-source-map@2.0.0`;
- 98%+ line coverage and 100% function coverage;
- a 500,001-line malformed-input resource regression;
- Node.js 12, 14, 16, 18, 20, 22, and 24;
- TypeScript 3.9, 4.7, 4.9, 5.9, 6.0, and 7.0;
- CommonJS, native ESM, browser, packed install, `publint`, and type checks.

The interactive [documentation playground](https://alexandro.net/docs/vanilla/convert-source-map/)
runs the production browser bundle for comment encoding, decoding, and removal.

## Trust and maintenance

- Every release is built from the public repository.
- CI validates runtime compatibility, types, package exports, clean installs,
  and bounded malformed-input behavior.
- Security reports use the private process in [SECURITY.md](SECURITY.md).
- Original MIT attribution remains in [LICENSE](LICENSE) and [NOTICE](NOTICE).

## Provenance

This is an independent maintained fork of Thorsten Lorenz's MIT-licensed
[`convert-source-map`](https://github.com/thlorenz/convert-source-map). The
original copyright and license are preserved in [LICENSE](LICENSE), with
additional attribution in [NOTICE](NOTICE).

# @stackline/convert-source-map

> Maintained convert-source-map-compatible parser with linear-time discovery and defensive property handling

[![npm version](https://img.shields.io/npm/v/@stackline/convert-source-map.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/convert-source-map)
[![license](https://img.shields.io/npm/l/@stackline/convert-source-map.svg?style=flat-square)](https://github.com/alexandroit/stackline-convert-source-map/blob/main/LICENSE)
[![GitHub repository](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/alexandroit/stackline-convert-source-map)

**[Documentation](https://alexandro.net/docs/vanilla/convert-source-map/)** |
**[npm](https://www.npmjs.com/package/@stackline/convert-source-map)** |
**[Issues](https://github.com/alexandroit/stackline-convert-source-map/issues)** |
**[Repository](https://github.com/alexandroit/stackline-convert-source-map)**

**Package version:** `1.0.2`

## Why this package?

> A maintained, typed, `convert-source-map`-compatible parser for Node.js and
> browser build pipelines.

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
[SECURITY.md](https://github.com/alexandroit/stackline-convert-source-map/blob/main/SECURITY.md).

<a id="trust-and-maintenance"></a>

### Trust and maintenance

- Every release is built from the public repository.
- CI validates runtime compatibility, types, package exports, clean installs,
  and bounded malformed-input behavior.
- Security reports use the private process in [SECURITY.md](https://github.com/alexandroit/stackline-convert-source-map/blob/main/SECURITY.md).
- Original MIT attribution remains in [LICENSE](https://github.com/alexandroit/stackline-convert-source-map/blob/main/LICENSE) and [NOTICE](https://github.com/alexandroit/stackline-convert-source-map/blob/main/NOTICE).

<a id="provenance"></a>

### Provenance

This is an independent maintained fork of Thorsten Lorenz's MIT-licensed
[`convert-source-map`](https://github.com/thlorenz/convert-source-map). The
original copyright and license are preserved in [LICENSE](https://github.com/alexandroit/stackline-convert-source-map/blob/main/LICENSE), with
additional attribution in [NOTICE](https://github.com/alexandroit/stackline-convert-source-map/blob/main/NOTICE).

## Compatibility

| Item | Value |
| --- | --- |
| Package | `@stackline/convert-source-map@1.0.2` |
| Node.js runtime | `>=12` |
| CommonJS / primary entry | `./index.js` |
| Type declarations | `./index.d.ts` |

<a id="compatibility-at-a-glance"></a>

### Compatibility at a glance

| Item | Value |
| :--- | :--- |
| Package | `@stackline/convert-source-map@1.0.2` |
| API baseline | `convert-source-map@2.0.0` |
| Runtime | Node.js 12+, browser bundles |
| Modules | CommonJS and native ESM wrapper |
| Types | First-party TypeScript declarations |
| Runtime dependencies | Zero |

The runtime supports Node.js 12 and newer. Browser bundles use `TextEncoder`,
`TextDecoder`, `btoa`, and `atob`, with UTF-8 fallbacks when text codecs are not
available. See [COMPATIBILITY_CONTRACT.md](https://github.com/alexandroit/stackline-convert-source-map/blob/main/COMPATIBILITY_CONTRACT.md) for the
preserved contract and intentional hardening.

## Installation

Install under the Stackline name:

```bash
npm install @stackline/convert-source-map
```

Or replace the original package without changing imports:

```bash
npm install convert-source-map@npm:@stackline/convert-source-map
```

## Usage

Existing CommonJS remains unchanged:

```js
const convert = require('convert-source-map');
```

<a id="quick-start"></a>

### Quick start

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

<a id="esm"></a>

### ESM

The ESM wrapper exposes both named and default imports over the same CommonJS
implementation:

```js
import convert, { fromComment } from '@stackline/convert-source-map';

const map = fromComment(comment).toObject();
```

## Features and Integrations

<a id="typescript"></a>

### TypeScript

Declarations are included and remain compatible with TypeScript 3.9 through the
current tested compiler:

```ts
import { fromObject, SourceMapConverter } from '@stackline/convert-source-map';

const converter: SourceMapConverter = fromObject({ version: 3 });
```

## Security

Review inputs and the package-specific compatibility limits before processing untrusted data. Report suspected vulnerabilities as described in the [security policy](https://github.com/alexandroit/stackline-convert-source-map/blob/main/SECURITY.md).

## API Surface

<a id="api"></a>

### API

#### Input converters

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

#### Converter methods

- `toObject()` returns a JSON copy;
- `toJSON(space?)`, `toURI()`, and `toBase64()` encode the map;
- `toComment(options?)` creates line or block data-URI comments;
- `addProperty(key, value)` adds a previously absent own property;
- `setProperty(key, value)` safely creates or replaces an own data property;
- `getProperty(key)` returns a map property.

#### Comment utilities

- `removeComments(source)` removes inline data-URI map comments;
- `removeMapFileComments(source)` removes external map comments;
- `generateMapFileComment(file, options?)` creates an external-map comment;
- `commentRegex` and `mapFileCommentRegex` remain fresh CommonJS getters.

For ESM, regex exports are snapshots because ESM bindings cannot reproduce a
property getter on a namespace. Parsing functions always create their own state.

## Local Development

```sh
git clone https://github.com/alexandroit/stackline-convert-source-map.git
cd stackline-convert-source-map
npm ci
npm run test
```

Release tooling uses Node.js 24.20.0 and npm 11.19.0. The consumer runtime contract remains the one documented above.

## Consumer Smoke Test

Run the repository's existing consumer/package check after installing development dependencies:

```sh
npm run test:install
```

## Release Checklist

<a id="release-evidence"></a>

### Release evidence

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

Run `npm run test` and inspect the package contents before release. Publish a new version through the [GitHub Actions publishing workflow](https://github.com/alexandroit/stackline-convert-source-map/actions/workflows/publish.yml), using the SHA-512 digest of the reviewed tarball. Verify the exact published version, tarball integrity, and npm provenance after the run.

## Community and Support

Report reproducible package issues in the [issue tracker](https://github.com/alexandroit/stackline-convert-source-map/issues). Use the [security policy](https://github.com/alexandroit/stackline-convert-source-map/blob/main/SECURITY.md) for vulnerability reports.

- [Stackline / Alexandro.Net](https://alexandro.net/)
- [GitHub](https://github.com/alexandroit)
- [Maintainer LinkedIn](https://www.linkedin.com/in/aleinfo/)
- [Reddit community: r/Stackline](https://www.reddit.com/r/Stackline/)

## License

MIT. See [the license](https://github.com/alexandroit/stackline-convert-source-map/blob/main/LICENSE) for the complete terms.

Original authorship and third-party attribution are preserved in [NOTICE](https://github.com/alexandroit/stackline-convert-source-map/blob/main/NOTICE).

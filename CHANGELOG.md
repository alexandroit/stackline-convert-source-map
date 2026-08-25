# Changelog

All notable changes to `@stackline/convert-source-map` are documented here.

## 1.0.1 - 2026-08-25

### Added

- Public interactive documentation running the production browser bundle.
- Machine-readable `llms.txt` and `llms-full.txt` references.
- Gold-standard repository metadata, issue templates, CI, CodeQL, and release
  automation with immutable checksum and SBOM gates.

### Changed

- Pointed package metadata to the canonical Alexandro.Net documentation.

The JavaScript implementation and public API are unchanged from `1.0.0`.

## 1.0.0 - 2026-08-24

### Added

- CommonJS, ESM, TypeScript 3.9+, and browser package support.
- One-pass source-map comment discovery and removal.
- Regression coverage for large malformed inputs, URI commas, same-line CSS,
  map readers, browser UTF-8, and object meta-property names.
- Package, packed-install, dependency-audit, and compatibility checks.

### Changed

- Replaced internal regex-based source scanning with a linear source scanner.
- Hardened the public regex getters without removing them.
- Property writes now create own data properties, preventing `__proto__` from
  changing the backing map's prototype.
- Browser base64 conversion no longer uses deprecated `escape` or `unescape`.

### Compatibility

- Preserves the `convert-source-map@2.0.0` CommonJS API and reader callback
  signature.
- Keeps zero runtime dependencies.
- Raises the documented runtime floor to Node.js 12.

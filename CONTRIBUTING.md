# Contributing

Focused issues and pull requests are welcome.

## Requirements

- Node.js 20.19 or newer for development;
- npm with lockfile support;
- no runtime dependency without a documented and measured need.

## Setup

```bash
npm ci
npm test
npm run test:attw
npm run audit:dependencies
```

## Change expectations

- Preserve all `convert-source-map@2.0.0` functions and CommonJS getters.
- Add a regression for every parser or encoder behavior change.
- Compare normal inputs with the pinned upstream package.
- Keep comment discovery and removal linear in source length.
- Test synchronous and asynchronous map readers.
- Test `__proto__`, `prototype`, `constructor`, null-prototype maps, and
  ownership-shadowing objects.
- Update declarations and migration docs with public API changes.
- Preserve the original MIT notice and fork attribution.

Performance claims require a reproducible input, correctness assertions, and a
child-process timeout that prevents the test suite itself from hanging.

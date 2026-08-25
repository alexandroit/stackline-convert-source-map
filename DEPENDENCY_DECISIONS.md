# Dependency Decisions

Snapshot date: 2026-08-24. Runtime dependencies remain empty.

| Class | Package | Decision |
| :--- | :--- | :--- |
| runtime | none | Preserve upstream's zero-dependency footprint |
| dev cluster oracle | `inline-source-map` | Use `npm:@stackline/inline-source-map@^1.0.0`; validated against the exact Project 01 artifact in local Verdaccio |
| dev compatibility oracle | `convert-source-map@2.0.0` | Pin the canonical public release for differential tests only |
| dev quality | `@arethetypeswrong/cli@0.18.5` | Verify CJS and ESM declaration routing |
| dev coverage | `c8@12.0.0` | Replace upstream's obsolete Tap coverage chain |
| dev browser | `esbuild@0.28.2` | Build and execute a real browser-targeted bundle |
| dev lint | `eslint@10.9.1` | Static checks on source, scripts, tests, and examples |
| dev package | `publint@0.3.24` | Validate exports and packed manifest shape |
| dev types | `typescript@7.0.2` | Local current compiler; CI also tests 3.9 through 6.x |
| removed dev | `tap~9` | Avoid the deprecated tree that produced 41 upstream audit findings |

## Ownership and unpublish risk

Consumers install no transitive runtime package, so runtime availability depends
only on this scoped package. Development tools are exact-pinned in the lockfile
and are not shipped in the tarball. The compatibility oracle is test-only.

## Final audit snapshot

The current lock resolved 174 packages and `npm audit` reported zero findings.
Registry verification reported 172 signed packages and 26 attestations before
the final alias-lock refresh. Verdaccio does not expose npm's public signature
key endpoint, so repeat `npm run audit:signatures` after regenerating the lock
against the official registry.

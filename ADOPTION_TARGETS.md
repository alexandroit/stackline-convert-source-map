# Adoption Targets

No issue or pull request has been opened. Contact requires separate authorization
and a publicly installable, provenance-backed release.

## Verified direct users

| Repository | Current manifest evidence | Activity at audit |
| :--- | :--- | :--- |
| `gulp-sourcemaps/gulp-sourcemaps` | `convert-source-map: ^1.0.0` | pushed 2026-08-11; 1,094 stars |
| `aurelia/cli` | `convert-source-map: ^2.0.0` | pushed 2026-05-21; 405 stars |
| `reworkcss/rework` | `convert-source-map: ^0.3.3` | pushed 2026-06-04; 2,740 stars |
| `thlorenz/combine-source-map` | source import and upstream cluster dependency | audited as Project 03 |

## Source-level candidates to revalidate

- `margelo/react-native-worklets-core`;
- `hello-pangea/dnd`;
- `ruby2js/ruby2js`;
- `TypeStrong/tsify`;
- `bholloway/resolve-url-loader`;
- `ember-cli/broccoli-terser-sourcemap`.

These repositories contain source-level usage or related build paths, but their
current dependency ownership may be workspace-specific or transitive. Recheck
the exact manifest and lockfile immediately before any outreach.

## Adoption proof required

1. Publish only after explicit authorization and green CI.
2. Demonstrate direct install and npm alias install.
3. Show differential tests and the malformed-input regression.
4. Open focused proposals only where the package is still directly owned.
5. Never mass-file issues or imply an upstream CVE that does not exist.

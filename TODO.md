# Project TODO

## Release operations

- Configure npm Trusted Publishing for `alexandroit/stackline-convert-source-map`
  and `.github/workflows/publish.yml` after the first public release establishes
  the package.
- Require successful CI and CodeQL checks on the `main` branch.
- Review supported Node.js and TypeScript matrices at least twice per year.

## Maintenance

- Track Source Map specification and data-URI interoperability changes.
- Add differential fixtures when upstream-compatible edge cases are reported.
- Keep malformed-input regression limits stable across supported runtimes.
- Keep documentation examples executable and aligned with the packaged API.

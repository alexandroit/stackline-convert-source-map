# Security Policy

## Supported versions

| Version | Security updates |
| :--- | :---: |
| `1.x` | Yes |
| `< 1.0.0` | No public releases |

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use the repository's
[private security advisory form](https://github.com/alexandroit/stackline-convert-source-map/security/advisories/new).

Include the affected version, a minimal source or comment, expected impact,
runtime, and any proposed mitigation. We aim to acknowledge complete reports
within three business days.

## Security contract

- Internal comment discovery and removal scan the source once and do not call
  the public regex getters.
- Public regexes do not let whitespace quantifiers span lines.
- Data URIs are separated at the first comma, so valid JSON commas remain data.
- Property ownership checks use `Object.prototype.hasOwnProperty.call`.
- Property writes use own data descriptors. `__proto__`, `prototype`, and
  `constructor` remain map data and do not change the backing object's prototype.
- The package has zero runtime dependencies.
- The package does not read files, fetch URLs, or resolve paths. The caller's
  `readMap` callback owns those operations.

Applications processing untrusted content should still enforce source and map
size limits. JSON parsing and decoded source maps necessarily allocate memory
proportional to the supplied payload.

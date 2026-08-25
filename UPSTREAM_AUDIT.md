# Upstream Audit

Snapshot date: 2026-08-24 (America/Toronto).

## Identity and activity

| Item | Evidence |
| :--- | :--- |
| npm package | `convert-source-map@2.0.0` |
| npm publish | 2022-10-17 |
| release commit | `f1ed815b4edacfa9c3c5552dd342e71a3cffbb0a` |
| repository HEAD | `c65bc392d87ef6d18419593cfbe75fda81e2847b`, 2025-03-27 |
| repository state | not archived; 170 stars; 61 forks; 7 open issues |
| complete-week demand | 213,391,377 downloads, 2026-08-17 through 2026-08-23 |
| runtime dependencies | zero |
| advisory query | no exact GitHub Advisory result |

The upstream test suite passed 503 assertions on the audit host. Installing its
2017-era `tap~9` development stack produced 41 audit findings: 11 moderate, 18
high, and 12 critical. `npm audit --omit=dev` reported zero runtime findings.

## Source findings

### Cross-line regex amplification

The public regex begins with multiline `^\s*?`. Because `\s` consumes newlines,
an input made only of newlines causes each new line start to rescan much of the
remaining input. Isolated Node 20 measurements of `fromSource` were:

| Newlines | Published 2.0.0 |
| ---: | ---: |
| 10,000 | 33.016 ms |
| 20,000 | 134.650 ms |
| 40,000 | 538.599 ms |
| 80,000 | 2,193.681 ms |

Doubling input produced roughly four times the work. Candidate internals use a
single scanner and the release test processes 500,001 malformed lines in a
child with a five-second kill budget.

This is an empirical resource-exhaustion finding, not a claimed upstream CVE.

### Data URI delimiter

`sm.split(',').pop()` retains data after the final comma. URI-encoded JSON made
with `encodeURI` can contain literal JSON commas, causing a `SyntaxError`.
Open issue `#86` and PR `#87` confirm the case upstream.

### Object meta-properties

`this.sourcemap[key] = value` invokes the inherited `__proto__` setter on plain
objects. The backing object's prototype changes. The global `Object.prototype`
was not modified in the reproduction, so this document does not call it global
prototype pollution.

`this.sourcemap.hasOwnProperty(key)` also throws for null-prototype maps and maps
that shadow `hasOwnProperty`.

### CSS placement and string literals

The inline regex is anchored to the start of a line. A valid generated form such
as `a{}/*# sourceMappingURL=data:... */` is not found, matching open issue `#89`.
Regex-only matching also has a history of string-literal false positives (`#63`).

## Alternatives

| Package | Complete-week downloads | Result |
| :--- | ---: | :--- |
| `@prantlf/convert-source-map@3.0.2` | 81 | Active and typed, but intentionally API-breaking; Node >=16.9; same newline amplification; direct `__proto__` assignment |
| `sl-convert-source-map@1.0.1` | 20,461 | Narrow parse fallback; same scanner and property issues; repository URL returned 404 |

Neither alternative is a compatible, fully hardened replacement for version 2.

## Gate conclusion

GO. Demand, compatibility constraints, reproducible defects, and the absence of
a complete alternative justify a Stackline package. The implementation remains
small, transparent, zero-dependency, and differential-tested.

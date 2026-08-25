# Issue Triage

Snapshot date: 2026-08-24.

| Upstream item | State | Stackline disposition |
| :--- | :--- | :--- |
| Issue `#89`: same-line CSS block comment | Open | Fixed with lexical comment discovery and regression coverage |
| Issue `#86`: data URI containing commas | Open | Fixed by splitting at the first delimiter |
| PR `#87`: comma fix | Open | Behavior retained; additional malformed and CSS tests added |
| PR `#85`: regex ReDoS rewrite | Closed, unmerged | Root cause reproduced; internals replaced with one-pass scanning and exported regexes hardened |
| Issue `#82`: map reader behavior | Open | Version 2 sync/async callback contract retained and tested |
| Issue `#63`: sourceMappingURL in string | Open | Scanner ignores single, double, and template string content |
| Issue `#42`: old parse error | Open | Invalid inputs now fail with controlled errors; no promise of arbitrary malformed-data recovery |
| HEAD numeric base64 fix | Merged, unpublished | Retained with a regression test |

No upstream issue or PR was modified. External collaboration requires separate
authorization after a public Stackline artifact exists.

# Dependency security audit

**Audited:** 29 July 2026
**Command:** `npm audit --omit=dev`  
**Launch status:** residual prerequisite

## Current result

The production dependency tree currently reports:

| Severity | Count |
| --- | ---: |
| Critical | 0 |
| High | 21 |
| Moderate | 7 |
| Low | 0 |
| Total | 28 |

The full dependency tree, including development tooling, reports 35 findings:
28 high and 7 moderate.

## Triage

Most production findings are transitive dependencies in the current Sanity
CLI/workbench toolchain. The remaining findings include packages in the
Next.js dependency tree. The application is on the latest compatible stable
versions found during this pass: Next.js 16.2.12, Sanity 6.7.0, next-sanity
13.2.3, `@sanity/vision` 6.7.0, and jsdom 30.0.1.

The direct Sharp development dependency is 0.35.3. Next.js 16.2.12 still
installs a nested Sharp 0.34.5, so the related advisory cannot be described as
upgraded away. The runtime image allowlist is now restricted to the configured
DDA Silver Sanity project and dataset path, removing arbitrary Sanity projects
as remote optimizer inputs.

`npm audit fix` found no non-breaking update. `npm audit fix --force` proposes
major downgrades, including Next.js 9.3.3 and Sanity 5.14.1. Those changes
would replace the selected architecture and are not an acceptable remediation.
They were not applied.

## Application security review

The 29 July Codex Security scan covered all 196 scoped files/assets and
reported one high, three medium, and one low application finding. The local
remediation pass:

- restricted remote image inputs to the owned Sanity project/dataset;
- added strict rate payload bounds, finite non-negative values, freshness
  checks, and conservative stale-state handling;
- bounded in-memory rate-limit buckets and expires inactive entries;
- added external-service origin allowlists, timeouts, and response-size limits;
- fail-closes same-origin mutation checks when browser origin signals are
  absent; and
- added runtime validation and result limits to Sanity catalog reads.

The dependency audit totals remain unchanged after compatible updates and npm
deduplication. They are a separate residual supply-chain risk and still need
upstream patches or explicit risk acceptance before launch.

## Required before launch approval

1. Re-run the audit against current package releases before launch review.
2. Upgrade Next.js, Sanity, next-sanity, and affected transitive packages when
   compatible patched releases become available.
3. Re-run the complete quality suite and Studio/rates/auth integration tests.
4. Review whether build-only packages can be isolated from the production
   runtime or Studio can be deployed separately.
5. Record any remaining accepted risk with owner/security approval.

This audit does not affect the existing DDASilver website because the
replacement has not been deployed.

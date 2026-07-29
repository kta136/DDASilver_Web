# Dependency security audit

**Audited:** 28 July 2026  
**Command:** `npm audit --omit=dev`  
**Launch status:** unresolved prerequisite

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
CLI/workbench toolchain. The remaining high findings are in the Next.js
dependency tree, including bundled PostCSS and Sharp packages. The application
uses the latest compatible stable versions selected for this implementation:
Next.js 16.2.12, Sanity 6.6.0, and next-sanity 13.2.2.

`npm audit fix` found no non-breaking update. `npm audit fix --force` proposes
major downgrades, including Next.js 9.3.3 and Sanity 5.14.1. Those changes
would replace the selected architecture and are not an acceptable remediation.
They were not applied.

## Required before launch approval

1. Re-run the audit against current package releases.
2. Upgrade Next.js, Sanity, next-sanity, and affected transitive packages as
   patched compatible releases become available.
3. Re-run the complete quality suite and Studio/rates/auth integration tests.
4. Review whether build-only packages can be isolated from the production
   runtime or Studio can be deployed separately.
5. Record any remaining accepted risk with owner/security approval.

This audit does not affect the existing DDASilver website because the
replacement has not been deployed.


# LMS certificate builder synchronization to Airads

Date: 2026-07-31

## Scope

- Classification: shared engine
- Canonical repository: `/home/wetende/Projects/lms`
- Canonical reviewed head: `cbfa5f2f16505489890bcae529947af1c69ceedd`
- Destination repository: `/home/wetende/Projects/airads`
- Destination base: `f403ca01c515a54df75357ad486c97a546a4cf5d`
- Destination source/build head before this report: `1cea9aeb`

The generic certificate builder source was applied selectively to Airads rather
than merging the repositories' divergent histories. The synchronization
includes visual template editing, assignment by course and category,
automatic issuance, PDF rendering, verification data, certificate selection
in the course builder, and the final Inertia navigation corrections.

LMS-generated `static/dist` files and the LMS promotion report were excluded.
Airads generated and committed its own production bundle after reconciling the
shared source with its dependency graph.

## Compatibility reconciliation

Airads uses MUI Icons 9 while LMS currently uses MUI Icons 7. Production
verification identified two icon names that are unavailable in the Airads
version. The canonical shared source now uses the cross-version `Person` and
`Delete` exports. These corrections were first verified in Airads and then
published back to canonical LMS before this synchronization was finalized.

## Product preservation

- Airads public pages, admissions source, campus source, branding, deployment
  configuration, and environment files were not imported or replaced.
- A path-scoped comparison from Airads `main` to the integration head confirmed
  no changes under public, admissions, campus, or campuses frontend source.
- The Airads dashboard shell and product navigation remain the owners of
  product-specific surfaces; only the shared certificate feature and its
  navigation entry were synchronized.
- Airads production assets were generated locally from the reconciled Airads
  source rather than copied from LMS.

## Verification

| Gate | Result |
| --- | --- |
| Source `git diff --check` | Passed |
| Django system check | Passed, 0 issues |
| Migration drift check | Passed, no changes detected |
| Focused certificate backend tests | Passed, 48 tests |
| Full backend suite | Passed, 915 tests and 4 subtests |
| Focused certificate frontend tests | Passed, 7 files and 17 tests |
| Full frontend suite | Passed, 71 files and 189 tests |
| Production Vite build | Passed in 43.71 seconds |
| Generated manifest JSON parse | Passed |
| Airads product-source boundary check | Passed |

The full backend suite completed in 1841.67 seconds and reported 1016 warnings,
including the expected missing `staticfiles/` collection-directory warning in
the isolated worktree. The full frontend suite completed in 186.08 seconds.

`npm ci` reported 26 dependency-audit findings. No automated audit rewrite was
performed because dependency remediation is outside this bounded shared-engine
synchronization and may include breaking upgrades.

## Promotion order

1. Fast-forward Airads `main` from the isolated integration branch.
2. Push and verify Airads `origin/main`.
3. Begin the DigikaTech synchronization from the final canonical LMS head.

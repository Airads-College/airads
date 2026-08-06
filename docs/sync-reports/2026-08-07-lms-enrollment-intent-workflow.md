# LMS Enrollment Intent Synchronization to Airads

Date: 2026-08-07

## Scope

- Source shared-engine commit: LMS `7d2ba7aa`
- Airads synchronization commit: `04e6357a`
- Responsive header synchronization commit: `a57a361c`

Airads received the generic enrollment-intent lifecycle, staff data model,
Inertia capture/resume routes, payment linking, and payment-policy enforcement.
The responsive long-course-title behavior was synchronized separately.

## Product reconciliation

- Existing Airads Admissions remains the primary product workflow and admin
  navigation entry.
- Admission application IDs continue to link to checkout; generic enrollment
  intent IDs are also supported by the shared commerce endpoint.
- The generic LMS public course-page wiring was excluded from Airads.
- Existing `.gitignore` and PDF worktree changes were not included.

## Verification

| Gate | Result |
| --- | --- |
| `manage.py check` | Passed |
| Migration drift check | Passed |
| Focused backend suite | 77 passed |
| Focused enrollment frontend tests | 3 passed |
| Responsive header test | 1 passed |
| Targeted ESLint | Passed |
| Production build | Blocked by pre-existing missing local `qrcode.react` dependency |

The build blocker originates in the existing certificate canvas import and is
unrelated to the synchronized enrollment or header files.

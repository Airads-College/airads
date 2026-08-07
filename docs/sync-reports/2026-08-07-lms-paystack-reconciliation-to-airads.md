# LMS Paystack Reconciliation to Airads

## Refs and Scope

- Fork base: `8213ab58`.
- Canonical commits: `64c9955b`, `0c8352b2`, `a6d37ff2`.
- Airads accepted commits: `aeb375e6`, `f9c5cd47`, `f4d913a9`.
- Classification: shared-engine generic commerce.

The sync adds pending Paystack transaction reconciliation, replaces duplicate
transaction initialization with status verification, extends the mobile-money
polling window, and introduces the refined learner checkout.

## Fork Boundary

- Airads admissions, campus, public pages, branding, and deployment behavior
  were preserved.
- The shared checkout test had previously been absent in Airads and was restored
  with the shared checkout behavior.
- Generated `static/dist/` assets were excluded from the source sync.
- No tenant literals or deployment secrets were added to shared source.

## Verification

- `manage.py check`: passed.
- `makemigrations --check --dry-run`: passed; no changes detected.
- Commerce backend tests: 34 passed.
- Checkout and order-detail frontend tests: 4 passed.
- Changed-file ESLint: passed.
- Production frontend build: passed; 19,782 modules transformed.
- Full backend suite was clean through 75% when stopped at the user's request in
  favor of shipping the focused payment fix. Canonical LMS full verification
  passed 871 backend and 183 frontend tests.

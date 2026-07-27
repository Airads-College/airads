# Airads Fork Sync Guide

This repository (`Airads-College/airads`) is a forked product line.

- `origin` points to `Airads-College/airads` (where we push Airads work)
- `upstream` points to the canonical local LMS repository (where we pull shared LMS updates)

## One-Time Remote Check

```bash
git remote -v
```

Expected:

```text
origin   git@github.com:Airads-College/airads.git
upstream /home/wetende/Projects/lms
```

The approved local canonical path is `/home/wetende/Projects/lms`.

## Recommended Branch Flow

1. Keep `main` clean and deployable.
2. Build each change in a short-lived feature branch from `main`.
3. Merge the feature branch into `main` after review and checks.
4. Pull from `upstream/main` on a regular schedule.

## Sync Upstream Into Airads

```bash
git checkout main
git fetch upstream
git merge upstream/main
```

Then run checks before pushing:

```bash
.venv/bin/python manage.py check
.venv/bin/python manage.py migrate
.venv/bin/python -m pytest -q
npm run test -- --run
```

If all good:

```bash
git push origin main
```

## Conflict Strategy

When merges conflict, keep this boundary:

- AIRADS-specific surface:
  - Public pages (`frontend/src/pages/public`)
  - AIRADS branding, copy, assets, campus and admissions content
  - AIRADS-only navbar/footer/public marketing components
- Shared core surface:
  - Dashboard, player, builder, assessments, enrollment, certifications
  - Django domain logic, models, services, and shared UI infrastructure

If a change can help every LMS deployment, keep it generic and upstream-friendly.

## Commit Hygiene (Important)

Do not mix these in one commit:

- generic LMS/core improvements
- AIRADS-only branding or public-site customization

Split them into separate commits. This keeps future upstream merges and cherry-picks manageable.

**Pro-Tip: Use AI for Triage**
If you make bulk changes across the AIRADS codebase, do not just `git add .`.
Ask:

*"Look at my uncommitted changes, tell me which ones are generic LMS features and which ones are AIRADS-specific, and split them into separate commits for me."*

## If Upstream Changes Become Large

Use this safer flow:

```bash
git checkout -b sync/upstream-YYYY-MM-DD
git fetch upstream
git merge upstream/main
```

Resolve conflicts, run checks, then merge that sync branch into `main`.

## Backporting Airads Features to LMS

If you build a generic feature in `airads` and want to port it back to `lms`, link the two local folders directly.

### 1. Set Up the Local Bridge
In your `lms` terminal:

```bash
cd /home/wetende/Projects/lms
git remote add airads /path/to/airads
git fetch airads
```

If the remote already exists, just run:

```bash
git fetch airads
```

### 2. Cherry-Pick the Shared Commit
Find the commit you want from `airads`:

```bash
git log --oneline
```

Then apply just that commit in `lms`:

```bash
git cherry-pick <commit-hash>
```

This is the safest way to move generic LMS work upstream without bringing AIRADS-specific branding or public-page changes with it.

## Recommended Share Order

For shared work, use this order:

1. Build and commit the generic LMS change in `airads`.
2. Cherry-pick that commit into `lms`.
3. Verify and update `lms/main`.
4. Pull or merge `lms/main` back into `airads`.
5. Later, pull `lms/main` into `digikatech`.

This keeps `lms` as the parent source of truth for shared LMS behavior.

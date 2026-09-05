# Memory — Phase 17 submission history shipped

Last updated: 2026-08-13 14:06 +02:00

## What was built

- Completed Phases 15–17 and shipped them on branch `phase-08-auth-preview`.
- Phase 17 adds an RLS-scoped immutable submission timeline through `features/submissions/submissions.queries.ts`, `submissions.types.ts`, `submissions.validation.ts`, `submissions.presentation.ts`, and `components/submission-history.tsx`.
- Integrated the timeline into `app/(learner)/app/assignments/[slug]/page.tsx` and `features/curriculum/components/assignment-curriculum.tsx`; the revision editor renders before history, while submitted/approved states show history after the proof requirement.
- Added component coverage in `tests/unit/submission-history.test.tsx`, expanded authenticated submission-history E2E coverage in `tests/e2e/auth.spec.ts`, strengthened database isolation coverage, and corrected `vitest.config.mts` so TSX unit tests are discovered.
- Registered the Submission History pattern in `context/ui-registry.md` and marked Phase 17 complete in `context/progress-tracker.md`.

## Decisions made

- Submission history consists only of immutable snapshots for the current assignment, newest first. The newest version is expanded and older versions use native disclosure panels.
- Available assignments with no submissions omit the timeline. Submitted and approved assignments show it; revision-required assignments keep the editable draft before history; locked assignments show history only when snapshots exist.
- History timestamps are absolute Macedonian dates in the `Europe/Skopje` time zone.
- Phase 17 does not invent review records, reviewer placeholders, or review schema. Phase 19 will attach real criterion-level review data.

## Problems solved

- Vitest previously excluded existing `.tsx` component tests because its include glob matched only `.ts`; it now discovers both `.ts` and `.tsx` unit tests.
- Submission history database values are narrowed at runtime so unsupported status or link-type values fail explicitly instead of rendering misleading UI.
- Authenticated Preview verification confirmed that submitted assignments hide the draft editor while preserving the frozen evidence snapshot and typed links.

## Current state

- Phases 00–17 are complete. There is no active implementation and no known blocker.
- Branch `phase-08-auth-preview` is clean, matches its remote, and ends at `fe0b2a0`; feature commit `b7bd147` contains Phase 17.
- The stable Vercel Preview is Ready at `https://lansiraj-git-phase-08-auth-preview-stefandosevs-projects.vercel.app`.
- Verification passed: 64 unit tests, 246 database assertions, database lint/advisors, ESLint, strict TypeScript, Next.js production build, authenticated desktop flow, and authenticated 360 px flow. Live Preview checks confirmed the submitted status, immutable version content, Macedonian timestamp, evidence link, hidden draft editor, and no horizontal overflow.
- No database migration was needed for Phase 17. Existing Supabase RLS/grants scope the history query.

## Next session starts with

Run `/remember restore`, confirm this handoff, then read `AGENTS.md` and all context files in its required order. Begin Phase 18, “reviewer queue and cohort snapshot,” with `/architect` before implementation. Read the installed Next.js 16 documentation before changing Next.js code, and load the Supabase and Postgres best-practice skills before any database work.

## Open questions

- Phase 18 still needs its reviewer-queue ordering, cohort-summary fields, filtering scope, and empty/error states defined during architecture.
- Criterion-level review detail and decisions remain Phase 19; revision/resubmission remains Phase 20; approval/unlock remains Phase 21.
- Production Supabase separation and custom SMTP/branded authentication email templates remain deferred.

## Session update — Whole-product design upgrade

Last updated: 2026-08-13 17:00 +02:00

### What was built

- Completed the pre-Phase 18 whole-product editorial proof-system redesign across marketing, auth, onboarding, learner, assignment/evidence/history, and current reviewer surfaces without changing schema, RLS, routes, or product state models.
- Added shared `ProofArtifact`, `SectionHeading`, `StatusMarker`, `IllustrationFrame`, and one-time `Reveal` primitives, centralized artifact/layout/motion tokens, focused semantic component tests, and evidence-link add/remove interaction coverage.
- Used only two relevant user-supplied SVG scenes on the landing page. Their slots and unresolved production license verification are documented in `context/design/illustration-manifest.md`; the rest of the illustration pack remains local and untracked.
- Updated `context/ui-registry.md`, `context/ui-tokens.md`, and `context/progress-tracker.md` for the accepted redesign foundation.

### Decisions and problems solved

- Lansiraj now uses workflow/proof artifacts as its primary illustration language: expressive marketing, calm evidence-first product screens, and inverse reviewer navigation with light operational reading surfaces.
- Motion remains dependency-free and purposeful, with centralized durations/easing and reduced-motion behavior. Dense reviewer rows, long-form evidence, and navigation are not animated decoratively.
- Local sign-in failed because the dev server ran on port `3017` while the approved auth callback origin is port `3000`. The server now runs at `http://127.0.0.1:3000`; authenticated learner navigation works again.

### Current state

- The redesign is committed as `c92f479` (`feat: upgrade whole-product design`) and pushed to `origin/phase-08-auth-preview`; the branch matches its remote and draft PR #1 remains open.
- Fresh ESLint, strict TypeScript, and all 67 unit tests pass. The same redesign diff also passed the production build, 246 database assertions, and the full Playwright suite (42 passed, 3 intentionally skipped).
- `memory.md` and unused user-supplied illustration sources remain intentionally outside the redesign commit. No deployment or production-data change was made in this session.

### Next session starts with

- Run `/remember restore`, confirm this handoff, then begin Phase 18 reviewer queue and cohort snapshot with `/architect`. Use the redesigned inverse-shell/light-workspace reviewer language and preserve the existing behavior and data contracts.

### Open questions

- Phase 18 still needs reviewer-queue ordering, cohort snapshot fields, filtering scope, and empty/error states defined during architecture.
- Confirm commercial/export rights for the two shipped illustration assets before any production deployment.

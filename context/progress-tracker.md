# Progress Tracker

Update this file after every completed feature. An agent reading it must know what is done, what is active, what is blocked, and what comes next. Do not mark a feature complete until its exit gate passes.

## Current Status

**Phase:** 1 — Foundation and Auth
**Last completed:** 07 Invitation magic-link flow and protected shell
**In progress:** None
**Next:** Begin 08 preview deployment and invited/unauthorized auth verification
**Blockers:** None

## Progress

### Phase 0 — Architecture Freeze

- [x] 00 Align product, brand, architecture, and build context
- [x] 01 Repository baseline, scripts, CI, environment matrix, and ADRs
- [x] 02 Curriculum v1 seed: six stages, ten assignments, acceptance criteria

### Phase 1 — Foundation and Auth

- [x] 03 Encode brand tokens, fonts, app shell, and responsive foundations
- [x] 04 Configure Supabase browser/server clients and session proxy
- [x] 05 Create cohorts, invites, profiles, memberships, and reviewer-role migrations
- [x] 06 Add RLS policies and database security tests
- [x] 07 Build magic-link sign-in, callback, sign-out, pending-access, and protected shell
- [ ] 08 Deploy preview and verify invited/unauthorized auth paths

### Phase 2 — Onboarding and Project

- [ ] 09 Build learner onboarding UI and validation
- [ ] 10 Create one scoped project and instantiate project assignments
- [ ] 11 Build project scope summary and manual scope-readiness state

### Phase 3 — Curriculum and Dashboard

- [ ] 12 Render versioned curriculum Markdown and acceptance criteria
- [ ] 13 Build current-assignment dashboard and exact unlock messaging
- [ ] 14 Build six-stage journey rail and project overview

### Phase 4 — Proof Submission

- [ ] 15 Build draft text and typed-link evidence form
- [ ] 16 Implement transactional immutable submission
- [ ] 17 Build submission history and submitted-state UI

### Phase 5 — Human Review and Unlock

- [ ] 18 Build reviewer queue and cohort snapshot
- [ ] 19 Build criterion-level review detail and decision form
- [ ] 20 Implement revision-required flow and resubmission
- [ ] 21 Implement atomic approval and next-assignment unlock

### Phase 6 — Beta Hardening

- [ ] 22 Complete responsive, keyboard, contrast, reduced-motion, and Macedonian glyph QA
- [ ] 23 Complete privacy, rate protection, activity events, and failure states
- [ ] 24 Add unit, database, integration, and end-to-end release gates
- [ ] 25 Write deployment, smoke-test, backup, and rollback runbook

### Phase 7 — Pilot Operation

- [ ] 26 Stefan completes the full journey as learner and reviewer
- [ ] 27 Invite 2–3 learners and record activation, revisions, review time, and launch outcomes
- [ ] 28 Revisit deferred decisions using evidence from the first four learners

## Decisions Made During Build

- 2026-08-03 — v0.1 is a Next.js modular monolith backed by one Supabase project and deployed on Vercel.
- 2026-08-03 — Beta is free, invitation-only, Macedonian Cyrillic, and human-reviewed on all ten assignments.
- 2026-08-03 — Evidence is text and typed URLs only; uploads, learner-facing AI, CMS, payments, reminders, and public case studies are deferred.
- 2026-08-03 — Submitted evidence is immutable; review and unlock occur through controlled database functions.

## Notes

- 2026-08-07 — Completed Phase 07 with neutral magic-link sign-in, PKCE callback exchange, atomic invite acceptance, deterministic reviewer/learner/onboarding/pending routing, guarded learner and reviewer shells, sign-out, and a pending-access state. Invite acceptance derives identity from verified Auth data, rejects ambiguous matches without mutation, and is idempotent. Playwright derives its endpoints from the running local Supabase stack so hosted development settings cannot bypass Mailpit. A clean local reset, all 109 database assertions, application-schema lint, 27 unit tests, 34 passing browser checks with 2 intentional skips, lint, typecheck, production build, and `git diff --check` pass.
- 2026-08-07 — Completed Phase 06 with a standalone 50-assertion pgTAP authorization matrix covering anonymous, Learner A, Learner B, reviewer, and authenticated outsider personas. The harness proves cross-learner and cross-cohort isolation, anonymous denial, outsider invisibility, protected-column boundaries, reviewer management limits, and prevention of self-granted reviewer access. No production policy changes were required. A clean local reset, all 87 database assertions, application-schema lint, 16 unit tests, lint, typecheck, production build, and `git diff --check` pass.
- 2026-08-07 — Completed Phase 05 with cohorts, durable normalized-email invites, explicitly created profiles, active/removed cohort memberships, and private reviewer roles. Added constrained timestamps and lifecycle values, policy-supporting indexes, narrow column grants, RLS for exposed identity tables, and `private.is_reviewer()` with a fixed empty search path. A clean local reset, schema lint, all 37 database assertions, 16 unit tests, lint, typecheck, production build, and `git diff --check` pass. Comprehensive multi-persona denial coverage remains Phase 06.
- 2026-08-05 — Completed Phase 04 with typed Supabase browser/server clients, request-scoped Next.js 16 cookie handling, root `proxy.ts` session refresh through verified `getClaims()`, generated local database types, environment validation, and static-asset matcher exclusions. All 16 unit tests, 10 database assertions, and 24 Playwright checks pass; lint, typecheck, production build, and `git diff --check` pass. Authorization remains outside the proxy and must be enforced in server code and RLS.
- 2026-08-05 — Completed Phase 03 after Playwright verification of `/`, `/auth/sign-in`, `/app`, `/app/project`, and `/admin` at 360 px and desktop. All 24 shell checks pass, covering horizontal overflow, Macedonian language metadata and glyph support, skip-link focus transfer, reduced motion, and semantic-token WCAG AA contrast. Visual captures were inspected, the skip-link targets were made programmatically focusable, and lint, typecheck, production build, and `git diff --check` pass.
- 2026-08-05 — Completed Phase 02 with migration-managed Curriculum v1: six ordered stages, ten ordered Macedonian assignments, thirty acceptance criteria, `requires_review = true`, authenticated read-only RLS, deterministic UUIDs, and pgTAP assertions. A clean local Supabase reset and all 10 database tests passed. Local Supabase uses ports `55320–55329` because Windows reserves the default `54320–54329` range on this workstation.
- 2026-08-05 — Started Phase 03 with self-hosted Onest and Unbounded through `next/font`, Lansiraj metadata, responsive semantic containers, a keyboard skip link, and distinct public, auth, learner, and reviewer shells. Lint, typecheck, and production build pass. Phase 03 remains in progress until 360 px/desktop visual, contrast, and Macedonian glyph QA can be performed.
- 2026-08-05 — Completed Phase 01 with Node 22 and npm 10.9.2 pinned, stable verification scripts, environment documentation, GitHub Actions CI, and ADRs for the modular monolith, Supabase authorization, and curriculum versioning. Tailwind's WASM fallback peers are pinned as development dependencies because npm otherwise produces a lockfile that fails clean installation. An isolated `npm ci` followed by lint, typecheck, and production build passed.
- 2026-08-05 — Added the Tailwind CSS v4 global token foundation in `app/globals.css`; Phase 03 remains incomplete until fonts and the application shells pass its exit gate.
- Add implementation discoveries here only when they differ from the approved context.
- Record architecture changes in a short ADR when a beta finding or concrete technical constraint justifies them.
- Never store credentials, real participant evidence, or private interview data in this file.

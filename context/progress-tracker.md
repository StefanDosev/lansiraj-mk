# Progress Tracker

Update this file after every completed feature. An agent reading it must know what is done, what is active, what is blocked, and what comes next. Do not mark a feature complete until its exit gate passes.

## Current Status

**Phase:** 4 — Proof Submission
**Last completed:** 16 transactional immutable submission
**In progress:** None
**Next:** Begin 17 submission history and submitted-state UI
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
- [x] 08 Deploy preview and verify invited/unauthorized auth paths

### Phase 2 — Onboarding and Project

- [x] 09 Build learner onboarding UI and validation
- [x] 10 Create one scoped project and instantiate project assignments
- [x] 11 Build project scope summary and manual scope-readiness state

### Phase 3 — Curriculum and Dashboard

- [x] 12 Render versioned curriculum Markdown and acceptance criteria
- [x] 13 Build current-assignment dashboard and exact unlock messaging
- [x] 14 Build six-stage journey rail and project overview

### Phase 4 — Proof Submission

- [x] 15 Build draft text and typed-link evidence form
- [x] 16 Implement transactional immutable submission
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

- 2026-08-13 — Completed Phase 16 with transactional immutable assignment submission. `submit_assignment(...)` row-locks the owned assignment, verifies editable state and the exact saved-draft timestamp, requires non-empty text or at least one saved HTTPS link, rejects duplicate pending submission, freezes sequential immutable text/link snapshots, moves the assignment to `submitted`, and appends an activity event atomically. The retained draft is locked by assignment state until a future revision. The UI separates save from submit, blocks stale/unsaved evidence, and requires explicit confirmation. A clean reset, all 245 database assertions, 58 unit tests, database lint/advisors, lint, strict typecheck, production build, and targeted authenticated desktop and 360 px submission flows pass. The linked migration is applied, the Vercel Preview is Ready, and authenticated live verification confirmed dirty-draft gating, explicit confirmation, version 1 snapshot integrity, assignment state, activity event, submitted-state UI, and no horizontal overflow at 360 px.
- 2026-08-13 — Completed Phase 15 with one owner-editable draft per project assignment, plain text evidence, up to ten ordered typed HTTPS links, explicit save, and optimistic stale-write protection. Draft text and links persist atomically through a narrowly granted database function only while an assignment is available or revision-required; mutable drafts remain separate from future immutable submissions. Owner-only RLS, state gates, constraints, conflict handling, accessible field errors, refresh persistence, and locked-task read-only behavior are covered. A clean reset, all 204 database assertions, 55 unit tests, targeted desktop and 360 px local browser flows, lint, strict typecheck, production build, and diff checks pass. The linked development migrations are current and the Ready Vercel Preview passed authenticated desktop and 360 px manual checks: HTTP link validation and `aria-describedby`, HTTPS save and reload persistence, locked-task read-only state, no horizontal overflow, 44 px controls, and no browser warnings/errors.
- 2026-08-12 — Completed Phase 14 with a pure journey derivation model, six-stage responsive rail, ten ordered linked tasks, explicit text states, exact locked prerequisites, and a guarded public endpoint that appears only after launch evidence approval. Later inconsistent states normalize to locked, approved launch data without a URL surfaces an explicit error, and one semantic DOM order adapts from the mobile stepper to the desktop rail. The journey pattern is registered in the UI registry. All 178 database assertions, 51 unit tests, 42 browser checks with 3 intentional skips, lint, typecheck, production build, and diff checks pass.
- 2026-08-12 — Completed Phase 13 with a pure ordered current-assignment derivation model, database-derived approved/total progress, required-proof preview, intentional feedback placeholder, state-specific primary actions, and exact unlock messaging. Available, submitted, revision-required, locked inconsistency, empty projection, and completed-path states are explicit without adding submission/review schema early. The richer active-project query includes stage and proof context, and the dashboard pattern is registered in the UI registry. All 178 database assertions, 45 unit tests, targeted mobile/desktop learner flow, lint, typecheck, and production build pass.
- 2026-08-12 — Completed Phase 12 with active-project and pinned-version assignment queries, safe Server Component Markdown rendering, ordered semantic acceptance criteria, readable available/locked assignment states, and an intentional not-found boundary. The learner dashboard now links to the current assignment. Raw HTML is skipped, unsafe URL protocols are rejected, all ten seeded assignments render from the database, and the shared curriculum patterns are registered in the UI registry. All 178 database assertions, 39 unit tests, targeted mobile/desktop learner flow, lint, typecheck, and production build pass.
- 2026-08-12 — Completed Phase 11 with one shared read-only learner/reviewer project-scope summary, Macedonian date display, explicit non-blocking manual readiness states, and a focused reviewer route for replacing the current assessment. The database enforces reviewer-only mutation, note constraints, owner/reviewer visibility, and assignment independence through RLS and a controlled RPC. A clean local reset, all 178 database assertions, 39 unit tests, targeted desktop learner-to-reviewer browser verification, lint, typecheck, and production build pass. The visual patterns were imprinted in the UI registry.
- 2026-08-12 — Completed Phase 10 with an explicit learner confirmation action, curriculum-version pinning, ten owner-scoped `project_assignments`, Assignment 01 as the sole available step, minimal activity events, and a retry-safe row-locked `start_project()` transaction. The RPC rejects missing/malformed curriculum without mutating the draft and rejects inconsistent partial initialization. A clean local reset, all 153 database assertions, 35 unit tests, 42 browser checks with 3 intentional skips, lint, typecheck, production build, application-schema lint, database security/performance advisors, and mobile/desktop start-flow verification pass. The full local email suite is stable with one Playwright worker; parallel magic-link fixtures can interfere while local Supabase helper commands cycle nonessential services.
- 2026-08-10 — Completed Phase 09 with a constrained draft project schema, atomic onboarding RPC, owner/reviewer RLS, shared Zod validation, focus-managed field errors that preserve input, and explicit evidence/privacy guidance. A clean local reset, all 125 database assertions, 35 unit tests, and 42 browser checks with 3 intentional skips pass; lint, typecheck, production build, database advisors, desktop verification, and 360 px visual/overflow QA also pass. Phase 10 will activate the draft project and instantiate the ten assignment projections.
- 2026-08-10 — Completed Phase 08 on the stable Vercel branch Preview. Supabase's free default mailer uses authorization-code magic links with Confirm Email disabled; Preview callbacks use `VERCEL_BRANCH_URL` so PKCE cookies and code exchange stay on one hostname. Applied and verified all three repository migrations against the linked dev/test Supabase project, with no advisor errors. Manual invited and unauthorized flows passed on desktop and mobile, the Vercel deployment and GitHub checks passed, and the temporary cohort, invitation, and membership fixture was removed with zero rows remaining.
- 2026-08-10 — Recovered the repeated Preview callback failure to a PKCE cookie-domain mismatch: the sign-in request ran on Vercel's stable branch alias while `VERCEL_URL` generated a commit-specific email callback. Preview authentication origins now prefer `VERCEL_BRANCH_URL` and fall back to `VERCEL_URL`, keeping the request, verifier cookie, and callback on one hostname. Phase 08 remains open until this targeted deployment passes invited and unauthorized flows on mobile and desktop.
- 2026-08-08 — Phase 08 preview infrastructure is configured at Vercel project `lansiraj` with `main` mapped to Production and feature branches mapped to Preview. The preview uses the existing dev/test Supabase project with explicit callback and confirmation redirect allowlist entries. Manual testing proved outsider routing to `/access-pending` but exposed an unreliable separate first-time confirmation step. Added `/auth/confirm`, shared post-auth access resolution, token-hash support for future custom SMTP templates, and authorization-code compatibility for Supabase's free default mailer; Confirm Email is disabled for the passwordless dev/test flow. Local verification passes, while Phase 08 remains open until the corrected preview passes invited and unauthorized flows on mobile and desktop.
- 2026-08-08 — Closed and verified the Phase 07 guard review gap: reviewers now take precedence over learner membership, incomplete learners are redirected from `/app` and `/app/project` to `/app/onboarding`, and completed learners are redirected away from onboarding. Added focused guard unit tests and an invited-learner Playwright path backed by safe per-run local fixtures. The 109 database assertions, 31 unit tests, 35 browser tests with 4 intentional skips, lint, typecheck, production build, and diff checks pass. Phase 08 repository inspection found no linked Vercel project or explicit preview target, so no external deployment changes were made.
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

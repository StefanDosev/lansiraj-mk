# Progress Tracker

Update this file after every completed feature. An agent reading it must know what is done, what is active, what is blocked, and what comes next. Do not mark a feature complete until its exit gate passes.

## Current Status

**Phase:** 0 — Architecture freeze  
**Last completed:** Lansiraj context pack aligned with Product Brief, Brand Identity, and Architecture Plan v1.0  
**In progress:** None  
**Next:** 01 Repository baseline and environment matrix  
**Blockers:** The application repository is not present in this workspace; implementation status is therefore intentionally unclaimed.

## Progress

### Phase 0 — Architecture Freeze

- [x] 00 Align product, brand, architecture, and build context
- [ ] 01 Repository baseline, scripts, CI, environment matrix, and ADRs
- [ ] 02 Curriculum v1 seed: six stages, ten assignments, acceptance criteria

### Phase 1 — Foundation and Auth

- [ ] 03 Encode brand tokens, fonts, app shell, and responsive foundations
- [ ] 04 Configure Supabase browser/server clients and session proxy
- [ ] 05 Create cohorts, invites, profiles, memberships, and reviewer-role migrations
- [ ] 06 Add RLS policies and database security tests
- [ ] 07 Build magic-link sign-in, callback, sign-out, pending-access, and protected shell
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

- Add implementation discoveries here only when they differ from the approved context.
- Record architecture changes in a short ADR when a beta finding or concrete technical constraint justifies them.
- Never store credentials, real participant evidence, or private interview data in this file.


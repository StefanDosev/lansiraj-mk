# Build Plan

## Core Principle

Build one deployable vertical slice at a time. Each feature ends in a user-visible scenario, database/security verification, automated checks, and a preview deployment. Do not scaffold the entire platform and postpone integration.

The first complete product loop is:

> invited learner → one project → Assignment 01 → immutable proof → revision or approval → Assignment 02 unlocked

Everything after that repeats or hardens this loop.

## Order Inside Every Feature

1. Write the user-visible acceptance scenario.
2. Add or update migrations, constraints, RLS, and database tests.
3. Implement feature-owned validation, query, and mutation code.
4. Build the smallest accessible UI that completes the scenario.
5. Run typecheck, lint, unit/database tests, and the relevant Playwright path.
6. Verify mobile, empty, loading, validation, retry, and unauthorized states in preview.
7. Update `progress-tracker.md` and `ui-registry.md`; add an ADR only for a durable decision.

## Phase 0 — Architecture Freeze

### 00 Context Alignment — Complete

**Outcome:** Every Markdown context file describes Лансирај and the approved v0.1 scope.

**Exit gate:** No unrelated product, dependency, visual, route, or data-model concepts remain in active Markdown context.

### 01 Repository Baseline

**Build:**

- Confirm the actual app repository, default branch, package manager, Node version, and installed dependencies.
- Add scripts for dev, build, typecheck, lint, unit, database, and e2e checks.
- Add `.env.example` with names only and an environment matrix for local, preview, and production.
- Add CI for non-secret checks and the first ADRs: modular monolith, Supabase authorization, and curriculum versioning.

**Do not:** replace an existing scaffold or upgrade dependencies without inspecting the repository and current official migration guidance.

**Exit gate:** clean install and production build succeed; scripts are documented; no secrets are committed.

### 02 Curriculum v1 Seed

**Build:**

- Encode six stages, ten assignments, Macedonian titles/body/proof prompts, and ordered acceptance criteria as versioned seed data.
- Include `requires_review = true` on every beta assignment.
- Add a deterministic reset/seed path for local development.

**Exit gate:** clean database reset produces exactly six stages and ten ordered assignments with no duplicate positions/slugs.

## Phase 1 — Foundation and Auth

### 03 Brand and App Shell

**Build:**

- Load Unbounded for short display text and Onest for body/UI with Macedonian subsets.
- Encode `ui-tokens.md` through Tailwind v4 theme variables and semantic CSS variables.
- Build public, auth, learner, and reviewer shells; visible focus; skip link; responsive container.
- Verify Macedonian glyphs: Ѓ ѓ, Ќ ќ, Ѕ ѕ, Љ љ, Њ њ, Џ џ.

**Exit gate:** shell renders at 360 px and desktop, fonts fall back safely, contrast passes, reduced motion works.

### 04 Supabase SSR Foundation

**Build:**

- Add browser/server clients using `@supabase/ssr` and publishable environment variables.
- Add `proxy.ts` token refresh using verified claims.
- Generate committed database types.

**Exit gate:** server and browser clients work locally; protected server code never trusts `getSession()` for authorization.

### 05 Identity and Enrollment Schema

**Build:** cohorts, invites, profiles, memberships, private reviewer roles, timestamps, constraints, indexes, and RLS.

**Exit gate:** migrations apply from a clean reset; reviewer-role data cannot be edited by a learner.

### 06 Database Security Harness

**Build:** allowed/denied tests for anonymous, learner A, learner B, reviewer, and authenticated outsider.

**Exit gate:** cross-learner reads/writes, self-granted reviewer access, and anonymous protected reads all fail.

### 07 Invitation Magic-Link Flow

**Build:** sign-in request, callback, sign-out, accepted-invite linkage, access-pending page, protected learner shell, reviewer guard.

**Exit gate:** invited learner signs in and reaches the correct next route; outsider sees no learner data; reviewer routes reject non-reviewers.

### 08 Auth Preview Checkpoint

**Build:** preview environment configuration and Playwright auth smoke path using safe test fixtures.

**Exit gate:** invited and unauthorized flows pass in preview on mobile and desktop; preview does not target production unintentionally.

## Phase 2 — Onboarding and Project

### 09 Learner Onboarding

**Fields:** display name, project title/idea, target user, painful problem, core action, explicit non-features, weekly hours, target launch date.

**Build:** server-rendered form, shared Zod schema, field errors, saved state, privacy/evidence notice.

**Exit gate:** valid onboarding persists; invalid and unauthorized writes fail safely; refresh does not lose accepted data.

### 10 Start One Project

**Build:** `projects`, `project_assignments`, `start_project(...)`, unique active-project constraint, Assignment 01 unlock.

**Exit gate:** transaction creates one project and ten projections; retry cannot duplicate them; Assignment 01 alone is available.

### 11 Project Scope Summary

**Build:** calm review screen showing one user, one problem, one core action, non-feature list, weekly commitment, and target date.

**Exit gate:** learner can explain the constrained project; reviewer can inspect it; UI does not imply automated AI approval.

## Phase 3 — Curriculum and Dashboard

### 12 Curriculum Rendering

**Build:** safe Markdown rendering for assignment body/proof prompt, acceptance criteria list, stage/assignment query functions.

**Exit gate:** all ten assignments render in Macedonian from database seed data; unsafe HTML is not rendered.

### 13 Current-Assignment Dashboard

**Build:** current stage/assignment, required proof, state, latest feedback, next exact unlock condition, primary action.

**Exit gate:** dashboard derives the correct task from state; every locked state explains why; no manual percentage field exists.

### 14 Journey Rail and Project Overview

**Build:** six-stage accessible rail, ten-task detail, state labels, public endpoint, mobile stepper/list alternative.

**Exit gate:** all meaning is available without colour or animation; keyboard and screen reader order are logical.

## Phase 4 — Proof Submission

### 15 Draft Evidence

**Build:** text evidence and repeatable typed URL inputs; autosave only if it is reliable, otherwise explicit `Зачувај draft`.

**Exit gate:** owner can create/update only their draft for an available/revision assignment; invalid URLs show field errors.

### 16 Immutable Submit

**Build:** submissions, links, versioning, `submit_assignment(...)`, pending-submission guard, activity event.

**Exit gate:** submission freezes text/links, state becomes submitted, direct update fails, duplicate submit is idempotent or rejected clearly.

### 17 Submission History

**Build:** version timeline, timestamps, link labels, latest status, review association, and submitted/read-only states.

**Exit gate:** learner sees only their history and can distinguish draft, submitted, revision-required, and approved versions.

## Phase 5 — Human Review and Unlock

### 18 Reviewer Queue

**Build:** oldest-first pending queue with learner, project, assignment, submitted time, and queue empty/error states.

**Exit gate:** only reviewers can load it; every row links to a specific immutable submission.

### 19 Criterion-Level Review

**Build:** evidence context, version history, pass/revise per criterion, summary, priority correction, typed Server Action result.

**Exit gate:** decision cannot be submitted without complete criterion outcomes; reviewer sees exactly what learner submitted.

### 20 Revision Loop

**Build:** transactional revision decision, coral feedback panel, returned-line state, new draft version based on the prior evidence.

**Exit gate:** learner sees one priority correction and why; next task remains locked; resubmission creates a new immutable version.

### 21 Approval and Unlock

**Build:** transactional approval, criterion notes, approved checkpoint, next ordered assignment unlock, terminal completion handling.

**Exit gate:** approval and unlock cannot partially succeed; concurrent/double review is safely rejected; final assignment does not unlock a nonexistent task.

## Phase 6 — Beta Hardening

### 22 Accessibility and Responsive QA

**Verify:** 360 px, tablet, desktop; keyboard path; focus; labels/errors; contrast; status text; long Macedonian content; reduced motion.

**Exit gate:** no critical accessibility or responsive defect on primary flows.

### 23 Privacy, Abuse, and Failure States

**Build:** evidence warning, privacy page, waitlist/auth rate protection where needed, friendly not-found/permission/retry states, minimal audit events.

**Exit gate:** users understand evidence visibility/deletion; secrets are never logged; denied access leaks no project context.

### 24 Automated Release Gates

**Build:** Vitest domain tests, database/RLS tests, Server Action integration tests, and Playwright invite → onboard → submit → revise → resubmit → approve → unlock.

**Exit gate:** all checks run from documented commands and pass from a clean local setup.

### 25 Deployment Runbook

**Build:** environment verification, migration order, production smoke test, export/backup step, rollback/repair note, seed restrictions.

**Exit gate:** production deploy is repeatable without dashboard-only schema changes or production credentials in source.

## Phase 7 — Pilot Operation

### 26 Founder Dogfood

Stefan completes the entire journey using separate learner/reviewer test accounts and records confusion, review time, revisions, and scope pressure.

**Exit gate:** full loop reaches live URL or produces a documented product correction.

### 27 First Learners

Invite 2–3 Macedonian learners. Measure activation, first-three completion, launch, real-user feedback, revision count, and review workload.

**Exit gate:** behaviour and qualitative observations are recorded without changing the core product mid-assignment unless safety or data integrity requires it.

### 28 Evidence-Based Revisit

Revisit only after the first four learners:

- assignments that can auto-unlock;
- evidence types needing private uploads;
- recurring reviewer feedback that should become clearer criteria or templates;
- public case-study generation;
- a future paid cohort/review model;
- narrowly scoped AI assistance.

## Global Definition of Done

A feature is done only when:

- happy, empty, loading, validation, permission, retry, and mobile states are intentional;
- database constraints and RLS prevent bypassed-UI violations;
- Macedonian copy follows the approved state language;
- no essential meaning depends only on colour or motion;
- the critical behaviour has an automated test;
- preview was checked manually;
- `progress-tracker.md` and, when applicable, `ui-registry.md` are current.

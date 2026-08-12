# Memory — Phase 14 journey rail and project overview

Last updated: 2026-08-12 16:29 +02:00

## What was built

- Completed Phases 12–14 after the previous Phase 11 handoff.
- Phase 12 adds authenticated assignment routes at `/app/assignments/[slug]`, safe migration-owned curriculum Markdown rendering, ordered acceptance criteria, proof prompts, readable locked assignments, and an intentional not-found state under `features/curriculum/` and `app/(learner)/app/assignments/`.
- Phase 13 replaces the active-project placeholder at `/app` with a server-rendered current-assignment dashboard under `features/progress/`. It derives the earliest non-approved task, approved/total progress, state-specific copy/actions, required proof, feedback placeholder, and exact unlock condition.
- Phase 14 extends `/app/project` with `features/journey/`: a pure journey derivation model, six-stage responsive rail, ten linked assignment rows, explicit state labels, exact locked prerequisites, and a guarded live-project endpoint.
- Extended the current-project projection and types with assignment proof/stage context and the nullable project live URL.
- Added unit coverage in `tests/unit/curriculum-markdown.test.tsx`, `tests/unit/current-assignment-dashboard.test.ts`, and `tests/unit/project-journey.test.ts`; expanded `tests/e2e/auth.spec.ts` across the learner curriculum, dashboard, and journey.
- Registered Curriculum Markdown, Assignment Curriculum, Current Assignment Dashboard, and Project Journey patterns in `context/ui-registry.md`; marked Phase 14 complete in `context/progress-tracker.md`.

## Decisions made

- Curriculum Markdown is migration-managed trusted content rendered in a Server Component with raw HTML skipped, an explicit element allowlist, safe URL transformation, and safe external-link attributes. Learner-authored evidence must remain plain text and typed URLs.
- The current assignment is the earliest ordered non-approved assignment. An earlier locked inconsistency takes precedence over a later available task; progression never skips ahead.
- Progress is derived from approved assignments over total assignments and is never stored or manually edited as a percentage.
- All ten assignment titles remain navigable, including locked tasks, because curriculum stays readable for preparation while submission remains state-gated.
- A stage is approved only when all its tasks are approved. The stage containing the earliest non-approved task adopts that task’s state; all later tasks/stages normalize to locked.
- The final endpoint stays named and locked until the `public-launch-outreach` assignment is approved. It then exposes the HTTPS live URL; approved launch evidence without a URL is an explicit data error.
- The journey uses one semantic DOM order that adapts from a mobile vertical stepper to a desktop horizontal rail without duplicating accessible content or relying on colour/motion.

## Problems solved

- The expanded curriculum browser flow exceeded the generic Playwright scenario timeout; `/recover` identified accumulated navigation time rather than an application hang, and the stateful scenario now has a 60-second timeout.
- A Phase 14 endpoint assertion matched identical prerequisite copy in both Task 09 and the endpoint. The locator is now scoped to the labelled endpoint region, preserving strict semantic browser assertions.
- PowerShell blocks the `npm.ps1`/`npx.ps1` shims on this workstation. Use `npm.cmd`, `npx.cmd`, or repository scripts.

## Current state

- Phases 00–14 are marked complete. Phase 15 is next: draft text and repeatable typed-link evidence inputs.
- Verification passes: ESLint, strict TypeScript, Next.js production build, `git diff --check`, 51 unit tests, 178 database assertions, and 45 Playwright cases with 42 passing and 3 intentional skips across desktop, 360 px mobile, and reduced motion.
- `/review` found no plan-alignment, architecture, design-system, accessibility, or production-readiness issues in Phase 14.
- Phase 09–14 changes remain together in the shared dirty worktree and are not committed, pushed, deployed, or Preview-verified. Preserve all existing changes and do not overwrite unrelated work.
- The pinned Markdown dependency is `react-markdown` 10.1.0. A prior audit noted four high-severity transitive advisories in existing build-tool chains; no forced dependency upgrade was made.
- No credentials, tokens, environment values, participant data, or project secrets are stored here.

## Next session starts with

Run `/remember restore`, confirm this handoff, read `AGENTS.md` and all context files in its required order, then use `/architect` before Phase 15. Design the draft evidence contract around owner-editable drafts for available/revision assignments, plain text evidence, repeatable labelled HTTPS links, explicit save unless autosave can be proven reliable, Zod validation, and database/RLS enforcement.

## Open questions

- Whether to commit/deploy and Preview-verify the accumulated Phase 09–14 changes before beginning Phase 15.
- Phase 15 must decide draft persistence boundaries, link types/limits, save conflict behavior, and whether a new evidence schema should be introduced wholly in Phase 15 or split with immutable submission in Phase 16.
- When production needs a separate Supabase project and custom SMTP/branded authentication email templates.

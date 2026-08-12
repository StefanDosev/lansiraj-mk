# Memory — Phase 11 project scope readiness

Last updated: 2026-08-12 15:20 +02:00

## What was built

- Completed Phases 10 and 11 after the prior Phase 09 handoff.
- Phase 10 activates the learner's single draft project, pins Curriculum v1, creates ten project-assignment projections, and makes only Assignment 01 available through a retry-safe database transaction.
- Phase 11 adds the shared read-only project scope summary at `/app/project` and the focused reviewer assessment route at `/admin/projects/[projectId]`.
- Added `project_scope_assessments`, owner/reviewer RLS, least-privilege grants, and reviewer-only `assess_project_scope(...)` RPC in `supabase/migrations/20260812130428_add_project_scope_readiness.sql`.
- Added project scope queries, types, Zod validation, server action, shared summary, reviewer form, database types, and unit/database/Playwright coverage under `features/projects/`, `app/`, `lib/supabase/`, `supabase/tests/`, and `tests/`.
- Updated `context/ui-registry.md` with the shared scope-summary and inverse reviewer-form patterns, and marked Phase 11 complete in `context/progress-tracker.md`.

## Decisions made

- Manual scope readiness is separate from assignment approval and never blocks or mutates project assignments.
- Readiness has two reviewer-controlled states: `ready` and `needs_reduction`; the latter requires a concrete note of at least 10 characters.
- The latest assessment replaces the current state while retaining reviewer identity and review timestamp.
- Learner and reviewer scope fields are read-only. Reviewers mutate only the assessment through the controlled RPC.
- The focused project review route is intentionally not a reviewer queue; the queue remains Phase 18.
- Project dates are stored as dates and formatted at the Macedonian display edge.

## Problems solved

- Updated local Supabase database types so the one-to-one scope-assessment relation and assessment RPC are recognized by strict TypeScript queries.
- Confirmed the full learner-to-reviewer browser flow works with local Mailpit: learner starts a project, sees the read-only scope, reviewer records a reduction request, and Assignment 01 remains available.
- PowerShell blocks the `npx.ps1` shim on this workstation; use `npx.cmd` or npm scripts when invoking Node CLIs.

## Current state

- Phases 00–11 are marked complete. Phase 12 is next.
- Verification passes: clean local Supabase reset, 178 database assertions, 39 unit tests, 42 Playwright checks with 3 intentional skips, ESLint, TypeScript, production build, and Supabase schema lint.
- The `/review` audit found no plan-alignment, architecture, design-system, or production-readiness issues in Phase 11.
- Phase 09–11 changes remain in the shared dirty worktree and have not been committed, pushed, deployed, or Preview-verified. Preserve all existing unrelated changes.
- `git diff --check` reports pre-existing trailing whitespace in `.agents/skills/vercel-react-best-practices/SKILL.md`; this is unrelated to Phase 11 and was not modified during closeout.
- No credentials, tokens, environment values, or project secrets are stored here.

## Next session starts with

Run `/remember restore`, confirm the handoff, read `AGENTS.md` and every context file in its required order, then use `/architect` before implementing Phase 12: versioned curriculum Markdown and acceptance criteria.

## Open questions

- Whether to commit/deploy and Preview-verify the accumulated Phase 09–11 changes before beginning Phase 12.
- The exact Phase 12 curriculum rendering contract should be resolved during `/architect`, including Markdown ownership, sanitization, and the boundary between curriculum content and learner progress state.
- When production needs a separate Supabase project and custom SMTP/branded authentication email templates.

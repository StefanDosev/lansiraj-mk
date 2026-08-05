# Memory — Phase 03 and Phase 04 completion

Last updated: 2026-08-05 14:33 +02:00

## What was built

- Completed Phase 03: Onest/Unbounded typography, semantic Tailwind foundations, shared Brand Signature and Skip Link, and distinct marketing, auth, learner, and reviewer shells for `/`, `/auth/sign-in`, `/app`, `/app/project`, and `/admin`.
- Added Playwright configuration and `tests/e2e/shells.spec.ts` with 24 checks across 360 px, desktop, and reduced-motion contexts.
- Fixed skip-link focus transfer by making each target main landmark programmatically focusable.
- Completed Phase 04 in `lib/supabase/`: validated environment access, typed browser/server clients, generated `database.types.ts`, and request-scoped cookie handling.
- Added root `proxy.ts` and `lib/supabase/proxy.ts` for session refresh through verified `getClaims()` with static-asset exclusions and no authorization redirects.
- Installed Vitest, added its scoped configuration, and added 16 environment, matcher, and cookie-propagation unit tests.
- Updated canonical `context/progress-tracker.md` and `context/ui-registry.md`.

## Decisions made

- Supabase modules live under root `lib/supabase/`, matching the root-level `app/` structure.
- Environment values are validated when a client is created, not at module-import time.
- The proxy refreshes cookies broadly but never decides learner/reviewer access; server code and RLS remain authoritative.
- Server authorization must use verified claims and must not trust `getSession()`.
- Phase 05 must begin with the architect workflow.

## Problems solved

- Replaced the unavailable in-app preview workflow with repeatable Playwright visual and interaction QA.
- Fixed skip-link navigation that changed the URL without moving keyboard focus.
- Configured Vitest to exclude Playwright specs and resolve the repository alias.
- Used the actual Next.js 16 matcher-test export because the installed API retains the legacy middleware helper name despite proxy documentation.
- Supabase CLI operations require permission to write their telemetry cache outside the workspace; font-dependent production builds require network access.

## Current state

- Phases 00–04 are complete; Phase 05 has not started.
- All 16 unit tests, 10 pgTAP database assertions, and 24 Playwright checks pass.
- Lint, TypeScript, production build, and `git diff --check` pass.
- Playwright verified all five shell routes through the real local session proxy. One outer test command timed out during dev-server shutdown after all 24 assertions passed because sandboxed font requests kept retrying.
- The local Supabase stack is running. Do not persist, print, or copy its generated local credentials.
- The worktree includes earlier user-owned baseline changes and this session's changes; preserve unrelated edits.

## Next session starts with

Run `/remember restore`, verify runtime Supabase values are stored in ignored `.env.local` rather than committed `.env.example`, then start Phase 05 — identity and enrollment schema — using `/architect`.

## Open questions

- `.env.example` is currently untracked and contains non-empty browser-safe configuration. Next.js does not load that file at runtime; decide with the developer whether to migrate the values to ignored `.env.local` and return `.env.example` to a names-only template before committing.
- npm continues to report three high-severity dependency advisories; no forced audit fix was applied because it may introduce breaking upgrades.

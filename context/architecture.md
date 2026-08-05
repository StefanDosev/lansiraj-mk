# Architecture

## Architecture Decision

Build **Лансирај v0.1 as a modular monolith**: one Next.js App Router application, one Supabase project, and one Vercel deployment pipeline. The architecture exists to prove the full assignment → evidence → review → unlock → launch loop for four learners, not to anticipate scale the product has not earned.

## Stack

| Layer | Choice | Rule |
| --- | --- | --- |
| Application | Next.js App Router + React + strict TypeScript | Server Components by default; Client Components only for real browser interaction. |
| Styling | Tailwind CSS v4 + CSS-first theme tokens | Encode the Lansiraj identity locally; do not install a large dashboard kit. |
| Mutations | Server Actions | Validate with Zod, verify identity server-side, call user-scoped data operations, return typed errors. |
| HTTP endpoints | Route Handlers | Use for auth callbacks and genuine integrations only, not ordinary form mutations. |
| Auth | Supabase Auth + `@supabase/ssr` | Invitation-based magic links, cookie SSR, `proxy.ts` refresh, verified claims. |
| Database | Supabase Postgres | Source of truth for curriculum, project state, immutable submissions, reviews, and unlocks. |
| Authorization | Postgres Row Level Security | Every exposed table has RLS; route guards improve UX but never replace database policy. |
| Validation | Zod | Shared schemas at trust boundaries; database constraints remain authoritative. |
| Testing | Vitest, Supabase/pgTAP database tests, Playwright | Critical workflow and authorization paths are release gates. |
| Deployment | Vercel | Preview per branch/PR; preview and production secrets remain separate. |
| Database workflow | Supabase CLI migrations + seed | Schema, RLS, functions, curriculum, and database tests live in version control. |

Do not add a separate API server, ORM, CMS, queue, analytics platform, AI SDK, file-storage flow, or service-role runtime path unless the approved scope changes.

## Proposed Folder Structure

```text
src/
  app/
    (marketing)/
      page.tsx
      privacy/page.tsx
    (auth)/
      auth/sign-in/page.tsx
      auth/callback/route.ts
      access-pending/page.tsx
    (learner)/
      app/layout.tsx
      app/page.tsx
      app/onboarding/page.tsx
      app/project/page.tsx
      app/assignments/[slug]/page.tsx
    admin/
      layout.tsx
      page.tsx
      reviews/[submissionId]/page.tsx
  features/
    auth/
    cohorts/
    projects/
    curriculum/
    submissions/
    reviews/
    progress/
  components/
    ui/
    brand/
  lib/
    supabase/
      client.ts
      server.ts
      proxy.ts
      database.types.ts
    validation/
    security/
  styles/
    globals.css
proxy.ts
supabase/
  migrations/
  tests/database/
  seed.sql
tests/
  unit/
  integration/
  e2e/
docs/
  adr/
context/
```

Feature modules own their schemas, queries, actions, types, and UI compositions. `components/ui` contains generic accessible primitives only. `components/brand` contains reusable Lansiraj behaviours such as the checkpoint, journey rail, and proof-state display. Avoid giant `actions.ts`, `utils.ts`, or `repositories.ts` files.

## Runtime Boundaries

### Browser

- Renders public and authenticated UI.
- Sends form data to Server Actions.
- May use the browser Supabase client only when a Client Component genuinely needs it.
- Never decides ownership, reviewer role, submission state, approval, or unlocks.
- Never receives service-role credentials or privileged role data.

### Next.js Server

- Verifies claims and route eligibility.
- Loads user-scoped data through the server Supabase client.
- Validates mutation input with Zod.
- Calls normal RLS-scoped queries or narrowly defined RPC functions.
- Maps database errors to stable, user-safe action results.
- Revalidates affected routes after successful mutations.

### Supabase Postgres

- Enforces ownership, membership, and reviewer boundaries with RLS.
- Enforces uniqueness, foreign keys, checks, and state-transition constraints.
- Performs submit, review, and unlock operations transactionally.
- Stores curriculum Markdown and acceptance criteria as versioned seed data.
- Appends minimal activity events for onboarding, submit, revision, approval, unlock, and launch.

## Primary Data Flows

### Authentication and Enrollment

1. Reviewer creates `cohort_invites` for a selected email.
2. Learner authenticates through an email magic link.
3. `/auth/callback` exchanges the auth code and redirects to the protected flow.
4. Server verifies claims and checks accepted cohort membership.
5. Enrolled learners continue to onboarding or `/app`; authenticated outsiders go to `/access-pending`.
6. RLS still filters every query after route eligibility is established.

### Start Project

1. Learner submits onboarding and project scope through a Server Action.
2. Zod validates user-facing fields; server verifies the learner and membership.
3. `start_project(...)` creates the one active project, instantiates ten `project_assignments`, and unlocks Assignment 01 in one transaction.
4. The dashboard derives progress from assignment states.

### Save Draft and Submit Evidence

1. Learner edits draft text and typed links for an available or revision-required assignment.
2. A normal owner-scoped mutation saves the draft.
3. `submit_assignment(...)` verifies ownership, state, and required proof; freezes a new immutable submitted version; records links and an activity event.
4. The assignment becomes `submitted`; future steps remain locked until review.

### Review and Unlock

1. Reviewer opens one submitted version from the queue.
2. Reviewer records criterion outcomes, summary, and optional priority correction.
3. `review_submission(...)` verifies reviewer status and the current submitted version.
4. `revision_required` returns the assignment for a new version without unlocking the next task.
5. `approved` records the review, updates the project-assignment state, and unlocks the next assignment atomically.

## Database Schema

All primary keys are UUIDs unless the final migration documents another choice. Use `timestamptz` for timestamps and database defaults for creation time.

### `cohorts`

- `id`, `name`, `status`, `starts_at`, `ends_at`, `created_at`, `updated_at`
- Status is a constrained value such as `draft`, `active`, `completed`, `archived`.

### `cohort_invites`

- `id`, `cohort_id`, normalized `email`, `expires_at`, `accepted_by`, `accepted_at`, `created_by`, `created_at`
- Reviewer-managed only. One active invite per cohort/email.

### `profiles`

- `user_id` referencing `auth.users`, `display_name`, `locale`, `timezone`, `onboarding_completed_at`, timestamps
- User reads and updates their own permitted fields.

### `cohort_members`

- `id`, `cohort_id`, `user_id`, `status`, `joined_at`, timestamps
- Unique `(cohort_id, user_id)`.

### `private.reviewer_roles`

- `user_id`, `granted_by`, `created_at`
- Not exposed as a client-editable public table. Used by `private.is_reviewer()`.

### `projects`

- `id`, `owner_id`, `cohort_id`, `title`, `target_user`, `problem_statement`, `core_action`, `non_features`, `weekly_hours`, `target_launch_date`, `live_url`, `status`, timestamps
- v0.1 permits one active project per learner.

### `curriculum_stages`

- `id`, `curriculum_version`, `position`, `slug`, Macedonian `title`, `summary_md`, timestamps
- Six ordered stages; writes are migration-managed.

### `assignments`

- `id`, `stage_id`, `curriculum_version`, `position`, `slug`, `title`, `body_md`, `proof_prompt_md`, `requires_review`, timestamps
- Ten ordered assignments; writes are migration-managed.

### `acceptance_criteria`

- `id`, `assignment_id`, `position`, `criterion`, timestamps
- Order is explicit and stable within an assignment version.

### `project_assignments`

- `id`, `project_id`, `assignment_id`, `state`, `available_at`, `submitted_at`, `approved_at`, `due_at`, timestamps
- Unique `(project_id, assignment_id)`.
- State is constrained to `locked`, `available`, `submitted`, `revision_required`, `approved`.

### `submissions`

- `id`, `project_assignment_id`, `version`, `evidence_text`, `status`, `submitted_at`, `reviewed_at`, `supersedes_submission_id`, timestamps
- Submitted versions are immutable. Version is unique per project assignment.

### `submission_links`

- `id`, `submission_id`, `link_type`, `url`, `label`, `position`, timestamps
- Link type is constrained to known evidence categories such as `research`, `figma`, `repository`, `preview`, `live`, `testing`, or `other`.

### `reviews`

- `id`, `submission_id`, `reviewer_id`, `decision`, `summary`, `priority_correction`, `created_at`
- One final review per submitted version. Decision is `approved` or `revision_required`.

### `review_criteria`

- `id`, `review_id`, `acceptance_criterion_id`, `outcome`, `note`
- Unique `(review_id, acceptance_criterion_id)`; outcome is `pass` or `revise`.

### `activity_events`

- `id`, `project_id`, `actor_id`, `event_type`, minimal `metadata`, `created_at`
- Product audit only; do not store evidence copies or secrets in metadata.

### `waitlist_signups`

- Existing intake: `id`, `name`, normalized unique `email`, optional qualification fields, `consent`, `source`, `status`, timestamps
- Anonymous insert only; no public read, update, or delete.

## Controlled State Transitions

```text
locked → available → submitted → approved
                         ↘ revision_required → submitted
```

Only database functions may perform transitions into `submitted`, `revision_required`, or `approved`, and only approval may unlock the next assignment. The UI renders state; it does not author state.

## Required Database Functions

### `start_project(...)`

- Verify authenticated learner and accepted cohort membership.
- Enforce one active project.
- Create project-assignment projections for the curriculum version.
- Set Assignment 01 to `available`; leave the rest `locked`.

### `submit_assignment(...)`

- Verify ownership and that state is `available` or `revision_required`.
- Validate required proof and prevent multiple pending submissions.
- Create the next immutable version and freeze its links.
- Set project assignment to `submitted` and append an event.

### `review_submission(...)`

- Verify `private.is_reviewer()` and the referenced version is current and submitted.
- Persist review and criterion outcomes.
- For revision: set `revision_required` and append an event.
- For approval: set `approved`, unlock the next ordered assignment, and append both events atomically.

### `private.is_reviewer()`

- Security-definer helper backed by the private reviewer table.
- Fix `search_path`; expose only the boolean decision required by policies.

## RLS Policy Shape

| Area | Policy |
| --- | --- |
| Learner-owned data | Select only when ownership resolves to `(select auth.uid())`; permitted draft writes only for own rows. |
| Cohorts/membership | Learner reads their membership and cohort; reviewer manages. |
| Curriculum | Authenticated select; migration-only writes. |
| Project assignments | Owner reads; controlled functions change protected state fields. |
| Submissions/links | Owner reads and edits draft data; submitted versions cannot be updated. Reviewer reads through reviewer policy. |
| Reviews | Owner reads reviews for own submissions; reviewer creates only through controlled review function. |
| Waitlist | Anonymous insert with validation and abuse protection; no anonymous select/update/delete. |

Enable RLS explicitly on every table in the exposed `public` schema. Add indexes on ownership, status, ordering, foreign keys, and columns used in policies. Test both allowed and denied access with learner A, learner B, reviewer, authenticated outsider, and anonymous roles.

## Supabase Client Pattern

- `client.ts`: `createBrowserClient` for the small number of browser-only needs.
- `server.ts`: request-scoped `createServerClient` using Next.js cookies.
- `proxy.ts`: refresh auth tokens and pass updated cookies to server and browser.
- Protect server pages and data with verified claims; never trust the user object from `getSession()` as authorization evidence.
- Use the publishable key in browser/server clients. Never place a secret/service-role key in `NEXT_PUBLIC_*` or normal deployed request code.

## Data-Access Rules

- Server Components read directly through feature-owned query functions.
- Server Actions are thin trust boundaries; domain invariants live in the database or domain functions.
- Select explicit columns; avoid `select('*')` in stable application queries.
- Treat `PGRST116`/no-row outcomes separately from infrastructure failures.
- Generate and commit TypeScript database types after migrations.
- Do not cache authenticated responses across users.
- Revalidate only the routes affected by a successful mutation.

## Evidence and Privacy

- v0.1 accepts text and URLs only.
- Warn users not to submit secrets, API keys, private repo tokens, or identifying interview-participant data.
- Explain who reviews evidence, why it is stored, retention, and deletion requests.
- Use minimal analytics through first-party `activity_events`; no third-party analytics platform in v0.1.
- If uploads are approved later, use a private bucket with ownership RLS and signed access. Never default evidence to public storage.

## Architecture Invariants

- One deployable application and one database for v0.1.
- No client-controlled progress, approval, unlock, membership, or reviewer role.
- No normal runtime use of the service-role key.
- Submitted evidence is immutable; revisions create new versions.
- Reviews target immutable submissions, not mutable assignments.
- Approval and next-step unlock are one transaction.
- Progress is derived from `project_assignments`, not duplicated in a mutable percentage table.
- Curriculum content is versioned and seeded, not scattered through React files.
- Every protected table has RLS plus denial tests.
- Preview environments do not write to production unintentionally.


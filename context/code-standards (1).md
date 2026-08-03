# Code Standards

These standards apply to the Lansiraj application. Follow the repository's installed toolchain and configuration; do not silently replace it with tutorial defaults.

## Engineering Mindset

- Build the smallest vertical slice that proves a real user scenario.
- Prefer explicit domain code over generic abstractions created before a second use case exists.
- Treat the database as an authorization and state-integrity boundary, not passive storage.
- Make impossible state hard to represent in TypeScript and impossible to persist in Postgres.
- Keep user-facing failure recoverable, specific, and free of sensitive implementation detail.
- Do not add deferred capabilities because a library makes them easy.

## TypeScript

- Use strict mode. Do not add `any`; use `unknown` and narrow it.
- Prefer domain unions and discriminated unions for action results and states.
- Derive types from Zod schemas where input and runtime validation must agree.
- Use generated Supabase `Database` types for table/query results.
- Never use non-null assertions to hide missing environment or database data without an invariant check.
- Keep dates as ISO strings across server/client boundaries; format them at the display edge.
- Use `satisfies` for configuration objects when it preserves literal types.

```ts
type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; fieldErrors?: Record<string, string[]> };
```

## Next.js App Router

- Pages and layouts are Server Components unless browser state, effects, or event handlers require a Client Component.
- Add `"use client"` at the smallest interactive boundary, never at a route layout by convenience.
- Load protected data in Server Components through feature-owned query functions.
- Use Server Actions for application form mutations.
- Use Route Handlers for auth callbacks and real HTTP integrations only.
- Use `redirect`, `notFound`, and error boundaries deliberately; do not swallow navigation exceptions.
- Revalidate the narrowest affected path or tag after successful mutation.
- Never cache authenticated responses in a way that can cross users.

## File and Folder Naming

- Routes follow Next.js names: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`.
- Components: PascalCase exports in kebab-case files, e.g. `AssignmentStatus` in `assignment-status.tsx`.
- Hooks: `use-*.ts`; Server Actions: `*.actions.ts`; queries: `*.queries.ts`; schemas: `*.schema.ts`; domain types: `*.types.ts`.
- Database migrations use Supabase timestamps and descriptive snake_case names.
- Database identifiers are snake_case; TypeScript identifiers are camelCase/PascalCase.
- Assignment/stage route slugs are stable lowercase ASCII; Macedonian labels live in content fields.

## Feature Module Structure

```text
features/submissions/
  submissions.actions.ts
  submissions.queries.ts
  submissions.schema.ts
  submissions.types.ts
  components/
  index.ts
```

- A feature owns domain-specific queries, mutations, validation, types, and composed UI.
- Shared UI primitives contain no curriculum, project, submission, or review rules.
- Avoid deep barrel chains and hidden circular dependencies.
- Server-only modules must not be imported by Client Components.

## Server Actions

Every action follows this order:

1. Parse `FormData`/input into a plain object.
2. Validate with the feature's Zod schema.
3. Create the request-scoped server Supabase client.
4. Verify identity using validated claims/current user as required.
5. Perform an RLS-scoped query or narrowly defined RPC.
6. Map expected database/domain errors to a typed result.
7. Revalidate/redirect only after success.

```ts
"use server";

export async function saveDraft(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("save_assignment_draft", parsed.data);
  if (error) return mapDatabaseError(error);

  revalidatePath(`/app/assignments/${parsed.data.assignmentSlug}`);
  return { ok: true, data: { id: data } };
}
```

Do not accept owner IDs, reviewer IDs, status, version, approval, or unlock fields from the client when the server/database can derive them.

## Supabase Queries

- Use separate browser and server client factories from `lib/supabase`.
- Select explicit columns and relationships.
- Check and handle every `{ data, error }` result.
- Treat `null`/not-found separately from infrastructure and permission errors.
- RLS is mandatory on every exposed public table.
- Use `(select auth.uid())` in policies where appropriate and index policy columns.
- Never use a service-role client in normal application request paths.
- Never let user-editable metadata determine reviewer authorization.
- Regenerate database types after migrations.

## Database Migrations

- All schema, enum/check, function, trigger, RLS, grant, index, and curriculum changes are migrations.
- Migrations must apply from a clean local reset and move forward; do not edit production manually and forget source control.
- Use deliberate foreign-key delete behaviour.
- Set `search_path` explicitly in security-definer functions and expose only required operations.
- Put multi-row state transitions in one transaction/function.
- Add database tests with every RLS or protected-state change.
- Seed only fake local users/projects. Never commit real participant evidence or production credentials.

## Validation

- Validate at every trust boundary: URL params, form input, environment variables, RPC arguments, and external responses.
- Client validation improves UX but never replaces server validation.
- Database checks, uniqueness, foreign keys, RLS, and transaction logic remain the final authority.
- Normalize emails to lowercase and trim user input where meaning is unchanged.
- Reject unsupported URL schemes; evidence links must be `https` except documented local-development cases.
- Keep Macedonian error messages near fields and include a form-level summary when helpful.

## Assignment-State Rules

- Use only: `locked`, `available`, `submitted`, `revision_required`, `approved`.
- The client cannot write state directly.
- `submitted` evidence is immutable.
- Revision creates the next submission version and references the prior version.
- A review targets one immutable submission.
- Approval and unlock are atomic.
- Terminal approval must not create a nonexistent next assignment.

## React Components

- One component should have one clear semantic responsibility.
- Prefer composition over many boolean props.
- Use native semantic elements before adding ARIA.
- Preserve server rendering; do not mirror server data into client state without a real interaction need.
- Render status as text plus visual treatment; never colour alone.
- Forms must have labels, descriptions where necessary, persistent errors, and focus management after failure.
- Use `aria-live="polite"` for async save/submit feedback and `aria-current="step"` for the active journey position.

## Styling

- Use tokens from `ui-tokens.md`; do not hardcode new hex, shadow, radius, or arbitrary z-index values in components.
- Follow `ui-rules.md`; marketing and product surfaces have different permitted expression.
- Use Ink-on-Yellow/Canvas/Acid and White-on-Ink/Cobalt. Do not use Yellow, Coral, or Acid for body text.
- Support `prefers-reduced-motion` and avoid animation that blocks navigation or communicates exclusive meaning.
- Verify 360 px mobile and long Macedonian strings before marking UI done.

## Error Handling and Logging

- Expected user errors return typed action results; unexpected failures reach the nearest error boundary.
- User messages explain the next action without exposing SQL, tokens, emails, IDs, stack traces, or policy details.
- Server logs contain a stable error code and safe context, not raw evidence text or secrets.
- Preserve original causes when wrapping server errors.
- Do not convert authorization failures into false not-found/success responses unless the threat model requires it and the behaviour is documented.

## Activity Events

Track only beta-critical events in `activity_events`:

- `onboarding_completed`
- `project_started`
- `assignment_submitted`
- `revision_requested`
- `assignment_approved`
- `assignment_unlocked`
- `project_launched`

Event metadata is minimal and non-sensitive. Do not copy evidence text, feedback bodies, email addresses, or URLs into analytics metadata.

## Testing

- Vitest: schemas, state helpers, ordering, progress derivation, and error mapping.
- Database/pgTAP: RLS ownership, reviewer boundaries, immutable submission, and transactional unlock.
- Integration: Server Actions against local Supabase for submit/review flows.
- Playwright: invite/sign-in, onboarding, submit, revision, resubmit, approval, unlock, and unauthorized access.
- Test behaviour and invariants, not Tailwind class strings or implementation trivia.
- A migration is incomplete without a clean reset and database test run.

## Environment Variables

Validate environment values in one server-safe module. Browser-safe values may be exposed only when intentionally public.

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

If the existing landing page still uses the legacy anon-key name, migrate deliberately and document compatibility. Never expose service-role or other secret keys through `NEXT_PUBLIC_*`.

## Imports and Dependencies

- Use the configured `@/` alias for `src/`.
- Import from a feature's public module or direct stable file; avoid fragile multi-level relative paths.
- Before adding a package, read `library-docs.md`, inspect installed versions, and verify the current official API.
- Prefer platform/framework primitives. A dependency must reduce meaningful complexity and earn its maintenance/security cost.
- Do not add AI, analytics, CMS, upload, or email packages while those capabilities are deferred.

## Comments and Documentation

- Comments explain why a non-obvious constraint exists, especially authorization or concurrency behaviour.
- Do not narrate obvious code.
- Public utilities and database functions need concise contracts for inputs, outputs, and invariants.
- Durable architecture changes go in `docs/adr`; build status goes in `progress-tracker.md`.


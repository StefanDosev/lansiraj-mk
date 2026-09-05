# Deployment Runbook

Use this runbook for Preview first and Production only after every Preview gate passes. Preview and Production are separate Vercel environments and separate Supabase projects. Never reuse a Turnstile widget, Supabase URL/key, database connection string, or participant fixture between them.

## Fixed targets

| Environment | Vercel target | Supabase project | Data rule |
| --- | --- | --- | --- |
| Preview | `stefandosevs-projects/lansiraj`, Preview branch deployment | `tutadgptycduscmezbeg` (`lansiraj.mk APP`) | Synthetic release fixtures only |
| Production | `stefandosevs-projects/lansiraj`, Production deployment | `tsbrhpyhseqhsdroszqu` (`lansiraj.mk`) | Real beta data; no seed or browser-test fixtures |

The Vercel Preview access screen is expected. It protects the deployment but does not replace application authentication or Supabase Auth controls.

## 1. Release preflight

1. Start from a clean product worktree and identify the exact commit being released.
2. Confirm the dependent GitHub `verify` and `release` jobs are green for that commit.
3. Run `npm ci` and `npm run test:release` from a clean local Supabase start when independently reproducing the gate.
4. Inspect the linked Vercel project and environment variables. The target environment must contain `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. Preview variables must reference only the Preview Supabase project; Production variables must reference only Production.
5. Confirm the Supabase project ref aloud/in the release record before any remote command. Stop if it differs from the fixed-target table.

Do not print environment values, access tokens, database passwords, publishable keys, CAPTCHA secrets, participant email addresses, or magic links into terminal logs or the release record.

## 2. Export before migration

Create the export outside the repository in a restricted directory. Prefer the target database's percent-encoded direct connection URL. Supabase direct endpoints use IPv6 unless the project has the IPv4 add-on; when the release host or Docker cannot use that endpoint, use the project's Session pooler URI from the Supabase Connect panel on port `5432`. Do not use transaction mode on port `6543` for backup or migration commands. Set the selected target URL as a temporary PowerShell environment variable, then substitute an absolute restricted backup directory in the commands below.

```powershell
$env:SUPABASE_DB_URL = "<paste percent-encoded target connection URL securely>"
npx supabase db dump --db-url "$env:SUPABASE_DB_URL" --role-only --file "<backup-dir>\roles.sql"
npx supabase db dump --db-url "$env:SUPABASE_DB_URL" --file "<backup-dir>\schema.sql"
npx supabase db dump --db-url "$env:SUPABASE_DB_URL" --data-only --use-copy --exclude storage.buckets_vectors --exclude storage.vector_indexes --file "<backup-dir>\data.sql"
```

Verify that all three files exist and are non-empty, restrict access to the backup directory, and record only its protected location plus timestamp. Never commit or upload these files to Vercel, GitHub, or application storage.

The CLI logical dump excludes Supabase-managed schemas such as `auth` and `storage`; it protects the application schemas and rows, not a complete hosted-project image. Free projects do not have downloadable automatic backups. Before admitting real learners, explicitly accept this recovery point or upgrade the Production project to a plan with managed daily backups/PITR. Storage objects are out of scope for v0.1.

## 3. Apply migrations

Use the same fixed-target direct or Session pooler URL that passed the export checkpoint so the repository never has to relink from Preview to Production.

```powershell
npx supabase migration list --db-url "$env:SUPABASE_DB_URL"
npx supabase db push --db-url "$env:SUPABASE_DB_URL" --dry-run
npx supabase db push --db-url "$env:SUPABASE_DB_URL"
npx supabase migration list --db-url "$env:SUPABASE_DB_URL"
Remove-Item Env:SUPABASE_DB_URL
```

The first list must show a comprehensible local/remote delta, the dry run must contain only reviewed migrations, and the final list must match through the release migration. Never use `db reset`, `--include-seed`, or `--include-all` against Preview or Production. `supabase/seed.sql`, pgTAP tests, integration fixtures, and Playwright fixtures are local-only.

## 4. Apply and verify hosted Auth

Create a distinct real Cloudflare Turnstile widget for the target application origin. Set its site key in the matching Vercel environment as `NEXT_PUBLIC_TURNSTILE_SITE_KEY`; keep its secret only in Supabase Auth. Local public test keys are forbidden in hosted environments.

The repository helper uses Supabase's Management API and patches only public signup, the Before User Created hook, and CAPTCHA. It intentionally does not push `supabase/config.toml`, because local site URLs, test CAPTCHA credentials, templates, MFA choices, and local email timings are not authoritative for hosted projects.

Set `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_CONFIG_CONFIRM_REF`, and `SUPABASE_TURNSTILE_SECRET` in the current PowerShell terminal without writing them to a file. The two project-ref variables must be identical, and the helper accepts only the fixed Preview and Production refs listed above.

```powershell
$env:SUPABASE_ACCESS_TOKEN = "<paste personal access token securely>"
$env:SUPABASE_PROJECT_REF = "<fixed target project ref>"
$env:SUPABASE_CONFIG_CONFIRM_REF = "<repeat the same fixed target project ref>"
$env:SUPABASE_TURNSTILE_SECRET = "<paste target Turnstile secret securely>"
npm run hosted-auth -- apply
npm run hosted-auth -- verify
Remove-Item Env:SUPABASE_ACCESS_TOKEN
Remove-Item Env:SUPABASE_PROJECT_REF
Remove-Item Env:SUPABASE_CONFIG_CONFIRM_REF
Remove-Item Env:SUPABASE_TURNSTILE_SECRET
```

The verifier must report PASS for disabled public signup, enabled existing-user email login, disabled anonymous users, the migrated `private.before_user_created` hook, Turnstile, and the documented hosted rate budgets. It never reads or prints the stored CAPTCHA secret. Management API requests fail after 15 seconds instead of hanging indefinitely.

In Vercel, redeploy the exact green commit after changing the site key. Confirm the deployment is Ready and inspect build/runtime logs for errors without logging request tokens or email addresses.

## 5. Preview smoke test

Use a dedicated synthetic cohort, invited learner, reviewer, and project. Record pass/fail and timestamps, not email addresses, URLs containing tokens, or evidence content.

1. Public landing and privacy pages render; the sign-in page shows a working Turnstile challenge and enables submit only after a token.
2. An existing reviewer signs in, opens the oldest pending submission, uses `Отвори доказ`, and can read the immutable version and all criteria.
3. A trusted admin creates the normalized pending invite and pre-provisions the same address as a passwordless Auth user. That learner receives one magic link and reaches the correct learner route.
4. An uninvited new address receives the same neutral UI response but no email and no Auth user.
5. Management verification still reports disabled signup; a direct password-signup attempt cannot create a user, including for a known pending invite.
6. The learner submits a synthetic assignment. The reviewer requests revision, the learner resubmits, and approval unlocks exactly the next assignment. No duplicate review, event, or unlock is created.
7. Repeat the essential sign-in and learner/reviewer route checks at 360 px and desktop. Confirm no browser errors and no unexpected deployment errors.
8. Remove the synthetic Auth users, cohort, invite, memberships, project records, and evidence. Verify no fixture rows remain.

Do not proceed to Production if any gate fails or if rate-limit testing would consume the remaining email budget needed by real learners.

## 6. Production deploy and smoke test

Repeat sections 1–4 with the Production targets and a separate Production Turnstile widget. Then create a Vercel Production deployment from the exact green commit without immediately changing the public alias:

```text
vercel deploy --prod --skip-domain
```

Inspect the deployment, run the non-destructive public, Turnstile, existing-reviewer, authorization-denial, and management-config checks against its generated URL, then promote that exact deployment through Vercel:

```text
vercel promote <deployment-id-or-url>
```

After promotion, repeat those checks on the canonical Production URL. Use founder-owned release accounts; do not create disposable learner project data in Production. The full learner/reviewer journey is Phase 26 founder dogfood.

Monitor Vercel function/runtime logs and Supabase Auth logs during the release window. Verify HTTP 429 responses remain neutral and identify whether they came from the tenant email budget, per-recipient interval, OTP/IP budget, or CAPTCHA failure before retrying.

## 7. Rollback and repair

- If the Vercel smoke test fails and the migrated database remains backward compatible, run `vercel rollback <last-known-good-deployment-id-or-url>` to roll the public alias back. Keep the failed deployment URL and commit in the incident record.
- Database migrations are forward-only. Do not run an ad hoc down migration or restore over a live database automatically. Stop writes, assess affected rows, and prepare a reviewed compensating migration.
- Restore the pre-release export only for confirmed data loss/corruption and only through an explicit incident plan that names the target, recovery point, owner, and verification queries. A restore is destructive and requires separate approval.
- `supabase migration repair` changes migration-history records only; it does not repair schema or data. Use it solely when the schema is known correct and migration history is demonstrably wrong.
- If hosted Auth causes the failure, patch only the faulty Auth fields through the Management API, re-run `npm run hosted-auth -- verify`, and repeat sign-in denial/success checks. Never use a full `supabase config push` as rollback.

## Release record

Record the environment, Git commit, GitHub run, Vercel deployment ID/URL, Supabase project ref, pre-migration export timestamp/location, migration range, hosted Auth verification result, smoke-test result, operator, and rollback target. Record no credentials, participant data, magic links, or evidence.

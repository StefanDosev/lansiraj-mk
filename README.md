# Лансирај

Лансирај is a Macedonian proof-based project-launch system. The v0.1 beta guides a learner through assignments, submitted evidence, human review, revision or approval, and a small public launch.

## Requirements

- Node.js 22
- npm 10.9.2 (pinned in `package.json` because npm 11 currently rejects an optional Tailwind WASM peer-dependency path)

## Local setup

```bash
npm ci
copy .env.example .env.local
npm run dev
```

Open <http://localhost:3000>. Populate `.env.local` only with values for a non-production Supabase project. Never commit credentials or participant data.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

Run the complete non-secret baseline gate with `npm run check`.

The following scripts reserve stable command names for later build phases. They become release gates when their corresponding dependencies, fixtures, and infrastructure are introduced:

- `npm run test:unit` — Vitest domain tests
- `npm run test:database` — local Supabase database and RLS tests
- `npm run test:e2e` — Playwright critical workflow tests

## Environment matrix

| Environment | Supabase target | Configuration source | Data rule |
| --- | --- | --- | --- |
| Local | Local Supabase project | `.env.local`, copied from `.env.example` | Fake seed and test data only |
| Preview | Dedicated non-production Supabase project | Vercel Preview environment variables | Never point previews at production |
| Production | Production Supabase project | Vercel Production environment variables | Real beta data; no development seed |

Required browser-safe variables:

```text
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

`NEXT_PUBLIC_SITE_URL` is the canonical local or production application origin. Vercel preview deployments use the platform-provided preview origin and must also be included in Supabase Auth's redirect allowlist.

Secret or service-role keys must never use a `NEXT_PUBLIC_` prefix and must not be used in normal application request paths.

## Continuous integration

GitHub Actions runs a lockfile-based install, lint, typecheck, and production build for pushes and pull requests targeting `main`. Database and browser tests will join CI in the phases that introduce their infrastructure.

## Project documentation

- Product and engineering context lives in `context/`.
- Durable architecture decisions live in `docs/adr/`.
- Feature status lives in `context/progress-tracker.md`.

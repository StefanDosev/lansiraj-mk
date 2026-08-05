# ADR 0001: Use a modular monolith

- Status: Accepted
- Date: 2026-08-05

## Context

The first beta serves one reviewer and a cohort of at most four learners. Its core risk is whether proof, review, revision, and unlocking help learners publish—not whether the system can scale across independent services.

## Decision

Build one Next.js App Router application backed by one Supabase project and deployed through one Vercel pipeline. Organize domain logic by feature while keeping a single deployable runtime.

## Consequences

- Product slices can be built and tested end to end without distributed-system overhead.
- Domain modules must retain clear ownership even though they share a deployment.
- A separate API, queue, CMS, or service is deferred until demonstrated constraints justify it.

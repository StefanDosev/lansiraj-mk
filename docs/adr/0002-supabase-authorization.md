# ADR 0002: Enforce authorization in Supabase

- Status: Accepted
- Date: 2026-08-05

## Context

Learner evidence, reviewer decisions, and assignment unlocks cross trust boundaries. Route guards alone cannot protect direct database access or prevent invalid state transitions.

## Decision

Use Postgres Row Level Security for ownership and role boundaries. Use narrowly scoped database functions for protected multi-row transitions such as starting a project, submitting evidence, reviewing a submission, and unlocking the next assignment. Server checks improve routing and error handling but do not replace database enforcement.

## Consequences

- Every exposed table requires RLS and allowed/denied database tests.
- Reviewer authority comes from private database-owned role data, never user-editable metadata.
- Normal request code uses publishable credentials and must not use a service-role client.

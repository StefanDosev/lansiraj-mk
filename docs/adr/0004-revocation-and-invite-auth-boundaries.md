# ADR 0004: Enforce revocation and invite admission at provider boundaries

- Status: Accepted
- Date: 2026-08-25

## Context

A learner's JWT can remain valid after cohort membership is removed, so route checks alone cannot revoke access to an existing project or prevent direct RPC mutations. Public magic-link requests can also create arbitrary Auth users and consume shared email capacity before application code can reject them.

## Decision

Treat active cohort membership as part of project ownership in Postgres. Learner-facing row policies and mutation triggers must require both project ownership and active membership, while reviewer access to historical evidence remains available. A removed learner's pending submission is not reviewable and must not unlock curriculum progress.

Disable public Auth signup and require every invited address to be pre-provisioned as a passwordless user through a trusted Supabase admin path. Public magic-link requests never create identities. Retain an unexpired-pending-invite Before User Created hook as defense in depth, require provider-level Turnstile verification, keep application responses neutral, and continue to allow existing identities to sign in.

## Consequences

- Membership removal takes effect on the next database statement even when the learner still holds a valid JWT.
- Protected RPCs cannot bypass revocation through their security-definer execution context.
- Reviewer history is retained, but removed learners disappear from the actionable review queue.
- Hosted environments must apply the migrations, disable general public signup while retaining existing-user email login, enable the database Auth hook, and configure real Turnstile site and secret keys before release.
- Issuing an invite requires trusted Auth pre-provisioning plus the matching normalized cohort-invite row; normal application code still cannot use a service-role credential.
- Local Auth configuration changes require the Supabase containers to be recreated, not only the database to be reset.

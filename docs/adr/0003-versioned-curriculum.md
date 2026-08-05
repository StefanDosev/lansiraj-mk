# ADR 0003: Version curriculum data

- Status: Accepted
- Date: 2026-08-05

## Context

Assignments and acceptance criteria will evolve after pilot feedback. Existing learner projects must keep the curriculum and review standard under which they began.

## Decision

Store stages, assignments, proof prompts, and acceptance criteria as ordered, versioned database seed data. A project binds to a curriculum version when it starts. Curriculum writes are migration-managed rather than scattered through React components or edited by an application CMS.

## Consequences

- Seed data must be deterministic and preserve stable ordering and slugs.
- Curriculum changes create a new explicit version instead of silently mutating active projects.
- A curriculum editor remains outside v0.1 scope.

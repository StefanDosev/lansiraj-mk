# Project Overview

## About the Project

**Лансирај** (`lansiraj.mk`) is a Macedonian proof-based project-launch system for beginners who know the basics but have not independently finished and published a web application.

The product guides one learner through one constrained loop:

> assignment → evidence → human review → revision or approval → next step unlocked → public launch

The beta is invitation-only, free, and manually reviewed by Stefan Dosev. The first cohort is Stefan plus 2–3 Macedonian-speaking learners. The working time expectation is approximately four weeks at 5–10 focused hours per week; this is a target, not a guarantee.

## Product Hypothesis

Tutorial-stuck beginners are blocked less by missing information than by oversized scope, unclear finish lines, weak accountability, and the absence of credible feedback. If accepted evidence—not watched content—is the unit of progress, more learners should reach a real public release.

## Primary User

- Speaks Macedonian and has completed at least one beginner tutorial or course.
- Understands basic programming concepts and can modify code with AI assistance.
- Has started projects before but expanded, restarted, or abandoned them.
- Can commit 5–10 focused hours per week for approximately four weeks.
- Is willing to reduce scope, show unfinished work, accept revision, and test publicly.

Not the first target: absolute beginners, advanced developers, teams, people seeking certificates or a large course catalogue, and founders expecting guaranteed revenue, employment, or market validation.

## Product Promise

Лансирај provides a clear route, visible acceptance standards, and specific human feedback toward one small public test. The terminal outcome is:

- a working public URL;
- recorded feedback from real target users;
- a short final reflection and case-study draft;
- earned confidence grounded in work the learner can explain.

The product never promises a profitable startup, a job, a certificate, or completion in exactly 30 days.

## Six Stages and Ten Assignments

| Stage | Assignments | Approval standard |
| --- | --- | --- |
| **01 Истражи** | 01 Define one target user and one painful problem. 02 Capture three interviews or documented observations. | Specific user, evidence-based problem, contradictions noted. |
| **02 Намали** | 03 Write the one-page MVP brief, one core action, done criteria, and non-feature list. | One user, one core action, feasible in four weeks. |
| **03 Дизајнирај** | 04 Map the main user flow and create a low-fidelity wireframe. | Main journey is understandable without explanation. |
| **04 Изгради** | 05 Create repository, architecture note, and working preview. 06 Implement the core feature end-to-end. | Project runs, core action works, learner can explain the structure. |
| **05 Тестирај** | 07 Complete mobile and critical-flow QA. 08 Test with real users and capture feedback. | Critical flow works and genuine observations are recorded. |
| **06 Лансирај** | 09 Deploy a public URL and contact at least three relevant people. 10 Submit the final reflection and case-study draft. | URL is accessible, real reactions exist, lessons are explicit. |

Every assignment requires human review in the first beta. A per-assignment `requires_review` flag keeps later automation possible without changing the domain model.

## Roles

### Learner

- Accept an invite and authenticate by magic link.
- Complete onboarding and create one project.
- See the current assignment, proof requirements, acceptance criteria, history, and exact unlock condition.
- Save draft text and links, then submit an immutable version.
- Read feedback, revise, resubmit, and continue after approval.
- Finish with a live URL, outreach evidence, feedback, and reflection.

### Reviewer

- Create and manage cohort invitations.
- View learner and cohort progress.
- Review a specific immutable submission against visible criteria.
- Approve or request revision with criterion-level notes.
- Name what passed or identify one priority correction and why it matters.

## Pages and Routes

| Route | Purpose |
| --- | --- |
| `/` | Existing public landing page and waitlist. |
| `/privacy` | Privacy notice for waitlist and beta evidence. |
| `/auth/sign-in` | Magic-link request. |
| `/auth/callback` | Auth code exchange. |
| `/access-pending` | Signed in but not enrolled. |
| `/app/onboarding` | Profile, idea, available time, and target date. |
| `/app` | Current-project dashboard. |
| `/app/project` | Project scope and full journey. |
| `/app/assignments/[slug]` | Assignment, criteria, evidence, history, and feedback. |
| `/admin` | Review queue and cohort snapshot. |
| `/admin/reviews/[submissionId]` | Evidence and review decision. |

## Learner Flow

1. Stefan creates a cohort invite for a selected email.
2. Learner requests or opens a magic link and accepts the invite.
3. Learner completes onboarding and starts one scoped project.
4. The system instantiates ten `project_assignments` and unlocks Assignment 01.
5. Learner reads the task and criteria, saves a draft, attaches typed URLs, and submits.
6. The submitted version becomes immutable and enters the reviewer queue.
7. Revision returns the assignment with one priority correction; the learner creates a new version.
8. Approval records the review and unlocks the next assignment atomically.
9. The final assignment ends with a verified live URL, outreach, feedback, and reflection.

## Reviewer Flow

1. Open the queue ordered by oldest submitted evidence.
2. Open one submission and inspect its project context, evidence, version history, and criteria.
3. Mark each criterion `pass` or `revise` and write concise notes.
4. Choose `approved` or `revision_required`.
5. On approval, record the decision and unlock the next assignment in one database transaction.
6. On revision, keep future work locked and show one clear next correction to the learner.

## Version 0.1 Scope

### In Scope

- Invitation-only magic-link authentication.
- One profile, one cohort membership, and one active project per learner.
- Six fixed stages and ten seeded assignments.
- Learner dashboard, assignment view, draft, text/link proof, and submission history.
- Manual reviewer queue, criterion-level review, revision, approval, and unlock logic.
- Database-enforced state transitions, RLS, and minimal activity events.
- Macedonian Cyrillic UI, mobile responsiveness, accessible states, and reduced motion.
- Existing waitlist intake, privacy page, migrations, seed data, tests, and Vercel deployment.

### Out of Scope

- Learner-facing AI, AI-only approval, or AI-generated courses.
- File/image uploads, public case-study pages, email reminders, payments, or a CMS.
- Community, chat, peer reviews, leaderboards, certificates, or mentor marketplace.
- Multiple paths, multiple active projects, native mobile apps, or a separate backend service.

## Success Criteria for the First Beta

- Participant completes onboarding and submits Assignment 01 within 48 hours.
- At least 70% complete the first three assignments.
- At least 60% deploy a working public URL.
- At least 50% collect feedback from real target users.
- Most assignment versions need no more than one revision.
- At least two participants recommend the experience or ask to continue.

## Product and Brand Invariants

- Progress comes from accepted proof, never from a client-controlled completion checkbox.
- One learner has one active project in v0.1.
- Submitted evidence is immutable; a revision is a new version.
- A review always targets a specific submission version.
- A locked step names the exact condition that unlocks it.
- Approval names what passed; revision identifies one priority correction and why.
- Launch means a small public test, not automatic business success.
- UI copy is Macedonian Cyrillic; standard technical terms may remain in English when clearer.
- Marketing can be expressive; the authenticated workspace stays calm, legible, and trustworthy.

## Canonical Brand Language

- Name: **Лансирај**
- Digital signature: **lansiraj.mk**
- Tagline: **Од идеја до проект во живо.**
- Primary message: **Престани да собираш туторијали. Лансирај го твојот прв веб-проект.**
- Product action: **Испрати доказ**
- Founder endorsement: **Создадено и рачно прегледувано од Стефан Досев.**


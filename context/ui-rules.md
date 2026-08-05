# UI Rules

The Lansiraj visual system has two modes:

- **Marketing:** editorial, oversized, tactile, and kinetic; demonstrates the mechanism with real artifacts.
- **Product:** calm, precise, accessible, and trustworthy; expression comes through state and hierarchy.

Do not bring landing-page noise into assignments, evidence forms, feedback, or reviewer decisions.

## Font

- Display: **Unbounded**, 500–700, for short headlines, stage numbers, campaign statements, and selected page titles.
- Body/UI: **Onest**, 400–600, for all interface text, forms, evidence, criteria, and feedback.
- Fallback: Arial or system sans-serif when preferred fonts fail.
- Never set long paragraphs, form labels, or dense admin content in Unbounded.
- Verify Macedonian forms: Ѓ ѓ, Ќ ќ, Ѕ ѕ, Љ љ, Њ њ, Џ џ, uppercase, italic, punctuation, and numerals.

## Colour Discipline

- Base product surfaces: white/warm canvas, Ink text/borders, restrained stone neutrals.
- Launch Yellow: masterbrand and primary action emphasis, not a general warning colour.
- Cobalt: active stage, focus, links, and submitted/on-review state.
- Revision Coral: revision-required intervention only; never normal decoration inside the app.
- Proof Acid: small approved marks and checkpoint fills only; never a full-page personality colour.
- Use one loud accent per product scene.
- Never use Yellow, Coral, or Acid for body text.

## Layout

- Mobile first; primary QA width is 360 px.
- Public max width: `80rem`; product max width: `72rem`; reading/evidence column: `46rem`.
- Product pages use a stable app shell and one dominant task per screen.
- Desktop assignment layout may use main content plus a narrow context rail. Collapse to one logical column on mobile.
- Keep criteria visible before submission and feedback close to the evidence version it reviews.
- Do not center long product copy or forms.
- Respect safe-area insets where relevant and avoid horizontal scrolling.

## Navigation

### Public Navigation

- Digital signature `lansiraj.mk` on the left.
- Links: `Како работи`, `За кого е`, `FAQ`.
- Primary CTA: `Пријави се за beta` while access remains limited.
- On mobile, menu controls have a minimum 44×44 px target and proper expanded state.

### Product Navigation

- Keep learner navigation intentionally small: `Тековна задача`, `Проект`, account/sign out.
- Reviewer area is visually and route-level distinct, labelled `Преглед` or `Reviewer` according to final Macedonian copy.
- Do not expose inaccessible steps as clickable dead links.
- Current page uses both visual treatment and `aria-current`.

## Page Hierarchy

Every learner assignment page presents this order:

1. stage and assignment number;
2. short task title and exact output;
3. state and timestamp;
4. assignment guidance;
5. acceptance criteria;
6. latest review feedback when present;
7. evidence draft/submission form;
8. version history and next unlock condition.

Do not bury the primary action under generic dashboard widgets.

## Cards and Panels

- Product cards use 1 px Ink/neutral borders, medium radius, and no decorative blur.
- Default cards have no shadow; elevated overlays use the single defined shadow token.
- Marketing artifacts may use 2 px Ink outlines and an offset proof layer.
- Use spacing and headings before adding boxes around every paragraph.
- A card must represent a real unit: assignment, criterion group, submission version, review, or project scope.

## Typography Hierarchy

- Hero marketing type may use the largest display tokens and tight leading.
- Product page title uses display type sparingly and wraps cleanly in Macedonian.
- Assignment/task title is dominant; metadata and labels are compact but readable.
- Body default is 16–18 px with 1.55–1.65 line height.
- Labels use sentence case by default. Uppercase is reserved for short stage/status metadata.
- Technical URLs, timestamps, and version numbers use tabular numerals; wrap long URLs safely.

## Buttons

### Primary

- Ink text on Launch Yellow, Ink border, strong but not pill-shaped.
- Used once per main view for the next meaningful action.
- Learner assignment action: `Испрати доказ`.

### Secondary

- Ink text on transparent/canvas with Ink border.
- Use for save draft, back, or non-destructive alternative.

### Cobalt

- White text on Cobalt for active digital actions only when Yellow would conflict with state semantics.

### Destructive

- Destructive account/data actions are not represented by Revision Coral alone; require explicit text and confirmation.

All buttons:

- minimum 44 px target height;
- visible `:focus-visible` treatment;
- distinct disabled, pending, and success behaviour;
- do not change labels in a way that shifts layout unpredictably;
- never show approval-style celebration while a submission is merely pending review.

## Form Inputs

- Always pair with a visible `<label>`.
- Optional help text explains format or privacy, not generic motivation.
- Inputs use Canvas/white surface, Ink text, neutral border, and Cobalt focus ring.
- Errors use text plus icon/structure; Coral alone is insufficient.
- Preserve entered values after server validation failure.
- Textareas resize vertically and provide enough room for evidence.
- Evidence URLs use repeatable rows with type, label, URL, and an accessible remove action.
- Consent/evidence warnings are explicit and never pre-checked.

## Status Language

Use only these learner-facing state concepts:

| Internal state | Macedonian UI | Visual behaviour |
| --- | --- | --- |
| `locked` | `Прво заврши го чекорот …` | Stone/neutral, closed checkpoint, exact unlock condition. |
| `available` | `Подготвено за работа` or task-specific action | Canvas/Ink, open frame. |
| `submitted` | `На проверка` | Cobalt, pause marker, submitted timestamp. |
| `revision_required` | `Потребна е 1 корекција` | Coral, return line, priority correction. |
| `approved` | `Одобрено — доказот е доволен` | Acid checkpoint with Ink text. |

Do not introduce `completed`, `done`, `passed`, and `approved` as interchangeable product states.

## Journey Rail

- Six numbered stages are the branded public structure; ten assignments are the actionable detail.
- Desktop may use a precise rail/line. Mobile uses a vertical list/stepper.
- Current stage/assignment is named, not inferred by colour.
- Approved checkpoints are filled; submitted pauses; revision returns; locked segments explain the prerequisite.
- The final endpoint resolves into the learner's live URL only after launch evidence is approved.
- Motion is optional enhancement; semantic order and text carry the complete meaning.

## Acceptance Criteria

- Show criteria before the evidence form.
- Use a semantic list, not disabled checkboxes that imply the learner can self-approve.
- Reviewer outcome displays `Поминато`/`Потребна корекција` only after review.
- Criterion notes stay attached to the criterion they describe.

## Review Feedback

### Approval

- Name what passed.
- Use one restrained acid checkpoint and a clear next action.
- Avoid confetti, trophies, points, streaks, or exaggerated praise.

### Revision Required

- Lead with one priority correction and why it matters.
- Show criterion-level context below it.
- Provide a direct `Поправи го доказот` action.
- Never shame the learner or present a wall of judgement.

## Reviewer Queue

- Use a semantic table on wide screens and labelled stacked records on mobile.
- Columns: learner, project, assignment, submitted time, waiting duration, action.
- Default order: oldest submitted first.
- Status and urgency are text, not colour only.
- Empty state: explain that there are no submissions awaiting review; do not fill the space with generic analytics.

## Empty, Loading, Error, and Permission States

- Skeletons must resemble the final content and respect reduced motion.
- Empty states explain why the area is empty and the next available action.
- Validation errors stay near the relevant field and focus the summary/first invalid field.
- Recoverable server errors offer retry without clearing safe user input.
- Permission states reveal no learner/project details.
- Locked states are not generic permission errors; they state the precise prerequisite.

## Motion

- Microinteraction: 160–240 ms.
- Stage/state transition: 400–700 ms where it helps explain change.
- Marketing story moment: up to 1000 ms and scroll controlled.
- Reduced-motion mode removes transforms and long transitions while preserving state.
- Never loop the logo, parallax forms, delay navigation, or celebrate before approval.

## Imagery and Artifacts

- Prefer real research notes, scope reductions, wireframes, repository/preview context, testing notes, review marks, and live URLs.
- Marketing may combine one clean screenshot with one rough human annotation layer.
- Product evidence areas contain no decorative grain or scribbles.
- Do not use unrelated product screenshots or decorative AI renders as Lansiraj references.

## Do Nots

- No rockets, astronauts, planets, countdowns, or launch-pad clichés.
- No generic purple/blue SaaS gradient, floating 3D blobs, glassmorphism, or chat-bubble hero.
- No course-card grid, certificate, trophy, streak, leaderboard, or childish gamification.
- No huge dashboard of vanity charts in the learner area.
- No random rounded pills everywhere.
- No decorative texture inside forms, criteria, evidence, feedback, or admin decisions.
- No exact imitation of Process Academy's page order, characters, compositions, or animations.
- No full palette in one screen; choose one accent with semantic purpose.

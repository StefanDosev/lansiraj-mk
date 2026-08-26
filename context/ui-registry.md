# UI Registry

Living document. Read this before building a component and update it immediately after the component is accepted. The registry records implemented reality; planned components belong in `build-plan.md`, not here.

Last reviewed: 2026-08-26 after the cross-platform timestamp remediation. Submission and review timestamps retain the registered numeric Macedonian contract across ICU implementations while the existing Magic Link Form and removed-learner review states remain unchanged.

## How to Use

Before building:

1. Search this registry and the codebase for an existing pattern.
2. Reuse or extend the existing component when its semantics match.
3. If no component exists, follow `ui-rules.md` and `ui-tokens.md`.
4. Check keyboard, mobile, long Macedonian copy, status text, and reduced motion.

After building, add:

- component name and file path;
- purpose and supported variants;
- token names and important class recipe;
- accessibility behaviour;
- screens that use it;
- link to the feature or PR when available.

## Reference Images

No approved Lansiraj application screenshots are registered yet. Do not use unrelated template screenshots as visual references. New screenshots may be added under `context/designs/` only after they represent accepted Lansiraj UI.

## Editorial proof-system override — established 2026-08-13

This baseline supersedes pre-redesign surface and radius recipes in older entries while preserving their semantic, state, and accessibility rules.

| Property | Correct pattern |
| --- | --- |
| Marketing composition | Asymmetric `container-public`, oversized Unbounded headings, paper grid, tactile proof artifacts |
| Product composition | Left-aligned `container-product`, open sections, grouped records, light reading surfaces |
| Reviewer composition | Ink navigation shell around a light operational workspace |
| Primary structure | `border-y-2 border-ink`, grouped rows, or `border-l-4` annotations before adding a card |
| Standalone artifact | `border-2 border-ink`, square corners, optional `proof-shadow` |
| Form controls | White `rounded-md` inputs with Stone border; `rounded-sm` actions and 44 px minimum targets |
| Status | `StatusMarker` with text plus semantic tone; never colour alone |
| Motion | `pressable`, `Reveal`, and `evidence-row-motion` only; all values come from global motion tokens |

**Pattern notes:** Saturated colours identify brand or state, not generic containers. Decorative imagery stays outside work areas. Earlier entries that call a whole workflow a rounded card should now be read as an open reading surface unless the component is a true standalone checkpoint.

## Components

### Brand Signature

File: `components/brand/brand-signature.tsx`
Last updated: 2026-08-05

| Property | Class |
| --- | --- |
| Background | none |
| Border | none |
| Border radius | none |
| Text — primary | `text-ink` |
| Text — inverse | `text-white` |
| Typography | `font-display text-sm font-semibold tracking-tight` |
| Spacing | inherited from shell |
| Interactive state | global Cobalt focus outline |
| Shadow | none |
| Accent usage | none |

**Pattern notes:** The digital signature is always the compact `lansiraj.mk` wordmark and links to `/`. Use the inverse variant only on an Ink surface. Its accessible name expands the destination beyond the visual wordmark.

### Skip Link

File: `components/ui/skip-link.tsx`
Last updated: 2026-08-05

| Property | Class |
| --- | --- |
| Background | `bg-launch` |
| Border | `border-2 border-ink` |
| Border radius | `rounded-sm` |
| Text — primary | `text-ink font-semibold` |
| Spacing | `px-4 py-3` |
| Interactive state | hidden above viewport until `focus:translate-y-0` |
| Shadow | none |
| Accent usage | Launch Yellow marks the primary keyboard escape hatch |

**Pattern notes:** Every shell places this before its header and targets `#main-content`. Every target main landmark uses `tabIndex={-1}` so activation moves keyboard focus as well as scroll position. The link uses the registered toast z-index and removes transition motion under reduced-motion preferences.

### Application Shells

Files: `app/(marketing)/layout.tsx`, `app/(auth)/layout.tsx`, `app/(learner)/app/layout.tsx`, `app/admin/layout.tsx`
Last updated: 2026-08-25

| Property | Pattern |
| --- | --- |
| Public background | `bg-launch` header with `bg-canvas` content/footer |
| Product background | `bg-canvas` with `bg-white` header |
| Reviewer background | `bg-ink text-white` |
| Border | `border-ink`, `border-stone-300`, or inverse `border-stone-700` according to surface |
| Border radius | none on shell boundaries |
| Text — primary | Ink on light surfaces; White on Ink |
| Spacing | `min-h-16` header; `py-8 md:py-12` product main |
| Interactive state | Cobalt focus outline; navigation and footer links use `min-h-11 min-w-11` with centred inline-flex alignment |
| Shadow | none |
| Accent usage | Cobalt for current product navigation; Acid only as reviewer proof-state metadata |

**Pattern notes:** All shells are Server Components, use semantic labelled navigation, include the shared skip link, and constrain content with `container-public` or `container-product`. Every interactive shell destination must preserve a 44 px target in both axes, including compact text links. Learner and reviewer shells enforce authorization before rendering and expose the compact sign-out action. Reviewer precedence is enforced at the learner-shell boundary. Post-onboarding learner pages additionally require completed onboarding, while `/app/onboarding` redirects completed learners to `/app`. Every primary route owns a distinct Macedonian document title so the Next.js route announcer communicates navigation context. Marketing may be expressive; learner/auth shells stay quiet; reviewer routes are deliberately inverse and distinct.

### Magic Link Form

File: `features/auth/components/magic-link-form.tsx`
Last updated: 2026-08-25

| Property | Class |
| --- | --- |
| Background | input `bg-white`; form inherits its panel surface |
| Border | input `border border-stone-300`; action `border-2 border-ink` |
| Border radius | input `rounded-md`; action `rounded-sm` |
| Text — primary | `text-ink`; supporting/status copy `text-stone-700` |
| Typography | label/action `font-semibold`; supporting copy `text-sm leading-relaxed` |
| Spacing | form `mt-6 space-y-4`; input `px-3.5 py-3`; action `px-5 py-2.5` |
| Interactive state | Cobalt focus border/ring; Coral invalid border/ring; restrained lift on hover |
| Shadow | none |
| Accent usage | `bg-launch` for the primary submit action |

**Pattern notes:** Authentication fields always pair a visible label with persistent help text, inline validation, `aria-invalid`, and a polite status region. The Turnstile widget occupies a clipped `min-h-16` checkpoint between the email field and action, loads only on the sign-in route through `next/script`, and is a legitimate keyboard stop before submit. The primary action remains disabled until a fresh provider token exists; expired, failed, and consumed challenges clear the token and fail closed. Missing production configuration surfaces a text alert instead of silently allowing submission. Provider and invite-hook outcomes use neutral copy so the UI does not reveal whether an invitation or account exists. Both authorization-code and token-hash email verification failures reuse the same neutral retry state; protocol details must never appear in the interface. Submit actions retain a 44 px minimum target and remove transform motion for reduced-motion users.

### Sign-out Action

File: `features/auth/components/sign-out-button.tsx`
Last updated: 2026-08-07

| Property | Class |
| --- | --- |
| Background | transparent |
| Border | none |
| Border radius | `rounded-sm` |
| Text — primary | `text-ink`; inverse variant `text-white` |
| Typography | `text-sm font-semibold` |
| Spacing | `px-3`; `min-h-11` target |
| Interactive state | global Cobalt focus outline |
| Shadow | none |
| Accent usage | none |

**Pattern notes:** Use this compact server-action form in authenticated shell headers and terminal access states. The inverse variant is reserved for Ink surfaces.

### Access State Panel

Files: `app/(auth)/access-pending/page.tsx`, `app/(learner)/app/onboarding/page.tsx`
Last updated: 2026-08-07

| Property | Class |
| --- | --- |
| Background | `bg-white` |
| Border | `border border-stone-300`; internal divider `border-stone-200` |
| Border radius | `rounded-md` |
| Text — primary | heading `text-ink`; body `text-stone-700` |
| Typography | eyebrow `text-sm font-semibold uppercase tracking-widest`; heading `font-display text-3xl font-semibold leading-tight`; body `text-lg leading-relaxed` |
| Spacing | `p-5 md:p-6`; heading `mt-3`; body `mt-4`; terminal action `mt-6 pt-4` |
| Interactive state | inherited from contained actions |
| Shadow | none |
| Accent usage | Cobalt eyebrow text identifies the current access checkpoint |

**Pattern notes:** Quiet product checkpoints use one bordered White panel and a short hierarchy: Cobalt eyebrow, display heading, explanatory copy, then an optional divided action. This pattern is suitable for pending, empty, and onboarding checkpoint states; it must not expose invite existence or internal authorization reasons.

### Route State Panels

Files: `components/ui/route-error-state.tsx`, `components/ui/route-not-found-state.tsx`
Last updated: 2026-08-25

| Property | Class |
| --- | --- |
| Background | inherits the current shell's Canvas workspace |
| Border | `border-y-2 border-coral` for retry; `border-y-2 border-ink` for unavailable content |
| Border radius | none |
| Text — primary | heading and action `text-ink`; body `text-stone-700` |
| Text size and weight | uppercase `text-xs` eyebrow; `font-display text-3xl font-semibold` heading; semibold action |
| Spacing | panel `py-8`; heading `mt-3`; body `mt-4`; action `mt-6 px-5 py-2.5` |
| Interactive state | shared `pressable` action with 44 px minimum height and global Cobalt focus outline |
| Shadow | none |
| Accent usage | Coral identifies retryable failure; Cobalt identifies unavailable content; Launch marks the recovery action |

**Pattern notes:** Route failures reuse one context-safe hierarchy across public, authentication, learner, and reviewer shells. Copy names only the current surface, never exposes whether a protected record exists, and explicitly states when evidence or status was not changed. Next.js error boundaries remain thin Client Components that pass `unstable_retry` to the shared retry panel; not-found states remain Server Components with one safe return destination.

### Privacy Notice

File: `app/(marketing)/privacy/page.tsx`
Last updated: 2026-08-25

| Property | Class |
| --- | --- |
| Background | `bg-canvas`; sensitive-data warning `bg-stone-100` |
| Border | reading sections `border-t-2 border-ink`; warning `border-l-4 border-coral` |
| Border radius | none |
| Text — primary | headings and warning `text-ink`; body `text-stone-700` |
| Text size and weight | oversized display introduction; `font-display text-2xl font-semibold` section headings; relaxed body copy |
| Spacing | article `gap-10`; reading column `space-y-12`; sections `pt-6`; warning `p-4` |
| Interactive state | Cobalt underlined links with 44 px minimum height and global focus outline |
| Shadow | none |
| Accent usage | Cobalt identifies privacy context and destinations; Coral identifies prohibited sensitive evidence |

**Pattern notes:** Operational policy pages use one asymmetric editorial article: a compact sticky introduction beside a reading-width ruled column on wide screens, then one linear column on mobile. Write concrete controller, purpose, retention, rights, and contact guidance in plain Macedonian. Keep evidence warnings adjacent to data categories and repeat a direct `/privacy` link at every product data-entry point; never turn required service processing into a consent checkbox.

### Learner Onboarding Form

File: `features/onboarding/components/onboarding-form.tsx`
Last updated: 2026-08-10

| Property | Class |
| --- | --- |
| Background | form inherits White card; inputs `bg-white`; notice `bg-stone-100` |
| Border | fields `border border-stone-300`; sections `border-stone-200`; invalid summary `border-coral` |
| Border radius | fields/panels `rounded-md`; primary action `rounded-sm` |
| Text — primary | `text-ink`; supporting copy `text-stone-700` |
| Typography | section legends `font-display text-xl font-semibold`; labels/action `font-semibold`; help/error `text-sm leading-relaxed` |
| Spacing | form `space-y-8`; field groups `space-y-5`; controls `px-3.5 py-3`; panels `p-4` |
| Interactive state | Cobalt focus border/ring; Coral invalid border/ring; disabled action opacity; reduced-motion-safe hover lift |
| Shadow | none |
| Accent usage | Cobalt identifies context/focus; Coral marks validation structure; Launch Yellow is reserved for the primary continuation action |

**Pattern notes:** Long product forms use semantic fieldsets with display-font legends, visible labels, persistent help, inline errors connected through `aria-describedby`, and a focus-managed form-level alert that preserves submitted values. Related numeric/date controls may form two columns only at medium widths. Privacy guidance is a quiet Stone panel rather than a consent checkbox. Verified at 360 px and desktop without horizontal overflow.

### Project Start Confirmation

Files: `app/(learner)/app/page.tsx`, `features/projects/components/start-project-form.tsx`
Last updated: 2026-08-12

| Property | Class |
| --- | --- |
| Background | main panel `bg-white`; context rail `bg-stone-100` |
| Border | panels `border border-stone-300`; scope divider `border-stone-200`; primary task `border-2 border-ink` |
| Border radius | panels `rounded-md`; primary action `rounded-sm` |
| Text — primary | heading/body labels `text-ink`; supporting copy `text-stone-700` |
| Typography | eyebrow `text-sm font-semibold uppercase tracking-widest`; title `font-display text-3xl font-semibold`; scope labels/action `font-semibold` |
| Spacing | panels `p-5 md:p-6`; scope rows `space-y-6`; primary action `px-5 py-2.5` |
| Interactive state | pending action is disabled with reduced opacity; restrained hover lift with reduced-motion fallback |
| Shadow | none |
| Accent usage | Cobalt identifies the checkpoint; Launch Yellow is reserved for the explicit start action |

**Pattern notes:** A consequential project transition uses a server-rendered confirmation card with the saved scope visible before one explicit action. Only the action’s pending/error state crosses the client boundary. After success, the same layout becomes a quiet active-project checkpoint: the available assignment uses a strong Ink artifact border, while the context rail explains the exact unlock rule. The layout is one column by default and adds a sticky rail only at desktop width.

### Project Scope Summary

File: `features/projects/components/project-scope-summary.tsx`
Last updated: 2026-08-12

| Property | Class |
| --- | --- |
| Background | summary `bg-white`; readiness panel `bg-stone-100` |
| Border | `border border-stone-300`; internal dividers `border-stone-200` |
| Border radius | panels `rounded-md`; status badge `rounded-sm` |
| Text — primary | `text-ink`; supporting metadata `text-stone-700` |
| Typography | eyebrow `text-sm font-semibold uppercase tracking-widest`; title `font-display text-3xl font-semibold`; readiness heading `font-display text-xl font-semibold` |
| Spacing | panels `p-5 md:p-6`; field grid `gap-6` |
| Interactive state | none; this component is intentionally read-only |
| Shadow | none |
| Accent usage | Cobalt identifies context; Acid means ready; Coral means reduction needed |

**Pattern notes:** Project scope has one shared server-renderable representation for learner and reviewer surfaces. Values remain read-only in both contexts. Readiness never relies on colour alone: a marker, heading, explanatory copy, and review date communicate state. The panel explicitly states that scope readiness does not change project status or block assignments.

### Reviewer Scope Assessment Form

File: `features/projects/components/scope-assessment-form.tsx`
Last updated: 2026-08-12

| Property | Class |
| --- | --- |
| Background | container `bg-ink`; textarea `bg-white` |
| Border | container/options `border-stone-700`; success `border-acid`; error `border-coral` |
| Border radius | fields/panels `rounded-md`; primary action `rounded-sm` |
| Text — primary | inverse `text-white`; help `text-stone-300`; field text `text-ink` |
| Typography | heading `font-display text-xl font-semibold`; labels/action `font-semibold`; help/status `text-sm` |
| Spacing | panel `p-5 md:p-6`; control groups `mt-6`; controls `px-4 py-3` |
| Interactive state | selected option `has-checked:border-acid`; Cobalt textarea focus; disabled action opacity; reduced-motion-safe hover lift |
| Shadow | none |
| Accent usage | Acid marks the reviewer proof action and success; Coral marks validation failure |

**Pattern notes:** Reviewer decision forms stay on the inverse Ink surface and keep the mutation as the only client boundary. Radio decisions use full-width 44 px targets, validation focuses its alert, and the correction note is conditionally required without hiding the field. Latest assessment replaces current state while the database remains the authorization boundary.

### Curriculum Markdown

File: `features/curriculum/components/curriculum-markdown.tsx`
Last updated: 2026-08-12

| Property | Class |
| --- | --- |
| Background | inherited; code/table headers `bg-stone-100` |
| Border | blockquote `border-cobalt`; code/table `border-stone-300` |
| Border radius | code `rounded-sm`; preformatted blocks `rounded-md` |
| Text — primary | headings/strong/code `text-ink`; body `text-stone-700`; links `text-cobalt` |
| Typography | headings `font-display font-semibold`; body/list `leading-relaxed`; code `text-sm` |
| Spacing | root `space-y-4`; lists `space-y-2 pl-6`; blocks/tables `p-3` or `p-4` |
| Interactive state | links inherit the global Cobalt focus outline |
| Shadow | none |
| Accent usage | Cobalt is limited to links and blockquote structure |

**Pattern notes:** Migration-managed curriculum Markdown renders through one Server Component with raw HTML skipped, an explicit element allowlist, and safe URL transformation. Headings are normalized below the page heading; external links open separately with `noopener`/`noreferrer`. Learner-authored content must not use this renderer.

### Assignment Curriculum

File: `features/curriculum/components/assignment-curriculum.tsx`
Last updated: 2026-08-12

| Property | Class |
| --- | --- |
| Background | main article `bg-white`; state/context rail `bg-stone-100` |
| Border | article/criteria/rail `border-stone-300`; section dividers `border-stone-200` |
| Border radius | no radius on reading surfaces or grouped criteria; status `rounded-sm` |
| Text — primary | titles/numbers `text-ink`; supporting content `text-stone-700` |
| Typography | page title `font-display text-3xl md:text-4xl font-semibold`; section titles `font-display text-2xl font-semibold` |
| Spacing | article `p-5 md:p-7`; sections `mt-10 pt-7`; criteria use divided `py-4` rows |
| Interactive state | back link uses underlined Cobalt treatment and the global focus outline |
| Shadow | none |
| Accent usage | Cobalt identifies curriculum context; status colours remain state-specific |

**Pattern notes:** Assignment reading order is stage/task identity, state metadata, guidance, semantic acceptance-criteria list, proof requirement, then contextual state guidance. Criteria are never checkboxes before review. The desktop context rail becomes a normal trailing section on narrow screens, and locked assignments remain readable without exposing progress mutations.

### Current Assignment Dashboard

File: `features/progress/components/current-assignment-dashboard.tsx`
Last updated: 2026-08-12

| Property | Class |
| --- | --- |
| Background | task `bg-white`; feedback/context `bg-stone-100` |
| Border | panels `border-stone-300`; section dividers `border-stone-200`; state badge uses its semantic border |
| Border radius | no radius on reading/annotation surfaces; state marker `rounded-sm` |
| Text — primary | headings/status `text-ink`; supporting copy `text-stone-700` |
| Typography | task title `font-display text-3xl md:text-4xl font-semibold`; panel headings `font-display text-lg` or `text-xl font-semibold` |
| Spacing | task `p-5 md:p-6`; feedback `p-4`; sections `mt-8 pt-6` |
| Interactive state | primary task link uses registered Launch action and reduced-motion-safe lift |
| Shadow | none |
| Accent usage | Cobalt identifies stage/path context; Cobalt, Coral, and Acid remain state-specific |

**Pattern notes:** The dashboard has one dominant task and one exact unlock rail. It renders a pure discriminated view model, never calculates progress in JSX, and shows approved/total counts rather than a writable percentage. Required proof appears before the primary action; feedback has an intentional empty state until review data exists. Empty, completed, and inconsistent locked projections use the quiet terminal-panel pattern.

### Project Journey

File: `features/journey/components/project-journey.tsx`
Last updated: 2026-08-12

| Property | Class |
| --- | --- |
| Background | open journey `bg-white`; locked endpoint `bg-stone-100` |
| Border | container/checkpoints `border-stone-300`; task dividers `border-stone-200`; semantic checkpoint borders use Ink, Cobalt, or Coral |
| Border radius | no radius on journey/endpoint; checkpoints are square editorial markers |
| Text — primary | headings/links `text-ink`; supporting state copy `text-stone-700` |
| Typography | section title `font-display text-2xl md:text-3xl font-semibold`; task links/states `font-semibold` |
| Spacing | container `p-5 md:p-6`; task rows `py-4`; major sections `mt-8 pt-6` |
| Interactive state | task/live links are underlined, retain global focus, and use Cobalt hover or primary link treatment |
| Shadow | none |
| Accent usage | Cobalt identifies journey context/submitted checkpoints; Coral marks revision/error; Acid fills approved checkpoints |

**Pattern notes:** Six stages and ten assignments share one semantic DOM order: the stage rail adapts from a mobile vertical stepper to a desktop horizontal rail without duplicating content. Number, explicit state text, and exact locked prerequisite carry all meaning without colour or motion. Every assignment remains a readable link even while locked. The final endpoint is named while locked, becomes an external live URL only after launch evidence is approved, and exposes missing approved-project data as an error rather than false completion.

### Evidence Draft and Submit Form

File: `features/submissions/components/evidence-draft-form.tsx`
Last updated: 2026-08-13

| Property | Class |
| --- | --- |
| Background | editor inherits White article; grouped link rows are open; empty/status states `bg-stone-100`; submit panel `bg-canvas` |
| Border | strong section rules; grouped link dividers `border-stone-300`; submit panel `border-2 border-cobalt`; error/success use semantic left rules |
| Border radius | controls `rounded-md`; actions `rounded-sm`; no radius on workflow panels |
| Text — primary | headings/labels/actions `text-ink`; supporting copy `text-stone-700` |
| Typography | section title `font-display text-2xl font-semibold`; link legend `text-sm font-semibold`; help/error `text-sm leading-relaxed` |
| Spacing | form `space-y-6`; link rows `py-5`; submit panel `p-5 md:p-6`; controls `px-3.5 py-3`; field groups `gap-4` |
| Interactive state | Cobalt focus border/ring; Coral invalid border/ring; explicit confirmation checkbox; `evidence-row-motion` add/remove; disabled opacity; semantic press feedback |
| Shadow | none |
| Accent usage | Launch Yellow marks explicit save; Cobalt marks submit/pending review; Coral structures validation/conflict errors |

**Pattern notes:** Mutable evidence uses explicit save and remains visually subordinate to the assignment criteria and proof prompt. Repeatable links are semantic fieldsets with visible type, label, URL, and a 44 px labelled remove action. Empty drafts are valid; added link rows must be complete. Validation preserves entered values, focuses the result summary, and never clears evidence after a recoverable failure. Submission is a separate Cobalt review-state panel: it accepts only the last successfully saved non-empty proof, disables while changes are unsaved, and requires a labelled confirmation checkbox before the irreversible submit action. The editor renders only for available or revision-required assignments; locked, submitted, and approved curriculum stays read-only.

### Submission History

File: `features/submissions/components/submission-history.tsx`
Last updated: 2026-08-13

| Property | Class |
| --- | --- |
| Background | version records `bg-white`; evidence links `bg-stone-100` |
| Border | latest `border-2 border-cobalt`; older/link cards `border-stone-300`; timeline `border-l-2 border-stone-300`; internal dividers `border-stone-200` |
| Border radius | no radius on version/link records; status badges `rounded-sm` |
| Text — primary | headings/labels `text-ink`; supporting copy and URLs `text-stone-700` |
| Typography | section heading `font-display text-2xl font-semibold`; version heading `font-display text-lg font-semibold`; metadata `text-sm`; link type `text-xs font-semibold uppercase tracking-widest` |
| Spacing | timeline `space-y-4 pl-4`; version headers/content `px-4 md:px-5`; link cards `p-4` |
| Interactive state | older versions use native `details`/`summary` with a 44 px minimum target and Cobalt focus outline; evidence links use the registered underlined Cobalt treatment |
| Shadow | none |
| Accent usage | Cobalt marks newest/pending evidence; Coral marks revision-required; Acid marks approved |

**Pattern notes:** Submission history is a server-rendered, newest-first ordered list of immutable evidence versions. The newest version stays fully expanded; older versions use native disclosures without duplicating content or adding client JavaScript. Each version keeps its status and timestamps adjacent to the exact frozen text and ordered labelled links. Timestamps use a fixed `day.month.year г., во HH:mm` presentation assembled from `Europe/Skopje` time-zone parts so operating-system ICU wording cannot change the UI contract. Empty text or link sections remain explicit because a valid submission may contain either proof form. The timeline is omitted entirely before the first submission, follows the editor during revision work, and otherwise appears directly after the proof requirement.

### Proof Artifact

File: `components/ui/proof-artifact.tsx`
Last updated: 2026-08-13

| Property | Class |
| --- | --- |
| Background | semantic variants `bg-white`, `bg-launch`, `bg-cobalt`, `bg-acid` |
| Border | `border-2 border-ink` |
| Border radius | none |
| Text | Ink except the inverse Cobalt variant, which uses White |
| Spacing | `p-5`; label `mb-4` |
| Shadow | optional `proof-shadow` at the composition level |
| Accent usage | variant communicates artifact role, never feature-local colour |

**Pattern notes:** Use for scope notes, evidence snapshots, reviewer annotations, browser previews, and URL receipts. It is a semantic article, exposes `data-proof-variant` for stable tests, and must not replace ordinary layout sections.

### Section Heading

File: `components/ui/section-heading.tsx`
Last updated: 2026-08-13

| Property | Class |
| --- | --- |
| Background | inherited |
| Border | none |
| Border radius | none |
| Text | Cobalt uppercase eyebrow; Ink display heading; Stone 700 description |
| Typography | `font-display text-3xl md:text-5xl font-semibold leading-tight` |
| Spacing | title `mt-3`; description `mt-4` |
| Accent usage | Cobalt only for compact section identity |

**Pattern notes:** Marketing narrative sections use one addressable heading and optional description. Product screens may use the same hierarchy at smaller local sizes but remain task-focused.

### Status Marker

File: `components/ui/status-marker.tsx`
Last updated: 2026-08-13

| Property | Class |
| --- | --- |
| Background | White, Acid, or Ink according to semantic tone |
| Border | `border`; semantic Cobalt, Coral, Ink, or Stone token |
| Border radius | `rounded-sm` |
| Text | always includes a readable Macedonian label |
| Spacing | `px-3 py-2`; `w-fit` |
| Accent usage | neutral, active, revision, approved, and inverse variants only |

**Pattern notes:** Status meaning is exposed through text and `data-status-tone`, never colour alone. Reuse this component in learner and reviewer records instead of composing feature-specific badges.

### Scroll Narrative Landing

File: `components/marketing/landing-experience.tsx` and `components/marketing/landing-experience.module.css`
Last updated: 2026-08-14

| Property | Pattern |
| --- | --- |
| Background | Canvas graph-paper field; White reading sections; Cobalt manifesto; Launch review section |
| Border | 2 px Ink frames and section rules; 1 px semantic neutral dividers |
| Border radius | none; film mask may ease to square corners during scroll |
| Text — primary | Ink on Canvas/White/Launch/Acid; White on Cobalt |
| Text — secondary | Stone 700 supporting copy |
| Typography | oversized Unbounded statements with tight leading; Onest for explanatory copy; compact uppercase indexed labels |
| Spacing | full-viewport story scenes; content uses public-container gutters and generous section rhythm |
| Interactive state | floating White navigation, Launch CTA, native FAQ disclosures, semantic loading status for the frame sequence |
| Shadow | token-based Cobalt nav offset and Ink CTA/review offsets only |
| Accent usage | Cobalt carries motion/digital emphasis; Launch carries action; Acid appears only on accepted proof |

**Pattern notes:** Marketing motion is a continuous spatial narrative, not a collection of reveal cards. At rest, the hero headline must finish above the 64% lower-media reveal with a deliberate clear gap; copy and media never overlap. The hero then has two exclusive scroll phases: during the first third, the headline travels upward while the media reveals from beneath it, with frame 1 and canvas scale 1 locked; only after the media is fully revealed may the remaining two thirds apply the 1 → 1.04 canvas scale and map progress to the JPEG sequence. Fine-pointer devices load all 102 clean 3840×1770 frames; coarse-pointer phones load every fourth frame plus the final frame and map scroll progress only across that 27-frame set. The source fills its image bounds without encoded letterboxing, so every render path uses the full source height and biases horizontal placement to the subject at 39% of source width. The Canvas backing store changes only when its rendered size changes, never on every sequence frame. Hero clip-path tweens keep four explicit inset values at both endpoints so interpolation cannot mask the side and bottom edges. Never render the full sequence as DOM images. Fine-pointer hover may pan the over-scaled media plane by no more than 8 px horizontally and 6 px vertically. The later 340svh wide-screen process scene advances the six proof stages beside the pinned visual; narrow fine-pointer windows keep the process unpinned. Touch devices do not create hover motion or the process sequence. Reduced motion draws one representative static frame and removes scrubbed transforms on every pointer type. Ordinary sections—including the application-fit argument—continue to use `Reveal`.

### Application Fit Section

File: `components/marketing/landing-experience.tsx` and `components/marketing/landing-experience.module.css`
Last updated: 2026-08-14

| Property | Pattern |
| --- | --- |
| Background | Canvas section; paired White and Cobalt decision panels; Launch action strip |
| Border | 2 px Ink frames; 1 px current-color list dividers |
| Border radius | none |
| Text — primary | Ink on Canvas/White/Launch; White on Cobalt |
| Typography | oversized Unbounded decision headline; compact Unbounded panel leads; Onest evidence lists |
| Spacing | generous section rhythm; 1.5rem panel padding; three-item evidence lists |
| Interactive state | full-width Launch application link with Ink offset shadow |
| Shadow | Ink offset on the application strip only |
| Accent usage | Cobalt identifies participant commitment; Launch identifies the next action |

**Pattern notes:** A high-intent marketing CTA must earn the action before repeating it: state who should join, state the concrete outcome, then present one direct application link. Use paired positive/outcome panels rather than generic feature cards, and repeat timing, workload, and human-review facts beside the final application action.

### Viewport Reveal

File: `components/ui/reveal.tsx`
Last updated: 2026-08-14

| Property | Pattern |
| --- | --- |
| Properties | opacity and translateY only |
| Duration | `--duration-stage` with `--stagger-step` |
| Easing | `--ease-out` |
| Trigger | one-time viewport intersection |
| Reduced motion | transforms and stagger removed; content remains immediately visible |
| Fallback | initial content is visible when JavaScript or IntersectionObserver is unavailable |

**Pattern notes:** Use this lightweight IntersectionObserver pattern for ordinary one-time entrances in marketing reading sections. GSAP remains reserved for scroll-linked story sequences. Never wrap navigation, product forms, dense rows, or every paragraph independently.

### Reviewer Queue

File: `features/reviews/components/reviewer-queue.tsx`
Last updated: 2026-08-19

| Property | Class |
| --- | --- |
| Background | inherited `bg-canvas` workspace |
| Border | section and table rules use `border-ink`, `border-stone-300`, and `border-stone-200` |
| Border radius | none |
| Text — primary | `text-ink`; metadata `text-stone-700` and `text-stone-600` |
| Text size and weight | display section heading; uppercase `text-xs` labels; semibold row anchors |
| Spacing | section header `pb-5`; cells `py-3 md:py-4`; action `px-4 py-2` |
| Interactive state | square 44 px `bg-launch` action with `border-2 border-ink` |
| Shadow | none |
| Accent usage | Cobalt identifies the operational section and pending count |

**Pattern notes:** Operational queues use one semantic table. At narrow widths, the same table rows become labelled record blocks instead of creating a second mobile DOM. Rows stay oldest-first, expose the exact immutable record action, and use text plus timestamps rather than colour to communicate priority.

### Reviewer Cohort Snapshot

File: `features/reviews/components/cohort-snapshot.tsx`
Last updated: 2026-08-19

| Property | Class |
| --- | --- |
| Background | inherited `bg-canvas` workspace |
| Border | cohort boundaries `border-b-2 border-ink`; metrics and rows use Stone rules |
| Border radius | none |
| Text — primary | `text-ink`; explanatory copy `text-stone-700`; labels `text-stone-600` |
| Text size and weight | display headings and metric values; uppercase `text-xs` metric labels |
| Spacing | cohorts `pt-6 pb-8`; metrics and learner rows `py-4` to `py-5` |
| Interactive state | project links use semibold Cobalt underline treatment |
| Shadow | none |
| Accent usage | `StatusMarker` owns cohort and assignment state; Cobalt marks pending review |

**Pattern notes:** Reviewer summaries are operational, not analytical dashboards. Use ruled definition lists for compact counts and open grouped rows for learner context. Show only active memberships, preserve explicit empty states, and keep project, current assignment, approved count, and pending-review state readable without relying on colour.

### Submission Review Preview

File: `features/reviews/components/submission-review-preview.tsx`
Last updated: 2026-08-20

| Property | Class |
| --- | --- |
| Background | inherited `bg-canvas`; frozen evidence uses the shared white `ProofArtifact` |
| Border | page and context rules `border-ink`; evidence groups use `border-stone-300` |
| Border radius | none |
| Text — primary | `text-ink`; body and timestamps `text-stone-700`; labels `text-stone-600` |
| Text size and weight | display `text-3xl md:text-5xl` title; display `text-xl` evidence headings |
| Spacing | header `pb-6`; content `mt-8 gap-8`; context rows `py-4` |
| Interactive state | navigation and evidence links use semibold Cobalt underlines |
| Shadow | shared `ProofArtifact` treatment only |
| Accent usage | Cobalt for navigation/context; `StatusMarker` for submission state |

**Pattern notes:** The review route renders the exact frozen submission version as the primary artifact, with learner/project/cohort metadata in a secondary ruled aside. External evidence links retain their type and visible URL. The criterion decision follows the artifact, never precedes it, and completed feedback replaces the editable form without changing the selected evidence. Historical evidence for a removed learner remains readable, but its decision form is replaced by an explicit inactive-membership notice; the database independently rechecks the same condition at submission time.

### Criterion Review Form

File: `features/reviews/components/review-decision-form.tsx`
Last updated: 2026-08-20

| Property | Class |
| --- | --- |
| Background | inherited `bg-canvas`; choice cards and inputs use `bg-white`; errors use `bg-stone-100` |
| Border | criterion groups use `border-y-2 border-ink`; choice cards and inputs use `border-stone-300`; final decision uses `border-2 border-cobalt` |
| Border radius | choice cards remain square; text inputs use `rounded-md`; action uses `rounded-sm` |
| Text — primary | `text-ink`; supporting and help copy `text-stone-700` |
| Text size and weight | display section headings; semibold criteria, labels, and choices; uppercase `text-xs` eyebrow |
| Spacing | section `pt-8`; criterion rows `py-6`; cards `p-4`; final decision `p-5 md:p-7` |
| Interactive state | selected cards use `has-checked:border-cobalt` and a Cobalt token ring; controls use shared Cobalt focus and Coral invalid states |
| Shadow | none |
| Accent usage | Cobalt identifies review structure and selection; Launch identifies the single irreversible action; Coral identifies validation failure |

**Pattern notes:** Irreversible operational forms place one native fieldset around each business decision, keep 44 px minimum targets, pair every outcome with explanatory text, and require an explicit confirmation adjacent to the final action. Criterion correction notes sit directly below their criterion. Server errors focus a persistent alert while preserving the submitted values. Approval and revision consistency is enforced in both the form schema and the atomic database function.

### Completed Criterion Review

File: `features/reviews/components/completed-review.tsx`
Last updated: 2026-08-20

| Property | Class |
| --- | --- |
| Background | inherited `bg-canvas`; summary uses `bg-stone-100` |
| Border | section and criteria use `border-ink`; summary uses `border-l-4 border-cobalt`; internal rules use Stone tokens |
| Border radius | none |
| Text — primary | `text-ink`; review copy and timestamp `text-stone-700` |
| Text size and weight | display decision heading; semibold criterion and feedback labels |
| Spacing | section `pt-8`; summary `p-5`; criterion rows `py-5` |
| Interactive state | none; finalized feedback is read-only |
| Shadow | none |
| Accent usage | shared `StatusMarker` communicates pass or revise outcomes with text and semantic tone |

**Pattern notes:** A finalized review replaces all editable controls with a timestamped summary, optional priority correction, and criterion outcomes mapped back to the immutable acceptance-criterion copy. Never reconstruct criterion order from review rows; use curriculum order and join outcomes by criterion ID.

### Learner Review Feedback

File: `features/reviews/components/learner-review-feedback.tsx`
Last updated: 2026-08-20

| Property | Class |
| --- | --- |
| Background | active panel `bg-white`; priority annotation `bg-stone-100`; historical feedback inherits the immutable version record |
| Border | active state `border-2 border-coral`; priority `border-l-4 border-coral`; historical section and criterion rules use Stone tokens |
| Border radius | none |
| Text — primary | headings, priority, and criterion copy `text-ink`; summary, notes, and timestamps `text-stone-700` |
| Text size and weight | display `text-2xl` active heading; semibold labels and criteria; `text-lg` priority; `text-sm` notes and metadata |
| Spacing | active panel `p-5 md:p-6`; major groups `mt-6`; priority `p-4 md:p-5`; criterion rows `py-4` |
| Interactive state | none; the active panel precedes the existing draft editor and historical feedback follows native version disclosure behavior |
| Shadow | none |
| Accent usage | Coral identifies the correction boundary and single priority; `StatusMarker` owns all decision and criterion outcomes |

**Pattern notes:** While an assignment is `revision_required`, show one active learner-facing panel before the reopened draft. Lead with one priority correction, then the review summary, then only criteria marked for revision. Do not duplicate passing criteria in the active task. After resubmission, remove the active panel and preserve the full decision—including every criterion outcome—inside the exact immutable submission version. Missing active feedback is an explicit recovery state, never an empty or generic placeholder.

### Reviewer Version Context

File: `features/reviews/components/review-version-history.tsx`
Last updated: 2026-08-20

| Property | Class |
| --- | --- |
| Background | disclosure records use `bg-white`; link artifacts use `bg-stone-100` |
| Border | timeline `border-stone-300`; selected context separation `border-t-2 border-ink`; links use `border-l-4 border-cobalt` |
| Border radius | none |
| Text — primary | `text-ink`; timestamps and evidence `text-stone-700` |
| Text size and weight | display `text-lg` version headings; uppercase `text-xs` link types |
| Spacing | section `pt-8`; disclosure headers and content `p-4 md:p-5` |
| Interactive state | native disclosure focus uses the Cobalt outline; exact-version links use the shared Cobalt underline treatment |
| Shadow | none |
| Accent usage | Cobalt identifies links and the timeline; submission status keeps its existing semantic presentation |

**Pattern notes:** When one immutable version is selected, it remains fully expanded and visually dominant above the decision. Other versions appear afterward as native disclosures and link to their own exact review routes. Exclude the selected version from the context list instead of duplicating it.

### Learner Approval Checkpoint

File: `features/reviews/components/approved-assignment-checkpoint.tsx`
Last updated: 2026-08-22

| Property | Class |
| --- | --- |
| Background | checkpoint `bg-acid`; primary continuation action `bg-ink` |
| Border | container, section rules, and criterion dividers use `border-ink`; container and major rules use `border-2` |
| Border radius | none |
| Text — primary | `text-ink`; inverse action copy uses `text-[var(--text-inverse)]` |
| Text size and weight | display `text-2xl` decision heading; uppercase `text-xs` review metadata; semibold criteria and outcome labels |
| Spacing | panel `p-5 md:p-6`; major groups `mt-6 pt-5`; criterion rows `py-4`; action `px-5 py-3` |
| Interactive state | shared `pressable` action with a 48 px minimum target and global Cobalt focus outline |
| Shadow | none |
| Accent usage | Acid is reserved for the durable approved checkpoint; Ink gives the next-step action maximum contrast |

**Pattern notes:** After approval, keep the human decision and every passed criterion visible between the proof request and immutable submission history. Approval is a durable checkpoint rather than a transient toast. Give it one direct action: the exact next assignment, or the completed project after the terminal approval. If the next assignment remains locked, replace the action with an explicit recovery alert instead of implying success.

## Foundations

### Root document — `app/layout.tsx`

- **Purpose:** Minimal server-rendered HTML/body boundary for the application baseline.
- **Typography:** Loads Onest for body/UI and Unbounded for display text through `next/font`, with Cyrillic and Latin subsets, `display: swap`, and semantic fallback stacks.
- **Accessibility:** Declares Macedonian with `lang="mk"` and preserves full-height document layout.
- **Used by:** Every application route.

### Global theme — `app/globals.css`

- **Purpose:** Tailwind CSS v4 theme namespaces, semantic product variables, layout and motion tokens, global focus treatment, safe text wrapping, and reduced-motion fallback.
- **Tokens:** Brand colours, Lansiraj stone scale, `radius-sm` through `radius-lg`, `shadow-overlay`, `animate-checkpoint`, semantic surface/text/border/action/state variables, containers, gutters, durations, easing, and documented z-index values.
- **Accessibility:** Global 3 px Cobalt focus outline, light colour scheme, long-copy wrapping, and reduced-motion overrides.
- **Used by:** Application root stylesheet; component registration begins after components are implemented and accepted.

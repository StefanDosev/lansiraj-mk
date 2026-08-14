# UI Registry

Living document. Read this before building a component and update it immediately after the component is accepted. The registry records implemented reality; planned components belong in `build-plan.md`, not here.

Last reviewed: 2026-08-13 during the whole-product editorial proof-system redesign. Marketing, auth, onboarding, learner, evidence, history, and current reviewer surfaces are registered below.

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
Last updated: 2026-08-08

| Property | Pattern |
| --- | --- |
| Public background | `bg-launch` header with `bg-canvas` content/footer |
| Product background | `bg-canvas` with `bg-white` header |
| Reviewer background | `bg-ink text-white` |
| Border | `border-ink`, `border-stone-300`, or inverse `border-stone-700` according to surface |
| Border radius | none on shell boundaries |
| Text — primary | Ink on light surfaces; White on Ink |
| Spacing | `min-h-16` header; `py-8 md:py-12` product main |
| Shadow | none |
| Accent usage | Cobalt for current product navigation; Acid only as reviewer proof-state metadata |

**Pattern notes:** All shells are Server Components, use semantic labelled navigation, include the shared skip link, and constrain content with `container-public` or `container-product`. Learner and reviewer shells enforce authorization before rendering and expose the compact sign-out action. Reviewer precedence is enforced at the learner-shell boundary. Post-onboarding learner pages additionally require completed onboarding, while `/app/onboarding` redirects completed learners to `/app`. Marketing may be expressive; learner/auth shells stay quiet; reviewer routes are deliberately inverse and distinct.

### Magic Link Form

File: `features/auth/components/magic-link-form.tsx`
Last updated: 2026-08-07

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

**Pattern notes:** Authentication fields always pair a visible label with persistent help text, inline validation, `aria-invalid`, and a polite status region. Provider outcomes use neutral copy so the UI does not reveal whether an invitation or account exists. Both authorization-code and token-hash email verification failures reuse the same neutral retry state; protocol details must never appear in the interface. Submit actions retain a 44 px minimum target and remove transform motion for reduced-motion users.

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

**Pattern notes:** Submission history is a server-rendered, newest-first ordered list of immutable evidence versions. The newest version stays fully expanded; older versions use native disclosures without duplicating content or adding client JavaScript. Each version keeps its status and timestamps adjacent to the exact frozen text and ordered labelled links. Empty text or link sections remain explicit because a valid submission may contain either proof form. The timeline is omitted entirely before the first submission, follows the editor during revision work, and otherwise appears directly after the proof requirement.

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

**Pattern notes:** Marketing motion is a continuous spatial narrative, not a collection of reveal cards. At rest, the hero headline must finish above the 64% lower-media reveal with a deliberate clear gap; copy and media never overlap. The hero then has two exclusive scroll phases: during the first third, the headline travels upward while the media reveals from beneath it, with frame 1 and canvas scale 1 locked; only after the media is fully revealed may the remaining two thirds apply the 1 → 1.04 canvas scale and map progress to the 77 JPEG frames. Every render path crops the encoded 84 px top and 105 px bottom letterbox before cover sizing, then biases horizontal placement to the subject at 39% of source width; mobile uses the same Canvas crop instead of compensating with CSS zoom. The Canvas backing store changes only when its rendered size changes, never on every sequence frame. Hero clip-path tweens keep four explicit inset values at both endpoints so interpolation cannot mask the side and bottom edges. Never render the full sequence as DOM images or expose the black bands. Fine-pointer hover may pan the over-scaled media plane by no more than 8 px horizontally and 6 px vertically. The later 340svh wide-screen process scene advances the six proof stages beside the pinned visual with only a 1 → 1.04 canvas scale; narrow fine-pointer windows keep the process unpinned but continue advancing frames. Coarse-pointer touch devices load one subject-focused still image and neither preload the sequence nor create ScrollTriggers. Do not use viewport width alone to decide whether motion is available. Reduced motion draws one representative frame and removes scrubbed transforms. Ordinary sections—including the application-fit argument—continue to use `Reveal`.

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

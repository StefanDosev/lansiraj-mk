# UI Registry

Living document. Read this before building a component and update it immediately after the component is accepted. The registry records implemented reality; planned components belong in `build-plan.md`, not here.

Last reviewed: 2026-08-12 during Phase 11 implementation. Authentication, onboarding, project-start, and scope-readiness patterns are registered below.

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

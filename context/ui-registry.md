# UI Registry

Living document. Read this before building a component and update it immediately after the component is accepted. The registry records implemented reality; planned components belong in `build-plan.md`, not here.

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
Last updated: 2026-08-05

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

**Pattern notes:** All shells are Server Components, use semantic labelled navigation, include the shared skip link, and constrain content with `container-public` or `container-product`. Marketing may be expressive; learner/auth shells stay quiet; reviewer routes are deliberately inverse and distinct.

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

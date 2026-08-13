# UI Tokens

These are the canonical design tokens for Lansiraj v0.1. Implement them in `src/styles/globals.css` using Tailwind CSS v4 theme variables and semantic CSS custom properties. After implementation, code becomes the executable source of truth and this file must stay synchronized.

## How to Use

- Components consume semantic tokens, not raw hex values.
- Do not introduce new colours, radii, shadows, or z-index values inside feature files.
- Marketing may use expressive brand tokens; product UI defaults to semantic surface/status tokens.
- Verify contrast in the actual component state before release.

## Core Brand Tokens

| Token | Value | Role |
| --- | --- | --- |
| `ink` | `#111111` | Primary text, borders, dark surfaces. |
| `canvas` | `#F6F0E4` | Warm page background and reading surface. |
| `launch` | `#FFD600` | Masterbrand field and primary CTA. |
| `cobalt` | `#4050FF` | Active digital state, links, submitted/on-review. |
| `coral` | `#FF5A3D` | Revision-required intervention. |
| `acid` | `#CFFF3F` | Approved proof checkpoint only. |
| `white` | `#FFFFFF` | Clean product surfaces and text on dark/cobalt. |

## Neutral and Semantic Tokens

Use a small neutral set derived for product clarity:

```css
:root {
  --surface-page: #f6f0e4;
  --surface-card: #ffffff;
  --surface-subtle: #eee8dc;
  --surface-inverse: #111111;
  --surface-paper: #f6f0e4;
  --surface-reading: #ffffff;

  --text-primary: #111111;
  --text-secondary: #4e4b45;
  --text-muted: #706c64;
  --text-inverse: #ffffff;

  --border-default: #c9c1b3;
  --border-strong: #111111;
  --border-subtle: #ddd5c8;

  --action-primary: #ffd600;
  --action-active: #4050ff;
  --state-submitted: #4050ff;
  --state-revision: #ff5a3d;
  --state-approved: #cfff3f;
  --state-locked: #706c64;
}
```

Do not use `acid`, `coral`, or `launch` as body-text colours. Use Ink text on those light/bright fields. Use white text on Ink and Cobalt.

## Tailwind v4 Theme Skeleton

```css
@import "tailwindcss";

@theme {
  --font-display: "Unbounded", Arial, sans-serif;
  --font-sans: "Onest", Arial, sans-serif;

  --color-ink: #111111;
  --color-canvas: #f6f0e4;
  --color-launch: #ffd600;
  --color-cobalt: #4050ff;
  --color-coral: #ff5a3d;
  --color-acid: #cfff3f;
  --color-white: #ffffff;

  --color-stone-100: #eee8dc;
  --color-stone-200: #ddd5c8;
  --color-stone-300: #c9c1b3;
  --color-stone-600: #706c64;
  --color-stone-700: #4e4b45;

  --radius-sm: 0.375rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;

  --shadow-overlay: 0 16px 40px rgb(17 17 17 / 0.16);
  --shadow-artifact: 0.5rem 0.5rem 0 var(--color-ink);

  --animate-checkpoint: checkpoint-lock 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes checkpoint-lock {
  from { transform: translate(3px, -3px); opacity: 0.65; }
  to { transform: translate(0, 0); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Adjust syntax only to match the installed Tailwind major version; preserve semantic names and values.

## Typography Scale

| Role | Mobile | Desktop | Weight | Line height | Font |
| --- | --- | --- | --- | --- | --- |
| Marketing hero | `clamp(2.625rem, 8vw, 5.5rem)` | fluid | 600 | 0.94–1.0 | Unbounded |
| Product H1 | `2rem` | `2.75rem` | 600 | 1.05–1.15 | Unbounded |
| H2 | `1.625rem` | `2rem` | 550–600 | 1.15–1.25 | Unbounded |
| H3 | `1.25rem` | `1.375rem` | 600 | 1.25 | Onest |
| Body large | `1.125rem` | `1.1875rem` | 400 | 1.6 | Onest |
| Body/UI | `1rem` | `1rem` | 400–500 | 1.55 | Onest |
| Small/meta | `0.8125rem` | `0.875rem` | 500 | 1.4 | Onest |
| Label | `0.75rem` | `0.8125rem` | 600 | 1.3 | Onest |

Use uppercase only for short stage/status labels and add modest letter spacing. Technical metadata uses tabular numerals.

## Spacing

Use the Tailwind base spacing scale. Prefer these semantic rhythms:

| Role | Token/value |
| --- | --- |
| Inline icon gap | `0.5rem` |
| Compact control gap | `0.75rem` |
| Field internal/stack gap | `1rem` |
| Card padding mobile | `1rem` |
| Card padding desktop | `1.5rem` |
| Section block gap product | `2rem`–`3rem` |
| Section padding marketing | `clamp(4rem, 9vw, 8rem)` |
| Product page top/bottom | `2rem` mobile / `3rem` desktop |

Do not create arbitrary spacing values when an existing scale value is within 2 px of the design need.

## Layout Tokens

```css
:root {
  --container-public: 80rem;
  --container-product: 72rem;
  --container-reading: 46rem;
  --container-artifact: 34rem;
  --gutter-mobile: 1rem;
  --gutter-tablet: 1.5rem;
  --gutter-desktop: 2rem;
  --nav-height: 4rem;
}
```

- Minimum interactive target: 44×44 px.
- Product two-column layout: flexible main column plus context rail of approximately 18–22rem.
- Collapse to one column before either column becomes cramped; do not preserve desktop rails on narrow tablets.

## Borders, Radius, and Shadow

- Default product border: 1 px `border-default`.
- Strong/artifact border: 2 px Ink.
- Focus ring: 3 px Cobalt with 2 px Canvas/white offset as needed.
- Small controls: `radius-sm`; cards/inputs: `radius-md`; dialogs: `radius-lg`.
- Avoid full pill radius except compact statuses where the text remains readable.
- Cards are flat by default. Use `shadow-overlay` only for modal/popover elevation.
- Marketing proof layers may use a 4–8 px offset, but product forms may not.

## Z-Index

```text
base: 0
sticky: 20
dropdown/popover: 40
overlay: 60
modal: 70
toast: 80
```

Do not add arbitrary `z-[9999]` values.

## Component Recipes

Class recipes are illustrative; adapt utilities to the installed Tailwind syntax without changing token semantics.

### Product Card

```text
rounded-md border border-stone-300 bg-white p-4 text-ink md:p-6
```

### Marketing Artifact

```text
relative border-2 border-ink bg-white p-4 after:absolute after:inset-0
after:-z-10 after:translate-x-2 after:translate-y-2 after:bg-launch
```

### Primary Button

```text
inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border-2
border-ink bg-launch px-5 py-2.5 font-semibold text-ink
transition-transform hover:-translate-y-0.5 active:translate-y-0
focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cobalt
disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none
```

### Secondary Button

```text
inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border-2
border-ink bg-transparent px-5 py-2.5 font-semibold text-ink
hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cobalt
```

### Input / Textarea

```text
w-full rounded-md border border-stone-300 bg-white px-3.5 py-3 text-ink
placeholder:text-stone-600 focus:border-cobalt focus:outline-none focus:ring-3
focus:ring-cobalt/20 disabled:bg-stone-100 disabled:text-stone-600
aria-invalid:border-coral aria-invalid:ring-coral/20
```

### Status Tokens

| State | Surface | Border/marker | Text |
| --- | --- | --- | --- |
| Available/draft | White/Canvas | Ink/stone open frame | Ink |
| Submitted | Cobalt at low tint or Cobalt field | Cobalt pause marker | Ink on tint / white on full Cobalt |
| Revision required | Coral at low tint | Coral return marker | Ink |
| Approved | Acid | Ink filled checkpoint | Ink |
| Locked | Stone 100 | Stone 300 closed checkpoint | Stone 700 |

### Feedback Panels

- Approval: white/canvas panel, Ink border, small Acid offset checkpoint, clear next action.
- Revision: white/canvas panel, Coral left/top rule, one priority correction first, criteria below.
- Never fill long feedback bodies with a saturated state colour.

### Journey Checkpoint

- Size: 20 px compact, 28 px primary.
- Default: Ink outline on Canvas/white.
- Approved: Acid fill with Ink outline.
- Submitted: Cobalt pause mark.
- Revision: Coral return/corner mark.
- Locked: Stone outline plus readable locked label.

## Motion Tokens

```css
:root {
  --duration-fast: 160ms;
  --duration-base: 220ms;
  --duration-stage: 520ms;
  --stagger-step: 60ms;
  --ease-standard: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
}
```

- Button press feedback: `fast`, transform only; hover lift is gated to fine pointers.
- Evidence row add/remove and checkpoint state: `base`, opacity and transform only.
- Marketing artifact/story reveal: `stage`, one time, with `stagger-step`; interaction is never delayed.
- `Reveal` defaults content to visible so missing JavaScript or IntersectionObserver cannot hide it.
- Reduced motion removes transforms, long transitions, and stagger while preserving immediate state feedback.
- No infinite ambient animations in product UI.

## Accessibility Invariants

- Ink on Yellow, Canvas, white, and Acid; white on Ink and Cobalt.
- Validate Coral combinations before use; default to Ink text with Coral as border/marker.
- Focus is visible on every interactive element.
- State always has text or icon plus accessible label, not colour alone.
- Respect reduced motion.
- Touch target minimum is 44×44 px.
- Error messages are programmatically associated with fields.
- Long URLs and Macedonian text wrap without horizontal overflow.

## Token Invariants

- Do not add a generic purple primary colour from an unrelated template.
- Do not use gradients as the default brand treatment.
- Do not use green for general success; Acid means accepted proof specifically.
- Do not use Coral for generic destructive actions or decoration.
- Do not make every component rounded, elevated, or pill-shaped.
- Do not duplicate these tokens in feature-local CSS.

# Component Library — Static Landing Page

**Status:** Shipped (this is the system actually deployed at [plug.vln.gg](https://plug.vln.gg))
**Scope:** `landing.html` + `public/styles/` + `public/icons/sprite.svg` + `public/scripts/landing.js`
**Stack:** Plain HTML + CSS + vanilla JS. No frameworks, no build step required for the page itself — fully GitHub Pages compatible.

> The other documents in this folder (`design-system.md`, `DESIGN_SYSTEM.md`,
> `wireframes.md`) describe the earlier React/map-app concept. **This document is
> the authoritative reference for the static landing page design system.**

---

## File Layout

```
landing.html                  Page markup (copied to dist/index.html at build)
public/
├── styles/
│   ├── tokens.css            Design tokens: color, type, spacing, radius, motion
│   ├── components.css        Reusable components (header, nav, footer, cards…)
│   └── landing.css           Page-specific layout composition only
├── icons/
│   └── sprite.svg            SVG icon sprite (24×24 stroke icons)
└── scripts/
    └── landing.js            Search / filter / detail-panel / nav behavior
```

Everything in `public/` is copied verbatim to the deployed site root by Vite,
so `landing.html` references them relatively (`styles/…`, `icons/…`, `scripts/…`).

**Rule of thumb when extending:** if a style could appear on a second page, it
belongs in `components.css`; if it is a one-off composition, it goes in a
page-level stylesheet like `landing.css`. Raw values (hex colors, px sizes)
never appear outside `tokens.css`.

---

## Color Palette — WCAG 2.1 Graded

Every text/background pair was measured with the WCAG relative-luminance
formula. Grades: **AAA** ≥ 7:1 · **AA** ≥ 4.5:1 · **AA-large/UI** ≥ 3:1.

### Ink on light surfaces (`--surface` #FFFFFF / `--surface-alt` #F8FAFC)

| Token | Hex | Contrast on white | Grade |
|---|---|---|---|
| `--ink-primary` | `#0F172A` | 17.85:1 | **AAA** |
| `--ink-secondary` | `#334155` | 10.35:1 | **AAA** |
| `--ink-muted` | `#64748B` | 4.76:1 (4.55:1 on `--surface-alt`) | **AA** |
| `--action` (links, buttons) | `#1D4ED8` | 6.70:1 | **AA** |

### Ink on dark surface (`--surface-invert` #0F172A — footer)

| Token | Hex | Contrast on `#0F172A` | Grade |
|---|---|---|---|
| `--ink-on-invert` | `#FFFFFF` | 17.85:1 | **AAA** |
| `--ink-on-invert-soft` | `#CBD5E1` | 12.02:1 | **AAA** |
| `--ink-on-invert-muted` | `#94A3B8` | 6.96:1 | **AA** — dark surfaces only; fails (2.56:1) on white |

### Interactive fills (white text on fill)

| Token | Hex | White-on-fill | Grade |
|---|---|---|---|
| `--action` | `#1D4ED8` | 6.70:1 | **AA** |
| `--action-hover` | `#1E40AF` | 8.72:1 | **AAA** |
| `--status-verified` | `#047857` | 5.48:1 | **AA** |
| `--status-community` | `#B45309` | 5.02:1 | **AA** |
| `--status-recheck` | `#B91C1C` | 6.47:1 | **AA** |

### Tinted status badges (dark ink on pale fill)

| Pair | Contrast | Grade |
|---|---|---|
| `#065F46` on `#ECFDF5` (verified) | 7.29:1 | **AAA** |
| `#92400E` on `#FFFBEB` (community) | 6.84:1 | **AA** |
| `#991B1B` on `#FEF2F2` (recheck) | 7.60:1 | **AAA** |

### Non-text UI

| Token | Purpose | Note |
|---|---|---|
| `--border` `#E2E8F0` | decorative separators | exempt from contrast minimums |
| `--border-input` `#64748B` | form control borders | 4.76:1 vs white — exceeds 3:1 UI minimum |
| `--focus-ring` `#2563EB` | `:focus-visible` outline | 5.17:1 vs white |

To re-verify after palette changes, recompute with any WCAG contrast checker
(the grades above were generated with the standard relative-luminance formula
from WCAG 2.1 §1.4.3/§1.4.11).

---

## Breakpoints (mobile-first)

Base styles target small screens; media queries only add enhancements.

| Name | Width | What changes |
|---|---|---|
| base | 0–639px | Single column. Nav collapses behind hamburger. Search stacks. Full-width buttons. |
| `sm` | `40rem` / 640px | Hero features go 3-up. Search bar becomes one row. Footer 2 columns. |
| `md` | `48rem` / 768px | Nav expands inline, hamburger hidden. Wider container padding. |
| `lg` | `64rem` / 1024px | Two-pane layout (list + sticky detail panel). Hero splits. Footer 3 columns. |
| `xl` | `80rem` / 1280px | Content capped at `--container-max` (75rem), centered. |

Media queries use `rem` so breakpoints respect user font-size settings.
CSS custom properties can't be used inside media queries — the values are
documented in `tokens.css` and must be kept in sync manually.

---

## Iconography

All icons are inline SVG referenced from the sprite — **no emojis, ever**.
Icons are 24×24, stroke-based (2px, round caps/joins), and inherit
`currentColor`.

```html
<!-- decorative icon -->
<svg class="icon" aria-hidden="true"><use href="icons/sprite.svg#bolt"/></svg>

<!-- sizes -->
<svg class="icon icon--sm" …>   <!-- 1em -->
<svg class="icon" …>            <!-- 1.25em (default) -->
<svg class="icon icon--lg" …>   <!-- 1.75em -->
```

Available symbols: `plug` `bolt` `pin` `lock` `shield-check` `clock` `free`
`home` `tree` `accessibility` `usb` `check` `check-circle` `alert` `users`
`search` `locate` `github` `wifi` `info` `arrow-right` `menu` `close`

**Adding an icon:** append a `<symbol id="name" viewBox="0 0 24 24">` to
`public/icons/sprite.svg` using `fill="none"` stroke geometry, then list it
here. Note: `<use href>` requires the page to be served over HTTP (GitHub
Pages, `npm run dev`, `npm run preview`) — sprites don't resolve from `file://`.

---

## Components

### Navigation (`.site-header` / `.site-nav`)

Sticky header with brand, hamburger toggle (mobile), and inline nav (≥768px).
The toggle is a real `<button>` with `aria-expanded` + `aria-controls`;
`landing.js` flips the state and the `.is-open` class.

```html
<header class="site-header">
  <div class="container">
    <div class="site-header__inner">
      <a href="#" class="site-header__brand">…</a>
      <button class="site-header__toggle" aria-expanded="false" aria-controls="site-nav">…</button>
      <nav class="site-nav" id="site-nav" aria-label="Primary">…</nav>
    </div>
  </div>
</header>
```

### Footer (`.site-footer`)

Dark, multi-column (1 → 2 → 3 columns across breakpoints) with brand,
link groups (`.site-footer__links`), and a legal strip (`.site-footer__legal`).

### Cards (`.card`)

- `.card` — base container (surface, border, radius, shadow)
- `.card--interactive` — whole-card `<button>`; hover elevation, selected
  state via `aria-current="true"` (styled, not just semantic)
- Sub-elements: `.card__header`, `.card__title`, `.card__meta`,
  `.card__footnote`, plus `.amenity-list` / `.amenity` tags

### Badges (`.badge`)

Status labels in two variants: tinted (default, AAA/AA dark-on-pale) and
`.badge--solid` (white-on-color, AA). Status modifiers: `--verified`,
`--community`, `--recheck`.

### Buttons (`.btn`)

`--primary` (action blue), `--secondary` (outlined), `--block`
(full-width on mobile, auto ≥640px).

### Filter chips (`.chip`)

Toggleable filters as real `<button>`s carrying `aria-pressed`;
pressed state restyles to action blue. `landing.js` reads
`data-filter` attributes — no text parsing.

### Forms (`.field`, `.field-label`)

Inputs with ≥3:1 borders and visible `:focus-visible` rings.

### Tables (`.table` in `.table-scroll`)

Data tables scroll horizontally inside their wrapper instead of
breaking the page layout on small screens.

### Utilities

`.container`, `.skip-link`, `.visually-hidden`, `.text-muted`,
`.text-secondary`.

---

## Accessibility checklist (current state)

- [x] All text color pairs AA or better (most AAA) — see graded matrix
- [x] Single consistent `:focus-visible` treatment
- [x] Skip link to `#main`
- [x] Interactive elements are native `<button>`/`<a>` (no clickable divs)
- [x] Filter state exposed via `aria-pressed`; selection via `aria-current`
- [x] Result count announced via `aria-live="polite"` (replaces `alert()`)
- [x] Icons decorative by default (`aria-hidden`); meaningful groups labelled
- [x] `prefers-reduced-motion` respected globally
- [x] `rem`-based breakpoints and type scale

---

## Next steps (advisory)

1. **Wire the map app into the design system** — the React app
   (`src/`) still ships its own styles; migrate it onto `tokens.css` so the
   landing page and app share one palette.
2. **Dark mode** — tokens are structured for a `prefers-color-scheme: dark`
   override block; the inverse-surface tokens already exist.
3. **Real "Suggest a place" flow** — `#suggest` currently lands on the About
   section; replace with a GitHub Issue template link or form.
4. **Consolidate legacy design docs** — retire `design-system.md` /
   `DESIGN_SYSTEM.md` (brand-red concept) or mark them historical.
5. **Add a CI a11y check** — e.g. `pa11y-ci` or Lighthouse CI against the
   built `dist/` to keep contrast and ARIA regressions out.
6. **Componentize with includes** — if more pages appear, consider a tiny
   static templating step (e.g. eleventy) so header/footer markup isn't
   copy-pasted between pages.

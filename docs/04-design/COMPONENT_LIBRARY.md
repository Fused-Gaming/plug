# Component Library — Static Landing Page

**Status:** Shipped (this is the system actually deployed at [plug.vln.gg](https://plug.vln.gg))
**Scope:** `landing.html` + `public/styles/` + `public/icons/sprite.svg` + `public/scripts/landing.js`
**Stack:** Plain HTML + CSS + vanilla JS. No frameworks, no build step required for the page itself — fully GitHub Pages compatible.

> The other documents in this folder (`design-system.md`, `DESIGN_SYSTEM.md`,
> `wireframes.md`) describe the earlier React/map-app concept. **This document is
> the authoritative reference for the static landing page design system.**

---

## Design direction: "community field guide"

The page is styled like something a neighborhood group would print and
photocopy, not a SaaS template: warm paper background, bookish serif display
type, a marker-pen highlight in the hero, a postage-stamp region label,
dashed "ticket" filter chips, letterpress-style buttons with a hard offset
shadow, and status-colored spines on location cards (like tabbed folders).

All type is system-resident (`Iowan Old Style / Palatino / Georgia` for
display, system sans for UI) — zero font downloads, zero third-party
requests, so the page's privacy claims stay literally true.

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

### Ink on light surfaces (`--surface` #FFFFFF / `--surface-alt` #FAF6EF paper)

| Token | Hex | On white | On paper | Grade |
|---|---|---|---|---|
| `--ink-primary` | `#1C1917` | 17.49:1 | 16.23:1 | **AAA** |
| `--ink-secondary` | `#44403C` | 10.27:1 | 9.54:1 | **AAA** |
| `--ink-muted` | `#57534E` | 7.63:1 | 7.08:1 | **AAA** |
| `--action` (links, buttons) | `#9A3412` | 7.31:1 | 6.78:1 | **AAA** / AA |

### Ink on dark surface (`--surface-invert` #1C1917 — footer)

| Token | Hex | Contrast | Grade |
|---|---|---|---|
| `--ink-on-invert` | `#FFFFFF` | 17.49:1 | **AAA** |
| `--ink-on-invert-soft` | `#D6D3D1` | 11.74:1 | **AAA** |
| `--ink-on-invert-muted` | `#A8A29E` | 6.93:1 | **AA** — dark surfaces only |

### Interactive fills (white text on fill)

| Token | Hex | White-on-fill | Grade |
|---|---|---|---|
| `--action` | `#9A3412` | 7.31:1 | **AAA** |
| `--action-hover` | `#7C2D12` | 9.37:1 | **AAA** |
| `--status-verified` | `#047857` | 5.48:1 | **AA** |
| `--status-community` | `#B45309` | 5.02:1 | **AA** |
| `--status-recheck` | `#B91C1C` | 6.47:1 | **AA** |

### Tinted status badges (dark ink on pale fill)

| Pair | Contrast | Grade |
|---|---|---|
| `#065F46` on `#ECFDF5` (verified) | 7.29:1 | **AAA** |
| `#92400E` on `#FFFBEB` (community) | 6.84:1 | **AA** |
| `#991B1B` on `#FEF2F2` (recheck) | 7.60:1 | **AAA** |

### Voltage accents (decorative only — never body text)

| Token | Hex | Use |
|---|---|---|
| `--volt` | `#D97706` | bolt strokes, small accents |
| `--volt-bright` | `#FBBF24` | bolt fills, header/footer "live wire" stripe |
| `--highlight` | `#FDE68A` | marker-pen highlight (ink on it: 14.04:1 AAA) |

### Non-text UI

| Token | Purpose | Note |
|---|---|---|
| `--border` `#E7E0D2` | decorative separators | exempt from contrast minimums |
| `--border-input` `#78716C` | form control borders | 4.80:1 vs white — exceeds 3:1 UI minimum |
| `--focus-ring` `#9A3412` | `:focus-visible` outline | 7.31:1 vs white |

To re-verify after palette changes, recompute with any WCAG contrast checker
(the grades above were generated with the standard relative-luminance formula
from WCAG 2.1 §1.4.3/§1.4.11).

---

## Breakpoints (mobile-first)

Base styles target small screens; media queries only add enhancements.
The content gutter is a token (`--container-pad`): 1.25rem on mobile,
widening to 2rem at ≥768px — nothing ever sits flush against a viewport edge.

| Name | Width | What changes |
|---|---|---|
| base | 0–639px | Single column. Nav collapses behind hamburger. Search stacks. Full-width buttons. Verification table stacks into labelled blocks. |
| `sm` | `40rem` / 640px | Hero features go 3-up. Search bar becomes one row. Table renders as a table. Footer 2 columns. |
| `md` | `48rem` / 768px | Nav expands inline, hamburger hidden. Gutter widens to 2rem. |
| `lg` | `64rem` / 1024px | Two-pane layout (list + sticky detail panel). Hero splits. Footer 3 columns. |
| `xl` | `80rem` / 1280px | Content capped at `--container-max` (72rem), centered. |

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

<!-- amber-filled voltage variant (hero bolts) -->
<svg class="icon icon--volt" …>
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

Sticky header with an amber "live wire" top stripe, serif brand, hamburger
toggle (mobile), and inline nav (≥768px). The toggle is a real `<button>`
with `aria-expanded` + `aria-controls`; `landing.js` flips the state and the
`.is-open` class.

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

Warm-black, multi-column (1 → 2 → 3 columns across breakpoints) with the
amber stripe, brand, link groups (`.site-footer__links`), and a legal strip.

### Cards (`.card`)

- `.card` — base container (surface, border, radius, shadow)
- `.card--interactive` — whole-card `<button>`; hover lift, selected state
  via `aria-current="true"` (amber-tinted)
- `.card--verified` / `.card--community` / `.card--recheck` — status-colored
  left spine
- Sub-elements: `.card__header`, `.card__title` (serif), `.card__meta`,
  `.card__footnote` (dash-ruled), plus `.amenity-list` / `.amenity` tags

### Badges (`.badge`)

Status labels in two variants: tinted (default, AAA/AA dark-on-pale) and
`.badge--solid` (white-on-color, AA). Status modifiers: `--verified`,
`--community`, `--recheck`.

### Buttons (`.btn`)

`--primary` (burnt orange, 2px ink border, hard offset shadow that presses
down on `:active`), `--secondary` (outlined), `--block` (full-width on
mobile, auto ≥640px).

### Filter chips (`.chip`)

Dashed-border "tickets" as real `<button>`s carrying `aria-pressed`;
pressing inks them solid. `landing.js` reads `data-filter` attributes —
no text parsing.

### Print-shop accents

- `.overline` — small-caps kicker above headings
- `.highlight` — marker-pen emphasis (skewed amber gradient, AAA ink)
- `.stamp` — postage-stamp label (double border, slight rotation)

### Forms (`.field`, `.field-label`)

2px inputs with ≥3:1 borders and visible `:focus-visible` rings.

### Tables (`.table`, `.table--stack`)

`.table--stack` collapses rows into labelled blocks below 640px — every
`<td>` needs a `data-label` attribute. Use `.table-scroll` as a wrapper for
wide tables that must stay tabular.

---

## Accessibility checklist (current state)

- [x] All text color pairs AA or better (most AAA) — see graded matrix
- [x] Single consistent `:focus-visible` treatment
- [x] Skip link to `#main`
- [x] Interactive elements are native `<button>`/`<a>` (no clickable divs)
- [x] Filter state exposed via `aria-pressed`; selection via `aria-current`
- [x] Result count announced via `aria-live="polite"` (replaces `alert()`)
- [x] Icons decorative by default (`aria-hidden`); meaningful groups labelled
- [x] Verification table stacks on mobile instead of clipping/scrolling
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

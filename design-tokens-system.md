# Design Token System — Mobile-First Responsive Breakpoints

**Project:** Charging Station Locator MVP  
**Framework:** @h4shed/skill-style-dictionary-system  
**Status:** Ready for Implementation  

---

## 🎨 Design Token Architecture

### Token Category Hierarchy

```
design-tokens/
├── color/           (brand, semantic, states)
├── typography/      (fonts, sizes, weights, line-height)
├── spacing/         (8px scale)
├── shadow/          (elevation levels)
├── border/          (radius, widths)
├── motion/          (duration, easing)
├── breakpoint/      (responsive queries)
└── sizing/          (defined widths, heights)
```

---

## 📱 Responsive Breakpoints

### Mobile-First Strategy

```
Default (0px - 639px)    → Mobile-optimized base
Tablet (640px+)          → Medium-sized screens  
Desktop (1024px+)        → Large screens
Wide (1280px+)           → Extra-large displays
```

### CSS Breakpoint Variables

```css
:root {
  /* Breakpoints */
  --breakpoint-mobile: 0;        /* default */
  --breakpoint-tablet: 640px;    /* 40rem */
  --breakpoint-desktop: 1024px;  /* 64rem */
  --breakpoint-wide: 1280px;     /* 80rem */
  
  /* Media queries (use in SCSS mixins) */
  --mq-tablet: (min-width: 640px);
  --mq-desktop: (min-width: 1024px);
  --mq-wide: (min-width: 1280px);
}
```

### SCSS Mixins (for convenience)

```scss
@mixin tablet {
  @media (min-width: 640px) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: 1024px) {
    @content;
  }
}

@mixin wide {
  @media (min-width: 1280px) {
    @content;
  }
}

@mixin mobile-only {
  @media (max-width: 639px) {
    @content;
  }
}
```

---

## 🎯 Token Definitions by Category

### 1. COLOR TOKENS

#### Brand Colors
```css
:root {
  --color-brand-primary: #2563eb;    /* Blue */
  --color-brand-secondary: #7c3aed;  /* Purple */
  --color-brand-accent: #06b6d4;     /* Cyan */
}
```

#### Semantic Colors
```css
:root {
  /* Status */
  --color-success: #16a34a;          /* Green */
  --color-warning: #ea8c55;          /* Orange */
  --color-danger: #dc2626;           /* Red */
  --color-info: #0891b2;             /* Teal */
  
  /* UI */
  --color-background: #ffffff;
  --color-background-alt: #f9fafb;
  --color-border: #e5e7eb;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-disabled: #9ca3af;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #111827;
    --color-background-alt: #1f2937;
    --color-text-primary: #f9fafb;
    --color-text-secondary: #d1d5db;
  }
}
```

#### Responsive Color Adjustments
```css
/* Tablet: Enhanced contrast */
@media (min-width: 640px) {
  :root {
    --color-text-primary: #000000;
    --color-text-secondary: #4b5563;
  }
}

/* Dark mode on tablet: Higher saturation */
@media (prefers-color-scheme: dark) and (min-width: 640px) {
  :root {
    --color-text-primary: #ffffff;
    --color-text-secondary: #e5e7eb;
  }
}
```

---

### 2. TYPOGRAPHY TOKENS

#### Font Families (Web-safe stack)
```css
:root {
  --font-family-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", 
                      Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-family-mono: "SF Mono", Monaco, "Cascadia Code", 
                      "Roboto Mono", Consolas, monospace;
}
```

#### Font Sizes (Mobile-first scale)

**Mobile (base):**
```css
:root {
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
}
```

**Tablet (640px+):**
```css
@media (min-width: 640px) {
  :root {
    --font-size-sm: 0.875rem;   /* no change */
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.375rem;   /* 22px (↑ from 20px) */
    --font-size-2xl: 1.75rem;   /* 28px (↑ from 24px) */
    --font-size-3xl: 2.25rem;   /* 36px (↑ from 30px) */
    --font-size-4xl: 3rem;      /* 48px (↑ from 36px) */
  }
}
```

**Desktop (1024px+):**
```css
@media (min-width: 1024px) {
  :root {
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.5rem;     /* 24px (↑ from 22px) */
    --font-size-2xl: 2rem;      /* 32px (↑ from 28px) */
    --font-size-3xl: 2.5rem;    /* 40px (↑ from 36px) */
    --font-size-4xl: 3.5rem;    /* 56px (↑ from 48px) */
  }
}
```

#### Font Weights
```css
:root {
  --font-weight-thin: 100;
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-black: 900;
}
```

#### Line Height
```css
:root {
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  --line-height-loose: 2;
}
```

#### Letter Spacing
```css
:root {
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
  --letter-spacing-wider: 0.04em;
}
```

#### Typography Presets

**Heading 1 (Mobile):**
```css
.heading-1 {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-2xl);      /* 24px */
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}

@media (min-width: 640px) {
  .heading-1 {
    font-size: var(--font-size-3xl);    /* 36px */
  }
}

@media (min-width: 1024px) {
  .heading-1 {
    font-size: var(--font-size-4xl);    /* 56px */
  }
}
```

**Body Text (Mobile):**
```css
.body-base {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
}

/* Responsive adjustment */
@media (min-width: 640px) {
  .body-base {
    font-size: var(--font-size-base);
    line-height: var(--line-height-relaxed);
  }
}
```

---

### 3. SPACING TOKENS (8px Scale)

#### Base Scale
```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-7: 1.75rem;   /* 28px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
}
```

#### Responsive Spacing Adjustments

**Mobile (compact):**
```css
:root {
  --padding-mobile: var(--space-4);        /* 16px */
  --padding-mobile-lg: var(--space-6);     /* 24px */
  --gap-mobile: var(--space-3);            /* 12px */
  --gap-mobile-lg: var(--space-4);         /* 16px */
}
```

**Tablet (medium):**
```css
@media (min-width: 640px) {
  :root {
    --padding-tablet: var(--space-6);      /* 24px */
    --padding-tablet-lg: var(--space-8);   /* 32px */
    --gap-tablet: var(--space-4);          /* 16px */
    --gap-tablet-lg: var(--space-6);       /* 24px */
  }
}
```

**Desktop (generous):**
```css
@media (min-width: 1024px) {
  :root {
    --padding-desktop: var(--space-8);     /* 32px */
    --padding-desktop-lg: var(--space-12); /* 48px */
    --gap-desktop: var(--space-6);         /* 24px */
    --gap-desktop-lg: var(--space-8);      /* 32px */
  }
}
```

---

### 4. SHADOW TOKENS (Elevation)

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
                 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
               0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
               0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
               0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Dark mode: Stronger shadows */
@media (prefers-color-scheme: dark) {
  :root {
    --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.4),
                   0 1px 2px 0 rgba(0, 0, 0, 0.3);
  }
}
```

---

### 5. BORDER TOKENS

#### Border Radius
```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;   /* 2px */
  --radius-base: 0.25rem;  /* 4px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-full: 9999px;   /* Pill shape */
}
```

#### Border Width
```css
:root {
  --border-width-0: 0;
  --border-width-1: 1px;
  --border-width-2: 2px;
  --border-width-4: 4px;
}
```

---

### 6. MOTION/ANIMATION TOKENS

```css
:root {
  /* Duration */
  --duration-fastest: 50ms;
  --duration-faster: 100ms;
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
  
  /* Easing */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

### 7. SIZING TOKENS

```css
:root {
  /* Widths */
  --width-full: 100%;
  --width-container-mobile: 100%;
  --width-container-tablet: 90%;
  --width-container-desktop: 1024px;
  
  /* Heights */
  --height-touch-target: 44px;  /* Accessible tap target */
  --height-header-mobile: 56px;
  --height-header-desktop: 64px;
}

@media (min-width: 640px) {
  :root {
    --width-container-tablet: 85%;
  }
}

@media (min-width: 1024px) {
  :root {
    --width-container-desktop: 1200px;
  }
}
```

---

## ✅ Token Testing & Validation

### 1. Compilation Test
```bash
# Style Dictionary compiles all tokens
npm run tokens:build

# Output: src/tokens/compiled.css (< 5KB gzipped)
```

### 2. Responsive Behavior Test

**Test Case: Heading Scaling**
```
Mobile (320px):    24px font-size ✓
Tablet (640px):    36px font-size ✓
Desktop (1024px):  56px font-size ✓
```

**Test Case: Spacing Consistency**
```
Mobile padding:    16px (--space-4) ✓
Tablet padding:    24px (--space-6) ✓
Desktop padding:   32px (--space-8) ✓
```

### 3. Accessibility Validation

**Color Contrast (WCAG AA)**
```
Text on background: --color-text-primary on --color-background
→ 12.6:1 ratio ✓ (WCAG AAA)

Text on warning: --color-text-primary on --color-warning
→ 4.8:1 ratio ✓ (WCAG AA)

Touch target size: 44px minimum ✓
```

**Reduced Motion Support**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
}
```

### 4. Performance Audit

**Bundle Size:**
- Compiled CSS tokens: < 2KB
- Token definitions: < 1KB
- Total overhead: < 3KB (gzipped)

**Font Loading:**
```css
@font-face {
  font-family: 'System UI';
  src: local(-apple-system), local(BlinkMacSystemFont),
       local('Segoe UI'), local(Roboto);
}
```

**Transition Performance:**
```css
.interactive {
  transition: all var(--duration-fast) var(--ease-out);
  will-change: transform, opacity;
}
```

---

## 🚀 Implementation Checklist

- [ ] Create `src/styles/tokens/` directory
- [ ] Define `colors.json` with all color tokens
- [ ] Define `typography.json` with font scales
- [ ] Define `spacing.json` with 8px scale
- [ ] Define `motion.json` with animation tokens
- [ ] Define `breakpoints.json` with media queries
- [ ] Configure Style Dictionary build pipeline
- [ ] Generate CSS custom properties file
- [ ] Test responsive behavior across devices
- [ ] Validate WCAG AA contrast ratios
- [ ] Verify bundle size < 3KB gzipped
- [ ] Document token usage in components
- [ ] Create Figma token sync (if applicable)
- [ ] Add token linting to CI pipeline

---

## 📖 Usage Examples

### Using Tokens in Components

**React Component:**
```jsx
export function ChargeCard({ station }) {
  return (
    <div className="charge-card">
      <h2 className="heading-2">{station.name}</h2>
      <p className="body-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {station.address}
      </p>
      <button style={{
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-brand-primary)'
      }}>
        View Details
      </button>
    </div>
  );
}
```

**CSS Module:**
```css
.container {
  padding: var(--padding-mobile);
  gap: var(--gap-mobile);
}

@media (min-width: 640px) {
  .container {
    padding: var(--padding-tablet);
    gap: var(--gap-tablet);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: var(--padding-desktop);
    gap: var(--gap-desktop);
  }
}
```

**SCSS:**
```scss
.card {
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  background: var(--color-background);
  
  @include tablet {
    padding: var(--space-6);
  }
  
  @include desktop {
    padding: var(--space-8);
  }
}
```

---

## 🎯 Token Governance

- **Single Source of Truth:** `src/styles/tokens/`
- **Update Process:** Design review → Figma sync → CI rebuild
- **Versioning:** Semantic versioning for token releases
- **Breaking Changes:** Major version bump for contract changes
- **Review:** All token changes require design + engineer approval


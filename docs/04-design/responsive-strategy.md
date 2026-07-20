# Responsive Design Strategy

Mobile-first approach, breakpoints, and layout adaptation.

## Responsive Philosophy

**Mobile-first:** Start with mobile design, then enhance for larger screens.

**Why?**
- Mobile is the primary use case (vulnerable populations often use phones)
- Mobile constraints force clarity
- Easier to progressively enhance than progressively reduce
- Better performance on low-end devices

## Breakpoints

Three strategic breakpoints based on actual device usage:

### Mobile (< 576px)
**Devices:** Phone (320px-575px)

**Layout:** Stacked vertical
```
┌─────────────┐
│    MAP      │  70% height
│   (display) │
├─────────────┤
│    LIST     │  30% height
│ (scrollable)│
└─────────────┘
```

**Design Adjustments:**
- Base font size: 14px (compact)
- Padding: 8px (minimal)
- Map height: 70vh
- List height: 30vh
- Touch targets: 44px (WC AG minimum)

**Example Devices:**
- iPhone SE (375px)
- iPhone 12 (390px)
- Pixel 6 (412px)
- Samsung Galaxy A12 (720px wide but typically used in portrait)

### Tablet (576px - 1023px)
**Devices:** Tablet in portrait or landscape (576px-1023px)

**Layout:** Overlay panels
```
┌──────────────────┐
│                  │
│    MAP (full)    │  100% (with overlay)
│                  │
└──────────────────┐
│  LIST (drawer)   │  40% height (scrollable)
└──────────────────┘
```

**Design Adjustments:**
- Base font size: 15px
- Padding: 12px
- List appears as bottom drawer/overlay
- Map remains fully interactive beneath
- Touch targets: 44px

**Example Devices:**
- iPad mini (768px)
- iPad (834px)
- iPad Pro (1024px in portrait)
- Large phones in landscape

### Desktop (1024px+)
**Devices:** Desktop, laptop, large tablet landscape (1024px+)

**Layout:** Side-by-side split
```
┌─────────────────────────────┐
│  MAP (60%)  │  LIST (40%)   │
│             │               │
│             │  (Scrollable) │
│             │               │
│             │               │
└─────────────────────────────┘
```

**Design Adjustments:**
- Base font size: 16px (default)
- Padding: 16px (comfortable)
- Sidebar on right (40% width, min 400px)
- Map on left (60% width, min 600px)
- Touch targets: 40px (mouse-friendly)

**Example Devices:**
- Desktop monitors (1920x1080+)
- Laptops (1366x768+)
- Large tablets in landscape (1024px+)

## CSS Breakpoint Implementation

```css
/* Mobile-first: base styles apply to all */
.container {
  display: flex;
  flex-direction: column;  /* Stacked */
}

.map {
  height: 70vh;
  width: 100%;
}

.list {
  height: 30vh;
  width: 100%;
  overflow-y: auto;
}

/* Tablet: 576px and up */
@media (min-width: 576px) {
  .container {
    display: flex;
    flex-direction: column;  /* Still stacked */
    position: relative;
  }

  .map {
    height: 100%;
    width: 100%;
  }

  .list {
    position: absolute;
    bottom: 0;
    height: 40%;
    width: 100%;
    /* Now appears as overlay drawer */
  }
}

/* Desktop: 1024px and up */
@media (min-width: 1024px) {
  .container {
    display: flex;
    flex-direction: row;  /* Side-by-side */
  }

  .map {
    width: 60%;
    min-width: 600px;
    height: 100vh;
    position: fixed;
  }

  .list {
    position: static;
    width: 40%;
    margin-left: 60%;
    height: 100vh;
    overflow-y: auto;
  }
}
```

## Responsive Component Behavior

### Map Component
| Breakpoint | Display | Interaction |
|-----------|---------|-------------|
| Mobile | 70% height | Touch to select marker |
| Tablet | Full screen (under overlay) | Touch to select |
| Desktop | 60% width, fixed | Mouse/touch to select |

### LocationList Component
| Breakpoint | Display | Scroll |
|-----------|---------|--------|
| Mobile | 30% height, stacked | Vertical scroll |
| Tablet | 40% height, bottom overlay | Vertical scroll |
| Desktop | 40% width, sidebar | Vertical scroll |

### Detail Card
| Breakpoint | Position | Max Width |
|-----------|----------|-----------|
| Mobile | Map center | 80% width |
| Tablet | Bottom of list | 90% width |
| Desktop | Right sidebar | 100% of sidebar |

## Touch vs. Mouse Interactions

### Mobile (Touch)
- 44px minimum touch target
- Tap to select (single click)
- Drag to pan map
- Pinch to zoom
- Bottom drawer swipe up/down (future)

### Desktop (Mouse)
- 40px minimum click target
- Click to select
- Scroll wheel to zoom
- Hover states for feedback
- Cursor changes (pointer on interactive elements)

## Typography Scaling

```css
/* Mobile */
--font-size-base: 14px;
--font-size-h1: 20px;
--font-size-h2: 18px;

/* Tablet */
@media (min-width: 576px) {
  --font-size-base: 15px;
  --font-size-h1: 22px;
  --font-size-h2: 19px;
}

/* Desktop */
@media (min-width: 1024px) {
  --font-size-base: 16px;
  --font-size-h1: 24px;
  --font-size-h2: 20px;
}
```

## Spacing Responsiveness

```css
/* Base spacing: 4px unit */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 20px;

/* Mobile: Tighter spacing */
.card {
  padding: var(--space-sm);      /* 8px */
  margin-bottom: var(--space-sm); /* 8px */
}

/* Desktop: More generous spacing */
@media (min-width: 1024px) {
  .card {
    padding: var(--space-lg);      /* 16px */
    margin-bottom: var(--space-lg); /* 16px */
  }
}
```

## Testing Responsive Design

### Browser Tools
```javascript
// Chrome DevTools
F12 → Ctrl+Shift+M (device toggle)
```

### Breakpoints to Test
- 320px (small phone)
- 375px (iPhone SE)
- 576px (tablet minimum)
- 768px (iPad)
- 1024px (desktop minimum)
- 1920px (full HD)

### Real Device Testing
```bash
npm run dev
# Access from phone at: http://YOUR_IP:5173
```

### Common Issues

**Issue: Map not full height on mobile**
→ Check that body/html have 100vh height set

**Issue: List overlaps map on tablet**
→ Use z-index or absolute positioning correctly

**Issue: Sidebar too narrow on desktop**
→ Ensure min-width constraints (600px map, 400px list)

## Future Enhancements

### Orientation Changes
```javascript
// Detect orientation change
window.addEventListener('orientationchange', () => {
  // Recalculate layout
})
```

### Landscape Mobile
```css
@media (max-width: 1023px) and (orientation: landscape) {
  .map {
    height: 100vh;
    width: 70%;
  }
  
  .list {
    width: 30%;
    height: 100vh;
  }
}
```

### Folding Devices
```css
/* Support for devices with fold line */
@media (fold-top: 0px) {
  /* Layout for folded phones */
}
```

---

**[← Back to Section](README.md) | [← Back to Index](../INDEX.md)**

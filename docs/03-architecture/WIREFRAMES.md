# Charging Station Locator - UI Wireframes

**Tool:** ASCII Mockup  
**Breakpoints:** Desktop (1024px+), Tablet (768-1023px), Mobile (< 768px)  
**Design Principle:** Map-first, location list adaptive

---

## DESKTOP VIEW (1024px+)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📱 Charging Station Locator                          [Find Free Charging] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────┐  ┌─────────────────────────┐  │
│  │                                      │  │  NEARBY STATIONS        │  │
│  │      Interactive Map View            │  ├─────────────────────────┤  │
│  │      (MapLibre GL)                   │  │ 📍 Location enabled     │  │
│  │                                      │  │    Sorted by distance   │  │
│  │   [Red pins for charging stations]  │  ├─────────────────────────┤  │
│  │                                      │  │ 1. Central Park Visitor │  │
│  │   Center: NYC Pilot Area             │  │    Center               │  │
│  │   Zoom Level: 12                     │  │    📍 0.3 mi away       │  │
│  │                                      │  │    Hours: 9AM - 5PM     │  │
│  │   [Marker Clustering as needed]      │  │                         │  │
│  │                                      │  ├─────────────────────────┤  │
│  │                                      │  │ 2. NYC Public Library   │  │
│  │                                      │  │    42nd Street          │  │
│  │                                      │  │    📍 0.5 mi away       │  │
│  │                                      │  │    Hours: 10AM - 6PM    │  │
│  │                                      │  ├─────────────────────────┤  │
│  │                                      │  │ 3. Grand Central        │  │
│  │                                      │  │    Terminal             │  │
│  │    ┌─────────────────────────────┐  │  │    📍 0.7 mi away       │  │
│  │    │ Clicked Location Details    │  │  │    Hours: 24h (Main)    │  │
│  │    ├─────────────────────────────┤  │  ├─────────────────────────┤  │
│  │    │ Union Square Park Seating   │  │  │ 4. Union Square Park    │  │
│  │    │ 📍 Union Square, NY 10003   │  │  │    Seating              │  │
│  │    │ Hours: 6 AM - midnight      │  │  │    📍 1.1 mi away       │  │
│  │    │ [Close Button]              │  │  │    Hours: 6AM - 12AM    │  │
│  │    └─────────────────────────────┘  │  │                         │  │
│  │                                      │  │ [Scroll for more...]    │  │
│  └──────────────────────────────────────┘  └─────────────────────────┘  │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

Layout: 60% Map | 40% Sidebar List
```

---

## TABLET VIEW (768-1023px)

```
┌─────────────────────────────────────────────────────┐
│ 📱 Charging Station Locator                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  │        Interactive Map View                 │   │
│  │        (MapLibre GL)                        │   │
│  │                                             │   │
│  │     [Red pins for charging stations]       │   │
│  │                                             │   │
│  │     [Detail card overlay on bottom-left]   │   │
│  │                                             │   │
│  │  ┌─────────────────────────────────────┐   │   │
│  │  │ Clicked Location:                   │   │   │
│  │  │ Central Park Visitor Center         │   │   │
│  │  │ 📍 65 E 72nd St, NY 10021          │   │   │
│  │  │ Hours: 9 AM - 5 PM daily           │   │   │
│  │  │ Distance: 0.3 mi                    │   │   │
│  │  │ [Close]                             │   │   │
│  │  └─────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ NEARBY STATIONS                             │   │
│  ├─────────────────────────────────────────────┤   │
│  │ 1. Central Park        0.3 mi   9AM-5PM    │   │
│  │ 2. Public Library      0.5 mi   10AM-6PM   │   │
│  │ 3. Grand Central       0.7 mi   24h        │   │
│  │ 4. Union Square        1.1 mi   6AM-12AM   │   │
│  │ 5. Port Authority      1.3 mi   24h        │   │
│  │ [Scroll for more...]                       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘

Layout: 100% Map with overlay panels
```

---

## MOBILE VIEW (< 768px)

```
┌───────────────────────────────┐
│ 📱 Charging Locator           │
├───────────────────────────────┤
│                               │
│  ┌───────────────────────┐    │
│  │                       │    │
│  │   Map View            │    │
│  │   (MapLibre GL)       │    │
│  │                       │    │
│  │ [Red pins visible]    │    │
│  │                       │    │
│  │                       │    │
│  │  [Touch to expand]    │    │
│  └───────────────────────┘    │
│                               │
├───────────────────────────────┤
│ NEARBY STATIONS               │
├───────────────────────────────┤
│                               │
│ 📍 Location enabled           │
│    Sorted by distance         │
│                               │
│ ▼ Central Park Visitor Center │
│   📍 0.3 mi                   │
│   Hours: 9 AM - 5 PM          │
│   65 E 72nd St, NY 10021      │
│                               │
│ ─────────────────────────────  │
│ ▼ Public Library - 42nd Street│
│   📍 0.5 mi                   │
│   Hours: 10 AM - 6 PM         │
│   476 5th Ave, NY 10018       │
│                               │
│ ─────────────────────────────  │
│ ▼ Grand Central Terminal      │
│   📍 0.7 mi                   │
│   Hours: 24 hours (Main)      │
│   89 E 42nd St, NY 10017      │
│                               │
│ [Scroll for more...]          │
│                               │
└───────────────────────────────┘

Layout: Stacked (Map top, List bottom)
Interaction: Tap location to expand details
```

---

## COMPONENT HIERARCHY

```
App
├── Header (Title + Subtitle)
├── MainContent
│   ├── Map (MapLibre GL)
│   │   ├── Markers (10+ locations)
│   │   ├── Marker Click Handler
│   │   └── Detail Popup (on click)
│   │
│   └── LocationList
│       ├── Geolocation Status
│       └── LocationCard (repeated)
│           ├── Name
│           ├── Distance (if geolocation)
│           ├── Address
│           └── Hours

Interactions:
- Click Map Marker → Show detail popup
- Click Location Card → Center map + highlight
- Geolocation → Sort by distance
- Mobile → Stack vertically
- Tablet → Side panel overlay
- Desktop → 60/40 split
```

---

## VISUAL HIERARCHY

### Desktop Layout
```
Header (60px)
│
├─ Map Area (80% height)
│  ├─ Location Detail Popup (bottom-left overlay)
│  └─ Markers (interactive)
│
└─ Sidebar (20% width, 100% height)
   └─ Location List (scrollable)
```

### Mobile Layout
```
Header (60px)
│
├─ Map (70% of screen)
│  └─ Detail Popup (expandable)
│
└─ Location List (30% of screen)
   └─ Cards (scrollable)
```

---

## RESPONSIVE BREAKPOINTS

| Breakpoint | Device | Layout | Map Size | List View |
|-----------|--------|--------|----------|-----------|
| < 576px | Phone | Stacked | 70% | Full width below |
| 576-768px | Tablet (portrait) | Stacked | 60% | Full width below |
| 768-1024px | Tablet (landscape) | Overlay | 100% | Bottom panel |
| 1024px+ | Desktop | Split | 60% | 40% sidebar |

---

## DETAIL CARD DESIGN

```
┌─────────────────────────────────┐
│ Central Park Visitor Center     │ ← Title (Bold, Large)
├─────────────────────────────────┤
│ 📍 65 E 72nd St                 │ ← Location icon + address
│    New York, NY 10021           │
│                                 │
│ 🕐 Hours: 9 AM - 5 PM daily    │ ← Hours with icon
│                                 │
│ 📏 Distance: 0.3 miles away     │ ← Only if geolocation enabled
│                                 │
│ [Close Button]                  │ ← Simple text link or X button
└─────────────────────────────────┘
```

---

## LOCATION LIST CARD DESIGN

```
┌─────────────────────────────────────┐
│ Central Park Visitor Center         │ ← Title (clickable)
│                                     │
│ 📍 65 E 72nd St, New York, NY       │ ← Address (subtle)
│                                     │
│ 📏 0.3 miles away    🕐 9AM - 5PM   │ ← Distance + Hours (compact)
└─────────────────────────────────────┘ 
      ← Tap to center map + highlight marker
```

---

## COLOR SCHEME

| Element | Color | Purpose |
|---------|-------|---------|
| Header | Red (#FF6B6B) | Brand color, high contrast |
| Markers | Red (#FF6B6B) | Stand out on map |
| Link Text | Red (#FF6B6B) | Calls to action |
| Card Hover | Light Red (#FFE6E6) | Hover feedback |
| Text | Dark Gray (#333) | Readability |
| Secondary | Light Gray (#999) | Hours, address |
| Background | White (#FFF) | Clean, simple |
| Border | Light Gray (#E0E0E0) | Subtle dividers |

---

## INTERACTIONS

### Desktop
- **Hover Map Marker:** Tooltip with location name
- **Click Map Marker:** Show detail popup, center map
- **Hover Location Card:** Highlight corresponding marker
- **Click Location Card:** Center map on location, show marker detail

### Tablet
- **Tap Map Marker:** Show detail popup overlay
- **Tap Location Card:** Center map, highlight marker
- **Drag to Pan:** Move map
- **Pinch to Zoom:** Adjust zoom level

### Mobile
- **Tap Map Marker:** Show detail card
- **Tap Location Card:** Expand details, center map
- **Drag to Pan:** Move map
- **Pinch to Zoom:** Adjust zoom level
- **Swipe List:** Scroll through nearby stations

---

## ACCESSIBILITY

- ✅ Semantic HTML (landmarks, buttons, links)
- ✅ Color contrast (WCAG AA minimum)
- ✅ Keyboard navigation (Tab through cards)
- ✅ Screen reader support (alt text on markers)
- ✅ Touch targets (min 44px for mobile)
- ✅ Focus indicators (visible on all interactive elements)

---

## FUTURE ENHANCEMENTS (Post-MVP)

- [ ] Filter by charging type (USB, WiFi, AC outlet)
- [ ] Filter by hours (open now / 24h)
- [ ] Real-time availability (via API)
- [ ] User reviews / ratings
- [ ] Directions / navigation
- [ ] Save favorites
- [ ] User submissions (Phase 4)

---

## Implementation Notes

**Current Status (MVP):**
- ✅ Map + markers (MapLibre)
- ✅ List view with distance sorting
- ✅ Detail cards on click
- ✅ Mobile responsive
- ⏳ Styling (placeholder colors)

**Days 2-4:**
- Polish card styling
- Refine mobile interactions
- Add visual polish (shadows, spacing)
- Test on real devices

**Days 5-6:**
- Fine-tune responsive breakpoints
- Optimize for demo
- Mobile testing on small screens

**Day 7:**
- Final polish pass
- Submit working demo

---

**Design Status:** Conceptual ✅ | Implementation: In Progress ⏳

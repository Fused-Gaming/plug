# Architecture Guide

This document explains the high-level architecture of the Charging Station Locator MVP and how it achieves privacy-first, client-side operation.

## Table of Contents

- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Data Flow](#data-flow)
- [Component Architecture](#component-architecture)
- [Build Pipeline](#build-pipeline)
- [Deployment Architecture](#deployment-architecture)
- [Privacy by Design](#privacy-by-design)
- [Scalability Considerations](#scalability-considerations)

## System Overview

### The Big Picture

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Browser (Client)                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Charging Station Locator (React + MapLibre GL)     │  │
│  │                                                      │  │
│  │  • Interactive map with charging station markers    │  │
│  │  • Sidebar listing all stations                    │  │
│  │  • Optional geolocation-based distance sorting     │  │
│  │  • Station details on click                        │  │
│  │  • Responsive design (mobile/tablet/desktop)       │  │
│  └──────────────────────────────────────────────────────┘  │
│                      │                                      │
│                      ├→ Browser Geolocation API            │
│                      │   (on user request only)             │
│                      │                                      │
│                      └→ OpenStreetMap Tile Server          │
│                          (public map tiles)                 │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
                    GitHub Pages CDN (Static)
                              │
                    dist/index.html (565 bytes)
                    dist/bundle.js  (147 KB → 48 KB gzipped)
                    dist/styles.css (68 KB → 10 KB gzipped)
```

### Key Principle

**Everything runs in the browser.** No backend, no API, no server processing.

## Technology Stack

### Frontend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Library** | React 18.2 | Component-based UI rendering |
| **Map Rendering** | MapLibre GL 4.0 | Open-source map with markers |
| **Styling** | CSS 3 | Responsive, mobile-first design |
| **Build Tool** | Vite 5.0 | Lightning-fast build and dev server |
| **Package Manager** | npm 10 | Dependency management |

### Data Layer

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Seed Data** | JSON | 10 hardcoded Oakland charging stations |
| **State Management** | React hooks | Component state (map, selections) |
| **Computation** | JavaScript ES6+ | Distance calculation, sorting |
| **Client Storage** | Browser RAM | Temporary geolocation (session only) |

### Deployment

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Hosting** | GitHub Pages | Free static file serving |
| **CDN** | Fastly | Global content distribution |
| **Domain** | Custom CNAME | plug.vln.gg pointing to GitHub Pages |
| **CI/CD** | GitHub Actions | Automated build and deployment |
| **HTTPS** | Let's Encrypt | TLS certificate via GitHub Pages |

### Development & Quality

| Tool | Purpose |
|------|---------|
| **Node.js** | JavaScript runtime for build process |
| **npm audit** | Security vulnerability scanning |
| **GitHub Issues** | Bug tracking and feature requests |
| **Git** | Version control |

## Data Flow

### Application Startup

```
1. User visits https://plug.vln.gg
   ↓
2. GitHub Pages serves dist/index.html
   ↓
3. Browser loads dist/bundle.js and dist/styles.css
   ↓
4. React mounts App component
   ↓
5. App.jsx loads embedded locations from seed-data.json
   ↓
6. MapLibre GL initializes with OSM tiles
   ↓
7. Charging station markers rendered on map
   ↓
8. Location list populated in sidebar
   ↓
9. App ready for user interaction
```

### User Interaction: Searching

```
User searches for "Downtown"
   ↓
Input handler filters locations by name
   ↓
Matching stations highlighted on map
   ↓
Sorted list updated in sidebar
   ↓
Browser displays results (no server call)
```

### User Interaction: Finding Nearby (with Geolocation)

```
User clicks "Find Nearby Chargers"
   ↓
Browser Geolocation API prompts for permission
   ↓
User grants or denies
   ↓
If granted:
  • Browser provides user's lat/lng
  • JavaScript calculates distance to each station
  • List sorted by nearest first
  • Distances displayed next to each station
   ↓
If denied:
  • Default list shown (no distance calculation)
  • User can still search by name
   ↓
Geolocation deleted from memory when user closes browser
```

### User Interaction: Viewing Details

```
User clicks a marker or list item
   ↓
Station details displayed in card:
  • Name
  • Address
  • Charger type (Level 2, DC Fast, etc)
  • Connector types (CCS, Tesla, J1772, etc)
  • Power output (kW)
  • Verification date
   ↓
Card closed by clicking elsewhere
   ↓
No data sent anywhere
```

## Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── Map.jsx              # MapLibre GL wrapper
│   ├── LocationList.jsx     # Station list sidebar
│   ├── LocationCard.jsx     # Detail card for clicked station
│   └── SearchBar.jsx        # Search and filtering
├── data/
│   ├── locations.js         # Hardcoded station data
│   └── schema.sql           # SQLite schema (reference)
├── styles/
│   ├── main.css             # Global styles
│   ├── responsive.css       # Breakpoint-specific styles
│   └── design-tokens.css    # Color, spacing, typography
├── utils/
│   ├── geolocation.js       # Browser geolocation wrapper
│   ├── distance.js          # Haversine formula
│   └── mapUtils.js          # MapLibre helpers
├── App.jsx                  # Main component, state management
└── main.jsx                 # React entry point
```

### Component Tree

```
App
├── Map
│   ├── MapLibre GL instance
│   └── Marker components
├── LocationList
│   ├── SearchBar
│   ├── LocationCard (for each station)
│   │   ├── Station name
│   │   ├── Address
│   │   └── Charger details
│   └── Distance (if geolocation enabled)
└── Sidebar (responsive wrapper)
```

### Data Flow Through Components

```
Embedded Locations (JSON)
    ↓
App.jsx (state: stations[], selectedStation)
    ↓
├─→ Map.jsx (displays markers)
│   ↓
│   MapLibre GL (renders map + pins)
│
└─→ LocationList.jsx (displays list)
    ├─→ SearchBar.jsx (filters stations)
    └─→ LocationCard.jsx (shows details)
```

## Build Pipeline

### Development Build (npm run dev)

```
src/
 ├─ App.jsx
 ├─ components/
 ├─ styles/
 └─ data/
    ↓
  Vite Dev Server
    ├─ Hot Module Reloading (HMR)
    ├─ Source maps (for debugging)
    └─ Unminified (for readability)
    ↓
Browser (http://localhost:5173)
```

### Production Build (npm run build)

```
src/
 ├─ App.jsx (React source)
 ├─ styles/ (CSS source)
 └─ data/ (seed-data.json embedded)
    ↓
 Vite Build Pipeline:
    ├─ JSX → JavaScript (React)
    ├─ CSS → Minified CSS (68 KB → 10 KB gzipped)
    ├─ Tree shake unused code
    ├─ Split chunks (maplibre-gl separated)
    ├─ Minify JavaScript (147 KB → 48 KB gzipped)
    └─ Generate source hash for caching
    ↓
dist/
 ├─ index.html (565 bytes)
 ├─ bundle.js (minified, hashed)
 ├─ styles.css (minified, hashed)
 ├─ maplibre-gl.bundle.js (separate chunk)
 └─ assets/ (images, fonts)
    ↓
 Total: ~1000 KB uncompressed, ~266 KB gzipped
```

### Build Configuration (vite.config.js)

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/plug/',              // GitHub Pages subpath
  build: {
    outDir: 'dist',            // Output directory
    sourcemap: false,          // No debug maps in production
    target: 'ES2020',          // JavaScript version
    rollupOptions: {
      output: {
        manualChunks: {
          maplibre: ['maplibre-gl'] // Separate bundle
        }
      }
    }
  }
})
```

## Deployment Architecture

### GitHub Pages Workflow

```
Developer
  ↓ git push to main
  ↓
GitHub Repository
  ↓
GitHub Actions (.github/workflows/deploy.yml)
  ├─ Checkout code
  ├─ npm install
  ├─ npm run build
  ├─ Deploy dist/ to gh-pages branch
  ↓
GitHub Pages Server
  ├─ Serves dist/index.html
  ├─ Caches assets with git commit hash
  └─ Enforces HTTPS
  ↓
Fastly CDN
  ├─ Global edge locations
  ├─ Caches static assets
  └─ Gzips responses
  ↓
plug.vln.gg (Custom Domain via CNAME)
  ├─ CNAME points to GitHub Pages
  ├─ TLS certificate auto-renewed
  └─ HTTPS enforced
  ↓
User's Browser
  └─ Static HTML/CSS/JS loaded and executed
```

### Deployment Flow

```
Commit to main
    ↓
  GitHub
  Detects push
    ↓
  Actions
  Workflow starts
    ↓
  Build
  npm run build
  Creates dist/
    ↓
  Deploy
  Push dist/ to gh-pages
    ↓
  GitHub Pages
  Serves dist/
    ↓
  CDN
  Caches globally
    ↓
  Live
  Available at plug.vln.gg
  (~30 seconds after push)
```

## Privacy by Design

### The Architecture Enables Privacy

```
Traditional Architecture (with backend):
├─ User location sent to server ❌ Privacy risk
├─ Server logs user queries ❌ Data collection
├─ Database stores visits ❌ Tracking
└─ Server could be hacked ❌ Data breach risk

Our Architecture (client-only):
├─ User location stays in browser ✅ Private
├─ No server logs ✅ No tracking
├─ No database of users ✅ No data collection
└─ No backend to hack ✅ No breach possible
```

### Geolocation Handling

```
User clicks "Find Nearby"
    ↓
Browser Geolocation API prompts
    ↓
If granted:
  └─ User's lat/lng in JavaScript variable
     └─ Distance calculated locally
        └─ List sorted
           └─ Geolocation deleted on tab close
           
If denied:
  └─ No geolocation, app still works
     └─ Search by name instead
```

### Data Sources

```
Public Data Only:
├─ Oakland Open Data Portal (government)
├─ PlugShare (community-contributed)
└─ OpenStreetMap (crowd-sourced)

All data:
├─ Attributed to source
├─ No private data
├─ No personally identifiable information (PII)
└─ Embedded at build time (static)
```

## Scalability Considerations

### Current Limits (MVP)

| Metric | Current | Limit | Impact |
|--------|---------|-------|--------|
| Stations | 10 (Oakland) | ~100 | API needed for growth |
| Cities | 1 | 5-10 | Data integration needed |
| Users | Unlimited | Infinite | CDN handles scaling |
| Load Time | ~2s on 4G | <5s target | Acceptable for MVP |
| Bundle Size | 266 KB gzipped | <500 KB | Safe margin |

### Growth Path (Wave 2+)

**Phase 1 (Current MVP):** Hardcoded data
- ✅ 10 stations in Oakland
- ✅ Simple seed-data.json
- ✅ No backend needed

**Phase 2 (Wave 2):** Local data integration
- → Add 50+ stations per city
- → Pull from public APIs (PlugShare, OpenStreetMap)
- → Still client-side, fetched at build time

**Phase 3 (Wave 3):** Dynamic data
- → Real-time availability (from external API)
- → User submissions (minimal backend)
- → Multiple cities (database-backed)

**Phase 4+ (Waves 4-10):** Production scale
- → Global coverage
- → Real-time updates
- → User accounts & favorites
- → Analytics & impact tracking

### Performance Optimizations

**Current (Implemented):**
- ✅ Static site (instant, no API latency)
- ✅ MapLibre GL (fast rendering)
- ✅ Vite tree-shaking (small bundle)
- ✅ Separate chunk for maplibre-gl
- ✅ HTTPS + gzip compression

**Planned (Wave 2+):**
- → Lazy loading of map tiles
- → Pagination for large station lists
- → Service worker caching (optional)
- → WebWorker for distance calculation
- → Intersection Observer for viewport rendering

## Security Considerations

See [SECURITY.md](../SECURITY.md) for complete security policy.

**Key Architectural Decisions:**
- ✅ No backend = no injection attacks
- ✅ Static files = no code execution risk
- ✅ Client-side only = no data exposure
- ✅ CSP headers = XSS prevention
- ✅ HTTPS enforced = encryption in transit
- ✅ No cookies = no session hijacking

## Future Extensibility

### Adding Features

**New map feature:**
```
1. Create src/components/NewFeature.jsx
2. Add state to App.jsx
3. Style with CSS following design tokens
4. Test on mobile/tablet/desktop
5. Push and deploy (automatic)
```

**New data source:**
```
1. Add JSON file to src/data/
2. Import in App.jsx
3. Merge with existing locations
4. Verify on map
5. Update seed-data.json for builds
```

**New city:**
```
1. Collect 10+ charging stations
2. Create src/data/[city-name].json
3. Add city selector to SearchBar
4. Update documentation
5. Deploy
```

## Testing Architecture

### Manual Testing (Current)

- **Desktop (1920px+):** npm run dev → localhost:5173
- **Tablet (768px):** Device or browser DevTools tablet view
- **Mobile (375px):** Device or browser DevTools mobile view
- **Accessibility:** Keyboard nav + screen reader testing

### Automated Testing (Future)

- Unit tests for distance calculation
- Component tests for React
- E2E tests for user workflows
- Visual regression tests
- Performance budgets in CI/CD

---

**Last Updated:** 2026-07-20  
**Maintained By:** Agent A09 (Documentation & Content)

# Constraints & Architecture Decisions

Understanding the GitHub Pages constraint and how it shaped our architecture.

## The GitHub Pages Constraint

**What GitHub Pages is:**
- Free static file hosting included with every repository
- Instant global CDN distribution
- Automatic HTTPS
- No backend, no server-side execution
- Perfect for documentation, blogs, and portfolios

**What GitHub Pages is NOT:**
- A backend server (no node.js runtime)
- A database service (no persistent storage)
- A server-side rendering engine (no dynamic HTML generation)
- An API provider (no request handling)

**The apparent problem:**
React apps traditionally need a server to serve HTML. GitHub Pages only serves static files. How do you run a React app on static hosting?

## The Solution: Pre-Build to Static

**The key insight:** React doesn't NEED a server—it needs to be loaded and run in the browser.

### Architecture Flow

```
React Source Code (JSX, Components)
    ↓
Vite Build Process (bundling, minification)
    ↓
Static Output (HTML, CSS, JavaScript in dist/)
    ↓
GitHub Pages (serves static files)
    ↓
Browser (downloads and runs React)
    ↓
Full Interactivity (client-side)
```

### Technical Details

1. **Development:** `npm run dev` with hot module reloading
2. **Build:** `vite build` compiles React to `dist/` folder
3. **Output:** Pure static files (no server-side dependencies)
4. **Deployment:** GitHub Actions pushes `dist/` to GitHub Pages
5. **Runtime:** Browser loads HTML → parses CSS → executes JavaScript → React initializes

### What This Means

- ✅ React runs fully in the browser
- ✅ No backend server needed
- ✅ No API calls required (until Phase 5+)
- ✅ All data can be hardcoded or fetched from external APIs
- ✅ Zero hosting costs
- ✅ Instant deployment (seconds, not minutes)

## Impact on Design

### What We CAN Do
- ✅ Interactive map with markers
- ✅ Responsive design
- ✅ State management (user selections, location filter)
- ✅ Geolocation (browser API)
- ✅ Local storage (browser API)
- ✅ Fetch from external APIs
- ✅ Full React app with routing, context, etc.

### What We CAN'T Do (Yet)
- ❌ User submissions (need backend to store)
- ❌ User authentication (need backend database)
- ❌ Real-time data updates (need API server)
- ❌ Verification workflows (need admin backend)
- ❌ Analytics (need server-side tracking)

## How We Responded

### MVP Scope: Phase 3 Only
Ruthlessly cut the roadmap from 8 phases to just Phase 3:
- Phase 1: Foundation ✅ (completed)
- Phase 2: MVP Feature ✅ (completed)
- Phase 3: Polish ✅ (completed)
- Phases 4-8: Deferred (submissions, verification, admin, etc.)

### Hardcoded Data
Start with 10 seed locations (NYC pilot):
```javascript
// src/data/locations.js
export const locations = [
  {
    id: 1,
    name: "Central Library",
    address: "476 5th Ave, NYC",
    latitude: 40.7536,
    longitude: -73.9832,
    hours: "9am-8pm"
  },
  // ... 9 more locations
];
```

### Extensibility Path (Phase 5+)
When we're ready for user submissions:
1. Add backend (Firebase, Supabase, or custom API)
2. Add form component
3. Implement verification workflow
4. Add admin dashboard

The current static architecture doesn't block these additions—it just defers them.

## Why This Constraint Is Actually a Strength

**Benefits of "constraints breed innovation":**

| Limitation | Benefit |
|-----------|---------|
| No backend | Lower costs, faster deployment |
| Static files | Instant global CDN, automatic HTTPS |
| Client-side only | No data privacy risks |
| Hardcoded data | Predictable, no external dependencies |
| No server load | Infinite scalability |

**Real cost comparison:**

| Platform | Hosting | Backend | Database | Total |
|----------|---------|---------|----------|-------|
| GitHub Pages + Static | $0/mo | $0/mo | $0/mo | **$0/mo** |
| Heroku + Firebase | $7/mo+ | $5/mo+ | $5/mo+ | **$17+/mo** |
| AWS | Varies | Varies | Varies | **$50+/mo** |

**Time to first deployment:**

| Approach | Build | Deploy |
|----------|-------|--------|
| React + GitHub Pages | ~10 min | ~30 sec |
| Django + Heroku | ~1 hour | ~5 min |
| Node + AWS | ~2 hours | ~15 min |

## Documentation References

- **Technical Details:** Read [../03-architecture/technical-decisions.md](../03-architecture/technical-decisions.md)
- **Deployment Pipeline:** Read [../03-architecture/deployment-pipeline.md](../03-architecture/deployment-pipeline.md)
- **Future Roadmap:** Read [roadmap.md](roadmap.md)

---

**[← Back to Section](README.md) | [← Back to Index](../INDEX.md)**

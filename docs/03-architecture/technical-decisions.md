# Project Plan: Charging Station Locator MVP

**Project:** Next Chapter Project - Bootcamp Submission  
**Deadline:** 7 days  
**Status:** Day 1 Complete - Foundation & Ecosystem Ready

---

## Executive Summary

Building a privacy-first charging station locator as a static web app deployable to GitHub Pages. The key constraint is that GitHub Pages serves **static files only** — no React runtime on the server. Our solution: **pre-build React to static HTML/CSS/JavaScript**.

---

## Core Technical Decision: GitHub Pages + Static Build

### The Constraint
GitHub Pages does NOT support:
- React Server Components
- Node.js backends
- Server-side rendering
- Dynamic frameworks

### Our Solution: ✅ Vite Pre-Build Pipeline

```
React Code → Vite Build → Static dist/ folder → GitHub Pages → Browser
```

**Benefits:**
- ✅ Works perfectly with GitHub Pages
- ✅ React still runs in browser (full interactivity)
- ✅ No backend required
- ✅ Fast deployment (automatic via GitHub Actions)
- ✅ Zero configuration needed

**Trade-offs:**
- ❌ Cannot fetch data from backend at runtime
- ❌ All data must be hardcoded or fetch from external APIs
- ⚠️ Build step required before deployment

### How It Works

1. **Development:** `npm run dev` → React dev server with hot reload
2. **Build:** `npm run build` → Vite compiles React to `dist/index.html`
3. **Deploy:** GitHub Actions auto-runs build, deploys `dist/` to Pages
4. **Runtime:** Browser loads static `dist/index.html`, React runs client-side

**Result:** Full React app works on plug.vln.gg with zero backend.

---

## Architecture Decisions

### Why React + Vite?
- **React:** Rich interactive maps, event handling, state management
- **Vite:** Fastest build tool, perfect for static generation, no extra config
- **Alternative considered:** Vue, Svelte (same static build approach)

### Why MapLibre GL + OpenStreetMap?
- **MapLibre GL:** Free, no API key required, works in browser
- **OpenStreetMap:** Community-maintained, free tiles
- **Alternative considered:** Google Maps (requires API key, paid above threshold)

### Why Hardcoded Seed Data?
- **No backend needed** → simpler deployment
- **GitHub Pages** → no backend capability
- **Future improvement:** Fetch from external API if needed (Supabase, REST endpoint)

### Data Flow
```
Seed Data (locations.js)
    ↓
React Component (App.jsx)
    ↓
MapLibre GL Rendering
    ↓
Static dist/index.html
    ↓
GitHub Pages
    ↓
Browser: User sees interactive map
```

---

## Deployment Architecture

### GitHub Pages Configuration

| Component | Config | Purpose |
|-----------|--------|---------|
| **Source** | main branch | Watches for pushes |
| **Workflow** | .github/workflows/deploy.yml | Builds & deploys |
| **Build Output** | dist/ folder | Static files served |
| **Domain** | plug.vln.gg (CNAME) | Custom domain |
| **HTTPS** | Auto (Let's Encrypt) | Free SSL/TLS |

### Deployment Flow

```
1. Developer pushes code to main
2. GitHub Actions workflow triggers
3. GitHub Actions:
   - npm install
   - npm run build (Vite compiles React)
   - Uploads dist/ artifact
4. GitHub Pages deploys artifact
5. Site live at plug.vln.gg (~30 seconds)
```

### What GitHub Pages Serves

```
dist/
├── index.html          ← Entry point (static)
├── assets/
│   ├── index-*.css     ← All styles (static)
│   ├── index-*.js      ← All React/JS (static)
│   └── ...             ← Images, fonts (static)
```

**All files are static.** React code runs in the browser, not on the server.

---

## 7-Day Sprint Plan

### Phase 1: Foundation ✅ (Days 1-2)
- [x] Repository setup
- [x] GitHub Pages + CNAME configured
- [x] GitHub Actions workflow
- [x] React + Vite initialized
- [x] MapLibre map integrated
- [x] 10 seed charging locations
- [x] Static build produces dist/

**Verification:** `npm run build` creates dist/, app works in browser

### Phase 2: MVP Feature (Days 2-4)
- [ ] Interactive map with 10+ locations
- [ ] Location detail cards
- [ ] Distance-based sorting
- [ ] Mobile responsive design
- [ ] All data client-side (no backend calls)

**Verification:** All features work in static build

### Phase 3: Polish & Demo (Days 5-6)
- [ ] UI refinements
- [ ] Mobile testing
- [ ] Performance optimization
- [ ] Error handling
- [ ] Demo script/walkthrough

**Verification:** Looks polished, demo flows smoothly

### Phase 4: Submission (Day 7)
- [ ] Final push to main
- [ ] GitHub Pages auto-deploys
- [ ] plug.vln.gg is live
- [ ] Bootcamp submission

**Verification:** Reviewer can visit plug.vln.gg and see working map

---

## GitHub Pages Limitations & Mitigations

### Limitation 1: No Backend
**Impact:** Cannot store user submissions or data in database  
**Mitigation:** Use hardcoded seed data for MVP  
**Future:** Add external API (Supabase, Firebase) for dynamic data

### Limitation 2: No Server-Side Logic
**Impact:** Cannot fetch data from backend at runtime  
**Mitigation:** All logic runs client-side (React)  
**Future:** Add separate Node.js backend if needed (not on Pages)

### Limitation 3: No Authentication
**Impact:** Cannot require login  
**Mitigation:** Public read-only map (no login needed)  
**Future:** Add auth layer if needed (separate service)

### Limitation 4: SPA Routing Issues
**Impact:** Direct links to routes may 404  
**Current:** Single-page app (no routing needed)  
**Future:** Configure SPA redirects if adding client-side routing

---

## Why This Works for Bootcamp

✅ **MVP-Ready:** Works perfectly as a minimal demo  
✅ **Deployed:** Live on custom domain immediately  
✅ **No Ops:** GitHub Pages handles hosting, SSL, updates  
✅ **Fast Build:** Vite builds in ~5 seconds  
✅ **Real Interactivity:** Full React app, not a static HTML mockup  
✅ **Future-Proof:** Easy to add backend later if needed  

---

## Team Notes

### For Future Developers
- **Build before committing:** Always verify `npm run build` works
- **Test the build:** `npm run preview` tests the static output
- **Don't add backend:** Not supported on GitHub Pages
- **Use client-side libraries:** Anything that runs in browser is fine
- **Avoid Node.js APIs:** fs, path, etc. won't work in browser build

### If You Need a Backend
- Set up separate Node.js/API server (Vercel, Heroku, Railway)
- Fetch data from your API at runtime (CORS-enabled)
- Keep GitHub Pages for frontend only
- Update `.github/workflows/deploy.yml` if API changes

### Security Considerations
- ✅ No secrets in frontend code (all static)
- ⚠️ All data visible to users (hardcoded seed data is public)
- ✅ HTTPS by default (Let's Encrypt)
- ⚠️ No backend to secure (GitHub Pages handles it)

---

## Ecosystem Integration

**SyncPulse Tools Available:**
- `@h4shed/skill-project-manager` - This planning
- `@h4shed/skill-playwright-test-automation` - E2E testing
- `@h4shed/skill-frontend-design` - UI refinement
- `@h4shed/skill-vite-module-bundler` - Build optimization
- `@h4shed/skill-theme-factory` - Rapid styling

---

## Success Criteria

- ✅ App runs: `npm run dev` works
- ✅ Builds: `npm run build` creates dist/
- ✅ Deploys: GitHub Pages serves static files
- ✅ Live: plug.vln.gg is accessible
- ✅ Interactive: Map responds to clicks
- ✅ Mobile: Works on small screens
- ✅ Submitted: On time for deadline

---

## Questions & Decisions Log

**Q: Can we use Next.js?**  
A: Not with GitHub Pages (no backend). Next.js static export possible but adds complexity. Vite is simpler for this MVP.

**Q: Can we add user submissions?**  
A: Not without a backend. Would need separate API service (add later if needed).

**Q: Can we use a database?**  
A: Not on GitHub Pages. Could add external DB (Firebase, Supabase) with API endpoint.

**Q: What about SEO?**  
A: Static builds support SEO (index.html is indexable). SPA routing requires setup if added later.

---

## Rollback Plan

If GitHub Pages doesn't work as expected:

1. **Fallback Domain:** Use `fused-gaming.github.io/plug` (free, no CNAME needed)
2. **Alternative Hosting:** Deploy to Vercel (free, same static support)
3. **Local Build:** Provide instructions for running locally (`npm install && npm run dev`)
4. **Backup:** Keep source code in git for manual deployment

---

**Document Status:** Complete  
**Last Updated:** July 20, 2026  
**Next Review:** Day 4 (Polish phase)

# 7-Day Bootcamp MVP: Charging Station Locator

**Project:** Privacy-first device charging location map for vulnerable populations  
**Submission Deadline:** Day 7  
**Core MVP:** Read-only map showing hardcoded charging stations with basic search  
**Deployment:** GitHub Pages (static site via Vite build pipeline)

### ⚠️ Critical Constraint

**GitHub Pages serves static files only** — does not execute React or Node.js code.

**Our Solution:** React + Vite → `npm run build` produces static HTML/CSS/JS → GitHub Actions deploys `dist/` folder → plug.vln.gg serves static output ✅

This approach works because:
- Vite pre-renders React into static files
- No runtime JavaScript framework required on server
- GitHub Actions handles build before deployment
- All client-side interactivity works in browser
- Zero backend required for MVP

---

## Phase 1: Foundation (Days 1-2)

**Setup & Tooling - GitHub Pages Static Build Pipeline**
- [x] Repository & GitHub Pages deployment
- [x] React + Vite setup (builds to static `dist/` folder)
- [x] GitHub Actions workflow (npm install → npm run build → deploy dist/)
- [x] MapLibre GL JS integration with OpenStreetMap
- [x] Basic component structure
- [x] Seed data (10 hardcoded NYC charging locations)

**Definition of Done:** 
- `npm install && npm run dev` launches app
- Map renders with markers visible
- Build produces static output for GitHub Pages

---

## Phase 2: MVP Feature (Days 2-4)

**Read-Only Map Interface - THE ONLY FEATURE**

- [ ] Map displays pilot area (single city)
- [ ] Markers show charging stations
- [ ] Location list view with distance sorting (if geolocation available)
- [ ] Click marker → show location details (name, address, hours if known)
- [ ] Basic filters: open now / all (NO complex filtering)
- [ ] Mobile responsive (basic)

**Definition of Done:** User can view the map and see charging locations

---

## Phase 3: Polish & Demo (Days 5-6)

- [ ] Bug fixes for demo critical path
- [ ] Better marker icons/styling
- [ ] Location detail UI polish
- [ ] 404 error page for GitHub Pages
- [ ] README with demo instructions

**Definition of Done:** Demo runs smoothly, looks polished enough for video

---

## Phase 4: Final Submission (Day 7)

- [ ] All code committed & pushed
- [ ] Demo recorded or rehearsed
- [ ] Project submitted

---

## What We're DEFINITELY NOT Doing

❌ User submissions/contributions  
❌ Confidence/verification system  
❌ Authentication/accounts  
❌ Complex data quality workflows  
❌ Accessibility audit  
❌ Security review  
❌ Performance optimization  
❌ Real database (SQLite, PostgreSQL, etc.)  
❌ Automated testing  
❌ Admin dashboards  
❌ Privacy policy deep dives  

**Rationale:** These are Phases 4-8 in the full roadmap. We're showing Phase 3 (read-only map) is possible and valuable, then shipping.

## Success Metrics

✅ Project runs without errors  
✅ Core feature works as intended  
✅ Code is readable and documented  
✅ Demo completes in 5-10 minutes  
✅ Project is submitted on deadline  

---

**Remember:** A working MVP submitted on time beats an ambitious feature list submitted late or incomplete.

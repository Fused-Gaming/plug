# Roadmap

**Project:** Privacy-first device charging location map for vulnerable populations
**Current release:** v2.0.0 (live at plug.vln.gg)
**Next milestone:** [v2.1.0 — Community Data Pipeline](#v210--community-data-pipeline)

---

# 7-Day Bootcamp MVP: Charging Station Locator (Shipped)

> **Status: COMPLETE.** The 7-day MVP shipped on schedule and evolved into the v2.0.0 release: React/Vite map app plus a static landing page with a token-driven design system, WCAG-graded palette, and SVG icon sprite (see [Component Library](../04-design/COMPONENT_LIBRARY.md)). The plan below is preserved as-is for historical record, with delivered items checked off.

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

- [x] Map displays pilot area (single city)
- [x] Markers show charging stations
- [x] Location list view with distance sorting (if geolocation available)
- [x] Click marker → show location details (name, address, hours if known)
- [x] Basic filters: open now / all (NO complex filtering)
- [x] Mobile responsive (basic)

**Definition of Done:** User can view the map and see charging locations

---

## Phase 3: Polish & Demo (Days 5-6)

- [x] Bug fixes for demo critical path
- [x] Better marker icons/styling
- [x] Location detail UI polish
- [x] 404 error page for GitHub Pages
- [x] README with demo instructions

**Definition of Done:** Demo runs smoothly, looks polished enough for video

---

## Phase 4: Final Submission (Day 7)

- [x] All code committed & pushed
- [x] Demo recorded or rehearsed
- [x] Project submitted

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

> **Post-MVP note:** This exclusion list applied to the 7-day sprint only. Several of these items (user submissions, a confidence/verification system, a real SQLite database, data quality workflows, privacy policy work) are now in scope for v2.1.0 — see below.

## Success Metrics

✅ Project runs without errors  
✅ Core feature works as intended  
✅ Code is readable and documented  
✅ Demo completes in 5-10 minutes  
✅ Project is submitted on deadline  

---

**Remember:** A working MVP submitted on time beats an ambitious feature list submitted late or incomplete.

---

# v2.1.0 — Community Data Pipeline

**Status:** Planned
**Full plan:** [DATA_PIPELINE_PLAN.md](DATA_PIPELINE_PLAN.md)
**Prior research:** [OSINT Research Plan](../05-development/osint-oakland-electrical-sources.md)

With v2.0.0 live, the next milestone replaces hardcoded seed data with an automated, evidence-based data pipeline — still zero backend, zero hosting cost. Scheduled GitHub Actions fetch free OSINT sources (OpenStreetMap Overpass, Oakland open data, BART, library hours feeds, Wikidata, RIDB, OpenChargeMap), normalize into a canonical SQLite database, dedupe, score confidence, and emit the site's `locations.json` — committing only on diff so Pages redeploys automatically. Community submissions flow in through GitHub Issue Forms, and Resend handles confirmation emails from the Action side only. Publish tier is always derived from evidence: auto-published venues require 2+ corroborating sources plus machine-readable hours, and are labeled with a new **Auto-listed** badge since outlet presence is inferred, not confirmed.

### Rollout Phases

- [x] **Phase A — OSINT ETL + Auto-listed badge:** daily workflow, canonical SQLite + derived JSON, commit-on-diff, auto-publish rule, honest badge wording — **SHIPPED in PR #27** ([details](DATA_PIPELINE_PLAN.md#phase-a--osint-etl--auto-listed-badge))
- [x] **Phase B — Community submissions:** GitHub Issue Form queue, hourly ingest with JSON Schema validation, geofencing, and free-text sanitization as the XSS boundary — **SHIPPED in PR #28** ([details](DATA_PIPELINE_PLAN.md#phase-b--community-submissions))
- [ ] **Phase C — Resend confirmations + opt-in:** Action-side confirmation emails, double opt-in, contacts stored only in Resend Audiences — never in the repo — **DESIGN DECISION PENDING** ([options](PHASE_C_DESIGN_DECISION.md), [details](DATA_PIPELINE_PLAN.md#phase-c--resend-confirmations--opt-in))
- [ ] **Phase D — Staleness and liveness automation:** Weekly HTTP checks; auto-demote to "Needs recheck" when venues disappear from OSM or websites go dark ([planning](PHASES_D_E_PLANNING.md#phase-d-staleness-and-liveness-automation), [details](DATA_PIPELINE_PLAN.md#phase-d--staleness-and-liveness-automation))
- [ ] **Phase E — Licensing, attribution, privacy:** ODbL compliance ✅, README data-sources section, privacy policy for Resend + submissions flow ([planning](PHASES_D_E_PLANNING.md#phase-e-licensing-attribution--privacy), [details](DATA_PIPELINE_PLAN.md#phase-e--licensing-attribution-privacy))

**Definition of Done:** All five phases shipped; the map is populated and maintained by automation and community evidence, with no hand-edited data files.


---

## Future concept — Solar-powered drone charger rental

**Status:** Exploratory; discovery only  
**Timing:** Consider after the v2.1.0 community data pipeline; this concept does not change the v2.1.0 delivery order  
**Concept:** Extend solar charging stations into a local network that dispatches reusable magnetic power banks by drone for short-term customer rental. The drone lands at an approved pickup pad; the customer retrieves the charger after landing. This is a controlled handoff, not an airdrop.

### Proposed rollout gates

1. **Feasibility and demand discovery**
   - Identify one compact, high-demand service area, such as a campus, event site, or private facility.
   - Validate customer demand, acceptable delivery fees, expected turnaround, charging needs, and charger return behavior.
   - Assess aircraft payload and range, landing/pickup design, weather limits, battery handling, privacy, site permissions, insurance, and applicable aviation requirements with qualified operators and counsel.
   - Model full service cost, including aircraft, operations, maintenance, charging equipment, battery replacement, and charger recovery. Solar may lower grid-energy costs; it does not by itself fund the service.

2. **Station and rental prototype**
   - Prototype a solar station with energy storage, charger charging/health monitoring, inventory tracking, and a secure return process.
   - Use reusable magnetic wireless power banks with USB-C fallback; document device compatibility and charge performance.
   - Add a request and dispatch flow with QR pickup, charger identity/condition logging, rental terms, and return confirmation.
   - Make account creation optional. Support a complete one-time anonymous request without registration, with delivery to a customer-confirmed GPS pin and no persistent location history.
   - Design the anonymous flow to use three payment options; select and document the actual payment methods during feasibility discovery. Support a refundable deposit for general rentals and an approved account-billing option only where a customer has an explicit agreement.
   - Collect only the location and transaction data needed to complete and support the delivery; disclose the pin to the authorized operator for fulfillment and define a short retention period for anonymous request data.

3. **Supervised field pilot**
   - Begin with a small, geofenced site and a qualified drone operator after required FAA, property-owner, and local approvals are in place.
   - Require the aircraft to land at a designated safe pad before customer retrieval; do not release chargers in flight.
   - Return chargers to a station or approved collection point for inspection and recharging.
   - Record delivery time, successful retrieval and return rates, utilization, energy autonomy, charger cycle life, incidents, customer price acceptance, and total cost per completed rental.

### Scale decision

Expand only if the pilot demonstrates safe, reliable handoffs, strong charger return rates, repeat demand, and sustainable unit economics after including labor, equipment, maintenance, and recovery costs. Keep the charging-location map useful as a standalone service while this operational concept is evaluated.

**Regulatory starting points:** [FAA package delivery under Part 107](https://www.faa.gov/faq/package-delivery-allowed-under-small-uas-rule-part-107) and [FAA package delivery by drone (Part 135)](https://www.faa.gov/uas/advanced_operations/package_delivery_drone).

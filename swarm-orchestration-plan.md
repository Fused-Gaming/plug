# Charging Station Locator MVP — Swarm Orchestration Plan

**Project:** Charging Station Locator MVP (GitHub Pages Static App)  
**Branching Strategy:** Issue #3 (Serial Integration Queue)  
**Coordinator:** Claude Swarm Agent  
**Status:** Coordination Phase — Ready to Deploy 10-Agent Parallel Workflow

---

## 🎯 Executive Summary

This document orchestrates parallel development of the Charging Station Locator MVP using the branching strategy defined in issue #3. Ten specialized agents work in isolation on scoped tasks, commit to agent-specific branches, and converge through a temporary integration branch with serial merge validation.

**Key Constraint:** All work flows through `integration-map-app` (temporary). Only the final validated integration PR opens into `main`.

---

## 📊 Flow Architecture

```
                    main (production source)
                      ↑
                      │
            [Final PR + Review Gate]
                      │
          integration-map-app
             (temporary, validated)
                      ↑
        ┌─────────────┼─────────────┐
        │             │             │
    [Wave 1]      [Wave 2]      [Wave 3]
   Foundations  Implementation  Integration
        │             │             │
    ┌───┴───┐   ┌─────┴─────┐   ┌──┴──┐
    │   │   │   │   │   │   │   │  │  │
   A01 A03 A08 A02 A04 A05 A10 A06 A07 A08
   A09                              (review)
```

---

## 🏗️ 10-Agent Role Assignments

| ID | Role | Branch | Objective | Wave | Status |
|:--:|------|--------|-----------|:----:|--------|
| **A01** | Static Build | `agent/01-static-build` | Configure Vite, base path, build output | 1 | 🟡 Ready |
| **A02** | Data Reader | `agent/02-data-reader` | Read-only location data adapter | 2 | 🟡 Ready |
| **A03** | SQLite Owner | `data/03-oakland-locations` | Schema, seed data, checkpoint | 1 | 🟡 Ready |
| **A04** | Map UI | `agent/04-map-shell` | MapLibre integration, markers, sync | 2 | 🟡 Ready |
| **A05** | Filters & Details | `agent/05-filter-details` | Filter controls, location cards | 2 | 🟡 Ready |
| **A06** | Accessibility | `agent/06-accessibility` | Keyboard nav, ARIA, contrast, motion | 2 | 🟡 Ready |
| **A07** | Tests | `agent/07-tests` | Unit, integration, browser tests | 3 | 🟡 Ready |
| **A08** | Privacy & Security | `agent/08-privacy-security` | CSP, dependencies, security audit | 1→3 | 🟡 Ready |
| **A09** | Docs & Content | `agent/09-docs-content` | README, guides, user-facing copy | 1 | 🟡 Ready |
| **A10** | Pages Integration | `agent/10-pages-integration` | Workflow, cross-module, deployment | 2→3 | 🟡 Ready |

---

## 🌊 Wave Dependency Model

### Wave 1: Foundations (Contracts & Boundaries)
**Goal:** Establish shared contracts, freezing interfaces for parallel work  
**Duration:** ~2 hours  
**Must Complete Before Wave 2 Starts**

**Agent A01** — Static Build Contract
- Vite configuration locked
- Output directory: `dist/`
- Base path contract defined
- Build command: `npm run build`
- **Deliverable:** Passing `npm run build` with empty source

**Agent A03** — SQLite Schema & Seed
- Schema file: `src/data/locations.db` (or seed SQL)
- Representative 10-location seed data
- Schema integrity validation
- PRAGMA constraints documented
- **Deliverable:** `src/data/locations.db` + schema checksum

**Agent A08** — Privacy & Security Draft
- CSP rules documented
- Dependency audit baseline
- Static-site security requirements
- **Deliverable:** `SECURITY.md` draft + `package.json` audit

**Agent A09** — Documentation Skeleton
- README template
- Getting started guide
- Architecture overview
- **Deliverable:** `docs/` structure + README outline

**Coordinator** — Freeze Shared Contracts
- Confirm UI contracts (component boundaries)
- Confirm data contracts (location shape)
- Assign file ownership
- Lock shared files (package.json, build config)

---

### Wave 2: Implementation (Parallel Feature Build)
**Goal:** Build features independently using Wave 1 contracts  
**Duration:** ~4 hours  
**Depends On:** Wave 1 completion + coordinator approval

**Agent A02** — Read-Only Data Adapter
- Load SQLite from `src/data/locations.db`
- Expose location query functions
- Handle geolocation and search
- **Deliverable:** `src/adapters/locationData.js` + tests

**Agent A04** — Map UI Shell
- MapLibre GL integration
- Marker rendering from location data
- Click-to-detail interaction
- Mobile responsive map
- **Deliverable:** `src/components/Map.jsx` + tests

**Agent A05** — Filters & Location Details
- Filter controls (distance, amenities)
- Location detail cards
- List and map synchronization
- Responsive layout
- **Deliverable:** `src/components/Filters.jsx`, `LocationDetail.jsx` + tests

**Agent A06** — Accessibility Hardening
- Keyboard navigation
- ARIA labels and roles
- Color contrast validation
- Reduced motion support
- **Deliverable:** Accessibility audit + components updated

**Agent A10** — Pages Integration Setup
- GitHub Actions workflow verification
- Base path routing
- Static artifact validation
- Deployment preview
- **Deliverable:** `.github/workflows/deploy.yml` + checks

---

### Wave 3: Validation & Release (Integration Hardening)
**Goal:** Verify integrated system, perform final reviews  
**Duration:** ~2 hours  
**Depends On:** Wave 2 completion + all PRs merged into integration

**Agent A07** — Integrated Test Suite
- End-to-end browser tests
- Static build validation
- Mobile viewport tests
- Performance benchmarks
- **Deliverable:** `src/__tests__/` + passing full suite

**Agent A08** — Final Security Review
- Dependency vulnerability scan
- CSP validation
- No secrets in artifact
- Artifact size audit
- **Deliverable:** Security sign-off + remediation log

**Agent A10** — Final Deployment Validation
- Pages artifact loads at base path
- All routes resolve
- Assets and links work
- Mobile/desktop tested
- **Deliverable:** Deployment sign-off + test results

---

## 🔄 Parallel Workflow

```
Wave 1 Agents (A01, A03, A08, A09)
         ↓
   [Coordinator freezes contracts]
         ↓
Wave 2 Agents (A02, A04, A05, A06, A10)
    [4 agents in true parallel]
         ↓
   [Serial merge queue validation]
         ↓
Wave 3 Agents (A07, A08, A10)
    [Final integration tests]
         ↓
   [Human review + approval]
         ↓
   [Merge final PR into main]
         ↓
   [GitHub Actions deploys Pages]
```

---

## 📋 Shared File Ownership

**Locked (Coordinator Only)**
- `package.json` — No dependency edits without approval
- `package-lock.json` — Lock file (read-only)
- `vite.config.js` — Build configuration (A01 owner, others read-only)
- `.github/workflows/deploy.yml` — Deployment workflow (A10 primary)
- `src/styles/main.css` — Global styles (Design tokens, see below)

**Assigned Owners**
| File | Owner | Role |
|------|-------|------|
| `src/data/locations.db` | A03 | SQLite single-writer |
| `src/adapters/locationData.js` | A02 | Data reader adapter |
| `src/components/Map.jsx` | A04 | Map UI |
| `src/components/Filters.jsx` | A05 | Filter controls |
| `src/components/LocationDetail.jsx` | A05 | Location cards |
| `src/components/Accessibility.jsx` | A06 | Keyboard/ARIA |
| `docs/` | A09 | Documentation |
| `src/__tests__/` | A07 | Test suite |

---

## 🎨 Design Tokens & Responsive Strategy

**Skill Integration:** `@h4shed/skill-style-dictionary-system`

### Mobile-First Breakpoints
```css
/* Mobile (base) */
:root {
  --color-primary: #2563eb;
  --color-danger: #dc2626;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --font-size-base: 16px;
  --font-size-heading: 24px;
}

/* Tablet (640px+) */
@media (min-width: 640px) {
  :root {
    --font-size-heading: 28px;
    --spacing-lg: 2rem;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  :root {
    --font-size-heading: 32px;
    --spacing-lg: 2.5rem;
  }
}
```

### Design Token Coverage
- **Colors:** Primary, secondary, danger, warning, success, neutral
- **Typography:** Font stacks, sizes (sm, base, lg, xl), weights
- **Spacing:** 8px scale (0.5, 1, 1.5, 2, 2.5, 3 rem)
- **Shadows:** Elevation levels (sm, md, lg)
- **Borders:** Radius, widths
- **Transitions:** Duration, easing

### Validation Testing
- Token compiler output verified
- Responsive behavior tested across breakpoints
- Accessibility contrast ratios validated (WCAG AA)
- Performance: Token bundle size < 2KB

---

## 🔍 OSINT: Oakland Electrical Sources

### Authorized Public Data Sources

**City of Oakland Infrastructure**
- Oakland Open Data Portal: https://data.oaklandca.gov
  - City electrical substations (public GIS layer)
  - Street lighting infrastructure
  - Public building utility systems
- USGS Earthquake Hazards: Public electrical grid resilience data

**California Public Data**
- California Energy Commission: Public utility maps
- PG&E Service Territory Maps (public-facing)
- California Independent System Operator (CAISO): Grid data

**Federal Sources**
- FEMA Hazard Mitigation Data: Critical infrastructure locations
- OpenStreetMap: Community-mapped utilities (user-contributed)
- NIST Grid Modernization: Public infrastructure reports

### Data Integration Strategy
1. **Seed Data Phase:** Add 3-5 known public charging stations + electrical utility info
2. **Expansion Phase:** Integrate Oakland Open Data feeds (post-MVP)
3. **Compliance:** All OSINT data properly attributed; no private infrastructure details

### Privacy Note
- Focus on **public charging infrastructure**, not private grid details
- Exclude sensitive electrical distribution details
- Use only officially published municipal data

---

## 📌 Integration Branch Setup

```bash
# Coordinator creates integration branch
git switch main
git pull --ff-only origin main
git switch -c integration-map-app
git push -u origin integration-map-app

# Each agent branches from integration
git switch integration-map-app
git pull --ff-only origin integration-map-app
git switch -c agent/NN-task-name
git push -u origin agent/NN-task-name
```

---

## ✅ Serial Merge Queue & Validation

### Merge Order (Dependency-Driven)

1. **A01** → Static Build (`agent/01-static-build`)
   - Validate: `npm run build` produces dist/

2. **A03** → SQLite Data (`data/03-oakland-locations`)
   - Validate: Database integrity check passes

3. **A02** → Data Reader (`agent/02-data-reader`)
   - Validate: Location queries return seed data

4. **A04** → Map UI (`agent/04-map-shell`)
   - Validate: MapLibre renders, markers appear

5. **A05** → Filters (`agent/05-filter-details`)
   - Validate: Filter controls work, cards display

6. **A06** → Accessibility (`agent/06-accessibility`)
   - Validate: Keyboard nav works, ARIA attributes present

7. **A09** → Docs (`agent/09-docs-content`)
   - Validate: Documentation builds, links resolve

8. **A10** → Pages Integration (`agent/10-pages-integration`)
   - Validate: Workflow triggers, artifact deploys

9. **A07** → Tests (`agent/07-tests`)
   - Validate: All tests pass on integrated build

10. **A08** → Security Review (`agent/08-privacy-security`)
    - Validate: Security audit passes, no vulnerabilities

### Integrated Validation Checklist

After **every** merge:

- [ ] `npm run format:check` passes
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes (if TypeScript)
- [ ] `npm run test` passes
- [ ] `npm run build` succeeds
- [ ] `dist/` contains valid artifacts
- [ ] Map loads at correct base path
- [ ] Database integrity check: `PRAGMA integrity_check` = ok
- [ ] Mobile viewport responds
- [ ] No secrets in artifact
- [ ] Artifact size < 5MB

---

## 🚨 Repair Swarm

If integrated validation fails, create a repair branch:

```bash
git switch integration-map-app
git pull --ff-only origin integration-map-app
git switch -c repair/NN-description
git push -u origin repair/NN-description
```

Each repair:
- Targets one classified failure
- Modifies only affected files
- Adds regression test
- Passes branch CI
- PRs into integration
- Merges through serial queue

---

## 📋 Coordinator Pre-Flight Checklist

Before launching waves:

- [ ] Integration branch created and pushed
- [ ] All agent task descriptions finalized
- [ ] File ownership assigned and documented
- [ ] SQLite schema frozen (A03)
- [ ] UI contracts defined (component boundaries)
- [ ] Data contracts defined (location shape)
- [ ] Base path verified (usually `/plug`)
- [ ] Shared dependencies locked (package.json)
- [ ] Merge order documented
- [ ] Validation checklist prepared
- [ ] Repair process understood

---

## 🎯 Success Criteria

**Wave 1 Complete When:**
- A01 static build config passes `npm run build`
- A03 SQLite schema + seed data valid
- A08 security baseline documented
- A09 documentation structure in place

**Wave 2 Complete When:**
- All feature PRs pass branch CI
- Data adapter loads locations
- Map renders with markers
- Filters respond to input
- Accessibility keyboard nav works
- Pages workflow configured

**Wave 3 Complete When:**
- Integrated test suite passes
- Security audit cleared
- Final Pages deployment verified
- All checks pass

**Release Ready When:**
- Final PR into `main` approved
- GitHub Actions builds artifact
- `plug.vln.gg` serves live
- All features work in production

---

## 🔗 Handoff Sequence

```
Coordinator Setup
    ↓
Wave 1: A01, A03, A08, A09 (parallel)
    ↓
Coordinator: Freeze Contracts
    ↓
Wave 2: A02, A04, A05, A06, A10 (parallel)
    ↓
Serial Merge Queue (1→10 order)
    ↓
Integration Validation (after each merge)
    ↓
Wave 3: A07, A08, A10 (parallel integration tests)
    ↓
Final PR Review & Approval
    ↓
Merge into main
    ↓
GitHub Actions Deploy
    ↓
Production Live
```

---

## 📞 Communication Norms

**Daily Standup:**
- Each agent reports progress, blockers, PRs opened
- Coordinator manages merge queue

**PR Review:**
- Peer review before merge (if multiple agents available)
- Coordinator validates against checklist before merging

**Blocker Escalation:**
- If waiting on contract definition: pause and notify coordinator
- If merged code fails integration: create repair branch
- If dependency unblocked: restart dependent agents

---

## 📊 Agent Status Dashboard

| Agent | Branch | Wave | Status | Blocker | ETA |
|:-----:|--------|:----:|:------:|---------|-----|
| A01 | `agent/01-static-build` | 1 | 🟡 Ready | None | 2h |
| A02 | `agent/02-data-reader` | 2 | 🟡 Ready | A01, A03 | 4h |
| A03 | `data/03-oakland-locations` | 1 | 🟡 Ready | None | 2h |
| A04 | `agent/04-map-shell` | 2 | 🟡 Ready | A01, A02 | 4h |
| A05 | `agent/05-filter-details` | 2 | 🟡 Ready | A02, A04 | 4h |
| A06 | `agent/06-accessibility` | 2 | 🟡 Ready | A04, A05 | 3h |
| A07 | `agent/07-tests` | 3 | 🟡 Ready | A02-A06 | 3h |
| A08 | `agent/08-privacy-security` | 1→3 | 🟡 Ready | None → Wave2 | 2h + 1h |
| A09 | `agent/09-docs-content` | 1 | 🟡 Ready | None | 2h |
| A10 | `agent/10-pages-integration` | 2→3 | 🟡 Ready | A01, A04-A05 | 2h + 1h |

---

## 📝 Final Notes

- This plan follows issue #3's branching strategy exactly
- All development work on assigned branches only
- Integration branch is the convergence point
- Main stays stable until final PR merge
- Each agent owns specific files; no collisions
- SQLite has a single writer (A03)
- Serial merge queue prevents integration chaos
- Repair swarm handles failures without blocking

**Status:** 🟢 Ready to Launch Swarm Coordination


# Wave 1: Foundations — Agent Task Specifications

**Phase:** Foundations (2 hours)  
**Gate:** Coordinator freezes all contracts  
**Branches:** 4 agent branches, 1 coordinator branch  
**Status:** 🟢 Active — Agent assignments ready

---

## Overview

Wave 1 establishes shared contracts and boundaries that enable parallel work in Waves 2 and 3. All four agents work in isolation on their assigned branches. Coordinator freezes contracts when all Wave 1 PRs pass CI.

**Branching Model:**
```
main
  ↓
integration-map-app (coordinator)
  ├── agent/01-static-build (A01)
  ├── data/03-oakland-locations (A03)
  ├── agent/08-privacy-security (A08)
  └── agent/09-docs-content (A09)
```

---

## Agent A01: Static Build Configuration

**Branch:** `agent/01-static-build`  
**Role:** Infrastructure Engineer  
**Objective:** Configure Vite static build, base path handling, output directory  
**Duration:** 2 hours  
**Priority:** P0 (blocks Wave 2)

### Task Description

Configure the Vite static build pipeline to produce deployable artifacts for GitHub Pages. Lock build configuration so Wave 2 agents can rely on stable build outputs.

### Deliverables

1. **Vite Configuration Locked**
   - [ ] `vite.config.js` configured for GitHub Pages
   - [ ] Base path set to `/plug`
   - [ ] Output directory: `dist/`
   - [ ] Static generation verified

2. **Build Command Passing**
   - [ ] `npm run build` succeeds with empty source
   - [ ] `dist/` directory created with valid structure
   - [ ] `npm run preview` serves static files correctly

3. **Deployment Contract Defined**
   - [ ] GitHub Actions workflow prepared
   - [ ] CNAME points to plug.vln.gg
   - [ ] Build output documented

### Owned Files

- `vite.config.js` ← **Exclusive owner (read-only after Wave 1)**
- `src/main.jsx` (bootstrap only)

### Read-Only Files

- `package.json` (locked, no edits)
- `package-lock.json` (locked, no edits)

### Acceptance Criteria

✅ **Pass all checks:**
1. Vite build configuration complete
2. `npm run build` succeeds
3. `dist/` contains valid artifacts
4. Base path `/plug` configured
5. CNAME alignment verified
6. Branch CI passes: format, lint, build

### PR Template

**Head:** `agent/01-static-build`  
**Base:** `integration-map-app`

```markdown
## Static Build Configuration

Locked Vite configuration for GitHub Pages deployment.

### Changes
- Vite config: base path, output directory
- Main entry point bootstrap
- Build command verified

### Verification
- npm run build: ✓
- dist/ valid: ✓
- Base path /plug: ✓

### Dependencies
None (Wave 1 foundation)

### Blocks
- A02, A04, A10 (Wave 2 depends on stable build)
```

### Merge Criteria

- ✅ CI passes (format, lint, build)
- ✅ Vite build succeeds
- ✅ Code review approved
- ✅ Ready to merge into integration-map-app

---

## Agent A03: SQLite Data Owner

**Branch:** `data/03-oakland-locations`  
**Role:** Data Architect  
**Objective:** Define SQLite schema, seed data, database integrity  
**Duration:** 2 hours  
**Priority:** P0 (blocks Wave 2)  
**Constraint:** **Single writer — exclusive SQLite owner**

### Task Description

Design and populate the SQLite database with representative charging station data from Oakland. This agent is the **exclusive owner** of the SQLite database file — no other agent may edit `src/data/locations.db`.

### Deliverables

1. **SQLite Schema Defined**
   - [ ] `src/data/locations.db` created
   - [ ] Schema: `locations` table with fields:
     - `id` (integer, PK)
     - `name` (text)
     - `lat` (real)
     - `lng` (real)
     - `address` (text)
     - `charger_type` (text: "Level 1", "Level 2", "DC Fast")
     - `connectors` (text: comma-separated)
     - `power_kw` (real)
     - `source` (text)
     - `verified_date` (text)

2. **Seed Data: 10 Oakland Locations**
   - [ ] 10 representative charging stations
   - [ ] Mix of charger types (2-3 of each)
   - [ ] Oakland-specific locations (downtown, airport, etc.)
   - [ ] All coordinates verified (lat/lng in Oakland bounds)
   - [ ] OSINT sources documented and attributed

3. **Database Integrity Verified**
   - [ ] `PRAGMA integrity_check` returns "ok"
   - [ ] `PRAGMA wal_checkpoint(TRUNCATE)` executed
   - [ ] No WAL files committed (`.db-wal`, `.db-shm`)
   - [ ] Database checksum documented in commit message

### Owned Files

- `src/data/locations.db` ← **EXCLUSIVE OWNER (single writer lock)**
- `src/data/schema.sql` (schema definition)
- `src/data/seed-data.json` (documented seed)

### Read-Only Files

- `package.json` (locked, no edits)
- All other files

### Example Seed Data

```json
{
  "locations": [
    {
      "id": 1,
      "name": "Oakland Convention Center",
      "lat": 37.8044,
      "lng": -122.2712,
      "address": "10 10th St, Oakland, CA 94607",
      "charger_type": "Level 2",
      "connectors": "Tesla, CCS",
      "power_kw": 7.2,
      "source": "PlugShare",
      "verified_date": "2026-07-20"
    },
    {
      "id": 2,
      "name": "Oakland Airport Parking",
      "lat": 37.7213,
      "lng": -122.2208,
      "address": "9000 Airport Blvd, Oakland, CA 94621",
      "charger_type": "DC Fast",
      "connectors": "CCS, CHAdeMO",
      "power_kw": 50.0,
      "source": "Oakland Open Data",
      "verified_date": "2026-07-20"
    }
    // ... 8 more locations
  ]
}
```

### Acceptance Criteria

✅ **Pass all checks:**
1. SQLite database created and valid
2. 10 locations with complete data
3. `PRAGMA integrity_check` = "ok"
4. Coordinates verified (Oakland bounds)
5. OSINT sources documented
6. Branch CI passes
7. No SQLite temporary files committed

### Important: Single-Writer Rule

**Forbidden:**
```
❌ Two agents editing locations.db in parallel
❌ Merging two SQLite files
❌ Committing WAL/SHM files
```

**Allowed:**
```
✅ A03 exclusively edits and checkpoints database
✅ Other agents read locations.db (read-only)
✅ A02, A04, A05 query via adapter after merge
```

### PR Template

**Head:** `data/03-oakland-locations`  
**Base:** `integration-map-app`

```markdown
## SQLite Schema and Seed Data

Database initialization with 10 Oakland charging locations.

### Schema
- Table: locations (id, name, lat, lng, address, charger_type, connectors, power_kw, source, verified_date)

### Seed Data
- 10 locations with mix of charger types
- All coordinates in Oakland bounds
- OSINT sources: PlugShare, Oakland Open Data, CEC

### Integrity
- PRAGMA integrity_check: ✓ ok
- PRAGMA wal_checkpoint: ✓ truncated
- No WAL files: ✓

### OSINT Attribution
- [source list with URLs and licenses]

### Dependencies
None (Wave 1 foundation)

### Enables
- A02 (data adapter)
- A04 (map UI)
- A05 (filters)
```

### Merge Criteria

- ✅ CI passes
- ✅ Database integrity verified
- ✅ 10 locations with complete data
- ✅ OSINT sources documented
- ✅ No temporary files
- ✅ Code review approved

---

## Agent A08: Privacy & Security Lead

**Branch:** `agent/08-privacy-security`  
**Role:** Security Engineer  
**Objective:** Draft privacy policy, CSP rules, security requirements  
**Duration:** 2 hours  
**Priority:** P0 (Wave 1) → Wave 3 (final review)

### Task Description

Establish privacy and security baselines for the static GitHub Pages application. Define Content Security Policy (CSP) rules, document privacy requirements, and audit dependencies.

### Deliverables

1. **Content Security Policy Rules Defined**
   - [ ] CSP header documented
   - [ ] Allowed sources for scripts, styles, images
   - [ ] No inline scripts (except for necessary nonces)
   - [ ] External API calls allowed (MapLibre, OSINT sources)

2. **Privacy Policy Draft**
   - [ ] Data collection practices documented
   - [ ] Geolocation usage disclosed
   - [ ] No personal data stored
   - [ ] GitHub Pages terms referenced

3. **Dependency Security Audit**
   - [ ] `npm audit` baseline established
   - [ ] Known vulnerabilities documented
   - [ ] Mitigation plan for high-severity issues
   - [ ] Dependency update policy defined

4. **Security Requirements Documented**
   - [ ] HTTPS enforced (GitHub Pages default)
   - [ ] No secrets in code (audit passes)
   - [ ] Static-site specific threats addressed
   - [ ] Recommendations for deployment

### Owned Files

- `SECURITY.md` ← Exclusive owner
- `PRIVACY.md` (draft) ← Exclusive owner

### Read-Only Files

- `package.json` (locked for audit)
- All source files

### Example CSP Header

```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' https://unpkg.com https://cdn.jsdelivr.net; 
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
  img-src 'self' https: data:; 
  font-src 'self' https://fonts.gstatic.com; 
  connect-src 'self' https://api.mapbox.com https://tiles.openstreetmap.org;
```

### Acceptance Criteria

✅ **Pass all checks:**
1. SECURITY.md with CSP rules
2. PRIVACY.md with data practices
3. `npm audit` baseline < 3 high vulnerabilities
4. No hardcoded secrets in code
5. Branch CI passes
6. Security review checklist completed

### PR Template

**Head:** `agent/08-privacy-security`  
**Base:** `integration-map-app`

```markdown
## Security & Privacy Baseline

Initial security posture for GitHub Pages deployment.

### CSP Rules
- [CSP header content]

### Privacy Policy
- Data collection: geolocation only
- No personal storage
- GitHub Pages terms included

### Dependency Audit
- npm audit: [count] vulnerabilities
- High-severity: [list]
- Mitigation: [plan]

### Security Checklist
- No secrets: ✓
- HTTPS: ✓ (GitHub Pages)
- CSP configured: ✓
- Audit complete: ✓

### Blocks
- Deployment (Wave 3)
```

### Merge Criteria

- ✅ CI passes
- ✅ CSP rules defined
- ✅ Privacy policy drafted
- ✅ Dependency audit complete
- ✅ No high-severity issues unfixed
- ✅ Security review approved

---

## Agent A09: Documentation & Content

**Branch:** `agent/09-docs-content`  
**Role:** Technical Writer  
**Objective:** Create documentation skeleton, README template, user guides  
**Duration:** 2 hours  
**Priority:** P1 (Wave 1)

### Task Description

Build the documentation structure and create templates for user-facing content. Establish a clear information architecture for developers and end users.

### Deliverables

1. **README Template**
   - [ ] Project overview
   - [ ] Feature list
   - [ ] Quick start section
   - [ ] Installation instructions
   - [ ] Usage examples
   - [ ] Contributing guidelines link
   - [ ] License reference

2. **Documentation Directory Structure**
   - [ ] `docs/01-getting-started/` with quick start
   - [ ] `docs/02-project-scope/` with roadmap
   - [ ] `docs/03-architecture/` with design decisions
   - [ ] `docs/04-design/` with design system
   - [ ] `docs/05-development/` with dev guide
   - [ ] `docs/06-submission/` with deployment checklist
   - [ ] `docs/07-security/` with security policy

3. **User-Facing Content**
   - [ ] Getting started guide
   - [ ] Feature documentation
   - [ ] Troubleshooting guide
   - [ ] FAQ section

### Owned Files

- `README.md` (main overview) ← Exclusive owner
- `docs/**/*.md` (all documentation) ← Exclusive owner

### Read-Only Files

- All source files
- Configuration files

### Example README Structure

```markdown
# Charging Station Locator MVP

A privacy-first web application to find public EV charging stations.

## 🚀 Quick Start

[5-minute setup guide]

## ✨ Features

- Interactive map of charging stations
- Distance-based filtering
- Real-time availability (future)
- Privacy-focused (no tracking)

## 📦 Installation

[Installation steps]

## 🏗️ Architecture

[High-level overview with links to docs/]

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License

MIT License
```

### Acceptance Criteria

✅ **Pass all checks:**
1. README complete with all sections
2. Documentation directory structure created
3. All markdown files lint without errors
4. Links are internal and valid
5. Grammar and formatting consistent
6. Branch CI passes

### PR Template

**Head:** `agent/09-docs-content`  
**Base:** `integration-map-app`

```markdown
## Documentation Skeleton & README

Initial documentation structure and user guides.

### README
- [x] Overview
- [x] Quick start
- [x] Features
- [x] Installation
- [x] Contributing link

### Documentation Structure
- [x] docs/01-getting-started/
- [x] docs/02-project-scope/
- [x] docs/03-architecture/
- [x] docs/04-design/
- [x] docs/05-development/
- [x] docs/06-submission/
- [x] docs/07-security/

### Content
- Getting started guide
- Feature documentation
- Troubleshooting guide
- FAQ

### Quality
- Markdown lint: ✓
- Links valid: ✓
- Grammar: ✓
```

### Merge Criteria

- ✅ CI passes
- ✅ README complete
- ✅ Documentation structure in place
- ✅ Content is clear and well-organized
- ✅ All links valid
- ✅ Content review approved

---

## Coordinator: Contract Freezing

**Role:** Swarm Coordinator  
**Branch:** `integration-map-app`  
**Objective:** Manage contracts, prevent Wave 2 start until ready

### Actions Before Wave 1 Complete

1. Monitor all 4 agent PRs
2. Ensure all CI passes
3. Review each PR for correctness
4. Merge in order: A01 → A03 → A08 → A09

### Actions When Wave 1 Complete

1. **Freeze Contracts** (document in `WAVE_1_CONTRACTS.md`)
   - Build system locked (A01 output)
   - Database schema locked (A03 shape)
   - Security requirements locked (A08)
   - Documentation structure locked (A09)

2. **Prepare Wave 2**
   - Create Wave 2 agent branches from integration-map-app
   - Distribute Wave 2 task specifications
   - Confirm all agents ready

3. **Document Integration**
   - Record merge order (A01 → A03 → A08 → A09)
   - Note any integration issues
   - Update status dashboard

---

## Wave 1 Validation Gate

**When:** All 4 agent PRs pass CI  
**Check:** 11-point validation (format, lint, typecheck, test, build, map, DB, mobile, secrets, size, docs)

```
✅ npm run format:check
✅ npm run lint
✅ npm run build
✅ Database integrity verified
✅ Documentation builds
```

If **any check fails:**
→ Create `repair/NN-description` branch  
→ Fix specific failure  
→ Add regression test  
→ Re-merge through queue

---

## Communications

### Daily Standup (Slack)

**Agent A01:**
- "Vite config complete, build passing, ready for merge"

**Agent A03:**
- "SQLite schema + 10 seeds, integrity verified, ready for merge"

**Agent A08:**
- "CSP rules + privacy draft + audit complete, ready for merge"

**Agent A09:**
- "README + docs structure complete, ready for merge"

**Coordinator:**
- "Wave 1 status: A01 ✓ A03 ✓ A08 ✓ A09 ✓ → Freezing contracts, preparing Wave 2"

### PR Comments

Each agent: Reply to CI failures immediately, fix on their branch, re-push

---

## Success Criteria: Wave 1 Complete

✅ **A01 Merged:** Vite build locked, `npm run build` succeeds  
✅ **A03 Merged:** SQLite schema + 10 locations, integrity verified  
✅ **A08 Merged:** CSP rules + privacy policy + audit  
✅ **A09 Merged:** README + documentation structure  
✅ **Contracts Frozen:** All Wave 2 dependencies documented  
✅ **Ready for Wave 2:** Agent branches created for A02-A10  

---

**Status:** 🟢 Wave 1 Foundations Active  
**Branches Created:** 4 agent + 1 coordinator  
**Agents Ready:** A01, A03, A08, A09  
**Timeline:** ~2 hours to completion  


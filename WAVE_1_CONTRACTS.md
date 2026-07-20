# Wave 1: Frozen Contracts & Integration Boundaries

**Phase:** Wave 1 Foundations  
**Status:** 🟢 Contracts Frozen (Ready for Wave 2)  
**Date:** July 20, 2026  

---

## 📋 Locked Contracts

### Build System Contract (Agent A01)

**What's Locked:**
- Vite configuration: `vite.config.js`
- Base path: `/plug`
- Output directory: `dist/`
- Build command: `npm run build`

**What Wave 2 Can Count On:**
- `npm run build` always succeeds
- `dist/` directory contains valid static artifacts
- Base path routing works for GitHub Pages
- No build-time configuration changes until Wave 3

**Files:**
```
vite.config.js          ← Locked (A01 only)
src/main.jsx            ← Locked (bootstrap only)
```

---

### Database Schema Contract (Agent A03)

**What's Locked:**
```sql
CREATE TABLE locations (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  address TEXT,
  charger_type TEXT,      -- "Level 1", "Level 2", "DC Fast"
  connectors TEXT,        -- Comma-separated: "Tesla,CCS,CHAdeMO"
  power_kw REAL,
  source TEXT,
  verified_date TEXT
);
```

**What Wave 2 Can Count On:**
- 10 representative charging locations loaded
- All coordinates in Oakland bounds (37.7-37.9, -122.2 to -122.3)
- Database passes `PRAGMA integrity_check`
- WAL checkpoint completed (`PRAGMA wal_checkpoint(TRUNCATE)`)
- No further edits to locations.db until Wave 3

**Single-Writer Rule:**
```
✅ A03 exclusively edits locations.db
❌ No other agent edits locations.db
✅ A02, A04, A05 query via read-only adapter (Wave 2)
```

**Files:**
```
src/data/locations.db   ← Locked (A03 only, single writer)
src/data/schema.sql     ← Locked (schema definition)
src/data/seed-data.json ← Locked (documented seeds)
```

---

### Security & Privacy Contract (Agent A08)

**What's Locked:**
```
Content-Security-Policy Header:
  default-src 'self'
  script-src 'self' https://unpkg.com https://cdn.jsdelivr.net
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
  img-src 'self' https: data:
  font-src 'self' https://fonts.gstatic.com
  connect-src 'self' https://api.mapbox.com https://tiles.openstreetmap.org
```

**Privacy Policy:**
- Geolocation: Optional, used only for distance calculations
- Data Storage: No personal data stored locally or remotely
- Cookies: None set by application
- Third-party: MapLibre GL and OpenStreetMap tiles only
- GDPR: Compliant (no tracking, no data collection)

**Dependency Baseline:**
- `npm audit` baseline: [count] vulnerabilities
- High-severity issues: [list and mitigation]
- Update policy: Security patches applied immediately

**What Wave 2 Can Count On:**
- No security changes until Wave 3 final review
- CSP header blocks malicious injections
- No new dependencies without security approval
- Privacy policy guides user expectations

**Files:**
```
SECURITY.md             ← Locked (A08 only)
PRIVACY.md              ← Locked (A08 only)
package.json            ← Locked (no dependency edits)
package-lock.json       ← Locked (read-only)
```

---

### Documentation Contract (Agent A09)

**What's Locked:**
```
docs/
├── 01-getting-started/
│   ├── README.md
│   ├── installation.md
│   ├── quick-start.md
│   └── running-locally.md
├── 02-project-scope/
│   ├── README.md
│   ├── roadmap.md
│   ├── goals-and-value.md
│   └── constraints.md
├── 03-architecture/
│   ├── README.md
│   ├── technical-decisions.md
│   ├── deployment-pipeline.md
│   └── data-flow.md
├── 04-design/
│   ├── README.md
│   ├── design-system.md
│   ├── wireframes.md
│   └── responsive-strategy.md
├── 05-development/
│   ├── README.md
│   ├── debugging-guide.md
│   ├── ai-collaboration.md
│   └── prompt-history.md
├── 06-submission/
│   ├── README.md
│   ├── checklist.md
│   └── interview-prep.md
└── 07-security/
    ├── README.md
    ├── security-policy.md
    └── dependencies.md
```

**README Structure (Locked):**
- Project overview (1-2 sentences)
- Quick start (5-minute setup)
- Features list
- Installation instructions
- Usage examples
- Contributing guidelines link
- License and acknowledgments

**What Wave 2 Can Count On:**
- Documentation structure doesn't change
- Navigation links work
- Content is clear and searchable
- Deployment instructions available

**Files:**
```
README.md               ← Locked (A09 only)
docs/**/*.md            ← Locked (A09 only)
docs/INDEX.md           ← Locked (navigation)
```

---

## 🔐 Locked Package.json

**What's Locked:**
```json
{
  "name": "plug",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "format:check": "prettier --check src/",
    "format": "prettier --write src/",
    "lint": "eslint src/",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "maplibre-gl": "^4.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^5.4.2",
    "typescript": "^5.5.4",
    "eslint": "^9.11.1",
    "prettier": "^3.3.3",
    "vitest": "^2.1.8",
    "@playwright/test": "^1.48.2"
  }
}
```

**No Edits:** Dependency changes forbidden during Waves 1-2  
**Rationale:** Ensures stable build and prevents conflicts

---

## 🚫 Shared Files (No Direct Edits)

These files are read-only for Wave 1-2. Only A01 may touch build config:

```
✅ EDITABLE (by assigned agent):
  vite.config.js        → A01 only
  src/data/locations.db → A03 only
  SECURITY.md           → A08 only
  PRIVACY.md            → A08 only
  README.md             → A09 only
  docs/**/*.md          → A09 only

❌ READ-ONLY (locked):
  package.json
  package-lock.json
  src/styles/main.css
  .github/workflows/deploy.yml (until Wave 2 A10)
  src/App.jsx
  index.html
```

---

## 📊 Wave 1 Merge Order & Validation

**Merge Sequence:**
1. A01 (Static Build) → merge, validate
2. A03 (SQLite) → merge, validate
3. A08 (Security) → merge, validate
4. A09 (Docs) → merge, validate

**Validation Gate (after each merge):**
- [ ] `npm run format:check` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Database integrity validated (if A03)
- [ ] Documentation builds (if A09)
- [ ] No merge conflicts
- [ ] Branch CI passes
- [ ] Code review approved

**If Any Check Fails:**
1. Stop merge queue
2. Assess failure
3. Create `repair/NN-issue` branch
4. Fix on repair branch
5. Re-merge through queue

---

## 🎯 Wave 2 Ready Conditions

Wave 2 starts **only when:**

✅ All 4 Wave 1 agents merged  
✅ All validation gates passed  
✅ Contracts frozen and documented  
✅ No outstanding integration issues  
✅ Wave 2 agent branches created  

**What Wave 2 Agents Know:**
- Build system is stable (A01)
- Database schema is fixed (A03)
- Security requirements defined (A08)
- Documentation ready (A09)
- No surprises or changes to foundations

---

## 📝 Coordinator Checklist

**Pre-Wave 1:**
- [x] integration-map-app branch created
- [x] All 4 Wave 1 agent branches created
- [x] Task specifications distributed
- [x] Communication channels open

**During Wave 1:**
- [ ] Monitor A01 progress
- [ ] Monitor A03 progress
- [ ] Monitor A08 progress
- [ ] Monitor A09 progress
- [ ] Review incoming PRs
- [ ] Validate against acceptance criteria
- [ ] Merge in order (A01 → A03 → A08 → A09)

**After Each Merge:**
- [ ] Run 11-point validation gate
- [ ] Document results
- [ ] Notify agents of success or issues
- [ ] Update status dashboard

**End of Wave 1:**
- [ ] All 4 agents merged
- [ ] All validation gates passed
- [ ] Contracts frozen (this document)
- [ ] Wave 2 branches created
- [ ] Wave 2 task specs distributed

---

## 🚀 Wave 2 Launch (Parallel: A02-A10)

Once Wave 1 contracts frozen:

**Agents Ready to Start:**
- A02: Data Adapter (depends on A01 build, A03 schema)
- A04: Map UI (depends on A01 build, A02 adapter)
- A05: Filters (depends on A02 adapter, A04 map)
- A06: Accessibility (depends on A04, A05)
- A10: Pages Integration (depends on A01 build)

**All Work in Parallel** within dependency constraints.

---

## 📞 Contract Violations

**If an agent edits a locked file:**

1. **Immediate:** Notify coordinator
2. **Revert:** Remove changes, commit revert
3. **Discuss:** Understand why violation occurred
4. **Document:** Add to lessons-learned
5. **Prevent:** Add checks to CI pipeline if needed

**Rationale:** Contracts prevent merge conflicts and ensure predictability.

---

## ✨ Success Metrics

**Wave 1 Success = Contracts Frozen**

When this document is completed:
- ✅ Build system locked and stable
- ✅ Database schema locked with 10 seeds
- ✅ Security requirements defined
- ✅ Documentation structure established
- ✅ Wave 2 ready to start

---

**Document Status:** 🟢 Active (Contracts Frozen)  
**Last Updated:** July 20, 2026  
**Next Phase:** Wave 2 Foundations (Implementation)


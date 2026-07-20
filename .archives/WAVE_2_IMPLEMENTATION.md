# Wave 2: Implementation — Parallel Feature Development

**Phase:** Implementation (Parallel Work)  
**Status:** 🟢 Launching Wave 2  
**Duration:** ~4 hours  
**Dependencies:** Wave 1 Complete + Contracts Frozen

---

## 📊 Wave 2 Agent Status

| ID | Role | Branch | Task | Dependencies | Status |
|:--:|------|--------|------|--------------|--------|
| **A02** | Data Adapter | `agent/02-data-reader` | Read SQLite, expose queries | A01, A03 | 🟡 Ready |
| **A04** | Map UI | `agent/04-map-shell` | MapLibre, markers, interactions | A01, A02 | 🟡 Ready |
| **A05** | Filters & Details | `agent/05-filter-details` | Filter controls, detail cards | A02, A04 | 🟡 Ready |
| **A06** | Accessibility | `agent/06-accessibility` | Keyboard nav, ARIA, contrast | A04, A05 | 🟡 Ready |
| **A10** | Pages Integration | `agent/10-pages-integration` | Workflow, deployment, testing | A01, A04-A05 | 🟡 Ready |

---

## 🚀 Wave 2 Agents Launching

### Agent A02: Data Adapter
**Branch:** `agent/02-data-reader`  
**Objective:** Create read-only data adapter for SQLite locations database

**Tasks:**
- [ ] Create `src/adapters/locationData.js` with query functions
- [ ] Load SQLite database (or JSON fallback)
- [ ] Implement `getLocations()` function
- [ ] Implement `searchLocations(query)` function
- [ ] Implement `getLocationById(id)` function
- [ ] Add JSDoc documentation

**Deliverables:**
```javascript
// src/adapters/locationData.js
export async function getLocations() { /* returns all locations */ }
export async function getLocationById(id) { /* returns single location */ }
export async function searchLocations(query) { /* search by name/address */ }
```

---

### Agent A04: Map UI Enhancements
**Branch:** `agent/04-map-shell`  
**Objective:** Enhance MapLibre integration with markers, interactions, responsive design

**Tasks:**
- [ ] Enhance Map.jsx with marker clustering (if many markers)
- [ ] Add user location marker (different style)
- [ ] Improve location popup with charger details
- [ ] Add zoom controls and attribution
- [ ] Implement responsive map sizing
- [ ] Add keyboard navigation to markers
- [ ] Improve mobile map experience

**Deliverables:**
```
src/components/Map.jsx (enhanced)
src/components/LocationMarker.jsx (new)
src/styles/map.css (new)
```

---

### Agent A05: Filters & Location Details
**Branch:** `agent/05-filter-details`  
**Objective:** Create filter controls and detailed location cards

**Tasks:**
- [ ] Create `src/components/Filters.jsx` with filter UI
- [ ] Create `src/components/LocationDetail.jsx` with expanded details
- [ ] Filter by: charger type, connector type, power output
- [ ] Distance filtering based on user location
- [ ] List/map view toggle
- [ ] Implement filter persistence in App state
- [ ] Style filter panel and detail cards

**Deliverables:**
```
src/components/Filters.jsx (new)
src/components/LocationDetail.jsx (new)
src/styles/filters.css (new)
```

---

### Agent A06: Accessibility Hardening
**Branch:** `agent/06-accessibility`  
**Objective:** Make app fully keyboard navigable and WCAG AA compliant

**Tasks:**
- [ ] Add keyboard navigation to all interactive elements
- [ ] Add ARIA labels to map markers
- [ ] Add ARIA roles to filter and detail sections
- [ ] Ensure 4.5:1 color contrast ratio
- [ ] Implement focus indicators
- [ ] Add skip links for keyboard users
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Add reduced motion support

**Deliverables:**
```
src/components/AccessibilityProvider.jsx (new)
Accessibility audit report
```

---

### Agent A10: Pages Integration & Deployment
**Branch:** `agent/10-pages-integration`  
**Objective:** Verify GitHub Actions workflow, deployment, and base path routing

**Tasks:**
- [ ] Review `.github/workflows/deploy.yml`
- [ ] Verify base path `/plug` routing works
- [ ] Test static artifact validation
- [ ] Create deployment preview checklist
- [ ] Verify CNAME points to plug.vln.gg
- [ ] Test GitHub Pages deployment
- [ ] Document deployment process

**Deliverables:**
```
.github/workflows/deploy.yml (verified)
docs/06-submission/deployment-checklist.md (updated)
```

---

## 🔄 Parallel Execution Model

```
Wave 2 Start
    ↓
[A02, A04, A05, A06, A10] run in parallel
    ↓
Each agent:
  1. Create branch from integration-map-app
  2. Implement features
  3. Run tests & validation
  4. Create PR
    ↓
Serial Merge Queue (A02 → A04 → A05 → A06 → A10)
    ↓
Validation after each merge
    ↓
Wave 2 Complete
```

---

## ✅ Wave 2 Validation Checklist

After **every** merge:

- [ ] `npm run format:check` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] `dist/` contains valid artifacts
- [ ] Map loads at correct base path
- [ ] Database queries return data
- [ ] Filters respond to input
- [ ] Mobile viewport responsive
- [ ] No console errors
- [ ] Keyboard navigation works
- [ ] ARIA attributes present

---

## 📋 Merge Order (Serial Queue)

1. **A02** (Data Adapter) → Base dependency for others
2. **A04** (Map UI) → Uses data adapter
3. **A05** (Filters) → Uses map + adapter
4. **A06** (Accessibility) → Final pass over components
5. **A10** (Pages Integration) → Deployment validation

---

## 🎯 Wave 2 Success Criteria

**Complete When:**
- ✅ All 5 agents' PRs merged
- ✅ All validation gates passed
- ✅ Features work in integrated build
- ✅ Mobile/desktop tested
- ✅ No regressions from Wave 1
- ✅ Ready for Wave 3 testing

---

**Document Status:** 🟢 Active (Wave 2 Launching)  
**Created:** July 20, 2026  
**Next Phase:** Wave 3 (Testing & Validation)

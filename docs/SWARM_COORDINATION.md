# Wave 1 Swarm Coordination Framework

This document explains the parallel multi-agent development model (swarm coordination) used to build the Charging Station Locator MVP efficiently.

## Table of Contents

- [Overview](#overview)
- [Wave Model](#wave-model)
- [Agent Roles](#agent-roles)
- [Dependency Management](#dependency-management)
- [Merge Queue & Validation](#merge-queue--validation)
- [Branch Strategy](#branch-strategy)
- [Parallel Development](#parallel-development)
- [Failure Recovery](#failure-recovery)

## Overview

### The Swarm Concept

**Traditional Sequential Development:**
```
Task 1 → Task 2 → Task 3 → Task 4
(4 days)
```

**Swarm Parallel Development:**
```
Task 1 ──┐
Task 2 ──┼─→ Integration ──→ Validation ──→ Merge
Task 3 ──┤                    (Serial gate)
Task 4 ──┘
(1-2 days)
```

### Why Swarm?

✅ **Speed** — 4 agents in parallel vs. sequential  
✅ **Quality** — Specialized focus per agent  
✅ **Isolation** — Agents don't block each other  
✅ **Safety** — Serial merge queue prevents integration chaos  

## Wave Model

### Three Waves of Work

#### Wave 1: Foundations (Current)

**4 Critical Agents**

| Agent | Role | Deliverable | Duration |
|-------|------|-------------|----------|
| **A01** | Static Build | Vite configuration locked for deployment | 2-3 hours |
| **A03** | SQLite Owner | Database schema + seed data (single-writer) | 2-3 hours |
| **A08** | Security | SECURITY.md + PRIVACY.md + CSP rules | 2-3 hours |
| **A09** | Documentation | README + docs/ structure + guides | 2-3 hours |

**Parallel Execution:**
```
A01 ──┐
A03 ──┼─→ Integration → Validation Gate → Frozen Contracts
A08 ──┤
A09 ──┘
```

**Output:** Frozen contracts (WAVE_1_CONTRACTS.md)

**Acceptance:** All 4 agents merged + validation pass → Wave 1 complete

#### Wave 2: Implementation (Post-MVP)

**5 Implementation Agents**

| Agent | Focus | Domain |
|-------|-------|--------|
| **A02** | UI Components | React components, styling, responsive design |
| **A04** | Geolocation | Browser location API, distance calculation |
| **A05** | Map Integration | MapLibre GL, tile handling, markers |
| **A06** | Search & Filter | Station search, charger type filters |
| **A10** | Testing | Unit/E2E tests, performance, accessibility |

**Parallel Execution:** All 5 work independently based on Wave 1 contracts

**Output:** Full feature implementation

#### Wave 3: Validation & Refinement (Post-Wave 2)

**Quality Assurance Agents**
- Mobile testing on 5+ devices
- Accessibility audit (WCAG 2.2 AA)
- Performance optimization
- Cross-browser testing
- Production deployment

## Agent Roles

### Agent A01: Static Build Manager

**Responsibility:** Lock build pipeline and static deployment

**Deliverables:**
- ✅ vite.config.js configured for GitHub Pages
- ✅ Base path routing set to `/plug/`
- ✅ Build optimization (tree-shake, minify, chunks)
- ✅ Production build tested locally
- ✅ Deployment documented

**Contract Locked:**
- Build command: `npm run build`
- Output directory: `dist/`
- Target: ES2020 or compatible
- No changes to React/Vite versions without Wave 1 approval

### Agent A03: SQLite Data Owner

**Responsibility:** Create and own the database

**Deliverables:**
- ✅ SQLite schema (locations table + indexes)
- ✅ Seed data (10 OSINT-verified Oakland stations)
- ✅ Database initialization scripts (Python + Node.js)
- ✅ Integrity verification (PRAGMA checks)
- ✅ Single-writer enforcement

**Contract Locked:**
- Database path: `src/data/locations.db`
- Schema file: `src/data/schema.sql`
- Seed data: `src/data/seed-data.json`
- A03 exclusive writer, all others read-only
- No direct data modification after merge

### Agent A08: Security & Privacy

**Responsibility:** Security architecture and policy

**Deliverables:**
- ✅ SECURITY.md (CSP, HTTPS, vulnerability disclosure)
- ✅ PRIVACY.md (zero data collection, GDPR/CCPA)
- ✅ Security headers configuration
- ✅ Dependency audit (Dependabot, Socket.dev)
- ✅ Incident response procedures

**Contract Locked:**
- CSP headers enforced in production
- No tracking or analytics
- Dependency audit required on all PRs
- Security review gate on main branch

### Agent A09: Documentation & Content

**Responsibility:** User and developer documentation

**Deliverables:**
- ✅ Comprehensive README.md updates
- ✅ docs/ directory structure
- ✅ CONTRIBUTING.md (contribution guidelines)
- ✅ ARCHITECTURE.md (system design)
- ✅ DATA_SOURCES.md (OSINT sourcing)
- ✅ This file (SWARM_COORDINATION.md)

**Contract Locked:**
- Documentation structure standardized
- Code examples updated with new features
- API docs generated for future backends

## Dependency Management

### Inter-Agent Dependencies

```
A01 (Static Build)
  ├─ Required by: Everyone (build tool)
  └─ Must complete first

A03 (SQLite Owner)
  ├─ Required by: A02, A04, A05, A06 (data access)
  └─ Must complete before Wave 2

A08 (Security & Privacy)
  ├─ Required by: A02 (CSP rules), A05 (secure tiles)
  └─ Can proceed in parallel

A09 (Documentation)
  ├─ Required by: Contributors, future waves
  └─ Can proceed in parallel
```

### Serial Merge Order

**Why Serial?** Each merge updates production contracts → next agent uses current state

```
1. A01 merges → Vite build contract locked ✅
   ↓ Validation gate (builds successfully)
   ↓
2. A03 merges → SQLite contract locked ✅
   ↓ Validation gate (database integrity verified)
   ↓
3. A08 merges → Security/Privacy locked ✅
   ↓ Validation gate (CSP headers in place)
   ↓
4. A09 merges → Docs complete ✅
   ↓ Validation gate (all docs rendering)
   ↓
Wave 1 Complete ✅ (Contracts Frozen, Wave 2 can start)
```

## Merge Queue & Validation

### 11-Point Validation Gate

After each agent's merge, verify:

| # | Check | Tool | Pass/Fail |
|---|-------|------|-----------|
| 1 | Build succeeds | `npm run build` | ✅/❌ |
| 2 | No console errors | Browser DevTools | ✅/❌ |
| 3 | No security alerts | Socket Security | ✅/❌ |
| 4 | No dependency vulns | npm audit | ✅/❌ |
| 5 | Responsive on mobile | Chrome DevTools 375px | ✅/❌ |
| 6 | Responsive on tablet | Chrome DevTools 768px | ✅/❌ |
| 7 | Responsive on desktop | 1920px display | ✅/❌ |
| 8 | Keyboard navigation | Tab/Arrow keys work | ✅/❌ |
| 9 | Git history clean | No merge conflicts | ✅/❌ |
| 10 | Documentation updated | CHANGELOG reflects merge | ✅/❌ |
| 11 | Contract verified | Locked APIs unchanged | ✅/❌ |

**All 11 must pass before next merge**

### Validation Checklist Template

```markdown
## Post-Merge Validation (Agent A0X)

### Build
- [x] npm run build succeeds
- [x] dist/ folder created
- [x] No build warnings

### Security
- [x] npm audit passes
- [x] Socket Security scans pass
- [x] CSP headers correct

### Responsive Design
- [x] Mobile (375px): App layout correct
- [x] Tablet (768px): Responsive elements work
- [x] Desktop (1920px): Split layout functional

### Accessibility
- [x] Keyboard navigation: Tab moves focus
- [x] Screen reader: ARIA labels present
- [x] Color contrast: WCAG AA verified

### Git & Documentation
- [x] Clean merge, no conflicts
- [x] CHANGELOG.md updated
- [x] WAVE_1_CONTRACTS.md reflects merged state

### Contract Verification
- [x] A01 build contract: Unchanged ✅
- [x] A03 SQLite contract: Unchanged ✅
- [x] A08 security contract: Unchanged ✅

**Result:** ✅ PASS — Ready for next agent
```

## Branch Strategy

### Branch Structure

```
main (production)
  ↓ (only from integration-map-app after validation)
  
integration-map-app (integration branch)
  ↑ ↑ ↑ ↑ (PR merges from agents)
  │ │ │ └─ agent/09-docs-content
  │ │ └─── agent/08-privacy-security
  │ └───── data/03-oakland-locations
  └─────── agent/01-static-build
```

### Creating an Agent Branch

```bash
# Start from integration-map-app
git fetch origin
git checkout integration-map-app
git pull origin integration-map-app

# Create agent branch
git checkout -b agent/NN-agent-description
# Example: agent/01-static-build, agent/08-privacy-security
```

### Branch Protection Rules

**On main:**
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks (CI/CD tests pass)
- ✅ Require branches up to date
- ❌ Allow force push (disabled)
- ❌ Allow deletions (disabled)

**On integration-map-app:**
- ✅ Require status checks
- ✅ Dismiss stale reviews
- ❌ Require reviews (for speed)

## Parallel Development

### Working in Parallel

Each agent develops independently:

**Agent A01 (in agent/01-static-build):**
```bash
# Works on vite.config.js
# Tests with npm run build
# Creates PR → merges
```

**Agent A03 (in data/03-oakland-locations):**
```bash
# Works on src/data/schema.sql
# Works on src/data/seed-data.json
# Creates PR → merges (after A01 validation)
```

**Agent A08 (in agent/08-privacy-security):**
```bash
# Works on SECURITY.md + PRIVACY.md
# Tests with npm run lint
# Merges in parallel (no conflicts with A01/A03)
```

**Agent A09 (in agent/09-docs-content):**
```bash
# Works on docs/ directory
# Doesn't conflict with code changes
# Merges in parallel
```

### No Conflicts Between Agents

**Why separate branches work:**
- A01 modifies: `vite.config.js`
- A03 modifies: `src/data/*`, `setup-db.*`
- A08 modifies: `SECURITY.md`, `PRIVACY.md`
- A09 modifies: `README.md`, `docs/*`

→ **No file conflicts** (can merge in any order)

But merge to `main` must be **serial** (for validation gates).

## Failure Recovery

### If A01 Merge Fails Validation

**Scenario:** Build error after A01 merge

**Recovery:**
```bash
1. Identify error
   npm run build  # See build failure
   
2. Fix issue (A01 agent)
   # Fix vite.config.js error
   git add vite.config.js
   git commit -m "fix: vite config build error"
   
3. Push & update PR
   git push
   # GitHub updates PR with new commit
   
4. Re-run validation
   npm run build  # Now passes ✅
   
5. Proceed to next merge (A03)
```

### If A03 Database Integrity Fails

**Scenario:** PRAGMA integrity_check fails after merge

**Recovery:**
```bash
1. Verify database
   sqlite3 src/data/locations.db "PRAGMA integrity_check;"
   
2. Fix data issue (A03 agent)
   # Fix seed-data.json or schema
   git add src/data/*
   git commit -m "fix: database integrity violation"
   
3. Rebuild database
   npm run setup-db
   
4. Verify again
   npm run setup-db  # Passes ✅
   
5. Push & re-run validation
```

### If Validation Gate Blocks Merge

**Scenario:** Socket Security blocks PR due to dependency vulnerability

**Handling:**
```bash
Option 1: Fix vulnerability
- Update package
- Retest
- Re-run validation

Option 2: Acknowledge acceptable risk
- If dev-only dependency:
  @SocketSecurity ignore npm/package@version
- Document in PR
- Proceed if risk acceptable

Option 3: Defer to next wave
- If not critical for Wave 1
- Log as issue
- Continue with other agents
```

### If Multiple Agents Have Conflicts

**Scenario:** A03 and A04 both modify same file (unlikely)

**Prevention:**
- Clear agent boundaries
- No overlapping responsibilities
- Review file ownership before assignment

**Recovery (if it happens):**
```bash
1. Communicate between agents
2. Coordinate merge order
3. One agent rebases on other's changes
4. Re-run validation
```

### Rollback Procedure

**If production deploy has critical bug:**

```bash
1. Revert merge commit
   git revert -m 1 <merge-commit-hash>
   
2. Push to main
   git push origin main
   
3. GitHub Pages rolls back (~30 seconds)

4. Root cause analysis
   # Identify which agent caused issue
   
5. Fix in agent branch
   # A0X fixes error locally
   # Retests
   
6. Re-merge
   # Clean commit, new PR
   # Passes validation
   # Merges to main
```

## Monitoring & Communication

### Status Tracking

**Public:** GitHub PR activity visible in repo

**Team:** Async communication via commits
```bash
# Commit message indicates status
"docs: security policy complete (ready for merge)"
"fix: database corruption - retesting"
"wip: reviewing A03 branch before merge"
```

### Bottleneck Detection

**If A01 takes too long:**
- A02-A10 can still work (use mock contracts)
- Adjust timeline or add support

**If validation gate fails repeatedly:**
- Escalate to project manager
- Adjust gate criteria if necessary
- Ask for specialist help

**If merge conflicts arise:**
- Rare (due to separate file domains)
- Communicate between agents
- Coordinate resolution

## After Wave 1

### Hand-Off to Wave 2

Once Wave 1 completes:

✅ **WAVE_1_CONTRACTS.md frozen** — all locked interfaces documented

→ **Wave 2 agents** reference contracts

```javascript
// Wave 2 A02 (UI Components) uses Wave 1 contracts:

// Build contract (A01)
const build = 'npm run build';  // Locked

// Data contract (A03)
import locations from './src/data/seed-data.json';

// Security contract (A08)
// CSP headers enforced (no inline scripts)

// Docs contract (A09)
// Update README when adding features
```

### Wave 2 Parallel Work

Wave 2 agents work in parallel on Wave 1 foundation:

```
Wave 2 Agents (5 agents, fully parallel):
A02 (UI) ─┐
A04 (GEO) ┼─→ Integration → Validation → Merge
A05 (Map) ┤
A06 (Search) ┼─→ Daily integration tests
A10 (Tests) ┘
(4-5 days parallel)
```

### Continuous Improvement

- Wave 1 agents remain available for critical bugs
- Security updates applied immediately
- Data (A03) can receive submissions
- Docs (A09) continuously updated

---

**Last Updated:** 2026-07-20  
**Framework By:** Agent PM (Project Manager)  
**Maintained By:** Agent A09 (Documentation & Content)

**Next Wave:** Wave 2 implementation begins after Wave 1 validation gate passes.

**Questions about swarm coordination?** See [CONTRIBUTING.md](CONTRIBUTING.md) or open a GitHub issue.

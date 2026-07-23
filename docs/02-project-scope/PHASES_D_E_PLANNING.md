# Phases D & E: Staleness Automation & Licensing/Privacy

**Status:** Planned (Blocked on Phase C Completion)  
**Implementation Order:** Phase D (staleness), then Phase E (licensing)  
**Estimated Timeline:** 2-3 weeks post-Phase C

---

## Phase D: Staleness and Liveness Automation

**Goal:** Auto-demote venues to "Needs recheck" tier when evidence stales (OSM changes, website down, hours missing)

### Acceptance Criteria (from DATA_PIPELINE_PLAN.md)

- [ ] Venues tracked for `missing_since` (date they disappeared from feed)
- [ ] HTTP liveness checks run weekly against known venue websites/hours endpoints
- [ ] Auto-demotion rule: if venue missing from OSM for 30+ days OR website down for 7+ days → demote to `stale` tier
- [ ] Stale venues excluded from auto-publish rule; require re-verification before republish
- [ ] Unit tests for liveness checks, demotion logic, tier transitions
- [ ] Workflow: weekly liveness-check scheduled task
- [ ] Landing page renders stale venues with "Needs recheck · Last confirmed [date]" badge

### Implementation Pieces

**Schema Changes:**
```sql
ALTER TABLE venues ADD COLUMN missing_since DATE;
ALTER TABLE venues ADD COLUMN last_checked DATE;
ALTER TABLE venues ADD COLUMN last_check_status TEXT; -- 'online', 'offline', 'unknown'
```

**New Workflow:**
- `.github/workflows/staleness-check.yml` — Weekly Monday 05:00 UTC
- Reads venues table
- For each venue with known website/hours endpoint: HTTP HEAD/GET → records result
- For each venue missing from OSM for 30+ days: demote to `stale` tier
- Commit-on-diff with `data:` prefix

**New Script:**
- `scripts/etl/staleness-check.mjs` — HTTP checks, tier demotion logic
- `scripts/etl/lib.js` — Add `demoteStalVenue()` function

**Testing:**
- Unit tests for HTTP check logic (mock network failures)
- Unit tests for demotion rules
- Integration test: simulate stale venue → verify demoted in JSON

**Design System Updates:**
- `.badge--stale` styling (muted color, warning icon)
- Landing page: sort stale venues to bottom

---

## Phase E: Licensing, Attribution & Privacy

**Goal:** Full ODbL compliance and privacy policy alignment

### Acceptance Criteria (from DATA_PIPELINE_PLAN.md)

- [ ] ODbL attribution in footer ✅ (Done in Phase A)
- [ ] LICENSE-DATA file ✅ (Done in Phase A)
- [ ] README.md: expanded "Data Sources" section with full attribution
- [ ] Data Pipeline Plan linked from README (methodology transparency)
- [ ] Privacy Policy updated:
  - [ ] Community submissions flow (no email in Issue Form; Resend in Phase C)
  - [ ] Data retention policy (venues kept indefinitely; submissions deleted after 7 days if unconfirmed)
  - [ ] Resend integration (Audiences only, no other PII storage)
  - [ ] OSM ODbL compliance (linked from footer)
  - [ ] No tracking, no analytics (confirm static-only approach)
- [ ] CONTRIBUTING.md: note on data sourcing (how to report bad data, submit corrections)

### Implementation Pieces

**Documentation Updates:**

1. **README.md — Data Sources Section:**
   ```markdown
   ## Data Sources
   
   This map draws charging locations from three sources:
   
   ### Primary: OpenStreetMap (ODbL Licensed)
   - Daily automated fetch via Overpass API
   - Normalized and deduplicated
   - Outlet presence inferred from venue type (library, transit station, etc.)
   - **Auto-listed** venues marked with neutral badge (not field-verified yet)
   
   ### Secondary: Community Submissions (GitHub Issues)
   - Users submit via public Issue Form
   - Hourly validation (geofence, category, sanitization)
   - Valid entries become **Community** tier venues
   - Reviewed by volunteers; marked pending field-check
   
   ### Tertiary: BART, Socrata, Library Hours (Future - Phase D)
   - Two-source corroboration rule for verified tier
   - Scheduled daily checks for changes
   
   **Attribution:** See [LICENSE-DATA](LICENSE-DATA) and footer for full ODbL compliance.
   **Plan:** [Data Pipeline Methodology](docs/02-project-scope/DATA_PIPELINE_PLAN.md)
   ```

2. **Privacy Policy — New Sections:**
   ```markdown
   ### Community Submissions
   
   When you submit a charging location via our GitHub Issue Form:
   - Your submission is posted publicly to our GitHub repository
   - We do NOT collect email in the form (public exposure risk)
   - In Phase C, we'll send optional confirmation emails via Resend for updates
   - Email is stored only in Resend Audiences (not in our repo)
   - No email is required; submissions are published as-is
   
   ### Data Retention
   
   - Venues: Kept indefinitely in SQLite database
   - Community submissions: Issue remains open for community review
   - Unconfirmed email subscriptions (Phase C): Auto-expire after 7 days
   - Resend Audiences: Managed per Resend privacy policy
   
   ### Resend Integration (Phase C)
   
   We use Resend to send optional confirmation emails for community submissions.
   - Resend is sole holder of email addresses
   - We never store emails in our GitHub repository
   - See [Resend Privacy Policy](https://resend.com/privacy)
   
   ### Analytics & Tracking
   
   We do NOT use Google Analytics, Sentry, Mixpanel, or other trackers.
   The map runs entirely client-side; no data leaves your browser except:
   - Map tiles from OpenStreetMap (see their privacy policy)
   - Geolocation: browser API only, never sent to our servers
   - Static data: `locations.json` from GitHub Pages CDN
   ```

3. **CONTRIBUTING.md — Data Quality Section:**
   ```markdown
   ## Reporting Bad Data
   
   Found incorrect information about a charging location?
   - **For OSINT data (OpenStreetMap sources):** Edit the venue directly on OpenStreetMap.org
   - **For community submissions:** Comment on the related GitHub Issue with corrections
   - **For hours/availability:** Open a GitHub Issue with [data-correction] tag
   
   We re-ingest data daily and hourly; your fixes will appear within 24 hours.
   ```

**No Code Changes:**
- Phase E is purely documentation
- No new workflows, no schema changes, no tests
- Builds on completed Phase A-C work

### Timeline

Phase E should run **in parallel with Phase D** (while liveness checks deploy) since it's documentation-only.

---

## Dependencies & Blockers

| Phase | Blocker | Status |
|-------|---------|--------|
| **C** | Resend account & API key | Pending (design decision) |
| **C** | Ephemeral endpoint setup | Pending Phase C design |
| **D** | HTTP liveness library | Available: `node-fetch` (built-in) |
| **D** | Staleness schema | Ready to deploy |
| **E** | Privacy policy template | Ready to fill |
| **E** | README template | Ready to fill |

---

## Rollout Order

1. ✅ **Phase A:** OSINT ETL (COMPLETE)
2. ✅ **Phase B:** Community submissions (COMPLETE)
3. ⏳ **Phase C:** Resend confirmations (NEXT — blocked on design decision)
4. ⏳ **Phase D:** Staleness automation (after Phase C)
5. ⏳ **Phase E:** Licensing/privacy (parallel with D)

---

## Definition of Done (v2.1.0 Release)

All five phases shipped:
- [ ] Daily OSINT ETL running; 39+ venues auto-listed
- [ ] GitHub Issue Form accepting submissions; hourly ingest working
- [ ] Confirmation emails sent via Resend; subscribers tracked in Audiences
- [ ] Weekly liveness checks running; stale venues auto-demoted
- [ ] Privacy policy and README updated with full attribution
- [ ] All unit tests passing (18 → 28+ tests after phases C-D)
- [ ] No data in repo except SQLite binary and JSON output
- [ ] Zero backend; zero hosting cost; full GitHub Pages deployment

---

**Related:** [Roadmap](roadmap.md) | [Data Pipeline Plan](DATA_PIPELINE_PLAN.md) | [Implementation Summary](../05-development/IMPLEMENTATION_SUMMARY.md)

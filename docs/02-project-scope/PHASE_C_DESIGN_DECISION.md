# Phase C: Resend Confirmations + Opt-in — Design Decision

**Status:** Design Decision Pending  
**Blocking:** Phase C Implementation  
**Due:** Before Phase C starts  
**Owner:** Project Team (Human Decision Required)

---

## Problem Statement

Community submissions via GitHub Issue Forms need email confirmation to:
1. **Verify contact validity** — Ensure submitters can receive updates
2. **Establish opt-in consent** — Comply with privacy/email best practices
3. **Enable future contact** — Allow subscribers to receive updates on their submission status

Currently: Issue Forms deliberately **omit email fields** to avoid exposing PII on public GitHub issues (all submissions are public).

---

## Design Options

### Option A: Reply-to-Confirm (Recommended)
**Workflow:**
1. Submitter creates Issue Form (no email field)
2. Action detects `submission` label → stores name/address/submission_id in Resend Audiences (encrypted)
3. Action sends confirmation email from `noreply@resend.app` with subject "Confirm your charging location suggestion"
4. Email body: plain text + verification link
5. Link → temporary ephemeral endpoint (time-limited, single-use) that confirms subscription
6. Confirmed submissions marked `verified:true` in SQLite
7. Unconfirmed: auto-expire after 7 days if no confirmation click

**Pros:**
- ✅ Zero PII stored in repo (Resend Audiences only)
- ✅ Submitter can correct email if typo (Resend bounce → manual re-confirm)
- ✅ Privacy-friendly: no email collected publicly
- ✅ Cheap: Resend free tier includes 100 emails/day
- ✅ Simple UX: one email, one click

**Cons:**
- ⚠️ Requires ephemeral endpoint (temporary Node.js handler or GitHub Pages form-processor)
- ⚠️ Email typos = lost confirmations
- ⚠️ Depends on Resend delivery reliability

**Implementation Complexity:** Medium (endpoint, Resend SDK, confirmation flow)

---

### Option B: One-Time-Use Link (Alternative)
**Workflow:**
1. Submitter creates Issue Form with **inline email field** (marked confidential)
2. Action detects `submission` → stores email in Resend Audiences + memo field
3. Action sends confirmation email with subject "Confirm: [Location Name]"
4. Email body includes one-time-use verification token (16-char random, Resend memo field)
5. Submitter clicks link with token → ephemeral endpoint confirms + deletes token
6. Confirmed subscriptions added to Audiences for future updates

**Pros:**
- ✅ Direct email collection (submitter consciously provides)
- ✅ One-time link pattern (familiar UX)
- ✅ Token-based (no session needed)

**Cons:**
- ❌ Email **appears publicly** in GitHub Issue body (privacy leak risk)
- ⚠️ Requires more security (token validation, rate limiting)
- ⚠️ More complex confirmation logic
- ⚠️ Potential spam if email field exposed

**Implementation Complexity:** High (email scraping risk, token management, security)

---

### Option C: Batch Digest (Simple)
**Workflow:**
1. Submitter creates Issue Form (no email)
2. Weekly digest email sent to all confirmed subscribers
3. Digest shows: "5 new charging locations near you" + links to map
4. Submitter clicks subscribe button (one-time) → confirmed

**Pros:**
- ✅ Minimal initial PII collection
- ✅ Batched emails (lower operational overhead)
- ✅ Scales to thousands of subscribers

**Cons:**
- ❌ Delays confirmation by up to 7 days
- ❌ Requires maintaining subscriber list separately
- ⚠️ Lower immediate feedback for submitters

**Implementation Complexity:** High (scheduling, templating, list management)

---

## Recommendation

**Choose Option A: Reply-to-Confirm** because:
1. **Privacy-first:** No email collected publicly; Resend is sole PII holder
2. **Low friction:** Submitter gets immediate confirmation (not 7-day batch)
3. **Compliance:** Opt-in model with explicit consent
4. **Cost:** Resend free tier sufficient for foreseeable volume (100 emails/day)
5. **Implementation:** Medium complexity, high confidence in Resend APIs

---

## Next Steps (Post-Decision)

1. **Confirm option choice** → Proceed with Option A implementation
2. **Resend account setup** → Create project, get API key
3. **Repo secret** → Add `RESEND_API_KEY` to GitHub Actions secrets
4. **Implement** → See Phase C tasks in roadmap
5. **Testing** → Unit tests for confirmation flow; staging workflow test

---

## Phase C Implementation Checklist (After Decision)

- [ ] Resend account created; API key in GitHub Actions secrets
- [ ] Updated Issue Form with `<!-- email collected confidentially -->` note
- [ ] Confirmation email template (plain text + link)
- [ ] Ephemeral endpoint handling (POST to confirm token)
- [ ] Unit tests for token validation, email sending, expiry logic
- [ ] Workflow updated: `ingest-submissions.yml` calls Resend on valid submissions
- [ ] SQLite schema: add `email_confirmed` and `confirmed_at` columns
- [ ] Documentation: privacy policy updated with Resend + confirmation flow
- [ ] E2E test: create submission → receive email → confirm → verify landed in venues

---

## Decision Record

**Decision:** [To be filled by project team]  
- [ ] Option A: Reply-to-Confirm (Recommended)
- [ ] Option B: One-Time-Use Link
- [ ] Option C: Batch Digest
- [ ] Other: _______

**Decided By:** [Name]  
**Date:** [YYYY-MM-DD]  
**Rationale:** [Brief explanation of choice]

---

**Related:** [Roadmap](roadmap.md#phase-c--resend-confirmations--opt-in) | [Data Pipeline Plan](DATA_PIPELINE_PLAN.md#phase-c--resend-confirmations--opt-in)

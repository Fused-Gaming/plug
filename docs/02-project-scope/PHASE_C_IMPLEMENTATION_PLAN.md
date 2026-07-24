# Phase C Implementation Plan: Reply-to-Confirm Email Workflow

**Status:** In Progress  
**Decision:** Option A: Reply-to-Confirm (Privacy-First)  
**Timeline:** 3-5 days  
**Owner:** Development Team  

---

## Executive Summary

Phase C implements a privacy-first email confirmation workflow for community venue submissions. Submissions flow through GitHub Issue Forms (no email field), trigger confirmation emails via Resend, and require single-click verification before being published to the venue database.

**Key principle:** Email is collected and held only by Resend; never stored in the GitHub repository.

---

## Architecture

```
GitHub Issue (submission)
    ↓
GitHub Actions: ingest-submissions.yml (hourly)
    ↓
Parse + Validate (XSS, geofence, category)
    ↓
Extract contact info from Issue metadata (commenter email OR placeholder)
    ↓
Call Resend API
    ├→ Create/update Audience contact
    ├→ Send confirmation email with ephemeral link
    └→ Store token + expiry in Resend memo
    ↓
Commenter clicks link in email
    ↓
Ephemeral endpoint (time-limited, single-use)
    ├→ Validates token against Resend Audiences
    ├→ Marks contact as confirmed
    └→ Returns success page
    ↓
Confirmed venues published to locations.json
```

---

## Implementation Checklist

### Phase 1: Setup & Secrets (Day 1)

- [ ] **Create Resend account**
  - Sign up at https://resend.com
  - Create project named "plug-venue-confirmations"
  - Get API key (format: `re_...`)
  - Document: store temporarily in `/tmp/resend-api-key` (never commit)

- [ ] **Add GitHub Actions secret**
  - Settings → Secrets and variables → Actions
  - New secret: `RESEND_API_KEY` = `re_...` (from Resend)
  - Verify: no test value in repo

- [ ] **Verify vln email**
  - Confirm sender email: `queen.vln.gg` (or actual vln domain)
  - Add as verified sender in Resend dashboard
  - Document in code as: `RESEND_FROM_EMAIL` variable

- [ ] **Create ephemeral endpoint**
  - Simple Node.js handler or GitHub Pages form processor
  - Endpoint: `https://plug.vln.gg/api/confirm-submission`
  - Method: POST with `token` in request body
  - Response: JSON `{confirmed: true}` or error

### Phase 2: Code Implementation (Days 2-3)

#### 2a. Schema Updates (SQLite)

```sql
ALTER TABLE venues ADD COLUMN email_confirmed BOOLEAN DEFAULT 0;
ALTER TABLE venues ADD COLUMN confirmed_at DATETIME;
ALTER TABLE venues ADD COLUMN resend_token TEXT;
ALTER TABLE venues ADD COLUMN token_expires DATETIME;
```

**File:** `scripts/etl/schema.sql`

#### 2b. Update Issue Form Template

**File:** `.github/ISSUE_TEMPLATE/location.yml`

Add confidentiality notice:
```yaml
- type: textarea
  attributes:
    label: Privacy Note
    description: |
      This form is public. Do NOT include personal information (phone, email, address).
      
      In Phase C, we'll send you a separate confirmation email via Resend (privacy-first, 
      no data stored in GitHub). See PHASE_C_DESIGN_DECISION.md for details.
    value: ✓ I understand my submission will be public
```

#### 2c. Resend Email Template

**File:** `scripts/etl/templates/confirmation-email.txt`

```plaintext
Subject: Confirm your charging location suggestion for plug.vln.gg

Hi there,

Thank you for suggesting a charging location! 

To confirm your submission and help us verify its accuracy, please click the link below:

[CONFIRMATION_LINK]

This link is valid for 7 days. If you don't click it, your submission will remain pending review.

---
Privacy: This email is sent by Resend and your address is stored only with Resend.
We never save email addresses in our GitHub repository.

Questions? Reply to this email or open an issue at https://github.com/fused-gaming/plug/issues

---
plug.vln.gg | Open sources of power
```

#### 2d. Submission Processing Script

**File:** `scripts/etl/submissions.js` (extend existing)

Add functions:
```javascript
// Extract contact email from GitHub Issue metadata
async function extractContactEmail(issueData) {
  // Return issue creator email or placeholder
  return issueData.user.email || `anonymous-${issueData.number}@github.invalid`;
}

// Call Resend API to send confirmation
async function sendConfirmationEmail(contact, submissionData, resendApiKey) {
  const token = generateRandomToken(32);
  const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to: contact.email,
      subject: 'Confirm your charging location suggestion',
      text: buildEmailBody(submissionData, token),
      reply_to: process.env.REPLY_TO_EMAIL,
      // Store token in Resend memo for later verification
      custom_variables: {
        verification_token: token,
        expires_at: expiryDate.toISOString(),
        submission_id: submissionData.id,
      }
    })
  });
  
  return { resendId: response.id, token, expiryDate };
}

// Validate confirmation token
async function validateConfirmationToken(token, resendApiKey) {
  // Query Resend Audiences API for this token
  // Return true if valid and not expired
}
```

#### 2e. Workflow Update

**File:** `.github/workflows/ingest-submissions.yml` (extend existing)

```yaml
- name: Send confirmation emails
  env:
    RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
    RESEND_FROM_EMAIL: ${{ secrets.RESEND_FROM_EMAIL || 'queen.vln.gg' }}
  run: |
    node scripts/etl/submissions.js --send-confirmations
```

#### 2f. Ephemeral Endpoint

**File:** `scripts/api/confirm-submission.mjs` (new)

```javascript
// Simple handler for confirmation link
export async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { token } = JSON.parse(request.body);
  
  try {
    const isValid = await validateConfirmationToken(token, process.env.RESEND_API_KEY);
    
    if (isValid) {
      // Mark in SQLite and return success
      return new Response(JSON.stringify({ confirmed: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { 
      status: 400 
    });
  }
}
```

### Phase 3: Testing (Days 3-4)

**File:** `scripts/etl/__tests__/resend-confirmation.test.js` (new)

```javascript
describe('Resend Confirmation Workflow', () => {
  test('sends confirmation email with valid token', async () => {
    // Mock Resend API
    // Verify email body contains confirmation link
    // Verify token is stored in Resend memo
  });

  test('validates token correctly', async () => {
    // Generate token
    // Verify non-expired tokens pass
    // Verify expired tokens fail
  });

  test('marks venue as confirmed after link click', async () => {
    // Simulate confirmation endpoint call
    // Verify SQLite updated with confirmed_at timestamp
  });

  test('auto-expires unconfirmed submissions after 7 days', async () => {
    // Create submission with expired token
    // Verify marked as stale/unconfirmed
  });

  test('handles email delivery failures gracefully', async () => {
    // Mock Resend API failure
    // Verify error logged and retry queued
  });
});
```

**Integration Test:** `e2e-submit-and-confirm.test.js` (new)

```javascript
describe('End-to-End: Submit and Confirm', () => {
  test('full workflow: submit → email → confirm → publish', async () => {
    // 1. Create GitHub Issue via form
    // 2. Trigger ingest workflow
    // 3. Verify email sent via Resend mock
    // 4. Extract confirmation link
    // 5. POST to confirmation endpoint
    // 6. Verify venue appears in locations.json
  });
});
```

### Phase 4: Documentation (Day 5)

- [ ] **Update Privacy Policy**
  - Add "Community Submissions" section
  - Document Resend integration (email storage only in Resend, not GitHub)
  - Explain 7-day expiry for unconfirmed tokens
  - Link to Resend Privacy Policy

- [ ] **Update README.md**
  - Add "How to Suggest a Location" section
  - Explain privacy-first email confirmation
  - Clarify: "We never store your email in our GitHub repository"

- [ ] **Update CONTRIBUTING.md**
  - Document submission flow for contributors
  - Explain confirmation email process
  - How to handle spam/invalid submissions

- [ ] **Code Comments**
  - Document token format and validation rules
  - Explain Resend API integration points
  - Note on 7-day expiry window and auto-cleanup

---

## Configuration Variables

Create a `.env.example` for local development:

```env
# Resend (Required for Phase C)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=queen.vln.gg
REPLY_TO_EMAIL=support@vln.gg

# GitHub (existing)
GITHUB_TOKEN=ghp_...

# Ephemeral Endpoint
CONFIRMATION_ENDPOINT_URL=https://plug.vln.gg/api/confirm-submission
CONFIRMATION_TOKEN_EXPIRY_DAYS=7
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Email delivery failure | Retry queue in Resend; manual re-send option in issue |
| Token collision | Use 32-char random token (2^256 space) + timestamp |
| Spam submissions | Keep existing XSS/geofence filters; add honeypot field |
| Resend outage | Graceful degradation: submissions marked pending manual review |
| Token expiry confusion | Clear email wording + 7-day window; auto-cleanup job |
| Privacy breach (email in repo) | Resend Audiences only; audit for hardcoded emails in code |

---

## Acceptance Criteria

- [ ] Resend account created and API key in GitHub Actions secrets
- [ ] Email confirmation workflow sends correctly on submission
- [ ] Confirmation link works and marks venue as verified
- [ ] Unconfirmed submissions auto-expire after 7 days
- [ ] Privacy policy updated with Resend + confirmation flow
- [ ] No email addresses appear in GitHub repository
- [ ] Unit tests pass (token validation, email sending, expiry)
- [ ] E2E test: submit → confirm → venue published
- [ ] 0 console errors in browser; clean action logs

---

## Timeline

| Day | Task |
|-----|------|
| 1 | Setup: Resend account, API key, email verification, ephemeral endpoint |
| 2-3 | Code: Schema, workflow, Resend integration, confirmation handler |
| 4 | Testing: Unit tests, E2E test, staging validation |
| 5 | Documentation: Privacy policy, README, CONTRIBUTING.md, code comments |

---

## Related

- **Decision:** [PHASE_C_DESIGN_DECISION.md](PHASE_C_DESIGN_DECISION.md) — Option A rationale
- **Roadmap:** [roadmap.md](roadmap.md#phase-c--resend-confirmations--opt-in)
- **Data Pipeline:** [DATA_PIPELINE_PLAN.md](DATA_PIPELINE_PLAN.md#phase-c--resend-confirmations--opt-in)

---

**Owner:** Development Team  
**Start Date:** 2026-07-24  
**Target Completion:** 2026-07-29  

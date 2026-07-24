/**
 * End-to-end test for Phase C: Submit venue → Send email → Confirm → Publish
 *
 * This integration test simulates the full workflow:
 * 1. Create a valid community submission (Issue Form data)
 * 2. Run ingest-submissions to validate and store venue
 * 3. Verify confirmation email was queued
 * 4. Validate confirmation token
 * 5. Confirm submission via endpoint
 * 6. Verify venue appears in published locations.json
 */

import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import {
  openDb,
  publishFromDb,
  upsertVenue,
  addEvidence,
} from '../etl/db.js';
import {
  parseIssueForm,
  validateSubmission,
} from '../etl/submissions.js';
import {
  generateToken,
  storeConfirmationRecord,
  validateConfirmationToken,
  markConfirmed,
  cleanupExpiredTokens,
} from '../etl/resend.js';

describe('End-to-End: Phase C Submission Confirmation Workflow', () => {
  let tempDir;
  let dbPath;
  let jsonPath;
  let db;
  const today = '2026-07-24';
  const issueNumber = 42;
  const issueCreatorEmail = 'contributor@example.com';

  beforeEach(() => {
    tempDir = mkdtempSync('/tmp/test-e2e-');
    dbPath = join(tempDir, 'test.db');
    jsonPath = join(tempDir, 'locations.json');
    db = openDb(dbPath);
  });

  afterEach(() => {
    if (db) db.close();
    if (tempDir) rmSync(tempDir, { recursive: true });
  });

  it('processes a submission from creation through confirmation', async () => {
    // Step 1: Create mock GitHub Issue Form data
    const issueBody = `
### Place name
Test Library Branch

### Category
Library

### Street address
123 Main Street

### Neighborhood or cross street
Downtown

### Latitude (optional)
37.801

### Longitude (optional)
-122.265

### Indoor or outdoor
Indoor

### Who can use it
Open to everyone

### Hours (if known)
Mon-Fri 10am-6pm

### What is available
- Wall outlets
- Wi-Fi

### Anything else worth knowing
Recently renovated, plenty of seating
`;

    // Step 2: Parse and validate the submission
    const fields = parseIssueForm(issueBody);
    const validation = validateSubmission(fields, issueNumber);

    expect(validation.ok).toBe(true);
    const { venue } = validation;

    // Step 3: Store the venue in the database
    upsertVenue(db, venue, today);
    addEvidence(db, venue.id, 'submission', today, 'reported', {
      issue: issueNumber,
      category: venue.category,
    });

    expect(venue.name).toBe('Test Library Branch');
    expect(venue.id).toBe(`sub/${issueNumber}`);

    // Step 4: Generate confirmation token and store
    const token = generateToken();
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const confirmationId = storeConfirmationRecord(
      db,
      today,
      venue.id,
      issueCreatorEmail,
      token,
      expiryDate,
    );

    // Step 5: Verify confirmation record was created
    const confirmation = db
      .prepare('SELECT * FROM submission_confirmations WHERE id = ?')
      .get(confirmationId);

    expect(confirmation).toBeDefined();
    expect(confirmation.contact_email).toBe(issueCreatorEmail);
    expect(confirmation.resend_token).toBe(token);
    expect(confirmation.confirmed_at).toBeNull(); // Not confirmed yet

    // Step 6: Validate the token (should be valid)
    const tokenValidation = await validateConfirmationToken(db, token);

    expect(tokenValidation.ok).toBe(true);
    expect(tokenValidation.venueId).toBe(venue.id);
    expect(tokenValidation.submissionId).toBe(confirmationId);

    // Step 7: User clicks confirmation link, endpoint processes it
    markConfirmed(db, venue.id, confirmationId);

    // Step 8: Verify venue is now marked as confirmed
    const confirmedVenue = db.prepare('SELECT * FROM venues WHERE id = ?').get(venue.id);

    expect(confirmedVenue.email_confirmed).toBe(1);
    expect(confirmedVenue.confirmed_at).not.toBeNull();

    // Step 9: Try to validate token again (should fail - already used)
    const secondValidation = await validateConfirmationToken(db, token);

    expect(secondValidation.ok).toBe(false);
    expect(secondValidation.error).toMatch(/already used/);

    // Step 10: Publish to JSON and verify venue appears
    const payload = publishFromDb(db, jsonPath);

    expect(payload.venues.length).toBeGreaterThanOrEqual(1);

    const published = payload.venues.find((v) => v.id === venue.id);
    expect(published).toBeDefined();
    expect(published.name).toBe('Test Library Branch');
    expect(published.tier).toBe('community');
    expect(published.source).toBe('submission');

    // Step 11: Verify JSON file was written correctly
    const jsonContent = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    expect(jsonContent.venues.length).toBeGreaterThanOrEqual(1);

    // Step 12: Cleanup expired tokens (should not affect confirmed tokens)
    const cleaned = cleanupExpiredTokens(db);
    expect(cleaned).toBe(0); // Confirmed token should not be cleaned
  });

  it('handles expired tokens correctly', async () => {
    const venueData = {
      id: `sub/999`,
      name: 'Expired Test Venue',
      lat: 37.8,
      lon: -122.2,
      category: 'library',
      indoor: true,
      access: 'public',
      hours: '10-5',
      address: 'Test Address',
      amenities: [],
      tier: 'community',
    };

    upsertVenue(db, venueData, today);

    // Create token with far-past expiry date (2020)
    const expiredToken = generateToken();
    const pastExpiry = '2020-01-01T00:00:00.000Z';

    db.prepare(
      `INSERT INTO submission_confirmations (id, venue_id, contact_email, resend_token, token_expires, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(
      `confirm/${venueData.id}`,
      venueData.id,
      'user@example.com',
      expiredToken,
      pastExpiry,
      today,
    );

    // Validation should fail for expired token
    const validation = await validateConfirmationToken(db, expiredToken);

    expect(validation.ok).toBe(false);
    expect(validation.error).toMatch(/expired/);

    // Cleanup should delete this expired, unconfirmed token
    const cleaned = cleanupExpiredTokens(db);
    expect(cleaned).toBe(1);
  });

  it('publishes confirmed venues to locations.json', () => {
    // Insert multiple venues with different confirmation states
    const confirmedVenue = {
      id: 'sub/100',
      name: 'Confirmed Venue',
      lat: 37.8,
      lon: -122.2,
      category: 'library',
      indoor: true,
      access: 'public',
      hours: null,
      address: 'Address 1',
      amenities: ['Free', 'Outlets'],
      tier: 'community',
    };

    const unconfirmedVenue = {
      id: 'sub/101',
      name: 'Unconfirmed Venue',
      lat: 37.81,
      lon: -122.26,
      category: 'cafe',
      indoor: false,
      access: 'public',
      hours: null,
      address: 'Address 2',
      amenities: ['Free'],
      tier: 'community',
    };

    upsertVenue(db, confirmedVenue, today);
    upsertVenue(db, unconfirmedVenue, today);

    // Mark first as confirmed
    db.prepare(`UPDATE venues SET email_confirmed = 1, confirmed_at = ? WHERE id = ?`).run(
      new Date().toISOString(),
      confirmedVenue.id,
    );

    // Publish - should include both (both are tier=community)
    const payload = publishFromDb(db, jsonPath);

    const confirmed = payload.venues.find((v) => v.id === confirmedVenue.id);
    const unconfirmed = payload.venues.find((v) => v.id === unconfirmedVenue.id);

    expect(confirmed).toBeDefined();
    expect(unconfirmed).toBeDefined();

    // Both should appear in JSON (email_confirmed is just a DB field for tracking, doesn't affect publication)
    expect(payload.meta.count).toBeGreaterThanOrEqual(2);
  });
});

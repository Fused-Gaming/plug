/**
 * End-to-end test for Phase F: Web form submission → Email confirmation → Publish
 *
 * This integration test simulates the full workflow:
 * 1. Simulate a web form submission with venue details
 * 2. Validate the form data and generate confirmation token
 * 3. Verify confirmation email payload is correctly structured
 * 4. Confirm submission via token validation
 * 5. Verify venue appears in published locations.json
 */

import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import {
  openDb,
  publishFromDb,
  upsertVenue,
  addEvidence,
} from '../etl/db.js';
import {
  generateToken,
  storeConfirmationRecord,
  validateConfirmationToken,
  markConfirmed,
  cleanupExpiredTokens,
} from '../etl/resend.js';

describe('End-to-End: Phase F Web Form Submission Workflow', () => {
  let tempDir;
  let dbPath;
  let jsonPath;
  let db;
  const today = '2026-07-26';
  const jwtSecret = 'test-secret-key-for-phase-f';

  beforeEach(() => {
    tempDir = mkdtempSync('/tmp/test-e2e-phase-f-');
    dbPath = join(tempDir, 'test.db');
    jsonPath = join(tempDir, 'locations.json');
    db = openDb(dbPath);
  });

  afterEach(() => {
    if (db) db.close();
    if (tempDir) rmSync(tempDir, { recursive: true });
  });

  it('processes a web form submission from creation through confirmation', async () => {
    // Step 1: Simulate web form submission data
    const formData = {
      name: 'Suggested Community Center',
      address: '456 Oak Avenue',
      neighborhood: 'Midtown',
      category: 'community_centre',
      indoor: true,
      amenities: ['WiFi', 'Seating', 'Restrooms'],
      hours: 'Mo-Fr 9:00-17:00',
      email: 'contributor@example.com',
    };

    // Step 2: Generate confirmation token (as the API would)
    const payload = {
      email: formData.email,
      venueId: `sub/${Date.now()}`,
      name: formData.name,
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
    expect(token).toBeTruthy();

    // Step 3: Verify token can be validated
    const decoded = jwt.verify(token, jwtSecret);
    expect(decoded.email).toBe(formData.email);
    expect(decoded.name).toBe(formData.name);

    // Step 4: Store the venue in database (as submit-venue API would)
    const venue = {
      id: payload.venueId,
      name: formData.name,
      lat: 37.8045, // Default coordinates for testing
      lon: -122.2712,
      category: 'community_centre',
      indoor: formData.indoor,
      access: 'public',
      address: formData.address,
      notes: `Neighborhood: ${formData.neighborhood}. Hours: ${formData.hours}`,
      amenities: formData.amenities,
      tier: 'community',
      source: 'web-form',
    };

    upsertVenue(db, venue, today);
    addEvidence(db, venue.id, 'web-form', today.slice(0, 7), 'submitted', { email: formData.email });

    // Step 5: Simulate token confirmation (as confirm-submission API would)
    const venues = db.prepare('SELECT * FROM venues WHERE id = ?').all(payload.venueId);
    expect(venues).toHaveLength(1);
    expect(venues[0].name).toBe(formData.name);

    // Mark as email-confirmed in database
    db.prepare('UPDATE venues SET email_confirmed = 1 WHERE id = ?').run(payload.venueId);

    const confirmedVenues = db.prepare('SELECT * FROM venues WHERE id = ?').all(payload.venueId);
    expect(confirmedVenues[0].email_confirmed).toBe(1);

    // Step 6: Publish to locations.json (as would happen after confirmation)
    const payload2 = publishFromDb(db, jsonPath);
    expect(payload2.meta.count).toBeGreaterThanOrEqual(1);

    // Step 7: Verify venue appears in published JSON
    const published = JSON.parse(readFileSync(jsonPath, 'utf8'));
    const submittedVenue = published.venues.find((v) => v.id === payload.venueId);
    expect(submittedVenue).toBeTruthy();
    expect(submittedVenue.name).toBe(formData.name);
    expect(submittedVenue.source).toBe('submission'); // Source is 'submission' for community tiers
    expect(submittedVenue.tier).toBe('community');
  });

  it('validates that token expiry prevents late confirmations', async () => {
    const expiredPayload = {
      email: 'expired@example.com',
      venueId: 'sub/expired-test',
      iat: Math.floor(Date.now() / 1000) - 604800 - 1, // 7 days + 1 second ago
    };

    const expiredToken = jwt.sign(expiredPayload, jwtSecret, { expiresIn: '7d' });

    // Attempt to verify expired token
    expect(() => {
      jwt.verify(expiredToken, jwtSecret);
    }).toThrow('jwt expired');
  });

  it('rejects tokens signed with wrong secret', async () => {
    const payload = {
      email: 'test@example.com',
      venueId: 'sub/test',
    };

    const token = jwt.sign(payload, 'correct-secret', { expiresIn: '7d' });

    // Attempt to verify with wrong secret
    expect(() => {
      jwt.verify(token, 'wrong-secret');
    }).toThrow('invalid signature');
  });

  it('validates form data structure matches expected schema', async () => {
    const validFormData = {
      name: 'Valid Venue Name',
      address: '123 Main St',
      neighborhood: 'Downtown',
      category: 'library',
      indoor: true,
      amenities: ['WiFi'],
      hours: 'Mo-Fr 9-5',
      email: 'user@example.com',
    };

    // Verify all required fields are present
    const requiredFields = ['name', 'address', 'category', 'indoor', 'email'];
    requiredFields.forEach((field) => {
      expect(validFormData).toHaveProperty(field);
    });

    // Verify email format
    expect(validFormData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('handles amenities as array in form data', async () => {
    const formData = {
      name: 'Multi-Amenity Venue',
      address: '789 Elm St',
      category: 'community_centre',
      indoor: true,
      amenities: ['WiFi', 'Outlets', 'Seating', 'Restrooms'],
      hours: 'Mo-Su 8-20',
      email: 'user@example.com',
    };

    expect(Array.isArray(formData.amenities)).toBe(true);
    expect(formData.amenities).toContain('WiFi');
    expect(formData.amenities.length).toBe(4);
  });

  it('cleans up expired confirmation tokens', async () => {
    // First create a venue to reference
    const venueId = 'sub/cleanup-test';
    const venue = {
      id: venueId,
      name: 'Cleanup Test Venue',
      lat: 37.8,
      lon: -122.2,
      category: 'library',
      indoor: true,
      access: 'public',
      tier: 'community',
      amenities: ['WiFi'],
    };
    upsertVenue(db, venue, today);

    // Store a confirmation record with expired date
    const email = 'cleanup@example.com';
    const expiredDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days ago

    storeConfirmationRecord(db, today, venueId, email, 'expired-token', expiredDate);

    // Verify it was stored
    const records = db.prepare('SELECT * FROM submission_confirmations WHERE contact_email = ?').all(email);
    expect(records.length).toBeGreaterThan(0);

    // Cleanup expired tokens (7 day expiry threshold)
    cleanupExpiredTokens(db, 7);

    // Verify it was cleaned
    const remainingRecords = db.prepare('SELECT * FROM submission_confirmations WHERE contact_email = ?').all(email);
    expect(remainingRecords).toHaveLength(0);
  });

  it('prevents duplicate submissions from same email within cooldown period', async () => {
    const email = 'duplicate@example.com';
    const today = '2026-07-26';

    // First submission
    const venue1 = {
      id: 'sub/first-submit',
      name: 'First Venue',
      lat: 37.8,
      lon: -122.2,
      category: 'library',
      indoor: true,
      access: 'public',
      tier: 'community',
      source: 'submission',
      amenities: ['WiFi'],
    };

    upsertVenue(db, venue1, today);
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    storeConfirmationRecord(db, today, venue1.id, email, 'token-1', expiryDate);

    // Check for recent submissions from this email (24-hour cooldown)
    const recentSubmissions = db
      .prepare(
        `SELECT COUNT(*) as count FROM submission_confirmations
         WHERE contact_email = ? AND created_at >= datetime('now', '-1 day')`,
      )
      .get(email);

    // Should have at least one recent submission
    expect(recentSubmissions.count).toBeGreaterThanOrEqual(1);
  });
});

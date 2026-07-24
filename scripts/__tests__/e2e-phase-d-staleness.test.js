/**
 * E2E test for Phase D: Staleness detection and publication
 *
 * Full workflow:
 * 1. Create venues with various verification dates
 * 2. Run staleness detection logic
 * 3. Verify stale venues marked correctly
 * 4. Publish to JSON and verify staleness metadata included
 */

import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { openDb, upsertVenue, publishFromDb } from '../etl/db.js';

describe('E2E: Phase D Staleness Detection and Publication', () => {
  let tempDir;
  let dbPath;
  let jsonPath;
  let db;
  const today = '2026-07-24';

  beforeEach(() => {
    tempDir = mkdtempSync('/tmp/test-e2e-staleness-');
    dbPath = join(tempDir, 'test.db');
    jsonPath = join(tempDir, 'locations.json');
    db = openDb(dbPath);
  });

  afterEach(() => {
    if (db) db.close();
    if (tempDir) rmSync(tempDir, { recursive: true });
  });

  it('includes staleness metadata in published JSON', () => {
    // Create venues with different verification states
    const recentVenue = {
      id: 'node/100',
      name: 'Recently Verified Library',
      lat: 37.8,
      lon: -122.2,
      category: 'library',
      indoor: true,
      access: 'public',
      amenities: ['Wi-Fi', 'Outlets'],
      tier: 'auto',
    };

    const oldVenue = {
      id: 'node/101',
      name: 'Old Unverified Library',
      lat: 37.81,
      lon: -122.21,
      category: 'library',
      indoor: true,
      access: 'public',
      amenities: [],
      tier: 'auto',
    };

    const communityVenue = {
      id: 'sub/42',
      name: 'Community Submitted',
      lat: 37.82,
      lon: -122.22,
      category: 'cafe',
      indoor: false,
      access: 'public',
      amenities: ['Outlets'],
      tier: 'community',
    };

    upsertVenue(db, recentVenue, today);
    upsertVenue(db, oldVenue, today);
    upsertVenue(db, communityVenue, today);

    // Set verification dates
    db.prepare('UPDATE venues SET last_verified = ? WHERE id = ?').run(today, 'node/100'); // Recently verified

    const sixMonthsAgo = '2026-01-24';
    db.prepare('UPDATE venues SET last_verified = ?, stale_at = ? WHERE id = ?').run(sixMonthsAgo, today, 'node/101'); // Old and stale

    // Community venue uses confirmed_at
    db.prepare('UPDATE venues SET email_confirmed = 1, confirmed_at = ? WHERE id = ?').run(today, 'sub/42');

    // Publish
    const payload = publishFromDb(db, jsonPath);

    // Verify staleness metadata is included
    expect(payload.meta.staleness_threshold_days).toBe(180);

    // Find venues in output
    const recent = payload.venues.find((v) => v.id === 'node/100');
    const old = payload.venues.find((v) => v.id === 'node/101');
    const community = payload.venues.find((v) => v.id === 'sub/42');

    // Recent venue should not be stale
    expect(recent).toBeDefined();
    expect(recent.last_verified).toBe(today);
    expect(recent.months_since_verified).toBe(0);
    expect(recent.stale).toBe(false);

    // Old venue should be stale
    expect(old).toBeDefined();
    expect(old.last_verified).toBe(sixMonthsAgo);
    expect(old.stale).toBe(true);
    expect(old.months_since_verified).toBeGreaterThan(5);

    // Community venue may have staleness info
    expect(community).toBeDefined();

    // Verify JSON file was written correctly
    const jsonContent = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    expect(jsonContent.meta.staleness_threshold_days).toBe(180);
    expect(jsonContent.venues.length).toBeGreaterThanOrEqual(2);
  });

  it('handles venues without last_verified gracefully', () => {
    // Create venue without last_verified (edge case from old data)
    const venue = {
      id: 'node/200',
      name: 'Test Venue',
      lat: 37.8,
      lon: -122.2,
      category: 'library',
      indoor: true,
      access: 'public',
      amenities: [],
      tier: 'auto',
    };

    upsertVenue(db, venue, today);

    // Manually clear last_verified to simulate old data
    db.prepare('UPDATE venues SET last_verified = NULL WHERE id = ?').run('node/200');

    const payload = publishFromDb(db, jsonPath);
    const v = payload.venues.find((v) => v.id === 'node/200');

    // Should still be published, staleness fields may be absent
    expect(v).toBeDefined();
    expect(v.name).toBe('Test Venue');
  });

  it('excludes missing_since venues from publication', () => {
    const presentVenue = {
      id: 'node/300',
      name: 'Present Library',
      lat: 37.8,
      lon: -122.2,
      category: 'library',
      indoor: true,
      access: 'public',
      amenities: [],
      tier: 'auto',
    };

    const missingVenue = {
      id: 'node/301',
      name: 'Missing Library',
      lat: 37.81,
      lon: -122.21,
      category: 'library',
      indoor: true,
      access: 'public',
      amenities: [],
      tier: 'auto',
    };

    upsertVenue(db, presentVenue, today);
    upsertVenue(db, missingVenue, today);

    // Mark one as missing
    db.prepare('UPDATE venues SET missing_since = ? WHERE id = ?').run(today, 'node/301');

    const payload = publishFromDb(db, jsonPath);

    const present = payload.venues.find((v) => v.id === 'node/300');
    const missing = payload.venues.find((v) => v.id === 'node/301');

    expect(present).toBeDefined();
    expect(missing).toBeUndefined(); // Should not be published
  });

  it('displays months_since_verified correctly for different ages', () => {
    const today_date = new Date(today);

    // Create venues verified at different times
    const scenarios = [
      { id: 'node/400', daysOld: 0, expectedMonths: 0 }, // Today
      { id: 'node/401', daysOld: 30, expectedMonths: 1 }, // 1 month ago
      { id: 'node/402', daysOld: 90, expectedMonths: 3 }, // 3 months ago
      { id: 'node/403', daysOld: 180, expectedMonths: 6 }, // 6 months ago
      { id: 'node/404', daysOld: 365, expectedMonths: 12 }, // 1 year ago
    ];

    scenarios.forEach(({ id, daysOld, expectedMonths }) => {
      const venue = {
        id,
        name: `Venue ${id}`,
        lat: 37.8,
        lon: -122.2,
        category: 'library',
        indoor: true,
        access: 'public',
        amenities: [],
        tier: 'auto',
      };

      upsertVenue(db, venue, today);

      const verificationDate = new Date(today_date.getTime() - daysOld * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      db.prepare('UPDATE venues SET last_verified = ? WHERE id = ?').run(verificationDate, id);
    });

    const payload = publishFromDb(db, jsonPath);

    scenarios.forEach(({ id, expectedMonths }) => {
      const v = payload.venues.find((v) => v.id === id);
      expect(v).toBeDefined();
      expect(v.months_since_verified).toBe(expectedMonths);
    });
  });

  it('preserves byte stability when staleness unchanged', () => {
    const venue = {
      id: 'node/500',
      name: 'Stable Venue',
      lat: 37.8,
      lon: -122.2,
      category: 'library',
      indoor: true,
      access: 'public',
      amenities: [],
      tier: 'auto',
    };

    upsertVenue(db, venue, today);
    db.prepare('UPDATE venues SET last_verified = ? WHERE id = ?').run(today, 'node/500');

    // First publish
    publishFromDb(db, jsonPath);
    const firstJson = readFileSync(jsonPath, 'utf-8');

    // Simulate re-running staleness check with no changes
    db.prepare('UPDATE venues SET last_verified = ? WHERE id = ?').run(today, 'node/500');

    // Second publish
    publishFromDb(db, jsonPath);
    const secondJson = readFileSync(jsonPath, 'utf-8');

    // JSON should be byte-identical (no unnecessary updates)
    expect(firstJson).toBe(secondJson);
  });
});

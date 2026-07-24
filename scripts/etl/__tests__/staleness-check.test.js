/**
 * Unit tests for Phase D: Staleness detection and verification
 */

import { beforeEach, afterEach } from '@jest/globals';
import Database from 'better-sqlite3';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { openDb, upsertVenue, addEvidence } from '../db.js';

describe('Phase D: Staleness Detection', () => {
  let db;
  let dbPath;
  let tempDir;

  beforeEach(() => {
    tempDir = mkdtempSync('/tmp/test-staleness-');
    dbPath = join(tempDir, 'test.db');
    db = openDb(dbPath);
  });

  afterEach(() => {
    if (db) db.close();
    if (tempDir) rmSync(tempDir, { recursive: true });
  });

  describe('last_verified initialization', () => {
    it('initializes last_verified to first_seen for existing venues', () => {
      const today = '2026-07-24';
      const venue = {
        id: 'node/123',
        name: 'Test Library',
        lat: 37.8,
        lon: -122.2,
        category: 'library',
        indoor: true,
        access: 'public',
        hours: '9am-5pm',
        address: '123 Main St',
        amenities: [],
        tier: 'auto',
      };

      upsertVenue(db, venue, today);

      const row = db.prepare('SELECT last_verified, verification_source FROM venues WHERE id = ?').get('node/123');

      expect(row.last_verified).toBe(today);
      expect(row.verification_source).toBe('osint');
    });

    it('sets verification_source based on venue ID', () => {
      const today = '2026-07-24';

      // OSINT venue
      const osmVenue = {
        id: 'way/456',
        name: 'OSM Library',
        lat: 37.8,
        lon: -122.2,
        category: 'library',
        indoor: true,
        access: 'public',
        amenities: [],
        tier: 'auto',
      };
      upsertVenue(db, osmVenue, today);

      // Community venue
      const communityVenue = {
        id: 'sub/42',
        name: 'Community Center',
        lat: 37.81,
        lon: -122.21,
        category: 'community_centre',
        indoor: false,
        access: 'public',
        amenities: [],
        tier: 'community',
      };
      upsertVenue(db, communityVenue, today);

      const osmRow = db.prepare('SELECT verification_source FROM venues WHERE id = ?').get('way/456');
      const communityRow = db.prepare('SELECT verification_source FROM venues WHERE id = ?').get('sub/42');

      expect(osmRow.verification_source).toBe('osint');
      expect(communityRow.verification_source).toBe('community');
    });
  });

  describe('staleness calculation', () => {
    it('calculates months_since_verified correctly', () => {
      const today = '2026-07-24';
      const twoMonthsAgo = '2026-05-24';
      const sixMonthsAgo = '2026-01-24';

      const venue = {
        id: 'node/789',
        name: 'Test Venue',
        lat: 37.8,
        lon: -122.2,
        category: 'library',
        indoor: true,
        access: 'public',
        amenities: [],
        tier: 'auto',
      };

      upsertVenue(db, venue, '2026-01-01');

      // Set last_verified to 2 months ago
      db.prepare('UPDATE venues SET last_verified = ? WHERE id = ?').run(twoMonthsAgo, 'node/789');

      const row = db.prepare('SELECT last_verified FROM venues WHERE id = ?').get('node/789');
      expect(row.last_verified).toBe(twoMonthsAgo);

      // Verify 6-month threshold logic
      db.prepare('UPDATE venues SET last_verified = ? WHERE id = ?').run(sixMonthsAgo, 'node/789');

      const oldRow = db.prepare('SELECT last_verified FROM venues WHERE id = ?').get('node/789');
      const daysSince = Math.floor((new Date(today) - new Date(sixMonthsAgo)) / (1000 * 60 * 60 * 24));
      expect(daysSince).toBeGreaterThan(180);
    });

    it('marks venue as stale when unverified >6 months', () => {
      const today = '2026-07-24';
      const sixMonthsAgo = '2026-01-24';

      const venue = {
        id: 'node/999',
        name: 'Old Venue',
        lat: 37.8,
        lon: -122.2,
        category: 'library',
        indoor: true,
        access: 'public',
        amenities: [],
        tier: 'auto',
      };

      upsertVenue(db, venue, '2026-01-01');
      db.prepare('UPDATE venues SET last_verified = ? WHERE id = ?').run(sixMonthsAgo, 'node/999');

      // Mark as stale
      db.prepare('UPDATE venues SET stale_at = ? WHERE id = ?').run(today, 'node/999');

      const row = db.prepare('SELECT stale_at FROM venues WHERE id = ?').get('node/999');
      expect(row.stale_at).toBe(today);
    });

    it('clears stale_at when venue is re-verified', () => {
      const today = '2026-07-24';

      const venue = {
        id: 'node/555',
        name: 'Recovered Venue',
        lat: 37.8,
        lon: -122.2,
        category: 'library',
        indoor: true,
        access: 'public',
        amenities: [],
        tier: 'auto',
      };

      upsertVenue(db, venue, '2026-01-01');

      // Initially marked stale
      db.prepare('UPDATE venues SET stale_at = ? WHERE id = ?').run('2026-07-01', 'node/555');

      let row = db.prepare('SELECT stale_at FROM venues WHERE id = ?').get('node/555');
      expect(row.stale_at).toBe('2026-07-01');

      // Re-verified: clear stale_at
      db.prepare('UPDATE venues SET last_verified = ?, stale_at = NULL WHERE id = ?').run(today, 'node/555');

      row = db.prepare('SELECT stale_at FROM venues WHERE id = ?').get('node/555');
      expect(row.stale_at).toBeNull();
    });
  });

  describe('missing_since tracking', () => {
    it('sets missing_since when venue disappears', () => {
      const today = '2026-07-24';

      const venue = {
        id: 'node/111',
        name: 'Disappeared Venue',
        lat: 37.8,
        lon: -122.2,
        category: 'library',
        indoor: true,
        access: 'public',
        amenities: [],
        tier: 'auto',
      };

      upsertVenue(db, venue, '2026-01-01');

      let row = db.prepare('SELECT missing_since FROM venues WHERE id = ?').get('node/111');
      expect(row.missing_since).toBeNull();

      // Mark as missing
      db.prepare('UPDATE venues SET missing_since = ? WHERE id = ?').run(today, 'node/111');

      row = db.prepare('SELECT missing_since FROM venues WHERE id = ?').get('node/111');
      expect(row.missing_since).toBe(today);
    });

    it('does not re-update missing_since once set', () => {
      const disappearedDate = '2026-06-01';
      const laterDate = '2026-07-24';

      const venue = {
        id: 'node/222',
        name: 'Missing Venue',
        lat: 37.8,
        lon: -122.2,
        category: 'library',
        indoor: true,
        access: 'public',
        amenities: [],
        tier: 'auto',
      };

      upsertVenue(db, venue, '2026-01-01');

      db.prepare('UPDATE venues SET missing_since = ? WHERE id = ?').run(disappearedDate, 'node/222');

      let row = db.prepare('SELECT missing_since FROM venues WHERE id = ?').get('node/222');
      expect(row.missing_since).toBe(disappearedDate);

      // Try to update again (should not change)
      db.prepare('UPDATE venues SET missing_since = ? WHERE missing_since IS NULL AND id = ?').run(
        laterDate,
        'node/222',
      );

      row = db.prepare('SELECT missing_since FROM venues WHERE id = ?').get('node/222');
      expect(row.missing_since).toBe(disappearedDate); // Should not have changed
    });
  });

  describe('evidence tracking for staleness', () => {
    it('records staleness verification in evidence table', () => {
      const today = '2026-07-24';
      const venue = {
        id: 'node/333',
        name: 'Verified Venue',
        lat: 37.8,
        lon: -122.2,
        category: 'library',
        indoor: true,
        access: 'public',
        amenities: [],
        tier: 'auto',
      };

      upsertVenue(db, venue, '2026-01-01');

      // Record staleness check
      addEvidence(db, 'node/333', 'osm', today, 'confirmed', {
        method: 'staleness_check',
        found: true,
      });

      const evidence = db.prepare('SELECT * FROM evidence WHERE venue_id = ? AND source = ?').get('node/333', 'osm');

      expect(evidence).toBeDefined();
      expect(evidence.observed_at).toBe(today);
      expect(evidence.outlet_claim).toBe('confirmed');
    });
  });
});

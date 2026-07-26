/**
 * Shared SQLite access for the data pipeline. Both the daily OSINT sync and
 * the hourly submission ingest go through here so the schema and the
 * published-JSON shape stay in one place.
 *
 * lat/lon are nullable: community submissions may be address-only. The
 * geofence applies whenever coordinates are present.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';

export function openDb(dbPath) {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma('journal_mode = DELETE'); // no -wal/-shm sidecars in the repo
  db.exec(`
    CREATE TABLE IF NOT EXISTS venues (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      lat REAL,
      lon REAL,
      category TEXT NOT NULL,
      indoor INTEGER NOT NULL,
      access TEXT NOT NULL,
      hours TEXT,
      address TEXT,
      amenities TEXT NOT NULL,
      notes TEXT,
      tier TEXT NOT NULL,
      first_seen TEXT NOT NULL,
      missing_since TEXT,
      email_confirmed INTEGER DEFAULT 0,
      confirmed_at TEXT,
      last_verified TEXT,
      stale_at TEXT,
      verification_source TEXT
    );
    CREATE TABLE IF NOT EXISTS evidence (
      venue_id TEXT NOT NULL REFERENCES venues(id),
      source TEXT NOT NULL,
      observed_at TEXT NOT NULL,
      outlet_claim TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      PRIMARY KEY (venue_id, source, observed_at)
    );
    CREATE TABLE IF NOT EXISTS submission_confirmations (
      id TEXT PRIMARY KEY,
      venue_id TEXT NOT NULL UNIQUE REFERENCES venues(id),
      contact_email TEXT NOT NULL,
      resend_token TEXT UNIQUE NOT NULL,
      token_expires TEXT NOT NULL,
      confirmed_at TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Phase D migration: add staleness tracking columns if not present
  const columns = db.prepare(`PRAGMA table_info(venues)`).all();
  const hasLastVerified = columns.some((c) => c.name === 'last_verified');
  if (!hasLastVerified) {
    db.exec(`
      ALTER TABLE venues ADD COLUMN last_verified TEXT;
      ALTER TABLE venues ADD COLUMN stale_at TEXT;
      ALTER TABLE venues ADD COLUMN verification_source TEXT;
    `);
    // Initialize last_verified to first_seen for existing venues
    db.prepare(`UPDATE venues SET last_verified = first_seen WHERE last_verified IS NULL`).run();
    // Set verification_source based on venue ID pattern
    db.prepare(`UPDATE venues SET verification_source = 'osint' WHERE verification_source IS NULL AND id NOT LIKE 'sub/%'`).run();
    db.prepare(`UPDATE venues SET verification_source = 'community' WHERE verification_source IS NULL AND id LIKE 'sub/%'`).run();
  }

  // Issue #42 migration: account-free submission tracking columns.
  // source_issue/submission_id are unique so re-processing the same GitHub
  // Issue or the same signed submission token can never create a duplicate row.
  const hasSourceIssue = columns.some((c) => c.name === 'source_issue');
  if (!hasSourceIssue) {
    // SQLite's ALTER TABLE ADD COLUMN can't carry a UNIQUE constraint directly;
    // partial unique indexes give the same guarantee (uniqueness only when set).
    db.exec(`
      ALTER TABLE venues ADD COLUMN source_issue INTEGER;
      ALTER TABLE venues ADD COLUMN submission_id TEXT;
      ALTER TABLE venues ADD COLUMN submitted_by_hash TEXT;
      CREATE UNIQUE INDEX idx_venues_source_issue ON venues(source_issue) WHERE source_issue IS NOT NULL;
      CREATE UNIQUE INDEX idx_venues_submission_id ON venues(submission_id) WHERE submission_id IS NOT NULL;
    `);
  }

  return db;
}

export function upsertVenue(db, venue, today) {
  const verificationSource = venue.id.startsWith('sub/') ? 'community' : 'osint';
  db.prepare(`
    INSERT INTO venues (id, name, lat, lon, category, indoor, access, hours, address, amenities, notes, tier, first_seen, missing_since, last_verified, verification_source)
    VALUES (@id, @name, @lat, @lon, @category, @indoor, @access, @hours, @address, @amenities, @notes, @tier, @first_seen, NULL, @last_verified, @verification_source)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, lat=excluded.lat, lon=excluded.lon, category=excluded.category,
      indoor=excluded.indoor, access=excluded.access, hours=excluded.hours, address=excluded.address,
      amenities=excluded.amenities, notes=excluded.notes, tier=excluded.tier, missing_since=NULL
  `).run({
    ...venue,
    indoor: venue.indoor ? 1 : 0,
    hours: venue.hours ?? null,
    address: venue.address ?? null,
    notes: venue.notes ?? null,
    amenities: JSON.stringify(venue.amenities),
    first_seen: today,
    last_verified: today,
    verification_source: verificationSource,
  });
}

/** Issue #42: account-free web-form submissions land here, keyed by the
 * signed submission token's id and the GitHub Issue the App created for it.
 * Both are UNIQUE columns, so re-running the ingest workflow against the
 * same issue or the same confirmation link is a safe no-op, not a dupe row. */
export function findVenueBySubmissionId(db, submissionId) {
  return db.prepare(`SELECT * FROM venues WHERE submission_id = ?`).get(submissionId) ?? null;
}

export function findVenueBySourceIssue(db, issueNumber) {
  return db.prepare(`SELECT * FROM venues WHERE source_issue = ?`).get(issueNumber) ?? null;
}

export function insertSubmittedVenue(db, venue, today) {
  db.prepare(`
    INSERT INTO venues (id, name, lat, lon, category, indoor, access, hours, address, amenities, notes, tier, first_seen, last_verified, verification_source, source_issue, submission_id, submitted_by_hash)
    VALUES (@id, @name, @lat, @lon, @category, @indoor, @access, @hours, @address, @amenities, @notes, 'community', @today, @today, 'community', @sourceIssue, @submissionId, @submittedByHash)
  `).run({
    id: venue.id,
    name: venue.name,
    lat: venue.lat ?? null,
    lon: venue.lon ?? null,
    category: venue.category,
    indoor: venue.indoor ? 1 : 0,
    access: venue.access,
    hours: venue.hours ?? null,
    address: venue.address ?? null,
    amenities: JSON.stringify(venue.amenities ?? []),
    notes: venue.notes ?? null,
    today,
    sourceIssue: venue.sourceIssue,
    submissionId: venue.submissionId,
    submittedByHash: venue.submittedByHash ?? null,
  });
}

export function addEvidence(db, venueId, source, observedAt, outletClaim, payload) {
  db.prepare(`
    INSERT OR IGNORE INTO evidence (venue_id, source, observed_at, outlet_claim, payload_json)
    VALUES (?, ?, ?, ?, ?)
  `).run(venueId, source, observedAt, outletClaim, JSON.stringify(payload));
}

/** Published payload: auto + community tiers, present venues only, sorted by
 * id, no volatile timestamps — byte-stable when nothing changed. Includes
 * staleness metadata (last_verified, stale flag, months_since_verified). */
export function publishFromDb(db, jsonPath) {
  const rows = db
    .prepare(
      `SELECT id, name, lat, lon, category, indoor, access, hours, address, amenities, notes, tier, last_verified, stale_at
       FROM venues
       WHERE missing_since IS NULL AND tier IN ('auto', 'community')
       ORDER BY id`,
    )
    .all();

  const today = new Date().toISOString().split('T')[0];
  const daysSinceThreshold = 180; // 6 months

  const venues = rows.map((r) => {
    const v = {
      id: r.id,
      name: r.name,
      lat: r.lat,
      lon: r.lon,
      category: r.category,
      indoor: !!r.indoor,
      access: r.access,
      hours: r.hours,
      address: r.address,
      amenities: JSON.parse(r.amenities),
      source: r.id.startsWith('sub/') ? 'submission' : 'osm',
      tier: r.tier,
    };
    if (r.notes) v.notes = r.notes;

    // Phase D: Add staleness metadata
    if (r.last_verified) {
      const lastVerified = new Date(r.last_verified);
      const nowDate = new Date(today);
      const daysSinceVerified = Math.floor((nowDate - lastVerified) / (1000 * 60 * 60 * 24));
      const monthsSinceVerified = Math.floor(daysSinceVerified / 30);

      v.last_verified = r.last_verified;
      v.months_since_verified = monthsSinceVerified;
      v.stale = r.stale_at !== null || daysSinceVerified > daysSinceThreshold;
    }

    return v;
  });

  const payload = {
    meta: {
      license: 'Location data (c) OpenStreetMap contributors, ODbL 1.0 — see LICENSE-DATA',
      disclaimer:
        'Auto-listed entries are machine-corroborated from public data; community entries are neighbor-submitted pending review. Neither has been field-verified.',
      count: venues.length,
      staleness_threshold_days: daysSinceThreshold,
    },
    venues,
  };
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, JSON.stringify(payload, null, 1) + '\n');
  return payload;
}

#!/usr/bin/env node
/**
 * Phase A OSINT ETL runner (issue #20). Fetches public venues from the
 * OpenStreetMap Overpass API for the Oakland service area, normalizes and
 * dedupes them, records them in the canonical SQLite database, and emits the
 * diff-stable published JSON the site consumes.
 *
 *   node scripts/etl/sync-locations.mjs             # live fetch
 *   node scripts/etl/sync-locations.mjs --offline   # reuse last raw snapshot
 *
 * Design notes (see docs/02-project-scope/DATA_PIPELINE_PLAN.md):
 * - Commit-on-diff friendliness: published JSON contains no timestamps, and
 *   the DB tracks presence via first_seen/missing_since instead of touching
 *   every row every run — an unchanged world produces a byte-identical tree.
 * - The raw Overpass response is snapshotted to data/raw/overpass.json so
 *   offline runs and tests are reproducible.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { SERVICE_AREA, dedupe, deriveTier, normalizeOsmElement, toPublishedJson } from './lib.js';

const ROOT = new URL('../..', import.meta.url).pathname;
const DB_PATH = join(ROOT, 'data/locations.db');
const JSON_PATH = join(ROOT, 'public/data/locations.json');
const RAW_PATH = join(ROOT, 'data/raw/overpass.json');

// Primary first, community mirror as fallback — be a polite Overpass citizen:
// one bounded query per daily run, identified user agent.
const ENDPOINTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const USER_AGENT = 'plug-data-sync/1.0 (+https://github.com/Fused-Gaming/plug)';

const { south, west, north, east } = SERVICE_AREA;
const QUERY = `[out:json][timeout:60];
(
  nwr["amenity"="library"](${south},${west},${north},${east});
  nwr["amenity"="community_centre"](${south},${west},${north},${east});
  nwr["amenity"="device_charging_station"](${south},${west},${north},${east});
);
out center tags;`;

async function fetchOverpass() {
  let lastError;
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT },
        body: new URLSearchParams({ data: QUERY }),
        signal: AbortSignal.timeout(90_000),
      });
      if (!res.ok) throw new Error(`${endpoint} -> HTTP ${res.status}`);
      const json = await res.json();
      if (!Array.isArray(json.elements)) throw new Error(`${endpoint} -> malformed response`);
      console.log(`fetched ${json.elements.length} elements from ${endpoint}`);
      return json;
    } catch (err) {
      lastError = err;
      console.warn(`overpass endpoint failed: ${err.message}`);
    }
  }
  throw lastError;
}

function openDb() {
  mkdirSync(join(ROOT, 'data'), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = DELETE'); // no -wal/-shm sidecars in the repo
  db.exec(`
    CREATE TABLE IF NOT EXISTS venues (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      category TEXT NOT NULL,
      indoor INTEGER NOT NULL,
      access TEXT NOT NULL,
      hours TEXT,
      address TEXT,
      amenities TEXT NOT NULL,
      tier TEXT NOT NULL,
      first_seen TEXT NOT NULL,
      missing_since TEXT
    );
    CREATE TABLE IF NOT EXISTS evidence (
      venue_id TEXT NOT NULL REFERENCES venues(id),
      source TEXT NOT NULL,
      observed_at TEXT NOT NULL,
      outlet_claim TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      PRIMARY KEY (venue_id, source, observed_at)
    );
  `);
  return db;
}

function sync(db, venues, today) {
  const upsert = db.prepare(`
    INSERT INTO venues (id, name, lat, lon, category, indoor, access, hours, address, amenities, tier, first_seen, missing_since)
    VALUES (@id, @name, @lat, @lon, @category, @indoor, @access, @hours, @address, @amenities, @tier, @first_seen, NULL)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, lat=excluded.lat, lon=excluded.lon, category=excluded.category,
      indoor=excluded.indoor, access=excluded.access, hours=excluded.hours, address=excluded.address,
      amenities=excluded.amenities, tier=excluded.tier, missing_since=NULL
  `);
  const addEvidence = db.prepare(`
    INSERT OR IGNORE INTO evidence (venue_id, source, observed_at, outlet_claim, payload_json)
    VALUES (?, 'osm', ?, 'inferred', ?)
  `);
  const markMissing = db.prepare(
    `UPDATE venues SET missing_since = ? WHERE missing_since IS NULL AND id NOT IN (${venues.map(() => '?').join(',')})`,
  );

  db.transaction(() => {
    for (const v of venues) {
      upsert.run({
        ...v,
        indoor: v.indoor ? 1 : 0,
        amenities: JSON.stringify(v.amenities),
        tier: deriveTier(v),
        first_seen: today,
      });
      // Evidence keyed by month, not day, so unchanged months stay diff-free.
      addEvidence.run(v.id, today.slice(0, 7), JSON.stringify({ category: v.category, hours: v.hours }));
    }
    if (venues.length) markMissing.run(today, ...venues.map((v) => v.id));
  })();
}

const offline = process.argv.includes('--offline');
let raw;
if (offline) {
  raw = JSON.parse(readFileSync(RAW_PATH, 'utf8'));
  console.log(`offline mode: ${raw.elements.length} elements from snapshot`);
} else {
  raw = await fetchOverpass();
  mkdirSync(join(ROOT, 'data/raw'), { recursive: true });
  // Snapshot without volatile generator metadata so reruns stay diff-stable.
  writeFileSync(RAW_PATH, JSON.stringify({ elements: raw.elements }, null, 1) + '\n');
}

const venues = dedupe(raw.elements.map(normalizeOsmElement).filter(Boolean));
const today = new Date().toISOString().slice(0, 10);

const db = openDb();
sync(db, venues, today);
const counts = db.prepare(`SELECT tier, COUNT(*) n FROM venues WHERE missing_since IS NULL GROUP BY tier`).all();
db.close();

const published = toPublishedJson(venues);
mkdirSync(join(ROOT, 'public/data'), { recursive: true });
writeFileSync(JSON_PATH, JSON.stringify(published, null, 1) + '\n');

console.log(`normalized ${venues.length} venues; tiers:`, counts.map((c) => `${c.tier}=${c.n}`).join(' '));
console.log(`published ${published.meta.count} auto-listed venues -> public/data/locations.json`);
try {
  console.log('git diff:', execFileSync('git', ['status', '--short', 'data', 'public/data'], { cwd: ROOT, encoding: 'utf8' }).trim() || '(none)');
} catch {
  /* not fatal outside a git checkout */
}

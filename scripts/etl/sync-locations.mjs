#!/usr/bin/env node
/**
 * Phase A OSINT ETL runner (issue #20). Fetches public venues from the
 * OpenStreetMap Overpass API for the Oakland service area, normalizes and
 * dedupes them, records them in the canonical SQLite database, and republishes
 * public/data/locations.json (auto + community tiers) via db.js.
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
import { addEvidence, openDb, publishFromDb, upsertVenue } from './db.js';
import { SERVICE_AREA, dedupe, deriveTier, normalizeOsmElement } from './lib.js';

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

const db = openDb(DB_PATH);
db.transaction(() => {
  for (const v of venues) {
    upsertVenue(db, { ...v, notes: null, tier: deriveTier(v) }, today);
    // Evidence keyed by month, not day, so unchanged months stay diff-free.
    addEvidence(db, v.id, 'osm', today.slice(0, 7), 'inferred', { category: v.category, hours: v.hours });
  }
  if (venues.length) {
    // Presence tracking scoped to OSM-sourced venues; submissions have their
    // own lifecycle in the ingest workflow.
    db.prepare(
      `UPDATE venues SET missing_since = ?
       WHERE missing_since IS NULL AND id NOT LIKE 'sub/%'
         AND id NOT IN (${venues.map(() => '?').join(',')})`,
    ).run(today, ...venues.map((v) => v.id));
  }
})();

const counts = db.prepare(`SELECT tier, COUNT(*) n FROM venues WHERE missing_since IS NULL GROUP BY tier`).all();
const payload = publishFromDb(db, JSON_PATH);
db.close();

console.log(`normalized ${venues.length} venues; tiers:`, counts.map((c) => `${c.tier}=${c.n}`).join(' '));
console.log(`published ${payload.meta.count} venues -> public/data/locations.json`);
try {
  console.log('git diff:', execFileSync('git', ['status', '--short', 'data', 'public/data'], { cwd: ROOT, encoding: 'utf8' }).trim() || '(none)');
} catch {
  /* not fatal outside a git checkout */
}

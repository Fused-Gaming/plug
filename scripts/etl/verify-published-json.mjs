#!/usr/bin/env node
/**
 * CI check backing .github/workflows/validate-location-data.yml: fails if
 * public/data/locations.json wasn't (re)generated from data/locations.db.
 *
 * Re-runs publishFromDb() into a temp file and compares venue-by-venue,
 * ignoring the fields publishFromDb() derives from *today's* date
 * (months_since_verified, stale) so this doesn't flap on a PR left open
 * across a day boundary -- see the workflow file for the fuller rationale.
 * Every other field (id, name, lat, lon, category, indoor, access, hours,
 * address, amenities, notes, tier, source, last_verified, meta.count) must
 * match exactly.
 */

import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDb, publishFromDb } from './db.js';

const ROOT = new URL('../..', import.meta.url).pathname;
const DB_PATH = join(ROOT, 'data/locations.db');
const PUBLISHED_PATH = join(ROOT, 'public/data/locations.json');

// Fields intentionally excluded from comparison because they're derived
// from wall-clock time at publish, not from any column that could drift.
const DATE_DERIVED_FIELDS = ['months_since_verified', 'stale'];

function stripDateDerived(venue) {
  const copy = { ...venue };
  for (const field of DATE_DERIVED_FIELDS) delete copy[field];
  return copy;
}

export function diffPublishedJson(published, regenerated) {
  const problems = [];

  if (published.meta.count !== regenerated.meta.count) {
    problems.push(`meta.count: published has ${published.meta.count}, regenerated has ${regenerated.meta.count}.`);
  }

  const byId = new Map(regenerated.venues.map((v) => [v.id, v]));
  const seen = new Set();

  for (const publishedVenue of published.venues) {
    seen.add(publishedVenue.id);
    const regeneratedVenue = byId.get(publishedVenue.id);
    if (!regeneratedVenue) {
      problems.push(`venue ${publishedVenue.id} is in public/data/locations.json but not in data/locations.db.`);
      continue;
    }
    const a = JSON.stringify(stripDateDerived(publishedVenue));
    const b = JSON.stringify(stripDateDerived(regeneratedVenue));
    if (a !== b) {
      problems.push(`venue ${publishedVenue.id} differs between the published JSON and the database.`);
    }
  }

  for (const regeneratedVenue of regenerated.venues) {
    if (!seen.has(regeneratedVenue.id)) {
      problems.push(`venue ${regeneratedVenue.id} is in data/locations.db but missing from public/data/locations.json.`);
    }
  }

  return problems;
}

async function main() {
  const published = JSON.parse(readFileSync(PUBLISHED_PATH, 'utf8'));

  const tempDir = mkdtempSync(join(tmpdir(), 'plug-verify-published-'));
  const tempJsonPath = join(tempDir, 'locations.json');
  const db = openDb(DB_PATH);
  let regenerated;
  try {
    regenerated = publishFromDb(db, tempJsonPath);
  } finally {
    db.close();
    rmSync(tempDir, { recursive: true, force: true });
  }

  const problems = diffPublishedJson(published, regenerated);
  if (problems.length) {
    console.error('public/data/locations.json is out of date relative to data/locations.db:');
    for (const p of problems) console.error(`  - ${p}`);
    process.exitCode = 1;
    return;
  }
  console.log(`public/data/locations.json matches data/locations.db (${regenerated.meta.count} venues).`);
}

await main();

/**
 * Phase D: Weekly staleness check for OSINT venues
 *
 * Re-queries Overpass API to verify venues still exist. Updates last_verified
 * for found venues, marks stale_at for unverified >6 months, and sets missing_since
 * for venues no longer in Overpass.
 *
 * Usage: node scripts/etl/staleness-check.mjs --db=data/locations.db
 */

import { openDb, addEvidence } from './db.js';
import { normalizeOsmElement, dedupeKey } from './lib.js';
import { parseArgs } from 'node:util';

const args = parseArgs({
  options: {
    db: { type: 'string', default: 'data/locations.db' },
  },
});

const overpassUrl = process.env.OPENSTREETMAP_API || 'https://overpass-api.de/api/interpreter';
const stalenessThresholdDays = 180; // 6 months
const today = new Date().toISOString().split('T')[0];

async function queryOverpass() {
  const queries = [
    '[amenity=library]',
    '[amenity=community_centre]',
    '[amenity=device_charging_station]',
  ];

  const bbox = '37.7,-122.35,37.89,-122.1'; // Oakland bounds

  const elements = [];

  for (const query of queries) {
    const overpassQuery = `
      [bbox:${bbox}];
      (
        node${query};
        way${query};
        relation${query};
      );
      out center;
    `;

    try {
      const response = await fetch(overpassUrl, {
        method: 'POST',
        body: overpassQuery,
        timeout: 60000,
      });

      if (!response.ok) {
        console.warn(`Overpass API error: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      if (data.elements) {
        elements.push(...data.elements);
      }
    } catch (err) {
      console.warn(`Overpass fetch error for ${query}: ${err.message}`);
      continue;
    }
  }

  return elements;
}

function normalizeElements(elements) {
  return elements
    .map((el) => {
      try {
        return normalizeOsmElement(el);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export async function checkStaleness(dbPath) {
  const db = openDb(dbPath);

  try {
    // Fetch current Overpass data
    console.log('Querying Overpass API...');
    const osmElements = await queryOverpass();
    console.log(`Found ${osmElements.length} elements in Overpass`);

    const normalizedVenues = normalizeElements(osmElements);
    console.log(`Normalized to ${normalizedVenues.length} venues`);

    // Build dedup key map for quick lookup
    const osmVenuesByDedupeKey = new Map();
    normalizedVenues.forEach((v) => {
      const key = dedupeKey(v);
      osmVenuesByDedupeKey.set(key, v);
    });

    // Get all OSINT venues from DB
    const osmVenues = db
      .prepare(`SELECT id, name, lat, lon FROM venues WHERE id NOT LIKE 'sub/%' AND tier IN ('auto', 'candidate')`)
      .all();

    let verified = 0;
    let stale = 0;
    let missing = 0;

    // Check each OSINT venue
    for (const dbVenue of osmVenues) {
      const key = dedupeKey(dbVenue);
      const found = osmVenuesByDedupeKey.has(key);

      if (found) {
        // Venue still exists: update last_verified
        db.prepare(`UPDATE venues SET last_verified = ?, stale_at = NULL WHERE id = ?`).run(today, dbVenue.id);
        addEvidence(db, dbVenue.id, 'osm', today, 'confirmed', {
          method: 'staleness_check',
          found: true,
        });
        verified++;
      } else {
        // Venue not found: check if it should be marked stale
        const row = db.prepare(`SELECT last_verified, stale_at FROM venues WHERE id = ?`).get(dbVenue.id);

        if (row && row.last_verified) {
          const lastVerified = new Date(row.last_verified);
          const nowDate = new Date(today);
          const daysSinceVerified = Math.floor((nowDate - lastVerified) / (1000 * 60 * 60 * 24));

          if (daysSinceVerified > stalenessThresholdDays && !row.stale_at) {
            // Mark as stale if not already marked
            db.prepare(`UPDATE venues SET stale_at = ? WHERE id = ?`).run(today, dbVenue.id);
            addEvidence(db, dbVenue.id, 'osm', today, 'unconfirmed', {
              method: 'staleness_check',
              days_since_verified: daysSinceVerified,
              threshold: stalenessThresholdDays,
            });
            stale++;
          }
        }

        // Set missing_since if not already set
        const missing_row = db.prepare(`SELECT missing_since FROM venues WHERE id = ?`).get(dbVenue.id);
        if (missing_row && !missing_row.missing_since) {
          db.prepare(`UPDATE venues SET missing_since = ? WHERE id = ?`).run(today, dbVenue.id);
          missing++;
        }
      }
    }

    console.log(`Staleness check complete:`);
    console.log(`  Verified: ${verified} venues still exist`);
    console.log(`  Marked stale: ${stale} venues (unverified >6 months)`);
    console.log(`  Marked missing: ${missing} venues (not in Overpass)`);

    return { verified, stale, missing };
  } finally {
    db.close();
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  checkStaleness(args.values.db)
    .then((result) => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('Staleness check failed:', err);
      process.exit(1);
    });
}

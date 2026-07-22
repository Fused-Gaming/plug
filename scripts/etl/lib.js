/**
 * Pure functions for the OSINT ETL pipeline (Phase A, issue #20).
 * No I/O here — everything is unit-testable. See sync-locations.mjs for the
 * runner and docs/02-project-scope/DATA_PIPELINE_PLAN.md for the design.
 */

/** Outlet-likelihood priors per venue category (0..1). OSINT confirms the
 * venue; outlet presence is an inference — these encode how safe that
 * inference is. Only categories listed here are eligible for auto-listing. */
export const CATEGORY_PRIORS = {
  device_charging_station: 0.95,
  library: 0.9,
  community_centre: 0.7,
};

/** Categories where access is public by default (vs. customers-only). */
const PUBLIC_ACCESS = new Set(['library', 'community_centre', 'device_charging_station']);

/** Oakland service area. Coordinates outside this box are rejected at ingest. */
export const SERVICE_AREA = { south: 37.7, west: -122.35, north: 37.89, east: -122.1 };

export function inServiceArea(lat, lon, area = SERVICE_AREA) {
  return lat >= area.south && lat <= area.north && lon >= area.west && lon <= area.east;
}

/** Normalize one Overpass element into a venue record, or null if unusable. */
export function normalizeOsmElement(el) {
  const tags = el.tags || {};
  const category = tags.amenity;
  if (!(category in CATEGORY_PRIORS)) return null;

  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;
  if (!inServiceArea(lat, lon)) return null;

  const name = (tags.name || '').trim();
  if (!name) return null;

  const address = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ') || null;

  const amenities = [];
  if (category === 'library' || category === 'community_centre') amenities.push('Indoor outlets (likely)');
  if (category === 'device_charging_station') amenities.push('Device charging');
  amenities.push('Free');
  if ((tags.internet_access || '').startsWith('wlan') || tags.internet_access === 'yes') amenities.push('Wi-Fi');
  if (tags.wheelchair === 'yes') amenities.push('Accessible');
  if (tags.toilets === 'yes') amenities.push('Restrooms');

  return {
    id: `${el.type}/${el.id}`,
    name,
    lat: Number(lat.toFixed(6)),
    lon: Number(lon.toFixed(6)),
    category,
    indoor: tags.indoor === 'no' || category === 'device_charging_station' ? false : true,
    access: PUBLIC_ACCESS.has(category) ? 'public' : 'customer',
    hours: tags.opening_hours || null,
    address,
    amenities,
    source: 'osm',
  };
}

/** ~110m spatial bucket + normalized name, used to merge duplicate venues. */
export function dedupeKey(venue) {
  const name = venue.name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\b(the|branch|library|center|centre)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return `${Math.round(venue.lat * 1000)}:${Math.round(venue.lon * 1000)}:${name}`;
}

/** Merge duplicates, preferring the record with more filled fields. */
export function dedupe(venues) {
  const byKey = new Map();
  for (const v of venues) {
    const key = dedupeKey(v);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, v);
      continue;
    }
    const score = (x) => [x.hours, x.address].filter(Boolean).length + x.amenities.length / 10;
    byKey.set(key, score(v) > score(existing) ? { ...v, id: existing.id } : existing);
  }
  return [...byKey.values()];
}

/**
 * Derive the publish tier. Phase A ships a single upstream source, so the
 * full two-source corroboration rule from the pipeline plan cannot fire yet;
 * until Socrata/BART land (see issue #20), "auto" requires a high category
 * prior AND machine-readable hours. Everything else stays a DB-only
 * candidate and is excluded from the published JSON.
 */
export function deriveTier(venue) {
  const prior = CATEGORY_PRIORS[venue.category] ?? 0;
  if (prior >= 0.7 && venue.hours) return 'auto';
  return 'candidate';
}

/** Stable, diff-friendly JSON payload: sorted, no volatile timestamps. */
export function toPublishedJson(venues) {
  const published = venues
    .map((v) => ({ ...v, tier: deriveTier(v) }))
    .filter((v) => v.tier === 'auto')
    .sort((a, b) => a.id.localeCompare(b.id));
  return {
    meta: {
      license: 'Location data (c) OpenStreetMap contributors, ODbL 1.0 — see LICENSE-DATA',
      disclaimer:
        'Auto-listed entries are machine-corroborated from public data; outlet availability is inferred from venue category and has not been field-checked.',
      count: published.length,
    },
    venues: published,
  };
}

/**
 * Unit tests for the Phase A OSINT ETL pure functions (issue #20).
 */
import {
  CATEGORY_PRIORS,
  SERVICE_AREA,
  dedupe,
  dedupeKey,
  deriveTier,
  inServiceArea,
  normalizeOsmElement,
  toPublishedJson,
} from '../../scripts/etl/lib.js';

const oaklandLibrary = {
  type: 'node',
  id: 1,
  lat: 37.8011,
  lon: -122.2648,
  tags: {
    amenity: 'library',
    name: 'Oakland Main Library',
    opening_hours: 'Mo-Sa 10:00-18:00',
    'addr:housenumber': '125',
    'addr:street': '14th Street',
    internet_access: 'wlan',
    wheelchair: 'yes',
  },
};

describe('normalizeOsmElement', () => {
  test('normalizes a library node with address, hours, and amenities', () => {
    const v = normalizeOsmElement(oaklandLibrary);
    expect(v).toMatchObject({
      id: 'node/1',
      name: 'Oakland Main Library',
      category: 'library',
      indoor: true,
      access: 'public',
      hours: 'Mo-Sa 10:00-18:00',
      address: '125 14th Street',
      source: 'osm',
    });
    expect(v.amenities).toEqual(
      expect.arrayContaining(['Indoor outlets (likely)', 'Free', 'Wi-Fi', 'Accessible']),
    );
  });

  test('uses way center coordinates when lat/lon are absent', () => {
    const way = {
      type: 'way',
      id: 2,
      center: { lat: 37.8, lon: -122.25 },
      tags: { amenity: 'community_centre', name: 'Rec Center' },
    };
    expect(normalizeOsmElement(way)).toMatchObject({ id: 'way/2', lat: 37.8, lon: -122.25 });
  });

  test('rejects unknown categories, unnamed venues, and out-of-area coordinates', () => {
    expect(
      normalizeOsmElement({ ...oaklandLibrary, tags: { ...oaklandLibrary.tags, amenity: 'bar' } }),
    ).toBeNull();
    expect(
      normalizeOsmElement({ ...oaklandLibrary, tags: { ...oaklandLibrary.tags, name: ' ' } }),
    ).toBeNull();
    // San Jose is well outside the service area — geofence must reject it.
    expect(normalizeOsmElement({ ...oaklandLibrary, lat: 37.33, lon: -121.89 })).toBeNull();
  });
});

describe('service area geofence', () => {
  test('accepts downtown Oakland and rejects San Francisco', () => {
    expect(inServiceArea(37.8044, -122.2712)).toBe(true);
    expect(inServiceArea(37.7749, -122.4194)).toBe(false);
    expect(SERVICE_AREA.south).toBeLessThan(SERVICE_AREA.north);
  });
});

describe('dedupe', () => {
  test('merges near-identical venues and keeps the richer record', () => {
    const sparse = normalizeOsmElement({
      type: 'node',
      id: 10,
      lat: 37.8011,
      lon: -122.2648,
      tags: { amenity: 'library', name: 'Main Library' },
    });
    const rich = normalizeOsmElement({ ...oaklandLibrary, id: 11, tags: { ...oaklandLibrary.tags, name: 'The Main Library' } });
    expect(dedupeKey(sparse)).toBe(dedupeKey(rich));
    const merged = dedupe([sparse, rich]);
    expect(merged).toHaveLength(1);
    expect(merged[0].hours).toBe('Mo-Sa 10:00-18:00');
    expect(merged[0].id).toBe('node/10'); // first-seen id is stable across merges
  });

  test('keeps distinct venues apart', () => {
    const a = normalizeOsmElement(oaklandLibrary);
    const b = normalizeOsmElement({
      ...oaklandLibrary,
      id: 12,
      lat: 37.85,
      lon: -122.27,
      tags: { ...oaklandLibrary.tags, name: 'Golden Gate Branch' },
    });
    expect(dedupe([a, b])).toHaveLength(2);
  });
});

describe('deriveTier', () => {
  test('auto requires a high category prior AND known hours', () => {
    const v = normalizeOsmElement(oaklandLibrary);
    expect(deriveTier(v)).toBe('auto');
    expect(deriveTier({ ...v, hours: null })).toBe('candidate');
    expect(CATEGORY_PRIORS.library).toBeGreaterThanOrEqual(0.7);
  });
});

describe('toPublishedJson', () => {
  test('publishes only auto-tier venues, sorted, with license metadata and no timestamps', () => {
    const withHours = normalizeOsmElement(oaklandLibrary);
    const withoutHours = { ...normalizeOsmElement(oaklandLibrary), id: 'node/99', hours: null };
    const out = toPublishedJson([withoutHours, withHours]);
    expect(out.meta.count).toBe(1);
    expect(out.meta.license).toContain('OpenStreetMap');
    expect(out.venues[0].id).toBe('node/1');
    expect(JSON.stringify(out)).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
  });
});

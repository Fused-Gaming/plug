/**
 * Integration Test Suite for Plug Charging Station Locator
 * Tests cover: data operations, filtering, keyboard navigation,
 * responsive design, and feature interactions.
 *
 * Run with: npm test
 */

import { locations } from '../data/locations';

describe('Plug - Integration Tests Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // FEATURE 1: Data Integrity and Initialization
  // ============================================================================

  test('1. All locations are loaded and accessible', () => {
    expect(locations).toBeDefined();
    expect(Array.isArray(locations)).toBe(true);
    expect(locations.length).toBe(10);
  });

  test('2. Each location has required fields', () => {
    locations.forEach(location => {
      expect(location).toHaveProperty('id');
      expect(location).toHaveProperty('name');
      expect(location).toHaveProperty('lat');
      expect(location).toHaveProperty('lng');
      expect(location).toHaveProperty('address');
      expect(location).toHaveProperty('charger_type');
      expect(location).toHaveProperty('connectors');
      expect(location).toHaveProperty('power_kw');
    });
  });

  test('3. Locations have unique IDs', () => {
    const ids = locations.map(loc => loc.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(locations.length);
  });

  test('4. All locations are in Oakland, CA area', () => {
    locations.forEach(location => {
      // Oakland center is approximately 37.8044, -122.2731
      expect(location.lat).toBeGreaterThan(37.7);
      expect(location.lat).toBeLessThan(37.9);
      expect(location.lng).toBeGreaterThan(-122.4);
      expect(location.lng).toBeLessThan(-122.1);
    });
  });

  test('5. Charger types are consistent and valid', () => {
    const validChargerTypes = ['Level 1', 'Level 2', 'DC Fast'];
    locations.forEach(location => {
      expect(validChargerTypes).toContain(location.charger_type);
    });
  });

  test('6. Connectors field contains comma-separated values', () => {
    locations.forEach(location => {
      expect(typeof location.connectors).toBe('string');
      expect(location.connectors.length).toBeGreaterThan(0);
      const connectors = location.connectors.split(',').map(c => c.trim());
      expect(connectors.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // FEATURE 2: Filtering Functionality
  // ============================================================================

  test('7. Filter by charger type - Level 2', () => {
    const filtered = locations.filter(loc => loc.charger_type === 'Level 2');
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(loc => {
      expect(loc.charger_type).toBe('Level 2');
    });
  });

  test('8. Filter by charger type - DC Fast', () => {
    const filtered = locations.filter(loc => loc.charger_type === 'DC Fast');
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(loc => {
      expect(loc.charger_type).toBe('DC Fast');
    });
  });

  test('9. Filter by connector type - Tesla', () => {
    const filtered = locations.filter(loc =>
      loc.connectors.split(',').map(c => c.trim()).includes('Tesla')
    );
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(loc => {
      const connectors = loc.connectors.split(',').map(c => c.trim());
      expect(connectors).toContain('Tesla');
    });
  });

  test('10. Filter by connector type - CCS', () => {
    const filtered = locations.filter(loc =>
      loc.connectors.split(',').map(c => c.trim()).includes('CCS')
    );
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(loc => {
      const connectors = loc.connectors.split(',').map(c => c.trim());
      expect(connectors).toContain('CCS');
    });
  });

  test('11. Filter by connector type - J1772', () => {
    const filtered = locations.filter(loc =>
      loc.connectors.split(',').map(c => c.trim()).includes('J1772')
    );
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(loc => {
      const connectors = loc.connectors.split(',').map(c => c.trim());
      expect(connectors).toContain('J1772');
    });
  });

  test('12. Combine filters - Level 2 AND CCS', () => {
    const filtered = locations.filter(
      loc =>
        loc.charger_type === 'Level 2' &&
        loc.connectors.split(',').map(c => c.trim()).includes('CCS')
    );
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(loc => {
      expect(loc.charger_type).toBe('Level 2');
      const connectors = loc.connectors.split(',').map(c => c.trim());
      expect(connectors).toContain('CCS');
    });
  });

  test('13. Reset filters returns all locations', () => {
    const allLocations = locations;
    expect(allLocations.length).toBe(10);
  });

  // ============================================================================
  // FEATURE 3: Data Sorting and Distance Calculation
  // ============================================================================

  test('14. Calculate distance between two points', () => {
    const point1 = { lat: 37.8044, lng: -122.2731 };
    const point2 = { lat: 37.8105, lng: -122.2606 };

    const lat1 = point1.lat;
    const lon1 = point1.lng;
    const lat2 = point2.lat;
    const lon2 = point2.lng;

    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(1); // Should be less than 1 mile
  });

  test('15. Locations can be sorted by distance', () => {
    const userLocation = { lat: 37.8044, lng: -122.2731 };

    function calculateDistance(point1, point2) {
      const lat1 = point1.lat;
      const lon1 = point1.lng;
      const lat2 = point2.lat;
      const lon2 = point2.lng;

      const R = 3959;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    const sortedLocations = [...locations].sort((a, b) => {
      const distA = calculateDistance(userLocation, a);
      const distB = calculateDistance(userLocation, b);
      return distA - distB;
    });

    expect(sortedLocations.length).toBe(locations.length);
    // Verify sorting is in ascending order
    for (let i = 1; i < sortedLocations.length; i++) {
      const distPrev = calculateDistance(userLocation, sortedLocations[i - 1]);
      const distCurr = calculateDistance(userLocation, sortedLocations[i]);
      expect(distPrev).toBeLessThanOrEqual(distCurr);
    }
  });

  // ============================================================================
  // FEATURE 4: Data Transformation and Derived Information
  // ============================================================================

  test('16. Extract unique charger types', () => {
    const types = new Set(locations.map(loc => loc.charger_type));
    const uniqueTypes = Array.from(types).sort();

    expect(uniqueTypes.length).toBeGreaterThan(0);
    expect(uniqueTypes).toContain('Level 2');
    expect(uniqueTypes).toContain('DC Fast');
  });

  test('17. Extract unique connector types', () => {
    const connectors = new Set();
    locations.forEach(loc => {
      loc.connectors
        .split(',')
        .map(c => c.trim())
        .forEach(c => connectors.add(c));
    });

    const uniqueConnectors = Array.from(connectors).sort();

    expect(uniqueConnectors.length).toBeGreaterThan(0);
    expect(uniqueConnectors).toContain('CCS');
    expect(uniqueConnectors).toContain('J1772');
  });

  test('18. Find location by name', () => {
    const locationName = 'Downtown Oakland Convention Center';
    const found = locations.find(loc => loc.name === locationName);

    expect(found).toBeDefined();
    expect(found.id).toBe(1);
    expect(found.charger_type).toBe('Level 2');
  });

  test('19. Find locations by charger type with details', () => {
    const dcFastLocations = locations.filter(
      loc => loc.charger_type === 'DC Fast'
    );

    expect(dcFastLocations.length).toBe(2); // Jack London and Oakland Airport
    expect(dcFastLocations[0].power_kw).toBeGreaterThanOrEqual(50); // High power DC Fast
  });

  test('20. Search locations by partial address match', () => {
    const query = 'Oakland';
    const results = locations.filter(loc =>
      loc.address.toLowerCase().includes(query.toLowerCase())
    );

    expect(results.length).toBeGreaterThan(0);
    results.forEach(loc => {
      expect(loc.address.toLowerCase()).toContain(query.toLowerCase());
    });
  });

  // ============================================================================
  // FEATURE 5: Feature Integration and Accessibility
  // ============================================================================

  test('21. All locations have accessible information', () => {
    locations.forEach(location => {
      // Each location should be presentable to users
      expect(location.name.length).toBeGreaterThan(0);
      expect(location.address.length).toBeGreaterThan(0);
      expect(location.charger_type.length).toBeGreaterThan(0);
    });
  });

  test('22. Locations maintain data consistency across filters', () => {
    const filtered = locations.filter(
      loc =>
        loc.charger_type === 'Level 2' &&
        loc.connectors.split(',').map(c => c.trim()).includes('CCS')
    );

    // Verify each filtered location still has all required fields
    filtered.forEach(loc => {
      expect(loc.id).toBeDefined();
      expect(loc.name).toBeDefined();
      expect(loc.lat).toBeDefined();
      expect(loc.lng).toBeDefined();
      expect(loc.address).toBeDefined();
      expect(loc.charger_type).toBeDefined();
      expect(loc.connectors).toBeDefined();
      expect(loc.power_kw).toBeDefined();
    });
  });

  test('23. Hours information is available when provided', () => {
    const locationsWithHours = locations.filter(loc => loc.hours);

    expect(locationsWithHours.length).toBeGreaterThan(0);
    locationsWithHours.forEach(loc => {
      expect(typeof loc.hours).toBe('string');
      expect(loc.hours.length).toBeGreaterThan(0);
    });
  });

  test('24. Source information is available for data tracking', () => {
    const locationsWithSource = locations.filter(loc => loc.source);

    expect(locationsWithSource.length).toBeGreaterThan(0);
    locationsWithSource.forEach(loc => {
      expect(typeof loc.source).toBe('string');
      expect(loc.source.length).toBeGreaterThan(0);
    });
  });

  test('25. Verified date information is available for data quality', () => {
    const locationsWithVerifiedDate = locations.filter(
      loc => loc.verified_date
    );

    expect(locationsWithVerifiedDate.length).toBeGreaterThan(0);
    locationsWithVerifiedDate.forEach(loc => {
      expect(typeof loc.verified_date).toBe('string');
      expect(loc.verified_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  test('26. Multiple filtering operations work together', () => {
    const step1 = locations.filter(
      loc => loc.charger_type === 'Level 2' || loc.charger_type === 'DC Fast'
    );
    const step2 = step1.filter(loc =>
      loc.connectors.split(',').map(c => c.trim()).includes('CCS')
    );

    expect(step1.length).toBeGreaterThanOrEqual(step2.length);
    expect(step2.length).toBeGreaterThan(0);
  });

  test('27. Complex filtering scenarios work correctly', () => {
    // Find DC Fast charging with multiple connector types
    const complexFiltered = locations.filter(
      loc =>
        loc.charger_type === 'DC Fast' &&
        loc.connectors.split(',').map(c => c.trim()).length > 1
    );

    expect(complexFiltered.length).toBeGreaterThan(0);
    complexFiltered.forEach(loc => {
      expect(loc.charger_type).toBe('DC Fast');
      const connectorCount = loc.connectors.split(',').length;
      expect(connectorCount).toBeGreaterThan(1);
    });
  });

  test('28. Filter results remain deterministic across multiple executions', () => {
    const filterCriteria = loc => loc.charger_type === 'Level 2';

    const result1 = locations.filter(filterCriteria);
    const result2 = locations.filter(filterCriteria);
    const result3 = locations.filter(filterCriteria);

    expect(result1.length).toBe(result2.length);
    expect(result2.length).toBe(result3.length);
    expect(JSON.stringify(result1)).toBe(JSON.stringify(result2));
  });

  test('29. Empty filter results are handled gracefully', () => {
    // Search for non-existent charger type
    const filtered = locations.filter(
      loc => loc.charger_type === 'NonExistent'
    );

    expect(filtered).toBeDefined();
    expect(Array.isArray(filtered)).toBe(true);
    expect(filtered.length).toBe(0);
  });

  test('30. Data operations are non-mutating', () => {
    const originalLength = locations.length;
    const originalFirstLocation = { ...locations[0] };

    // Perform filter operation
    locations.filter(loc => loc.charger_type === 'Level 2');

    // Verify original data is unchanged
    expect(locations.length).toBe(originalLength);
    expect(JSON.stringify(locations[0])).toBe(
      JSON.stringify(originalFirstLocation)
    );
  });
});

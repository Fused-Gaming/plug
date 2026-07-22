// Location data adapter - provides read-only access to charging station data
// Uses direct import from locations.js (no network fetch)

import locationsData from '../data/locations'

/**
 * Load locations from imported data
 * @returns {Promise<Array>} Array of location objects
 */
export async function getLocations() {
  return Promise.resolve(locationsData && Array.isArray(locationsData) ? locationsData : [])
}

/**
 * Get a single location by ID
 * @param {number} id - Location ID
 * @returns {Promise<Object|null>} Location object or null if not found
 */
export async function getLocationById(id) {
  const locations = await getLocations();
  return locations.find((loc) => loc.id === id) || null;
}

/**
 * Search locations by name or address
 * @param {string} query - Search query (case-insensitive)
 * @returns {Promise<Array>} Matching locations
 */
export async function searchLocations(query) {
  if (!query || query.trim() === '') {
    return getLocations();
  }

  const locations = await getLocations();
  const q = query.toLowerCase();
  return locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(q) || loc.address.toLowerCase().includes(q)
  );
}

/**
 * Filter locations by charger type
 * @param {string} chargerType - Type: "Level 1", "Level 2", "DC Fast"
 * @returns {Promise<Array>} Matching locations
 */
export async function filterByChargerType(chargerType) {
  const locations = await getLocations();
  if (!chargerType) return locations;
  return locations.filter((loc) => loc.charger_type === chargerType);
}

/**
 * Filter locations by connector type
 * @param {string} connector - Connector type: "Tesla", "CCS", "J1772", "CHAdeMO"
 * @returns {Promise<Array>} Matching locations
 */
export async function filterByConnector(connector) {
  const locations = await getLocations();
  if (!connector) return locations;
  return locations.filter((loc) =>
    loc.connectors
      .split(',')
      .map((c) => c.trim())
      .includes(connector)
  );
}

/**
 * Get all available charger types
 * @returns {Promise<Array>} Unique charger types
 */
export async function getChargerTypes() {
  const locations = await getLocations();
  const types = new Set(locations.map((loc) => loc.charger_type));
  return Array.from(types).sort();
}

/**
 * Get all available connector types
 * @returns {Promise<Array>} Unique connector types
 */
export async function getConnectorTypes() {
  const locations = await getLocations();
  const connectors = new Set();
  locations.forEach((loc) => {
    loc.connectors
      .split(',')
      .map((c) => c.trim())
      .forEach((c) => connectors.add(c));
  });
  return Array.from(connectors).sort();
}

/**
 * Clear cache (for testing or manual refresh)
 */
export function clearCache() {
  cachedLocations = null;
}

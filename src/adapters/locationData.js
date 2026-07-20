// Location data adapter - provides read-only access to charging station data
// Contract: Reads from seed-data.json or SQLite database
// Wave 1 Database (A03) Schema: locations table with id, name, lat, lng, address, charger_type, connectors, power_kw, source, verified_date

let cachedLocations = null;

/**
 * Load locations from seed data (JSON format)
 * Falls back to in-memory data if database unavailable
 * @returns {Promise<Array>} Array of location objects
 */
export async function getLocations() {
  if (cachedLocations) {
    return cachedLocations;
  }

  try {
    const response = await fetch('/plug/src/data/seed-data.json');
    if (!response.ok) throw new Error('Failed to load seed data');
    const data = await response.json();
    cachedLocations = data.locations || [];
  } catch (error) {
    console.error('Error loading locations:', error);
    cachedLocations = [];
  }

  return cachedLocations;
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

/**
 * External service configuration
 * Centralized configuration for external URLs and endpoints
 * Allows easy switching between different services and environments
 */

export const MAP_TILES = {
  // OpenStreetMap - Free, open-source tile provider
  // No API key required, public data
  openstreetmap: {
    name: 'OpenStreetMap',
    tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    tileSize: 256,
  },
}

export const DEFAULT_TILE_PROVIDER = MAP_TILES.openstreetmap

export const MAPLIBRE_CONFIG = {
  // Default fallback style using OpenStreetMap
  getDefaultStyle: () => ({
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        url: DEFAULT_TILE_PROVIDER.tileUrl,
        tileSize: DEFAULT_TILE_PROVIDER.tileSize,
      },
    },
    layers: [
      {
        id: 'osm',
        type: 'raster',
        source: 'osm',
      },
    ],
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  }),
}

// Map display defaults
export const MAP_DEFAULTS = {
  DEFAULT_CENTER: [-122.2731, 37.8044], // Oakland, CA
  DEFAULT_ZOOM: 12,
}

// Feature flags for optional functionality
export const FEATURES = {
  // Geolocation - request user's location for nearby sorting
  GEOLOCATION_ENABLED: true,

  // Map clustering - group nearby markers
  CLUSTERING_ENABLED: true,
}

// Error tracking and reporting
export const REPORTING = {
  // Send errors to tracking service (currently disabled)
  ERROR_REPORTING_ENABLED: false,

  // Log errors to console in development
  CONSOLE_LOGGING_ENABLED: process.env.NODE_ENV === 'development',
}

export default {
  MAP_TILES,
  DEFAULT_TILE_PROVIDER,
  MAPLIBRE_CONFIG,
  MAP_DEFAULTS,
  FEATURES,
  REPORTING,
}

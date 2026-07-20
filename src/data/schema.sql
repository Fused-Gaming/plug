-- Charging Station Locator MVP — SQLite Schema
-- Wave 1 Agent A03: SQLite Data Owner
-- Date: 2026-07-20

-- Locations Table (Oakland EV Charging Stations)
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  address TEXT NOT NULL,
  charger_type TEXT NOT NULL,
  connectors TEXT NOT NULL,
  power_kw REAL NOT NULL,
  source TEXT NOT NULL,
  verified_date TEXT NOT NULL
);

-- Create index on geographic coordinates for spatial queries
CREATE INDEX IF NOT EXISTS idx_locations_lat_lng
  ON locations(lat, lng);

-- Create index on name for search queries
CREATE INDEX IF NOT EXISTS idx_locations_name
  ON locations(name);

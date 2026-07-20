# Data Sources & OSINT Collection

This document explains how we source charging station data and guidelines for expanding coverage to new cities and regions.

## Table of Contents

- [Primary Sources (Oakland MVP)](#primary-sources-oakland-mvp)
- [Data Quality Standards](#data-quality-standards)
- [Collection Methodology](#collection-methodology)
- [Data Formats](#data-formats)
- [Geographic Expansion](#geographic-expansion)
- [Verification Process](#verification-process)
- [Attribution](#attribution)

## Primary Sources (Oakland MVP)

### Tier 1: Government Open Data

**Oakland Open Data Portal**
- **URL:** https://data.oaklandca.gov/
- **Access:** Public, free, no API key required
- **Datasets:** City services, infrastructure, public facilities
- **Charging Data:** Municipal charging stations in public parking
- **License:** Public Domain (CC0)
- **Frequency:** Updated quarterly
- **Authority:** Official city government source

**California Public Utilities Commission (CPUC)**
- **URL:** https://www.cpuc.ca.gov/
- **Dataset:** Electric vehicle charging infrastructure
- **Coverage:** Statewide California charging stations
- **Authority:** State regulatory agency
- **Reliability:** Official utility company data

### Tier 2: Community Platforms

**PlugShare**
- **URL:** https://www.plugshare.com/
- **Type:** Community-contributed EV charging network
- **Data:** User-submitted and verified charging locations
- **Details:** Charger types, connectors, real-time status
- **Coverage:** Global, with strong US coverage
- **Community Verification:** Reviews and ratings from drivers
- **License:** User-generated content (must attribute)
- **Strengths:** Detailed, current, community-verified

**EvGo & ChargePoint Networks**
- **URL:** https://www.evgo.com/, https://www.chargepoint.com/
- **Type:** Private charging network operators
- **Public Data:** Station locations (public-facing info)
- **Coverage:** USA-wide rapid charging infrastructure
- **Limitations:** Proprietary networks, some data restricted
- **Attribution:** Must credit network operator

### Tier 3: Open Mapping Projects

**OpenStreetMap (OSM)**
- **URL:** https://www.openstreetmap.org/
- **Type:** Community-maintained geospatial database
- **Tags:** `amenity=charging_station`
- **Data:** Location, charger type, connector types, power
- **License:** Open Data Commons (ODbL) - Attribution required
- **Access:** Free download or API
- **Coverage:** Global, community-contributed
- **Verification:** Community review process

**Wikimedia Commons - Charging Stations**
- **URL:** https://commons.wikimedia.org/
- **Type:** Community photos and metadata
- **Data:** Visual documentation of charging stations
- **Coverage:** User-contributed photos with location data
- **License:** Creative Commons (Attribution required)

### Tier 4: Academic & Research

**UC Berkeley Transportation Sustainability Research Center (TSRC)**
- **Type:** University research on EV infrastructure
- **Data:** Research datasets on charging availability
- **Access:** Published reports and open datasets
- **Reliability:** Peer-reviewed research

**San Francisco Bay Area Regional Data (SFRTA)**
- **URL:** Regional transportation studies
- **Type:** Bay Area EV infrastructure mapping
- **Coverage:** Oakland and surrounding areas
- **Access:** Regional planning agency data

### Tier 5: Utilities & Infrastructure Operators

**East Bay Regional Parks (EBRPD)**
- **Type:** Parks department charging infrastructure
- **Coverage:** Public park charging locations
- **Verification:** Official government source
- **Access:** Public website and open data

**Alameda County Services**
- **Type:** County-level facility charging
- **Coverage:** Public facilities (libraries, hospitals, government)
- **Verification:** Official government source

## Data Quality Standards

### Required Fields

Every charging station must include:

```json
{
  "id": "unique_integer_or_string",
  "name": "human_readable_name",
  "lat": 37.8044,              // Latitude (WGS84)
  "lng": -122.2712,            // Longitude (WGS84)
  "address": "full_street_address",
  "charger_type": "Level 2",   // or "DC Fast", "Level 1"
  "connectors": "Tesla, CCS, J1772",
  "power_kw": 7.2,             // Power output in kilowatts
  "source": "Oakland Open Data", // Attribution
  "verified_date": "2026-07-20"  // YYYY-MM-DD
}
```

### Data Validation

Each entry must meet:

| Field | Validation Rule | Example |
|-------|-----------------|---------|
| **id** | Unique, non-negative | 1, 42, "oakl-cc-001" |
| **name** | Non-empty string, ≤100 chars | "Downtown Convention Center" |
| **lat** | Valid latitude (-90 to 90) | 37.8044 |
| **lng** | Valid longitude (-180 to 180) | -122.2712 |
| **address** | Full street address | "10 10th St, Oakland, CA 94607" |
| **charger_type** | Level 1, Level 2, or DC Fast | "Level 2" |
| **connectors** | Comma-separated known types | "Tesla, CCS, J1772" |
| **power_kw** | Positive number | 7.2, 50.0, 100.0 |
| **source** | Data source attribution | "Oakland Open Data" |
| **verified_date** | ISO 8601 date | "2026-07-20" |

### Accuracy Standards

- **Geolocation:** Within 50 meters of actual location
- **Charger Type:** Verified from official source
- **Connector Types:** Confirmed operational (not planned)
- **Power Output:** Actual installed capacity
- **Address:** Current, deliverable address
- **Accessibility:** Public access (not private)

## Collection Methodology

### Step 1: Source Identification

Identify 3+ public data sources for target city:

```
Example: Oakland
├─ Oakland Open Data Portal (government)
├─ PlugShare community data (verified users)
└─ OpenStreetMap (crowd-sourced)
```

### Step 2: Data Extraction

**From government sources (API):**
```bash
# Example: Oakland Open Data API
curl -X GET \
  "https://data.oaklandca.gov/resource/[dataset-id].json" \
  -H "Content-Type: application/json" \
  | jq '.[] | select(.amenity == "charging_station")'
```

**From community sources (manual collection):**
1. Visit platform website
2. Search for target city/region
3. Note each charging location
4. Manually compile coordinates and details

**From OpenStreetMap:**
```bash
# Overpass API query for charging stations
[bbox:37.7,−122.3,37.9,−122.2];
node["amenity"="charging_station"];
out center;
```

### Step 3: Data Normalization

Convert diverse formats to standard JSON:

```javascript
// Example: Convert OpenStreetMap data
const osmStation = {
  "tags": {
    "name": "Downtown Charger",
    "lat": 37.8044,
    "lon": -122.2712,  // Note: OSM uses 'lon' not 'lng'
    "socket:type2": "yes",  // CCS
    "socket:tesla:supercharger": "no"
  }
};

// Normalize to standard format
const normalized = {
  id: generateId(),
  name: osmStation.tags.name,
  lat: osmStation.tags.lat,
  lng: osmStation.tags.lon,  // Rename lon → lng
  address: "10 10th St, Oakland, CA 94607",  // Manual lookup
  charger_type: "Level 2",
  connectors: "CCS, J1772",
  power_kw: 7.2,
  source: "OpenStreetMap",
  verified_date: new Date().toISOString().split('T')[0]
};
```

### Step 4: Verification

Cross-reference across sources:

```
OSM data: "Downtown Convention Center" at 37.8044, -122.2712
PlugShare: "DOCC Parking Level 2 Charger" at 37.8044, -122.2712
Oakland Data: "Convention Center Charging" at 10 10th St

Result: ✅ Consistent → Confirm entry
```

### Step 5: Quality Check

```bash
# Validate JSON schema
npm install jsonschema
node validate-stations.js src/data/locations.json

# Check for duplicates
node check-duplicates.js src/data/locations.json

# Verify geolocation
node verify-coordinates.js src/data/locations.json

# Test on live map
npm run dev  # Visually inspect all markers
```

## Data Formats

### Input Formats (from sources)

**CSV (government data):**
```csv
id,name,latitude,longitude,address,charger_type,connectors,power_kw
1,Downtown Convention Center,37.8044,-122.2712,"10 10th St, Oakland, CA 94607",Level 2,"Tesla, CCS, J1772",7.2
```

**JSON (PlugShare, OSM API):**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Downtown Convention Center",
        "charger_type": "Level 2"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-122.2712, 37.8044]
      }
    }
  ]
}
```

### Output Format (seed-data.json)

```json
{
  "version": "1.0",
  "metadata": {
    "city": "Oakland, CA",
    "count": 10,
    "date_verified": "2026-07-20",
    "sources": [
      "Oakland Open Data Portal",
      "PlugShare Community",
      "OpenStreetMap"
    ]
  },
  "locations": [
    {
      "id": 1,
      "name": "Downtown Oakland Convention Center",
      "lat": 37.8044,
      "lng": -122.2712,
      "address": "10 10th St, Oakland, CA 94607",
      "charger_type": "Level 2",
      "connectors": "Tesla, CCS, J1772",
      "power_kw": 7.2,
      "source": "PlugShare",
      "verified_date": "2026-07-20"
    }
  ]
}
```

## Geographic Expansion

### Adding a New City

**Requirements:**
- 10+ public charging stations
- At least 3 public data sources
- Community interest/need
- Volunteer to maintain data

**Process:**

1. **Research Phase**
   ```bash
   # Document potential sources
   - Check local government open data portal
   - Search PlugShare for city coverage
   - Query OpenStreetMap for existing data
   ```

2. **Collection Phase**
   ```bash
   # Create new data file
   touch src/data/[city-name]-locations.json
   
   # Collect 10+ verified stations
   # Follow data standards above
   ```

3. **Integration Phase**
   ```javascript
   // Update src/App.jsx
   import oaklandStations from './data/oakland-locations.json';
   import newCityStations from './data/new-city-locations.json';
   
   const allStations = [
     ...oaklandStations.locations,
     ...newCityStations.locations
   ];
   ```

4. **Testing Phase**
   ```bash
   npm run dev
   # Verify all markers display
   # Test search and filtering
   # Mobile responsive test
   ```

5. **Deployment Phase**
   ```bash
   git add src/data/[city].json
   git commit -m "data: Add [city] charging stations"
   git push
   # GitHub Actions deploys automatically
   ```

### Priority Cities (Post-MVP)

Based on charging density and community need:

1. **San Francisco, CA** — High charger density, strong OSINT
2. **Los Angeles, CA** — Large vulnerable population, extensive data
3. **Seattle, WA** — High EV adoption, good public data
4. **Portland, OR** — Community-driven, open data city
5. **Denver, CO** — Growing EV infrastructure
6. **Chicago, IL** — Large city, public charging expansion
7. **New York, NY** — High density charging, good data
8. **Boston, MA** — Strong public data infrastructure

## Verification Process

### Step 1: Source Verification

Confirm source legitimacy:

- [ ] Government domain (.gov) or official organization
- [ ] Data current (verified within last 6 months)
- [ ] License allows public use and attribution
- [ ] API stable or download consistent

### Step 2: Data Verification

Check each station's accuracy:

- [ ] Coordinates within 50m of actual location
- [ ] Charger type verified from on-site or official source
- [ ] Connectors match installed equipment
- [ ] Power output from spec sheet or labeling
- [ ] Address is public (not private property)

**Verification Methods:**
- Google Maps Street View (visual confirmation)
- Phone call to facility (operational status)
- Public facility websites (official spec)
- Community photos (PlugShare, Google Photos)

### Step 3: Cross-Reference

Compare across multiple sources:

```
Station: Downtown Convention Center
Lat: 37.8044 | Lng: -122.2712

Sources:
✅ Oakland Open Data: Present, Type: Level 2
✅ PlugShare: Present, 47 user reviews
✅ OpenStreetMap: Present, socket:type2 confirmed

Decision: ✅ VERIFIED
```

### Step 4: Approval

Before merge to main:

- [ ] PR reviewed by maintainer
- [ ] Data validated against standards
- [ ] All new sources documented
- [ ] No personal/private data included
- [ ] Attribution complete
- [ ] CI/CD tests pass

## Attribution

### Required Attribution

Every data source must be credited:

```json
{
  "source": "Oakland Open Data",
  "verified_date": "2026-07-20"
}
```

### README Documentation

Update README when adding sources:

```markdown
## Data Attribution

This project uses charging station data from:

- **Oakland Open Data Portal** — Municipal facilities
  - https://data.oaklandca.gov/
  - License: Public Domain (CC0)

- **PlugShare Community** — User-verified network
  - https://www.plugshare.com/
  - License: User-generated (CC-BY where applicable)

- **OpenStreetMap** — Crowd-sourced geospatial data
  - https://www.openstreetmap.org/
  - License: ODbL (requires attribution)

All data sourced from public, freely-available datasets.
No private or proprietary data included.
```

### Source Listing (in seed-data.json)

```json
{
  "metadata": {
    "sources": [
      "Oakland Open Data Portal",
      "PlugShare Community",
      "OpenStreetMap"
    ]
  }
}
```

## Limitations & Disclaimers

### What We Don't Collect

- ❌ **Real-time availability** — Updates require API integration
- ❌ **Operating hours** — Varies by facility, not in scope
- ❌ **Pricing** — Often varies by network/charger
- ❌ **Accessibility features** — Would require on-site verification
- ❌ **User reviews** — Not part of MVP

### Known Gaps

- **Rural areas** — Limited public charging infrastructure
- **Private networks** — ChargePoint/EVgo networks (proprietary data)
- **Planned stations** — Only operational chargers included
- **Real-time status** — No live availability tracking

### Data Freshness

- MVP data verified: 2026-07-20
- Recommended refresh: Every 6 months
- Manual update process (no automated sync)
- Community reports accepted for urgent updates

## Contributing Data

### For Community Contributors

1. **Find new stations**
   - Search PlugShare for your city
   - Check OpenStreetMap
   - Look at government open data

2. **Document findings**
   - Take note of location
   - Take photo of signage (optional)
   - Record charger type and connectors

3. **Submit to project**
   - Open GitHub issue with station info
   - Or create pull request with updated JSON
   - Include source attribution

4. **Verification**
   - Maintainer cross-checks against sources
   - If verified, merged to next release

---

**Last Updated:** 2026-07-20  
**Maintained By:** Agent A09 (Documentation & Content)

**Questions about a specific data source?** Open a GitHub issue or see [CONTRIBUTING.md](CONTRIBUTING.md).

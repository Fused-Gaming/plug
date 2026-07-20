# OSINT Research Plan — Oakland Electrical Infrastructure

**Project:** Charging Station Locator MVP  
**Focus City:** Oakland, California  
**Research Scope:** Public charging infrastructure, utility networks, power availability  
**Data Classification:** All sources are publicly available and OSINT-compliant  

---

## 🎯 Research Objectives

1. **Map public charging stations** in Oakland with accurate locations
2. **Identify electrical service corridors** (for charging station placement)
3. **Locate public power infrastructure** (substations, distribution hubs)
4. **Document utility service areas** (grid capacity, service levels)
5. **Prioritize deployment zones** (high-demand neighborhoods)

---

## 📊 Authorized OSINT Data Sources

### Tier 1: Official Municipal Data (Highest Authority)

#### Oakland Open Data Portal
- **URL:** https://data.oaklandca.gov
- **Data Available:**
  - City electrical substations (GIS layer)
  - Street lighting infrastructure
  - Public facilities with utilities
  - Parks and public spaces (potential charging locations)
  - Energy consumption by district
- **Format:** Shapefile, GeoJSON, CSV
- **License:** Public domain (CC0)
- **Use Case:** Authoritative infrastructure map

**Query Strategy:**
```
Search: "electricity" OR "substation" OR "power"
Filter: Oakland city boundaries
Export: GeoJSON for mapping
```

#### City of Oakland Public Works
- **Department:** Oakland Department of Transportation
- **Resources:**
  - Public right-of-way maps
  - Utility corridor overlays
  - Traffic signal locations (often co-located with power)
  - Street inventory database
- **Access:** FOIA requests accepted
- **Data Type:** Vector GIS layers

---

### Tier 2: California State Infrastructure Data

#### California Energy Commission (CEC)
- **URL:** https://www.energy.ca.gov
- **Data Available:**
  - Renewable energy facility locations
  - Solar installation sites (public)
  - EV charging station registry
  - Grid resilience maps
- **Format:** Interactive maps, downloadable datasets
- **License:** Public data
- **Relevance:** State-level charging infrastructure

#### PG&E Service Territory Maps
- **URL:** https://www.pge.com/en_US/for-our-business-partners/energy-supply/supply-chain-sustainability/maps-of-service-areas.page
- **Data Available:**
  - Service territory boundaries
  - Major transmission corridors
  - Power plant locations
  - Substation density heatmaps
- **Format:** Public-facing web maps
- **Limitation:** Aggregate data, not specific addresses
- **Use Case:** Grid capacity planning

#### California ISO (Independent System Operator)
- **URL:** https://www.caiso.com
- **Data Available:**
  - Real-time grid status
  - Transmission constraints
  - Peak demand zones
  - Renewable generation levels
- **Format:** Web API, public dashboards
- **Use Case:** Understand charging demand windows

---

### Tier 3: Federal Infrastructure Data

#### FEMA Critical Infrastructure Layer
- **URL:** https://www.fema.gov/about/organization/national-preparedness
- **Data Available:**
  - Designated critical infrastructure
  - Power system redundancy information
  - Disaster resilience assessments
- **Format:** GIS datasets
- **Access:** Public with restrictions on military/classified info
- **Use Case:** Resilient charging placement

#### USGS Infrastructure Mapping
- **URL:** https://www.usgs.gov
- **Data Available:**
  - Utility infrastructure (non-classified)
  - Earthquake hazard zones (affects infrastructure)
  - Water/sewer systems (co-located with power)
- **Format:** Web services, shapefiles

#### Federal Transit Administration (FTA)
- **URL:** https://www.transit.dot.gov
- **Data Available:**
  - Public transit station locations
  - Bus rapid transit corridors
  - Multimodal hub locations (charging opportunity)
- **Format:** GeoJSON, KML

---

### Tier 4: Third-Party Aggregators

#### OpenStreetMap (OSM)
- **URL:** https://www.openstreetmap.org
- **Data Available:**
  - Community-mapped charging stations
  - Power infrastructure (user-contributed)
  - Points of interest with facilities
  - Road networks and parking areas
- **Format:** API access, bulk exports
- **Quality:** Crowd-sourced, variable accuracy
- **License:** ODbL (open)
- **Query Example:**
  ```
  Overpass API: node["amenity"="charging_station"](bbox);
  ```

#### Google Maps API
- **URL:** https://developers.google.com/maps
- **Data Available:**
  - Charging station locations (verified)
  - Photos and reviews
  - Opening hours
  - Contact information
- **Format:** REST API
- **License:** Attribution required
- **Cost:** Free tier available

#### PlugShare
- **URL:** https://www.plugshare.com
- **Data Available:**
  - Community-verified charging locations
  - Real-time availability
  - Connector types
  - Power output specs
- **Format:** Web scraping, API (with terms)
- **Quality:** User-maintained, high accuracy

#### ChargeHub
- **URL:** https://www.chargerhub.com
- **Data Available:**
  - Charging network locations
  - Standardized specs
  - Historical availability data
- **Format:** Web service
- **Coverage:** International database

---

### Tier 5: Utility Company Public Reports

#### Pacific Gas & Electric (PG&E)
- **Public Documents:**
  - Annual transmission reports
  - Service reliability metrics
  - Distributed energy resource maps
- **Access:** Public investor relations materials
- **Data Type:** Aggregated, strategic planning level

#### Alameda County Congestion Management Agency
- **Relevant Reports:**
  - Transportation electrification plans
  - Infrastructure readiness studies
  - Public charging needs assessments

---

## 🔍 Oakland-Specific Data Collection

### Phase 1: Baseline Infrastructure Audit

**Objective:** Establish baseline of existing charging + electrical capacity

**Sources to Query:**
1. Oakland Open Data Portal → filter by Latitude/Longitude bounds
2. PlugShare API → Oakland city boundaries
3. OpenStreetMap Overpass API → "charging_station" + "power" tags
4. Google Maps → "EV charging near Oakland"

**Deliverable:** GeoJSON file with:
- Location (lat/lon)
- Charger type (Level 1, 2, DC fast)
- Connector types (Tesla, CCS, CHAdeMO)
- Power output (kW)
- Operational status
- Data source attribution

---

### Phase 2: Electrical Service Assessment

**Objective:** Identify areas with high electrical capacity for charging expansion

**Analysis:**
1. **Substation Mapping**
   - Source: Oakland Open Data
   - Plot substation locations
   - Analyze distance to neighborhood centers
   - Identify underserved areas

2. **Peak Demand Zones**
   - Source: CAISO real-time data
   - Identify periods of low-demand (charging window opportunity)
   - Map demand by district
   - Correlate with residential areas

3. **Distribution Corridor Analysis**
   - Source: PG&E service maps
   - Identify underground vs. overhead lines
   - Assess Right-of-Way availability
   - Note constraints (easements, sensitive areas)

**Deliverable:** Heat map showing:
- Electrical capacity by zone
- Charging demand vs. supply
- Recommended deployment zones (Phase 1, 2, 3)

---

### Phase 3: Neighborhood-Level Prioritization

**Objective:** Rank neighborhoods by EV charging need and infrastructure readiness

**Data Points:**
1. **EV Ownership Concentration**
   - Source: Vehicle registration data (public aggregate)
   - Look for city reports on EV adoption
   - Census data on vehicle types

2. **Transit Accessibility**
   - Source: FTA data + BART/AC Transit maps
   - High-transit neighborhoods = parking pressure
   - Charging as commute support

3. **Residential Density**
   - Source: Census bureau (SF1 data)
   - Multi-unit dwellings = high charging demand
   - Lack of home charging = public charging dependency

4. **Business Activity**
   - Source: OpenStreetMap, Google Maps
   - Workplace charging opportunity
   - Fleet vehicle concentration

**Scoring Model:**
```
Score = (EV_Ownership_Pct × 0.3) 
       + (Transit_Accessibility × 0.25)
       + (Residential_Density × 0.25)
       + (Electrical_Capacity × 0.2)

Top 5 neighborhoods = Pilot zones
```

---

## 📍 Oakland Pilot Zones (Preliminary)

### Zone 1: Downtown Oakland
- **Why:** High transit, dense parking demand, business hub
- **Infrastructure:** Existing substations in area
- **OSINT Sources:** Oakland convention center area, BART stations
- **Stations Target:** 3-4 public chargers
- **Timeline:** Pilot phase

### Zone 2: Uptown/Lake Merritt
- **Why:** Mixed residential/commercial, active nightlife, high foot traffic
- **Infrastructure:** Utility lines well-established
- **OSINT Sources:** Parks, recreational facilities, mixed-use development
- **Stations Target:** 2-3 public chargers
- **Timeline:** Phase 2

### Zone 3: Oakland Airport Corridor
- **Why:** High traffic, commercial, commuter focus
- **Infrastructure:** Industrial power available
- **OSINT Sources:** Airport authority reports, commercial property data
- **Stations Target:** 4-5 fast chargers
- **Timeline:** Phase 1 (high impact)

### Zone 4: West Oakland Residential
- **Why:** Underserved area, increasing EV adoption
- **Infrastructure:** Neighborhood distribution networks
- **OSINT Sources:** Community needs assessments, census data
- **Stations Target:** 2 chargers (equity priority)
- **Timeline:** Phase 3 (expansion)

---

## 🔐 Data Integrity & Attribution

### Source Attribution Protocol

Every data point MUST include:
```json
{
  "location": "Downtown Oakland, CA",
  "latitude": 37.8044,
  "longitude": -122.2712,
  "charger_type": "Level 2",
  "source": "PlugShare Community",
  "source_url": "https://plugshare.com/...",
  "accessed_date": "2026-07-20",
  "attribution": "OpenStreetMap contributors",
  "license": "CC-BY-SA 4.0"
}
```

### Data Freshness Validation

- **Monthly Review:** Check for deprecated charging stations
- **Source Verification:** Cross-reference multiple sources
- **Community Feedback:** Flag unverified or incorrect data
- **Update Process:** Version control in Git with dated snapshots

---

## 🚫 Ethical OSINT Boundaries

### What We WILL Do:
✅ Use publicly available municipal data  
✅ Aggregate street-level point-of-interest data  
✅ Analyze publicly published utility reports  
✅ Reference published academic studies  
✅ Use crowd-sourced data (OpenStreetMap, Google)  
✅ Cite all sources transparently  

### What We WON'T Do:
❌ Access private utility internal systems  
❌ Scrape real-time grid operational data (classified)  
❌ Collect private EV owner information  
❌ Trespass on utility property  
❌ Reverse-engineer proprietary charging network APIs  
❌ Use classified or military infrastructure data  
❌ Violate California Public Utilities Commission regulations  

---

## 📋 Data Collection Workflow

### Step 1: Gather Public Data
```bash
# Oakland Open Data
curl -s "https://data.oaklandca.gov/api/views/..." | jq .

# OpenStreetMap Overpass API
curl -s "https://overpass-api.de/api/interpreter" \
  -d 'data=[bbox:37.7,−122.3,37.9,−122.1];(node["amenity"="charging_station"];);out json;'

# Google Maps API
# (requires key, but free tier available)
```

### Step 2: Normalize & Deduplicate
```javascript
// Merge sources, remove duplicates within 50m
locations = consolidateByProximity(sources, 50);

// Validate coordinates
locations.forEach(loc => {
  assert(isValidLatLng(loc.lat, loc.lng));
  assert(loc.source_url.length > 0);
});
```

### Step 3: Enrich with OSINT Analysis
- Cross-reference with utility maps
- Assess grid capacity
- Calculate neighborhood score
- Add accessibility metrics (ADA, walkability)

### Step 4: Version & Deploy
```bash
git commit -m "data: update Oakland EV charging OSINT snapshot (2026-07-20)"
git tag -a "data/oakland-v1.0" -m "Oakland pilot charging station baseline"
npm run build
```

---

## 🎯 Integration into MVP

### Minimal Phase (MVP):
- 10-15 representative Oakland charging locations
- Mix of public, workplace, retail chargers
- Hand-curated from OSINT sources
- Stored in `src/data/locations.db` (A03 SQLite owner)

### Example Seed Data Structure:
```javascript
[
  {
    id: 1,
    name: "Oakland Convention Center",
    lat: 37.8044,
    lng: -122.2712,
    type: "Level 2",
    connectors: ["Tesla", "CCS"],
    power_kw: 7.2,
    address: "10 10th St, Oakland, CA 94607",
    source: "PlugShare",
    source_url: "https://plugshare.com/...",
    verified_date: "2026-07-15"
  },
  // ... 14 more locations
]
```

### Future Phases:
- Real-time API integration (PlugShare, Google)
- City partnership for official data feed
- Crowdsourced verification layer
- Predictive expansion zones based on OSINT analysis

---

## 📚 References & Further Reading

### Oakland-Specific:
- Oakland Sustainability Action Plan (energy resilience)
- West Oakland Environmental Health Indicators
- Oakland Transportation Master Plan
- Alameda County Climate Action Plan

### Technical:
- OpenStreetMap Wiki: Map features
- GeoJSON Standard (RFC 7946)
- EPSG:4326 Coordinate System
- Leaflet.js Documentation (mapping library)

### Regulatory:
- California Public Utilities Commission (CPUC) EV charging standards
- Title 24 Building Energy Efficiency Standards
- Americans with Disabilities Act (ADA) Parking Requirements
- National Electrical Code (NEC) for EVSE installation

---

## ✅ OSINT Data Checklist

- [ ] Oakland Open Data Portal queried and exported
- [ ] OpenStreetMap Overpass query created and tested
- [ ] PlugShare community data collected
- [ ] Google Maps verified locations
- [ ] PG&E service territory boundaries mapped
- [ ] Substation locations geocoded
- [ ] Neighborhood demand scoring calculated
- [ ] Pilot zones (3-5) identified and documented
- [ ] All sources attributed with URLs and licenses
- [ ] Data conflicts resolved (multiple sources)
- [ ] Seed data validated for lat/lon accuracy
- [ ] 10-15 representative locations selected for MVP
- [ ] Data stored in version control with commit message
- [ ] README documentation updated with data sources

---

**Status:** 🟢 Ready for Data Collection  
**Lead:** Agent A03 (SQLite Owner) + Data Research Team  
**Timeline:** Concurrent with Wave 1 (coordination phase)


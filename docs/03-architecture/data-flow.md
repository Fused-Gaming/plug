# Data Flow

How data moves through the Charging Station Locator application.

## Application State

```
Browser Memory (App.jsx)
├── userLocation: { latitude, longitude } (from geolocation)
├── selectedLocation: Location object
├── sortedLocations: Array (sorted by distance)
└── loading: boolean
```

## Data Flow Diagram

```
┌─────────────────────┐
│  Hardcoded Locations│
│ (src/data/locations)│
└──────────┬──────────┘
           │
           ↓
    ┌──────────────┐
    │  App.jsx     │
    │  (State)     │
    └──────┬───────┘
           │
     ┌─────┴──────┐
     │            │
     ↓            ↓
┌─────────┐  ┌──────────┐
│  Map    │  │LocationList
│Component│  │Component
└─────────┘  └──────────┘
     │            │
     ↓            ↓
  Render       Render
   HTML        HTML
```

## Step-by-Step Data Flow

### 1. App Initialization
```javascript
// App.jsx renders
import locations from './data/locations.js'

function App() {
  const [userLocation, setUserLocation] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  
  // Load seed locations into state
  useEffect(() => {
    // Locations available for rendering
  }, [])
}
```

**State at this point:**
```
locations = [
  { id: 1, name: "...", lat: 40.7536, lng: -73.9832 },
  { id: 2, name: "...", lat: 40.7489, lng: -73.9680 },
  // ... 8 more
]
```

### 2. Request Geolocation (Optional)
```javascript
// User clicks "Use My Location" button
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords
    setUserLocation({ latitude, longitude })
  }
)
```

**State updates:**
```
userLocation = { latitude: 40.7505, longitude: -73.9972 }
```

### 3. Calculate Distances
```javascript
// Sort locations by distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Sort locations by distance
const sortedLocations = locations
  .map(loc => ({
    ...loc,
    distance: calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      loc.latitude,
      loc.longitude
    )
  }))
  .sort((a, b) => a.distance - b.distance)
```

**State updates:**
```
sortedLocations = [
  { id: 3, name: "Park Bench", distance: 0.2 miles },
  { id: 5, name: "Coffee Shop", distance: 0.5 miles },
  { id: 1, name: "Library", distance: 0.8 miles },
  // ... rest sorted by distance
]
```

### 4. User Clicks Marker on Map
```javascript
// Map.jsx handles marker click
function handleMarkerClick(location) {
  setSelectedLocation(location)  // Set state in parent (App)
  map.flyTo({                     // Animate map to location
    center: [location.longitude, location.latitude],
    zoom: 15
  })
}
```

**State updates:**
```
selectedLocation = { id: 3, name: "Park Bench", ... }
```

### 5. Render Detail Card
```javascript
// App.jsx passes selectedLocation to Map.jsx
// Map.jsx displays popup with:
// - Location name
// - Address
// - Operating hours
// - Distance (if user location known)
```

**Output to screen:**
```
┌─────────────────────┐
│ Park Bench Charging │
│ 123 Main St, NYC    │
│ Open: 6am-11pm      │
│ Distance: 0.2 mi    │
└─────────────────────┘
```

## Data Sources

### Primary Data: Hardcoded Locations
```javascript
// src/data/locations.js
export const locations = [
  {
    id: 1,
    name: "Central Library",
    address: "476 5th Ave, NYC",
    latitude: 40.7536,
    longitude: -73.9832,
    hours: "9am-8pm"
  },
  // ... 9 more locations
];
```

**Why hardcoded?**
- GitHub Pages doesn't support a backend
- Ensures predictable, fast data loading
- No network latency
- Perfect for MVP with seed data

### Secondary Data: Browser APIs
1. **Geolocation API** — User's current coordinates
2. **LocalStorage API** — Could store user preferences (future)
3. **SessionStorage** — Could store temporary state (future)

### Future Data Sources (Phase 5+)
1. **REST API** — Fetch locations from server
2. **Firebase** — Real-time location updates
3. **User Submissions** — Community-added locations
4. **Third-party APIs** — POI data, hours of operation

## Component Communication

```
App.jsx (state owner)
│
├─ props: locations, selectedLocation, onSelectLocation
│
├─ Map.jsx (renders map and markers)
│   │
│   └─ events: onClick → onSelectLocation callback
│
└─ LocationList.jsx (renders location list)
    │
    └─ events: onClick → onSelectLocation callback
```

### Prop Passing
```javascript
// App.jsx
<Map
  locations={locations}
  selectedLocation={selectedLocation}
  onSelectLocation={setSelectedLocation}
/>

<LocationList
  locations={sortedLocations}
  selectedLocation={selectedLocation}
  onSelectLocation={setSelectedLocation}
/>
```

### Event Handling
```javascript
// Map.jsx
marker.on('click', () => {
  props.onSelectLocation(location)  // Bubble up to App
})

// LocationList.jsx
<div onClick={() => props.onSelectLocation(location)}>
```

## Performance Considerations

### Bundle Size
- React 18: ~42 KB (gzipped)
- MapLibre GL: ~75 KB (gzipped)
- CSS: ~5 KB
- **Total:** ~122 KB (reasonable for all features)

### Load Time
1. Browser downloads 122 KB
2. JavaScript parses and executes (~100ms)
3. React initializes (~50ms)
4. Map loads and renders (~500ms)
5. Locations rendered (~100ms)
6. **Total to interactive:** ~750ms

### Optimization Strategies
- Vite uses code splitting for efficient loading
- MapLibre lazy-loads map tiles
- CSS is minified and inlined
- No unnecessary re-renders (proper React optimization)

## Future Data Flows

### Phase 5+: Real-Time Updates
```
User Submits Location
→ API sends to server
→ Server stores in database
→ Webhook notifies clients
→ App fetches updated list
→ Map re-renders with new marker
```

### Phase 5+: User Authentication
```
User clicks "Submit Location"
→ Redirected to login
→ Authenticates with GitHub/Google
→ Token stored in localStorage
→ Form pre-filled with user data
→ Submission includes user verification
```

---

**[← Back to Section](README.md) | [← Back to Index](../INDEX.md)**

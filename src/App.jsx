import { useState, useEffect } from 'react'
import Map from './components/Map'
import LocationList from './components/LocationList'
import Filters from './components/Filters'
import LocationDetail from './components/LocationDetail'
import { locations } from './data/locations'

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [allLocations, setAllLocations] = useState(locations)
  const [filteredLocations, setFilteredLocations] = useState(locations)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          console.log('Geolocation denied or unavailable')
        }
      )
    }
  }, [])

  const sortedLocations = getSortedLocations(filteredLocations, userLocation)

  const handleFilterChange = (filtered) => {
    setFilteredLocations(filtered)
    setSelectedLocation(null)
  }

  const getDistance = (point1, point2) => {
    const lat1 = point1.lat
    const lon1 = point1.lng
    const lat2 = point2.lat
    const lon2 = point2.lng

    const R = 3959 // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="header">
        <h1>📱 Charging Station Locator</h1>
        <p>Find device charging nearby</p>
      </header>

      <div className="main-content" id="main-content">
        <div className="map-container">
          <Map
            locations={sortedLocations}
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
            userLocation={userLocation}
          />
        </div>

        <div className="list-container">
          <Filters
            locations={allLocations}
            onFilterChange={handleFilterChange}
          />

          <LocationList
            locations={sortedLocations}
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
            userLocation={userLocation}
            getDistance={getDistance}
          />
        </div>
      </div>

      {selectedLocation && (
        <LocationDetail
          location={selectedLocation}
          userLocation={userLocation}
          getDistance={getDistance}
          onClose={() => setSelectedLocation(null)}
        />
      )}
    </div>
  )
}

function getSortedLocations(locations, userLocation) {
  if (!userLocation) return locations

  return [...locations].sort((a, b) => {
    const distA = calculateDistance(userLocation, a)
    const distB = calculateDistance(userLocation, b)
    return distA - distB
  })
}

function calculateDistance(point1, point2) {
  const lat1 = point1.lat
  const lon1 = point1.lng
  const lat2 = point2.lat
  const lon2 = point2.lng

  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

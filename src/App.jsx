import { useState, useEffect } from 'react'
import Map from './components/Map'
import LocationList from './components/LocationList'
import { locations } from './data/locations'

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [sortedLocations, setSortedLocations] = useState(locations)

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

  useEffect(() => {
    if (userLocation) {
      const sorted = [...locations].sort((a, b) => {
        const distA = getDistance(userLocation, a)
        const distB = getDistance(userLocation, b)
        return distA - distB
      })
      setSortedLocations(sorted)
    }
  }, [userLocation])

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
      <header className="header">
        <h1>📱 Charging Station Locator</h1>
        <p>Find free device charging nearby</p>
      </header>

      <div className="main-content">
        <div className="map-container">
          <Map
            locations={sortedLocations}
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
            userLocation={userLocation}
          />
        </div>

        <div className="list-container">
          <LocationList
            locations={sortedLocations}
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
            userLocation={userLocation}
            getDistance={getDistance}
          />
        </div>
      </div>
    </div>
  )
}

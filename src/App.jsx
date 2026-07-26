import { useState, useEffect } from 'react'
import Map from './components/Map'
import LocationList from './components/LocationList'
import Filters from './components/Filters'
import LocationDetail from './components/LocationDetail'
import SubmitVenueForm from './components/SubmitVenueForm'
import ConfirmSubmission from './pages/ConfirmSubmission'
import SubmissionMethodChoice from './components/SubmissionMethodChoice'
import locationsData from './data/locations'
import { logInfo, logGeolocationError } from './utils/errorSanitizer'

logInfo('App initializing')

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [allLocations, setAllLocations] = useState([])
  const [filteredLocations, setFilteredLocations] = useState([])
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [showSubmissionChoice, setShowSubmissionChoice] = useState(false)
  const [confirmationToken, setConfirmationToken] = useState(null)
  const [isLoadingLocations, setIsLoadingLocations] = useState(true)

  // Fetch locations from the live JSON endpoint
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/data/locations.json')
        if (!response.ok) throw new Error('Failed to fetch locations')
        const data = await response.json()

        // Transform API format to component format
        const transformed = data.venues.map((venue) => ({
          id: venue.id,
          name: venue.name,
          lat: venue.lat,
          lng: venue.lon,
          address: venue.address,
          category: venue.category,
          indoor: venue.indoor,
          access: venue.access,
          hours: venue.hours,
          amenities: Array.isArray(venue.amenities) ? venue.amenities : [],
          tier: venue.tier,
        }))

        logInfo('Loaded', transformed.length, 'locations from API')
        setAllLocations(transformed)
        setFilteredLocations(transformed)
      } catch (error) {
        logInfo('Failed to fetch live locations, using fallback seed data')
        // Fallback: transform seed data if API fails
        if (locationsData && Array.isArray(locationsData) && locationsData.length > 0) {
          setAllLocations(locationsData)
          setFilteredLocations(locationsData)
        }
      } finally {
        setIsLoadingLocations(false)
      }
    }

    fetchLocations()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      setConfirmationToken(token)
    }
  }, [])

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
          logGeolocationError(null, 'App initialization')
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
        <div className="header-content">
          <h1>📱 Charging Station Locator</h1>
          <p>Find device charging nearby (v2.0.0 - Wave 4 Secured) — {allLocations.length} locations</p>
        </div>
        <button
          className="submit-venue-btn"
          onClick={() => setShowSubmissionChoice(true)}
          aria-label="Suggest a new charging location"
        >
          ➕ Suggest Location
        </button>
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

      {showSubmissionChoice && (
        <SubmissionMethodChoice
          onChooseForm={() => {
            setShowSubmissionChoice(false)
            setShowSubmitForm(true)
          }}
          onChooseIssue={() => {
            setShowSubmissionChoice(false)
            window.open('https://github.com/Fused-Gaming/plug/issues/new?template=location.yml&title=[LOCATION]', '_blank')
          }}
          onClose={() => setShowSubmissionChoice(false)}
        />
      )}

      {showSubmitForm && (
        <SubmitVenueForm
          onClose={() => setShowSubmitForm(false)}
        />
      )}

      {confirmationToken && (
        <ConfirmSubmission
          token={confirmationToken}
          onClose={() => {
            setConfirmationToken(null)
            window.history.replaceState({}, document.title, window.location.pathname)
          }}
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

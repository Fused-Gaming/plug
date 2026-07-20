import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { logInfo, logError } from '../utils/errorSanitizer'

export default function Map({ locations, selectedLocation, onSelectLocation, userLocation }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef(new Map())
  const userMarkerRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Oakland center coordinates (default)
  const DEFAULT_CENTER = [-122.2731, 37.8044]
  const DEFAULT_ZOOM = 12

  useEffect(() => {
    if (!mapContainer.current) return

    try {
      logInfo('Initializing MapLibre GL')

      // Fallback style if external URL fails
      const fallbackStyle = {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            tileSize: 256,
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
      }

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: fallbackStyle,
        center: userLocation ? [userLocation.lng, userLocation.lat] : DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: true,
        transformRequest: (url, resourceType) => {
          // Handle errors for external resources
          return { url }
        },
      })

      // Add zoom and rotation controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

      map.current.on('load', () => {
        logInfo('Map loaded successfully')
        setMapLoaded(true)
      })

      map.current.on('error', (e) => {
        logError(e.error, 'Map render error')
      })
    } catch (error) {
      logError(error, 'Map initialization')
    }

    return () => {
      try {
        map.current?.remove()
      } catch (e) {
        logError(e, 'Map cleanup')
      }
    }
  }, [])

  // Update markers when locations change or map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    // Add markers for each location
    locations.forEach((location) => {
      const isSelected = selectedLocation?.id === location.id
      const markerColor = isSelected ? '#2563eb' : '#ff6b6b'
      const markerSvg = createMarkerSvg(markerColor)

      const el = document.createElement('div')
      el.className = `marker ${isSelected ? 'selected' : ''}`
      el.setAttribute('role', 'button')
      el.setAttribute('tabindex', '0')
      el.setAttribute('aria-label', `${location.name} at ${location.address}`)
      el.style.backgroundImage = `url('data:image/svg+xml;utf8,${markerSvg}')`
      el.style.width = '32px'
      el.style.height = '48px'
      el.style.backgroundSize = '100%'
      el.style.backgroundRepeat = 'no-repeat'
      el.style.cursor = 'pointer'

      const handleSelectLocation = () => {
        onSelectLocation(location)
        map.current.flyTo({
          center: [location.lng, location.lat],
          zoom: 14,
          duration: 1000,
        })
      }

      el.addEventListener('click', handleSelectLocation)
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleSelectLocation()
        }
      })

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([location.lng, location.lat])
        .addTo(map.current)

      markersRef.current.set(location.id, marker)
    })
  }, [locations, selectedLocation, mapLoaded, onSelectLocation])

  // Add user location marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return

    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
    }

    const userEl = document.createElement('div')
    userEl.className = 'user-marker'
    userEl.setAttribute('aria-label', 'Your current location')
    userEl.style.width = '20px'
    userEl.style.height = '20px'
    userEl.style.background = '#2563eb'
    userEl.style.borderRadius = '50%'
    userEl.style.border = '3px solid white'
    userEl.style.boxShadow = '0 0 10px rgba(37, 99, 235, 0.5)'

    userMarkerRef.current = new maplibregl.Marker({ element: userEl })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current)
  }, [userLocation, mapLoaded])

  return (
    <div className="map-wrapper">
      <div ref={mapContainer} className="map" role="region" aria-label="Charging stations map" />
      {selectedLocation && (
        <div className="location-popup" role="dialog" aria-label="Location details">
          <h3>{selectedLocation.name}</h3>
          <p className="address">{selectedLocation.address}</p>
          {selectedLocation.charger_type && (
            <p className="charger-type">
              <strong>Type:</strong> {selectedLocation.charger_type}
            </p>
          )}
          {selectedLocation.connectors && (
            <p className="connectors">
              <strong>Connectors:</strong> {selectedLocation.connectors}
            </p>
          )}
          {selectedLocation.power_kw && (
            <p className="power">
              <strong>Power:</strong> {selectedLocation.power_kw} kW
            </p>
          )}
          {selectedLocation.hours && <p className="hours">Hours: {selectedLocation.hours}</p>}
          <button onClick={() => onSelectLocation(null)} aria-label="Close location details">
            Close
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Create marker SVG with specified color
 */
function createMarkerSvg(color) {
  const svg = `<svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="24" height="24" rx="4" fill="${color}"/>
    <path d="M16 32C10 26 4 20 4 4c0 -6.63 5.37 -12 12 -12s12 5.37 12 12c0 16 -12 28 -12 28z" fill="${color}"/>
  </svg>`
  return encodeURIComponent(svg)
}

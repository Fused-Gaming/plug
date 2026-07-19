import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function Map({ locations, selectedLocation, onSelectLocation, userLocation }) {
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [-74.0, 40.7], // NYC center
      zoom: 12,
    })

    locations.forEach((location) => {
      const el = document.createElement('div')
      el.className = 'marker'
      el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSIjRkY2QjZCIi8+PHBhdGggZD0iTTE2IDMyQzEwIDI2IDQgMjAgNCA0YzAgLTYuNjMgNS4zNy0xMiAxMi0xMnMxMiA1LjM3IDEyIDEyYzAgMTYtMTIgMjgtMTIgMjh6IiBmaWxsPSIjRkY2QjZCIi8+PC9zdmc+)'
      el.style.width = '32px'
      el.style.height = '48px'
      el.style.backgroundSize = '100%'
      el.style.cursor = 'pointer'

      el.addEventListener('click', () => {
        onSelectLocation(location)
        map.current.flyTo({
          center: [location.lng, location.lat],
          zoom: 14,
        })
      })

      new maplibregl.Marker({ element: el })
        .setLngLat([location.lng, location.lat])
        .addTo(map.current)
    })

    return () => {
      map.current?.remove()
    }
  }, [locations, onSelectLocation])

  return (
    <div className="map-wrapper">
      <div ref={mapContainer} className="map" />
      {selectedLocation && (
        <div className="location-popup">
          <h3>{selectedLocation.name}</h3>
          <p>{selectedLocation.address}</p>
          <p className="hours">Hours: {selectedLocation.hours}</p>
          <button onClick={() => onSelectLocation(null)}>Close</button>
        </div>
      )}
    </div>
  )
}

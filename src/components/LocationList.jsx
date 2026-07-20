export default function LocationList({
  locations,
  selectedLocation,
  onSelectLocation,
  userLocation,
  getDistance,
}) {
  const handleKeyDown = (e, location) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelectLocation(location)
    }
  }

  return (
    <div className="location-list">
      <h2>Nearby Stations</h2>
      {userLocation && (
        <p className="user-location">📍 Location enabled - sorted by distance</p>
      )}
      {locations.length === 0 ? (
        <p role="status" aria-live="polite">
          No stations found
        </p>
      ) : (
        <ul role="list" aria-label="Charging stations list">
          {locations.map((location) => (
            <li
              key={location.id}
              className={selectedLocation?.id === location.id ? 'selected' : ''}
              onClick={() => onSelectLocation(location)}
              onKeyDown={(e) => handleKeyDown(e, location)}
              tabIndex={0}
              role="button"
              aria-label={`${location.name} - ${location.address}`}
              aria-selected={selectedLocation?.id === location.id}
            >
              <div className="location-item">
                <h4>{location.name}</h4>
                <p className="address">{location.address}</p>
                {location.charger_type && (
                  <p className="charger-type">
                    <span className="badge" style={{ fontSize: '11px' }}>
                      {location.charger_type}
                    </span>
                  </p>
                )}
                {userLocation && (
                  <p className="distance">
                    {getDistance(userLocation, location).toFixed(1)} miles away
                  </p>
                )}
                {location.hours && <p className="hours">{location.hours}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

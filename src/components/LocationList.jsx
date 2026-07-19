export default function LocationList({
  locations,
  selectedLocation,
  onSelectLocation,
  userLocation,
  getDistance,
}) {
  return (
    <div className="location-list">
      <h2>Nearby Stations</h2>
      {userLocation && (
        <p className="user-location">📍 Location enabled - sorted by distance</p>
      )}
      {locations.length === 0 ? (
        <p>No stations found</p>
      ) : (
        <ul>
          {locations.map((location) => (
            <li
              key={location.id}
              className={selectedLocation?.id === location.id ? 'selected' : ''}
              onClick={() => onSelectLocation(location)}
            >
              <div className="location-item">
                <h4>{location.name}</h4>
                <p className="address">{location.address}</p>
                {userLocation && (
                  <p className="distance">
                    {getDistance(userLocation, location).toFixed(1)} miles away
                  </p>
                )}
                <p className="hours">{location.hours}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

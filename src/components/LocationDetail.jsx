/**
 * LocationDetail - Enhanced location card with full details
 * Shows detailed information about a charging station
 */
export default function LocationDetail({ location, userLocation, getDistance, onClose }) {
  if (!location) return null

  const distance = userLocation ? getDistance(userLocation, location) : null
  const chargerColor = {
    'Level 1': '#fbbf24',
    'Level 2': '#60a5fa',
    'DC Fast': '#ef4444',
  }[location.charger_type] || '#6b7280'

  return (
    <div className="location-detail" role="dialog" aria-label={`${location.name} details`}>
      <div className="detail-header">
        <h3>{location.name}</h3>
        <button
          onClick={onClose}
          className="close-button"
          aria-label="Close details"
          title="Close"
        >
          ✕
        </button>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h4>Address</h4>
          <p className="address">{location.address}</p>
        </div>

        <div className="detail-section">
          <h4>Charger Information</h4>
          <div className="charger-info">
            <div className="info-item">
              <span className="label">Type:</span>
              <span
                className="charger-badge"
                style={{ backgroundColor: chargerColor }}
              >
                {location.charger_type}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Connectors:</span>
              <span className="connectors">{location.connectors}</span>
            </div>
            <div className="info-item">
              <span className="label">Power Output:</span>
              <span className="power">{location.power_kw} kW</span>
            </div>
          </div>
        </div>

        {location.hours && (
          <div className="detail-section">
            <h4>Hours</h4>
            <p className="hours">{location.hours}</p>
          </div>
        )}

        {distance !== null && (
          <div className="detail-section">
            <h4>Distance</h4>
            <p className="distance">{distance.toFixed(1)} miles from your location</p>
          </div>
        )}

        {location.source && (
          <div className="detail-section">
            <h4>Source</h4>
            <p className="source">Data from {location.source}</p>
          </div>
        )}

        {location.verified_date && (
          <div className="detail-section">
            <h4>Last Verified</h4>
            <p className="verified-date">{location.verified_date}</p>
          </div>
        )}

        <div className="detail-actions">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(location.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="action-button"
            aria-label={`Open ${location.name} in Google Maps`}
          >
            📍 Directions (Google Maps)
          </a>
        </div>
      </div>
    </div>
  )
}

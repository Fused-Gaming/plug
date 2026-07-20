import { useState, useEffect } from 'react'
import { getChargerTypes, getConnectorTypes, filterByChargerType, filterByConnector } from '../adapters/locationData'

export default function Filters({ locations, onFilterChange }) {
  const [chargerTypes, setChargerTypes] = useState([])
  const [connectorTypes, setConnectorTypes] = useState([])
  const [selectedChargerType, setSelectedChargerType] = useState('')
  const [selectedConnector, setSelectedConnector] = useState('')
  const [maxDistance, setMaxDistance] = useState('')

  useEffect(() => {
    // Load available filter options
    const loadFilterOptions = async () => {
      const types = await getChargerTypes()
      const connectors = await getConnectorTypes()
      setChargerTypes(types)
      setConnectorTypes(connectors)
    }
    loadFilterOptions()
  }, [])

  useEffect(() => {
    // Apply filters
    let filtered = [...locations]

    if (selectedChargerType) {
      filtered = filtered.filter((loc) => loc.charger_type === selectedChargerType)
    }

    if (selectedConnector) {
      filtered = filtered.filter((loc) =>
        loc.connectors
          .split(',')
          .map((c) => c.trim())
          .includes(selectedConnector)
      )
    }

    onFilterChange(filtered)
  }, [selectedChargerType, selectedConnector, locations, onFilterChange])

  return (
    <div className="filters" role="region" aria-label="Charging station filters">
      <h3>Filters</h3>

      <div className="filter-group">
        <label htmlFor="charger-type">Charger Type:</label>
        <select
          id="charger-type"
          value={selectedChargerType}
          onChange={(e) => setSelectedChargerType(e.target.value)}
          aria-label="Filter by charger type"
        >
          <option value="">All Types</option>
          {chargerTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="connector-type">Connector Type:</label>
        <select
          id="connector-type"
          value={selectedConnector}
          onChange={(e) => setSelectedConnector(e.target.value)}
          aria-label="Filter by connector type"
        >
          <option value="">All Connectors</option>
          {connectorTypes.map((connector) => (
            <option key={connector} value={connector}>
              {connector}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => {
          setSelectedChargerType('')
          setSelectedConnector('')
          setMaxDistance('')
        }}
        className="reset-button"
        aria-label="Reset all filters"
      >
        Reset Filters
      </button>
    </div>
  )
}

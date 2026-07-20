export const getChargerTypes = jest.fn().mockResolvedValue(['Level 1', 'Level 2', 'DC Fast']);

export const getConnectorTypes = jest.fn().mockResolvedValue(['Tesla', 'CCS', 'J1772', 'CHAdeMO']);

export const filterByChargerType = jest.fn((type) => {
  if (!type) return [];
  return [];
});

export const filterByConnector = jest.fn((connector) => {
  if (!connector) return [];
  return [];
});

export const getLocations = jest.fn().mockResolvedValue([]);

export const getLocationById = jest.fn().mockResolvedValue(null);

export const searchLocations = jest.fn().mockResolvedValue([]);

export const clearCache = jest.fn();

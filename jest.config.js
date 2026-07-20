export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__tests__/__mocks__/styleMock.js',
    '^maplibre-gl$': '<rootDir>/src/__tests__/__mocks__/maplibreMock.js',
    '^.*/adapters/locationData$': '<rootDir>/src/__tests__/__mocks__/locationData.js',
    '^.*/data/locations$': '<rootDir>/src/__tests__/__mocks__/data/locations.js',
  },
  transform: {
    '^.+\\.(jsx?|es6)$': 'babel-jest',
  },
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/__tests__/**',
  ],
  moduleDirectories: ['node_modules', 'src'],
  transformIgnorePatterns: [
    'node_modules/(?!(maplibre-gl)/)',
  ],
};

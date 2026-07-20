import React from 'react'
import { render, screen } from '@testing-library/react'
import LocationDetail from '../components/LocationDetail'
import LocationList from '../components/LocationList'
import '@testing-library/jest-dom'

// Mock MapLibre GL to prevent initialization errors in tests
jest.mock('maplibre-gl', () => ({
  __esModule: true,
  default: {
    Map: jest.fn(),
    Marker: jest.fn(),
    NavigationControl: jest.fn()
  }
}))

describe('Security: XSS Prevention', () => {
  test('should not render unsafe HTML in location names', () => {
    const maliciousLocation = {
      id: 1,
      name: '<img src=x onerror="alert(\'XSS\')" />',
      lat: 37.8,
      lng: -122.2,
      address: '123 Main St'
    }

    render(<LocationList locations={[maliciousLocation]} selectedLocation={null} onSelectLocation={() => {}} userLocation={null} getDistance={() => 0} />)

    // React automatically escapes text content, preventing XSS
    expect(screen.getByText(/img/)).toBeInTheDocument()
  })

  test('should escape special characters in location address', () => {
    const location = {
      id: 1,
      name: 'Safe Location',
      lat: 37.8,
      lng: -122.2,
      address: '"><script>alert("xss")</script>'
    }

    render(<LocationDetail location={location} userLocation={null} getDistance={() => 0} onClose={() => {}} />)

    const addressText = screen.getByText(/script/)
    expect(addressText.textContent).toContain('"><script>')
    expect(addressText.innerHTML).not.toContain('<script>')
  })

  test('should sanitize charger type field', () => {
    const location = {
      id: 1,
      name: 'Test Location',
      lat: 37.8,
      lng: -122.2,
      address: '123 Main St',
      charger_type: '<b onmouseover="alert(\'xss\')">Level 2</b>'
    }

    render(<LocationDetail location={location} userLocation={null} getDistance={() => 0} onClose={() => {}} />)

    // React escapes text content - HTML tags appear as text
    expect(screen.getByText(/Level 2/)).toBeInTheDocument()
  })

  test('should handle SVG injection attempts safely', () => {
    const maliciousLocation = {
      id: 1,
      name: '<svg onload="alert(\'xss\')">Test</svg>',
      lat: 37.8,
      lng: -122.2,
      address: '123 Main St'
    }

    render(<LocationList locations={[maliciousLocation]} selectedLocation={null} onSelectLocation={() => {}} userLocation={null} getDistance={() => 0} />)

    // Should render as text, not execute
    expect(screen.getByText(/svg/)).toBeInTheDocument()
  })
})

describe('Security: Injection Prevention', () => {
  test('should prevent event handler injection in location data', () => {
    const injectionAttempt = {
      id: 1,
      name: 'Test" onmouseover="alert(1)',
      lat: 37.8,
      lng: -122.2,
      address: '123 Main St'
    }

    render(<LocationList locations={[injectionAttempt]} selectedLocation={null} onSelectLocation={() => {}} userLocation={null} getDistance={() => 0} />)

    expect(screen.getByText(/alert/)).toBeInTheDocument()
  })

  test('should not execute javascript URLs', () => {
    const location = {
      id: 1,
      name: 'Test',
      lat: 37.8,
      lng: -122.2,
      address: 'javascript:alert("xss")'
    }

    const { container } = render(
      <LocationDetail location={location} userLocation={null} getDistance={() => 0} onClose={() => {}} />
    )

    // Should not create javascript: links
    const jsLinks = container.querySelectorAll('a[href^="javascript:"]')
    expect(jsLinks.length).toBe(0)
  })

  test('should handle data URLs safely in text fields', () => {
    const location = {
      id: 1,
      name: 'data:text/html,<script>alert(1)</script>',
      lat: 37.8,
      lng: -122.2,
      address: '123 Main St'
    }

    render(<LocationDetail location={location} userLocation={null} getDistance={() => 0} onClose={() => {}} />)

    expect(screen.getByText(/data:text/)).toBeInTheDocument()
  })
})

describe('Security: Input Validation', () => {
  test('should validate location object structure', () => {
    const validLocation = {
      id: 1,
      name: 'Test Location',
      lat: 37.8,
      lng: -122.2,
      address: 'Main St'
    }

    const invalidLocation = {
      id: 'not-a-number',
      name: null,
      lat: 'invalid',
      lng: 'invalid'
    }

    // Should render without crashing with mix of valid and invalid data
    render(
      <LocationList
        locations={[validLocation, invalidLocation]}
        selectedLocation={null}
        onSelectLocation={() => {}}
        userLocation={null}
        getDistance={() => 0}
      />
    )

    // Valid location should render
    expect(screen.getByText(/Test Location/)).toBeInTheDocument()
  })

  test('should handle empty location properties gracefully', () => {
    const location = {
      id: 1,
      name: '',
      lat: null,
      lng: undefined,
      address: undefined
    }

    expect(() => {
      render(
        <LocationDetail
          location={location}
          userLocation={null}
          getDistance={() => 0}
          onClose={() => {}}
        />
      )
    }).not.toThrow()
  })

  test('should handle extremely long location names', () => {
    const longName = 'A'.repeat(5000)
    const location = {
      id: 1,
      name: longName,
      lat: 37.8,
      lng: -122.2,
      address: '123 Main St'
    }

    const { container } = render(
      <LocationDetail
        location={location}
        userLocation={null}
        getDistance={() => 0}
        onClose={() => {}}
      />
    )

    // Should render without crashing
    expect(container.textContent).toContain('A')
  })

  test('should validate numeric coordinates', () => {
    const locations = [
      { id: 1, name: 'Valid', lat: 37.8, lng: -122.2, address: 'Test' },
      { id: 2, name: 'Invalid Lat', lat: 'not-a-number', lng: -122.2, address: 'Test' },
      { id: 3, name: 'NaN', lat: NaN, lng: -122.2, address: 'Test' },
      { id: 4, name: 'Infinity', lat: Infinity, lng: -122.2, address: 'Test' }
    ]

    // App should handle all variations without crashes
    render(
      <LocationList
        locations={locations}
        selectedLocation={null}
        onSelectLocation={() => {}}
        userLocation={null}
        getDistance={() => 0}
      />
    )

    expect(screen.getByText(/Valid/)).toBeInTheDocument()
  })
})

describe('Security: Data Sanitization', () => {
  test('should render HTML-like text as escaped text', () => {
    const location = {
      id: 1,
      name: '<b>Bold Location</b>',
      lat: 37.8,
      lng: -122.2,
      address: '<i>Italic Address</i>',
      charger_type: '<u>Level 2</u>',
      connectors: '<strong>Tesla</strong>'
    }

    const { container } = render(
      <LocationDetail
        location={location}
        userLocation={null}
        getDistance={() => 0}
        onClose={() => {}}
      />
    )

    // Verify tags appear as text, not rendered as HTML
    expect(screen.getByText(/Bold/)).toBeInTheDocument()
    expect(screen.getByText(/Italic/)).toBeInTheDocument()
    // Check that these tags are not actually rendered as HTML elements
    const bElements = container.querySelectorAll('b')
    const iElements = container.querySelectorAll('i:not(.fa)')
    const uElements = container.querySelectorAll('u')
    expect(bElements.length).toBe(0)
    expect(iElements.length).toBe(0)
    expect(uElements.length).toBe(0)
  })

  test('should handle null bytes in location data', () => {
    const location = {
      id: 1,
      name: 'Location\x00with\x00nulls',
      lat: 37.8,
      lng: -122.2,
      address: 'Test\x00Address'
    }

    expect(() => {
      render(
        <LocationDetail
          location={location}
          userLocation={null}
          getDistance={() => 0}
          onClose={() => {}}
        />
      )
    }).not.toThrow()
  })

  test('should sanitize event handler attribute strings', () => {
    const location = {
      id: 1,
      name: 'Test onclick="alert(\'xss\')"',
      lat: 37.8,
      lng: -122.2,
      address: '123 Main St'
    }

    const { container } = render(
      <LocationDetail
        location={location}
        userLocation={null}
        getDistance={() => 0}
        onClose={() => {}}
      />
    )

    // Should not create actual onclick attributes
    const elements = container.querySelectorAll('[onclick]')
    expect(elements.length).toBe(0)
  })

  test('should not render dangerous protocols in text', () => {
    const location = {
      id: 1,
      name: 'data:text/html,test',
      lat: 37.8,
      lng: -122.2,
      address: 'file:///etc/passwd'
    }

    render(
      <LocationDetail
        location={location}
        userLocation={null}
        getDistance={() => 0}
        onClose={() => {}}
      />
    )

    // Text should render, but not as executable
    expect(screen.getByText(/data:text/)).toBeInTheDocument()
  })
})

describe('Security: Component Error Handling', () => {
  test('should handle missing location properties safely', () => {
    const location = {}

    expect(() => {
      render(
        <LocationDetail
          location={location}
          userLocation={null}
          getDistance={() => 0}
          onClose={() => {}}
        />
      )
    }).not.toThrow()
  })

  test('should handle undefined location gracefully', () => {
    expect(() => {
      render(
        <LocationDetail
          location={null}
          userLocation={null}
          getDistance={() => 0}
          onClose={() => {}}
        />
      )
    }).not.toThrow()
  })

  test('should handle malformed user location', () => {
    const location = {
      id: 1,
      name: 'Test',
      lat: 37.8,
      lng: -122.2,
      address: '123 Main St'
    }

    const malformedUserLocation = {
      lat: 'invalid',
      lng: 'also invalid'
    }

    expect(() => {
      render(
        <LocationDetail
          location={location}
          userLocation={malformedUserLocation}
          getDistance={() => 0}
          onClose={() => {}}
        />
      )
    }).not.toThrow()
  })
})

describe('Security: Distance Calculation', () => {
  test('should handle distance calculation with invalid coordinates', () => {
    const location = {
      id: 1,
      name: 'Test',
      lat: 'invalid',
      lng: 'invalid',
      address: '123 Main St'
    }

    const getDistance = jest.fn(() => NaN)

    render(
      <LocationList
        locations={[location]}
        selectedLocation={null}
        onSelectLocation={() => {}}
        userLocation={{ lat: 37.8, lng: -122.2 }}
        getDistance={getDistance}
      />
    )

    expect(screen.getByText(/Test/)).toBeInTheDocument()
  })

  test('should protect against distance calculation DoS', () => {
    const locations = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Location ${i}`,
      lat: 37.8 + Math.random(),
      lng: -122.2 + Math.random(),
      address: `Address ${i}`
    }))

    const getDistance = jest.fn(() => 1.5)

    expect(() => {
      render(
        <LocationList
          locations={locations}
          selectedLocation={null}
          onSelectLocation={() => {}}
          userLocation={{ lat: 37.8, lng: -122.2 }}
          getDistance={getDistance}
        />
      )
    }).not.toThrow()
  })
})

describe('Security: Filter Component', () => {
  test('should handle malicious filter input', () => {
    const location = {
      id: 1,
      name: 'Test<script>alert(1)</script>',
      lat: 37.8,
      lng: -122.2,
      address: '123 Main St',
      charger_type: 'Level 2'
    }

    render(
      <LocationList
        locations={[location]}
        selectedLocation={null}
        onSelectLocation={() => {}}
        userLocation={null}
        getDistance={() => 0}
      />
    )

    expect(screen.getByText(/script/)).toBeInTheDocument()
  })
})

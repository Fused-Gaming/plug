import {
  CSP_PRODUCTION,
  CSP_DEVELOPMENT,
  getCspPolicy,
  formatCspHeader,
  getCspHeaderString,
} from '../config/csp'

describe('Content Security Policy Configuration', () => {
  test('should have production CSP with strict directives', () => {
    expect(CSP_PRODUCTION['default-src']).toEqual(["'self'"])
    expect(CSP_PRODUCTION['script-src']).toEqual(["'self'"])
    expect(CSP_PRODUCTION['form-action']).toEqual(["'none'"])
    expect(CSP_PRODUCTION['frame-ancestors']).toEqual(["'none'"])
  })

  test('should have development CSP with relaxed directives for debugging', () => {
    expect(CSP_DEVELOPMENT['script-src']).toContain("'unsafe-eval'")
    expect(CSP_DEVELOPMENT['style-src']).toContain("'unsafe-inline'")
  })

  test('should return production policy for production environment', () => {
    const policy = getCspPolicy('production')
    expect(policy).toEqual(CSP_PRODUCTION)
    expect(policy['script-src']).not.toContain("'unsafe-eval'")
  })

  test('should return development policy for development environment', () => {
    const policy = getCspPolicy('development')
    expect(policy).toEqual(CSP_DEVELOPMENT)
    expect(policy['script-src']).toContain("'unsafe-eval'")
  })

  test('should format CSP policy as header string', () => {
    const headerString = formatCspHeader({
      'default-src': ["'self'"],
      'script-src': ["'self'", "https:"],
    })

    expect(headerString).toContain("default-src 'self'")
    expect(headerString).toContain("script-src 'self' https:")
    expect(headerString).toContain(';')
  })

  test('should handle directives with no sources', () => {
    const headerString = formatCspHeader({
      'upgrade-insecure-requests': [],
      'block-all-mixed-content': [],
    })

    expect(headerString).toContain('upgrade-insecure-requests')
    expect(headerString).toContain('block-all-mixed-content')
  })

  test('should generate valid CSP header string', () => {
    const headerString = getCspHeaderString('production')

    expect(headerString).toContain('default-src')
    expect(headerString).toContain('script-src')
    expect(headerString).toContain('style-src')
    expect(headerString).not.toContain('unsafe-eval')
  })

  test('should allow OpenStreetMap tiles in CSP', () => {
    const policy = getCspPolicy('production')
    expect(policy['connect-src']).toContain('https://tile.openstreetmap.org')
  })

  test('should allow MapLibre GL resources in CSP', () => {
    const policy = getCspPolicy('production')
    expect(policy['connect-src']).toContain('https://demotiles.maplibre.org')
  })

  test('should restrict script sources to self-hosted only', () => {
    const policy = CSP_PRODUCTION
    expect(policy['script-src']).toEqual(["'self'"])
    expect(policy['script-src']).not.toContain('unsafe-inline')
    expect(policy['script-src']).not.toContain('unsafe-eval')
  })

  test('should prevent frame embedding with frame-ancestors', () => {
    const policy = CSP_PRODUCTION
    expect(policy['frame-ancestors']).toEqual(["'none'"])
  })

  test('should disable form submissions with form-action', () => {
    const policy = CSP_PRODUCTION
    expect(policy['form-action']).toEqual(["'none'"])
  })

  test('should restrict base-uri to self', () => {
    const policy = CSP_PRODUCTION
    expect(policy['base-uri']).toEqual(["'self'"])
  })

  test('should allow data URLs for images', () => {
    const policy = CSP_PRODUCTION
    expect(policy['img-src']).toContain('data:')
  })

  test('should allow HTTPS images only', () => {
    const policy = CSP_PRODUCTION
    expect(policy['img-src']).toContain('https:')
    expect(policy['img-src']).not.toContain('http:')
  })
})

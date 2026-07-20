/**
 * Content Security Policy configuration
 * Defines CSP directives for different environments
 */

// Production CSP policy - strictest security
export const CSP_PRODUCTION = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'https:', 'data:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'", 'https://tile.openstreetmap.org', 'https://demotiles.maplibre.org'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'none'"],
  'upgrade-insecure-requests': [],
  'block-all-mixed-content': [],
}

// Development CSP policy - relaxed for debugging
export const CSP_DEVELOPMENT = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'https:', 'data:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'", 'https:', 'http:'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'none'"],
}

/**
 * Get CSP policy for environment
 */
export function getCspPolicy(environment = process.env.NODE_ENV) {
  return environment === 'production' ? CSP_PRODUCTION : CSP_DEVELOPMENT
}

/**
 * Format CSP directives as header string
 */
export function formatCspHeader(cspPolicy) {
  return Object.entries(cspPolicy)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive
      }
      return `${directive} ${sources.join(' ')}`
    })
    .join('; ')
}

/**
 * Get CSP header string for current environment
 */
export function getCspHeaderString(environment = process.env.NODE_ENV) {
  const policy = getCspPolicy(environment)
  return formatCspHeader(policy)
}

/**
 * CSP violation reporter
 * Reports CSP violations for monitoring
 */
export function reportCspViolation(violationEvent) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('CSP Violation:', {
      'blocked-uri': violationEvent['blocked-uri'],
      'document-uri': violationEvent['document-uri'],
      'original-policy': violationEvent['original-policy'],
      'violated-directive': violationEvent['violated-directive'],
    })
  }
  // In production, could send to error tracking service
}

/**
 * Set up CSP violation listener
 */
export function setupCspViolationListener() {
  document.addEventListener('securitypolicyviolation', (e) => {
    reportCspViolation(e)
  })
}

export default {
  CSP_PRODUCTION,
  CSP_DEVELOPMENT,
  getCspPolicy,
  formatCspHeader,
  getCspHeaderString,
  reportCspViolation,
  setupCspViolationListener,
}

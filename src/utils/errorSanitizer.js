/**
 * Error sanitization utility to prevent logging of sensitive data
 * Sanitizes error messages and stack traces to prevent information disclosure
 */

const SENSITIVE_PATTERNS = [
  /api[_-]?key/gi,
  /token/gi,
  /password/gi,
  /secret/gi,
  /private[_-]?key/gi,
  /auth[_-]?token/gi,
  /bearer\s+\w+/gi,
  /\d{3}-\d{2}-\d{4}/g, // SSN pattern
  /\b\d{16}\b/g, // Credit card pattern
  /https?:\/\/[^\s]+/g, // URLs
  /\/[^\s]*/g, // File paths
]

/**
 * Check if message contains sensitive data
 */
function containsSensitiveData(message) {
  const messageStr = String(message)
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(messageStr))
}

/**
 * Sanitize sensitive data from message
 */
function sanitizeMessage(message) {
  let sanitized = String(message)

  SENSITIVE_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED]')
  })

  return sanitized
}

/**
 * Extract safe information from error object
 */
function getSafeErrorInfo(error) {
  if (!error) return 'Unknown error'

  const errorObj = error instanceof Error ? error : new Error(String(error))
  const safeInfo = {
    name: errorObj.name || 'Error',
    message: sanitizeMessage(errorObj.message || 'No error message'),
  }

  return safeInfo
}

/**
 * Format error for logging (removes sensitive data)
 */
function formatError(error, context = '') {
  const safeInfo = getSafeErrorInfo(error)
  const contextStr = context ? ` [${context}]` : ''
  return `${safeInfo.name}: ${safeInfo.message}${contextStr}`
}

/**
 * Safe console.log - only logs non-sensitive data
 */
export function logInfo(message, data = null) {
  if (process.env.NODE_ENV === 'development') {
    const logMessage = sanitizeMessage(message)
    if (data) {
      console.log(logMessage, data)
    } else {
      console.log(logMessage)
    }
  }
}

/**
 * Safe console.warn - sanitizes message
 */
export function logWarn(message, context = '') {
  const sanitized = sanitizeMessage(message)
  const contextStr = context ? ` [${context}]` : ''
  console.warn(`Warning: ${sanitized}${contextStr}`)
}

/**
 * Safe console.error - sanitizes message and removes stack traces
 */
export function logError(error, context = '') {
  const formatted = formatError(error, context)
  console.error(formatted)
}

/**
 * Check if error message contains sensitive data (for testing)
 */
export function hasSensitiveData(message) {
  return containsSensitiveData(message)
}

/**
 * Sanitize user-facing error message
 */
export function getUserFriendlyError(error) {
  if (!error) return 'An error occurred. Please try again.'

  const safeInfo = getSafeErrorInfo(error)

  // Map common errors to user-friendly messages
  const errorMap = {
    'TypeError': 'A data type error occurred',
    'ReferenceError': 'An internal error occurred',
    'RangeError': 'A value is out of range',
    'NetworkError': 'Network connection failed',
    'NotFoundError': 'Resource not found',
  }

  const userMessage = errorMap[safeInfo.name] || 'An error occurred'
  return userMessage + '. Please refresh the page and try again.'
}

/**
 * Safely log geolocation errors without exposing location data
 */
export function logGeolocationError(error, context = '') {
  const genericMessage = 'Geolocation access denied or unavailable'
  const contextStr = context ? ` [${context}]` : ''
  console.warn(`${genericMessage}${contextStr}`)
}

/**
 * Safely log API/fetch errors without exposing URLs or response data
 */
export function logFetchError(error, context = 'Fetch error') {
  const sanitized = sanitizeMessage(error?.message || String(error))
  const safeContext = sanitizeMessage(context)
  console.error(`${safeContext}: ${sanitized}`)
}

/**
 * Sanitize error stack trace for production
 */
export function getSafeStackTrace(error) {
  if (!error || !error.stack) return ''

  if (process.env.NODE_ENV === 'production') {
    return '[Stack trace hidden in production]'
  }

  return error.stack
}

export default {
  logInfo,
  logWarn,
  logError,
  logGeolocationError,
  logFetchError,
  getUserFriendlyError,
  getSafeStackTrace,
  hasSensitiveData,
  sanitizeMessage,
  getSafeErrorInfo,
}

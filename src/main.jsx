import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/main.css'
import { logInfo, logError, getUserFriendlyError } from './utils/errorSanitizer'
import { setupCspViolationListener } from './config/csp'

// Set up CSP violation monitoring
setupCspViolationListener()

// Error logging for debugging
logInfo('App starting...')
const rootElement = document.getElementById('root')
logInfo('Root element found:', rootElement ? 'yes' : 'no')

window.addEventListener('error', (event) => {
  logError(event.error, 'Global error handler')
})

window.addEventListener('unhandledrejection', (event) => {
  logError(event.reason, 'Unhandled rejection')
})

try {
  if (!rootElement) {
    throw new Error('Root element not found!')
  }

  logInfo('Creating React root...')
  const root = ReactDOM.createRoot(rootElement)

  logInfo('Rendering App...')
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  logInfo('App rendered successfully')
} catch (error) {
  logError(error, 'App initialization')
  const userMessage = getUserFriendlyError(error)
  document.body.innerHTML = `<pre style="color: red; padding: 20px;">Error loading app: ${userMessage}</pre>`
}

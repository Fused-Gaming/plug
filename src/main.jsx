import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/main.css'

// Error logging for debugging
console.log('App starting...')
console.log('Root element:', document.getElementById('root'))

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason)
})

try {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found!')
  }

  console.log('Creating React root...')
  const root = ReactDOM.createRoot(rootElement)

  console.log('Rendering App...')
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  console.log('App rendered successfully')
} catch (error) {
  console.error('Failed to render app:', error)
  document.body.innerHTML = `<pre style="color: red; padding: 20px;">Error loading app: ${error.message}\n\n${error.stack}</pre>`
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/brandCta.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found. Check index.html.')

try {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
} catch (err) {
  console.error('Failed to mount app:', err)
  rootEl.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;background:#0f0f12;color:#fff;font-family:system-ui;text-align:center">
      <h1 style="font-size:1.25rem;margin-bottom:1rem">Something went wrong</h1>
      <p style="color:#94a3b8;margin-bottom:1rem">${err?.message || 'Failed to load the app.'}</p>
      <button onclick="window.location.reload()" style="padding:0.5rem 1rem;background:#C41230;color:#fff;border:none;border-radius:6px;cursor:pointer">Reload page</button>
    </div>
  `
}

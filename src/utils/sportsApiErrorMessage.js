/** User-facing copy for Sports & Events API failures. */
export function formatSportsApiError(err) {
  const message = err?.message || ''
  const code = err?.code || ''

  if (
    code === 'xs2event_api_unreachable' ||
    message.includes('dev:api') ||
    message.includes('API is not reachable')
  ) {
    if (import.meta.env.DEV) {
      return 'The sports API server is not running. In a second terminal run npm run dev:api, keep it open, then refresh this page. (Or open http://localhost:3000 — dev:api serves the site and API together.)'
    }
    return 'We could not reach the sports tickets service. Please try again shortly.'
  }

  if (code === 'xs2event_not_configured') {
    return 'Sports tickets are not configured on the server yet (missing XS2EVENT_API_URL / XS2EVENT_API_KEY).'
  }

  if (message) return message
  return 'Please try again in a moment.'
}

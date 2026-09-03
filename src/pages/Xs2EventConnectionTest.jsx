import { useEffect, useState } from 'react'
import { getConnectionTest, getEvents } from '../services/xs2event'

/**
 * Temporary DEV-only page to verify XS2Event TEST API connectivity.
 * Not part of the production sports-tickets UX.
 */
function Xs2EventConnectionTest() {
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [sports, setSports] = useState([])
  const [eventsSample, setEventsSample] = useState([])
  const [eventsError, setEventsError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const result = await getConnectionTest()
        if (cancelled) return

        const list = Array.isArray(result?.data?.sports) ? result.data.sports : []
        setSports(list)
        setMessage(result?.message || 'Connected')
        setStatus(result?.success ? 'connected' : 'error')
      } catch (err) {
        if (cancelled) return
        setStatus('error')
        setMessage(err?.message || 'Unable to communicate with XS2Event')
        setSports([])
      }

      try {
        const eventsResult = await getEvents({ page_size: 3, sport_type: 'soccer' })
        if (cancelled) return
        const list = Array.isArray(eventsResult?.events) ? eventsResult.events : []
        setEventsSample(list)
        setEventsError('')
      } catch (err) {
        if (cancelled) return
        setEventsSample([])
        setEventsError(err?.message || 'Events request failed')
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  const sportNames = sports
    .map((sport) => sport?.sport_id || sport?.name || sport?.sport_type)
    .filter(Boolean)
    .slice(0, 12)

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', padding: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>XS2Event Connection</h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        Temporary development check — Honeywell /api → XS2Event TEST API.
      </p>

      <p>
        <strong>Status:</strong>{' '}
        {status === 'loading' && 'Checking…'}
        {status === 'connected' && (
          <span style={{ color: '#15803d' }}>Connected</span>
        )}
        {status === 'error' && (
          <span style={{ color: '#b91c1c' }}>Error</span>
        )}
      </p>

      {message ? (
        <p style={{ marginTop: '0.5rem' }}>
          <strong>Message:</strong> {message}
        </p>
      ) : null}

      <p style={{ marginTop: '1rem' }}>
        <strong>Sports returned:</strong> {sports.length}
      </p>

      {sportNames.length > 0 ? (
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
          {sportNames.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      ) : null}

      <hr style={{ margin: '1.5rem 0', border: 0, borderTop: '1px solid #e2e8f0' }} />

      <h2 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Events sample</h2>
      {eventsError ? (
        <p style={{ color: '#b91c1c' }}>{eventsError}</p>
      ) : eventsSample.length === 0 ? (
        <p style={{ color: '#64748b' }}>No events in sample (or still loading).</p>
      ) : (
        <ul style={{ paddingLeft: '1.25rem' }}>
          {eventsSample.map((event) => (
            <li key={event.event_id || event.event_name}>
              {event.event_name || event.event_id}
              {event.date_start ? ` — ${event.date_start}` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Xs2EventConnectionTest

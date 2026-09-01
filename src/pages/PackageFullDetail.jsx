import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Clock, Headphones, Mail, MapPin, Phone, Plane, PlaneLanding, PlaneTakeoff } from 'lucide-react'
import { getPackageById } from '../data/packages'
import { getMergedPackageById, loadMergedPackages, subscribePackagesCatalogRefresh } from '../lib/packagesCatalog'
import { localizePackage } from '../utils/packageTranslations'
import { getPackageLeadPrice } from '../utils/packageLeadPrice'
import {
  getDepartureDates,
  getHotelStayDate,
  getPackageDepartureDates,
  isItineraryStyleHotels,
  sortDepartureDateStrings,
} from '../utils/packageDepartureDates'
import HoneypotField from '../components/HoneypotField'
import { FORM_TYPES } from '../lib/formConstants'
import { FORM_ERROR_MESSAGE, FORM_SUCCESS_MESSAGE, submitWebsiteForm } from '../lib/submitWebsiteForm'
import SEO from '../components/SEO'
import FavoriteToggleButton from '../components/FavoriteToggleButton'
import PackageBrochureCard from '../components/PackageBrochureCard'
import '../components/FavoritesTrigger.css'
import './PackageFullDetail.css'

const parseAirportEndpoint = (segment) => {
  const trimmed = String(segment || '').trim()
  if (!trimmed) return {}

  const withTime = trimmed.match(/^(\d{1,2}:\d{2})\s+(.+)$/)
  const body = withTime ? withTime[2] : trimmed
  const time = withTime ? withTime[1] : null

  const codeComma = body.match(/^(.+?)\s*\(([^)]+)\)\s*,\s*(.+)$/)
  if (codeComma) {
    return {
      time,
      airport: codeComma[1].trim(),
      code: codeComma[2].trim(),
      location: codeComma[3].trim(),
    }
  }

  const codeOnly = body.match(/^(.+?)\s*\(([^)]+)\)\s*$/)
  if (codeOnly) {
    return {
      time,
      airport: codeOnly[1].trim(),
      code: codeOnly[2].trim(),
    }
  }

  return { time, airport: body }
}

const parseFlightRoute = (route) => {
  if (!route) return null
  const text = String(route).trim()

  if (text.includes('\n')) {
    const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)
    const toIndex = lines.findIndex((line) => /^to$/i.test(line))
    if (toIndex > 0) {
      const origin = parseAirportEndpoint(lines[0])
      if (lines[1] && toIndex > 1) origin.location = lines[1]

      const destination = parseAirportEndpoint(lines[toIndex + 1] || '')
      if (lines[toIndex + 2]) destination.location = lines[toIndex + 2]

      return { origin, destination }
    }
  }

  if (text.includes('→')) {
    const [left, right] = text.split('→').map((part) => part.trim())
    return {
      origin: parseAirportEndpoint(left),
      destination: parseAirportEndpoint(right),
    }
  }

  return { raw: text }
}

const FlightRouteEndpoint = ({ endpoint, type }) => {
  if (!endpoint?.airport) return null
  const Icon = type === 'destination' ? PlaneLanding : PlaneTakeoff

  return (
    <div className={`flight-route-endpoint flight-route-endpoint--${type}`}>
      <span className="flight-route-endpoint__icon" aria-hidden="true">
        <Icon size={17} strokeWidth={2.1} />
      </span>
      <div className="flight-route-endpoint__body">
        {endpoint.time ? (
          <span className="flight-route-endpoint__time">{endpoint.time}</span>
        ) : null}
        <span className="flight-route-endpoint__airport">{endpoint.airport}</span>
        <div className="flight-route-endpoint__meta">
          {endpoint.code ? (
            <span className="flight-route-endpoint__code">{endpoint.code}</span>
          ) : null}
          {endpoint.location ? (
            <span className="flight-route-endpoint__location">{endpoint.location}</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

const FlightRouteDisplay = ({ route, isReturn }) => {
  const parsed = parseFlightRoute(route)

  if (!parsed || parsed.raw || !parsed.origin?.airport || !parsed.destination?.airport) {
    return <p className="flight-route-fallback">{parsed?.raw || route}</p>
  }

  return (
    <div className={`flight-route-layout${isReturn ? ' flight-route-layout--return' : ''}`}>
      <FlightRouteEndpoint endpoint={parsed.origin} type="origin" />
      <div className="flight-route-connector" aria-hidden="true">
        <span className="flight-route-connector__line" />
        <span className="flight-route-connector__badge">
          <Plane size={14} strokeWidth={2.25} />
        </span>
        <ArrowRight size={15} strokeWidth={2.25} className="flight-route-connector__arrow" />
        <span className="flight-route-connector__line" />
      </div>
      <FlightRouteEndpoint endpoint={parsed.destination} type="destination" />
    </div>
  )
}

const PackageBackChevron = () => (
  <span className="package-back-nav__icon" aria-hidden="true">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 18L9 12l6-6"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
)

// Helper function to format program text with proper paragraphs
const formatProgramText = (text) => {
  if (!text) return []
  // Split by double newlines to create paragraphs
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim())
  return paragraphs.map(p => p.trim())
}

// Helper function to extract title from text
const extractTitle = (text) => {
  if (!text) return null
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim())
  const firstPara = paragraphs[0]?.trim()
  // Check if first paragraph looks like a title (short, contains dashes or colons)
  if (firstPara && firstPara.length < 120 && (firstPara.includes('–') || firstPara.includes('-') || firstPara.includes(':'))) {
    return firstPara
  }
  return null
}

/** Split day copy into prose + bullet segments (• from CMS). */
const ITINERARY_BULLET_SPLIT = /\s*•\s*/

const parseItineraryDescription = (raw) => {
  if (!raw || typeof raw !== 'string') return [{ type: 'prose', text: '' }]
  const trimmed = raw.trim()
  if (!trimmed.includes('•')) {
    return [{ type: 'prose', text: trimmed }]
  }

  const blocks = trimmed.split(/\n\n+/).map((b) => b.trim()).filter(Boolean)
  const segments = []

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
    const proseBuffer = []
    const listBuffer = []

    const flushProse = () => {
      if (proseBuffer.length) {
        segments.push({ type: 'prose', text: proseBuffer.join('\n') })
        proseBuffer.length = 0
      }
    }
    const flushList = () => {
      if (listBuffer.length) {
        segments.push({ type: 'list', items: [...listBuffer] })
        listBuffer.length = 0
      }
    }

    for (const line of lines) {
      const bulletOnly = /^•\s*(.+)$/.exec(line)
      if (bulletOnly) {
        flushProse()
        listBuffer.push(bulletOnly[1])
        continue
      }
      if (line.includes('•')) {
        const parts = line.split(ITINERARY_BULLET_SPLIT).map((p) => p.trim()).filter(Boolean)
        if (parts.length <= 1) {
          proseBuffer.push(line)
          continue
        }
        flushList()
        proseBuffer.push(parts[0])
        flushProse()
        listBuffer.push(...parts.slice(1))
        continue
      }
      flushList()
      proseBuffer.push(line)
    }
    flushProse()
    flushList()
  }

  return segments.length ? segments : [{ type: 'prose', text: trimmed }]
}

const ItineraryDescription = ({ text }) => {
  const segments = parseItineraryDescription(text)
  return (
    <div className="itinerary-description">
      {segments.map((seg, idx) =>
        seg.type === 'prose' ? (
          <p
            key={`p-${idx}`}
            className="itinerary-description__prose"
            style={seg.text.includes('\n') ? { whiteSpace: 'pre-line' } : undefined}
          >
            {seg.text}
          </p>
        ) : (
          <ul key={`ul-${idx}`} className="itinerary-bullet-list">
            {seg.items.map((item, j) => (
              <li key={j} className="itinerary-bullet-item">
                <span className="itinerary-bullet-marker" aria-hidden="true" />
                <span className="itinerary-bullet-text">{item}</span>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  )
}

/** Single line for Price tab hero: where the trip goes (not full program copy). */
const getPriceTabDestinationLine = (details, pkg, translatedTitle) => {
  const df = details.destinationFull?.trim()
  if (df) return df
  const titleFromIntro = extractTitle(details.program?.introduction)
  if (titleFromIntro) return titleFromIntro.replace(/\s+/g, ' ')
  const ld = pkg.longDescription?.trim()
  if (ld) {
    const first = ld.split(/\n+/)[0].trim()
    if (first.length <= 200) return first
    return `${first.slice(0, 197)}…`
  }
  return translatedTitle?.trim() || ''
}

/** Short lines in program copy that act like subheads (e.g. Rhodes “Αξίζει να δείτε…”) — not full body paragraphs */
const isProgramInlineHeading = (raw) => {
  const t = raw.trim()
  if (!t || t.startsWith('•') || t.startsWith('–') || t.startsWith('-')) return false
  if (t.length > 125) return false
  const words = t.split(/\s+/).filter(Boolean)
  if (words.length < 2 || words.length > 14) return false
  const colonIdx = t.indexOf(':')
  if (colonIdx !== -1 && t.slice(colonIdx + 1).trim().length > 28) return false
  if (/\.\s+[Α-ΩA-ZΆΈΉΊΌΎΏ]/.test(t)) return false
  const letters = t.replace(/[^a-zA-ZΑ-Ωα-ωάέήίόύώΆΈΉΊΌΎΏ]/g, '')
  if (letters.length >= 8) {
    const upper = t.replace(/[^A-ZΑ-ΩΆΈΉΊΌΎΏ]/g, '')
    if (upper.length / letters.length >= 0.72) return true
  }
  if (words.length <= 12 && !/\.\s/.test(t)) return true
  return false
}

const programParagraphClass = (text) =>
  isProgramInlineHeading(text) ? 'section-text program-text-subheading' : 'section-text'

const isProgramIntroTitle = (raw) => {
  const t = raw.trim()
  if (!t || t.length > 90 || t.includes('€') || t.includes('|')) return false
  if (/^(Ημερομηνίες|Διάρκεια|Ομάδα|Δίκλινο|Μονόκλινο|Τιμή)/i.test(t)) return false
  return /πρόγραμμα/i.test(t) || (t.length < 80 && (t.includes('–') || t.includes('-')))
}

const isProgramIntroMetaLine = (raw) =>
  /^(Ημερομηνίες|Διάρκεια|Ομάδα|Δίκλινο|Μονόκλινο)/i.test(raw.trim())

const programIntroParagraphClass = (text) => {
  const t = text.trim()
  if (t === 'Τιμές' || isProgramInlineHeading(t)) return 'program-text-subheading'
  if (isProgramIntroMetaLine(t)) return 'program-intro-meta'
  return 'section-text'
}

const formatProgramNoteAmount = (amount) =>
  `€${Number(amount).toLocaleString('de-DE')}`

/** Premium program notes: group size + twin/single rates when hotel prices are hidden. */
const getProgramNoteHighlights = (details, tr) => {
  if (!details?.hideHotelPrices) return null
  const prices = details.hotels?.[0]?.prices
  if (!prices) return null

  const highlights = []
  if (details.groupSize) {
    highlights.push({ label: tr('package.groupSize'), value: details.groupSize })
  }
  if (prices.double != null) {
    highlights.push({ label: tr('package.double'), value: `${formatProgramNoteAmount(prices.double)} / ${tr('package.perPerson')}` })
  }
  if (prices.single != null) {
    highlights.push({ label: tr('package.single'), value: `${formatProgramNoteAmount(prices.single)} / ${tr('package.perPerson')}` })
  }
  return highlights.length ? highlights : null
}

const isPremiumProgramNote = (details, highlights) =>
  Boolean(highlights?.length || /premium/i.test(details?.groupSize || ''))

// Map airline names (as in package details.airline) to logo paths
const AIRLINE_LOGO = {
  'Cyprus Airways': '/images/airlines-logo/cyprus-airways-logo.webp',
  'Sky Express': '/images/airlines-logo/sky-express-logo.webp',
  'Aegean Airlines': '/images/airlines-logo/aegean-airlines-logo.webp',
  'Anima Wings': '/images/airlines-logo/animal-wings-logo.webp',
  'Austrian Airlines': '/images/airlines-logo/austrian-airlines-logo.webp',
  'British Airways': '/images/airlines-logo/british-airways-logo.webp',
  'Egypt Air': '/images/airlines-logo/egypt-airlines-logo.webp',
  'Emirates': '/images/airlines-logo/emirates-airlines-logo.webp',
  'Emirates Airlines': '/images/airlines-logo/emirates-airlines-logo.webp',
  'Georgian Airways': '/images/airlines-logo/georgia-airlines-logo.webp',
  'LOT Polish Airlines': '/images/airlines-logo/lot-polish-airlines-logo.webp',
  'Lufthansa': '/images/airlines-logo/lufthansa-airlines-logo.webp',
  'Smartwings': '/images/airlines-logo/smartwings-airlines-logo.webp',
  'Wizz Air': '/images/airlines-logo/wizz-air-airlines.webp',
  'Ryanair': '/images/airlines-logo/ryannair-airlines-logo.webp'
}

const getAirlineLogo = (airlineName) => {
  if (!airlineName || airlineName === '—') return null
  const exact = AIRLINE_LOGO[airlineName]
  if (exact) return exact
  // For compound names (e.g. "Aegean Airlines / Turkish Airlines"), try first segment
  const first = airlineName.split(/[/&]/)[0].trim()
  return AIRLINE_LOGO[first] || null
}

/**
 * Price tab: one block per departure. Union of canonical dates + hotel rows; synthesize a row from the first
 * variant when the CMS lists a date on package/flights but omitted a duplicate hotel entry.
 */
const alignHotelVariantsToDepartures = (variants, details, baseHotel) => {
  if (isItineraryStyleHotels(details)) return variants

  const fromCanonical = getDepartureDates(details)
  const unionKeys = new Map()
  fromCanonical.forEach((d) => unionKeys.set(d.toLowerCase(), d))
  variants.forEach((v) => {
    const d = typeof v.departureDate === 'string' ? v.departureDate.trim() : ''
    if (d && d !== '—' && d !== '-') unionKeys.set(d.toLowerCase(), d)
  })
  const ordered = sortDepartureDateStrings([...unionKeys.values()])
  if (ordered.length === 0) return variants

  const byKey = new Map()
  variants.forEach((v) => {
    const d = typeof v.departureDate === 'string' ? v.departureDate.trim() : ''
    if (d) {
      const k = d.toLowerCase()
      if (!byKey.has(k)) byKey.set(k, v)
    }
  })

  const template = variants[0] || baseHotel
  return ordered.map((dateStr) => {
    const k = dateStr.toLowerCase()
    if (byKey.has(k)) return byKey.get(k)
    return {
      ...template,
      departureDate: dateStr,
    }
  })
}

const FlightLegSegment = ({ leg, tr }) => (
  <div className="flight-leg">
    <div className="flight-leg__endpoint">
      <span className="flight-leg__time">{leg.depart}</span>
      <strong className="flight-leg__airport">
        {leg.fromName} ({leg.fromCode})
      </strong>
      <span className="flight-leg__city">{leg.fromCity}</span>
    </div>
    <div className="flight-leg__connector" aria-hidden="true">
      <span className="flight-leg__connector-line" />
      <span className="flight-leg__connector-flight">{leg.flight}</span>
    </div>
    <div className="flight-leg__endpoint flight-leg__endpoint--arrive">
      <span className="flight-leg__time">{leg.arrive}</span>
      <strong className="flight-leg__airport">
        {leg.toName} ({leg.toCode})
      </strong>
      <span className="flight-leg__city">{leg.toCity}</span>
    </div>
    <div className="flight-leg__meta">
      <span className="flight-leg__meta-item">
        <span className="flight-label">{tr('package.flight')}</span>
        <span className="flight-value">{leg.flight}</span>
      </span>
      {leg.luggage ? (
        <span className="flight-leg__meta-item">
          <span className="flight-label">{tr('package.luggage')}</span>
          <span className="flight-value">{leg.luggage}</span>
        </span>
      ) : null}
    </div>
    {leg.note ? <p className="flight-leg__note">{leg.note}</p> : null}
  </div>
)

const PackageFlightsSection = ({ details }) => {
  const { t } = useTranslation()
  if (!details.flights?.length) return null
  const departureDates = getPackageDepartureDates(details)
  return (
    <div className="details-section">
      <h3 className="details-section-title details-section-title-flights">
        {getAirlineLogo(details.airline) ? (
          <img src={getAirlineLogo(details.airline)} alt="" className="airline-logo" />
        ) : (
          <span className="icon-badge flights">✈️</span>
        )}
        {t('package.flights')} — {details.airline || 'Sky Express'}
      </h3>
      {departureDates.length > 0 && (
        <div className="flights-departures" aria-label={t('package.flightsDeparturesAria')}>
          <p className="flights-departures__label">
            {departureDates.length > 1 ? t('package.departureDates') : t('package.departureDate')}
          </p>
          <div className="flights-departures__list">
            {departureDates.map((date) => (
              <span key={date} className="flights-departures__item">
                {date}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="flights-container">
        {details.flights.map((flight, index) => {
          const isReturn = flight.direction === 'Return'
          const isDomestic = flight.direction === 'Domestic'
          const hasLegs = Array.isArray(flight.legs) && flight.legs.length > 0
          const directionLabel = isReturn
            ? t('package.return')
            : isDomestic
              ? t('package.domestic')
              : t('common.departure')
          const DirectionIcon = isReturn ? PlaneLanding : PlaneTakeoff
          return (
            <div
              key={index}
              className={`flight-card ${isReturn ? 'flight-card--return' : 'flight-card--departure'}${isDomestic ? ' flight-card--domestic' : ''}`}
              style={{ animationDelay: `${0.06 + index * 0.08}s` }}
            >
              <div className="flight-card__accent" aria-hidden="true" />
              <div className="flight-header">
                <span className="flight-direction">
                  <DirectionIcon size={15} strokeWidth={2.25} aria-hidden="true" />
                  {directionLabel}
                </span>
              </div>
              <div className="flight-details">
                <div className="flight-route">
                  <FlightRouteDisplay route={flight.route || flight.direction} isReturn={isReturn} />
                </div>
                {hasLegs ? (
                  <>
                    {flight.stops != null && flight.stops !== '' ? (
                      <div className="flight-info flight-info--summary">
                        <div className="flight-info-row">
                          <span className="flight-label">{t('package.stops')}</span>
                          <span className="flight-value">{flight.stops}</span>
                        </div>
                        {flight.luggage ? (
                          <div className="flight-info-row">
                            <span className="flight-label">{t('package.luggage')}</span>
                            <span className="flight-value">{flight.luggage}</span>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="flight-legs">
                      {flight.legs.map((leg, legIndex) => {
                        if (leg.type === 'connection') {
                          return (
                            <p key={legIndex} className="flight-connection">
                              {leg.text}
                            </p>
                          )
                        }
                        if (leg.type === 'segment') {
                          return <FlightLegSegment key={legIndex} leg={leg} tr={t} />
                        }
                        return null
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flight-info">
                    {flight.flight ? (
                      <div className="flight-info-row">
                        <span className="flight-label">{t('package.flight')}</span>
                        <span className="flight-value">{flight.flight}</span>
                      </div>
                    ) : null}
                    {flight.time ? (
                      <div className="flight-info-row">
                        <span className="flight-label">{t('package.time')}</span>
                        <span className="flight-value flight-value--time">{flight.time}</span>
                      </div>
                    ) : null}
                    {flight.stops != null && flight.stops !== '' ? (
                      <div className="flight-info-row">
                        <span className="flight-label">{t('package.stops')}</span>
                        <span className="flight-value">{flight.stops}</span>
                      </div>
                    ) : null}
                    {flight.luggage ? (
                      <div className="flight-info-row">
                        <span className="flight-label">{t('package.luggage')}</span>
                        <span className="flight-value">{flight.luggage}</span>
                      </div>
                    ) : null}
                  </div>
                )}
                {flight.note ? (
                  <p className="section-text flight-card-note" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                    {flight.note}
                  </p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const CancellationPolicyBody = ({ policy }) => {
  if (!policy) return null
  if (typeof policy === 'string' && policy.includes('\n')) {
    return policy
      .split('\n')
      .filter(Boolean)
      .map((paragraph, i) => (
        <p key={i} className="section-text">{paragraph}</p>
      ))
  }
  return <p className="section-text">{policy}</p>
}

const PACKAGE_CONTACT_PHONE = '+357 77771234'
const PACKAGE_CONTACT_EMAIL = 'info@honeywelltravel.com'

const PackageContactCard = ({ className = '' }) => {
  const { t } = useTranslation()
  return (
  <div className={`contact-card ${className}`.trim()}>
    <div className="contact-card-glow" aria-hidden="true" />
    <div className="contact-card-header">
      <span className="contact-card-emblem" aria-hidden="true">
        <Headphones size={18} strokeWidth={1.75} />
      </span>
      <div className="contact-card-heading">
        <h3>{t('package.concierge')}</h3>
        <p className="contact-card-lead">{t('package.speakSpecialist')}</p>
      </div>
    </div>
    <div className="contact-card-links">
      <a
        className="contact-link"
        href={`tel:${PACKAGE_CONTACT_PHONE.replace(/\s/g, '')}`}
        aria-label={`Call Honeywell Travel at ${PACKAGE_CONTACT_PHONE}`}
      >
        <span className="contact-link-icon contact-link-icon-phone" aria-hidden="true">
          <Phone size={16} strokeWidth={2} />
        </span>
        <span className="contact-link-copy">
          <span className="contact-link-label">{t('package.callUs')}</span>
          <span className="contact-link-value">{PACKAGE_CONTACT_PHONE}</span>
        </span>
        <ArrowRight className="contact-link-arrow" size={15} strokeWidth={2} aria-hidden="true" />
      </a>
      <a
        className="contact-link"
        href={`mailto:${PACKAGE_CONTACT_EMAIL}?subject=Honeywell%20Travel%20Package%20Inquiry`}
        aria-label={`Email Honeywell Travel at ${PACKAGE_CONTACT_EMAIL}`}
      >
        <span className="contact-link-icon contact-link-icon-email" aria-hidden="true">
          <Mail size={16} strokeWidth={2} />
        </span>
        <span className="contact-link-copy">
          <span className="contact-link-label">{t('package.emailUs')}</span>
          <span className="contact-link-value">{PACKAGE_CONTACT_EMAIL}</span>
        </span>
        <ArrowRight className="contact-link-arrow" size={15} strokeWidth={2} aria-hidden="true" />
      </a>
    </div>
  </div>
  )
}

function getCheapestPriceFromPkg(pkg) {
  return getPackageLeadPrice(pkg)
}

function mergedOrFallback(all, id, fallback) {
  const numericId = parseInt(id, 10)
  return all.find((p) => p.id === numericId) || fallback
}

function PackageFullDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [pkg, setPkg] = useState(() => getPackageById(id))
  const [activeTab, setActiveTab] = useState('price')
  const [hotelSelections, setHotelSelections] = useState({})
  const [showReserveModal, setShowReserveModal] = useState(false)
  const [showBookSelection, setShowBookSelection] = useState(false)
  const [bookAdults, setBookAdults] = useState(2)
  const [bookRooms, setBookRooms] = useState(1)
  const [bookHotelKey, setBookHotelKey] = useState('')
  const [reserveFormData, setReserveFormData] = useState({
    email: '',
    phone: '',
    numberOfRooms: 1,
    hotelIndex: null
  })
  const [reserveSending, setReserveSending] = useState(false)
  const [reserveToast, setReserveToast] = useState(null) // { type: 'success' | 'error', message }
  const [reserveHoneypot, setReserveHoneypot] = useState('')
  const [selectedDepartureFilter, setSelectedDepartureFilter] = useState('')
  const [selectedHotelFilter, setSelectedHotelFilter] = useState('')
  const [relatedTours, setRelatedTours] = useState([])

  const displayPkg = useMemo(() => (pkg ? localizePackage(pkg, i18n) : null), [pkg, i18n])
  const details = displayPkg?.details || {}
  const gallery = details.gallery || []
  const itineraryHotels = isItineraryStyleHotels(details)
  const hotelDateLabel = itineraryHotels ? t('package.checkIn') : t('package.departureDate')
  const displayTitle = displayPkg?.title || ''
  const priceTabDestination = useMemo(
    () => getPriceTabDestinationLine(details, displayPkg || {}, displayTitle),
    [details, displayPkg, displayTitle]
  )
  const filteredHotelsForDeparture = useMemo(() => {
    if (!Array.isArray(details.hotels) || details.hotels.length === 0) return []
    const source = selectedDepartureFilter
      ? details.hotels.filter((hotel) => hotel?.departureDate === selectedDepartureFilter)
      : details.hotels
    return [...new Set(source.map((hotel) => hotel?.name).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'el'))
  }, [details.hotels, selectedDepartureFilter])

  const filteredDeparturesForHotel = useMemo(() => {
    if (!Array.isArray(details.hotels) || details.hotels.length === 0) return []
    const source = selectedHotelFilter
      ? details.hotels.filter((hotel) => hotel?.name === selectedHotelFilter)
      : details.hotels
    return sortDepartureDateStrings(
      [...new Set(source.map((hotel) => hotel?.departureDate).filter(Boolean))]
    )
  }, [details.hotels, selectedHotelFilter])

  useEffect(() => {
    let cancelled = false
    const fallback = getPackageById(id)
    setPkg(fallback)

    const refresh = (force = true) => {
      getMergedPackageById(id, { force }).then((merged) => {
        if (!cancelled) setPkg(merged || fallback)
      })

      loadMergedPackages({ force }).then((all) => {
        if (cancelled) return
        const current = mergedOrFallback(all, id, fallback)
        const related = all
          .filter((p) => p.category === current?.category && p.id !== current?.id)
          .slice(0, 3)
          .map((tour) => ({
            ...tour,
            cheapestPrice: getCheapestPriceFromPkg(tour)
          }))
        setRelatedTours(related)
      })
    }

    refresh(true)
    const unsubscribe = subscribePackagesCatalogRefresh(() => refresh(true))

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBookHotelKey('')
  }, [id])

  useEffect(() => {
    setSelectedDepartureFilter('')
    setSelectedHotelFilter('')
  }, [id])

  useEffect(() => {
    if (!reserveToast) return
    const t = setTimeout(() => setReserveToast(null), 5000)
    return () => clearTimeout(t)
  }, [reserveToast])

  useEffect(() => {
    if (selectedHotelFilter && !filteredHotelsForDeparture.includes(selectedHotelFilter)) {
      setSelectedHotelFilter('')
    }
  }, [selectedHotelFilter, filteredHotelsForDeparture])

  useEffect(() => {
    if (selectedDepartureFilter && !filteredDeparturesForHotel.includes(selectedDepartureFilter)) {
      setSelectedDepartureFilter('')
    }
  }, [selectedDepartureFilter, filteredDeparturesForHotel])

  if (!pkg) {
    return (
      <div className="package-full-page">
        <div className="package-full-container">
          <h1>{t('package.notFoundTitle')}</h1>
          <Link to="/packages" className="package-back-nav">
            <PackageBackChevron />
            <span className="package-back-nav__label">{t('package.backToPackages')}</span>
          </Link>
        </div>
      </div>
    )
  }

  const priceOnRequest = pkg.priceOnRequest || pkg.details?.priceOnRequest
  const formatPackagePrice = () => {
    const cheapest = getCheapestPriceFromPkg(pkg)
    return priceOnRequest || !(cheapest > 0)
      ? t('package.priceOnRequest')
      : `${t('package.from')} €${cheapest.toLocaleString()}`
  }

  const packageHotelOptions = details.hotels && details.hotels.length > 0
    ? (() => {
        const grouped = {}
        details.hotels.forEach((h, idx) => {
          if (!grouped[h.name]) grouped[h.name] = []
          grouped[h.name].push({ ...h, originalIndex: idx })
        })
        return Object.entries(grouped).map(([hotelName, variants], i) => ({
          hotelKey: `hotel-${i}`,
          hotelName: hotelName || variants[0]?.location || t('package.packageLabel'),
          variants
        }))
      })()
    : []

  // Calculate price for a single room based on selection
  const calculateRoomPrice = (hotel, selection) => {
    const prices = hotel?.prices
    if (!prices) return 0

    let total = 0

    // Calculate adult pricing
    if (selection.roomType === 'single' && prices.single) {
      total = prices.single * selection.adults
    } else if (selection.roomType === 'double' && prices.double) {
      total = prices.double * selection.adults
    } else if (selection.roomType === 'triple' && prices.triple) {
      total = prices.triple * Math.min(selection.adults, 3)
      if (selection.adults > 3) {
        const extraAdults = selection.adults - 3
        total += (prices.double || 0) * extraAdults
      }
    } else if (selection.roomType === 'quadruple' && prices.quadruple) {
      total = prices.quadruple * Math.min(selection.adults, 4)
      if (selection.adults > 4) {
        const extraAdults = selection.adults - 4
        total += (prices.double || 0) * extraAdults
      }
    } else if (prices.double) {
      total = prices.double * selection.adults
    }

    // Add children pricing
    if (selection.children > 0 && prices.child1) {
      total += prices.child1 * Math.min(selection.children, 1)
    }
    if (selection.children2 > 0 && prices.child2) {
      total += prices.child2 * selection.children2
    }

    return total || 0
  }

  /** Line items for room + children; total matches calculateRoomPrice. */
  const buildPackagePriceBreakdown = (hotel, selection, tr) => {
    const lines = []
    if (selection.roomType === 'single' && hotel.prices?.single != null) {
      const amount = hotel.prices.single * selection.adults
      lines.push({
        key: 'single',
        label: `${tr('package.single')} × ${selection.adults}`,
        amount,
      })
    } else if (selection.roomType === 'double' && hotel.prices?.double != null) {
      const amount = hotel.prices.double * selection.adults
      lines.push({
        key: 'double',
        label: `${tr('package.double')} × ${selection.adults}`,
        amount,
      })
    } else if (selection.roomType === 'triple' && hotel.prices?.triple != null) {
      let amount = hotel.prices.triple * Math.min(selection.adults, 3)
      if (selection.adults > 3) {
        amount += (hotel.prices.double || 0) * (selection.adults - 3)
      }
      lines.push({
        key: 'triple',
        label: `${tr('package.triple')} (${selection.adults} ${selection.adults !== 1 ? tr('package.adults') : tr('package.adult')})`,
        amount,
      })
    } else if (selection.roomType === 'quadruple' && hotel.prices?.quadruple != null) {
      let amount = hotel.prices.quadruple * Math.min(selection.adults, 4)
      if (selection.adults > 4) {
        amount += (hotel.prices.double || 0) * (selection.adults - 4)
      }
      lines.push({
        key: 'quadruple',
        label: `${tr('package.quadruple')} (${selection.adults} ${selection.adults !== 1 ? tr('package.adults') : tr('package.adult')})`,
        amount,
      })
    } else if (hotel.prices?.double != null) {
      const amount = hotel.prices.double * selection.adults
      lines.push({
        key: 'room',
        label: `${tr('package.double')} × ${selection.adults}`,
        amount,
      })
    }
    if (selection.children > 0 && hotel.prices?.child1 != null) {
      const n = Math.min(selection.children, 1)
      lines.push({
        key: 'c1',
        label: tr('package.child1'),
        amount: hotel.prices.child1 * n,
      })
    }
    if (selection.children2 > 0 && hotel.prices?.child2 != null) {
      lines.push({
        key: 'c2',
        label: `${tr('package.child2')} × ${selection.children2}`,
        amount: hotel.prices.child2 * selection.children2,
      })
    }
    const total = lines.reduce((sum, row) => sum + row.amount, 0)
    return { lines, total }
  }

  const updateHotelSelection = (hotelIndex, field, value) => {
    setHotelSelections(prev => ({
      ...prev,
      [hotelIndex]: {
        ...prev[hotelIndex],
        roomType: prev[hotelIndex]?.roomType || 'double',
        adults: prev[hotelIndex]?.adults || 1,
        children: prev[hotelIndex]?.children || 0,
        children2: prev[hotelIndex]?.children2 || 0,
        [field]: value
      }
    }))
  }

  // Hero image priority: package gallery/coverImage first, then fallbacks
  const heroImage = gallery[0] || details.coverImage || details.thumbnailImage || '/images/destinations/riviera-hero.webp'
  
  // SEO data
  const packageUrl = `https://www.honeywelltravel.com.cy/packages/${pkg.id}/details`
  const packageImage = heroImage.startsWith('http') ? heroImage : `https://www.honeywelltravel.com.cy${heroImage}`
  const packageDescription = displayPkg?.longDescription || displayPkg?.description || `Book ${displayTitle} - ${pkg.duration} from €${getCheapestPriceFromPkg(pkg).toLocaleString()}. Complete travel package details including hotels, itinerary, and pricing.`

  return (
    <div className="package-full-page">
      <SEO 
        title={`${displayTitle} - Complete Package Details | Honeywell Travel`}
        description={packageDescription}
        keywords={`${pkg.destination}, ${pkg.category}, Travel Package, Holiday Package, ${pkg.duration}, Hotels, Itinerary, Honeywell Travel`}
        image={packageImage}
        url={packageUrl}
        type="product"
      />
      <div className="package-full-hero">
        <img
          className="package-full-hero-image"
          src={heroImage}
          alt=""
          decoding="async"
          fetchPriority="high"
          loading="eager"
          referrerPolicy="no-referrer"
          aria-hidden="true"
        />
        <div className="package-full-hero-overlay" aria-hidden="true" />
        <div className="package-full-hero-favorite">
          <FavoriteToggleButton packageId={pkg.id} className="package-favorite-btn" size={17} />
        </div>
        <div className="package-full-hero-content">
          <h1>
            {displayTitle}
            {pkg.supplier ? (
              <span className="hero-supplier-badge">
                {pkg.supplier}
              </span>
            ) : null}
          </h1>
          <div className="hero-meta">
            <span className={`hero-package-type ${(pkg.packageType || 'individual').toLowerCase()}`}>
              {(pkg.packageType || 'individual').toLowerCase() === 'group' ? t('common.group') : t('common.individual')}
            </span>
            {pkg.supplier ? (
              <span className="hero-meta-supplier">
                {pkg.supplier}
              </span>
            ) : null}
            <span>⏱️ {pkg.duration}</span>
            <span>{formatPackagePrice()}</span>
          </div>
        </div>
      </div>

      <div className="package-full-container">
        <button
          type="button"
          className="package-back-nav"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1)
            } else {
              navigate('/packages')
            }
          }}
        >
          <PackageBackChevron />
          <span className="package-back-nav__label">{t('package.backToOverview')}</span>
        </button>

        {displayPkg?._i18nMissing ? (
          <p className="package-translation-pending" role="status">
            {t('package.translationPending')}
          </p>
        ) : null}

        <div className="layout-grid">
          <main className="layout-main">
            {/* Tabs */}
            <div className="full-tabs">
              <button
                className={`full-tab ${activeTab === 'price' ? 'active' : ''}`}
                onClick={() => setActiveTab('price')}
              >
                {t('package.price')}
              </button>
              <button
                className={`full-tab ${activeTab === 'program' ? 'active' : ''}`}
                onClick={() => setActiveTab('program')}
              >
                {t('package.program')}
              </button>
              <button
                className={`full-tab ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                {t('package.packageDetails')}
              </button>
              <button
                className={`full-tab ${activeTab === 'flights' ? 'active' : ''}`}
                onClick={() => setActiveTab('flights')}
              >
                {t('package.flights')}
              </button>
            </div>

            {/* PRICE TAB */}
            {activeTab === 'price' && (
              <section className="full-section">
                <h2>{t('package.pricesAndAccommodation')}</h2>
                <div className="price-header price-header--destination-hero">
                  <div className="price-thumb">
                    {(details.thumbnailImage || details.coverImage || gallery[0]) ? (
                      <img
                        src={details.thumbnailImage || details.coverImage || gallery[0]}
                        alt={priceTabDestination || displayTitle || ''}
                        className="price-thumb-img"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        sizes="(min-width: 900px) min(92vw, 1200px), 100vw"
                      />
                    ) : (
                      <span className="price-thumb-placeholder">{pkg.image}</span>
                    )}
                  </div>
                  {priceTabDestination ? (
                    <div className="price-intro price-intro--destination">
                      <p className="price-destination-eyebrow">{t('package.priceTabDestinationLabel')}</p>
                      <p className="price-destination-name">{priceTabDestination}</p>
                    </div>
                  ) : null}
                </div>

                {details.hotels && details.hotels.length > 0 ? (
                  <>
                    {!itineraryHotels ? (
                    <div className="hotel-filters">
                      <div className="hotel-filter-field">
                        <label htmlFor="departure-filter">{t('package.departureDate')}</label>
                        <select
                          id="departure-filter"
                          value={selectedDepartureFilter}
                          onChange={(e) => setSelectedDepartureFilter(e.target.value)}
                        >
                          <option value="">{t('package.allDepartureDates')}</option>
                          {filteredDeparturesForHotel.map((date) => (
                            <option key={date} value={date}>{date}</option>
                          ))}
                        </select>
                      </div>
                      <div className="hotel-filter-field">
                        <label htmlFor="hotel-filter">{t('package.hotel')}</label>
                        <select
                          id="hotel-filter"
                          value={selectedHotelFilter}
                          onChange={(e) => setSelectedHotelFilter(e.target.value)}
                        >
                          <option value="">{t('package.allHotels')}</option>
                          {filteredHotelsForDeparture.map((hotelName) => (
                            <option key={hotelName} value={hotelName}>{hotelName}</option>
                          ))}
                        </select>
                      </div>
                      {(selectedDepartureFilter || selectedHotelFilter) ? (
                        <button
                          type="button"
                          className="hotel-filter-reset"
                          onClick={() => {
                            setSelectedDepartureFilter('')
                            setSelectedHotelFilter('')
                          }}
                        >
                          {t('common.clearFilters')}
                        </button>
                      ) : null}
                    </div>
                    ) : null}
                    {(() => {
                      const uniqueNames = [...new Set(details.hotels.map(h => h.name))]
                      const isSingleHotel = uniqueNames.length === 1
                      return isSingleHotel ? (
                        <div className="hotels-intro">
                          <h3 className="hotels-intro-title">{t('package.hotel')}</h3>
                          <p className="hotels-intro-subtitle">
                            {t('package.sameHotelDescription')}
                          </p>
                        </div>
                      ) : null
                    })()}
                  <div className="hotels-grid">
                    {(() => {
                      // Group hotels by name
                      const groupedHotels = {}
                      details.hotels.forEach((hotel, idx) => {
                        if (!groupedHotels[hotel.name]) {
                          groupedHotels[hotel.name] = []
                        }
                        groupedHotels[hotel.name].push({ ...hotel, originalIndex: idx })
                      })
                      const groupEntries = Object.entries(groupedHotels).filter(([hotelName, variants]) => {
                        const hotelPass = !selectedHotelFilter || hotelName === selectedHotelFilter
                        const datePass = !selectedDepartureFilter || variants.some((variant) => variant.departureDate === selectedDepartureFilter)
                        return hotelPass && datePass
                      })

                      if (groupEntries.length === 0) {
                        return (
                          <p className="section-text muted">
                            No hotels found for the selected filters.
                          </p>
                        )
                      }

                      // One card per hotel group; same layout for all (left = hotel info, right = variant blocks)
                      return groupEntries.map(([, hotelVariants], groupIndex) => {
                        // Use the first variant for common properties (image, stars, roomType)
                        const baseHotel = hotelVariants[0]
                        // Remove duplicate departures for the same hotel (keep first occurrence)
                        const seenDepartureDates = new Set()
                        const uniqueHotelVariants = hotelVariants.filter((variant) => {
                          const rawDate = typeof variant.departureDate === 'string' ? variant.departureDate.trim() : ''
                          if (!rawDate) return true
                          const normalizedDate = rawDate.toLowerCase()
                          if (seenDepartureDates.has(normalizedDate)) return false
                          seenDepartureDates.add(normalizedDate)
                          return true
                        })
                        const alignedHotelVariants = alignHotelVariantsToDepartures(uniqueHotelVariants, details, baseHotel)
                        const displayHotelVariants = selectedDepartureFilter
                          ? alignedHotelVariants.filter((variant) => variant?.departureDate === selectedDepartureFilter)
                          : alignedHotelVariants
                        if (displayHotelVariants.length === 0) return null
                        // Create a unique key for this hotel group
                        const hotelKey = `hotel-${groupIndex}`
                        const hotelStarCount = Math.min(5, Math.max(0, baseHotel.stars ?? 3))

                        // Same layout for all hotel cards: left = hotel info, right = one variant block per departure
                        return (
                            <div key={hotelKey} className="hotel-single-layout">
                              <div className="hotel-single-left">
                                <div className="hotel-image-top hotel-image-single">
                                  {baseHotel.image ? (
                                    <img
                                      src={baseHotel.image}
                                      alt=""
                                      className="hotel-image-bg hotel-image-bg--img"
                                      loading="lazy"
                                      decoding="async"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="hotel-image-placeholder"><span className="image-text">INSERT IMAGE HERE</span></div>
                                  )}
                                  <div
                                    className="hotel-stars-overlay"
                                    role="img"
                                    aria-label={t('package.starRatingAria', { count: hotelStarCount })}
                                  >
                                    {Array.from({ length: hotelStarCount }, (_, i) => (
                                      <span key={`star-filled-${i}`} className="hotel-stars-overlay__star hotel-stars-overlay__star--filled" aria-hidden="true">★</span>
                                    ))}
                                    {Array.from({ length: 5 - hotelStarCount }, (_, i) => (
                                      <span key={`star-empty-${i}`} className="hotel-stars-overlay__star hotel-stars-overlay__star--empty" aria-hidden="true">☆</span>
                                    ))}
                                  </div>
                                </div>
                                {baseHotel.name ? <h3 className="hotel-single-title">{baseHotel.name}</h3> : null}
                                {baseHotel.location && (
                                  <p className="hotel-single-location">
                                    <span className="hotel-single-location__label">{t('package.location')}</span>
                                    <span className="hotel-single-location__text">{baseHotel.location}</span>
                                  </p>
                                )}
                                {baseHotel.description && details.hideHotelPrices ? (
                                  <div className="hotel-single-description hotel-single-description--premium">
                                    <span className="hotel-single-description__eyebrow">{t('package.aboutStay')}</span>
                                    <p className="hotel-single-description__text">{baseHotel.description}</p>
                                  </div>
                                ) : null}
                              </div>
                              <div className="hotel-single-right">
                                {details.hideHotelPrices ? (
                                  displayHotelVariants.map((variant, variantIdx) => {
                                    const stayDate = getHotelStayDate(variant)
                                    const depSlug =
                                      typeof stayDate === 'string' && stayDate.trim()
                                        ? stayDate.trim().toLowerCase().replace(/\s+/g, '').replace(/\//g, '-')
                                        : `idx-${variantIdx}`
                                    const variantKey = `${hotelKey}-variant-${depSlug}`
                                    return (
                                      <div key={variantKey} className="hotel-variant-block">
                                        <div className="hotel-variant-date-badge">
                                          <span className="hotel-variant-date-label">{hotelDateLabel}</span>
                                          <span className="hotel-variant-date-value">{getHotelStayDate(variant)}</span>
                                        </div>
                                        {variant.nights != null ? (
                                          <div className="hotel-included-note hotel-included-note--premium">
                                            <div className="hotel-included-note__top">
                                              <span className="hotel-included-note__badge">{t('package.includedStay')}</span>
                                              <span className="hotel-included-note__nights">
                                                {variant.nights}{' '}
                                                {variant.nights === 1 ? 'νύχτα' : 'νύχτες'}
                                              </span>
                                            </div>
                                            <div className="hotel-included-note__meta">
                                              {(variant.boardBasis || baseHotel.boardBasis) ? (
                                                <span>{variant.boardBasis || baseHotel.boardBasis}</span>
                                              ) : null}
                                              {(variant.roomType || baseHotel.roomType) ? (
                                                <span>{variant.roomType || baseHotel.roomType}</span>
                                              ) : null}
                                            </div>
                                            <p className="hotel-included-note__caption">
                                              Περιλαμβάνεται στην τιμή του πακέτου
                                            </p>
                                          </div>
                                        ) : null}
                                      </div>
                                    )
                                  })
                                ) : pkg.id === 201 && groupIndex > 0 ? (
                                  // For the Scandinavia Mary Special trip, hide prices for the 2nd/3rd hotels
                                  <div className="hotel-variant-block">
                                    <p className="section-text hotel-included-note">
                                      {t('package.includedInPrice')}
                                    </p>
                                  </div>
                                ) : (
                                  displayHotelVariants.map((variant, variantIdx) => {
                                    const depSlug =
                                      typeof variant.departureDate === 'string' && variant.departureDate.trim()
                                        ? variant.departureDate.trim().toLowerCase().replace(/\s+/g, '').replace(/\//g, '-')
                                        : `idx-${variantIdx}`
                                    const variantKey = `${hotelKey}-variant-${depSlug}`
                                    const variantRoomState = hotelSelections[variantKey] || {}
                                    const hotelGuestState = hotelSelections[hotelKey] || {}
                                    const variantSelection = {
                                      roomType: variantRoomState.roomType ?? null,
                                      adults: hotelGuestState.adults ?? variantRoomState.adults ?? 2,
                                      children: hotelGuestState.children ?? variantRoomState.children ?? 0,
                                      children2: hotelGuestState.children2 ?? variantRoomState.children2 ?? 0,
                                    }
                                    const selectionForPrice = {
                                      roomType: variantRoomState.roomType ?? 'double',
                                      adults: hotelGuestState.adults ?? variantRoomState.adults ?? 2,
                                      children: hotelGuestState.children ?? variantRoomState.children ?? 0,
                                      children2: hotelGuestState.children2 ?? variantRoomState.children2 ?? 0,
                                    }
                                    const variantTotal = calculateRoomPrice(variant, selectionForPrice)
                                    const priceBreakdown = buildPackagePriceBreakdown(variant, selectionForPrice, t)
                                    return (
                                      <div key={variantKey} className="hotel-variant-block">
                                        <div className="hotel-variant-date-badge">
                                          <span className="hotel-variant-date-label">{hotelDateLabel}</span>
                                          <span className="hotel-variant-date-value">{getHotelStayDate(variant)}</span>
                                        </div>
                                        <div className="hotel-variant-body">
                                          <div className="hotel-variant-head">
                                            <span className="hotel-variant-room-type">{baseHotel.roomType || 'Standard Room'}</span>
                                            <span className="hotel-variant-board">{baseHotel.boardBasis || 'Bed & Breakfast'}</span>
                                          </div>
                                          <div className="hotel-variant-summary">
                                            <span className="hotel-variant-room-label">{t('package.room')} 1</span>
                                            <span className="hotel-variant-total">
                                              {selectionForPrice.adults} {selectionForPrice.adults !== 1 ? t('package.adults') : t('package.adult')}
                                              {selectionForPrice.children > 0 && `, ${selectionForPrice.children} ${t('package.child1')}`}
                                              {selectionForPrice.children2 > 0 && `, ${selectionForPrice.children2} ${t('package.child2')}`}: <strong>€{variantTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                            </span>
                                          </div>
                                          <div className="hotel-variant-prices">
                                            <div className="hotel-variant-price-grid">
                                              <button
                                                type="button"
                                                className={`hotel-variant-price-cell ${variantSelection.roomType === 'double' ? 'selected' : ''}`}
                                                onClick={() => {
                                                  if (variant.prices?.double == null) return
                                                  setHotelSelections((prev) => {
                                                    const hg = prev[hotelKey] || {}
                                                    const adults = Math.max(hg.adults ?? 2, 2)
                                                    return {
                                                      ...prev,
                                                      [variantKey]: { ...prev[variantKey], roomType: 'double' },
                                                      [hotelKey]: {
                                                        ...hg,
                                                        adults,
                                                        children: hg.children ?? 0,
                                                        children2: hg.children2 ?? 0,
                                                      },
                                                    }
                                                  })
                                                }}
                                                disabled={variant.prices?.double == null}
                                                title={t('package.selectDouble')}
                                              >
                                                <span className="hotel-variant-price-label">{t('package.double')}</span>
                                                <span className="hotel-variant-price-value">{variant.prices?.double != null ? `€${variant.prices.double}` : '–'}</span>
                                              </button>
                                              <button
                                                type="button"
                                                className={`hotel-variant-price-cell ${variantSelection.roomType === 'single' ? 'selected' : ''}`}
                                                onClick={() => {
                                                  if (variant.prices?.single == null) return
                                                  setHotelSelections((prev) => {
                                                    const hg = prev[hotelKey] || {}
                                                    return {
                                                      ...prev,
                                                      [variantKey]: { ...prev[variantKey], roomType: 'single' },
                                                      [hotelKey]: {
                                                        ...hg,
                                                        adults: 1,
                                                        children: hg.children ?? 0,
                                                        children2: hg.children2 ?? 0,
                                                      },
                                                    }
                                                  })
                                                }}
                                                disabled={variant.prices?.single == null}
                                                title={t('package.selectSingle')}
                                              >
                                                <span className="hotel-variant-price-label">{t('package.single')}</span>
                                                <span className="hotel-variant-price-value">{variant.prices?.single != null ? `€${variant.prices.single}` : '–'}</span>
                                              </button>
                                              {variant.prices?.triple != null && (
                                                <button
                                                  type="button"
                                                  className={`hotel-variant-price-cell ${variantSelection.roomType === 'triple' ? 'selected' : ''}`}
                                                  onClick={() => {
                                                    setHotelSelections((prev) => {
                                                      const hg = prev[hotelKey] || {}
                                                      const adults = Math.max(hg.adults ?? 2, 3)
                                                      return {
                                                        ...prev,
                                                        [variantKey]: { ...prev[variantKey], roomType: 'triple' },
                                                        [hotelKey]: {
                                                          ...hg,
                                                          adults,
                                                          children: hg.children ?? 0,
                                                          children2: hg.children2 ?? 0,
                                                        },
                                                      }
                                                    })
                                                  }}
                                                  title={t('package.selectTriple')}
                                                >
                                                  <span className="hotel-variant-price-label">{t('package.triple')}</span>
                                                  <span className="hotel-variant-price-value">€{variant.prices.triple}</span>
                                                </button>
                                              )}
                                              {variant.prices?.quadruple != null && (
                                                <button
                                                  type="button"
                                                  className={`hotel-variant-price-cell ${variantSelection.roomType === 'quadruple' ? 'selected' : ''}`}
                                                  onClick={() => {
                                                    setHotelSelections((prev) => {
                                                      const hg = prev[hotelKey] || {}
                                                      const adults = Math.max(hg.adults ?? 2, 4)
                                                      return {
                                                        ...prev,
                                                        [variantKey]: { ...prev[variantKey], roomType: 'quadruple' },
                                                        [hotelKey]: {
                                                          ...hg,
                                                          adults,
                                                          children: hg.children ?? 0,
                                                          children2: hg.children2 ?? 0,
                                                        },
                                                      }
                                                    })
                                                  }}
                                                  title={t('package.selectQuadruple')}
                                                >
                                                  <span className="hotel-variant-price-label">{t('package.quadruple')}</span>
                                                  <span className="hotel-variant-price-value">€{variant.prices.quadruple}</span>
                                                </button>
                                              )}
                                              {variant.prices?.child1 != null && (
                                                <div
                                                  className={`hotel-variant-price-cell hotel-variant-price-cell--child-stepper ${(selectionForPrice.children ?? 0) >= 1 ? 'selected' : ''}`}
                                                  title={t('package.childPriceStepperHint')}
                                                >
                                                  <span className="hotel-variant-price-label">{t('package.child1')}</span>
                                                  <span className="hotel-variant-price-value">€{variant.prices.child1}</span>
                                                  <div className="hotel-variant-child-stepper" role="group" aria-label={t('package.child1')}>
                                                    <button
                                                      type="button"
                                                      className="hotel-variant-child-stepper-btn"
                                                      disabled={(selectionForPrice.children ?? 0) <= 0}
                                                      aria-label={t('package.decreaseCount')}
                                                      onClick={() => {
                                                        setHotelSelections((prev) => {
                                                          const hg = prev[hotelKey] || {}
                                                          return { ...prev, [hotelKey]: { ...hg, children: 0 } }
                                                        })
                                                      }}
                                                    >
                                                      −
                                                    </button>
                                                    <span className="hotel-variant-child-stepper-count" aria-live="polite">{selectionForPrice.children}</span>
                                                    <button
                                                      type="button"
                                                      className="hotel-variant-child-stepper-btn"
                                                      disabled={(selectionForPrice.children ?? 0) >= 1}
                                                      aria-label={t('package.increaseCount')}
                                                      onClick={() => {
                                                        setHotelSelections((prev) => {
                                                          const hg = prev[hotelKey] || {}
                                                          return { ...prev, [hotelKey]: { ...hg, children: 1 } }
                                                        })
                                                      }}
                                                    >
                                                      +
                                                    </button>
                                                  </div>
                                                </div>
                                              )}
                                              {variant.prices?.child2 != null && (
                                                <div
                                                  className={`hotel-variant-price-cell hotel-variant-price-cell--child-stepper ${(selectionForPrice.children2 ?? 0) > 0 ? 'selected' : ''}`}
                                                  title={t('package.childPriceStepperHint')}
                                                >
                                                  <span className="hotel-variant-price-label">{t('package.child2')}</span>
                                                  <span className="hotel-variant-price-value">€{variant.prices.child2}</span>
                                                  <div className="hotel-variant-child-stepper" role="group" aria-label={t('package.child2')}>
                                                    <button
                                                      type="button"
                                                      className="hotel-variant-child-stepper-btn"
                                                      disabled={(selectionForPrice.children2 ?? 0) <= 0}
                                                      aria-label={t('package.decreaseCount')}
                                                      onClick={() => {
                                                        setHotelSelections((prev) => {
                                                          const hg = prev[hotelKey] || {}
                                                          const c2 = Math.max(0, (hg.children2 ?? 0) - 1)
                                                          return { ...prev, [hotelKey]: { ...hg, children2: c2 } }
                                                        })
                                                      }}
                                                    >
                                                      −
                                                    </button>
                                                    <span className="hotel-variant-child-stepper-count" aria-live="polite">{selectionForPrice.children2}</span>
                                                    <button
                                                      type="button"
                                                      className="hotel-variant-child-stepper-btn"
                                                      disabled={(selectionForPrice.children2 ?? 0) >= 4}
                                                      aria-label={t('package.increaseCount')}
                                                      onClick={() => {
                                                        setHotelSelections((prev) => {
                                                          const hg = prev[hotelKey] || {}
                                                          const c2 = Math.min(4, (hg.children2 ?? 0) + 1)
                                                          return { ...prev, [hotelKey]: { ...hg, children2: c2 } }
                                                        })
                                                      }}
                                                    >
                                                      +
                                                    </button>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                            {priceBreakdown.lines.length > 0 ? (
                                              <div className="hotel-variant-price-breakdown" aria-live="polite">
                                                <p className="hotel-variant-price-breakdown-title">{t('package.priceBreakdownTitle')}</p>
                                                <ul className="hotel-variant-price-breakdown-list">
                                                  {priceBreakdown.lines.map((row) => (
                                                    <li key={row.key} className="hotel-variant-price-breakdown-row">
                                                      <span>{row.label}</span>
                                                      <span>€{row.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                    </li>
                                                  ))}
                                                </ul>
                                                <div className="hotel-variant-price-breakdown-total">
                                                  <span>{t('package.priceBreakdownTotal')}</span>
                                                  <strong>€{priceBreakdown.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                                </div>
                                              </div>
                                            ) : null}
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          className="hotel-variant-continue"
                                          onClick={() => {
                                            updateHotelSelection(hotelKey, 'selectedDateIndex', variantIdx)
                                            setReserveFormData({
                                              name: '', email: '', phone: '',
                                              hotelKey, hotelName: baseHotel.name || baseHotel.location,
                                              departureDate: variant.departureDate,
                                              roomType: selectionForPrice.roomType,
                                              adults: selectionForPrice.adults,
                                              children: selectionForPrice.children,
                                              children2: selectionForPrice.children2,
                                              totalPrice: variantTotal,
                                              selectedHotel: variant
                                            })
                                            setReserveToast(null)
                                            setShowReserveModal(true)
                                          }}
                                        >
                                          {t('common.reserve')}
                                        </button>
                                      </div>
                                    )
                                  })
                                )}
                              </div>
                            </div>
                          )
                      })
                    })()}
                  </div>
                  </>
                ) : (
                  <p className="section-text muted">
                    {t('package.priceTabNoHotelsPlaceholder')}
                  </p>
                )}

                {details.cancellationPolicy ? (
                  <div className="details-section price-tab-cancellation-wrap">
                    <h3 className="details-section-title">
                      <span className="icon-badge cancellation">⚠️</span>
                      {t('package.cancellationPolicy')}
                    </h3>
                    <div className="cancellation-policy">
                      <CancellationPolicyBody policy={details.cancellationPolicy} />
                    </div>
                  </div>
                ) : null}
              </section>
            )}

            {/* PROGRAM TAB */}
            {activeTab === 'program' && (
              <section className="full-section">
                <h2>{t('package.program')}</h2>
                {details.note && (() => {
                  const noteHighlights = getProgramNoteHighlights(details, t)
                  const premiumNote = isPremiumProgramNote(details, noteHighlights)
                  return (
                    <aside
                      className={`program-premium-note${premiumNote ? '' : ' program-premium-note--simple'}`}
                      role="note"
                    >
                      <div className="program-premium-note__content">
                        <div className="program-premium-note__eyebrow">
                          {premiumNote ? (
                            <span className="program-premium-note__badge">{t('package.premium')}</span>
                          ) : null}
                          <span className="program-premium-note__title">{t('package.note')}</span>
                        </div>
                        {noteHighlights ? (
                          <div className="program-premium-note__stats">
                            {noteHighlights.map(({ label, value }) => (
                              <div key={label} className="program-premium-note__stat">
                                <span className="program-premium-note__stat-label">{label}</span>
                                <span className="program-premium-note__stat-value">{value}</span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        <p className="program-premium-note__text">{details.note}</p>
                      </div>
                    </aside>
                  )
                })()}
                
                {details.itinerary && details.itinerary.length > 0 ? (
                  <div className="program-content">
                    <ol className="itinerary-list">
                      {details.itinerary.map((day, index) => (
                        <li key={index} className="itinerary-item">
                          <div className="itinerary-header">
                            <span className="itinerary-day">{day.day}</span>
                            <h3 className="itinerary-title">{day.title}</h3>
                          </div>
                          <ItineraryDescription text={day.description} />
                          {day.image && (
                            <div 
                              className="itinerary-image"
                              style={{ backgroundImage: `url(${day.image})` }}
                            >
                              <div className="itinerary-image-overlay"></div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ol>
                    {details.program && details.program.optional && (
                      <div className="program-section optional-section">
                        <h3>{t('package.optional')}</h3>
                        <p className="section-text">{details.program.optional}</p>
                      </div>
                    )}
                  </div>
                ) : details.program ? (
                  <div className="program-content">
                    {(details.program.programNarrative || details.program.introduction) && pkg.id !== 100 && (() => {
                      const introText = details.program.programNarrative || details.program.introduction
                      // Split by double newlines to create paragraphs
                      const paragraphs = introText.split(/\n\n+/).filter(p => p.trim())
                      const firstPara = paragraphs[0]?.trim()
                      const isTitle = isProgramIntroTitle(firstPara)
                      
                      return (
                        <div className="program-section program-section-styled">
                          {isTitle && (
                            <h3 className="program-heading">{firstPara}</h3>
                          )}
                          <div className="program-text">
                            {isTitle ? (
                              // Render remaining paragraphs
                              paragraphs.slice(1).map((para, idx) => {
                                const t = para.trim()
                                const isBoldHeading = t === 'Η ριβιέρα της Ηπείρου' || t === 'Σύβοτα. Τα φιόρδ του Ιονίου!'
                                return (
                                  <p key={idx} className={programIntroParagraphClass(t)}>
                                    {isBoldHeading ? <strong>{t}</strong> : t}
                                  </p>
                                )
                              })
                            ) : (
                              // Render all paragraphs
                              paragraphs.map((para, idx) => {
                                const t = para.trim()
                                const isBoldHeading = t === 'Η ριβιέρα της Ηπείρου' || t === 'Σύβοτα. Τα φιόρδ του Ιονίου!'
                                return (
                                  <p key={idx} className={programIntroParagraphClass(t)}>
                                    {isBoldHeading ? <strong>{t}</strong> : t}
                                  </p>
                                )
                              })
                            )}
                          </div>
                        </div>
                      )
                    })()}
                    {(() => {
                      const dayKeys = Object.keys(details.program)
                        .filter(k => /^day\d+$/.test(k))
                        .sort((a, b) => parseInt(a.replace('day', ''), 10) - parseInt(b.replace('day', ''), 10))
                      const programDays = dayKeys
                        .map((key, i) => ({ key, dayNum: i + 1, text: details.program[key] }))
                        .filter(({ text }) => text)
                      if (programDays.length === 0) return null
                      return (
                        <ol className="itinerary-list" style={{ marginTop: '2rem' }}>
                          {programDays.map(({ key, dayNum, text }) => {
                            const title = extractTitle(text)
                            const paragraphs = formatProgramText(text)
                            const contentParas = title ? paragraphs.slice(1) : paragraphs
                            const description = contentParas.join('\n\n')
                            const dayImage = details.program.dayImages?.[key]
                            return (
                              <li key={key} className="itinerary-item">
                                <div className="itinerary-header">
                                  <span className="itinerary-day">{dayNum}η Μέρα</span>
                                  <h3 className="itinerary-title">{title || `${dayNum}η Μέρα`}</h3>
                                </div>
                                <ItineraryDescription text={description} />
                                {dayImage ? (
                                  <div
                                    className="itinerary-image"
                                    style={{ backgroundImage: `url(${dayImage})` }}
                                  >
                                    <div className="itinerary-image-overlay"></div>
                                  </div>
                                ) : null}
                              </li>
                            )
                          })}
                        </ol>
                      )
                    })()}
                    {details.program.heraklionCity && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Ηράκλειο: πόλη θαλασσινή, γεμάτη ζωή και ιστορία</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.heraklionCity).map((para, idx) => (
                            <p key={idx} className={programParagraphClass(para)}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.venetians && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Οι Ενετοί στον μόλο</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.venetians).map((para, idx) => (
                            <p key={idx} className={programParagraphClass(para)}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.walls && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Τα τείχη της παλιάς πόλης: μεταίχμιο του σήμερα και του χθες</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.walls).map((para, idx) => (
                            <p key={idx} className={programParagraphClass(para)}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.knossos && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Η «μυθική» Κνωσός</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.knossos).map((para, idx) => (
                            <p key={idx} className={programParagraphClass(para)}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.museum && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Αρχαιολογικό Μουσείο Ηρακλείου: «πανόραμα» Μινωικής Κρήτης</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.museum).map((para, idx) => (
                            <p key={idx} className={programParagraphClass(para)}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.cretaquarium && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Cretaquarium: υδάτινη κιβωτός της Μεσογείου</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.cretaquarium).map((para, idx) => (
                            <p key={idx} className={programParagraphClass(para)}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.food && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Πανδαισία γεύσεων και απολαύσεων</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.food).map((para, idx) => (
                            <p key={idx} className={programParagraphClass(para)}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.accommodation && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Αναρίθμητες επιλογές διαμονής</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.accommodation).map((para, idx) => (
                            <p key={idx} className={programParagraphClass(para)}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.beaches && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Παραλίες με χαρακτήρα και ομορφιά</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.beaches).map((para, idx) => (
                            <p key={idx} className={programParagraphClass(para)}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.naturalHistory && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Το Μουσείο Φυσικής Ιστορίας: πλούσιο, δραστήριο, διασκεδαστικό</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.naturalHistory).map((para, idx) => (
                            <p key={idx} className={programParagraphClass(para)}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.historicalMuseum && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Ιστορικό Μουσείο Κρήτης: η Κρήτη της ιστορίας</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.historicalMuseum).map((para, idx) => (
                            <p key={idx} className={programParagraphClass(para)}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.cityCenter && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Στην καρδιά της πόλης</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.cityCenter).map((para, idx) => (
                            <p key={idx} className={programParagraphClass(para)}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.whatToSee && (() => {
                      const title = extractTitle(details.program.whatToSee)
                      const paragraphs = formatProgramText(details.program.whatToSee)
                      const contentParas = title ? paragraphs.slice(1) : paragraphs
                      return (
                        <div className="program-section program-section-styled">
                          {title && <h3 className="program-heading">{title}</h3>}
                          <div className="program-text">
                            {contentParas.map((para, idx) => (
                              <p key={idx} className={programParagraphClass(para)}>{para}</p>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                    {details.program.entertainment && (() => {
                      const title = extractTitle(details.program.entertainment)
                      const paragraphs = formatProgramText(details.program.entertainment)
                      const contentParas = title ? paragraphs.slice(1) : paragraphs
                      return (
                        <div className="program-section program-section-styled">
                          {title && <h3 className="program-heading">{title}</h3>}
                          <div className="program-text">
                            {contentParas.map((para, idx) => (
                              <p key={idx} className={programParagraphClass(para)}>{para}</p>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  <p className="section-text muted">
                    {t('package.programPlaceholder')}
                  </p>
                )}
              </section>
            )}

            {/* PACKAGE DETAILS TAB */}
            {activeTab === 'details' && (
              <section className="full-section">
                <h2>{t('package.packageDetails')}</h2>

                {/* What's Included */}
                <div className="details-section">
                  <h3 className="details-section-title">
                    <span className="icon-badge included">✓</span>
                    {t('package.whatsIncluded')}
                  </h3>
                  {details.included && details.included.length > 0 ? (
                    <ul className="icon-list included-list">
                      {details.included.map((item, index) => (
                        <li key={index}>
                          <span className="icon">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="section-text muted">
                      {t('package.includedPlaceholder')}
                    </p>
                  )}
                </div>

                {/* What's Not Included */}
                <div className="details-section">
                  <h3 className="details-section-title">
                    <span className="icon-badge not-included">✕</span>
                    {t('package.whatsNotIncluded')}
                  </h3>
                  {details.notIncluded && details.notIncluded.length > 0 ? (
                    <ul className="icon-list not-included-list">
                      {details.notIncluded.map((item, index) => (
                        <li key={index}>
                          <span className="icon">✕</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="section-text muted">
                      {t('package.notIncludedPlaceholder')}
                    </p>
                  )}
                </div>

                {/* Terms & Conditions */}
                {details.termsAndConditions && details.termsAndConditions.length > 0 && (
                  <div className="details-section">
                    <h3 className="details-section-title">
                      <span className="icon-badge terms">📌</span>
                      {t('package.termsAndConditions')}
                    </h3>
                    <ul className="terms-list">
                      {details.termsAndConditions.map((term, index) => (
                        <li key={index} className="section-text">{term}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {details.importantNotes && details.importantNotes.length > 0 && (
                  <div className="details-section">
                    <h3 className="details-section-title">
                      <span className="icon-badge terms">📌</span>
                      {t('package.importantNotes')}
                    </h3>
                    <ul className="terms-list">
                      {details.importantNotes.map((item, index) => (
                        <li key={index} className="section-text">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {details.paymentPolicy ? (
                  <div className="details-section">
                    <h3 className="details-section-title">
                      <span className="icon-badge terms">💳</span>
                      {t('package.payments')}
                    </h3>
                    <div className="cancellation-policy">
                      <CancellationPolicyBody policy={details.paymentPolicy} />
                    </div>
                  </div>
                ) : null}

                {/* Hotel Stay Note */}
                {details.hotelStayNote && (
                  <div className="details-section">
                    <h3 className="details-section-title">
                      <span className="icon-badge hotel-stay">🏨</span>
                      {t('package.hotelStay')}
                    </h3>
                    <div className="hotel-stay-note-box">
                      {details.hotelStayNote}
                    </div>
                  </div>
                )}

                {/* Cancellation Policy */}
                <div className="details-section">
                  <h3 className="details-section-title">
                    <span className="icon-badge cancellation">⚠️</span>
                    {t('package.cancellationPolicy')}
                  </h3>
                  {details.cancellationPolicy ? (
                    <div className="cancellation-policy">
                      <CancellationPolicyBody policy={details.cancellationPolicy} />
                    </div>
                  ) : (
                    <p className="section-text muted">
                      {t('package.cancellationPlaceholder')}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* FLIGHTS TAB */}
            {activeTab === 'flights' && (
              <section className="full-section">
                <h2>{t('package.flights')}</h2>
                {details.flights?.length ? (
                  <PackageFlightsSection details={details} />
                ) : (
                  <p className="section-text muted">
                    {t('package.flightsPlaceholder')}
                  </p>
                )}
              </section>
            )}

            {/* Related tours */}
            {relatedTours.length > 0 && (
              <section className="full-section related-section">
                <h2 className="related-section-title">{t('package.relatedTours')}</h2>
                <p className="related-section-subtitle">{t('package.moreInCategory')}</p>
                <div className="related-grid">
                  {relatedTours.map((tour) => {
                    const thumbSrc = tour.details?.thumbnailImage || tour.details?.coverImage || tour.details?.gallery?.[0] || '/images/destinations/riviera-hero.webp'
                    return (
                      <Link
                        key={tour.id}
                        to={`/packages/${tour.id}`}
                        className="related-card"
                        onClick={() => {
                          window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
                          if (document.documentElement) document.documentElement.scrollTop = 0
                          if (document.body) document.body.scrollTop = 0
                          setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }), 0)
                        }}
                      >
                        <div className="related-card-image-wrap">
                          <div
                            className="related-card-image"
                            style={{ backgroundImage: `url(${thumbSrc})` }}
                          />
                          <span className="related-card-badge">
                            {tour.priceOnRequest || tour.details?.priceOnRequest || !(tour.cheapestPrice > 0)
                              ? t('package.priceOnRequest')
                              : `${t('package.from')} €${tour.cheapestPrice.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="related-card-body">
                          <span className="related-destination">{tour.destination}</span>
                          <h3 className="related-card-title">{tour.title}</h3>
                          <p className="related-card-duration">{tour.duration}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Mobile-only sidebar cards at the end */}
            <div className="summary-card mobile-sidebar-card">
              <p className="summary-card-label">{t('package.summary')}</p>
              <p className="summary-price">{formatPackagePrice()}</p>
              <div className="summary-meta">
                <p className="summary-duration">
                  <Clock size={14} strokeWidth={2} aria-hidden />
                  {pkg.duration}
                </p>
                <p className="summary-destination">
                  <MapPin size={14} strokeWidth={2} aria-hidden />
                  {pkg.destination}
                </p>
              </div>
              {!showBookSelection ? (
                <button
                  type="button"
                  className="book-button full-book-button"
                  onClick={() => details.hotels?.length > 0 && setShowBookSelection(true)}
                >
                  {t('package.bookThisPackage')}
                </button>
              ) : (
                <div className="book-selection-form">
                  <label className="book-selection-label">{t('package.adults')}</label>
                  <div className="book-selection-controls">
                    <button type="button" className="book-selection-btn" onClick={() => setBookAdults(a => Math.max(1, a - 1))} aria-label={t('package.fewerAdults')}>−</button>
                    <span className="book-selection-value">{bookAdults}</span>
                    <button type="button" className="book-selection-btn" onClick={() => setBookAdults(a => Math.min(8, a + 1))} aria-label={t('package.moreAdults')}>+</button>
                  </div>
                  <label className="book-selection-label">{t('package.rooms')}</label>
                  <div className="book-selection-controls">
                    <button type="button" className="book-selection-btn" onClick={() => setBookRooms(r => Math.max(1, r - 1))} aria-label={t('package.fewerRooms')}>−</button>
                    <span className="book-selection-value">{bookRooms}</span>
                    <button type="button" className="book-selection-btn" onClick={() => setBookRooms(r => Math.min(5, r + 1))} aria-label={t('package.moreRooms')}>+</button>
                  </div>
                  {packageHotelOptions.length > 0 && (
                    <>
                      <label className="book-selection-label" htmlFor="book-hotel-select-mobile">{t('package.hotel')}</label>
                      <select
                        id="book-hotel-select-mobile"
                        className="book-selection-select"
                        value={bookHotelKey || packageHotelOptions[0]?.hotelKey || ''}
                        onChange={(e) => setBookHotelKey(e.target.value)}
                      >
                        {packageHotelOptions.map((opt) => (
                          <option key={opt.hotelKey} value={opt.hotelKey}>{opt.hotelName}</option>
                        ))}
                      </select>
                    </>
                  )}
                  <button
                    type="button"
                    className="reserve-now-from-summary-btn"
                    onClick={() => {
                      const key = bookHotelKey || packageHotelOptions[0]?.hotelKey
                      if (!key || !packageHotelOptions.length) return
                      const opt = packageHotelOptions.find(o => o.hotelKey === key) || packageHotelOptions[0]
                      const selectedHotel = opt.variants[0]
                      const selection = { roomType: 'double', adults: bookAdults, children: 0, children2: 0 }
                      const totalPrice = calculateRoomPrice(selectedHotel, selection)
                      setReserveFormData({
                        name: '',
                        email: '',
                        phone: '',
                        hotelKey: key,
                        hotelName: opt.hotelName,
                        departureDate: selectedHotel.departureDate || '',
                        roomType: 'double',
                        adults: bookAdults,
                        children: 0,
                        children2: 0,
                        totalPrice,
                        selectedHotel,
                        numberOfRooms: bookRooms
                      })
                      setReserveToast(null)
                      setShowReserveModal(true)
                      setShowBookSelection(false)
                    }}
                  >
                    {t('package.reserveNow')}
                  </button>
                  <button type="button" className="book-selection-cancel" onClick={() => setShowBookSelection(false)}>
                    {t('common.cancel')}
                  </button>
                </div>
              )}
            </div>

            <div className="why-card mobile-sidebar-card">
              <h3>{t('package.whyBook')}</h3>
              <ul>
                <li>{t('package.whyBookItem1')}</li>
                <li>{t('package.whyBookItem2')}</li>
                <li>{t('package.whyBookItem3')}</li>
              </ul>
            </div>

            <PackageContactCard className="mobile-sidebar-card" />
            <PackageBrochureCard
              className="mobile-sidebar-card"
              pkg={pkg}
              title={displayTitle}
              priceLabel={formatPackagePrice()}
            />
          </main>

          <aside className="layout-aside">
            <div className="summary-card">
              <p className="summary-card-label">{t('package.summary')}</p>
              <p className="summary-price">{formatPackagePrice()}</p>
              <div className="summary-meta">
                <p className="summary-duration">
                  <Clock size={14} strokeWidth={2} aria-hidden />
                  {pkg.duration}
                </p>
                <p className="summary-destination">
                  <MapPin size={14} strokeWidth={2} aria-hidden />
                  {pkg.destination}
                </p>
              </div>
              {!showBookSelection ? (
                <button
                  type="button"
                  className="book-button full-book-button"
                  onClick={() => details.hotels?.length > 0 && setShowBookSelection(true)}
                >
                  {t('package.bookThisPackage')}
                </button>
              ) : (
                <div className="book-selection-form">
                  <label className="book-selection-label">{t('package.adults')}</label>
                  <div className="book-selection-controls">
                    <button type="button" className="book-selection-btn" onClick={() => setBookAdults(a => Math.max(1, a - 1))} aria-label={t('package.fewerAdults')}>−</button>
                    <span className="book-selection-value">{bookAdults}</span>
                    <button type="button" className="book-selection-btn" onClick={() => setBookAdults(a => Math.min(8, a + 1))} aria-label={t('package.moreAdults')}>+</button>
                  </div>
                  <label className="book-selection-label">{t('package.rooms')}</label>
                  <div className="book-selection-controls">
                    <button type="button" className="book-selection-btn" onClick={() => setBookRooms(r => Math.max(1, r - 1))} aria-label={t('package.fewerRooms')}>−</button>
                    <span className="book-selection-value">{bookRooms}</span>
                    <button type="button" className="book-selection-btn" onClick={() => setBookRooms(r => Math.min(5, r + 1))} aria-label={t('package.moreRooms')}>+</button>
                  </div>
                  {packageHotelOptions.length > 0 && (
                    <>
                      <label className="book-selection-label" htmlFor="book-hotel-select">{t('package.hotel')}</label>
                      <select
                        id="book-hotel-select"
                        className="book-selection-select"
                        value={bookHotelKey || packageHotelOptions[0]?.hotelKey || ''}
                        onChange={(e) => setBookHotelKey(e.target.value)}
                      >
                        {packageHotelOptions.map((opt) => (
                          <option key={opt.hotelKey} value={opt.hotelKey}>{opt.hotelName}</option>
                        ))}
                      </select>
                    </>
                  )}
                  <button
                    type="button"
                    className="reserve-now-from-summary-btn"
                    onClick={() => {
                      const key = bookHotelKey || packageHotelOptions[0]?.hotelKey
                      if (!key || !packageHotelOptions.length) return
                      const opt = packageHotelOptions.find(o => o.hotelKey === key) || packageHotelOptions[0]
                      const selectedHotel = opt.variants[0]
                      const selection = { roomType: 'double', adults: bookAdults, children: 0, children2: 0 }
                      const totalPrice = calculateRoomPrice(selectedHotel, selection)
                      setReserveFormData({
                        name: '',
                        email: '',
                        phone: '',
                        hotelKey: key,
                        hotelName: opt.hotelName,
                        departureDate: selectedHotel.departureDate || '',
                        roomType: 'double',
                        adults: bookAdults,
                        children: 0,
                        children2: 0,
                        totalPrice,
                        selectedHotel,
                        numberOfRooms: bookRooms
                      })
                      setReserveToast(null)
                      setShowReserveModal(true)
                      setShowBookSelection(false)
                    }}
                  >
                    {t('package.reserveNow')}
                  </button>
                  <button type="button" className="book-selection-cancel" onClick={() => setShowBookSelection(false)}>
                    {t('common.cancel')}
                  </button>
                </div>
              )}
            </div>

            <div className="why-card">
              <h3>{t('package.whyBook')}</h3>
              <ul>
                <li>{t('package.whyBookItem1')}</li>
                <li>{t('package.whyBookItem2')}</li>
                <li>{t('package.whyBookItem3')}</li>
              </ul>
            </div>

            <PackageContactCard />
            <PackageBrochureCard
              pkg={pkg}
              title={displayTitle}
              priceLabel={formatPackagePrice()}
            />
          </aside>
        </div>
      </div>

      {/* Reserve Now Modal */}
      {/* Page-level toast for reserve success/error */}
      {reserveToast && (
        <div className={`reserve-toast reserve-toast-${reserveToast.type}`} role="alert">
          {reserveToast.message}
        </div>
      )}

      {showReserveModal && reserveFormData.hotelKey && (
        <div className="reserve-modal-overlay" onClick={() => setShowReserveModal(false)}>
          <div className="reserve-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowReserveModal(false)}>×</button>
            
            <div className="modal-header">
              <p className="modal-eyebrow">{t('common.brandName')}</p>
              <h2>{t('package.reservationRequest')}</h2>
              <p className="modal-subtitle">{t('package.reservationIntro')}</p>
            </div>

            {(() => {
              const selectedHotel = reserveFormData.selectedHotel
              const selection = {
                roomType: reserveFormData.roomType || 'double',
                adults: reserveFormData.adults || 1,
                children: reserveFormData.children || 0,
                children2: reserveFormData.children2 || 0
              }
              const totalPrice = reserveFormData.totalPrice || 0
              
              return (
                <>
                  <div className="reservation-summary">
                    <div className="reservation-summary-header">
                      <h3 className="summary-title">{t('package.yourSelection')}</h3>
                    </div>
                    <div className="summary-content">
                      <div className="summary-item">
                        <span className="summary-label">{t('package.packageLabel')}</span>
                        <span className="summary-value">{displayTitle}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">{t('package.hotel')}</span>
                        <span className="summary-value">{reserveFormData.hotelName}</span>
                      </div>
                      {reserveFormData.departureDate && (
                        <div className="summary-item">
                          <span className="summary-label">{t('package.departureDateLabel')}</span>
                          <span className="summary-value">{reserveFormData.departureDate}</span>
                        </div>
                      )}
                      <div className="summary-item">
                        <span className="summary-label">{t('package.roomType')}</span>
                        <span className="summary-value">
                          {selection.roomType.charAt(0).toUpperCase() + selection.roomType.slice(1)}
                          {selectedHotel && selectedHotel.prices && selectedHotel.prices[selection.roomType] && (
                            <span className="summary-value-note">
                              €{selectedHotel.prices[selection.roomType]}/{t('package.perPerson')}
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">{t('package.guests')}</span>
                        <span className="summary-value">
                          {selection.adults} {selection.adults !== 1 ? t('package.adults') : t('package.adult')}
                          {selection.children > 0 && `, ${selection.children} ${selection.children !== 1 ? t('package.children') : t('package.child')} (${t('package.child1')})`}
                          {selection.children2 > 0 && `, ${selection.children2} ${selection.children2 !== 1 ? t('package.children') : t('package.child')} (${t('package.child2')})`}
                        </span>
                      </div>
                      <div className="summary-item summary-total">
                        <span className="summary-label">{t('package.totalPrice')}</span>
                        <span className="summary-value">€{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <form 
                    className="reserve-form"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setReserveSending(true)
                      setReserveToast(null)
                      const peopleStr = `${selection.adults} ${selection.adults !== 1 ? t('package.adults') : t('package.adult')}${selection.children > 0 ? `, ${selection.children} ${selection.children !== 1 ? t('package.children') : t('package.child')} (${t('package.child1')})` : ''}${selection.children2 > 0 ? `, ${selection.children2} ${selection.children2 !== 1 ? t('package.children') : t('package.child')} (${t('package.child2')})` : ''}`
                      const emailBody = `
RESERVATION REQUEST

Package: ${displayTitle}
Hotel: ${reserveFormData.hotelName}
${reserveFormData.departureDate ? `Departure Date: ${reserveFormData.departureDate}\n` : ''}Room Type: ${selection.roomType.charAt(0).toUpperCase() + selection.roomType.slice(1)}
Guests: ${peopleStr}
Total Price: €${totalPrice.toLocaleString()}

Contact Information:
Name: ${reserveFormData.name || 'Not provided'}
Email: ${reserveFormData.email}
Phone: ${reserveFormData.phone}

---
This reservation request was submitted through the Honeywell Travel website.
                      `.trim()

                      const result = await submitWebsiteForm({
                        formType: FORM_TYPES.PACKAGE,
                        name: reserveFormData.name || 'Guest',
                        email: reserveFormData.email,
                        phone: reserveFormData.phone || '',
                        destination: displayTitle || '',
                        travelDates: reserveFormData.departureDate || '',
                        passengers: peopleStr,
                        message: emailBody,
                        honeypot: reserveHoneypot,
                        extraFields: {
                          Hotel: reserveFormData.hotelName,
                          'Room type': selection.roomType,
                          'Total price': `€${totalPrice.toLocaleString()}`,
                        },
                        leadData: {
                          full_name: reserveFormData.name || '',
                          phone: reserveFormData.phone || '',
                          email: reserveFormData.email || '',
                          destination: displayTitle || '',
                          travel_dates: reserveFormData.departureDate || '',
                          number_of_travelers: peopleStr,
                          budget: String(totalPrice || ''),
                          message: emailBody,
                          source: 'Package Form',
                        },
                      })

                      if (result.ok) {
                        setReserveToast({ type: 'success', message: result.message })
                        setShowReserveModal(false)
                        setReserveHoneypot('')
                        setReserveFormData({
                          name: '',
                          email: '',
                          phone: '',
                          hotelKey: null,
                          hotelName: '',
                          departureDate: '',
                          roomType: '',
                          adults: 1,
                          children: 0,
                          children2: 0,
                          totalPrice: 0,
                          selectedHotel: null
                        })
                      } else {
                        setReserveToast({
                          type: 'error',
                          message: result.error || FORM_ERROR_MESSAGE,
                        })
                      }
                      setReserveSending(false)
                    }}
                  >
                    <HoneypotField value={reserveHoneypot} onChange={(e) => setReserveHoneypot(e.target.value)} />
                    <div className="form-group">
                      <label htmlFor="reserve-name">{t('package.fullName')}</label>
                      <input
                        type="text"
                        id="reserve-name"
                        required
                        value={reserveFormData.name || ''}
                        onChange={(e) => setReserveFormData({ ...reserveFormData, name: e.target.value })}
                        placeholder={t('package.namePlaceholder')}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="reserve-phone">{t('package.contactNumber')}</label>
                      <input
                        type="tel"
                        id="reserve-phone"
                        required
                        value={reserveFormData.phone}
                        onChange={(e) => setReserveFormData({ ...reserveFormData, phone: e.target.value })}
                        placeholder={t('forms.phonePlaceholder')}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="reserve-email">{t('package.emailAddress')}</label>
                      <input
                        type="email"
                        id="reserve-email"
                        required
                        value={reserveFormData.email}
                        onChange={(e) => setReserveFormData({ ...reserveFormData, email: e.target.value })}
                        placeholder={t('forms.emailPlaceholder')}
                      />
                    </div>

                    <button type="submit" className="submit-reservation-btn" disabled={reserveSending}>
                      {reserveSending ? t('common.sending') : t('package.sendReservation')}
                    </button>
                  </form>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default PackageFullDetail


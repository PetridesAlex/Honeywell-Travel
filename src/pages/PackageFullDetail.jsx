import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getPackageById, travelPackages } from '../data/packages'
import { getTranslatedPackageTitle } from '../utils/packageTranslations'
import { EMAIL_TEMPLATES, sendEmail } from '../lib/emailService'
import SEO from '../components/SEO'
import './PackageFullDetail.css'

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

const getDepartureDates = (details) => {
  const rawDates = [
    ...(Array.isArray(details.departureDates) ? details.departureDates : []),
    ...(Array.isArray(details.hotels)
      ? details.hotels.map((hotel) => hotel?.departureDate).filter(Boolean)
      : []),
    ...(Array.isArray(details.flights)
      ? details.flights.map((flight) => flight?.date).filter(Boolean)
      : []),
  ]

  const normalized = new Map()
  rawDates.forEach((value) => {
    const parts = String(value)
      .split(/[,\n;]+/)
      .map((part) => part.trim())
      .filter(Boolean)

    parts.forEach((date) => {
      if (!date || date === '—' || date === '-') return
      const key = date.toLowerCase()
      if (!normalized.has(key)) normalized.set(key, date)
    })
  })

  return [...normalized.values()]
}

const PackageFlightsSection = ({ details }) => {
  if (!details.flights?.length) return null
  const departureDates = getDepartureDates(details)
  return (
    <div className="details-section">
      <h3 className="details-section-title details-section-title-flights">
        {getAirlineLogo(details.airline) ? (
          <img src={getAirlineLogo(details.airline)} alt="" className="airline-logo" />
        ) : (
          <span className="icon-badge flights">✈️</span>
        )}
        Flights — {details.airline || 'Sky Express'}
      </h3>
      {departureDates.length > 0 && (
        <div className="flights-departures" aria-label="Package departure dates">
          <p className="flights-departures__label">Departure Dates</p>
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
        {details.flights.map((flight, index) => (
          <div key={index} className="flight-card">
            <div className="flight-header">
              <span className="flight-direction">
                {flight.direction === 'Departure' ? '🛫 Departure' : '🛬 Return'}
              </span>
            </div>
            <div className="flight-details">
              <div className="flight-route">
                <strong>{flight.route || `${flight.direction}`}</strong>
              </div>
              <div className="flight-info">
                <div className="flight-info-row">
                  <span className="flight-label">Flight:</span>
                  <span className="flight-value">{flight.flight}</span>
                </div>
                <div className="flight-info-row">
                  <span className="flight-label">Time:</span>
                  <span className="flight-value">{flight.time}</span>
                </div>
                <div className="flight-info-row">
                  <span className="flight-label">Luggage:</span>
                  <span className="flight-value">{flight.luggage}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
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

function PackageFullDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const pkg = getPackageById(id)
  const translatedTitle = pkg ? getTranslatedPackageTitle(pkg.id, pkg.title, i18n) : ''
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBookHotelKey('')
  }, [id])

  useEffect(() => {
    if (!reserveToast) return
    const t = setTimeout(() => setReserveToast(null), 5000)
    return () => clearTimeout(t)
  }, [reserveToast])

  if (!pkg) {
    return (
      <div className="package-full-page">
        <div className="package-full-container">
          <h1>Package Not Found</h1>
          <Link to="/packages" className="back-link">Back to packages</Link>
        </div>
      </div>
    )
  }

      const details = pkg.details || {}
      const gallery = details.gallery || []

      // From price = lowest double room price per person across all hotels
      const getCheapestPrice = (pkg) => {
        if (pkg.details && pkg.details.hotels && pkg.details.hotels.length > 0) {
          let lowestDouble = Infinity
          pkg.details.hotels.forEach(hotel => {
            if (hotel.prices && hotel.prices.double != null && hotel.prices.double > 0 && hotel.prices.double < lowestDouble) {
              lowestDouble = hotel.prices.double
            }
          })
          return lowestDouble !== Infinity ? lowestDouble : pkg.price
        }
        return pkg.price
      }

      const relatedTours = travelPackages.filter(
        (p) => !p.hidden && p.category === pkg.category && p.id !== pkg.id
      ).slice(0, 3).map(tour => ({
        ...tour,
        cheapestPrice: getCheapestPrice(tour)
      }))

      // Unique hotel options for "Book this package" (same grouping as hotels grid)
      const packageHotelOptions = details.hotels && details.hotels.length > 0
        ? (() => {
            const grouped = {}
            details.hotels.forEach((h, idx) => {
              if (!grouped[h.name]) grouped[h.name] = []
              grouped[h.name].push({ ...h, originalIndex: idx })
            })
            return Object.entries(grouped).map(([hotelName, variants], i) => ({
              hotelKey: `hotel-${i}`,
              hotelName: hotelName || variants[0]?.location || 'Package',
              variants
            }))
          })()
        : []

  // Calculate price for a single room based on selection
  const calculateRoomPrice = (hotel, selection) => {
    let total = 0
    
    // Calculate adult pricing
    if (selection.roomType === 'single' && hotel.prices.single) {
      total = hotel.prices.single * selection.adults
    } else if (selection.roomType === 'double' && hotel.prices.double) {
      total = hotel.prices.double * selection.adults
    } else if (selection.roomType === 'triple' && hotel.prices.triple) {
      total = hotel.prices.triple * Math.min(selection.adults, 3)
      if (selection.adults > 3) {
        const extraAdults = selection.adults - 3
        total += hotel.prices.double * extraAdults
      }
    } else if (hotel.prices.double) {
      total = hotel.prices.double * selection.adults
    }
    
    // Add children pricing
    if (selection.children > 0 && hotel.prices.child1) {
      total += hotel.prices.child1 * Math.min(selection.children, 1)
    }
    if (selection.children2 > 0 && hotel.prices.child2) {
      total += hotel.prices.child2 * selection.children2
    }
    
    return total || 0
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
  const packageDescription = pkg.longDescription || pkg.description || `Book ${translatedTitle} - ${pkg.duration} from €${getCheapestPrice(pkg).toLocaleString()}. Complete travel package details including hotels, itinerary, and pricing.`

  return (
    <div className="package-full-page">
      <SEO 
        title={`${translatedTitle} - Complete Package Details | Honeywell Travel`}
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
          aria-hidden="true"
        />
        <div className="package-full-hero-overlay" aria-hidden="true" />
        <div className="package-full-hero-content">
          <h1>
            {translatedTitle}
            {pkg.supplier ? (
              <span className="hero-supplier-badge">
                {pkg.supplier}
              </span>
            ) : null}
          </h1>
          <div className="hero-meta">
            <span className={`hero-package-type ${(pkg.packageType || 'individual').toLowerCase()}`}>
              {(pkg.packageType || 'individual').toLowerCase() === 'group' ? 'Group' : 'Individual'}
            </span>
            {pkg.supplier ? (
              <span className="hero-meta-supplier">
                {pkg.supplier}
              </span>
            ) : null}
            <span>⏱️ {pkg.duration}</span>
            <span>From €{getCheapestPrice(pkg).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="package-full-container">
        <button
          type="button"
          className="back-link"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1)
            } else {
              navigate('/packages')
            }
          }}
        >
          {t('package.backToOverview')}
        </button>

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
                Flights
              </button>
            </div>

            {/* PRICE TAB */}
            {activeTab === 'price' && (
              <section className="full-section">
                <h2>{t('package.pricesAndAccommodation')}</h2>
                <div className="price-header">
                  <div className="price-thumb">
                    {(details.thumbnailImage || details.coverImage || gallery[0]) ? (
                      <img
                        src={details.thumbnailImage || details.coverImage || gallery[0]}
                        alt=""
                        className="price-thumb-img"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="price-thumb-placeholder">{pkg.image}</span>
                    )}
                  </div>
                  <div className="price-intro">
                    {details.program?.introduction ? (
                      (() => {
                        const introText = details.program.introduction
                        const paragraphs = introText.split(/\n\n+/).filter(p => p.trim())
                        // In price header show only descriptive intro; exclude departures and flights lines (they stay in Program tab)
                        const priceIntroParas = paragraphs.filter(
                          p => !p.trim().startsWith('ΑΝΑΧΩΡΗΣΕΙΣ') && !p.trim().startsWith('Πτήσεις')
                        )
                        const lineClass = (raw, index) => {
                          const t = raw.trim()
                          const parts = ['section-text', 'price-intro-line']
                          if (index === 0) parts.push('price-intro-line--title')
                          else if (t.startsWith('Διανυκτερεύσεις')) parts.push('price-intro-line--stays')
                          else if (t.startsWith('Αναχωρήσεις')) parts.push('price-intro-line--departures')
                          else if (t.startsWith('Δωμάτιο')) parts.push('price-intro-line--room')
                          else if (t.startsWith('Τιμές') || t.includes('€')) parts.push('price-intro-line--pricing')
                          else if (t.startsWith('ΞΕΝΟΔΟΧΕΙΑ')) parts.push('price-intro-line--hotels')
                          return parts.join(' ')
                        }
                        return priceIntroParas.length > 0 ? (
                          priceIntroParas.map((para, idx) => (
                            <p key={idx} className={lineClass(para, idx)}>{para.trim()}</p>
                          ))
                        ) : (
                          <p className="section-text price-intro-line price-intro-line--title">{introText.trim()}</p>
                        )
                      })()
                    ) : null}
                  </div>
                </div>

                <PackageFlightsSection details={details} />

                {details.hotels && details.hotels.length > 0 ? (
                  <>
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
                      const groupEntries = Object.entries(groupedHotels)

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
                        // Create a unique key for this hotel group
                        const hotelKey = `hotel-${groupIndex}`
                        const currentSelection = hotelSelections[hotelKey] || { 
                          roomType: 'double', 
                          adults: 2, 
                          children: 0, 
                          children2: 0,
                          selectedDateIndex: 0
                        }
                        
                        // Same layout for all hotel cards: left = hotel info, right = one variant block per departure
                        return (
                            <div key={hotelKey} className="hotel-single-layout">
                              <div className="hotel-single-left">
                                <div className="hotel-image-top hotel-image-single">
                                  {baseHotel.image ? (
                                    <div className="hotel-image-bg" style={{ backgroundImage: `url("${baseHotel.image}")` }} />
                                  ) : (
                                    <div className="hotel-image-placeholder"><span className="image-text">INSERT IMAGE HERE</span></div>
                                  )}
                                  <div className="hotel-stars-overlay">
                                    {'★'.repeat(baseHotel.stars || 3)}{'☆'.repeat(5 - (baseHotel.stars || 3))}
                                  </div>
                                </div>
                                {baseHotel.name ? <h3 className="hotel-single-title">{baseHotel.name}</h3> : null}
                                {baseHotel.location && <p className="hotel-single-location">{baseHotel.location}</p>}
                                <div className="hotel-single-guests">
                                  <label className="section-label">{t('package.guests')}</label>
                                  <div className="guest-selector-vertical">
                                    <span className="guest-type">{t('package.adults')}:</span>
                                    <div className="guest-controls-vertical">
                                      <button type="button" className="guest-btn-vertical" onClick={() => currentSelection.adults > 1 && updateHotelSelection(hotelKey, 'adults', currentSelection.adults - 1)} disabled={currentSelection.adults <= 1} aria-label="Decrease adults">−</button>
                                      <span className="guest-count-vertical">{currentSelection.adults}</span>
                                      <button type="button" className="guest-btn-vertical" onClick={() => currentSelection.adults < 8 && updateHotelSelection(hotelKey, 'adults', currentSelection.adults + 1)}>+</button>
                                    </div>
                                  </div>
                                  {(hotelVariants[0]?.prices?.child1 != null) && (
                                    <div className="guest-selector-vertical">
                                      <span className="guest-type">{t('package.child1')}:</span>
                                      <div className="guest-controls-vertical">
                                        <button type="button" className="guest-btn-vertical" onClick={() => currentSelection.children > 0 && updateHotelSelection(hotelKey, 'children', currentSelection.children - 1)} disabled={currentSelection.children <= 0}>−</button>
                                        <span className="guest-count-vertical">{currentSelection.children}</span>
                                        <button type="button" className="guest-btn-vertical" onClick={() => updateHotelSelection(hotelKey, 'children', currentSelection.children + 1)}>+</button>
                                      </div>
                                    </div>
                                  )}
                                  {(hotelVariants[0]?.prices?.child2 != null) && (
                                    <div className="guest-selector-vertical">
                                      <span className="guest-type">{t('package.child2')}:</span>
                                      <div className="guest-controls-vertical">
                                        <button type="button" className="guest-btn-vertical" onClick={() => currentSelection.children2 > 0 && updateHotelSelection(hotelKey, 'children2', currentSelection.children2 - 1)} disabled={currentSelection.children2 <= 0}>−</button>
                                        <span className="guest-count-vertical">{currentSelection.children2}</span>
                                        <button type="button" className="guest-btn-vertical" onClick={() => currentSelection.children2 < 4 && updateHotelSelection(hotelKey, 'children2', currentSelection.children2 + 1)}>+</button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="hotel-single-right">
                                {pkg.id === 201 && groupIndex > 0 ? (
                                  // For the Scandinavia Mary Special trip, hide prices for the 2nd/3rd hotels
                                  <div className="hotel-variant-block">
                                    <p className="section-text hotel-included-note">
                                      Included in the package price.
                                    </p>
                                  </div>
                                ) : (
                                  uniqueHotelVariants.map((variant, variantIdx) => {
                                    // Each variant has completely independent selection
                                    const variantKey = `${hotelKey}-variant-${variantIdx}`
                                    const variantSelectionData = hotelSelections[variantKey]
                                    // Only use stored selection if it exists, otherwise no selection (for display)
                                    const variantSelection = variantSelectionData || {
                                      roomType: null, // null means no selection yet
                                      adults: 2,
                                      children: 0,
                                      children2: 0
                                    }
                                    // For price calculation, default to 'double' if no selection
                                    const selectionForPrice = variantSelectionData || {
                                      roomType: 'double',
                                      adults: 2,
                                      children: 0,
                                      children2: 0
                                    }
                                    const variantTotal = calculateRoomPrice(variant, selectionForPrice)
                                    return (
                                      <div key={variantIdx} className="hotel-variant-block">
                                        <div className="hotel-variant-date-badge">
                                          <span className="hotel-variant-date-label">{t('package.departureDate')}</span>
                                          <span className="hotel-variant-date-value">{variant.departureDate}</span>
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
                                                  if (variant.prices?.double != null) {
                                                    // Update only this specific variant's selection
                                                    const currentAdults = variantSelection.adults || 2
                                                    const newAdults = currentAdults < 2 ? 2 : currentAdults
                                                    setHotelSelections(prev => ({
                                                      ...prev,
                                                      [variantKey]: {
                                                        roomType: 'double',
                                                        adults: newAdults,
                                                        children: variantSelection.children || 0,
                                                        children2: variantSelection.children2 || 0
                                                      }
                                                    }))
                                                  }
                                                }}
                                                disabled={variant.prices?.double == null}
                                                title="Click to select Double room (2 adults)"
                                              >
                                                <span className="hotel-variant-price-label">{t('package.double')}</span>
                                                <span className="hotel-variant-price-value">{variant.prices?.double != null ? `€${variant.prices.double}` : '–'}</span>
                                              </button>
                                              <button
                                                type="button"
                                                className={`hotel-variant-price-cell ${variantSelection.roomType === 'single' ? 'selected' : ''}`}
                                                onClick={() => {
                                                  if (variant.prices?.single != null) {
                                                    // Update only this specific variant's selection
                                                    setHotelSelections(prev => ({
                                                      ...prev,
                                                      [variantKey]: {
                                                        roomType: 'single',
                                                        adults: 1,
                                                        children: variantSelection.children || 0,
                                                        children2: variantSelection.children2 || 0
                                                      }
                                                    }))
                                                  }
                                                }}
                                                disabled={variant.prices?.single == null}
                                                title="Click to select Single room (1 adult)"
                                              >
                                                <span className="hotel-variant-price-label">{t('package.single')}</span>
                                                <span className="hotel-variant-price-value">{variant.prices?.single != null ? `€${variant.prices.single}` : '–'}</span>
                                              </button>
                                              {variant.prices?.triple != null && (
                                                <button
                                                  type="button"
                                                  className={`hotel-variant-price-cell ${variantSelection.roomType === 'triple' ? 'selected' : ''}`}
                                                  onClick={() => {
                                                    setHotelSelections(prev => ({
                                                      ...prev,
                                                      [variantKey]: {
                                                        roomType: 'triple',
                                                        adults: Math.max(variantSelection.adults || 2, 3),
                                                        children: variantSelection.children || 0,
                                                        children2: variantSelection.children2 || 0
                                                      }
                                                    }))
                                                  }}
                                                  title="Click to select Triple room (3 adults)"
                                                >
                                                  <span className="hotel-variant-price-label">{t('package.triple')}</span>
                                                  <span className="hotel-variant-price-value">€{variant.prices.triple}</span>
                                                </button>
                                              )}
                                              {variant.prices?.child1 != null && (
                                                <div className="hotel-variant-price-cell">
                                                  <span className="hotel-variant-price-label">{t('package.child1')}</span>
                                                  <span className="hotel-variant-price-value">€{variant.prices.child1}</span>
                                                </div>
                                              )}
                                              {variant.prices?.child2 != null && (
                                                <div className="hotel-variant-price-cell">
                                                  <span className="hotel-variant-price-label">{t('package.child2')}</span>
                                                  <span className="hotel-variant-price-value">€{variant.prices.child2}</span>
                                                </div>
                                              )}
                                            </div>
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
                    Add room types and rates for this package in the data file.
                  </p>
                )}

                {details.cancellationPolicy ? (
                  <div className="details-section price-tab-cancellation-wrap">
                    <h3 className="details-section-title">
                      <span className="icon-badge cancellation">⚠️</span>
                      Cancellation Policy
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
                {details.note && (
                  <div style={{ 
                    padding: '1rem 1.25rem', 
                    marginBottom: '2rem', 
                    background: '#fef3c7', 
                    borderLeft: '4px solid #f59e0b', 
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    color: '#92400e',
                    lineHeight: '1.6'
                  }}>
                    <strong>ℹ️ {t('package.note')}:</strong> {details.note}
                  </div>
                )}
                
                {details.itinerary && details.itinerary.length > 0 ? (
                  <div className="program-content">
                    <ol className="itinerary-list">
                      {details.itinerary.map((day, index) => (
                        <li key={index} className="itinerary-item">
                          <div className="itinerary-header">
                            <span className="itinerary-day">{day.day}</span>
                            <h3 className="itinerary-title">{day.title}</h3>
                          </div>
                          <p className="itinerary-description">{day.description}</p>
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
                      // Check if first paragraph is a title (contains dashes and is short)
                      const firstPara = paragraphs[0]?.trim()
                      const isTitle = firstPara && firstPara.length < 100 && (firstPara.includes('–') || firstPara.includes('-'))
                      
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
                                  <p key={idx} className="section-text">
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
                                  <p key={idx} className="section-text">
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
                            return (
                              <li key={key} className="itinerary-item">
                                <div className="itinerary-header">
                                  <span className="itinerary-day">{dayNum}η Μέρα</span>
                                  <h3 className="itinerary-title">{title || `${dayNum}η Μέρα`}</h3>
                                </div>
                                <p className="itinerary-description" style={description.includes('\n\n') ? { whiteSpace: 'pre-line' } : undefined}>
                                  {description}
                                </p>
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
                            <p key={idx} className="section-text">{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.venetians && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Οι Ενετοί στον μόλο</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.venetians).map((para, idx) => (
                            <p key={idx} className="section-text">{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.walls && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Τα τείχη της παλιάς πόλης: μεταίχμιο του σήμερα και του χθες</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.walls).map((para, idx) => (
                            <p key={idx} className="section-text">{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.knossos && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Η «μυθική» Κνωσός</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.knossos).map((para, idx) => (
                            <p key={idx} className="section-text">{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.museum && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Αρχαιολογικό Μουσείο Ηρακλείου: «πανόραμα» Μινωικής Κρήτης</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.museum).map((para, idx) => (
                            <p key={idx} className="section-text">{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.cretaquarium && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Cretaquarium: υδάτινη κιβωτός της Μεσογείου</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.cretaquarium).map((para, idx) => (
                            <p key={idx} className="section-text">{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.food && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Πανδαισία γεύσεων και απολαύσεων</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.food).map((para, idx) => (
                            <p key={idx} className="section-text">{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.accommodation && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Αναρίθμητες επιλογές διαμονής</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.accommodation).map((para, idx) => (
                            <p key={idx} className="section-text">{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.beaches && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Παραλίες με χαρακτήρα και ομορφιά</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.beaches).map((para, idx) => (
                            <p key={idx} className="section-text">{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.naturalHistory && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Το Μουσείο Φυσικής Ιστορίας: πλούσιο, δραστήριο, διασκεδαστικό</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.naturalHistory).map((para, idx) => (
                            <p key={idx} className="section-text">{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.historicalMuseum && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Ιστορικό Μουσείο Κρήτης: η Κρήτη της ιστορίας</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.historicalMuseum).map((para, idx) => (
                            <p key={idx} className="section-text">{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.program.cityCenter && (
                      <div className="program-section program-section-styled">
                        <h3 className="program-heading">Στην καρδιά της πόλης</h3>
                        <div className="program-text">
                          {formatProgramText(details.program.cityCenter).map((para, idx) => (
                            <p key={idx} className="section-text">{para}</p>
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
                              <p key={idx} className="section-text">{para}</p>
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
                              <p key={idx} className="section-text">{para}</p>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  <p className="section-text muted">
                    Program information will be available here.
                  </p>
                )}
              </section>
            )}

            {/* PACKAGE DETAILS TAB */}
            {activeTab === 'details' && (
              <section className="full-section">
                <h2>Package Details</h2>

                {/* What's Included */}
                <div className="details-section">
                  <h3 className="details-section-title">
                    <span className="icon-badge included">✓</span>
                    What's Included
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
                      Add all services that are included in this package (flights, hotel, transfers, etc.).
                    </p>
                  )}
                </div>

                {/* What's Not Included */}
                <div className="details-section">
                  <h3 className="details-section-title">
                    <span className="icon-badge not-included">✕</span>
                    What's Not Included
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
                      Add here what is not included (city tax, meals, insurance, optional excursions, etc.).
                    </p>
                  )}
                </div>

                {/* Flights */}
                <PackageFlightsSection details={details} />

                {/* Terms & Conditions */}
                {details.termsAndConditions && details.termsAndConditions.length > 0 && (
                  <div className="details-section">
                    <h3 className="details-section-title">
                      <span className="icon-badge terms">📌</span>
                      Terms & Conditions
                    </h3>
                    <ul className="terms-list">
                      {details.termsAndConditions.map((term, index) => (
                        <li key={index} className="section-text">{term}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Hotel Stay Note */}
                {details.hotelStayNote && (
                  <div className="details-section">
                    <h3 className="details-section-title">
                      <span className="icon-badge hotel-stay">🏨</span>
                      Hotel Stay
                    </h3>
                    <div style={{ 
                      padding: '1.25rem 1.5rem', 
                      marginTop: '0.5rem',
                      background: '#eff6ff', 
                      border: '1px solid #bfdbfe', 
                      borderLeft: '4px solid #3b82f6', 
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      color: '#1e40af',
                      lineHeight: '1.8',
                      whiteSpace: 'pre-line'
                    }}>
                      {details.hotelStayNote}
                    </div>
                  </div>
                )}

                {/* Cancellation Policy */}
                <div className="details-section">
                  <h3 className="details-section-title">
                    <span className="icon-badge cancellation">⚠️</span>
                    Cancellation Policy
                  </h3>
                  {details.cancellationPolicy ? (
                    <div className="cancellation-policy">
                      <CancellationPolicyBody policy={details.cancellationPolicy} />
                    </div>
                  ) : (
                    <p className="section-text muted">
                      Add the cancellation policy here (deadlines, fees, and special conditions).
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* FLIGHTS TAB */}
            {activeTab === 'flights' && (
              <section className="full-section">
                <h2>Flights</h2>
                {details.flights?.length ? (
                  <PackageFlightsSection details={details} />
                ) : (
                  <p className="section-text muted">
                    Flight information will be available here.
                  </p>
                )}
              </section>
            )}

            {/* Related tours */}
            {relatedTours.length > 0 && (
              <section className="full-section related-section">
                <h2 className="related-section-title">Related Tours</h2>
                <p className="related-section-subtitle">More packages in the same category</p>
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
                          <span className="related-card-badge">From €{tour.cheapestPrice.toLocaleString()}</span>
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
              <h3>Summary</h3>
              <p className="summary-price">From €{getCheapestPrice(pkg).toLocaleString()}</p>
              <p className="summary-duration">{pkg.duration}</p>
              <p className="summary-destination">{pkg.destination}</p>
              {!showBookSelection ? (
                <button
                  type="button"
                  className="book-button full-book-button"
                  onClick={() => details.hotels?.length > 0 && setShowBookSelection(true)}
                >
                  Book this package
                </button>
              ) : (
                <div className="book-selection-form">
                  <label className="book-selection-label">Adults</label>
                  <div className="book-selection-controls">
                    <button type="button" className="book-selection-btn" onClick={() => setBookAdults(a => Math.max(1, a - 1))} aria-label="Fewer adults">−</button>
                    <span className="book-selection-value">{bookAdults}</span>
                    <button type="button" className="book-selection-btn" onClick={() => setBookAdults(a => Math.min(8, a + 1))} aria-label="More adults">+</button>
                  </div>
                  <label className="book-selection-label">Rooms</label>
                  <div className="book-selection-controls">
                    <button type="button" className="book-selection-btn" onClick={() => setBookRooms(r => Math.max(1, r - 1))} aria-label="Fewer rooms">−</button>
                    <span className="book-selection-value">{bookRooms}</span>
                    <button type="button" className="book-selection-btn" onClick={() => setBookRooms(r => Math.min(5, r + 1))} aria-label="More rooms">+</button>
                  </div>
                  {packageHotelOptions.length > 0 && (
                    <>
                      <label className="book-selection-label" htmlFor="book-hotel-select-mobile">Hotel</label>
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
                    Reserve now
                  </button>
                  <button type="button" className="book-selection-cancel" onClick={() => setShowBookSelection(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="why-card mobile-sidebar-card">
              <h3>Why book with us</h3>
              <ul>
                <li>Local Cyprus travel experts</li>
                <li>Tailor‑made packages for every budget</li>
                <li>Support before, during & after your trip</li>
              </ul>
            </div>

            <div className="contact-card mobile-sidebar-card">
              <h3>Need help?</h3>
              <p className="contact-phone">📞 +357 77771234</p>
              <p className="contact-email">✉️ info@honeywelltravel.com</p>
            </div>
          </main>

          <aside className="layout-aside">
            <div className="summary-card">
              <h3>Summary</h3>
              <p className="summary-price">From €{getCheapestPrice(pkg).toLocaleString()}</p>
              <p className="summary-duration">{pkg.duration}</p>
              <p className="summary-destination">{pkg.destination}</p>
              {!showBookSelection ? (
                <button
                  type="button"
                  className="book-button full-book-button"
                  onClick={() => details.hotels?.length > 0 && setShowBookSelection(true)}
                >
                  Book this package
                </button>
              ) : (
                <div className="book-selection-form">
                  <label className="book-selection-label">Adults</label>
                  <div className="book-selection-controls">
                    <button type="button" className="book-selection-btn" onClick={() => setBookAdults(a => Math.max(1, a - 1))} aria-label="Fewer adults">−</button>
                    <span className="book-selection-value">{bookAdults}</span>
                    <button type="button" className="book-selection-btn" onClick={() => setBookAdults(a => Math.min(8, a + 1))} aria-label="More adults">+</button>
                  </div>
                  <label className="book-selection-label">Rooms</label>
                  <div className="book-selection-controls">
                    <button type="button" className="book-selection-btn" onClick={() => setBookRooms(r => Math.max(1, r - 1))} aria-label="Fewer rooms">−</button>
                    <span className="book-selection-value">{bookRooms}</span>
                    <button type="button" className="book-selection-btn" onClick={() => setBookRooms(r => Math.min(5, r + 1))} aria-label="More rooms">+</button>
                  </div>
                  {packageHotelOptions.length > 0 && (
                    <>
                      <label className="book-selection-label" htmlFor="book-hotel-select">Hotel</label>
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
                    Reserve now
                  </button>
                  <button type="button" className="book-selection-cancel" onClick={() => setShowBookSelection(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="why-card">
              <h3>Why book with us</h3>
              <ul>
                <li>Local Cyprus travel experts</li>
                <li>Tailor‑made packages for every budget</li>
                <li>Support before, during & after your trip</li>
              </ul>
            </div>

            <div className="contact-card">
              <h3>Need help?</h3>
              <p className="contact-phone">📞 +357 77771234</p>
              <p className="contact-email">✉️ info@honeywelltravel.com</p>
            </div>
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
              <h2>Reservation Request</h2>
              <p className="modal-subtitle">Please provide your contact information to complete your reservation</p>
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
                    <h3 className="summary-title">Your Selection</h3>
                    <div className="summary-content">
                      <div className="summary-item">
                        <span className="summary-label">Package</span>
                        <span className="summary-value">{pkg.title}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Hotel</span>
                        <span className="summary-value">{reserveFormData.hotelName}</span>
                      </div>
                      {reserveFormData.departureDate && (
                        <div className="summary-item">
                          <span className="summary-label">Departure Date</span>
                          <span className="summary-value">{reserveFormData.departureDate}</span>
                        </div>
                      )}
                      <div className="summary-item">
                        <span className="summary-label">Room Type</span>
                        <span className="summary-value">
                          {selection.roomType.charAt(0).toUpperCase() + selection.roomType.slice(1)}
                          {selectedHotel && selectedHotel.prices && selectedHotel.prices[selection.roomType] && (
                            <span style={{ fontSize: '0.85rem', color: '#6b7280', marginLeft: '0.5rem', fontWeight: '400' }}>
                              (€{selectedHotel.prices[selection.roomType]}/person)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Guests</span>
                        <span className="summary-value">
                          {selection.adults} Adult{selection.adults !== 1 ? 's' : ''}
                          {selection.children > 0 && `, ${selection.children} Child${selection.children !== 1 ? 'ren' : ''} (Child 1)`}
                          {selection.children2 > 0 && `, ${selection.children2} Child${selection.children2 !== 1 ? 'ren' : ''} (Child 2)`}
                        </span>
                      </div>
                      <div className="summary-item summary-total">
                        <span className="summary-label">Total Price</span>
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
                      const peopleStr = `${selection.adults} Adult${selection.adults !== 1 ? 's' : ''}${selection.children > 0 ? `, ${selection.children} Child${selection.children !== 1 ? 'ren' : ''} (Child 1)` : ''}${selection.children2 > 0 ? `, ${selection.children2} Child${selection.children2 !== 1 ? 'ren' : ''} (Child 2)` : ''}`
                      const emailBody = `
RESERVATION REQUEST

Package: ${pkg.title}
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

                      const templateParams = {
                        name: reserveFormData.name || '',
                        email: reserveFormData.email,
                        phone: reserveFormData.phone,
                        message: emailBody,
                        company: '',
                        country: '',
                        travel_dates: reserveFormData.departureDate || '',
                        group_size: peopleStr
                      }

                      try {
                        await sendEmail(EMAIL_TEMPLATES.PACKAGE, templateParams)
                        setReserveToast({ type: 'success', message: 'Request sent successfully ✅' })
                        setShowReserveModal(false)
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
                      } catch (err) {
                        console.error('Reservation request email failed:', err)
                        setReserveToast({
                          type: 'error',
                          message: 'Failed to send. Please try again.'
                        })
                      } finally {
                        setReserveSending(false)
                      }
                    }}
                  >
                    <div className="form-group">
                      <label htmlFor="reserve-name">Full Name</label>
                      <input
                        type="text"
                        id="reserve-name"
                        required
                        value={reserveFormData.name || ''}
                        onChange={(e) => setReserveFormData({ ...reserveFormData, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="reserve-phone">Contact Number</label>
                      <input
                        type="tel"
                        id="reserve-phone"
                        required
                        value={reserveFormData.phone}
                        onChange={(e) => setReserveFormData({ ...reserveFormData, phone: e.target.value })}
                        placeholder="+357 123456789"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="reserve-email">Email Address</label>
                      <input
                        type="email"
                        id="reserve-email"
                        required
                        value={reserveFormData.email}
                        onChange={(e) => setReserveFormData({ ...reserveFormData, email: e.target.value })}
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <button type="submit" className="submit-reservation-btn" disabled={reserveSending}>
                      {reserveSending ? 'Sending…' : 'Send Reservation Request'}
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


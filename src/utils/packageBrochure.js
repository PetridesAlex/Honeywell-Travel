import { packageCardImageUrl } from './packageCardImage'
import { getPackageDepartureDatesFromPkg } from './packageDepartureDates'
import { getPackageLeadPrice } from './packageLeadPrice'

const CONTACT_PHONE = '+357 77771234'
const CONTACT_EMAIL = 'info@honeywelltravel.com'
const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = 1123
const FONT_STACK = 'Arial, Helvetica, "Segoe UI", sans-serif'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function absoluteAssetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path) || String(path).startsWith('data:')) return path
  if (typeof window === 'undefined') return path
  try {
    return new URL(path, window.location.origin).href
  } catch {
    return path
  }
}

async function toDataUrl(url) {
  if (!url || String(url).startsWith('data:')) return url || ''
  try {
    const response = await fetch(url, { mode: 'cors' })
    if (!response.ok) return url
    const blob = await response.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return url
  }
}

function formatMoney(amount) {
  const n = Number(amount)
  if (!Number.isFinite(n) || n <= 0) return null
  return `€${n.toLocaleString('de-DE')}`
}

function slugifyFilename(title, id) {
  const base = String(title || `package-${id || 'brochure'}`)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return `Honeywell-Travel-${base || 'brochure'}.pdf`
}

function splitParagraphs(text) {
  return String(text || '')
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function getProgramDays(details) {
  const program = details?.program
  if (!program || typeof program !== 'object') {
    if (Array.isArray(details?.itinerary) && details.itinerary.length) {
      return details.itinerary.map((item, index) => ({
        dayNum: index + 1,
        title: item.title || `Day ${index + 1}`,
        paragraphs: splitParagraphs(item.description || ''),
      }))
    }
    return []
  }

  return Object.keys(program)
    .filter((key) => /^day\d+$/i.test(key))
    .sort((a, b) => Number(a.replace(/\D/g, '')) - Number(b.replace(/\D/g, '')))
    .map((key, index) => {
      const text = String(program[key] || '').trim()
      if (!text) return null
      const lines = splitParagraphs(text)
      const title = lines[0] && lines[0].length <= 90 ? lines[0] : `${index + 1}η Μέρα`
      const paragraphs = lines[0] && lines[0].length <= 90 ? lines.slice(1) : lines
      return { dayNum: index + 1, title, paragraphs }
    })
    .filter(Boolean)
}

function chunkArray(items, size) {
  const chunks = []
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))
  return chunks
}

function uniqueHotels(hotels = []) {
  const seen = new Set()
  const list = []
  for (const hotel of hotels) {
    const name = String(hotel?.name || '').trim() || 'Hotel'
    const key = `${name}|${hotel?.departureDate || ''}|${hotel?.location || ''}`
    if (seen.has(key)) continue
    seen.add(key)
    list.push(hotel)
  }
  return list
}

function brochureStyles() {
  return `
    * { box-sizing: border-box; }
    body, .brochure-root, .brochure-root * {
      font-family: ${FONT_STACK} !important;
      -webkit-font-smoothing: antialiased;
    }
    h1, h2, h3, h4, strong, b, p, span, li, div, label {
      font-family: ${FONT_STACK} !important;
      font-style: normal !important;
    }
    .brochure-root {
      color: #0f172a;
      width: ${A4_WIDTH_PX}px;
      background: #fff;
    }
    .brochure-page {
      width: ${A4_WIDTH_PX}px;
      height: ${A4_HEIGHT_PX}px;
      background: #ffffff;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .brochure-page--cover {
      padding: 0;
    }
    .brochure-page--inner {
      padding: 40px 48px 44px;
    }
    .cover-hero-wrap {
      position: relative;
      width: 100%;
      height: 280px;
      overflow: hidden;
      background: linear-gradient(145deg, #153a63 0%, #1e4d7b 55%, #0f2d4a 100%);
      flex-shrink: 0;
    }
    .cover-hero-wrap img.cover-hero-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
    }
    .cover-hero-shade {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(180deg, rgba(15, 23, 42, 0.55) 0%, rgba(15, 23, 42, 0.15) 42%, rgba(15, 23, 42, 0.72) 100%);
    }
    .cover-hero-top {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 22px 28px;
    }
    .cover-logo {
      height: 18px !important;
      max-height: 18px !important;
      max-width: 110px !important;
      width: auto !important;
      object-fit: contain !important;
      background: rgba(255,255,255,0.96);
      border-radius: 5px;
      padding: 5px 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
    }
    .inner-logo {
      height: 22px !important;
      max-height: 22px !important;
      max-width: 130px !important;
      width: auto !important;
      object-fit: contain !important;
    }
    .cover-hero-badge {
      padding: 7px 12px;
      border-radius: 999px;
      background: rgba(196, 18, 48, 0.92);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .cover-hero-caption {
      position: absolute;
      left: 28px;
      right: 28px;
      bottom: 22px;
      z-index: 2;
      color: #fff;
    }
    .cover-hero-caption .eyebrow {
      margin: 0 0 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.88);
    }
    .cover-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 32px 40px 28px;
      gap: 4px;
    }
    .cover-title {
      margin: 0 0 14px;
      font-size: 24px;
      line-height: 1.25;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.01em;
    }
    .cover-desc {
      margin: 0 0 20px;
      font-size: 12.5px;
      line-height: 1.6;
      color: #475569;
      max-width: 94%;
    }
    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }
    .meta-chip {
      display: inline-flex;
      align-items: center;
      padding: 7px 12px;
      border-radius: 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      font-size: 11px;
      font-weight: 600;
      color: #1e293b;
    }
    .meta-chip--price {
      background: #c41230;
      border-color: #c41230;
      color: #ffffff;
      font-weight: 800;
    }
    .info-block {
      margin-bottom: 16px;
    }
    .info-label {
      margin: 0 0 8px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #64748b;
    }
    .dates-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .dates-list li {
      min-width: 72px;
      text-align: center;
      padding: 9px 12px;
      border-radius: 8px;
      background: #fff;
      border: 1px solid #cbd5e1;
      color: #0f172a;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.02em;
    }
    .hotel-date {
      display: inline-block;
      margin-top: 6px;
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
    }
    .hotel-date strong {
      font-weight: 800;
      color: #c41230;
    }
    .cta-card {
      margin-top: auto;
      position: relative;
      overflow: hidden;
      border-radius: 16px;
      padding: 22px 24px 20px;
      background:
        radial-gradient(120% 80% at 100% 0%, rgba(196, 18, 48, 0.28) 0%, transparent 55%),
        linear-gradient(155deg, #1a1a1a 0%, #111111 48%, #2a1216 100%);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
    }
    .cta-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #c41230 0%, #e31e24 55%, #7f1d1d 100%);
    }
    .cta-card__label {
      margin: 0 0 6px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #fda4af;
    }
    .cta-card__title {
      margin: 0 0 6px;
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0;
    }
    .cta-card__subtitle {
      margin: 0 0 16px;
      font-size: 11px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.72);
    }
    .cta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding-top: 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    .cta-item {
      padding: 10px 12px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .cta-item__label {
      display: block;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #fda4af;
      margin-bottom: 4px;
    }
    .cta-item__value {
      display: block;
      font-size: 12.5px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.35;
    }
    .inner-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding-bottom: 16px;
      margin-bottom: 22px;
      border-bottom: 1px solid #e2e8f0;
    }
    .inner-top__meta {
      text-align: right;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748b;
    }
    .inner-top__meta strong {
      display: block;
      margin-top: 2px;
      font-size: 12px;
      letter-spacing: 0;
      text-transform: none;
      color: #153a63;
      font-weight: 700;
    }
    .section-title {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.01em;
    }
    .section-rule {
      width: 42px;
      height: 3px;
      background: #c41230;
      border-radius: 2px;
      margin: 0 0 16px;
    }
    .section-lead {
      margin: 0 0 18px;
      font-size: 12px;
      line-height: 1.5;
      color: #64748b;
    }
    .hotel-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 14px;
      background: #ffffff;
    }
    .hotel-card h3 {
      margin: 0 0 6px;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
    .hotel-card p {
      margin: 0;
      font-size: 11px;
      color: #64748b;
      line-height: 1.45;
    }
    .hotel-meta-line {
      margin: 0 0 12px !important;
    }
    .price-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
      table-layout: fixed;
    }
    .price-table th,
    .price-table td {
      border: 1px solid #e2e8f0;
      padding: 9px 8px;
      text-align: center;
      vertical-align: middle;
    }
    .price-table th {
      background: #f8fafc;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #64748b;
    }
    .price-table td {
      background: #ffffff;
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
    }
    .price-table td.is-empty {
      color: #cbd5e1;
      font-weight: 600;
    }
    .price-table th.is-child,
    .price-table td.is-child {
      background: #fff7ed;
    }
    .price-table td.is-child {
      color: #9a3412;
    }
    .price-table th.is-child {
      color: #c2410c;
    }
    .day-card {
      display: grid;
      grid-template-columns: 58px 1fr;
      gap: 14px;
      padding: 14px 0;
      border-bottom: 1px solid #eef2f7;
    }
    .day-card:last-child { border-bottom: 0; }
    .day-num {
      width: 58px;
      height: 58px;
      border-radius: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #c41230;
    }
    .day-num small {
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #94a3b8;
    }
    .day-num strong {
      font-size: 18px;
      font-weight: 700;
      color: #c41230;
      line-height: 1;
    }
    .day-card h3 {
      margin: 0 0 6px;
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    .day-card p {
      margin: 0 0 5px;
      font-size: 11px;
      line-height: 1.5;
      color: #475569;
    }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .list-box {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 18px;
      background: #f8fafc;
    }
    .list-box h3 {
      margin: 0 0 12px;
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    .list-box ul {
      margin: 0;
      padding-left: 16px;
    }
    .list-box li {
      margin-bottom: 8px;
      font-size: 11.5px;
      line-height: 1.5;
      color: #334155;
    }
    .flight-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 0;
      margin-bottom: 16px;
      background: #fff;
      overflow: hidden;
    }
    .flight-card__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 14px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .flight-card__direction {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 6px;
      background: #153a63;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .flight-card__direction--return {
      background: #c41230;
    }
    .flight-card__direction--domestic {
      background: #334155;
    }
    .flight-card__date {
      font-size: 11px;
      font-weight: 600;
      color: #475569;
      text-align: right;
    }
    .flight-card__body {
      padding: 12px 14px 14px;
    }
    .flight-card__route {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.35;
    }
    .flight-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .flight-meta-grid--3 {
      grid-template-columns: 1fr 1fr 1fr;
    }
    .flight-meta {
      padding: 8px 10px;
      border-radius: 8px;
      background: #f8fafc;
      border: 1px solid #eef2f7;
    }
    .flight-meta__label {
      display: block;
      margin-bottom: 2px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #94a3b8;
    }
    .flight-meta__value {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #0f172a;
      line-height: 1.35;
    }
    .flight-card__note {
      margin: 10px 0 0;
      padding: 8px 10px;
      border-radius: 8px;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      font-size: 11px;
      line-height: 1.45;
      color: #9a3412;
    }
    .flight-leg {
      margin-top: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
    }
    .flight-leg__title {
      margin: 0 0 6px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748b;
    }
    .flight-connection {
      margin: 8px 0 0;
      font-size: 11px;
      color: #64748b;
      font-style: italic;
    }
    .airline-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin: 0 0 14px;
      padding: 10px 14px;
      border-radius: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    .airline-banner strong {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    .airline-banner span {
      font-size: 11px;
      color: #64748b;
    }
    .fine-print {
      margin-top: 14px;
      font-size: 9.5px;
      line-height: 1.45;
      color: #94a3b8;
    }
    .page-footer {
      margin-top: auto;
      padding: 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      font-weight: 600;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
    .page-footer--cover {
      margin: 0 36px 18px;
      padding-top: 12px;
    }
    .accent-bar {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 5px;
      background: #c41230;
    }
  `
}

function renderCtaCard() {
  return `
    <div class="cta-card">
      <p class="cta-card__label">Book this package</p>
      <p class="cta-card__title">Honeywell Travel</p>
      <p class="cta-card__subtitle">Cyprus travel specialists · #LivetheExperience</p>
      <div class="cta-grid">
        <div class="cta-item">
          <span class="cta-item__label">Call</span>
          <span class="cta-item__value">${escapeHtml(CONTACT_PHONE)}</span>
        </div>
        <div class="cta-item">
          <span class="cta-item__label">Email</span>
          <span class="cta-item__value">${escapeHtml(CONTACT_EMAIL)}</span>
        </div>
        <div class="cta-item">
          <span class="cta-item__label">Website</span>
          <span class="cta-item__value">www.honeywelltravel.com.cy</span>
        </div>
        <div class="cta-item">
          <span class="cta-item__label">Support</span>
          <span class="cta-item__value">Before, during &amp; after your trip</span>
        </div>
      </div>
    </div>
  `
}

function flightDirectionClass(direction) {
  const value = String(direction || '').toLowerCase()
  if (value.includes('return')) return 'flight-card__direction flight-card__direction--return'
  if (value.includes('domestic')) return 'flight-card__direction flight-card__direction--domestic'
  return 'flight-card__direction'
}

function renderFlightMeta(label, value) {
  if (value == null || value === '') return ''
  return `
    <div class="flight-meta">
      <span class="flight-meta__label">${escapeHtml(label)}</span>
      <span class="flight-meta__value">${escapeHtml(String(value))}</span>
    </div>
  `
}

function renderFlightLegs(legs = []) {
  if (!Array.isArray(legs) || legs.length === 0) return ''
  return legs
    .map((leg, index) => {
      if (leg?.type === 'connection') {
        return `<p class="flight-connection">${escapeHtml(leg.text || 'Connection')}</p>`
      }
      if (leg?.type === 'segment' || leg?.fromName || leg?.flight || leg?.depart) {
        const from = [leg.fromName, leg.fromCode ? `(${leg.fromCode})` : '', leg.fromCity]
          .filter(Boolean)
          .join(' ')
        const to = [leg.toName, leg.toCode ? `(${leg.toCode})` : '', leg.toCity]
          .filter(Boolean)
          .join(' ')
        const route = [from, to].filter(Boolean).join(' → ')
        const metaBits = [
          renderFlightMeta('Depart', leg.depart),
          renderFlightMeta('Arrive', leg.arrive),
          renderFlightMeta('Flight', leg.flight),
          renderFlightMeta('Luggage', leg.luggage),
        ].filter(Boolean)
        return `
          <div class="flight-leg">
            <p class="flight-leg__title">Leg ${index + 1}${route ? ` · ${escapeHtml(route)}` : ''}</p>
            ${metaBits.length ? `<div class="flight-meta-grid">${metaBits.join('')}</div>` : ''}
            ${leg.note ? `<p class="flight-card__note">${escapeHtml(leg.note)}</p>` : ''}
          </div>
        `
      }
      return ''
    })
    .join('')
}

function renderFlightCard(flight) {
  const direction = flight?.direction || 'Flight'
  const directionClass = flightDirectionClass(direction)
  const hasLegs = Array.isArray(flight?.legs) && flight.legs.length > 0
  const metaItems = [
    renderFlightMeta('Flight no.', flight?.flight),
    renderFlightMeta('Time', flight?.time),
    renderFlightMeta('Stops', flight?.stops),
    renderFlightMeta('Luggage', flight?.luggage),
  ].filter(Boolean)

  return `
    <article class="flight-card">
      <div class="flight-card__head">
        <span class="${directionClass}">${escapeHtml(direction)}</span>
        ${flight?.date ? `<span class="flight-card__date">${escapeHtml(flight.date)}</span>` : ''}
      </div>
      <div class="flight-card__body">
        ${flight?.route ? `<p class="flight-card__route">${escapeHtml(flight.route)}</p>` : ''}
        ${
          !hasLegs && metaItems.length
            ? `<div class="flight-meta-grid${metaItems.length >= 3 ? ' flight-meta-grid--3' : ''}">${metaItems.join('')}</div>`
            : ''
        }
        ${
          hasLegs
            ? `${
                flight?.stops != null && flight.stops !== ''
                  ? `<div class="flight-meta-grid" style="margin-bottom:8px;">${renderFlightMeta('Stops', flight.stops)}${renderFlightMeta('Luggage', flight.luggage)}</div>`
                  : flight?.luggage
                    ? `<div class="flight-meta-grid" style="margin-bottom:8px;">${renderFlightMeta('Luggage', flight.luggage)}</div>`
                    : ''
              }${renderFlightLegs(flight.legs)}`
            : ''
        }
        ${flight?.note ? `<p class="flight-card__note">${escapeHtml(flight.note)}</p>` : ''}
      </div>
    </article>
  `
}

function renderHotelPriceTable(prices = {}, { hidePrices = false, packagePrice } = {}) {
  if (hidePrices) {
    return '<p style="margin-top:8px;font-weight:700;color:#0f172a;">Price on request</p>'
  }

  const cells = [
    { label: 'Double /pp', value: prices.double, child: false },
    { label: 'Single /pp', value: prices.single, child: false },
    { label: 'Triple /pp', value: prices.triple, child: false },
    { label: 'Child 1 /pp', value: prices.child1, child: true },
    { label: 'Child 2 /pp', value: prices.child2, child: true },
  ]

  const hasAny = cells.some((cell) => Number(cell.value) > 0)
  if (!hasAny) {
    return packagePrice
      ? `<p style="margin-top:8px;font-weight:700;color:#0f172a;">${escapeHtml(String(packagePrice))}</p>`
      : ''
  }

  return `
    <table class="price-table" aria-label="Hotel prices per person">
      <thead>
        <tr>
          ${cells
            .map(
              (cell) =>
                `<th class="${cell.child ? 'is-child' : ''}">${escapeHtml(cell.label)}</th>`
            )
            .join('')}
        </tr>
      </thead>
      <tbody>
        <tr>
          ${cells
            .map((cell) => {
              const amount = Number(cell.value)
              const hasValue = Number.isFinite(amount) && amount > 0
              return `<td class="${cell.child ? 'is-child' : ''}${hasValue ? '' : ' is-empty'}">${
                hasValue ? escapeHtml(formatMoney(amount)) : '—'
              }</td>`
            })
            .join('')}
        </tr>
      </tbody>
    </table>
  `
}

function pageShellInner({ logoUrl, sectionLabel, pageIndex, pageCount, children }) {
  return `
    <section class="brochure-page brochure-page--inner">
      <div class="inner-top">
        <img class="inner-logo" src="${escapeHtml(logoUrl)}" alt="Honeywell Travel" />
        <div class="inner-top__meta">
          Package brochure
          <strong>${escapeHtml(sectionLabel)}</strong>
        </div>
      </div>
      ${children}
      <div class="page-footer">
        <span>honeywelltravel.com.cy</span>
        <span>${pageIndex} / ${pageCount}</span>
      </div>
      <div class="accent-bar"></div>
    </section>
  `
}

function buildBrochurePages(pkg, { title, priceLabel, logoUrl, coverUrl } = {}) {
  const details = pkg?.details || {}
  const displayTitle = title || pkg?.title || 'Travel Package'
  const leadPrice = formatMoney(getPackageLeadPrice(pkg))
  const departureDates = getPackageDepartureDatesFromPkg(pkg)
  const hotels = uniqueHotels(details.hotels || [])
  const programDays = getProgramDays(details)
  const included = Array.isArray(details.included) ? details.included.filter(Boolean) : []
  const notIncluded = Array.isArray(details.notIncluded) ? details.notIncluded.filter(Boolean) : []
  const flights = Array.isArray(details.flights) ? details.flights : []
  const hidePrices = Boolean(details.hideHotelPrices || details.priceOnRequest || pkg?.priceOnRequest)
  const description = pkg?.longDescription || pkg?.description || details.destinationFull || ''
  const priceText =
    !hidePrices && (priceLabel || leadPrice) ? priceLabel || `From ${leadPrice}` : 'Price on request'

  const pages = []

  // Cover — hero image first, then clear package facts
  pages.push({
    type: 'cover',
    html: `
      <section class="brochure-page brochure-page--cover">
        <div class="cover-hero-wrap">
          ${
            coverUrl
              ? `<img class="cover-hero-image" src="${escapeHtml(coverUrl)}" alt="" />`
              : ''
          }
          <div class="cover-hero-shade"></div>
          <div class="cover-hero-top">
            ${logoUrl ? `<img class="cover-logo" src="${escapeHtml(logoUrl)}" alt="Honeywell Travel" />` : '<div></div>'}
            <span class="cover-hero-badge">${escapeHtml(pkg?.category || 'Travel Package')}</span>
          </div>
          <div class="cover-hero-caption">
            <p class="eyebrow">${escapeHtml(pkg?.destination || 'Honeywell Travel')}</p>
          </div>
        </div>
        <div class="cover-body">
          <h1 class="cover-title">${escapeHtml(displayTitle)}</h1>
          ${description ? `<p class="cover-desc">${escapeHtml(description)}</p>` : ''}
          <div class="meta-row">
            ${pkg?.destination ? `<span class="meta-chip">${escapeHtml(pkg.destination)}</span>` : ''}
            ${pkg?.duration ? `<span class="meta-chip">${escapeHtml(pkg.duration)}</span>` : ''}
            <span class="meta-chip">${escapeHtml((pkg?.packageType || 'individual') === 'group' ? 'Group' : 'Individual')}</span>
            ${pkg?.supplier ? `<span class="meta-chip">${escapeHtml(pkg.supplier)}</span>` : ''}
            <span class="meta-chip meta-chip--price">${escapeHtml(priceText)}</span>
          </div>
          ${
            departureDates.length
              ? `<div class="info-block">
                  <p class="info-label">Upcoming departures</p>
                  <ul class="dates-list">${departureDates.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
                </div>`
              : ''
          }
        </div>
        <div class="page-footer page-footer--cover">
          <span>honeywelltravel.com.cy</span>
          <span>1 / __PAGECOUNT__</span>
        </div>
        <div class="accent-bar"></div>
      </section>
    `,
  })

  if (hotels.length) {
    chunkArray(hotels, 3).forEach((chunk, chunkIndex, all) => {
      pages.push({
        type: 'inner',
        section: all.length > 1 ? `Hotels & prices (${chunkIndex + 1}/${all.length})` : 'Hotels & prices',
        html: `
          <h2 class="section-title">Hotels &amp; prices</h2>
          <div class="section-rule"></div>
          <p class="section-lead">Accommodation options and per-person rates for this package. Child 1 and Child 2 are shown clearly when available.</p>
          ${chunk
            .map((hotel) => {
              return `
                <article class="hotel-card">
                  <h3>${escapeHtml(hotel.name || 'Hotel')}</h3>
                  <p class="hotel-meta-line">${escapeHtml(
                    [
                      hotel.stars ? `${hotel.stars}★` : '',
                      hotel.location,
                      hotel.boardBasis,
                      hotel.roomType,
                    ]
                      .filter(Boolean)
                      .join('  ·  ')
                  )}</p>
                  ${
                    hotel.departureDate
                      ? `<p class="hotel-date">Departure date: <strong>${escapeHtml(hotel.departureDate)}</strong></p>`
                      : ''
                  }
                  ${renderHotelPriceTable(hotel?.prices || {}, {
                    hidePrices,
                    packagePrice: hotel.packagePrice,
                  })}
                </article>
              `
            })
            .join('')}
        `,
      })
    })
  }

  if (programDays.length) {
    chunkArray(programDays, 2).forEach((chunk, chunkIndex, all) => {
      pages.push({
        type: 'inner',
        section: all.length > 1 ? `Program (${chunkIndex + 1}/${all.length})` : 'Program',
        html: `
          <h2 class="section-title">Program</h2>
          <div class="section-rule"></div>
          <p class="section-lead">Day-by-day itinerary for this package.</p>
          ${chunk
            .map(
              (day) => `
            <article class="day-card">
              <div class="day-num">
                <small>Day</small>
                <strong>${escapeHtml(String(day.dayNum))}</strong>
              </div>
              <div>
                <h3>${escapeHtml(day.title)}</h3>
                ${day.paragraphs
                  .slice(0, 8)
                  .map((p) => `<p>${escapeHtml(p)}</p>`)
                  .join('')}
              </div>
            </article>
          `
            )
            .join('')}
        `,
      })
    })
  }

  if (included.length || notIncluded.length) {
    pages.push({
      type: 'inner',
      section: 'Included',
      html: `
        <h2 class="section-title">What’s included</h2>
        <div class="section-rule"></div>
        <div class="two-col">
          <div class="list-box">
            <h3>Included</h3>
            ${
              included.length
                ? `<ul>${included.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
                : '<p class="section-lead">Available on request.</p>'
            }
          </div>
          <div class="list-box">
            <h3>Not included</h3>
            ${
              notIncluded.length
                ? `<ul>${notIncluded.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
                : '<p class="section-lead">Available on request.</p>'
            }
          </div>
        </div>
        ${
          details.cancellationPolicy
            ? `<p class="fine-print"><strong>Cancellation:</strong> ${escapeHtml(details.cancellationPolicy)}</p>`
            : ''
        }
        ${
          details.includedLuggage
            ? `<p class="fine-print"><strong>Included luggage:</strong> ${escapeHtml(details.includedLuggage)}</p>`
            : ''
        }
      `,
    })
  }

  if (flights.length) {
    chunkArray(flights, 2).forEach((chunk, chunkIndex, all) => {
      pages.push({
        type: 'inner',
        section: all.length > 1 ? `Flights (${chunkIndex + 1}/${all.length})` : 'Flights',
        html: `
          <h2 class="section-title">Flights</h2>
          <div class="section-rule"></div>
          <div class="airline-banner">
            <div>
              <strong>${escapeHtml(details.airline || 'Airline')}</strong>
              <span>${escapeHtml(
                [
                  details.includedLuggage ? `Luggage: ${details.includedLuggage}` : '',
                  `${flights.length} flight${flights.length === 1 ? '' : 's'} listed`,
                ]
                  .filter(Boolean)
                  .join(' · ') || 'Flight details for this package'
              )}</span>
            </div>
          </div>
          ${chunk.map((flight) => renderFlightCard(flight)).join('')}
        `,
      })
    })
  }

  pages.push({
    type: 'inner',
    section: 'Contact',
    html: `
      <h2 class="section-title">Contact &amp; booking</h2>
      <div class="section-rule"></div>
      <p class="section-lead">
        Our Cyprus travel specialists can confirm availability, hotel options, and the best departure for you.
      </p>
      ${renderCtaCard()}
      <p class="fine-print">
        Prices and availability may change. This brochure is generated from the live package details on
        honeywelltravel.com.cy and is intended for personal reference. Terms and conditions apply.
      </p>
    `,
  })

  const pageCount = pages.length
  return pages
    .map((page, index) => {
      if (page.type === 'cover') {
        return page.html.replace(/__PAGECOUNT__/g, String(pageCount))
      }
      return pageShellInner({
        logoUrl,
        sectionLabel: page.section,
        pageIndex: index + 1,
        pageCount,
        children: page.html,
      })
    })
    .join('')
}

function waitForImages(root) {
  const images = Array.from(root.querySelectorAll('img'))
  return Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve()
            return
          }
          const done = () => resolve()
          img.onload = done
          img.onerror = done
          setTimeout(done, 2500)
        })
    )
  )
}

/**
 * Build a multi-page A4 PDF brochure for a travel package and download it.
 */
export async function downloadPackageBrochure(pkg, { title, priceLabel, onProgress } = {}) {
  if (!pkg || typeof document === 'undefined') {
    throw new Error('Package brochure requires a browser environment')
  }

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const logoUrl = await toDataUrl(absoluteAssetUrl('/images/icons/honeywell-travel-logo.webp'))
  const rawCover = absoluteAssetUrl(packageCardImageUrl(pkg))
  const coverLooksLikeLogo = /honeywell-travel-logo/i.test(String(rawCover || ''))
  const coverUrl = coverLooksLikeLogo ? '' : await toDataUrl(rawCover)

  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.style.cssText =
    'position:fixed;left:-14000px;top:0;width:794px;pointer-events:none;opacity:1;z-index:-1;'
  host.innerHTML = `
    <div class="brochure-root">
      <style>${brochureStyles()}</style>
      ${buildBrochurePages(pkg, { title, priceLabel, logoUrl, coverUrl })}
    </div>
  `
  document.body.appendChild(host)

  try {
    await waitForImages(host)
    await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 120)))

    const pageNodes = Array.from(host.querySelectorAll('.brochure-page'))
    if (!pageNodes.length) throw new Error('Brochure pages could not be rendered')

    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
    })

    for (let i = 0; i < pageNodes.length; i += 1) {
      onProgress?.({ current: i + 1, total: pageNodes.length })
      const canvas = await html2canvas(pageNodes[i], {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        windowWidth: A4_WIDTH_PX,
        windowHeight: A4_HEIGHT_PX,
        logging: false,
      })
      const imgData = canvas.toDataURL('image/jpeg', 0.94)
      if (i > 0) pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST')
    }

    pdf.save(slugifyFilename(title || pkg.title, pkg.id))
  } finally {
    host.remove()
  }
}

/**
 * Honeywell sell-price markup for XS2Event tickets.
 * Amounts are integer minor units (cents) as returned by XS2Event.
 */

const DEFAULT_MARKUP_PERCENT = 15

export function getXs2EventMarkupPercent() {
  const raw = process.env.XS2EVENT_MARKUP_PERCENT
  if (raw == null || String(raw).trim() === '') return DEFAULT_MARKUP_PERCENT
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0 || n > 100) return DEFAULT_MARKUP_PERCENT
  return n
}

/**
 * @param {number} netRate minor units
 * @param {number} [markupPercent]
 * @returns {number} integer minor units
 */
export function applyHoneywellMarkup(netRate, markupPercent = getXs2EventMarkupPercent()) {
  const net = Number(netRate)
  if (!Number.isFinite(net)) return net
  const pct = Number(markupPercent)
  if (!Number.isFinite(pct) || pct === 0) return Math.round(net)
  return Math.round(net * (1 + pct / 100))
}

/**
 * Attach Honeywell sales fields onto ticket objects for the UI.
 * Does not expose net_rate removal — UI may still show sell only.
 */
export function decorateTicketsWithSalesPrice(tickets) {
  const markupPercent = getXs2EventMarkupPercent()
  const list = Array.isArray(tickets) ? tickets : []
  return list.map((ticket) => {
    if (!ticket || typeof ticket !== 'object') return ticket
    const net = Number(ticket.net_rate)
    const sales = Number.isFinite(net) ? applyHoneywellMarkup(net, markupPercent) : null
    return {
      ...ticket,
      honeywell_markup_percent: markupPercent,
      honeywell_sales_price: sales,
    }
  })
}

/**
 * XS2Event event.min_ticket_price_eur / max_ticket_price_eur are minor units (cents),
 * despite the `_eur` suffix — same integer scale as ticket.net_rate.
 * Attach Honeywell sell "from" price for list cards.
 */
export function decorateEventsWithSalesPrice(events) {
  const markupPercent = getXs2EventMarkupPercent()
  const list = Array.isArray(events) ? events : []
  return list.map((event) => {
    if (!event || typeof event !== 'object') return event
    const minMinor = Number(event.min_ticket_price_eur)
    const maxMinor = Number(event.max_ticket_price_eur)
    return {
      ...event,
      honeywell_markup_percent: markupPercent,
      honeywell_min_ticket_price: Number.isFinite(minMinor)
        ? applyHoneywellMarkup(minMinor, markupPercent)
        : null,
      honeywell_max_ticket_price: Number.isFinite(maxMinor)
        ? applyHoneywellMarkup(maxMinor, markupPercent)
        : null,
    }
  })
}

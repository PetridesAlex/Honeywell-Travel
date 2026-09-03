/**
 * Post-booking side effects for XS2Event: Supabase persist, Resend emails, CRM lead.
 * All failures are logged and non-blocking so XS2Event booking success is preserved.
 */
import { Resend } from 'resend'
import { getSupabaseAdmin } from './supabaseAdmin.js'

const STAFF_RECIPIENTS = ['limassol@honeywelltravel.com.cy', 'infohoneywell@asg.com.cy']
const FROM_EMAIL = 'Honeywell Travel <offers@honeywelltravel.com.cy>'
const DEFAULT_CRM_URL = 'https://travel-hub-crm.vercel.app/api/leads/inbound'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatMoneyMinor(amount, currency = 'EUR') {
  const n = Number(amount)
  if (!Number.isFinite(n)) return '—'
  const value = Math.abs(n) >= 1000 ? n / 100 : n
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(value)
  } catch {
    return `${value.toFixed(2)} ${currency || 'EUR'}`
  }
}

function summarizeItems(booking) {
  const items = Array.isArray(booking?.items) ? booking.items : []
  return items.map((item) => ({
    ticket_id: item.ticket_id || null,
    ticket_name: item.ticket_name || null,
    event_id: item.event_id || null,
    event_name: item.event_name || null,
    quantity: item.quantity ?? null,
    currency: item.currency || 'EUR',
    net_rate: item.net_rate ?? null,
    sales_price: item.salesprice ?? item.sales_price ?? null,
  }))
}

function buildEmailBodies({ booking, bookingEmail, isTestHost }) {
  const items = summarizeItems(booking)
  const lines = items.map((item) => {
    const price = formatMoneyMinor(item.sales_price ?? item.net_rate, item.currency)
    return `• ${item.ticket_name || item.ticket_id} × ${item.quantity} — ${price}`
  })
  const paymentNote = isTestHost
    ? 'This is a TEST booking on the XS2Event sandbox. No live card charge was taken.'
    : 'Payment method: invoice. Honeywell Travel will send payment instructions / invoice separately. Card checkout is not used for this booking.'

  const text = [
    'Honeywell Travel — Sports Tickets booking confirmation',
    '',
    `Booking code: ${booking?.booking_code || '—'}`,
    `Booking ID: ${booking?.booking_id || '—'}`,
    `Booking reference: ${booking?.booking_reference || '—'}`,
    `Invoice reference: ${booking?.payment_reference || '—'}`,
    `Email: ${bookingEmail}`,
    '',
    'Items:',
    ...(lines.length ? lines : ['• (see booking details with Honeywell Travel)']),
    '',
    paymentNote,
    '',
    'Questions? Contact limassol@honeywelltravel.com.cy or +357 25828848.',
  ].join('\n')

  const rowsHtml = items
    .map((item) => {
      const price = formatMoneyMinor(item.sales_price ?? item.net_rate, item.currency)
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;">${escapeHtml(item.ticket_name || item.ticket_id || 'Ticket')}</td>
        <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;text-align:center;">${escapeHtml(item.quantity)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;text-align:right;">${escapeHtml(price)}</td>
      </tr>`
    })
    .join('')

  const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#1c1c1e;line-height:1.5;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <h1 style="color:#c41230;font-size:22px;">Sports Tickets booking confirmed</h1>
    <p>Thank you for booking with Honeywell Travel.</p>
    <p>
      <strong>Booking code:</strong> ${escapeHtml(booking?.booking_code || '—')}<br/>
      <strong>Invoice reference:</strong> ${escapeHtml(booking?.payment_reference || '—')}<br/>
      <strong>Booking reference:</strong> ${escapeHtml(booking?.booking_reference || '—')}
    </p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px 0;border-bottom:2px solid #c41230;">Ticket</th>
          <th style="text-align:center;padding:8px 0;border-bottom:2px solid #c41230;">Qty</th>
          <th style="text-align:right;padding:8px 0;border-bottom:2px solid #c41230;">Price</th>
        </tr>
      </thead>
      <tbody>${rowsHtml || '<tr><td colspan="3">Details on file with Honeywell Travel.</td></tr>'}</tbody>
    </table>
    <p style="color:#71717a;font-size:14px;">${escapeHtml(paymentNote)}</p>
    <p style="font-size:14px;">Honeywell Travel · limassol@honeywelltravel.com.cy · +357 25828848</p>
  </div>
</body></html>`

  return { text, html }
}

export async function persistXs2EventBooking({ booking, reservationId, bookingEmail, isTestHost }) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    console.warn('xs2event_bookings: Supabase admin not configured')
    return { ok: false, reason: 'no_supabase' }
  }

  const items = summarizeItems(booking)
  const first = items[0] || {}
  const row = {
    booking_id: booking?.booking_id || null,
    reservation_id: reservationId || booking?.reservation_id || null,
    booking_code: booking?.booking_code || null,
    booking_email: bookingEmail,
    booking_reference: booking?.booking_reference || null,
    payment_reference: booking?.payment_reference || null,
    payment_method: booking?.payment_method || 'invoice',
    is_test_booking: Boolean(isTestHost || booking?.is_test_booking),
    event_id: first.event_id,
    event_name: first.event_name,
    ticket_id: first.ticket_id,
    ticket_name: first.ticket_name,
    quantity: first.quantity,
    currency: first.currency || 'EUR',
    net_rate: first.net_rate,
    sales_price: first.sales_price,
    items,
    raw_booking: booking || null,
  }

  const { error } = await supabase.from('xs2event_bookings').insert(row)
  if (error) {
    console.error('xs2event_bookings insert failed:', error.message)
    return { ok: false, reason: error.message }
  }
  return { ok: true }
}

export async function sendXs2EventBookingEmails({ booking, bookingEmail, isTestHost }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('xs2event booking email: RESEND_API_KEY not configured')
    return { ok: false, reason: 'no_resend' }
  }

  const resend = new Resend(apiKey)
  const { text, html } = buildEmailBodies({ booking, bookingEmail, isTestHost })
  const code = booking?.booking_code || booking?.booking_id || 'booking'
  const subjectCustomer = `Sports Tickets confirmation — ${code}`
  const subjectStaff = `New Sports Tickets booking — ${code}`

  const results = { customer: null, staff: null }

  try {
    results.customer = await resend.emails.send({
      from: FROM_EMAIL,
      to: [bookingEmail],
      subject: subjectCustomer,
      html,
      text,
      replyTo: 'limassol@honeywelltravel.com.cy',
    })
  } catch (err) {
    console.error('xs2event customer email failed:', err?.message || err)
  }

  try {
    results.staff = await resend.emails.send({
      from: FROM_EMAIL,
      to: STAFF_RECIPIENTS,
      replyTo: bookingEmail,
      subject: subjectStaff,
      html,
      text,
    })
  } catch (err) {
    console.error('xs2event staff email failed:', err?.message || err)
  }

  return { ok: true, results }
}

export async function syncXs2EventBookingToCrm({ booking, bookingEmail, isTestHost }) {
  const apiKey = process.env.CRM_AGENCY_API_KEY
  const crmUrl = process.env.CRM_INBOUND_URL || DEFAULT_CRM_URL
  if (!apiKey) {
    console.warn('xs2event CRM sync: CRM_AGENCY_API_KEY not configured')
    return { ok: false, reason: 'no_crm' }
  }

  const items = summarizeItems(booking)
  const first = items[0] || {}
  const destination = first.event_name || first.ticket_name || 'Sports Tickets'
  const message = [
    'Sports Tickets booking via honeywelltravel.com',
    `Booking code: ${booking?.booking_code || '—'}`,
    `Booking ID: ${booking?.booking_id || '—'}`,
    `Reservation: ${booking?.reservation_id || '—'}`,
    `Payment: ${booking?.payment_method || 'invoice'} / ${booking?.payment_reference || '—'}`,
    isTestHost ? 'Environment: XS2Event TEST' : 'Environment: XS2Event live',
    '',
    ...items.map(
      (item) =>
        `${item.ticket_name || item.ticket_id} × ${item.quantity} @ ${formatMoneyMinor(item.sales_price ?? item.net_rate, item.currency)}`,
    ),
  ].join('\n')

  const payload = {
    full_name: 'Sports Tickets Customer',
    email: bookingEmail,
    phone: '',
    destination,
    package: destination,
    travel_dates: '',
    message,
    travel_type: 'other',
    source: 'honeywelltravel.com — Sports Tickets',
  }

  try {
    const response = await fetch(crmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Agency-Api-Key': apiKey,
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      console.error('xs2event CRM sync failed:', data.error || response.status)
      return { ok: false, reason: data.error || String(response.status) }
    }
    return { ok: true }
  } catch (err) {
    console.error('xs2event CRM sync error:', err?.message || err)
    return { ok: false, reason: err?.message || 'crm_error' }
  }
}

/**
 * Run all side effects after a successful XS2Event booking. Never throws.
 */
export async function afterXs2EventBookingCreated(ctx) {
  const out = { persist: null, email: null, crm: null }
  try {
    out.persist = await persistXs2EventBooking(ctx)
  } catch (err) {
    console.error('persistXs2EventBooking unexpected:', err?.message || err)
  }
  try {
    out.email = await sendXs2EventBookingEmails(ctx)
  } catch (err) {
    console.error('sendXs2EventBookingEmails unexpected:', err?.message || err)
  }
  try {
    out.crm = await syncXs2EventBookingToCrm(ctx)
  } catch (err) {
    console.error('syncXs2EventBookingToCrm unexpected:', err?.message || err)
  }
  return out
}

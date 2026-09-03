/**
 * POST /api/xs2event/bookings
 * Finalizes an XS2Event reservation into a booking (invoice / TEST).
 * No card payment processing — uses XS2Event payment_method from contract (default invoice).
 */
import {
  xs2eventPost,
  sendXs2EventError,
  Xs2EventError,
} from '../_lib/xs2event.js'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

function sanitizeReservationId(value) {
  const id = String(value || '').trim()
  if (!/^[A-Za-z0-9_-]+$/.test(id) || id.length > 80) {
    throw new Xs2EventError('Invalid reservation_id.', 400, 'xs2event_invalid_reservation_id')
  }
  return id
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {}
    const reservationId = sanitizeReservationId(body.reservation_id)
    const bookingEmail = String(body.booking_email || '').trim()

    if (!isValidEmail(bookingEmail)) {
      throw new Xs2EventError(
        'A valid booking_email is required.',
        400,
        'xs2event_invalid_email',
      )
    }

    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
    const invoiceReference =
      String(body.invoice_reference || '').trim().slice(0, 80) || `HW-TEST-${stamp}`
    const bookingReference =
      String(body.booking_reference || '').trim().slice(0, 80) || `HW-BOOK-${stamp}`

    // TEST-safe defaults: invoice settlement, flag as test booking when on test API.
    const apiUrl = String(process.env.XS2EVENT_API_URL || '').toLowerCase()
    const isTestHost = apiUrl.includes('testapi') || apiUrl.includes('test')

    const payload = {
      reservation_id: reservationId,
      booking_email: bookingEmail,
      invoice_reference: invoiceReference,
      booking_reference: bookingReference,
      payment_method: 'invoice',
      is_test_booking: isTestHost ? true : Boolean(body.is_test_booking),
    }

    const booking = await xs2eventPost('/v1/bookings', payload)

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking,
    })
  } catch (err) {
    return sendXs2EventError(res, err)
  }
}

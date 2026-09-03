/**
 * POST /api/xs2event/bookings
 * Finalizes an XS2Event reservation into a booking (invoice settlement).
 * No Stripe/card processing — Honeywell invoices the customer.
 * After success: persist to Supabase, email customer+staff, sync CRM (non-blocking).
 */
import {
  xs2eventPost,
  sendXs2EventError,
  Xs2EventError,
} from '../_lib/xs2event.js'
import { afterXs2EventBookingCreated } from '../_lib/xs2eventNotify.js'

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
    const apiUrl = String(process.env.XS2EVENT_API_URL || '').toLowerCase()
    const isTestHost = apiUrl.includes('testapi') || apiUrl.includes('test')
    const invoicePrefix = isTestHost ? 'HW-TEST' : 'HW-INV'
    const bookingPrefix = isTestHost ? 'HW-TEST-BOOK' : 'HW-BOOK'

    const invoiceReference =
      String(body.invoice_reference || '').trim().slice(0, 80) || `${invoicePrefix}-${stamp}`
    const bookingReference =
      String(body.booking_reference || '').trim().slice(0, 80) || `${bookingPrefix}-${stamp}`

    const payload = {
      reservation_id: reservationId,
      booking_email: bookingEmail,
      invoice_reference: invoiceReference,
      booking_reference: bookingReference,
      payment_method: 'invoice',
      is_test_booking: isTestHost ? true : Boolean(body.is_test_booking),
    }

    const booking = await xs2eventPost('/v1/bookings', payload)

    const sideEffects = await afterXs2EventBookingCreated({
      booking,
      reservationId,
      bookingEmail,
      isTestHost,
    })

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking,
      payment: {
        method: 'invoice',
        is_test: isTestHost,
        note: isTestHost
          ? 'XS2Event TEST booking — invoice method, no live card charge.'
          : 'Settled by invoice. Honeywell Travel will send payment instructions separately.',
      },
      side_effects: {
        persisted: Boolean(sideEffects?.persist?.ok),
        emailed: Boolean(sideEffects?.email?.ok),
        crm_synced: Boolean(sideEffects?.crm?.ok),
      },
    })
  } catch (err) {
    return sendXs2EventError(res, err)
  }
}

/**
 * POST /api/xs2event/reservations
 * Creates an XS2Event reservation. Server re-fetches ticket net_rate/currency
 * so the browser cannot spoof prices (per XS2Event booking-flow docs).
 * Does NOT create a booking or take payment.
 */
import {
  xs2eventGet,
  xs2eventPost,
  sendXs2EventError,
  Xs2EventError,
} from '../_lib/xs2event.js'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

async function fetchTicketById(ticketId) {
  const data = await xs2eventGet('/v1/tickets', {
    ticket_id: ticketId,
    page_size: '1',
  })
  const tickets = Array.isArray(data?.tickets) ? data.tickets : []
  const ticket = tickets.find((item) => item?.ticket_id === ticketId) || tickets[0]
  if (!ticket) {
    throw new Xs2EventError('Ticket was not found.', 404, 'xs2event_ticket_not_found')
  }
  return ticket
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
    const ticketId = String(body.ticket_id || '').trim()
    const quantity = Number(body.quantity)
    const bookingEmail = String(body.booking_email || '').trim()
    const notes = body.notes != null ? String(body.notes).trim().slice(0, 500) : ''

    if (!ticketId) {
      throw new Xs2EventError('ticket_id is required.', 400, 'xs2event_missing_ticket_id')
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new Xs2EventError(
        'quantity must be an integer between 1 and 20.',
        400,
        'xs2event_invalid_quantity',
      )
    }
    if (!isValidEmail(bookingEmail)) {
      throw new Xs2EventError(
        'A valid booking_email is required.',
        400,
        'xs2event_invalid_email',
      )
    }

    const ticket = await fetchTicketById(ticketId)
    const netRate = Number(ticket.net_rate)
    const currencyCode = String(ticket.currency_code || 'EUR').trim() || 'EUR'

    if (!Number.isFinite(netRate)) {
      throw new Xs2EventError(
        'Ticket is missing a valid net_rate from XS2Event.',
        502,
        'xs2event_invalid_ticket_rate',
      )
    }

    const minOrder = Number(ticket.min_order)
    if (Number.isFinite(minOrder) && minOrder > 0 && quantity < minOrder) {
      throw new Xs2EventError(
        `Minimum order for this ticket is ${minOrder}.`,
        400,
        'xs2event_min_order',
      )
    }

    const stock = Number(ticket.stock)
    if (Number.isFinite(stock) && stock >= 0 && quantity > stock) {
      throw new Xs2EventError(
        `Only ${stock} ticket(s) left in stock.`,
        409,
        'xs2event_out_of_stock',
      )
    }

    // No Honeywell markup in this phase — sales_price mirrors net_rate.
    const payload = {
      items: [
        {
          ticket_id: ticket.ticket_id,
          quantity,
          net_rate: netRate,
          currency_code: currencyCode,
          sales_price: netRate,
        },
      ],
      booking_email: bookingEmail,
      notify_me: true,
      notify_client: false,
      target_currency: currencyCode,
      ...(notes ? { notes } : {}),
    }

    const reservation = await xs2eventPost('/v1/reservations', payload)

    return res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      reservation,
      ticket_snapshot: {
        ticket_id: ticket.ticket_id,
        ticket_title: ticket.ticket_title || ticket.category_name || null,
        event_id: ticket.event_id || null,
        currency_code: currencyCode,
        net_rate: netRate,
        stock: ticket.stock ?? null,
        min_order: ticket.min_order ?? null,
      },
    })
  } catch (err) {
    return sendXs2EventError(res, err)
  }
}

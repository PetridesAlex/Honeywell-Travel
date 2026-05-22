export const FINANCIAL_RECORD_TYPES = [
  { id: 'invoice', label: 'Invoice (issued to client)' },
  { id: 'receipt', label: 'Receipt (payment received)' },
  { id: 'booking', label: 'Booking / package' }
]

export const PAYMENT_STATUS_OPTIONS = ['pending', 'partial', 'paid', 'overdue', 'cancelled']

export const PAYMENT_METHOD_OPTIONS = [
  'Bank transfer',
  'Cash',
  'Card',
  'Cheque',
  'PayPal',
  'Other'
]

export const CURRENCY_OPTIONS = ['EUR', 'GBP', 'USD']

export function parseMoney(value) {
  const num = Number(String(value ?? '').replace(/,/g, ''))
  return Number.isFinite(num) ? num : 0
}

export function formatMoney(amount, currency = 'EUR') {
  const num = parseMoney(amount)
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  } catch {
    return `${num.toFixed(2)} ${currency}`
  }
}

export function computeMargin(sellPrice, netPrice) {
  const sell = parseMoney(sellPrice)
  const net = parseMoney(netPrice)
  const margin = sell - net
  const marginPercent = sell > 0 ? (margin / sell) * 100 : 0
  return { sell, net, margin, marginPercent }
}

export function computeOutstanding(sellPrice, amountReceived) {
  return Math.max(0, parseMoney(sellPrice) - parseMoney(amountReceived))
}

export function summarizeFinancialRecords(records = [], currency = 'EUR') {
  const totals = records.reduce(
    (acc, row) => {
      const sell = parseMoney(row.sell_price)
      const net = parseMoney(row.net_price)
      const received = parseMoney(row.amount_received)
      const margin = parseMoney(row.margin ?? sell - net)
      acc.totalSell += sell
      acc.totalNet += net
      acc.totalMargin += margin
      acc.totalReceived += received
      acc.totalOutstanding += computeOutstanding(sell, received)
      return acc
    },
    {
      totalSell: 0,
      totalNet: 0,
      totalMargin: 0,
      totalReceived: 0,
      totalOutstanding: 0,
      currency
    }
  )

  totals.marginPercent =
    totals.totalSell > 0 ? (totals.totalMargin / totals.totalSell) * 100 : 0

  return totals
}

export function paymentStatusClass(status) {
  const key = String(status || 'pending').toLowerCase().replace(/\s+/g, '_')
  return `crm-fin-status crm-fin-status--${key}`
}

export function recordTypeLabel(type) {
  return FINANCIAL_RECORD_TYPES.find((t) => t.id === type)?.label || type || 'Record'
}

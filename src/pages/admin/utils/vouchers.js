export const VOUCHER_TYPES = [
  { id: 'honeymoon', label: 'Honeymoon', emoji: '💑' },
  { id: 'birthday', label: 'Birthday', emoji: '🎂' },
  { id: 'anniversary', label: 'Anniversary', emoji: '💍' },
  { id: 'holiday', label: 'Holiday', emoji: '✈️' },
  { id: 'travel_credit', label: 'Travel credit', emoji: '🌍' },
  { id: 'custom', label: 'Custom', emoji: '🎁' }
]

export const VOUCHER_STATUSES = [
  'draft',
  'active',
  'partially_paid',
  'fully_paid',
  'redeemed',
  'expired',
  'cancelled'
]

export const SENDER_PAYMENT_STATUSES = ['pending', 'paid', 'cancelled']

export const VOUCHER_PAYMENT_METHODS = [
  'cash',
  'card',
  'revolut',
  'bank transfer',
  'jcc',
  'other'
]

export const VOUCHER_TEMPLATES = {
  honeymoon: {
    title: 'Honeymoon Gift Voucher',
    message:
      'Wishing you a magical honeymoon filled with love, adventure, and unforgettable memories. Bon voyage from all of us at Honeywell Travel!'
  },
  birthday: {
    title: 'Birthday Travel Gift',
    message:
      'Happy Birthday! May your next journey be as wonderful as you are. With warm wishes from Honeywell Travel.'
  },
  anniversary: {
    title: 'Anniversary Celebration Voucher',
    message:
      'Congratulations on your anniversary! Celebrate with a special trip crafted just for you.'
  },
  holiday: {
    title: 'Holiday Gift Voucher',
    message: 'Enjoy a well-deserved holiday — your next adventure awaits with Honeywell Travel.'
  },
  travel_credit: {
    title: 'Travel Credit Voucher',
    message: 'Travel credit towards your dream destination with Honeywell Travel.'
  },
  custom: {
    title: 'Gift Travel Voucher',
    message: 'A special gift for your next journey with Honeywell Travel.'
  }
}

export const EMPTY_RECEIVER = {
  full_name: '',
  phone: '',
  email: '',
  nationality: '',
  notes: ''
}

export const EMPTY_VOUCHER = {
  voucher_title: '',
  voucher_type: 'honeymoon',
  receiver_id: '',
  total_amount: '',
  currency: 'EUR',
  status: 'draft',
  expiry_date: '',
  gift_message: '',
  template_key: 'honeymoon',
  notes: ''
}

export const EMPTY_SENDER = {
  full_name: '',
  phone: '',
  email: '',
  contribution_amount: '',
  payment_status: 'pending',
  payment_method: 'bank transfer',
  payment_date: '',
  notes: ''
}

export function generateVoucherCode() {
  const year = new Date().getFullYear()
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 6; i += 1) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `HV-${year}-${suffix}`
}

export function formatVoucherMoney(amount, currency = 'EUR') {
  const n = Number(amount)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n)
}

export function getVoucherTypeLabel(type) {
  return VOUCHER_TYPES.find((t) => t.id === type)?.label || type || 'Custom'
}

export function getVoucherTypeEmoji(type) {
  return VOUCHER_TYPES.find((t) => t.id === type)?.emoji || '🎁'
}

export function voucherStatusLabel(status) {
  return String(status || 'draft')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function voucherStatusClass(status) {
  return `crm-voucher-status crm-voucher-status--${(status || 'draft').replace(/_/g, '-')}`
}

export function sumPaidContributions(senders = []) {
  return senders
    .filter((s) => s.payment_status === 'paid')
    .reduce((sum, s) => sum + Number(s.contribution_amount || 0), 0)
}

export function sumPendingContributions(senders = []) {
  return senders
    .filter((s) => s.payment_status === 'pending')
    .reduce((sum, s) => sum + Number(s.contribution_amount || 0), 0)
}

export function computeVoucherBalance(voucher, senders = []) {
  const total = Number(voucher?.total_amount || 0)
  const collected = sumPaidContributions(senders)
  const pending = sumPendingContributions(senders)
  const remaining = Math.max(0, total - collected)
  const progress = total > 0 ? Math.min(100, (collected / total) * 100) : 0
  const fullyFunded = total > 0 && collected >= total
  return { total, collected, pending, remaining, progress, fullyFunded }
}

export function computeReceiverSummaries(receivers = [], vouchers = []) {
  const summaries = [...receivers]
    .map((receiver) => {
      const recvVouchers = vouchers.filter((v) => Number(v.receiver_id) === Number(receiver.id))
      let totalValue = 0
      let totalCollected = 0
      let senderCount = 0
      let lastActivityAt = receiver.updated_at || receiver.created_at || null

      recvVouchers.forEach((v) => {
        totalValue += Number(v.total_amount || 0)
        const bal = computeVoucherBalance(v, v.senders)
        totalCollected += bal.collected
        senderCount += (v.senders || []).filter((s) => s.full_name?.trim()).length
        const voucherActivity = v.updated_at || v.created_at
        if (voucherActivity && (!lastActivityAt || new Date(voucherActivity) > new Date(lastActivityAt))) {
          lastActivityAt = voucherActivity
        }
        ;(v.senders || []).forEach((s) => {
          if (s.payment_status === 'paid' && s.updated_at) {
            if (!lastActivityAt || new Date(s.updated_at) > new Date(lastActivityAt)) {
              lastActivityAt = s.updated_at
            }
          }
        })
      })

      const primaryVoucher = [...recvVouchers].sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      )[0]

      return {
        receiver,
        voucherCount: recvVouchers.length,
        totalValue,
        totalCollected,
        totalRemaining: Math.max(0, totalValue - totalCollected),
        senderCount,
        hasVoucher: recvVouchers.length > 0,
        hasFunds: totalCollected > 0,
        primaryVoucher,
        lastActivityAt
      }
    })
    .sort((a, b) => {
      if (a.hasFunds !== b.hasFunds) return a.hasFunds ? -1 : 1
      if (a.totalCollected !== b.totalCollected) return b.totalCollected - a.totalCollected
      if (a.hasVoucher !== b.hasVoucher) return a.hasVoucher ? -1 : 1
      if (a.lastActivityAt && b.lastActivityAt) {
        return new Date(b.lastActivityAt) - new Date(a.lastActivityAt)
      }
      return a.receiver.full_name.localeCompare(b.receiver.full_name)
    })

  return summaries
}

export function deriveVoucherStatus(voucher, senders = []) {
  const status = voucher?.status
  if (['cancelled', 'redeemed'].includes(status)) return status
  if (voucher?.expiry_date) {
    const expiry = new Date(voucher.expiry_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (expiry < today) return 'expired'
  }
  if (status === 'draft') return 'draft'
  const { total, collected, fullyFunded } = computeVoucherBalance(voucher, senders)
  if (fullyFunded) return 'fully_paid'
  if (collected > 0 && total > 0) return 'partially_paid'
  return status === 'draft' ? 'draft' : 'active'
}

export function voucherMatchesSearch(row, term) {
  const q = String(term || '').trim().toLowerCase()
  if (!q) return true
  const haystack = [
    row.voucher_code,
    row.voucher_title,
    row.receiver?.full_name,
    row.receiver?.email,
    row.receiver?.phone,
    ...(row.senders || []).map((s) => s.full_name),
    ...(row.senders || []).map((s) => s.email),
    ...(row.senders || []).map((s) => s.phone)
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

export function clientDisplayName(client) {
  return (
    [client?.first_name, client?.last_name].filter(Boolean).join(' ').trim() ||
    client?.email ||
    `Client #${client?.id}`
  )
}

export function parseSenderNamesBulk(text) {
  return String(text || '')
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function splitSenderAmount(total, count) {
  const n = Number(total)
  if (!Number.isFinite(n) || n <= 0 || count <= 0) return ''
  return (n / count).toFixed(2)
}

export function formatVoucherDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatVoucherDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function buildVoucherMailto(voucher, receiver, senders = []) {
  const to = receiver?.email || ''
  if (!to) return null
  const balance = computeVoucherBalance(voucher, senders)
  const subject = encodeURIComponent(`Your Honeywell Travel Gift Voucher — ${voucher.voucher_code}`)
  const body = encodeURIComponent(
    `Dear ${receiver.full_name || 'Guest'},\n\n` +
      `Your gift voucher "${voucher.voucher_title}" (${voucher.voucher_code}) is ready.\n\n` +
      `Value: ${formatVoucherMoney(voucher.total_amount, voucher.currency)}\n` +
      `Collected: ${formatVoucherMoney(balance.collected, voucher.currency)}\n` +
      (voucher.expiry_date ? `Valid until: ${formatVoucherDate(voucher.expiry_date)}\n` : '') +
      (voucher.gift_message ? `\nMessage:\n${voucher.gift_message}\n` : '') +
      `\nHoneywell Travel`
  )
  return `mailto:${to}?subject=${subject}&body=${body}`
}

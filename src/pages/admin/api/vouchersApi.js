import { supabase } from '../../../lib/supabase'
import { deriveVoucherStatus, generateVoucherCode } from '../utils/vouchers'

const VOUCHER_SELECT = `
  *,
  receiver:voucher_receivers(*),
  senders:voucher_senders(*),
  payments:voucher_payments(*),
  activities:voucher_activities(*)
`

async function currentAuthor() {
  const { data } = await supabase.auth.getUser()
  const user = data?.user
  if (!user) return { id: null, name: 'Staff' }
  const meta = user.user_metadata || {}
  const name =
    meta.display_name ||
    meta.full_name ||
    meta.name ||
    user.email?.split('@')[0] ||
    'Staff'
  return { id: user.id, name: String(name).trim() }
}

function formatVoucherError(error) {
  const msg = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase()
  if (
    msg.includes('gift_vouchers') ||
    msg.includes('voucher_receivers') ||
    msg.includes('voucher_senders') ||
    msg.includes('voucher_payments') ||
    msg.includes('could not find the table') ||
    msg.includes('relation') && msg.includes('does not exist')
  ) {
    return 'Gift voucher tables are missing. Run supabase/fix_gift_vouchers.sql in the Supabase SQL Editor, then refresh.'
  }
  return error?.message || 'Something went wrong'
}

function buildReceiverPayload(raw = {}) {
  const payload = {
    full_name: (raw.full_name || '').trim(),
    phone: (raw.phone || '').trim() || null,
    email: raw.email ? String(raw.email).trim().toLowerCase() : null,
    nationality: (raw.nationality || '').trim() || null,
    notes: (raw.notes || '').trim() || null,
    updated_at: new Date().toISOString()
  }
  if (raw.client_id) payload.client_id = Number(raw.client_id)
  return payload
}

export function clientToReceiverPayload(client) {
  const fullName =
    [client?.first_name, client?.last_name].filter(Boolean).join(' ').trim() ||
    client?.email ||
    'CRM client'
  return {
    full_name: fullName,
    phone: client?.phone || null,
    email: client?.email || null,
    nationality: client?.nationality || null,
    client_id: client?.id || null,
    notes: client?.id ? `Linked CRM client #${client.id}` : null
  }
}

async function insertReceiver(payload) {
  let clean = buildReceiverPayload(payload)
  let { data, error } = await supabase.from('voucher_receivers').insert(clean).select().single()
  if (error && clean.client_id && `${error.message}`.toLowerCase().includes('client_id')) {
    delete clean.client_id
    ;({ data, error } = await supabase.from('voucher_receivers').insert(clean).select().single())
  }
  return { data, error: error ? { message: formatVoucherError(error) } : null }
}

export async function ensureReceiverFromClient(client) {
  if (!client?.id) return { data: null, error: { message: 'Select a CRM client.' } }

  const byClient = await supabase
    .from('voucher_receivers')
    .select('*')
    .eq('client_id', client.id)
    .maybeSingle()

  if (!byClient.error && byClient.data) {
    return { data: byClient.data, error: null }
  }

  const email = client.email ? String(client.email).trim().toLowerCase() : null
  if (email) {
    const byEmail = await supabase
      .from('voucher_receivers')
      .select('*')
      .ilike('email', email)
      .limit(1)
      .maybeSingle()

    if (!byEmail.error && byEmail.data) {
      if (!byEmail.data.client_id) {
        await supabase
          .from('voucher_receivers')
          .update({ client_id: client.id, updated_at: new Date().toISOString() })
          .eq('id', byEmail.data.id)
      }
      return { data: { ...byEmail.data, client_id: byEmail.data.client_id || client.id }, error: null }
    }
  }

  return insertReceiver(clientToReceiverPayload(client))
}

function buildVoucherPayload(raw = {}, code) {
  return {
    voucher_code: code || raw.voucher_code,
    voucher_title: (raw.voucher_title || '').trim(),
    voucher_type: raw.voucher_type || 'custom',
    receiver_id: raw.receiver_id ? Number(raw.receiver_id) : null,
    total_amount: Number(raw.total_amount || 0),
    currency: raw.currency || 'EUR',
    status: raw.status || 'draft',
    expiry_date: raw.expiry_date || null,
    gift_message: (raw.gift_message || '').trim() || null,
    template_key: raw.template_key || raw.voucher_type || null,
    notes: (raw.notes || '').trim() || null,
    updated_at: new Date().toISOString()
  }
}

function buildSenderPayload(raw = {}) {
  return {
    full_name: (raw.full_name || '').trim(),
    phone: (raw.phone || '').trim() || null,
    email: raw.email ? String(raw.email).trim().toLowerCase() : null,
    contribution_amount: Number(raw.contribution_amount || 0),
    payment_status: raw.payment_status || 'pending',
    payment_method: raw.payment_method || null,
    payment_date: raw.payment_date || null,
    notes: (raw.notes || '').trim() || null,
    updated_at: new Date().toISOString()
  }
}

export async function fetchVouchersWithDetails() {
  const { data, error } = await supabase
    .from('gift_vouchers')
    .select(VOUCHER_SELECT)
    .order('created_at', { ascending: false })

  if (error) return { data: [], error: { message: formatVoucherError(error) } }
  return { data: data || [], error: null }
}

export async function fetchVoucherById(id) {
  const { data, error } = await supabase
    .from('gift_vouchers')
    .select(VOUCHER_SELECT)
    .eq('id', id)
    .single()

  if (error) return { data: null, error: { message: formatVoucherError(error) } }
  return { data, error: null }
}

export async function fetchReceivers() {
  const { data, error } = await supabase
    .from('voucher_receivers')
    .select('*')
    .order('full_name', { ascending: true })

  if (error) return { data: [], error: { message: formatVoucherError(error) } }
  return { data: data || [], error: null }
}

export async function fetchReceiverProfile(id) {
  const { data: receiver, error: receiverError } = await supabase
    .from('voucher_receivers')
    .select('*')
    .eq('id', id)
    .single()

  if (receiverError) return { data: null, error: { message: formatVoucherError(receiverError) } }

  const { data: vouchers, error: vouchersError } = await supabase
    .from('gift_vouchers')
    .select(VOUCHER_SELECT)
    .eq('receiver_id', id)
    .order('created_at', { ascending: false })

  if (vouchersError) return { data: null, error: { message: formatVoucherError(vouchersError) } }

  const list = vouchers || []
  const totalValue = list.reduce((sum, v) => sum + Number(v.total_amount || 0), 0)
  let totalCollected = 0
  const senderMap = new Map()
  const allSenders = []

  list.forEach((v) => {
    ;(v.senders || []).forEach((s) => {
      const paid = s.payment_status === 'paid' ? Number(s.contribution_amount || 0) : 0
      totalCollected += paid
      const key = `${s.full_name?.toLowerCase() || ''}-${s.id}`
      const row = {
        ...s,
        voucher_id: v.id,
        voucher_code: v.voucher_code,
        voucher_title: v.voucher_title
      }
      allSenders.push(row)
      if (!senderMap.has(key)) {
        senderMap.set(key, {
          ...s,
          total_contributed: 0,
          vouchers: []
        })
      }
      const entry = senderMap.get(key)
      entry.total_contributed += Number(s.contribution_amount || 0)
      if (!entry.vouchers.includes(v.voucher_code)) entry.vouchers.push(v.voucher_code)
    })
  })

  const primaryVoucher =
    list.find((v) => !['cancelled', 'redeemed', 'expired'].includes(v.status)) || list[0] || null

  return {
    data: {
      receiver,
      vouchers: list,
      totalValue,
      totalCollected,
      totalRemaining: Math.max(0, totalValue - totalCollected),
      primaryVoucher,
      senders: [...senderMap.values()],
      allSenders
    },
    error: null
  }
}

export async function createReceiver(payload) {
  const { data, error } = await insertReceiver(payload)
  return { data, error }
}

export async function updateReceiver(id, payload) {
  const clean = buildReceiverPayload(payload)
  const { data, error } = await supabase
    .from('voucher_receivers')
    .update(clean)
    .eq('id', id)
    .select()
    .single()
  return { data, error: error ? { message: formatVoucherError(error) } : null }
}

export async function createVoucher(payload, senders = []) {
  const code = payload.voucher_code || generateVoucherCode()
  const clean = buildVoucherPayload(payload, code)
  const { data, error } = await supabase.from('gift_vouchers').insert(clean).select().single()
  if (error) return { data: null, error: { message: formatVoucherError(error) } }

  const author = await currentAuthor()
  await addVoucherActivity(data.id, 'created', `Voucher ${code} created`, author.name)

  if (senders.length) {
    for (const sender of senders) {
      await createSender(data.id, sender)
    }
  }

  return fetchVoucherById(data.id)
}

export async function updateVoucher(id, payload) {
  const clean = buildVoucherPayload({ ...payload, voucher_code: payload.voucher_code }, payload.voucher_code)
  delete clean.voucher_code
  const { data, error } = await supabase
    .from('gift_vouchers')
    .update(clean)
    .eq('id', id)
    .select()
    .single()
  if (error) return { data: null, error: { message: formatVoucherError(error) } }
  return syncVoucherStatus(id)
}

export async function syncVoucherStatus(voucherId) {
  const { data: voucher, error } = await fetchVoucherById(voucherId)
  if (error || !voucher) return { data: null, error }

  const nextStatus = deriveVoucherStatus(voucher, voucher.senders || [])
  if (nextStatus !== voucher.status) {
    await supabase
      .from('gift_vouchers')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', voucherId)
  }
  return fetchVoucherById(voucherId)
}

export async function createSender(voucherId, payload) {
  const clean = { ...buildSenderPayload(payload), voucher_id: voucherId }
  const { data, error } = await supabase.from('voucher_senders').insert(clean).select().single()
  if (error) return { data: null, error: { message: formatVoucherError(error) } }

  const author = await currentAuthor()
  await addVoucherActivity(
    voucherId,
    'sender_added',
    `${clean.full_name} added for ${formatVoucherMoney(clean.contribution_amount)}`,
    author.name
  )

  if (clean.payment_status === 'paid') {
    await recordPaymentFromSender(data, author.name)
  }

  await syncVoucherStatus(voucherId)
  return { data, error: null }
}

export async function updateSender(id, voucherId, payload) {
  const prev = await supabase.from('voucher_senders').select('*').eq('id', id).single()
  const clean = buildSenderPayload(payload)
  const { data, error } = await supabase
    .from('voucher_senders')
    .update(clean)
    .eq('id', id)
    .select()
    .single()
  if (error) return { data: null, error: { message: formatVoucherError(error) } }

  const author = await currentAuthor()
  if (prev.data?.payment_status !== 'paid' && clean.payment_status === 'paid') {
    await recordPaymentFromSender(data, author.name)
  }

  await syncVoucherStatus(voucherId)
  return { data, error: null }
}

function formatVoucherMoney(amount) {
  return `€${Number(amount || 0).toFixed(2)}`
}

async function recordPaymentFromSender(sender, authorName) {
  await supabase.from('voucher_payments').insert({
    voucher_id: sender.voucher_id,
    sender_id: sender.id,
    amount: sender.contribution_amount,
    payment_method: sender.payment_method,
    payment_status: 'paid',
    payment_date: sender.payment_date || new Date().toISOString(),
    notes: sender.notes,
    created_by_name: authorName
  })
  await addVoucherActivity(
    sender.voucher_id,
    'payment',
    `Payment received from ${sender.full_name} — ${formatVoucherMoney(sender.contribution_amount)}`,
    authorName
  )
}

export async function deleteSender(id, voucherId) {
  const { error } = await supabase.from('voucher_senders').delete().eq('id', id)
  if (error) return { error: { message: formatVoucherError(error) } }
  await syncVoucherStatus(voucherId)
  return { error: null }
}

export async function fetchAllPayments() {
  const { data, error } = await supabase
    .from('voucher_payments')
    .select('*, voucher:gift_vouchers(voucher_code, voucher_title), sender:voucher_senders(full_name)')
    .order('payment_date', { ascending: false })

  if (error) return { data: [], error: { message: formatVoucherError(error) } }
  return { data: data || [], error: null }
}

export async function addVoucherActivity(voucherId, type, description, authorName) {
  await supabase.from('voucher_activities').insert({
    voucher_id: voucherId,
    activity_type: type,
    description,
    created_by_name: authorName
  })
}

export async function addVoucherNote(voucherId, note) {
  const author = await currentAuthor()
  return addVoucherActivity(voucherId, 'note', note, author.name)
}

export function computeDashboardStats(vouchers = []) {
  const active = vouchers.filter((v) => !['cancelled', 'redeemed', 'expired'].includes(v.status))
  const revenue = vouchers.reduce((sum, v) => {
    const paid = (v.senders || [])
      .filter((s) => s.payment_status === 'paid')
      .reduce((a, s) => a + Number(s.contribution_amount || 0), 0)
    return sum + paid
  }, 0)
  const unpaid = vouchers.reduce((sum, v) => {
    const total = Number(v.total_amount || 0)
    const paid = (v.senders || [])
      .filter((s) => s.payment_status === 'paid')
      .reduce((a, s) => a + Number(s.contribution_amount || 0), 0)
    return sum + Math.max(0, total - paid)
  }, 0)

  const today = new Date()
  const in30 = new Date(today)
  in30.setDate(in30.getDate() + 30)
  const upcomingExpiries = vouchers.filter((v) => {
    if (!v.expiry_date) return false
    const d = new Date(v.expiry_date)
    return d >= today && d <= in30
  })

  const senderTotals = {}
  const receiverTotals = {}
  vouchers.forEach((v) => {
    const recv = v.receiver?.full_name
    if (recv) receiverTotals[recv] = (receiverTotals[recv] || 0) + Number(v.total_amount || 0)
    ;(v.senders || [])
      .filter((s) => s.payment_status === 'paid')
      .forEach((s) => {
        senderTotals[s.full_name] = (senderTotals[s.full_name] || 0) + Number(s.contribution_amount || 0)
      })
  })

  const topSenders = Object.entries(senderTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const topReceivers = Object.entries(receiverTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return {
    activeCount: active.length,
    revenue,
    unpaid,
    recent: vouchers.slice(0, 8),
    upcomingExpiries,
    topSenders,
    topReceivers
  }
}

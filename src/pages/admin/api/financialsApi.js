import { supabase } from '../../../lib/supabase'
import { parseMoney } from '../utils/financials'

function buildPayload(raw = {}, clientId) {
  return {
    client_id: clientId,
    lead_id: raw.lead_id ? Number(raw.lead_id) : null,
    record_type: raw.record_type || 'invoice',
    reference_no: (raw.reference_no || '').trim() || null,
    title: (raw.title || '').trim() || 'Untitled',
    sell_price: parseMoney(raw.sell_price),
    net_price: parseMoney(raw.net_price),
    amount_received: parseMoney(raw.amount_received),
    currency: raw.currency || 'EUR',
    payment_status: raw.payment_status || 'pending',
    payment_method: (raw.payment_method || '').trim() || null,
    invoice_date: raw.invoice_date || null,
    due_date: raw.due_date || null,
    paid_date: raw.paid_date || null,
    supplier_name: (raw.supplier_name || '').trim() || null,
    notes: (raw.notes || '').trim() || null,
    updated_at: new Date().toISOString()
  }
}

export async function fetchFinancialRecordsForClient(clientId) {
  const { data, error } = await supabase
    .from('client_financial_records')
    .select('*')
    .eq('client_id', clientId)
    .order('invoice_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  return { data: data || [], error }
}

export async function createFinancialRecord(clientId, payload) {
  const clean = buildPayload(payload, clientId)
  const { data, error } = await supabase
    .from('client_financial_records')
    .insert(clean)
    .select()
    .single()
  return { data, error }
}

export async function updateFinancialRecord(id, clientId, payload) {
  const clean = buildPayload(payload, clientId)
  const { data, error } = await supabase
    .from('client_financial_records')
    .update(clean)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deleteFinancialRecord(id) {
  const { error } = await supabase.from('client_financial_records').delete().eq('id', id)
  return { error }
}

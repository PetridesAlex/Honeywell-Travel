import { supabase } from '../../../lib/supabase'

function formatError(error) {
  const msg = error?.message || 'Request failed'
  if (msg.includes('package_quote')) {
    return `${msg} — run supabase/fix_package_quotes.sql in Supabase SQL editor.`
  }
  return msg
}

function buildQuotePayload(raw = {}) {
  return {
    title: (raw.title || 'Untitled package').trim(),
    client_name: (raw.client_name || '').trim() || null,
    destination: (raw.destination || '').trim() || null,
    trip_type: (raw.trip_type || '').trim() || null,
    pax: Math.max(1, Number(raw.pax) || 1),
    currency: raw.currency || 'EUR',
    target_margin_percent: Number(raw.target_margin_percent) || 0,
    notes: (raw.notes || '').trim() || null,
    updated_at: new Date().toISOString()
  }
}

function buildLinePayload(line, quoteId, sortOrder) {
  return {
    quote_id: quoteId,
    sort_order: sortOrder,
    service_name: (line.service_name || '').trim(),
    category: line.category || 'Other',
    supplier: (line.supplier || '').trim() || null,
    quantity: Math.max(0, Number(line.quantity) || 0),
    net_price: Number(line.net_price) || 0,
    sell_price: Number(line.sell_price) || 0,
    notes: (line.notes || '').trim() || null
  }
}

export async function fetchPackageQuotes() {
  const { data, error } = await supabase
    .from('package_quotes')
    .select('id, title, client_name, destination, trip_type, pax, currency, target_margin_percent, notes, created_at, updated_at')
    .order('updated_at', { ascending: false })

  return { data: data || [], error: error ? { message: formatError(error) } : null }
}

export async function fetchPackageQuote(id) {
  const { data, error } = await supabase
    .from('package_quotes')
    .select('*, lines:package_quote_lines(*)')
    .eq('id', id)
    .single()

  if (error) return { data: null, error: { message: formatError(error) } }

  const quote = {
    ...data,
    lines: (data.lines || []).sort((a, b) => a.sort_order - b.sort_order)
  }
  return { data: quote, error: null }
}

export async function savePackageQuote(quote, lines = []) {
  const payload = buildQuotePayload(quote)
  let quoteId = quote.id

  if (quoteId) {
    const { error: updateError } = await supabase.from('package_quotes').update(payload).eq('id', quoteId)
    if (updateError) return { data: null, error: { message: formatError(updateError) } }

    const { error: deleteError } = await supabase.from('package_quote_lines').delete().eq('quote_id', quoteId)
    if (deleteError) return { data: null, error: { message: formatError(deleteError) } }
  } else {
    const { data: created, error: createError } = await supabase
      .from('package_quotes')
      .insert(payload)
      .select()
      .single()
    if (createError) return { data: null, error: { message: formatError(createError) } }
    quoteId = created.id
  }

  const lineRows = lines
    .filter((line) => (line.service_name || '').trim() || parseMoneyLine(line))
    .map((line, index) => buildLinePayload(line, quoteId, index))

  if (lineRows.length) {
    const { error: linesError } = await supabase.from('package_quote_lines').insert(lineRows)
    if (linesError) return { data: null, error: { message: formatError(linesError) } }
  }

  return fetchPackageQuote(quoteId)
}

function parseMoneyLine(line) {
  return Number(line.net_price) > 0 || Number(line.sell_price) > 0
}

export async function deletePackageQuote(id) {
  const { error } = await supabase.from('package_quotes').delete().eq('id', id)
  return { error: error ? { message: formatError(error) } : null }
}

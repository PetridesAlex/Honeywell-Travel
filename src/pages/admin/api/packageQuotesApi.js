import { supabase } from '../../../lib/supabase'

export const PACKAGE_QUOTES_SETUP_HINT =
  'Open Supabase → SQL Editor → New query → paste the contents of supabase/fix_package_quotes.sql → Run. Then click “Check again” on this page.'

export function isPackageQuotesSchemaMissing(error) {
  if (!error) return false
  const msg = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase()
  return (
    msg.includes('package_quote') &&
    (msg.includes('schema cache') ||
      msg.includes('does not exist') ||
      msg.includes('could not find') ||
      msg.includes('relation') ||
      error?.code === '42P01' ||
      error?.code === 'PGRST205')
  )
}

function formatError(error) {
  if (isPackageQuotesSchemaMissing(error)) {
    return 'Package calculator tables are not set up in Supabase yet.'
  }
  return error?.message || 'Request failed'
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

  if (error) {
    return {
      data: [],
      error: { message: formatError(error), schemaMissing: isPackageQuotesSchemaMissing(error) }
    }
  }

  return { data: data || [], error: null, schemaMissing: false }
}

export async function fetchPackageQuote(id) {
  const { data, error } = await supabase
    .from('package_quotes')
    .select('*, lines:package_quote_lines(*)')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return {
      data: null,
      error: { message: formatError(error), schemaMissing: isPackageQuotesSchemaMissing(error) }
    }
  }

  if (!data) {
    return { data: null, error: { message: 'Package not found.' } }
  }

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
    if (updateError) {
      return {
        data: null,
        error: { message: formatError(updateError), schemaMissing: isPackageQuotesSchemaMissing(updateError) }
      }
    }

    const { error: deleteError } = await supabase.from('package_quote_lines').delete().eq('quote_id', quoteId)
    if (deleteError) {
      return {
        data: null,
        error: { message: formatError(deleteError), schemaMissing: isPackageQuotesSchemaMissing(deleteError) }
      }
    }
  } else {
    const { data: rows, error: createError } = await supabase.from('package_quotes').insert(payload).select()
    const created = Array.isArray(rows) ? rows[0] : rows
    if (createError) {
      return {
        data: null,
        error: { message: formatError(createError), schemaMissing: isPackageQuotesSchemaMissing(createError) }
      }
    }
    quoteId = created?.id
    if (!quoteId) {
      return { data: null, error: { message: 'Could not create package.' } }
    }
  }

  const lineRows = lines
    .filter((line) => (line.service_name || '').trim() || parseMoneyLine(line))
    .map((line, index) => buildLinePayload(line, quoteId, index))

  if (lineRows.length) {
    const { error: linesError } = await supabase.from('package_quote_lines').insert(lineRows)
    if (linesError) {
      return {
        data: null,
        error: { message: formatError(linesError), schemaMissing: isPackageQuotesSchemaMissing(linesError) }
      }
    }
  }

  return fetchPackageQuote(quoteId)
}

function parseMoneyLine(line) {
  return Number(line.net_price) > 0 || Number(line.sell_price) > 0
}

export async function deletePackageQuote(id) {
  const { error } = await supabase.from('package_quotes').delete().eq('id', id)
  return {
    error: error ? { message: formatError(error), schemaMissing: isPackageQuotesSchemaMissing(error) } : null
  }
}

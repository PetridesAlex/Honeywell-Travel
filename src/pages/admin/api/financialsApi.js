import { supabase } from '../../../lib/supabase'
import {
  derivePaymentStatus,
  generateAccountNumber,
  generateInvoiceReference,
  generateReceiptReference,
  parseMoney,
  sumPayments
} from '../utils/financials'

const RECORD_SELECT = '*, payments:client_financial_payments(*)'

function formatFinancialError(error) {
  const msg = error?.message || 'Request failed'
  if (msg.includes('client_accounts') || msg.includes('client_ledger') || msg.includes('client_financial_payments')) {
    return `${msg} — run supabase/fix_client_accounts.sql in Supabase SQL editor.`
  }
  if (msg.includes('client_financial_records')) {
    return `${msg} — run supabase/fix_client_financials.sql in Supabase SQL editor.`
  }
  return msg
}

function buildRecordPayload(raw = {}, clientId, accountId = null) {
  return {
    client_id: clientId,
    account_id: accountId,
    lead_id: raw.lead_id ? Number(raw.lead_id) : null,
    linked_invoice_id: raw.linked_invoice_id ? Number(raw.linked_invoice_id) : null,
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

export async function ensureClientAccount(clientId, currency = 'EUR') {
  const existing = await supabase
    .from('client_accounts')
    .select('*')
    .eq('client_id', clientId)
    .maybeSingle()

  if (existing.error) return { data: null, error: { message: formatFinancialError(existing.error) } }
  if (existing.data) return { data: existing.data, error: null }

  const account_number = generateAccountNumber(clientId)
  const { data, error } = await supabase
    .from('client_accounts')
    .insert({ client_id: clientId, account_number, currency })
    .select()
    .single()

  if (error) return { data: null, error: { message: formatFinancialError(error) } }

  await backfillLedgerForClient(clientId, data.id)

  return { data, error: null }
}

async function backfillLedgerForClient(clientId, accountId) {
  const { data: records } = await supabase
    .from('client_financial_records')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: true })

  if (!records?.length) return

  const { count } = await supabase
    .from('client_ledger_entries')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)

  if (count > 0) return

  for (const record of records) {
    await supabase
      .from('client_financial_records')
      .update({ account_id: accountId })
      .eq('id', record.id)

    const sell = parseMoney(record.sell_price)
    const received = parseMoney(record.amount_received)

    if (record.record_type === 'invoice' && sell > 0) {
      await insertLedgerEntry({
        client_id: clientId,
        account_id: accountId,
        financial_record_id: record.id,
        entry_type: 'debit',
        amount: sell,
        description: record.title,
        reference_no: record.reference_no,
        entry_date: record.invoice_date || record.created_at?.slice(0, 10)
      })
    }

    if (received > 0) {
      const { data: payment } = await supabase
        .from('client_financial_payments')
        .insert({
          financial_record_id: record.id,
          client_id: clientId,
          account_id: accountId,
          amount: received,
          payment_method: record.payment_method,
          payment_date: record.paid_date || record.invoice_date || new Date().toISOString().slice(0, 10),
          receipt_no: record.reference_no ? `REC-${record.reference_no}` : null,
          notes: 'Backfilled from existing record'
        })
        .select()
        .single()

      if (payment) {
        await insertLedgerEntry({
          client_id: clientId,
          account_id: accountId,
          financial_record_id: record.id,
          payment_id: payment.id,
          entry_type: 'credit',
          amount: received,
          description: `Payment — ${record.title}`,
          reference_no: payment.receipt_no,
          entry_date: payment.payment_date
        })
      }
    }
  }
}

async function insertLedgerEntry(payload) {
  const { error } = await supabase.from('client_ledger_entries').insert(payload)
  if (error) throw new Error(formatFinancialError(error))
}

export async function fetchClientAccountSummary(clientId) {
  const { data: account, error: accountError } = await ensureClientAccount(clientId)
  if (accountError) return { data: null, error: accountError }

  const { data: ledger, error: ledgerError } = await supabase
    .from('client_ledger_entries')
    .select('*')
    .eq('client_id', clientId)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (ledgerError) return { data: null, error: { message: formatFinancialError(ledgerError) } }

  return {
    data: { account, ledger: ledger || [] },
    error: null
  }
}

export async function fetchFinancialRecordsForClient(clientId) {
  const { data, error } = await supabase
    .from('client_financial_records')
    .select(RECORD_SELECT)
    .eq('client_id', clientId)
    .order('invoice_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) return { data: [], error: { message: formatFinancialError(error) } }
  return { data: data || [], error: null }
}

export async function syncFinancialRecord(recordId) {
  const { data: record, error: recordError } = await supabase
    .from('client_financial_records')
    .select('*, payments:client_financial_payments(*)')
    .eq('id', recordId)
    .single()

  if (recordError) return { data: null, error: { message: formatFinancialError(recordError) } }

  const payments = record.payments || []
  const received = sumPayments(payments)
  const status = derivePaymentStatus(record, payments)
  const paid_date =
    status === 'paid'
      ? payments.length
        ? payments[payments.length - 1].payment_date
        : new Date().toISOString().slice(0, 10)
      : null

  const { data, error } = await supabase
    .from('client_financial_records')
    .update({
      amount_received: received,
      payment_status: status,
      paid_date,
      updated_at: new Date().toISOString()
    })
    .eq('id', recordId)
    .select(RECORD_SELECT)
    .single()

  return { data, error: error ? { message: formatFinancialError(error) } : null }
}

export async function createInvoice(clientId, payload) {
  const { data: account, error: accountError } = await ensureClientAccount(clientId, payload.currency || 'EUR')
  if (accountError) return { data: null, error: accountError }

  const { count } = await supabase
    .from('client_financial_records')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('record_type', 'invoice')

  const reference_no =
    (payload.reference_no || '').trim() || generateInvoiceReference(count || 0)

  const clean = buildRecordPayload(
    {
      ...payload,
      record_type: 'invoice',
      reference_no,
      amount_received: 0,
      payment_status: 'pending',
      invoice_date: payload.invoice_date || new Date().toISOString().slice(0, 10)
    },
    clientId,
    account.id
  )

  const { data, error } = await supabase
    .from('client_financial_records')
    .insert(clean)
    .select(RECORD_SELECT)
    .single()

  if (error) return { data: null, error: { message: formatFinancialError(error) } }

  if (clean.sell_price > 0) {
    try {
      await insertLedgerEntry({
        client_id: clientId,
        account_id: account.id,
        financial_record_id: data.id,
        entry_type: 'debit',
        amount: clean.sell_price,
        description: clean.title,
        reference_no: clean.reference_no,
        entry_date: clean.invoice_date || new Date().toISOString().slice(0, 10)
      })
    } catch (ledgerErr) {
      return { data: null, error: { message: ledgerErr.message } }
    }
  }

  return { data, error: null }
}

export async function recordReceipt(clientId, invoiceId, payload) {
  const { data: account, error: accountError } = await ensureClientAccount(clientId)
  if (accountError) return { data: null, error: accountError }

  const { data: invoice, error: invoiceError } = await supabase
    .from('client_financial_records')
    .select('*, payments:client_financial_payments(*)')
    .eq('id', invoiceId)
    .eq('client_id', clientId)
    .single()

  if (invoiceError || !invoice) {
    return { data: null, error: { message: 'Invoice not found.' } }
  }

  const amount = parseMoney(payload.amount)
  if (amount <= 0) return { data: null, error: { message: 'Enter a valid receipt amount.' } }

  const outstanding = parseMoney(invoice.sell_price) - sumPayments(invoice.payments)
  if (amount > outstanding + 0.001) {
    return {
      data: null,
      error: { message: `Amount exceeds outstanding balance (${outstanding.toFixed(2)}).` }
    }
  }

  const { count } = await supabase
    .from('client_financial_payments')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)

  const receipt_no =
    (payload.receipt_no || '').trim() || generateReceiptReference(count || 0)

  const { data: payment, error: paymentError } = await supabase
    .from('client_financial_payments')
    .insert({
      financial_record_id: invoiceId,
      client_id: clientId,
      account_id: account.id,
      amount,
      payment_method: payload.payment_method || 'Bank transfer',
      payment_date: payload.payment_date || new Date().toISOString().slice(0, 10),
      receipt_no,
      notes: (payload.notes || '').trim() || null
    })
    .select()
    .single()

  if (paymentError) return { data: null, error: { message: formatFinancialError(paymentError) } }

  try {
    await insertLedgerEntry({
      client_id: clientId,
      account_id: account.id,
      financial_record_id: invoiceId,
      payment_id: payment.id,
      entry_type: 'credit',
      amount,
      description: `Receipt — ${invoice.title}`,
      reference_no: receipt_no,
      entry_date: payment.payment_date
    })
  } catch (ledgerErr) {
    await supabase.from('client_financial_payments').delete().eq('id', payment.id)
    return { data: null, error: { message: ledgerErr.message } }
  }

  const { data: receiptRecord } = await supabase
    .from('client_financial_records')
    .insert(
      buildRecordPayload(
        {
          record_type: 'receipt',
          reference_no: receipt_no,
          title: `Receipt for ${invoice.reference_no || invoice.title}`,
          sell_price: amount,
          net_price: 0,
          amount_received: amount,
          payment_status: 'paid',
          payment_method: payload.payment_method,
          invoice_date: payment.payment_date,
          paid_date: payment.payment_date,
          linked_invoice_id: invoiceId,
          notes: payload.notes
        },
        clientId,
        account.id
      )
    )
    .select()
    .single()

  const syncResult = await syncFinancialRecord(invoiceId)
  return {
    data: { payment, invoice: syncResult.data, receiptRecord },
    error: null
  }
}

export async function createFinancialRecord(clientId, payload) {
  if (payload.record_type === 'invoice' || !payload.record_type) {
    return createInvoice(clientId, payload)
  }
  return createInvoice(clientId, { ...payload, record_type: 'invoice' })
}

export async function updateFinancialRecord(id, clientId, payload) {
  const { data: account } = await ensureClientAccount(clientId, payload.currency || 'EUR')

  const clean = buildRecordPayload(payload, clientId, account?.id || payload.account_id)
  delete clean.amount_received

  const { data, error } = await supabase
    .from('client_financial_records')
    .update(clean)
    .eq('id', id)
    .select(RECORD_SELECT)
    .single()

  if (error) return { data: null, error: { message: formatFinancialError(error) } }

  if (clean.record_type === 'invoice' && account?.id) {
    const { data: existingDebit } = await supabase
      .from('client_ledger_entries')
      .select('id')
      .eq('financial_record_id', id)
      .eq('entry_type', 'debit')
      .limit(1)
      .maybeSingle()

    if (existingDebit?.id) {
      await supabase
        .from('client_ledger_entries')
        .update({
          amount: clean.sell_price,
          description: clean.title,
          reference_no: clean.reference_no,
          entry_date: clean.invoice_date
        })
        .eq('id', existingDebit.id)
    } else if (clean.sell_price > 0) {
      await insertLedgerEntry({
        client_id: clientId,
        account_id: account.id,
        financial_record_id: id,
        entry_type: 'debit',
        amount: clean.sell_price,
        description: clean.title,
        reference_no: clean.reference_no,
        entry_date: clean.invoice_date || new Date().toISOString().slice(0, 10)
      })
    }

    await syncFinancialRecord(id)
    const refreshed = await supabase.from('client_financial_records').select(RECORD_SELECT).eq('id', id).single()
    return { data: refreshed.data, error: null }
  }

  return { data, error: null }
}

export async function deleteFinancialRecord(id) {
  await supabase.from('client_ledger_entries').delete().eq('financial_record_id', id)
  await supabase.from('client_financial_records').delete().eq('linked_invoice_id', id)
  const { error } = await supabase.from('client_financial_records').delete().eq('id', id)
  return { error: error ? { message: formatFinancialError(error) } : null }
}

export async function deletePayment(paymentId, invoiceId) {
  const { error } = await supabase.from('client_financial_payments').delete().eq('id', paymentId)
  if (error) return { error: { message: formatFinancialError(error) } }
  await syncFinancialRecord(invoiceId)
  return { error: null }
}

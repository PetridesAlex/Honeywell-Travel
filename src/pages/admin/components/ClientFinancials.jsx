import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Calculator,
  FileText,
  Plus,
  Receipt,
  TrendingUp,
  Wallet
} from 'lucide-react'
import {
  createInvoice,
  deleteFinancialRecord,
  fetchClientAccountSummary,
  fetchFinancialRecordsForClient,
  recordReceipt,
  updateFinancialRecord
} from '../api/financialsApi'
import FinancialRecordModal from './FinancialRecordModal'
import FinancialReceiptModal from './FinancialReceiptModal'
import {
  computeOutstanding,
  formatMoney,
  formatShortDate,
  ledgerEntryLabel,
  paymentStatusClass,
  recordTypeLabel,
  summarizeFinancialRecords,
  summarizeLedger,
  sumPayments
} from '../utils/financials'

function ClientFinancials({ clientId, leads = [] }) {
  const [records, setRecords] = useState([])
  const [account, setAccount] = useState(null)
  const [ledger, setLedger] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [receiptInvoice, setReceiptInvoice] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [view, setView] = useState('invoices')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    const [recordsRes, accountRes] = await Promise.all([
      fetchFinancialRecordsForClient(clientId),
      fetchClientAccountSummary(clientId)
    ])

    if (recordsRes.error) {
      setError(recordsRes.error.message)
      setRecords([])
    } else {
      setRecords(recordsRes.data || [])
    }

    if (accountRes.error) {
      if (!recordsRes.error) setError(accountRes.error.message)
      setAccount(null)
      setLedger([])
    } else {
      setAccount(accountRes.data?.account || null)
      setLedger(accountRes.data?.ledger || [])
    }

    setLoading(false)
  }, [clientId])

  useEffect(() => {
    load()
  }, [load])

  const invoices = useMemo(
    () => records.filter((r) => r.record_type === 'invoice' || r.record_type === 'booking'),
    [records]
  )

  const receipts = useMemo(() => records.filter((r) => r.record_type === 'receipt'), [records])

  const summary = useMemo(() => summarizeFinancialRecords(invoices), [invoices])
  const ledgerSummary = useMemo(() => summarizeLedger(ledger), [ledger])

  const openCreateInvoice = () => {
    setSaveError('')
    setSelected(null)
    setInvoiceModalOpen(true)
  }

  const openEditInvoice = (record) => {
    setSaveError('')
    setSelected(record)
    setInvoiceModalOpen(true)
  }

  const openReceipt = (invoice) => {
    setSaveError('')
    setReceiptInvoice(invoice)
    setReceiptModalOpen(true)
  }

  const handleSaveInvoice = async (form) => {
    if (!form.title?.trim()) {
      setSaveError('Description is required.')
      return
    }
    setSaving(true)
    setSaveError('')

    const { data, error: saveErr } = selected?.id
      ? await updateFinancialRecord(selected.id, clientId, { ...form, record_type: 'invoice' })
      : await createInvoice(clientId, form)

    if (saveErr) {
      setSaveError(saveErr.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setInvoiceModalOpen(false)
    setSelected(null)
    await load()
    if (data && !selected?.id) {
      setRecords((prev) => [data, ...prev.filter((r) => r.id !== data.id)])
    }
  }

  const handleSaveReceipt = async (form) => {
    if (!receiptInvoice?.id) return
    setSaving(true)
    setSaveError('')

    const { error: saveErr } = await recordReceipt(clientId, receiptInvoice.id, form)

    if (saveErr) {
      setSaveError(saveErr.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setReceiptModalOpen(false)
    setReceiptInvoice(null)
    await load()
  }

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete "${record.title}"? This removes linked ledger entries.`)) return
    const { error: delErr } = await deleteFinancialRecord(record.id)
    if (delErr) {
      setError(delErr.message)
      return
    }
    await load()
  }

  const setupRequired =
    error?.includes('fix_client_accounts') || error?.includes('fix_client_financials')

  return (
    <section className="crm-workspace crm-workspace--financials">
      <div className="crm-fin-head">
        <div className="crm-fin-head__title-wrap">
          <span className="crm-fin-head__icon" aria-hidden="true">
            <Calculator size={22} />
          </span>
          <div>
            <h2 className="crm-workspace__title">Client account</h2>
            <p className="crm-workspace__subtitle">
              Debit (invoices) and credit (receipts) — balances update automatically
            </p>
          </div>
        </div>
        <div className="crm-fin-head__actions">
          <button type="button" className="crm-btn crm-btn-primary crm-btn--financial-add" onClick={openCreateInvoice}>
            <FileText size={16} aria-hidden />
            Create invoice
          </button>
        </div>
      </div>

      {loading ? <div className="crm-state">Loading account…</div> : null}
      {!loading && error ? <div className="crm-state crm-state-error">{error}</div> : null}

      {!loading && setupRequired ? (
        <div className="crm-voucher-setup-banner" role="alert">
          <div className="crm-voucher-setup-banner__copy">
            <h3>Database setup required</h3>
            <p>
              Run <code>supabase/fix_client_financials.sql</code> then{' '}
              <code>supabase/fix_client_accounts.sql</code> in Supabase SQL editor, then refresh.
            </p>
          </div>
        </div>
      ) : null}

      {!loading && !error && account ? (
        <>
          <article className="crm-fin-account-card">
            <div className="crm-fin-account-card__main">
              <span className="crm-fin-account-card__label">Account number</span>
              <strong className="crm-fin-account-card__number">{account.account_number}</strong>
              <span className="crm-fin-account-card__currency">{account.currency}</span>
            </div>
            <div className="crm-fin-account-card__stats">
              <div className="crm-fin-account-stat crm-fin-account-stat--debit">
                <ArrowUpRight size={16} aria-hidden />
                <span>Total debits</span>
                <strong>{formatMoney(ledgerSummary.totalDebit, account.currency)}</strong>
                <em>Invoices issued</em>
              </div>
              <div className="crm-fin-account-stat crm-fin-account-stat--credit">
                <ArrowDownLeft size={16} aria-hidden />
                <span>Total credits</span>
                <strong>{formatMoney(ledgerSummary.totalCredit, account.currency)}</strong>
                <em>Receipts received</em>
              </div>
              <div className="crm-fin-account-stat crm-fin-account-stat--balance">
                <Wallet size={16} aria-hidden />
                <span>Balance due</span>
                <strong>{formatMoney(ledgerSummary.balance, account.currency)}</strong>
                <em>Client owes</em>
              </div>
            </div>
          </article>

          <div className="crm-fin-summary">
            <article className="crm-fin-summary__card">
              <span className="crm-fin-summary__label">
                <TrendingUp size={14} aria-hidden /> Total sell
              </span>
              <strong>{formatMoney(summary.totalSell, summary.currency)}</strong>
            </article>
            <article className="crm-fin-summary__card crm-fin-summary__card--margin">
              <span className="crm-fin-summary__label">Margin</span>
              <strong>
                {formatMoney(summary.totalMargin, summary.currency)}
                <em>{summary.marginPercent.toFixed(1)}%</em>
              </strong>
            </article>
            <article className="crm-fin-summary__card crm-fin-summary__card--received">
              <span className="crm-fin-summary__label">Received</span>
              <strong>{formatMoney(summary.totalReceived, summary.currency)}</strong>
            </article>
            <article className="crm-fin-summary__card crm-fin-summary__card--outstanding">
              <span className="crm-fin-summary__label">Outstanding</span>
              <strong>{formatMoney(summary.totalOutstanding, summary.currency)}</strong>
            </article>
          </div>

          <div className="crm-fin-tabs" role="tablist" aria-label="Account views">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'invoices'}
              className={`crm-fin-tab${view === 'invoices' ? ' crm-fin-tab--active' : ''}`}
              onClick={() => setView('invoices')}
            >
              <FileText size={15} aria-hidden />
              Invoices
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'receipts'}
              className={`crm-fin-tab${view === 'receipts' ? ' crm-fin-tab--active' : ''}`}
              onClick={() => setView('receipts')}
            >
              <Receipt size={15} aria-hidden />
              Receipts
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'ledger'}
              className={`crm-fin-tab${view === 'ledger' ? ' crm-fin-tab--active' : ''}`}
              onClick={() => setView('ledger')}
            >
              <BookOpen size={15} aria-hidden />
              Ledger
            </button>
          </div>

          {view === 'invoices' ? (
            invoices.length === 0 ? (
              <div className="crm-state">
                No invoices yet. Click <strong>Create invoice</strong> to debit the client account.
              </div>
            ) : (
              <div className="crm-table-wrap crm-table-wrap--financials">
                <table className="crm-table crm-table--financials">
                  <thead>
                    <tr>
                      <th>Invoice no.</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Received</th>
                      <th>Due</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((row) => {
                      const received = sumPayments(row.payments) || Number(row.amount_received) || 0
                      const outstanding = computeOutstanding(row.sell_price, received)
                      return (
                        <tr key={row.id}>
                          <td>
                            <code className="crm-fin-ref">{row.reference_no || `#${row.id}`}</code>
                            <span className="crm-fin-date">{formatShortDate(row.invoice_date)}</span>
                          </td>
                          <td>
                            <strong className="crm-fin-title">{row.title}</strong>
                            {row.supplier_name ? (
                              <span className="crm-fin-supplier">{row.supplier_name}</span>
                            ) : null}
                          </td>
                          <td className="crm-fin-num">{formatMoney(row.sell_price, row.currency)}</td>
                          <td className="crm-fin-num">{formatMoney(received, row.currency)}</td>
                          <td>
                            {outstanding > 0 ? (
                              <span className="crm-fin-due">{formatMoney(outstanding, row.currency)}</span>
                            ) : (
                              <span className="crm-fin-paid">Paid</span>
                            )}
                          </td>
                          <td>
                            <span className={paymentStatusClass(row.payment_status)}>
                              {row.payment_status}
                            </span>
                          </td>
                          <td>
                            <div className="crm-action-buttons">
                              {outstanding > 0 ? (
                                <button
                                  type="button"
                                  className="crm-btn crm-btn-primary crm-btn--small crm-btn--fin-receipt"
                                  onClick={() => openReceipt(row)}
                                >
                                  <Receipt size={13} aria-hidden />
                                  Receipt
                                </button>
                              ) : null}
                              <button type="button" className="crm-link-btn" onClick={() => openEditInvoice(row)}>
                                Edit
                              </button>
                              <button
                                type="button"
                                className="crm-btn crm-btn-danger crm-btn--small"
                                onClick={() => handleDelete(row)}
                              >
                                Delete
                              </button>
                            </div>
                            {(row.payments || []).length > 0 ? (
                              <ul className="crm-fin-payments-list">
                                {row.payments.map((p) => (
                                  <li key={p.id}>
                                    <Receipt size={12} aria-hidden />
                                    {p.receipt_no || 'Receipt'} — {formatMoney(p.amount, row.currency)} ·{' '}
                                    {formatShortDate(p.payment_date)}
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : null}

          {view === 'receipts' ? (
            receipts.length === 0 ? (
              <div className="crm-state">
                Receipts appear when you record payment against an invoice — the account balance reduces
                automatically.
              </div>
            ) : (
              <div className="crm-table-wrap crm-table-wrap--financials">
                <table className="crm-table crm-table--financials">
                  <thead>
                    <tr>
                      <th>Receipt no.</th>
                      <th>For invoice</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map((row) => {
                      const linked = invoices.find((i) => i.id === row.linked_invoice_id)
                      return (
                        <tr key={row.id}>
                          <td>
                            <code className="crm-fin-ref">{row.reference_no}</code>
                          </td>
                          <td>{linked?.reference_no || linked?.title || '—'}</td>
                          <td className="crm-fin-num">{formatMoney(row.sell_price, row.currency)}</td>
                          <td>{row.payment_method || '—'}</td>
                          <td>{formatShortDate(row.paid_date || row.invoice_date)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : null}

          {view === 'ledger' ? (
            ledger.length === 0 ? (
              <div className="crm-state">Ledger entries appear when you create invoices or record receipts.</div>
            ) : (
              <div className="crm-table-wrap crm-table-wrap--financials">
                <table className="crm-table crm-table--financials crm-table--ledger">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Reference</th>
                      <th>Description</th>
                      <th>Debit</th>
                      <th>Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((entry) => (
                      <tr key={entry.id} className={`crm-ledger-row crm-ledger-row--${entry.entry_type}`}>
                        <td>{formatShortDate(entry.entry_date)}</td>
                        <td>
                          <span className={`crm-ledger-type crm-ledger-type--${entry.entry_type}`}>
                            {entry.entry_type === 'debit' ? (
                              <ArrowUpRight size={13} aria-hidden />
                            ) : (
                              <ArrowDownLeft size={13} aria-hidden />
                            )}
                            {ledgerEntryLabel(entry.entry_type)}
                          </span>
                        </td>
                        <td>
                          <code>{entry.reference_no || '—'}</code>
                        </td>
                        <td>{entry.description || '—'}</td>
                        <td className="crm-fin-num crm-fin-num--debit">
                          {entry.entry_type === 'debit' ? formatMoney(entry.amount, account.currency) : '—'}
                        </td>
                        <td className="crm-fin-num crm-fin-num--credit">
                          {entry.entry_type === 'credit' ? formatMoney(entry.amount, account.currency) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : null}
        </>
      ) : null}

      <FinancialRecordModal
        open={invoiceModalOpen}
        initialRecord={selected}
        leads={leads}
        onClose={() => {
          setInvoiceModalOpen(false)
          setSelected(null)
        }}
        onSave={handleSaveInvoice}
        saving={saving}
        saveError={saveError}
      />

      <FinancialReceiptModal
        open={receiptModalOpen}
        invoice={receiptInvoice}
        onClose={() => {
          setReceiptModalOpen(false)
          setReceiptInvoice(null)
        }}
        onSave={handleSaveReceipt}
        saving={saving}
        saveError={saveError}
      />
    </section>
  )
}

export default ClientFinancials

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calculator, Plus, Receipt, TrendingUp, Wallet } from 'lucide-react'
import {
  createFinancialRecord,
  deleteFinancialRecord,
  fetchFinancialRecordsForClient,
  updateFinancialRecord
} from '../api/financialsApi'
import FinancialRecordModal from './FinancialRecordModal'
import {
  computeOutstanding,
  formatMoney,
  paymentStatusClass,
  recordTypeLabel,
  summarizeFinancialRecords
} from '../utils/financials'

function formatShortDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return '—'
  }
}

function ClientFinancials({ clientId, leads = [] }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: queryError } = await fetchFinancialRecordsForClient(clientId)
    if (queryError) {
      if (queryError.message?.includes('client_financial_records')) {
        setError(
          'Accounting table not found. Run supabase/fix_client_financials.sql in Supabase SQL editor.'
        )
      } else {
        setError(queryError.message)
      }
      setRecords([])
    } else {
      setRecords(data || [])
    }
    setLoading(false)
  }, [clientId])

  useEffect(() => {
    load()
  }, [load])

  const summary = useMemo(() => summarizeFinancialRecords(records), [records])

  const openCreate = () => {
    setSaveError('')
    setSelected(null)
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setSaveError('')
    setSelected(record)
    setModalOpen(true)
  }

  const handleSave = async (form) => {
    if (!form.title?.trim()) {
      setSaveError('Description is required.')
      return
    }
    setSaving(true)
    setSaveError('')

    const { data, error: saveErr } = selected?.id
      ? await updateFinancialRecord(selected.id, clientId, form)
      : await createFinancialRecord(clientId, form)

    if (saveErr) {
      setSaveError(saveErr.message)
      setSaving(false)
      return
    }

    if (selected?.id) {
      setRecords((prev) => prev.map((r) => (r.id === selected.id ? data : r)))
    } else {
      setRecords((prev) => [data, ...prev])
    }
    setSaving(false)
    setModalOpen(false)
    setSelected(null)
  }

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete "${record.title}"?`)) return
    const { error: delErr } = await deleteFinancialRecord(record.id)
    if (delErr) {
      setError(delErr.message)
      return
    }
    setRecords((prev) => prev.filter((r) => r.id !== record.id))
  }

  return (
    <section className="crm-workspace crm-workspace--financials">
      <div className="crm-fin-head">
        <div className="crm-fin-head__title-wrap">
          <span className="crm-fin-head__icon" aria-hidden="true">
            <Calculator size={22} />
          </span>
          <div>
            <h2 className="crm-workspace__title">Accounting &amp; payments</h2>
            <p className="crm-workspace__subtitle">
              Invoices, receipts, sell / net / margin — for your accountant
            </p>
          </div>
        </div>
        <button type="button" className="crm-btn crm-btn-primary crm-btn--financial-add" onClick={openCreate}>
          <Plus size={16} aria-hidden />
          Add invoice / receipt
        </button>
      </div>

      {loading ? <div className="crm-state">Loading financial records…</div> : null}
      {!loading && error ? <div className="crm-state crm-state-error">{error}</div> : null}

      {!loading && !error ? (
        <>
          <div className="crm-fin-summary">
            <article className="crm-fin-summary__card">
              <span className="crm-fin-summary__label">
                <TrendingUp size={14} aria-hidden /> Total sell
              </span>
              <strong>{formatMoney(summary.totalSell, summary.currency)}</strong>
              <p>What clients were charged</p>
            </article>
            <article className="crm-fin-summary__card">
              <span className="crm-fin-summary__label">
                <Receipt size={14} aria-hidden /> Total net cost
              </span>
              <strong>{formatMoney(summary.totalNet, summary.currency)}</strong>
              <p>Supplier / net cost</p>
            </article>
            <article className="crm-fin-summary__card crm-fin-summary__card--margin">
              <span className="crm-fin-summary__label">
                <Wallet size={14} aria-hidden /> Total margin
              </span>
              <strong>
                {formatMoney(summary.totalMargin, summary.currency)}
                <em>{summary.marginPercent.toFixed(1)}%</em>
              </strong>
              <p>Profit (sell − net)</p>
            </article>
            <article className="crm-fin-summary__card crm-fin-summary__card--received">
              <span className="crm-fin-summary__label">Received</span>
              <strong>{formatMoney(summary.totalReceived, summary.currency)}</strong>
              <p>Payments in from client</p>
            </article>
            <article className="crm-fin-summary__card crm-fin-summary__card--outstanding">
              <span className="crm-fin-summary__label">Outstanding</span>
              <strong>{formatMoney(summary.totalOutstanding, summary.currency)}</strong>
              <p>Still to collect</p>
            </article>
          </div>

          {records.length === 0 ? (
            <div className="crm-state">
              No invoices or receipts yet. Click <strong>Add invoice / receipt</strong> to record sell price,
              net cost, and payments.
            </div>
          ) : (
            <div className="crm-table-wrap crm-table-wrap--financials">
              <table className="crm-table crm-table--financials">
                <thead>
                  <tr>
                    <th>Ref / type</th>
                    <th>Description</th>
                    <th>Sell</th>
                    <th>Net</th>
                    <th>Margin</th>
                    <th>Received</th>
                    <th>Due</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((row) => {
                    const outstanding = computeOutstanding(row.sell_price, row.amount_received)
                    const sell = Number(row.sell_price) || 0
                    const marginPct = sell > 0 ? ((Number(row.margin) || 0) / sell) * 100 : 0
                    return (
                      <tr key={row.id}>
                        <td>
                          <span className="crm-fin-type">{recordTypeLabel(row.record_type)}</span>
                          <span className="crm-fin-ref">{row.reference_no || `#${row.id}`}</span>
                        </td>
                        <td>
                          <strong className="crm-fin-title">{row.title}</strong>
                          {row.supplier_name ? (
                            <span className="crm-fin-supplier">{row.supplier_name}</span>
                          ) : null}
                        </td>
                        <td className="crm-fin-num">{formatMoney(row.sell_price, row.currency)}</td>
                        <td className="crm-fin-num">{formatMoney(row.net_price, row.currency)}</td>
                        <td className="crm-fin-num crm-fin-num--margin">
                          {formatMoney(row.margin, row.currency)}
                          <span className="crm-fin-pct">{marginPct.toFixed(1)}%</span>
                        </td>
                        <td className="crm-fin-num">{formatMoney(row.amount_received, row.currency)}</td>
                        <td>
                          {outstanding > 0 ? (
                            <span className="crm-fin-due">{formatMoney(outstanding, row.currency)}</span>
                          ) : (
                            <span className="crm-fin-paid">Paid</span>
                          )}
                          <span className="crm-fin-date">{formatShortDate(row.due_date)}</span>
                        </td>
                        <td>
                          <span className={paymentStatusClass(row.payment_status)}>
                            {row.payment_status}
                          </span>
                        </td>
                        <td>
                          <div className="crm-action-buttons">
                            <button type="button" className="crm-link-btn" onClick={() => openEdit(row)}>
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
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}

      <FinancialRecordModal
        open={modalOpen}
        initialRecord={selected}
        leads={leads}
        onClose={() => {
          setModalOpen(false)
          setSelected(null)
        }}
        onSave={handleSave}
        saving={saving}
        saveError={saveError}
      />
    </section>
  )
}

export default ClientFinancials

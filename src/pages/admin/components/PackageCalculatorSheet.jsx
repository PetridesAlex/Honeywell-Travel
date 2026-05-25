import { Plus, Trash2 } from 'lucide-react'
import {
  PACKAGE_SERVICE_CATEGORIES,
  formatCalcMoney,
  formatMarginPercent,
  lineTotals,
  summarizePackageLines
} from '../utils/packageCalculator'

function SheetInput({ value, onChange, type = 'text', className = '', ...props }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={`crm-pkg-sheet__input${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}

function PackageCalculatorSheet({
  lines,
  currency,
  targetMarginPercent,
  onLineChange,
  onAddLine,
  onRemoveLine,
  onApplyTargetMargin
}) {
  const totals = summarizePackageLines(lines, currency)

  return (
    <div className="crm-pkg-sheet-wrap">
      <div className="crm-pkg-sheet-toolbar">
        <button type="button" className="crm-btn crm-btn-primary crm-btn--sm" onClick={onAddLine}>
          <Plus size={14} aria-hidden />
          Add service row
        </button>
        <button type="button" className="crm-btn crm-btn-ghost crm-btn--sm" onClick={onApplyTargetMargin}>
          Apply {targetMarginPercent || 0}% margin to sell prices
        </button>
      </div>

      <div className="crm-pkg-sheet-scroll">
        <table className="crm-pkg-sheet">
          <thead>
            <tr>
              <th className="crm-pkg-sheet__col-num">#</th>
              <th className="crm-pkg-sheet__col-service">Service</th>
              <th className="crm-pkg-sheet__col-category">Category</th>
              <th className="crm-pkg-sheet__col-supplier">Supplier</th>
              <th className="crm-pkg-sheet__col-qty">Qty</th>
              <th className="crm-pkg-sheet__col-money">Net ({currency})</th>
              <th className="crm-pkg-sheet__col-money">Sell ({currency})</th>
              <th className="crm-pkg-sheet__col-money">Margin</th>
              <th className="crm-pkg-sheet__col-pct">Margin %</th>
              <th className="crm-pkg-sheet__col-actions" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => {
              const row = lineTotals(line)
              const lineKey = line.localId || line.id || index
              return (
                <tr key={lineKey}>
                  <td className="crm-pkg-sheet__col-num">{index + 1}</td>
                  <td>
                    <SheetInput
                      value={line.service_name}
                      onChange={(value) => onLineChange(lineKey, 'service_name', value)}
                      placeholder="e.g. Hotel 5 nights"
                    />
                  </td>
                  <td>
                    <select
                      className="crm-pkg-sheet__select"
                      value={line.category}
                      onChange={(e) => onLineChange(lineKey, 'category', e.target.value)}
                    >
                      {PACKAGE_SERVICE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <SheetInput
                      value={line.supplier}
                      onChange={(value) => onLineChange(lineKey, 'supplier', value)}
                      placeholder="Supplier"
                    />
                  </td>
                  <td>
                    <SheetInput
                      type="number"
                      min="0"
                      step="1"
                      value={line.quantity}
                      onChange={(value) => onLineChange(lineKey, 'quantity', value)}
                      className="crm-pkg-sheet__input--num"
                    />
                  </td>
                  <td>
                    <SheetInput
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.net_price}
                      onChange={(value) => onLineChange(lineKey, 'net_price', value)}
                      className="crm-pkg-sheet__input--money"
                    />
                  </td>
                  <td>
                    <SheetInput
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.sell_price}
                      onChange={(value) => onLineChange(lineKey, 'sell_price', value)}
                      className="crm-pkg-sheet__input--money"
                    />
                  </td>
                  <td className="crm-pkg-sheet__calc">{formatCalcMoney(row.margin, currency)}</td>
                  <td className={`crm-pkg-sheet__calc crm-pkg-sheet__calc--pct${row.marginPercent < 0 ? ' crm-pkg-sheet__calc--negative' : ''}`}>
                    {formatMarginPercent(row.marginPercent)}
                  </td>
                  <td className="crm-pkg-sheet__col-actions">
                    <button
                      type="button"
                      className="crm-pkg-sheet__remove"
                      onClick={() => onRemoveLine(lineKey)}
                      aria-label="Remove row"
                      title="Remove row"
                    >
                      <Trash2 size={14} aria-hidden />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="crm-pkg-sheet__totals">
              <td colSpan={5}><strong>Package totals</strong></td>
              <td><strong>{formatCalcMoney(totals.totalNet, currency)}</strong></td>
              <td><strong>{formatCalcMoney(totals.totalSell, currency)}</strong></td>
              <td><strong>{formatCalcMoney(totals.totalMargin, currency)}</strong></td>
              <td><strong>{formatMarginPercent(totals.marginPercent)}</strong></td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export default PackageCalculatorSheet

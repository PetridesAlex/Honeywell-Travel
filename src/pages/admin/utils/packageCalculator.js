import { computeMargin, formatMoney, parseMoney } from './financials'

export const PACKAGE_SERVICE_CATEGORIES = [
  'Flight',
  'Hotel',
  'Transfer',
  'Excursion',
  'Insurance',
  'Visa',
  'Cruise',
  'Meals',
  'Fee',
  'Other'
]

export function createLocalLine(overrides = {}) {
  return {
    localId: crypto.randomUUID(),
    id: null,
    service_name: '',
    category: 'Hotel',
    supplier: '',
    quantity: 1,
    net_price: '',
    sell_price: '',
    notes: '',
    ...overrides
  }
}

export function createDefaultLines(count = 5) {
  return Array.from({ length: count }, () => createLocalLine())
}

export function lineTotals(line) {
  const qty = Math.max(0, parseMoney(line.quantity) || 1)
  const netUnit = parseMoney(line.net_price)
  const sellUnit = parseMoney(line.sell_price)
  const net = netUnit * qty
  const sell = sellUnit * qty
  const { margin, marginPercent } = computeMargin(sell, net)
  return { qty, netUnit, sellUnit, net, sell, margin, marginPercent }
}

export function summarizePackageLines(lines = [], currency = 'EUR') {
  const totals = lines.reduce(
    (acc, line) => {
      const row = lineTotals(line)
      acc.totalNet += row.net
      acc.totalSell += row.sell
      acc.totalMargin += row.margin
      acc.lineCount += 1
      return acc
    },
    { totalNet: 0, totalSell: 0, totalMargin: 0, lineCount: 0, currency }
  )

  totals.marginPercent = totals.totalSell > 0 ? (totals.totalMargin / totals.totalSell) * 100 : 0
  totals.perPersonNet = totals.lineCount > 0 ? totals.totalNet : 0
  totals.perPersonSell = totals.lineCount > 0 ? totals.totalSell : 0
  return totals
}

export function sellFromNetWithMargin(netPrice, marginPercent) {
  const net = parseMoney(netPrice)
  const pct = parseMoney(marginPercent)
  if (pct >= 100) return net
  return net / (1 - pct / 100)
}

export function sellFromNetWithMarkup(netPrice, markupPercent) {
  const net = parseMoney(netPrice)
  const pct = parseMoney(markupPercent)
  return net * (1 + pct / 100)
}

export function formatMarginPercent(value) {
  const num = parseMoney(value)
  return `${num.toFixed(1)}%`
}

export function formatCalcMoney(value, currency = 'EUR') {
  return formatMoney(value, currency)
}

export function perPersonTotals(totals, pax = 1) {
  const people = Math.max(1, parseMoney(pax) || 1)
  return {
    netPerPerson: totals.totalNet / people,
    sellPerPerson: totals.totalSell / people,
    marginPerPerson: totals.totalMargin / people
  }
}

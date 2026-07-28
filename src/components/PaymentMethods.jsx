import { useEffect, useState } from 'react'
import { currency } from '../data/services'

// Dummy benefit balances for the demo.
const LOYALTY_PTS = 148553
const LOYALTY_VALUE = 736474
const GIFT_CARD_NO = 'GiftCard1123-2024-25'
const GIFT_CARD_BAL = 9000
const ADVANCE_BILL_NO = 'BILL002153/2024-25'
const ADVANCE_BAL = 1058

// type -> what the row renders. ref = Card/UPI/Cheque No., tip = Tip Amount
const TYPES = {
  loyalty: { label: 'Loyalty Points', ref: false, tip: false },
  gift: { label: 'Gift Card', ref: false, tip: false },
  advance: { label: 'Advance Balance', ref: false, tip: false },
  cash: { label: 'Cash', ref: false, tip: true },
  card: { label: 'Debit / Credit Card', ref: true, tip: true },
  upi: { label: 'UPI', ref: true, tip: true },
  cheque: { label: 'Cheque', ref: true, tip: true },
}

// Types the user can add extra rows for (split across two cards, two UPIs, …).
const ADDABLE = ['card', 'upi', 'cheque']

let pmCounter = 0
const makeRow = (type) => ({ id: `pm-${pmCounter++}`, type, amount: '', ref: '', tip: '' })

const BASE_ROWS = ['loyalty', 'gift', 'advance', 'cash', 'card', 'upi', 'cheque'].map(makeRow)

const pill =
  'w-full rounded-full border border-gray-300 bg-white px-3 py-1 text-[13px] text-gray-800 outline-none focus:border-[#4a7196] disabled:bg-gray-50 disabled:text-gray-400'
// Amount is the number people scan for — bigger and in the bill's indigo; tip stays green.
const amountPill =
  'w-full rounded-full border border-gray-300 bg-white px-3 py-1 text-center text-sm font-bold text-indigo-600 outline-none placeholder:font-normal placeholder:text-indigo-300 focus:border-indigo-500'
const tipPill =
  'w-full rounded-full border border-gray-300 bg-white px-3 py-1 text-center text-[13px] font-semibold text-emerald-600 outline-none placeholder:font-normal placeholder:text-emerald-400 focus:border-emerald-500'

// Column templates shared by each header and its rows.
const BENEFIT_TYPES = ['loyalty', 'gift', 'advance']
const BENEFIT_GRID = 'grid grid-cols-[minmax(0,1fr)_96px_24px]'
const GRID = 'grid grid-cols-[minmax(0,1fr)_96px_130px_84px_46px]'

const IconBarcode = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M2 4h2v16H2zM6 4h1v16H6zM9 4h2v16H9zM13 4h1v16h-1zM16 4h2v16h-2zM20 4h2v16h-2z" />
  </svg>
)

const IconPlus = (props) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const IconMinus = (props) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" {...props}>
    <path d="M5 12h14" />
  </svg>
)

export default function PaymentMethods({ netTotal = 0, onPaidChange }) {
  const [rows, setRows] = useState(BASE_ROWS)
  const [checked, setChecked] = useState(() => new Set())

  const patch = (id, p) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)))
  const paid = rows.reduce((s, r) => s + (checked.has(r.id) ? Number(r.amount) || 0 : 0), 0)
  const remaining = Math.max(0, netTotal - paid)

  useEffect(() => { onPaidChange?.(paid) }, [paid, onPaidChange])

  // Checking a row pre-fills whatever is still due (₹10,000 on the first row; edit it
  // to ₹2,000 and the next row you check auto-fills the ₹8,000 left). Unchecking clears it.
  const toggle = (row) => {
    const next = new Set(checked)
    if (next.has(row.id)) {
      next.delete(row.id)
      patch(row.id, { amount: '' })
    } else {
      next.add(row.id)
      if (!row.amount && remaining > 0) {
        const cap = maxBenefit(row.type)
        patch(row.id, { amount: Math.min(remaining, cap) })
      }
    }
    setChecked(next)
  }

  // New row of the same type goes right after the last row of that type.
  const addRow = (type) =>
    setRows((rs) => {
      const row = makeRow(type)
      const last = rs.map((r) => r.type).lastIndexOf(type)
      return last === -1 ? [...rs, row] : [...rs.slice(0, last + 1), row, ...rs.slice(last + 1)]
    })

  const removeRow = (id) => {
    setRows((rs) => rs.filter((r) => r.id !== id))
    setChecked((c) => { const n = new Set(c); n.delete(id); return n })
  }

  // How many rows of this type already exist — extra ones get a remove button,
  // and the last row of a type carries the "add one more" plus.
  const isExtra = (row, idx) => rows.findIndex((r) => r.type === row.type) !== idx
  const isLastOfType = (row, idx) => rows.map((r) => r.type).lastIndexOf(row.type) === idx

  const subLabel = (type) => {
    if (type === 'loyalty') return `${LOYALTY_PTS.toLocaleString('en-IN')} pts (${currency(LOYALTY_VALUE)})`
    if (type === 'gift') return `(${currency(GIFT_CARD_BAL)})`
    if (type === 'advance') return `(${currency(ADVANCE_BAL)})`
    return null
  }

  const inlineNo = (type) => (type === 'gift' ? GIFT_CARD_NO : type === 'advance' ? ADVANCE_BILL_NO : null)

  // Maximum redeemable amount per benefit type
  const maxBenefit = (type) => {
    if (type === 'loyalty') return LOYALTY_VALUE
    if (type === 'gift') return GIFT_CARD_BAL
    if (type === 'advance') return ADVANCE_BAL
    return Infinity
  }

  // Benefits (loyalty / gift card / advance) on the left, everything you actually
  // collect money with — cash, card, UPI, cheque and their extra rows — on the right.
  const benefitRows = rows.filter((r) => BENEFIT_TYPES.includes(r.type))
  const paymentRows = rows.filter((r) => !BENEFIT_TYPES.includes(r.type))

  const renderRow = (row) => {
      const idx = rows.indexOf(row)
      const meta = TYPES[row.type]
      const active = checked.has(row.id)
      const sub = subLabel(row.type)
      const grid = BENEFIT_TYPES.includes(row.type) ? BENEFIT_GRID : GRID
      return (
        <div
          key={row.id}
          className={`${grid} items-center gap-2 rounded-lg border bg-white px-2.5 py-1.5 shadow-sm ${active ? 'border-[#4a7196]' : 'border-gray-200'
            }`}
        >
          <label className="flex min-w-0 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={active}
              onChange={() => toggle(row)}
              className="h-4 w-4 shrink-0 rounded-full border-gray-300 text-[#2c4c6b] focus:ring-[#4a7196]"
            />
            {/* label, account no. and balance all stay on one line */}
            <span className="min-w-0 truncate whitespace-nowrap text-sm text-gray-600">
              <span className="font-semibold text-gray-700">{meta.label}</span>
              {inlineNo(row.type) && <span className="ml-1 font-medium text-[12px] text-gray-600">({inlineNo(row.type)})</span>}
              {isExtra(row, idx) && <span className="ml-1  font-medium text-[12px] text-gray-600">#{rows.slice(0, idx).filter((r) => r.type === row.type).length + 1}</span>}
              {sub && <span className="ml-1 text-[12px]  font-medium text-gray-600">{sub}</span>}
            </span>
          </label>

          <div className="relative">
            <input
              type="number"
              value={row.amount}
              onChange={(e) => {
                let val = e.target.value
                if (BENEFIT_TYPES.includes(row.type)) {
                  const max = maxBenefit(row.type)
                  if (Number(val) > max) val = max
                }
                patch(row.id, { amount: val })
              }}
              onFocus={() => setChecked((c) => (c.has(row.id) ? c : new Set(c).add(row.id)))}
              placeholder="0.00"
              className={amountPill}
            />
          </div>

          {!BENEFIT_TYPES.includes(row.type) && (meta.ref ? (
            <div className="relative">
              <input
                type="text"
                value={row.ref}
                onChange={(e) => patch(row.id, { ref: e.target.value })}
                className={`${pill} pr-8`}
              />
              <IconBarcode className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          ) : (
            <span />
          ))}

          {!BENEFIT_TYPES.includes(row.type) && (meta.tip ? (
            <input
              type="number"
              value={row.tip}
              onChange={(e) => patch(row.id, { tip: e.target.value })}
              placeholder="0.00"
              className={tipPill}
            />
          ) : (
            <span />
          ))}

          {/* trailing cell: + adds one more row of this type, × drops an extra one */}
          <div className="flex items-center justify-end gap-1 text-sm text-gray-600">
            {isExtra(row, idx) && (
              <button
                onClick={() => removeRow(row.id)}
                className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:border-rose-300 hover:text-rose-500"
                title={`Remove this ${meta.label} row`}
              >
                <IconMinus />
              </button>
            )}
            {ADDABLE.includes(row.type) && isLastOfType(row, idx) && (
              <button
                onClick={() => addRow(row.type)}
                className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-400 text-gray-500 hover:border-[#4a7196] hover:bg-[#eef3f8] hover:text-[#2c4c6b]"
                title={`Add another ${meta.label}`}
              >
                <IconPlus />
              </button>
            )}
          </div>
        </div>
      )
  }

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-2 bg-gray-100 p-2">
        {/* Benefits & Balances — soft purple tint */}
        <div className="bg-violet-50 rounded-lg p-3 border border-gray-400">
          <div className={`${BENEFIT_GRID} items-end gap-2 px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-violet-500`}>
            <span>Benefits &amp; Balances</span>
            <span className="text-center">Amount</span>
            <span />
          </div>
          <div className="space-y-1.5">{benefitRows.map(renderRow)}</div>
        </div>

        {/* Payment Mode — soft sky tint */}
        <div className="bg-sky-50 rounded-lg p-3 border border-gray-400">
          <div className={`${GRID} items-end gap-2 px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-sky-500`}>
            <span>Payment Mode</span>
            <span className="text-center">Amount</span>
            <span className="text-center">Card/UPI/Cheque No.</span>
            <span className="text-center leading-tight">Tip Amount</span>
            <span />
          </div>
          <div className="space-y-1.5">{paymentRows.map(renderRow)}</div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-2 text-[13px]">
        <span className="text-gray-600">Paid <span className="font-semibold text-gray-800">{currency(paid)}</span> of {currency(netTotal)}</span>
        <span className={`font-bold ${paid > netTotal ? 'animate-pulse text-pink-600' : remaining === 0 && paid > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
          {paid > netTotal
            ? `Advance: ${currency(paid - netTotal)}`
            : remaining === 0 && paid > 0
              ? 'Balanced'
              : `Remaining: ${currency(remaining)}`}
        </span>
      </div>
    </div>
  )
}

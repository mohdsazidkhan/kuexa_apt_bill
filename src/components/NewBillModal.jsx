import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ServiceModal from './ServiceModal'
import CustomerSearch from './CustomerSearch'
import AddCustomerModal from './AddCustomerModal'
import RecentVisitsModal from './RecentVisitsModal'
import ClientDetailsDrawer from './ClientDetailsDrawer'
import AddFnFDrawer from './AddFnFDrawer'
import ViewOffersDrawer from './ViewOffersDrawer'
import ProductBatchesModal from './ProductBatchesModal'
import OverrideDiscountModal from './OverrideDiscountModal'
import PaymentMethods from './PaymentMethods'
import ConfirmDialog from './ConfirmDialog'
import PendingBillsModal, { billPending, PENDING_BILLS } from './PendingBillsModal'
import LoadAppointmentModal, { IconCalendar } from './LoadAppointmentModal'
import { currency, stylists, customers } from '../data/services'
import {
  cInput, Field, StylistSelect, AssistantSelect, SearchSelect,
  FUTURE_DATES, TIME_SLOTS, DEFAULT_TIME, tagStyle, kindMeta, itemToRow, GenderBadge, serviceGender,
} from './apptFields'
import { IconClose, IconUsers, IconGrid, IconPlus, IconHome, IconMenu } from './Icons'

// Billing summary money: always 2 decimals, and every step rounded so 6720 * 0.18
// can't leak 1209.6000000000001 into the next line.
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100
const money = (n) =>
  '₹' + round2(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Line-level discount of a row — driven entirely by its own Disc. Type / value
// (Custom Discount ₹ or %, Prive Member, 10%, 20%). No item carries a default discount.
const rowAmount = (r) => (Number(r.price) || 0) * (r.qty || 1)
const lineDiscount = (r) => {
  const amount = rowAmount(r)
  const type = r.discType || 'Flat'
  const value = Number(r.discAmt) || 0
  let disc = 0
  if (type === 'Custom Discount') disc = r.discMode === 'Percentage' ? (amount * value) / 100 : value
  else if (type === 'Prive Member') disc = amount * 0.2
  else if (type.endsWith('%')) disc = (amount * (parseFloat(type) || 0)) / 100
  else disc = value // Flat
  return round2(Math.min(amount, Math.max(0, disc)))
}

// Services and products carry 18% GST; everything else is untaxed.
const taxRateOf = (r) => {
  const t = `${r.typeLabel || ''} ${r.kind || ''}`.toLowerCase()
  return t.includes('service') || t.includes('product') ? 0.18 : 0
}
const rowInclTax = (r) => round2(Math.max(0, rowAmount(r) - lineDiscount(r)) * (1 + taxRateOf(r)))
const guestInclTax = (g) => round2(g.rows.reduce((s, r) => s + rowInclTax(r), 0))

const IconChevron = ({ className = '', ...props }) => (
  <svg
    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    className={`transition-transform ${className}`} {...props}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
)

// Rounded stat chip in the drawer header (Total Bill / LPE / CBE / Balance To Pay).
const Chip = ({ className = '', children }) => (
  <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${className}`}>{children}</span>
)

let guestCounter = 0
const newGuest = () => ({
  id: `g-${guestCounter++}`,
  label: `Guest ${guestCounter}`,
  customer: null,
  rows: [],
  date: FUTURE_DATES[0],
  time: DEFAULT_TIME,
  homeService: false,
})

// Gender helpers for smart service distribution.
const normGender = (g) => (g === 'Male' || g === 'M' ? 'M' : g === 'Female' || g === 'F' ? 'F' : null)
const genderWord = (G) => (G === 'M' ? 'Male' : 'Female')

// Build a placeholder guest-client of gender G ON DEMAND (only when auto-creating /
// "New guest"). Numbering (Guest 1 M, Guest 2 M, Guest 1 F...) is per gender, derived
// from how many placeholder guests already exist. Real clients are picked normally.
const makePlaceholderGuest = (G, existing) => {
  const n = existing.filter((x) => (x.customer?.id || '').includes('-ph-') && x.customer?.gender === genderWord(G)).length + 1
  const base = newGuest()
  return {
    ...base,
    customer: {
      id: `${base.id}-ph-${G}`,
      name: `Guest ${n} ${G}`,
      phone: `9${G === 'M' ? '3' : '8'}${String(n).padStart(8, '0')}`,
      gender: genderWord(G),
    },
  }
}

export default function NewBillModal({ open, onClose, onBooked, onSaveDraft }) {
  const [guests, setGuests] = useState(() => [newGuest()])
  const [active, setActive] = useState(() => guests[0]?.id)
  const [browseFor, setBrowseFor] = useState(null) // guestId while Browse modal is open
  const [restrictedTab, setRestrictedTab] = useState(null)
  const [custAddOpen, setCustAddOpen] = useState(false)
  const [recentOpen, setRecentOpen] = useState(false)
  const [takePayment, setTakePayment] = useState(false)
  const [clientView, setClientView] = useState(null) // customer being viewed in ClientDetailsDrawer
  const [offersView, setOffersView] = useState(null)
  const [pendingSplit, setPendingSplit] = useState(null) // Rule 3 confirm: { gender, items, existingId, existingName }
  const [override, setOverride] = useState(null) // bill-level discount override { type, value, couponName, remarks }
  const [overrideOpen, setOverrideOpen] = useState(false)
  const [remarks, setRemarks] = useState('')
  const [addFnFOpen, setAddFnFOpen] = useState(false)
  const [loadApptOpen, setLoadApptOpen] = useState(false)
  const [itemsCollapsed, setItemsCollapsed] = useState(false) // All tab: hide item rows, keep totals
  const [offersApplied, setOffersApplied] = useState(false)
  const [batchProduct, setBatchProduct] = useState(null)
  const [pendingPaymentAction, setPendingPaymentAction] = useState(null)
  const [paidAmount, setPaidAmount] = useState(0) // sum of the checked payment-method rows
  const [payConfirm, setPayConfirm] = useState(null) // 'advance' | 'pending'
  const [payReset, setPayReset] = useState(0) // bumped on Clear all to wipe the payment rows
  const [pendingBills, setPendingBills] = useState(PENDING_BILLS) // old unpaid bills settled with this one
  const [pendingBillsOpen, setPendingBillsOpen] = useState(false)
  const [batchesSelected, setBatchesSelected] = useState(false)
  const navigate = useNavigate()

  const activeGuest = guests.find((g) => g.id === active)

  // --- guest + row mutations ---
  const patchGuest = (id, patch) => setGuests((gs) => gs.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  const patchRow = (gid, uid, patch) =>
    setGuests((gs) => gs.map((g) => (g.id === gid ? { ...g, rows: g.rows.map((r) => (r.uid === uid ? { ...r, ...patch } : r)) } : g)))
  const removeRow = (gid, uid) =>
    setGuests((gs) => gs.map((g) => (g.id === gid ? { ...g, rows: g.rows.filter((r) => r.uid !== uid) } : g)))
  // Smart add: distribute selected services into guests by gender.
  //  - unisex / unknown-gender guest / same-gender  -> current guest
  //  - same service already in current (duplicate)   -> another same-gender guest (or new w/ dummy customer)
  //  - different gender, no such guest               -> auto-create new guest (dummy same-gender customer)
  //  - different gender, guest exists                -> ask (Rule 3 modal)
  const addRows = (curId, items) => {
    const working = guests.map((g) => ({ ...g, rows: [...g.rows] }))
    const cur = working.find((g) => g.id === curId)
    if (!cur) return
    const curG = normGender(cur.customer?.gender)
    const preIds = new Set(working.map((g) => g.id)) // guests that existed BEFORE this add
    const has = (g, name) => g.rows.some((r) => r.name === name)
    const createdByGender = {} // reuse a guest created during THIS add per gender
    const makeGuest = (G) => {
      const g = makePlaceholderGuest(G, working)
      working.push(g)
      return g
    }

    const pendItems = []
    let pendGender = null
    for (const it of items) {
      const sg = serviceGender(it.name)
      const row = itemToRow(it)
      // unisex / current guest has no gender -> current guest, no questions
      if (sg === 'U' || !curG) { cur.rows.push(row); continue }

      const matching = working.filter((g) => preIds.has(g.id) && normGender(g.customer?.gender) === sg)
      const differentGender = sg !== curG
      const dup = matching.some((g) => has(g, it.name)) || has(cur, it.name)

      // Ask when a matching-gender guest already exists AND (it's a different gender OR the service is a duplicate).
      if (matching.length > 0 && (differentGender || dup)) {
        pendItems.push(it)
        pendGender = sg
      } else if (differentGender) {
        // no matching-gender guest yet -> auto-create one (reused for this add)
        ; (createdByGender[sg] ||= makeGuest(sg)).rows.push(row)
      } else {
        cur.rows.push(row) // same gender, not a duplicate -> current guest
      }
    }
    setGuests(working)
    if (pendItems.length && pendGender) {
      const candidates = working
        .filter((g) => preIds.has(g.id) && normGender(g.customer?.gender) === pendGender)
        .map((g) => ({ id: g.id, name: g.customer?.name || g.label }))
      setPendingSplit({ gender: pendGender, items: pendItems, candidates })
    }
  }

  // Load an appointment into the active guest: its services become rows, and the
  // appointment's client fills the guest if none was picked yet.
  const loadAppointment = (appt) => {
    if (!activeGuest) return
    const rows = appt.services.map((s) => ({
      ...itemToRow({ kind: 'service', name: s.name, category: s.category, price: s.price, duration: s.duration }),
      stylist: s.stylist ? s.stylist.charAt(0) + s.stylist.slice(1).toLowerCase() : '',
      date: s.date,
      time: s.time,
    }))
    const patch = { rows: [...activeGuest.rows, ...rows] }
    if (!activeGuest.customer && appt.customer && appt.customer !== 'Group') {
      const matched = customers.find(
        (c) => c.phone === appt.phone || c.name === appt.customer
      )
      patch.customer = {
        id: matched?.id ?? appt.id,
        name: appt.customer,
        phone: appt.phone,
        gender: matched?.gender ?? null,
      }
    }
    patchGuest(activeGuest.id, patch)
  }

  // Resolve the confirm: target = a guest id, or 'new'.
  const resolveSplit = (target) => {
    if (!pendingSplit) return
    const { items, gender } = pendingSplit
    const rows = items.map(itemToRow)
    setPendingSplit(null)

    if (target === 'new') {
      // Build the new placeholder guest OUTSIDE the state updater (pure update).
      const g = { ...makePlaceholderGuest(gender, guests), rows }
      setGuests((gs) => [...gs, g])
      setActive(g.id)
    } else {
      setGuests((gs) => gs.map((x) => (x.id === target ? { ...x, rows: [...x.rows, ...rows] } : x)))
    }
  }

  // Round-robin assign stylists to a guest's service rows.
  const autoAssign = (gid) =>
    setGuests((gs) => gs.map((g) => {
      if (g.id !== gid) return g
      let i = 0
      return {
        ...g, rows: g.rows.map((r) => {
          if (r.kind !== 'service') return r
          const stylist = stylists[i % stylists.length].name
          i += 1
          return { ...r, stylist }
        })
      }
    }))

  // Auto-sequence a guest's items by type order.
  const autoSequence = (gid) =>
    setGuests((gs) => gs.map((g) => {
      if (g.id !== gid) return g
      const order = ['Service', 'Product', 'Membership', 'Package', 'Gift Card']
      const rank = (r) => { const i = order.indexOf(r.typeLabel || 'Service'); return i === -1 ? 99 : i }
      return { ...g, rows: [...g.rows].sort((a, b) => rank(a) - rank(b)) }
    }))

  // Header actions apply to the active guest, or every guest on the All tab.
  const targetIds = () => (activeGuest ? [activeGuest.id] : guests.map((g) => g.id))
  const doAutoAssign = () => targetIds().forEach(autoAssign)
  const doAutoSequence = () => targetIds().forEach(autoSequence)

  const addGuest = () => {
    const g = newGuest()
    setGuests((gs) => [...gs, g])
    setActive(g.id)
  }
  const removeGuest = (id) =>
    setGuests((gs) => {
      const next = gs.filter((g) => g.id !== id)
      return next.length ? next : [newGuest()]
    })

  // --- totals ---
  // A bill-level override wipes every line-level discount.
  const rowDiscountAmount = (r) => (override ? 0 : lineDiscount(r))
  const rowTotal = (r) => Math.max(0, (Number(r.price) || 0) * (r.qty || 1) - rowDiscountAmount(r))
  const guestTotal = (g) => g.rows.reduce((s, r) => s + rowTotal(r), 0)
  const grandTotal = guests.reduce((s, g) => s + guestTotal(g), 0)
  const grossTotal = guests.reduce((s, g) => s + g.rows.reduce((ss, r) => ss + ((Number(r.price) || 0) * (r.qty || 1)), 0), 0)
  const totalPackageDiscount = guests.reduce((s, g) => s + g.rows.reduce((ss, r) => ss + rowDiscountAmount(r), 0), 0)
  const totalItems = guests.reduce((s, g) => s + g.rows.length, 0)
  const overrideDiscount = !override
    ? 0
    : Math.min(grossTotal, override.type === 'percentage' ? (grossTotal * (Number(override.value) || 0)) / 100 : Number(override.value) || 0)

  const guestName = (g) => g.customer?.name || g.label

  const handleBook = () => {
    onBooked?.(guests.length)
  }
  const handleClearAll = () => {
    const initialGuest = newGuest()
    setGuests([initialGuest])
    setActive(initialGuest.id)
    setBrowseFor(null)
    setRestrictedTab(null)
    setTakePayment(false)
    setOverride(null)
    setPaidAmount(0)
    setPayReset((n) => n + 1)
    setPendingBills([])
    setPaymentMode('Cash')
    setSplitPayment(false)
    setSplitRows([{ id: Date.now(), mode: 'Cash', amount: '', ref: '' }])
    setRemarks('')
    setOffersApplied(false)
  }
  const handleBookAndPay = () => {
    onClose?.()
    navigate('/billing')
  }

  const showAll = active === 'all' || !activeGuest

  // Same staged rounding as CheckoutPanel so footer / confirms never disagree with the summary.
  const currentAfterDisc = round2(Math.max(0, grandTotal - (override ? overrideDiscount : 0)))
  const pendingBillsTotal = round2(pendingBills.reduce((s, b) => s + billPending(b), 0))
  const currentNetTotal = Math.round(
    round2(round2(currentAfterDisc + round2(currentAfterDisc * 0.18)) + pendingBillsTotal)
  )
  // Header chips — ₹0 until the bill has items, then they mirror the summary's Grand Total
  // (pending bills included). LPE / CBE are flat demo values.
  const hasItems = totalItems > 0
  const chipTotal = hasItems ? currentNetTotal : 0
  const loyaltyPts = hasItems ? 50 : 0
  const cashbackEarned = hasItems ? 100 : 0
  const balanceToPay = round2(Math.max(0, chipTotal - paidAmount))

  const hasService = guests.some(g => g.rows.some(r => r.kind === 'service' || r.type === 'Service' || r.typeLabel === 'Service'))
  const hasProduct = guests.some(g => g.rows.some(r => r.kind === 'product' || r.type === 'Product' || r.typeLabel === 'Product'))
  const showSplitAndPayment = (hasService && hasProduct) || guests.length > 1

  const handlePaymentClick = (action) => {
    if (hasProduct && !batchesSelected) {
      const prodItem = guests.flatMap(g => g.rows).find(it => (it.kind === 'product' || it.type === 'Product' || it.typeLabel === 'Product' || (it.name && it.name.includes('Treatment'))))
      setBatchProduct(prodItem || { name: 'Dummy Product' })
      setPendingPaymentAction(action)
    } else if (paidAmount > currentNetTotal) {
      setPayConfirm('advance')
    } else if (paidAmount < currentNetTotal) {
      setPayConfirm('pending')
    } else {
      handleBook()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      {/* Right-side drawer */}
      <div
        style={{ width: 'calc(100% - 16rem)' }}
        className={`fixed right-0 top-0 z-40 flex h-screen flex-col bg-white transition-transform duration-300 ease-out ${open ? 'translate-x-0 shadow-2xl' : 'translate-x-full'}`}
      >
        {/* Header with client tabs */}
        <div className="flex items-center gap-2.5 border-b border-gray-400 px-4 py-2">
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <IconClose width={18} height={18} />
          </button>
          <h2 className="shrink-0 text-base font-semibold text-gray-800">New Bill</h2>

          {/* Live bill chips: grand total, loyalty / cashback earned, and what's left to pay */}
          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            <Chip className="bg-emerald-50 text-emerald-600">
              LPE: {money(loyaltyPts)} ({loyaltyPts} Pts.)
            </Chip>
            <Chip className="bg-emerald-50 text-emerald-600">CBE: {money(cashbackEarned)}</Chip>
            <Chip className={balanceToPay > 0 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}>
              Pay: {money(balanceToPay)}
            </Chip>
          </div>

          {/* All tab: fold every client's items away, leaving just their totals */}
          {showAll && (
            <button
              onClick={() => setItemsCollapsed((c) => !c)}
              title={itemsCollapsed ? 'Show items of every client' : 'Hide items, keep totals'}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${itemsCollapsed
                ? 'animate-pulse border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'border-indigo-300 bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
            >
              <IconChevron className={itemsCollapsed ? '-rotate-90' : ''} />
              {itemsCollapsed ? 'Show Clients' : 'Hide Clients'}
            </button>
          )}



          {/* Client tabs (top-right) */}
          <div className="ml-auto flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActive('all')}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${active === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              All · {totalItems}
            </button>
            {guests.map((g) => (
              <button
                key={g.id}
                onClick={() => setActive(g.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${active === g.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {guestName(g)}
                <span className={`rounded px-1 text-[10px] ${active === g.id ? 'bg-white/20' : 'bg-white text-gray-500'}`}>{g.rows.length}</span>
                {guests.length > 1 && (
                  <span
                    onClick={(e) => { e.stopPropagation(); removeGuest(g.id); if (active === g.id) setActive('all') }}
                    className={`${active === g.id ? 'text-white/70 hover:text-white' : 'text-gray-400 hover:text-rose-500'}`}
                  >
                    <IconClose width={12} height={12} />
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={addGuest}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
            >
              <IconPlus width={13} height={13} /> Add Guest
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overflow-x-auto bg-gray-50/40 p-2">
          {showAll ? (
            <div className="space-y-3">
              <AllSummary guests={guests} guestName={guestName} collapsed={itemsCollapsed} onOpen={setActive} onViewOffers={setOffersView} rowDiscountAmount={rowDiscountAmount} />

              <CheckoutPanel
                subtotal={grossTotal}
                packageDiscount={totalPackageDiscount}
                override={override} overrideDiscount={overrideDiscount}
                onOverride={() => setOverrideOpen(true)}
                onClearOverride={() => setOverride(null)}
                onPaidChange={setPaidAmount}
                payReset={payReset}
                pendingBills={pendingBills}
                onPendingBills={() => setPendingBillsOpen(true)}
                remarks={remarks} setRemarks={setRemarks}
                onSaveDraft={onClose}
                onPrintAndSave={handleBook}
                disabled={totalItems === 0}
              />
            </div>
          ) : (
            <GuestEditor
              key={activeGuest.id}
              open={open}
              guest={activeGuest}
              guestName={guestName}
              onCustomer={(c) => {
                patchGuest(activeGuest.id, { customer: c })
              }}
              onPatch={(patch) => patchGuest(activeGuest.id, patch)}
              onRecent={() => setRecentOpen(true)}
              onRow={(uid, patch) => patchRow(activeGuest.id, uid, patch)}
              onRemoveRow={(uid) => removeRow(activeGuest.id, uid)}
              onBrowse={(tab) => {
                setRestrictedTab(typeof tab === 'string' ? tab : null)
                setBrowseFor(activeGuest.id)
              }}
              onViewOffers={() => setOffersView(activeGuest.customer)}
              onAddFnF={() => setAddFnFOpen(true)}
              onLoadAppt={() => setLoadApptOpen(true)}
              total={guestTotal(activeGuest)}
              rowDiscountAmount={rowDiscountAmount}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white px-6 py-3">
          {showAll ? (
            <div className="flex items-center justify-between gap-4">
              <div className="hidden sm:block flex-shrink-0">
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Bill</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {currency(currentNetTotal)}
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-5 ml-6">
                <button className="flex items-center gap-1.5 rounded-full border-2 border-amber-200 px-4 py-1 text-sm font-medium text-amber-600 hover:bg-amber-50 hover:text-amber-700">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line></svg>
                  Hold
                </button>
                <button className="flex items-center gap-1.5 rounded-full border-2 border-gray-300 px-4 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Held Sales
                </button>
                <button
                  onClick={() => setOffersApplied(!offersApplied)}
                  className={`flex items-center gap-1.5 rounded-full border-2 px-4 py-1 text-sm font-medium ${offersApplied
                    ? 'border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                    : 'border-teal-200 text-teal-600 hover:bg-teal-50 hover:text-teal-700'
                    }`}
                >
                  {offersApplied ? 'Remove Offers' : 'Apply Offers'}
                </button>
                <button onClick={handleClearAll} className="flex items-center gap-1.5 rounded-full border-2 border-rose-200 px-4 py-1 text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  Clear all
                </button>
              </div>

              <div className="flex flex-1 max-w-lg gap-3 ml-auto">
                {showSplitAndPayment && (
                  <button
                    onClick={() => handlePaymentClick('split')}
                    className="flex-1 rounded-lg bg-[#2c4c6b] py-2 text-sm font-bold text-white shadow hover:bg-[#1a3551] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Split & Payment
                  </button>
                )}
                <button
                  onClick={() => handlePaymentClick('pay')}
                  className="flex-1 rounded-lg bg-[#4a7196] py-2 text-sm font-bold text-white shadow hover:bg-[#3d6083] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Payment
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="hidden sm:block flex-shrink-0">
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{guestName(activeGuest)} Total</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {money(guestInclTax(activeGuest))}
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-5 ml-6">
                <button className="flex items-center gap-1.5 rounded-full border-2 border-amber-200 px-4 py-1 text-sm font-medium text-amber-600 hover:bg-amber-50 hover:text-amber-700">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line></svg>
                  Hold
                </button>
                <button className="flex items-center gap-1.5 rounded-full border-2 border-gray-300 px-4 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Held Sales
                </button>
                <button
                  onClick={() => setOffersApplied(!offersApplied)}
                  className={`flex items-center gap-1.5 rounded-full border-2 px-4 py-1 text-sm font-medium ${offersApplied
                    ? 'border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                    : 'border-teal-200 text-teal-600 hover:bg-teal-50 hover:text-teal-700'
                    }`}
                >
                  {offersApplied ? 'Remove Offers' : 'Apply Offers'}
                </button>
                <button onClick={handleClearAll} className="flex items-center gap-1.5 rounded-full border-2 border-rose-200 px-4 py-1 text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  Clear all
                </button>
              </div>

              <div className="flex flex-1 max-w-lg gap-3 ml-auto">

                {showSplitAndPayment && (
                  <button
                    disabled
                    className="flex-1 rounded-lg bg-[#2c4c6b] py-2 text-sm font-bold text-white shadow disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Split & Payment
                  </button>
                )}
                <button
                  disabled
                  className="flex-1 rounded-lg bg-[#4a7196] py-2 text-sm font-bold text-white shadow disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Payment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Browse to add items to a guest */}
      <ServiceModal
        open={!!browseFor}
        restrictedTab={restrictedTab}
        onClose={() => setBrowseFor(null)}
        onAdd={(items) => { if (browseFor) addRows(browseFor, items) }}
      />
      {/* Add customer (header quick-add for the active guest) */}
      <AddCustomerModal
        open={custAddOpen}
        onClose={() => setCustAddOpen(false)}
        onAdd={(c) => activeGuest && patchGuest(activeGuest.id, { customer: c })}
      />
      <ProductBatchesModal
        open={!!batchProduct}
        product={batchProduct}
        onClose={() => setBatchProduct(null)}
        onSubmit={(qtys) => {
          console.log('Quantities submitted', qtys)
          setBatchProduct(null)
          setBatchesSelected(true)
          // User requested that the New Bill drawer stays open after batch selection.
          // Clicking Payment / Split & Payment again bypasses this modal (batchesSelected) and books.
        }}
      />
      {/* Old unpaid bills — picked ones are added on top of Sub Total */}
      <PendingBillsModal
        open={pendingBillsOpen}
        selectedIds={pendingBills.map((b) => b.id)}
        customerName={guests[0]?.customer?.name || 'Client'}
        onClose={() => setPendingBillsOpen(false)}
        onSubmit={setPendingBills}
      />

      {/* Paid amount doesn't match the bill — advance or pending */}
      <ConfirmDialog
        open={!!payConfirm}
        message={
          payConfirm === 'advance'
            ? 'Entered Amount is MORE Than Total Bill Amount Proceed with Taking ADVANCE Payment!'
            : 'Entered Amount is LESS Than Total Bill Amount Proceed with Payment and BILL status = Pending'
        }
        onNo={() => setPayConfirm(null)}
        onYes={() => { setPayConfirm(null); handleBook() }}
      />

      {/* Bill-level discount override (All tab) */}
      <OverrideDiscountModal
        open={overrideOpen}
        current={override}
        onClose={() => setOverrideOpen(false)}
        onApply={setOverride}
      />
      {/* Pull an existing appointment's services into the active guest */}
      <LoadAppointmentModal
        open={loadApptOpen}
        onClose={() => setLoadApptOpen(false)}
        onLoad={loadAppointment}
      />
      <RecentVisitsModal open={recentOpen} onClose={() => setRecentOpen(false)} />
      <ClientDetailsDrawer open={!!clientView} onClose={() => setClientView(null)} customer={clientView} />
      <ViewOffersDrawer open={!!offersView} onClose={() => setOffersView(null)} customer={offersView} />
      <AddFnFDrawer open={addFnFOpen} onClose={() => setAddFnFOpen(false)} primaryCustomer={activeGuest?.customer} />

      {/* Confirm — matching-gender guest(s) exist: pick a client or make a new guest */}
      {pendingSplit && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-800">
              {genderWord(pendingSplit.gender)} service{pendingSplit.items.length > 1 ? 's' : ''} — which client?
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              To which client would you like to add{' '}
              <span className="font-medium text-gray-700">{pendingSplit.items.map((i) => i.name).join(', ')}</span>?
              Pick an existing client, or create a new guest.
            </p>
            <div className="mt-5 space-y-2">
              {/* past 8 clients the list scrolls instead of pushing the modal off-screen */}
              <div className={`space-y-2 ${pendingSplit.candidates.length > 8 ? 'max-h-[26rem] overflow-y-auto pr-1' : ''}`}>
                {pendingSplit?.candidates?.map((c, idx) => (
                  <button
                    key={c.id}
                    onClick={() => resolveSplit(c.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${idx === 0
                      ? 'bg-[#4a7196] text-white shadow hover:bg-[#3d6083]'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <IconUsers width={15} height={15} /> Add to {c.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => resolveSplit('new')}
                className="flex w-full items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
              >
                <IconPlus width={15} height={15} /> Create a new guest
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

// ---- All tab: summary of every guest ----
function AllSummary({ guests, guestName, collapsed, onOpen, onViewOffers, rowDiscountAmount }) {
  return (
    <div className={`grid grid-cols-1 gap-3 ${guests?.length > 1 ? 'lg:grid-cols-2' : ''}`}>
      {guests?.map((g, idx) => (
        <div key={g.id} className="rounded-xl border border-gray-300 bg-white p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">{idx + 1}</span>
              <button
                onClick={() => {
                  if (g.customer) {
                    window.open('/customers', '_blank')
                  }
                }}
                title={g.customer ? 'Open customer in new tab' : undefined}
                className={`text-sm font-semibold ${g.customer ? 'text-violet-600 underline decoration-violet-400 underline-offset-2 hover:text-violet-700' : 'cursor-default text-gray-800'}`}
              >
                {guestName(g)}
              </button>
              {g.customer?.gender && (
                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">{g.customer.gender}</span>
              )}
              {g.customer?.phone && <span className="text-xs font-medium text-gray-600">{g.customer.phone}</span>}
              {g.customer && (
                <button
                  onClick={() => onViewOffers?.(g.customer)}
                  className="ml-1 rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[11px] font-bold text-indigo-600 hover:bg-indigo-100"
                >
                  View offers
                </button>
              )}
            </div>
            <button onClick={() => onOpen(g.id)} className="text-xs font-medium text-indigo-600 hover:underline">Edit →</button>
          </div>
          {g.rows.length === 0 ? (
            <div className="mt-2 text-xs text-gray-400">No items added.</div>
          ) : (
            <div className="mt-2 space-y-1.5">
              {!collapsed && g.rows.map((r) => {
                const getRowStyle = (t) => {
                  const label = (t || 'Service').toLowerCase()
                  if (label.includes('service')) return 'bg-[#cce5ff] border-[#b8daff]'
                  if (label.includes('product')) return 'bg-[#faebb3] border-[#f0df9e]'
                  if (label.includes('membership') || label.includes('plan')) return 'bg-[#c3e6cb] border-[#b1dfbb]'
                  if (label.includes('package')) return 'bg-[#f5c6cb] border-[#f1b0b7]'
                  if (label.includes('gift')) return 'bg-[#ffcc80] border-[#ffb74d]'
                  return 'bg-white border-gray-200'
                }
                const rowStyle = getRowStyle(r.typeLabel)
                return (
                  <div key={r.uid} className={`flex items-center justify-between gap-2 rounded px-2 py-1 text-sm border ${rowStyle}`}>
                    <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5">
                      {/* long product names get an ellipsis; full name on hover */}
                      <span title={r.name} className="min-w-0 max-w-full truncate text-[13px] font-medium text-gray-700">
                        {r.name}
                      </span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${tagStyle(r.typeLabel).pill}`}>{r.typeLabel}</span>
                      {rowDiscountAmount && rowDiscountAmount(r) > 0 && (
                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {/* the discount type the row actually uses, not a generic "Discount" */}
                          {r.discType === 'Custom Discount' && r.discMode === 'Percentage'
                            ? `Custom ${Number(r.discAmt) || 0}%`
                            : r.discType || 'Flat'}{' '}
                          -{currency(rowDiscountAmount(r))}
                        </span>
                      )}
                      {r.kind === 'service' ? (
                        <span className="text-[11px] font-medium text-gray-600">
                          <span className={r.stylist ? 'text-gray-500' : 'italic'}>{r.stylist || 'No stylist'}</span>
                        </span>
                      ) : (
                        // products are sold by someone rather than performed by a stylist
                        <span className="text-[11px] font-medium text-gray-600">
                          <span className={r.saleBy ? 'text-gray-500' : 'italic'}>{r.saleBy || 'No sale by'}</span>
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-medium text-indigo-600">{currency(r.price)}</span>
                  </div>
                )
              })}
              {(() => {
                const gross = round2(g.rows.reduce((s, r) => s + (Number(r.price) || 0) * (r.qty || 1), 0))
                const disc = round2(g.rows.reduce((s, r) => s + (rowDiscountAmount ? rowDiscountAmount(r) : 0), 0))
                const after = round2(Math.max(0, gross - disc))
                const tax = round2(after * 0.18)
                return (
                  <div className="flex flex-nowrap items-center justify-between gap-3 overflow-x-auto whitespace-nowrap border-t border-gray-100 pt-1.5 text-[11px] text-gray-500">
                    <span>Total Price: <b className="text-gray-700">{money(gross)}</b></span>
                    <span>Total Disc.: <b className="text-emerald-600">{money(disc)}</b></span>
                    <span>After Disc.: <b className="text-gray-700">{money(after)}</b></span>
                    <span>Total Tax: <b className="text-gray-700">{money(tax)}</b></span>
                    <span>Total Amount: <b className="text-indigo-600">{money(after + tax)}</b></span>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ---- Guest tab: editable items (like single booking) ----
function GuestEditor({ guest, guestName, onCustomer, onPatch, onRecent, onRow, onRemoveRow, onBrowse, onViewOffers, onAddFnF, onLoadAppt, total, rowDiscountAmount, open }) {
  const kindCounts = {}
  const nums = guest.rows.map((r) => {
    const k = r.kind ?? 'service'
    kindCounts[k] = (kindCounts[k] ?? 0) + 1
    return kindCounts[k]
  })

  // Totals + type breakdown (same as the single New Appointment drawer).
  const TYPE_ORDER = ['Service', 'Product', 'Membership', 'Package', 'Gift Card']
  const ABBR = { Service: 'SERV', Product: 'PROD', Membership: 'MBS', Package: 'PKG', 'Gift Card': 'GC' }
  const totalItems = guest.rows.length
  const totalDuration = guest.rows.reduce((s, r) => s + (r.kind === 'service' ? Number(r.duration) || 0 : 0), 0)
  const typeCounts = guest.rows.reduce((acc, r) => {
    const t = r.typeLabel || 'Service'
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})
  const typeBreakdown = TYPE_ORDER.filter((t) => typeCounts[t]).map((t) => `${ABBR[t]}-${typeCounts[t]}`)

  return (
    <div className="space-y-2">
      {/* Customer row — same layout as the single New Appointment drawer */}
      <section className="rounded-xl border border-sky-200 bg-sky-100/60 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
          <Field
            required
            className="lg:col-span-2"
            label={
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1"><IconUsers width={13} height={13} /> Customer</span>
              </span>
            }
          >
            <CustomerSearch autoFocus={true} focusTrigger={open} value={guest.customer} onChange={onCustomer} />
          </Field>

          {/* Always available — loading an appointment can fill the client itself */}
          <Field label="&nbsp;">
            <button
              onClick={onLoadAppt}
              className="flex h-[34px] w-full items-center justify-center gap-1.5 rounded-md border border-sky-300 bg-white px-2 text-xs font-bold text-[#2c4c6b] hover:bg-sky-50"
            >
              <IconCalendar width={14} height={14} /> Load from Appt.
            </button>
          </Field>

          {guest.customer && (
            <>
              <Field label="&nbsp;">
                <button
                  onClick={onViewOffers}
                  className="flex h-[34px] w-full items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 px-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100"
                >
                  View offers
                </button>
              </Field>
              <Field label="&nbsp;">
                <button
                  onClick={onAddFnF}
                  className="flex h-[34px] w-full items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-2 text-xs font-bold text-emerald-600 hover:bg-emerald-100"
                >
                  Add to F&F
                </button>
              </Field>
              <Field label="&nbsp;">
                <select
                  className="flex h-[34px] w-full rounded-md border border-gray-200 bg-white px-2 text-xs font-medium text-gray-600 outline-none hover:bg-gray-50"
                  value=""
                  onChange={(e) => {
                    // Dummy behavior for selecting an F&F member
                  }}
                >
                  <option value="" disabled>Select F&F</option>
                  <option value="f1">Wife (Aarti)</option>
                  <option value="f2">Son (Rahul)</option>
                  <option value="f3">Daughter (Priya)</option>
                </select>
              </Field>
            </>
          )}

        </div>
      </section>

      {/* Items */}
      <section className="rounded-xl border border-gray-300 bg-white p-2 pt-0">
        {guest.rows.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
            No items yet — use <span className="font-medium text-gray-500">Use Bellow Buttons</span> to add services, products or offers.
          </div>
        ) : (
          <>
            <div className="w-max min-w-full pb-4">
              <div className="flex items-center gap-2.5 px-2 pb-2 text-[11px] font-bold text-black">
                <div className="w-48 shrink-0">Service / Item</div>
                <div className="w-32 shrink-0 text-center">Stylist</div>
                <div className="w-24 shrink-0 text-center">Sale By</div>
                <div className="w-16 shrink-0 text-center">Price</div>
                <div className="w-14 shrink-0 text-center">Qty.</div>
                <div className="w-16 shrink-0 text-center">Amount</div>
                <div className="w-28 shrink-0 text-center">Disc. Type</div>
                <div className="w-28 shrink-0 text-center">Disc. Amt.</div>
                <div className="w-20 shrink-0 text-center">Amt. After Disc.</div>
                <div className="w-16 shrink-0 text-center">Tax Amt.</div>
                <div className="w-24 shrink-0 text-center">Amt. Incl. Tax</div>
                <div className="w-12 shrink-0"></div>
              </div>
              <div className="space-y-2">
                {(() => {
                  const counters = {}
                  return guest.rows.map((row, idx) => {
                    const tag = row.typeLabel || 'Service'
                    counters[tag] = (counters[tag] || 0) + 1
                    const rowNum = counters[tag]
                    const meta = { ...tagStyle(tag), label: tag }

                    const price = Number(row.price) || 0
                    const qty = row.qty || 1
                    const amount = price * qty
                    const discType = row.discType || 'Flat'
                    // Custom Discount lets the user type the value and pick Flat (₹) or Percentage.
                    const isCustomDisc = discType === 'Custom Discount'
                    const discMode = row.discMode || 'Flat'
                    const discAmt = lineDiscount(row) // same rule the bill totals use
                    const amtAfterDisc = Math.max(0, amount - discAmt)

                    const getTaxRate = (label) => {
                      const t = label.toLowerCase()
                      if (t.includes('service') || t.includes('product')) return 0.18
                      return 0
                    }
                    const taxRate = getTaxRate(tag)
                    const taxAmt = amtAfterDisc * taxRate
                    const amtInclTax = amtAfterDisc + taxAmt

                    return (
                      <div key={row.uid} className={`flex items-center gap-2.5 rounded-lg border py-1 pl-1 pr-3 shadow-sm ${meta.card}`}>
                        {/* Item */}
                        <div className={`${row.kind === 'service' ? 'w-48' : 'w-[20.625rem]'} shrink-0 flex items-center gap-2 pl-1`}>
                          <span title={`${meta.label} ${rowNum}`} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${meta.dot}`}>
                            {rowNum}
                          </span>
                          <span className="flex min-w-0 flex-1 items-center gap-1.5" title={row.name}>
                            <span className="text-sm font-semibold text-gray-800">{row.name}</span>
                          </span>
                        </div>

                        {/* Stylist */}
                        {row.kind === 'service' && (
                          <div className="w-32 shrink-0">
                            <StylistSelect
                              value={row.stylist}
                              onChange={(v) => onRow(row.uid, { stylist: v })}
                              placeholder="Select Stylist"
                              className="!rounded-full !h-[26px] !py-0 !text-[11px]"
                            />
                          </div>
                        )}

                        {/* Sale By — searchable, blank until someone is picked */}
                        <div className="w-24 shrink-0">
                          <StylistSelect
                            value={row.saleBy}
                            onChange={(v) => onRow(row.uid, { saleBy: v })}
                            placeholder="Sale By"
                            className="!rounded-full !h-[26px] !py-0 !text-[11px]"
                          />
                        </div>

                        {/* Price */}
                        <div className="w-16 shrink-0 text-center text-xs text-black">
                          {(tag.toLowerCase().includes('service') || tag.toLowerCase().includes('product')) && row.isEditing ? (
                            <input
                              type="number"
                              className="w-full rounded bg-white px-1 py-0.5 text-center text-xs font-semibold text-gray-700 outline-none border border-gray-200 focus:border-indigo-400"
                              value={row.price}
                              onChange={(e) => onRow(row.uid, { price: e.target.value })}
                              onBlur={(e) => {
                                let baseP = Number(row.basePrice);
                                if (isNaN(baseP) || row.basePrice === undefined) {
                                  baseP = Number(row.price) || 0;
                                }
                                let p = Number(e.target.value) || 0;
                                if (baseP > 0) {
                                  if (p < baseP) p = baseP;
                                  if (p > baseP * 3) p = baseP * 3;
                                }
                                onRow(row.uid, { price: p, basePrice: row.basePrice !== undefined ? row.basePrice : baseP });
                              }}
                            />
                          ) : (
                            currency(price)
                          )}
                        </div>

                        {/* Qty */}
                        <div className="w-14 shrink-0 flex items-center justify-center">
                          {tag.toLowerCase().includes('product') ? (
                            <div className="flex shrink-0 items-center rounded-full bg-white px-1 py-0.5 border border-gray-200">
                              <button onClick={() => onRow(row.uid, { qty: Math.max(1, qty - 1) })} className="px-0.5 text-gray-500 font-bold">−</button>
                              <span className="w-4 text-center text-[11px] font-bold text-black">{qty}</span>
                              <button onClick={() => onRow(row.uid, { qty: qty + 1 })} className="px-0.5 text-gray-500 font-bold">+</button>
                            </div>
                          ) : (
                            <span className="text-center text-[11px] font-bold text-black">{qty}</span>
                          )}
                        </div>

                        {/* Amount */}
                        <div className="w-16 shrink-0 text-center text-xs text-black">
                          {currency(amount)}
                        </div>

                        {/* Disc Type */}
                        <div className="w-28 shrink-0">
                          <select
                            className="w-full rounded-full border border-gray-200 px-2 py-1 text-[11px] bg-white text-gray-700 outline-none"
                            value={discType}
                            onChange={(e) => onRow(row.uid, { discType: e.target.value })}
                          >
                            <option value="Flat">Flat</option>
                            {(tag.toLowerCase().includes('service') || tag.toLowerCase().includes('product')) && (
                              <option value="Custom Discount">Custom Discount</option>
                            )}
                            <option value="Prive Member">Prive Member</option>
                            <option value="10%">10%</option>
                            <option value="20%">20%</option>
                          </select>
                        </div>

                        {/* Disc Amt — editable (value + Flat/Percentage) on a custom discount */}
                        <div className="w-28 shrink-0 text-center text-xs text-black">
                          {isCustomDisc && (tag.toLowerCase().includes('service') || tag.toLowerCase().includes('product')) ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                value={row.discAmt ?? ''}
                                onChange={(e) => onRow(row.uid, { discAmt: e.target.value })}
                                placeholder="0"
                                className="w-14 shrink-0 rounded-full border border-gray-200 bg-white px-2 py-1 text-center text-[11px] outline-none focus:border-indigo-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              />
                              <select
                                value={discMode}
                                onChange={(e) => onRow(row.uid, { discMode: e.target.value })}
                                title={discMode}
                                className="w-11 shrink-0 rounded-full border border-gray-200 bg-white px-1 py-1 text-[11px] text-gray-700 outline-none focus:border-indigo-400"
                              >
                                <option value="Flat">₹</option>
                                <option value="Percentage">%</option>
                              </select>
                            </div>
                          ) : (
                            currency(discAmt)
                          )}
                        </div>

                        {/* Amt After Disc */}
                        <div className="w-20 shrink-0 text-center text-xs text-black">
                          {currency(amtAfterDisc)}
                        </div>

                        {/* Tax Amt */}
                        <div className="w-16 shrink-0 text-center text-xs text-black">
                          {currency(taxAmt)}
                        </div>

                        {/* Amt Incl Tax */}
                        <div className="w-24 shrink-0 text-center text-xs font-bold text-black">
                          {currency(amtInclTax)}
                        </div>

                        {/* Actions */}
                        <div className="w-12 shrink-0 flex items-center justify-center gap-1">
                          {(tag.toLowerCase().includes('service') || tag.toLowerCase().includes('product')) && (
                            <button
                              onClick={() => onRow(row.uid, { isEditing: !row.isEditing })}
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm"
                            >
                              {row.isEditing ? (
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                              ) : (
                                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                              )}
                            </button>
                          )}
                          <button onClick={() => onRemoveRow(row.uid)} className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm">
                            <IconClose width={10} height={10} />
                          </button>
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>

              {/* Totals Footer */}
              <div className="mt-2 flex items-center gap-2.5 rounded-lg bg-gray-100 py-2 pl-2 pr-3 text-sm font-semibold text-gray-700">
                <div className="w-[27.25rem] shrink-0 flex items-center gap-x-2 truncate whitespace-nowrap px-1">
                  <span>Total {guest.rows.length}</span>
                  {typeBreakdown.length > 0 && (
                    <span className="font-normal text-gray-500">({typeBreakdown.join(', ')})</span>
                  )}
                </div>

                {(() => {
                  let totalPrice = 0;
                  let totalAmount = 0;
                  let totalDiscAmt = 0;
                  let totalAmtAfterDisc = 0;
                  let totalTaxAmt = 0;
                  let totalAmtInclTax = 0;

                  guest.rows.forEach(row => {
                    const tag = row.typeLabel || 'Service';
                    const price = Number(row.price) || 0;
                    const qty = row.qty || 1;
                    const amount = price * qty;
                    const discType = row.discType || 'Flat';
                    let discAmt = Number(row.discAmt) || 0;
                    if (discType === 'Prive Member' || discType === '20%') {
                      discAmt = amount * 0.20;
                    } else if (discType.endsWith('%')) {
                      const pct = parseFloat(discType) || 0;
                      discAmt = amount * (pct / 100);
                    }
                    const amtAfterDisc = Math.max(0, amount - discAmt);

                    const getTaxRate = (label) => {
                      const t = label.toLowerCase();
                      if (t.includes('service') || t.includes('product')) return 0.18;
                      return 0;
                    }
                    const taxRate = getTaxRate(tag);
                    const taxAmt = amtAfterDisc * taxRate;
                    const amtInclTax = amtAfterDisc + taxAmt;

                    totalPrice += price;
                    totalAmount += amount;
                    totalDiscAmt += discAmt;
                    totalAmtAfterDisc += amtAfterDisc;
                    totalTaxAmt += taxAmt;
                    totalAmtInclTax += amtInclTax;
                  });

                  return (
                    <>
                      <div className="w-16 shrink-0 text-center text-gray-700 font-bold">
                        {currency(totalPrice)}
                      </div>
                      <div className="w-14 shrink-0"></div>
                      <div className="w-16 shrink-0 text-center text-gray-700 font-bold">
                        {currency(totalAmount)}
                      </div>
                      <div className="w-28 shrink-0"></div>
                      <div className="w-28 shrink-0 text-center text-emerald-600 font-bold">
                        {totalDiscAmt > 0 ? currency(totalDiscAmt) : '0'}
                      </div>
                      <div className="w-20 shrink-0 text-center text-gray-700 font-bold">
                        {currency(totalAmtAfterDisc)}
                      </div>
                      <div className="w-16 shrink-0 text-center text-gray-700 font-bold">
                        {currency(totalTaxAmt)}
                      </div>
                      <div className="w-24 shrink-0 text-center text-indigo-600 font-bold">
                        {currency(totalAmtInclTax)}
                      </div>
                      <div className="w-12 shrink-0"></div>
                    </>
                  );
                })()}
              </div>
            </div>
          </>
        )}

        {/* Browse */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => onBrowse('services')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-100 py-3.5 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
          >
            Add Services
          </button>
          <button
            onClick={() => onBrowse('products')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-100 py-3.5 text-sm font-medium text-emerald-700 hover:bg-emerald-200"
          >
            Add Products
          </button>
          <button
            onClick={() => onBrowse('plans')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-100 py-3.5 text-sm font-medium text-rose-700 hover:bg-rose-200"
          >
            Add Offers
          </button>
          <button
            onClick={() => onBrowse()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            <IconGrid width={18} height={18} /> Browse All
          </button>
        </div>
      </section>
    </div>
  )
}


// One cell of the horizontal billing summary — label on top, value (or control) below.
function Stat({ label, value, hint, tone = 'text-gray-800', labelTone = 'text-gray-500', children }) {
  return (
    <div>
      <div className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide ${labelTone}`}>
        {label}
        {hint && <span className="rounded bg-emerald-50 px-1 text-[9px] font-bold text-emerald-600">{hint}</span>}
      </div>
      {value !== undefined && <div className={`mt-0.5 text-base font-semibold ${tone}`}>{value}</div>}
      {children}
    </div>
  )
}

function CheckoutPanel({
  subtotal, packageDiscount,
  override, overrideDiscount = 0, onOverride, onClearOverride,
  onPaidChange, payReset,
  pendingBills = [], onPendingBills,
  remarks, setRemarks,
  onSaveDraft, onPrintAndSave,
  disabled
}) {
  const totalSaved = round2(Math.min(subtotal, packageDiscount + (override ? overrideDiscount : 0)));
  const afterDiscount = round2(Math.max(0, subtotal - totalSaved));
  const tax = round2(afterDiscount * 0.18); // 18% tax (CGST + SGST)
  const subTotal = round2(afterDiscount + tax);
  const pending = round2(pendingBills.reduce((s, b) => s + billPending(b), 0)); // picked old bills
  const payable = round2(subTotal + pending);
  const netTotal = Math.round(payable); // grand total, rounded to the nearest rupee
  const roundOff = round2(netTotal - payable);

  return (
    <div className="rounded-xl border border-gray-300 bg-white p-3">
      <div className="space-y-3 text-sm">
        {/* Heading row carries the two bill-level actions */}
        <div className="text-sm font-bold text-gray-800">Billing Summary</div>
        <div className="flex flex-wrap items-start gap-x-6 gap-y-4 border-b border-gray-300 pb-4 text-sm">
          <Stat label="Total Price" value={money(subtotal)} />

          <Stat label="Total Discount" value={`- ${money(totalSaved)}`} tone="text-emerald-600">
            <div className="mt-1.5 flex items-center gap-2">
              <button
                onClick={onOverride}
                className="rounded-lg bg-[#1e3a56] px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-[#16293d]"
              >
                Override Discount
              </button>
              {override && (
                <button
                  onClick={onClearOverride}
                  className="rounded-lg bg-[#1e3a56] px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-[#16293d]"
                >
                  Undo Discount
                </button>
              )}
            </div>
          </Stat>

          <Stat label="Amt. After Disc." value={money(afterDiscount)} />
          <Stat label="Total Tax" value={money(tax)} hint="CGST+SGST" />
          <Stat label="Sub Total" value={money(subTotal)} />

          <Stat
            label="Pending Amount"
            value={money(pending)}
            tone={pending > 0 ? 'text-rose-500' : 'text-gray-800'}
            labelTone="text-rose-500"
            hint={pendingBills.length ? `${pendingBills.length} bill${pendingBills.length === 1 ? '' : 's'}` : undefined}
          >
            <button
              onClick={onPendingBills}
              className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-[#1e3a56] px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-[#16293d]"
            >
              Pending Bills 📋
            </button>
          </Stat>

          <Stat label="Round Off" value={`${roundOff < 0 ? '- ' : ''}${money(Math.abs(roundOff))}`} />

          <div className="ml-auto text-right">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Grand Total</div>
            <div className="text-2xl font-bold text-indigo-500">{money(netTotal)}</div>
          </div>
        </div>
        <div className="mt-3">
          <PaymentMethods key={payReset} netTotal={netTotal} onPaidChange={onPaidChange} />
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ServiceModal from './ServiceModal'
import CustomerSearch from './CustomerSearch'
import AddCustomerModal from './AddCustomerModal'
import RecentVisitsModal from './RecentVisitsModal'
import ClientDetailsDrawer from './ClientDetailsDrawer'
import { currency, stylists } from '../data/services'
import {
  cInput, Field, StylistSelect, AssistantSelect, SearchSelect,
  FUTURE_DATES, TIME_SLOTS, DEFAULT_TIME, tagStyle, kindMeta, itemToRow, GenderBadge, serviceGender,
} from './apptFields'
import { IconClose, IconUsers, IconGrid, IconPlus, IconHome, IconMenu } from './Icons'

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

export default function NewBillModal({ open, onClose, onBooked }) {
  const [guests, setGuests] = useState(() => [newGuest()])
  const [active, setActive] = useState(() => guests[0]?.id)
  const [browseFor, setBrowseFor] = useState(null) // guestId while Browse modal is open
  const [custAddOpen, setCustAddOpen] = useState(false)
  const [recentOpen, setRecentOpen] = useState(false)
  const [takePayment, setTakePayment] = useState(false)
  const [clientView, setClientView] = useState(null) // customer being viewed in ClientDetailsDrawer
  const [pendingSplit, setPendingSplit] = useState(null) // Rule 3 confirm: { gender, items, existingId, existingName }
  const [manualDiscount, setManualDiscount] = useState('')
  const [tip, setTip] = useState('')
  const [paymentMode, setPaymentMode] = useState('Cash')
  const [splitPayment, setSplitPayment] = useState(false)
  const [splitRows, setSplitRows] = useState([{ id: Date.now(), mode: 'Cash', amount: '', ref: '' }])
  const [saleBy, setSaleBy] = useState('')
  const [remarks, setRemarks] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [source, setSource] = useState('Walk-in')
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
  const rowDiscountAmount = (r) => Math.min((Number(r.price) || 0) * (r.qty || 1), ((r.kind === 'service' || r.kind === 'product') ? 440 : 0))
  const rowTotal = (r) => Math.max(0, (Number(r.price) || 0) * (r.qty || 1) - rowDiscountAmount(r))
  const guestTotal = (g) => g.rows.reduce((s, r) => s + rowTotal(r), 0)
  const grandTotal = guests.reduce((s, g) => s + guestTotal(g), 0)
  const grossTotal = guests.reduce((s, g) => s + g.rows.reduce((ss, r) => ss + ((Number(r.price) || 0) * (r.qty || 1)), 0), 0)
  const totalPackageDiscount = guests.reduce((s, g) => s + g.rows.reduce((ss, r) => ss + rowDiscountAmount(r), 0), 0)
  const totalItems = guests.reduce((s, g) => s + g.rows.length, 0)

  const guestName = (g) => g.customer?.name || g.label

  const handleBook = () => {
    onBooked?.(guests.length)
  }
  const handleBookAndPay = () => {
    onClose?.()
    navigate('/billing')
  }

  const showAll = active === 'all' || !activeGuest

  const currentNetTotal = Math.round(Math.max(0, grandTotal - (Number(manualDiscount) || 0)) * 1.18 + (Number(tip) || 0));
  const totalSplit = splitRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const isBalanced = totalSplit === currentNetTotal;

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
        <div className="flex items-center gap-2.5 border-b border-gray-100 px-4 py-2">
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <IconClose width={18} height={18} />
          </button>
          <IconUsers width={18} height={18} className="text-indigo-600" />
          <h2 className="shrink-0 text-base font-semibold text-gray-800">New Bill</h2>



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
        <div className="flex-1 overflow-y-auto bg-gray-50/40 p-4">
          {showAll ? (
            <div className="space-y-4">
              <AllSummary guests={guests} guestName={guestName} guestTotal={guestTotal} onOpen={setActive} onClient={setClientView} rowDiscountAmount={rowDiscountAmount} />

              <CheckoutPanel
                subtotal={grossTotal}
                packageDiscount={totalPackageDiscount}
                manualDiscount={manualDiscount} setManualDiscount={setManualDiscount}
                tip={tip} setTip={setTip}
                paymentMode={paymentMode} setPaymentMode={setPaymentMode}
                splitPayment={splitPayment} setSplitPayment={setSplitPayment}
                splitRows={splitRows} setSplitRows={setSplitRows}
                netTotal={currentNetTotal}
                saleBy={saleBy} setSaleBy={setSaleBy}
                remarks={remarks} setRemarks={setRemarks}
                onSaveDraft={onClose}
                onPrintAndSave={handleBook}
                disabled={totalItems === 0}
              />
            </div>
          ) : (
            <GuestEditor
              key={activeGuest.id}
              guest={activeGuest}
              guestName={guestName}
              onCustomer={(c) => patchGuest(activeGuest.id, { customer: c })}
              onPatch={(patch) => patchGuest(activeGuest.id, patch)}
              onRecent={() => setRecentOpen(true)}
              onRow={(uid, patch) => patchRow(activeGuest.id, uid, patch)}
              onRemoveRow={(uid) => removeRow(activeGuest.id, uid)}
              onBrowse={() => setBrowseFor(activeGuest.id)}
              onClientDetails={() => setClientView(activeGuest.customer)}
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
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Net Total</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {currency(currentNetTotal)}
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-5 ml-6">
                <button className="flex items-center gap-1.5 text-sm font-medium text-amber-500 hover:text-amber-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line></svg>
                  Hold
                </button>
                <button className="flex items-center gap-1.5 rounded-full border-2 border-gray-300 px-4 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Held Sales
                </button>
                <button className="text-sm font-medium text-teal-500 hover:text-teal-600">
                  Apply Offers
                </button>
                <button className="flex items-center gap-1.5 text-sm font-medium text-rose-500 hover:text-rose-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  Clear all
                </button>
              </div>

              <div className="flex flex-1 max-w-md gap-3 ml-auto">
                <button
                  onClick={onClose}
                  className="flex-[1] rounded-lg border-2 border-indigo-400 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={totalItems === 0 || (splitPayment && !isBalanced)}
                  className="flex-[3] rounded-lg bg-[#4a7196] py-2 text-sm font-bold text-white shadow hover:bg-[#3d6083] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ✓ Print & Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="hidden sm:block flex-shrink-0">
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{guestName(activeGuest)} Total</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {currency(guestTotal(activeGuest))}
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-5 ml-6">
                <button className="flex items-center gap-1.5 text-sm font-medium text-amber-500 hover:text-amber-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line></svg>
                  Hold
                </button>
                <button className="flex items-center gap-1.5 rounded-full border-2 border-gray-300 px-4 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Held Sales
                </button>
                <button className="text-sm font-medium text-teal-500 hover:text-teal-600">
                  Apply Offers
                </button>
                <button className="flex items-center gap-1.5 text-sm font-medium text-rose-500 hover:text-rose-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  Clear all
                </button>
              </div>

              <div className="flex flex-1 max-w-md gap-3 ml-auto">
                <button
                  onClick={onClose}
                  className="flex-[1] rounded-lg border-2 border-indigo-400 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={totalItems === 0 || (splitPayment && !isBalanced)}
                  className="flex-[3] rounded-lg bg-[#4a7196] py-2 text-sm font-bold text-white shadow hover:bg-[#3d6083] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ✓ Print & Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Browse to add items to a guest */}
      <ServiceModal
        open={!!browseFor}
        onClose={() => setBrowseFor(null)}
        onAdd={(items) => { if (browseFor) addRows(browseFor, items) }}
      />
      {/* Add customer (header quick-add for the active guest) */}
      <AddCustomerModal
        open={custAddOpen}
        onClose={() => setCustAddOpen(false)}
        onAdd={(c) => activeGuest && patchGuest(activeGuest.id, { customer: c })}
      />
      <RecentVisitsModal open={recentOpen} onClose={() => setRecentOpen(false)} />
      <ClientDetailsDrawer open={!!clientView} onClose={() => setClientView(null)} customer={clientView} />

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
              {pendingSplit.candidates.map((c, idx) => (
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

      {/* Booking source confirmation */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-2">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-800">Confirm Booking</h3>
            <p className="mt-1 text-sm text-gray-500">Add any remarks and select the appointment source to continue.</p>

            {/* Remarks */}
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-600">Remarks</label>
              <textarea
                value={remarks}
                maxLength={500}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                placeholder="Any special instructions or notes..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y"
              />
              <div className="mt-1 text-right text-xs text-gray-400">{remarks.length} / 500</div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-3">
              {['Walk-in', 'Phone'].map((opt) => (
                <label
                  key={opt}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition-colors ${
                    source === opt ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="booking-source"
                    value={opt}
                    checked={source === opt}
                    onChange={() => setSource(opt)}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  <span className="text-sm font-medium text-gray-700">{opt}</span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => { setConfirmOpen(false); setSource('Walk-in') }}
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                   setConfirmOpen(false);
                   handleBook();
                }}
                disabled={!source}
                className="rounded-lg bg-[#4a7196] px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#3d6083] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ---- All tab: summary of every guest ----
function AllSummary({ guests, guestName, guestTotal, onOpen, onClient, rowDiscountAmount }) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {guests.map((g, idx) => (
        <div key={g.id} className="rounded-xl border border-gray-200 bg-white p-4">
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
              {g.customer?.phone && <span className="text-xs text-gray-400">{g.customer.phone}</span>}
              {g.customer && (
                <button
                  onClick={() => onClient?.(g.customer)}
                  className="ml-1 rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600 hover:bg-indigo-100"
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
              {g.rows.map((r) => (
                <div key={r.uid} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-medium text-gray-700">{r.name}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${tagStyle(r.typeLabel).pill}`}>{r.typeLabel}</span>
                    {rowDiscountAmount && rowDiscountAmount(r) > 0 && (
                      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Discount -{currency(rowDiscountAmount(r))}
                      </span>
                    )}
                    {r.kind === 'service' && (
                      <span className="text-[11px] text-gray-400">
                        <span className={r.stylist ? 'text-gray-500' : 'italic'}>{r.stylist || 'No stylist'}</span> · {r.date} · {r.time}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-medium text-indigo-600">{currency(r.price)}</span>
                </div>
              ))}
              <div className="flex justify-end border-t border-gray-100 pt-1 text-sm font-semibold text-gray-700">
                Subtotal: {currency(guestTotal(g))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ---- Guest tab: editable items (like single booking) ----
function GuestEditor({ guest, guestName, onCustomer, onPatch, onRecent, onRow, onRemoveRow, onBrowse, onClientDetails, total, rowDiscountAmount }) {
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
    <div className="space-y-4">
      {/* Customer row — same layout as the single New Appointment drawer */}
      <section className="rounded-xl border border-sky-200 bg-sky-100/60 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
          <Field
            required
            className="lg:col-span-2"
            label={
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1"><IconUsers width={13} height={13} /> Customer</span>
                {guest.customer && (
                  <>
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">{guest.customer.gender}</span>
                    <span className="text-[10px] font-normal text-gray-500">{guest.customer.phone}</span>
                    <button
                      onClick={onClientDetails}
                      className="ml-1 rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600 hover:bg-indigo-100"
                    >
                      View offers
                    </button>
                  </>
                )}
              </span>
            }
          >
            <CustomerSearch value={guest.customer} onChange={onCustomer} />
          </Field>

          <Field label="Date" required>
            <SearchSelect value={guest.date} onChange={(v) => onPatch({ date: v })} options={FUTURE_DATES} searchPlaceholder="Search date..." />
          </Field>

          <Field label="Time" required>
            <SearchSelect value={guest.time} onChange={(v) => onPatch({ time: v })} options={TIME_SLOTS} searchPlaceholder="Search time..." />
          </Field>

          <Field label={<span className="inline-flex items-center gap-1"><IconHome width={13} height={13} /> Home Service</span>}>
            <button
              onClick={() => onPatch({ homeService: !guest.homeService })}
              className="flex h-[34px] w-full items-center gap-2 rounded-md border border-gray-200 bg-white px-2"
            >
              <span className={`relative h-4 w-8 shrink-0 rounded-full transition-colors ${guest.homeService ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${guest.homeService ? 'left-[18px]' : 'left-0.5'}`} />
              </span>
              <span className="truncate text-xs text-gray-600">{guest.homeService ? 'Yes — Home' : 'No — Salon'}</span>
            </button>
          </Field>

          {guest.customer && (
            <Field label={<span className="invisible">Recent</span>}>
              <button
                onClick={onRecent}
                className="h-[34px] w-full rounded-md border border-gray-200 bg-white px-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Recent Visits
              </button>
            </Field>
          )}
        </div>
      </section>

      {/* Items */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        {guest.rows.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
            No items yet — use <span className="font-medium text-gray-500">Browse Select Items</span> below.
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {guest.rows.map((row, idx) => {
                const tag = row.typeLabel || 'Service'
                const m = tagStyle(tag) // dot from tagStyle
                const km = kindMeta[row.kind] || kindMeta.service // card from kindMeta
                const isServiceOrProduct = row.kind === 'service' || row.kind === 'product'

                return (
                  <div key={row.uid} className={`flex items-center gap-2.5 rounded-lg border p-2 shadow-sm ${km.card}`}>
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${m.dot}`}>{nums[idx]}</span>

                    <div className="w-40 shrink-0 truncate text-sm font-semibold text-gray-800" title={row.name}>
                      {row.name}
                    </div>

                    <div className="w-72 shrink-0 flex items-center">
                      {isServiceOrProduct && (
                        <div className="flex items-center gap-1.5 rounded bg-[#ebf8f2] px-2 py-1 text-[11px]">
                          <span className="font-bold text-[#20925e]">📦 Package</span>
                          <span className="font-semibold text-[#188050]">-₹440.00</span>
                          <select className="w-28 rounded border border-gray-200 bg-white px-1 py-0.5 text-[10px] text-gray-700 outline-none">
                            <option>Service Package for Bi (8...</option>
                          </select>
                          <button className="text-gray-400 hover:text-gray-600"><IconClose width={10} height={10} /></button>
                        </div>
                      )}
                    </div>

                    <div className="flex-1" />

                    <div className="w-32 shrink-0">
                      <select className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-500 outline-none focus:border-indigo-400">
                        <option value="">Sale By (optional)...</option>
                        {stylists.map(s => <option key={s.id}>{s.name}</option>)}
                      </select>
                    </div>

                    <div className="w-32 shrink-0">
                      <StylistSelect value={row.stylist} onChange={(v) => onRow(row.uid, { stylist: v })} placeholder="Assign stylist..." />
                    </div>

                    <div className="w-14 shrink-0 text-right text-sm text-gray-500">
                      {currency(row.price)}
                    </div>

                    <div className="flex shrink-0 items-center rounded-lg border border-gray-200 overflow-hidden bg-white">
                      <button onClick={() => onRow(row.uid, { qty: Math.max(1, (row.qty || 1) - 1) })} className="px-2 py-0.5 text-gray-500 hover:bg-gray-50">−</button>
                      <span className="w-6 text-center text-sm font-semibold text-gray-800">{row.qty || 1}</span>
                      <button onClick={() => onRow(row.uid, { qty: (row.qty || 1) + 1 })} className="bg-indigo-500 px-2 py-0.5 text-white hover:bg-indigo-600">+</button>
                    </div>

                    <div className="w-16 shrink-0 text-right text-sm font-bold text-gray-800">
                      {currency(Math.max(0, (Number(row.price) || 0) * (row.qty || 1) - ((row.kind === 'service' || row.kind === 'product') ? 440 : 0)))}
                    </div>

                    <button onClick={() => onRemoveRow(row.uid)} className="flex shrink-0 items-center justify-center p-1 text-rose-400 hover:text-rose-600">
                      <IconClose width={14} height={14} />
                    </button>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-2 flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700">
              <span className="flex items-center gap-x-2 truncate whitespace-nowrap">
                <span>Total {totalItems}</span>
                {typeBreakdown.length > 0 && (
                  <span className="font-normal text-gray-500">({typeBreakdown.join(', ')})</span>
                )}
              </span>
              <div className="flex items-center gap-6 mr-2">
                {(() => {
                  const guestGrossTotal = guest.rows.reduce((s, r) => s + ((Number(r.price) || 0) * (r.qty || 1)), 0);
                  const guestDiscountTotal = guest.rows.reduce((s, r) => s + (rowDiscountAmount ? rowDiscountAmount(r) : 0), 0);
                  if (guestDiscountTotal > 0) {
                    return (
                      <>
                        <span className="text-gray-500 font-medium">Price: {currency(guestGrossTotal)}</span>
                        <span className="text-emerald-600 font-medium">Disc: -{currency(guestDiscountTotal)}</span>
                      </>
                    );
                  }
                  return null;
                })()}
                <span className="text-indigo-600 font-bold">Net: {currency(total)}</span>
              </div>
            </div>
          </>
        )}

        {/* Browse */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={onBrowse}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <IconGrid width={18} height={18} /> Browse Select Items
          </button>
        </div>
      </section>
    </div>
  )
}


function CheckoutPanel({
  subtotal, packageDiscount,
  manualDiscount, setManualDiscount,
  tip, setTip,
  paymentMode, setPaymentMode,
  splitPayment, setSplitPayment,
  splitRows, setSplitRows,
  netTotal: passedNetTotal,
  saleBy, setSaleBy,
  remarks, setRemarks,
  onSaveDraft, onPrintAndSave,
  disabled
}) {
    const md = Number(manualDiscount) || 0;
  const t = Number(tip) || 0;

  const totalSaved = packageDiscount + md;
  const afterDiscount = Math.max(0, subtotal - totalSaved);
  const tax = afterDiscount * 0.18; // 18% tax
  const roundOff = Math.round(afterDiscount + tax + t) - (afterDiscount + tax + t);
  const netTotal = Math.round(afterDiscount + tax + t);

  const modes = [
    { id: 'Cash', label: 'Cash', icon: '💵' },
    { id: 'Card', label: 'Card', icon: '💳' },
    { id: 'UPI', label: 'UPI', icon: '📱' },
    { id: 'Gift Card', label: 'Gift Card', icon: '🎁' },
    { id: 'Net Banking', label: 'Net Banking', icon: '🏦' }
  ];

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center text-gray-600">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-800">{currency(subtotal)}</span>
        </div>

        {packageDiscount > 0 && (
          <div className="flex justify-between items-center text-emerald-600">
            <span className="flex items-center gap-1">📦 Package Discount</span>
            <span className="font-medium">- {currency(packageDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center bg-green-100/50 rounded border border-green-50/20 py-1 px-2">
          <div className="flex items-center gap-3 text-gray-600">
            <span>Manual Discount</span>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                value={manualDiscount}
                onChange={(e) => setManualDiscount(e.target.value)}
                className="w-20 rounded border border-gray-200 py-1 pl-6 pr-2 text-sm outline-none focus:border-indigo-400 bg-white"
              />
            </div>
          </div>
          {totalSaved > 0 && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm px-2 py-1 rounded bg-emerald-50">
              <span className="italic">Total Saved</span>
              <span className="font-bold">- {currency(totalSaved)}</span>
            </div>
          )}
        </div>

        {totalSaved > 0 && (
          <div className="flex justify-between items-center text-gray-800 font-medium pt-1 pb-1">
            <span>After Disc.</span>
            <span>{currency(afterDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-gray-600">
          <span className="flex items-center gap-1">
            Tax (18%) <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">CGST+SGST</span>
          </span>
          <span className="font-semibold text-gray-800">{currency(tax)}</span>
        </div>

        <div className="flex justify-between items-center text-gray-600">
          <span>Round Off</span>
          <span className="font-semibold text-gray-800">{currency(roundOff)}</span>
        </div>

        <div className="flex justify-between items-center text-gray-600">
          <span className="flex items-center gap-1 text-emerald-600">💵 Tip</span>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              className="w-20 rounded border border-gray-200 py-1 pl-6 pr-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        <div className="border-t border-gray-100"></div>

        <div className="flex justify-between items-end">
          <div className="text-sm font-bold text-gray-800 uppercase tracking-wider">Net Total</div>
          <div className="text-2xl font-bold text-indigo-500">{currency(netTotal)}</div>
        </div>

        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={splitPayment}
              onChange={(e) => {
                setSplitPayment(e.target.checked);
                if (e.target.checked) {
                  setSplitRows([{ id: Date.now(), mode: 'Cash', amount: passedNetTotal || '', ref: '' }]);
                }
              }}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="text-sm text-gray-700 font-medium">Split Payment</span>
          </label>

          {splitPayment ? (
            <div className="space-y-2">
              {splitRows.map((row, idx) => (
                <div key={row.id} className="flex items-center gap-2">
                  <select
                    value={row.mode}
                    onChange={(e) => {
                      const newRows = [...splitRows];
                      newRows[idx].mode = e.target.value;
                      setSplitRows(newRows);
                    }}
                    className="w-32 rounded-lg border border-gray-200 py-1.5 px-2 text-sm text-gray-700 outline-none focus:border-indigo-400"
                  >
                    {modes.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>

                  <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={row.amount}
                      onChange={(e) => {
                        const newRows = [...splitRows];
                        newRows[idx].amount = e.target.value;
                        setSplitRows(newRows);
                      }}
                      className="w-full rounded-lg border border-gray-200 py-1.5 pl-6 pr-2 text-sm outline-none focus:border-indigo-400"
                      placeholder="0.00"
                    />
                  </div>

                  {(row.mode === 'Card' || row.mode === 'UPI' || row.mode === 'Net Banking') && (
                    <input
                      type="text"
                      value={row.ref}
                      onChange={(e) => {
                        const newRows = [...splitRows];
                        newRows[idx].ref = e.target.value;
                        setSplitRows(newRows);
                      }}
                      className="w-24 rounded-lg border border-gray-200 py-1.5 px-2 text-sm outline-none focus:border-indigo-400"
                      placeholder="Ref"
                    />
                  )}

                  {row.mode === 'Gift Card' && (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={row.ref}
                        onChange={(e) => {
                          const newRows = [...splitRows];
                          newRows[idx].ref = e.target.value;
                          setSplitRows(newRows);
                        }}
                        className="w-24 rounded-lg border border-gray-200 py-1.5 px-2 text-sm outline-none focus:border-indigo-400"
                        placeholder="Card no."
                      />
                      <button className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs font-medium text-gray-600">Check</button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (splitRows.length > 1) {
                        setSplitRows(splitRows.filter((_, i) => i !== idx));
                      }
                    }}
                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"
                  >
                    ×
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    const currentSplitTotal = splitRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
                    const remainder = passedNetTotal - currentSplitTotal;
                    setSplitRows([...splitRows, { id: Date.now(), mode: 'Cash', amount: remainder > 0 ? remainder : '', ref: '' }]);
                  }}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  + Add payment row
                </button>

                {(() => {
                  const totalSplit = splitRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
                  const diff = passedNetTotal - totalSplit;
                  const isBalanced = diff === 0;
                  return (
                    <span className={`text-sm font-bold ${isBalanced ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isBalanced ? 'Balanced' : (diff > 0 ? `Remaining: ${currency(diff)}` : `Advance: ${currency(Math.abs(diff))}`)}
                    </span>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {modes.map(m => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMode(m.id)}
                  className={`flex-1 min-w-fit flex flex-row items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] sm:text-[11px] whitespace-nowrap transition-colors ${paymentMode === m.id
                    ? 'border-emerald-500 bg-emerald-50/20 text-emerald-600 font-bold'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 font-medium'
                    }`}
                >
                  <span className="text-sm">{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          )}

          <select
            value={saleBy}
            onChange={(e) => setSaleBy(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-1.5 px-3 text-sm text-gray-500 outline-none focus:border-indigo-400"
          >
            <option value="">Sale By (optional)</option>
            {stylists.map(s => <option key={s.id}>{s.name}</option>)}
          </select>

          


        </div>
      </div>
    </div>
  )
}

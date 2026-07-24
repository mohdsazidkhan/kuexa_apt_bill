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
  FUTURE_DATES, TIME_SLOTS, DEFAULT_TIME, tagStyle, kindMeta, itemToRow,
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

export default function GroupBookingModal({ open, onClose, onBooked }) {
  const [guests, setGuests] = useState(() => [newGuest()])
  const [active, setActive] = useState(() => guests[0]?.id)
  const [browseFor, setBrowseFor] = useState(null) // guestId while Browse modal is open
  const [custAddOpen, setCustAddOpen] = useState(false)
  const [recentOpen, setRecentOpen] = useState(false)
  const [takePayment, setTakePayment] = useState(false)
  const [clientView, setClientView] = useState(null) // customer being viewed in ClientDetailsDrawer
  const navigate = useNavigate()

  const activeGuest = guests.find((g) => g.id === active)

  // --- guest + row mutations ---
  const patchGuest = (id, patch) => setGuests((gs) => gs.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  const patchRow = (gid, uid, patch) =>
    setGuests((gs) => gs.map((g) => (g.id === gid ? { ...g, rows: g.rows.map((r) => (r.uid === uid ? { ...r, ...patch } : r)) } : g)))
  const removeRow = (gid, uid) =>
    setGuests((gs) => gs.map((g) => (g.id === gid ? { ...g, rows: g.rows.filter((r) => r.uid !== uid) } : g)))
  const addRows = (gid, items) =>
    setGuests((gs) => gs.map((g) => (g.id === gid ? { ...g, rows: [...g.rows, ...items.map(itemToRow)] } : g)))

  // Round-robin assign stylists to a guest's service rows.
  const autoAssign = (gid) =>
    setGuests((gs) => gs.map((g) => {
      if (g.id !== gid) return g
      let i = 0
      return { ...g, rows: g.rows.map((r) => {
        if (r.kind !== 'service') return r
        const stylist = stylists[i % stylists.length].name
        i += 1
        return { ...r, stylist }
      }) }
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
  const guestTotal = (g) => g.rows.reduce((s, r) => s + (Number(r.price) || 0), 0)
  const grandTotal = guests.reduce((s, g) => s + guestTotal(g), 0)
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
          <h2 className="shrink-0 text-base font-semibold text-gray-800">Group Booking</h2>

          {/* Auto actions (small) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={doAutoAssign}
              disabled={totalItems === 0}
              className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-600 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <IconUsers width={12} height={12} /> Auto Assign
            </button>
            <button
              onClick={doAutoSequence}
              disabled={totalItems === 0}
              className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-600 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <IconMenu width={12} height={12} /> Auto Sequence
            </button>
          </div>

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
            <AllSummary guests={guests} guestName={guestName} guestTotal={guestTotal} onOpen={setActive} onClient={setClientView} />
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
              total={guestTotal(activeGuest)}
            />
          )}
        </div>

        {/* Footer — same buttons as the single New Appointment drawer */}
        <div className="border-t border-gray-200 bg-white px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-3 pr-4">
              <button
                onClick={() => setTakePayment((v) => !v)}
                className={`relative h-5 w-9 rounded-full transition-colors ${takePayment ? 'bg-indigo-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${takePayment ? 'left-[18px]' : 'left-0.5'}`} />
              </button>
              <span className="leading-tight">
                <span className="block text-sm font-medium text-gray-700">Take Payment Now</span>
                <span className="block text-xs text-gray-400">Appointment saves then billing opens automatically</span>
              </span>
            </label>

            <span className="hidden text-sm text-gray-500 md:block">
              {guests.length} guest{guests.length > 1 ? 's' : ''} · {totalItems} items ·{' '}
              <span className="font-semibold text-indigo-600">{currency(grandTotal)}</span>
            </span>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <button onClick={onClose} className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button className="rounded-lg px-5 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50">Save as Waiting</button>
              <button className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Save as Draft</button>
              <button
                onClick={takePayment ? handleBookAndPay : handleBook}
                disabled={totalItems === 0}
                className="rounded-lg bg-[#4a7196] px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#3d6083] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {takePayment ? 'Book and Pay Now' : 'Book Group Appointment'}
              </button>
            </div>
          </div>
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
    </>
  )
}

// ---- All tab: summary of every guest ----
function AllSummary({ guests, guestName, guestTotal, onOpen, onClient }) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {guests.map((g, idx) => (
        <div key={g.id} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">{idx + 1}</span>
              <button
                onClick={() => g.customer && onClient?.(g.customer)}
                title={g.customer ? 'View client details' : undefined}
                className={`text-sm font-semibold ${g.customer ? 'text-violet-600 underline decoration-violet-400 underline-offset-2 hover:text-violet-700' : 'cursor-default text-gray-800'}`}
              >
                {guestName(g)}
              </button>
              {g.customer?.gender && (
                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">{g.customer.gender}</span>
              )}
              {g.customer?.phone && <span className="text-xs text-gray-400">{g.customer.phone}</span>}
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
function GuestEditor({ guest, guestName, onCustomer, onPatch, onRecent, onRow, onRemoveRow, onBrowse, total }) {
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
            <div className="mb-1.5 flex items-center gap-2.5 px-3 text-[11px] font-semibold text-gray-900">
              <span className="w-6 shrink-0" />
              <span className="min-w-0 flex-1">Service / Item</span>
              <span className="w-16 shrink-0">Dur</span>
              <span className="w-36 shrink-0"><span className="text-rose-400">*</span>Primary Stylist</span>
              <span className="w-36 shrink-0">Assistant(s)</span>
              <span className="w-28 shrink-0">Date</span>
              <span className="w-24 shrink-0">Time</span>
              <span className="w-24 shrink-0">Price (₹)</span>
              <span className="w-6 shrink-0" />
            </div>
            <div className="space-y-2">
              {guest.rows.map((row, idx) => {
                const tag = row.typeLabel || 'Service'
                const m = tagStyle(tag)
                const card = kindMeta[row.kind]?.card ?? kindMeta.service.card
                return (
                  <div key={row.uid} className={`rounded-lg border p-1.5 shadow ${card}`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${m.dot}`}>{nums[idx]}</span>
                      {row.kind === 'service' ? (
                        <>
                          <span className="flex min-w-0 flex-1 items-center gap-2">
                            <span className="truncate text-sm font-semibold text-gray-800">{row.name}</span>
                            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${m.pill}`}>{tag}</span>
                          </span>
                          <div className="w-16 shrink-0"><input className={cInput} value={row.duration} onChange={(e) => onRow(row.uid, { duration: e.target.value })} /></div>
                          <div className="w-36 shrink-0"><StylistSelect value={row.stylist} onChange={(v) => onRow(row.uid, { stylist: v })} /></div>
                          <div className="w-36 shrink-0"><AssistantSelect value={row.assistants} onChange={(v) => onRow(row.uid, { assistants: v })} /></div>
                          <div className="w-28 shrink-0"><SearchSelect value={row.date} onChange={(v) => onRow(row.uid, { date: v })} options={FUTURE_DATES} searchPlaceholder="Search date..." /></div>
                          <div className="w-24 shrink-0"><SearchSelect value={row.time} onChange={(v) => onRow(row.uid, { time: v })} options={TIME_SLOTS} searchPlaceholder="Search time..." /></div>
                          <div className="w-24 shrink-0"><input className={cInput} value={row.price} onChange={(e) => onRow(row.uid, { price: e.target.value })} placeholder="0.00" /></div>
                        </>
                      ) : (
                        <>
                          <span className="flex min-w-0 flex-1 items-center gap-2">
                            <span className="truncate text-sm font-semibold text-gray-800">{row.name}</span>
                            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${m.pill}`}>{tag}</span>
                          </span>
                          <span className="w-16 shrink-0" />
                          <span className="w-36 shrink-0" />
                          <span className="w-36 shrink-0" />
                          <span className="w-28 shrink-0" />
                          <span className="w-24 shrink-0" />
                          <div className="w-24 shrink-0 text-sm font-semibold text-gray-800">{currency(row.price)}</div>
                        </>
                      )}
                      <button onClick={() => onRemoveRow(row.uid)} title="Remove" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-rose-50 hover:text-rose-500">
                        <IconClose width={16} height={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-2 flex items-center gap-2.5 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700">
              <span className="w-6 shrink-0" />
              <span className="flex min-w-0 flex-1 items-center gap-x-2 truncate whitespace-nowrap">
                <span>Total {totalItems}</span>
                {typeBreakdown.length > 0 && (
                  <span className="font-normal text-gray-500">({typeBreakdown.join(', ')})</span>
                )}
              </span>
              <span className="w-16 shrink-0">{totalDuration} min</span>
              <span className="w-36 shrink-0" />
              <span className="w-36 shrink-0" />
              <span className="w-28 shrink-0" />
              <span className="w-24 shrink-0" />
              <span className="w-24 shrink-0 text-indigo-600">{currency(total)}</span>
              <span className="w-6 shrink-0" />
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

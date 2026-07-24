import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ServiceModal from './ServiceModal'
import RecentVisitsModal from './RecentVisitsModal'
import CustomerSearch from './CustomerSearch'
import AddCustomerModal from './AddCustomerModal'
import ClientDetailsDrawer from './ClientDetailsDrawer'
import {
  stylists, membershipPlans, packagePlans, giftCardPlans, currency,
} from '../data/services'
import {
  IconCalendar, IconClose, IconUsers, IconClock, IconHome,
  IconScissors, IconGrid, IconTag, IconChevron, IconSearch, IconMenu, IconRefresh,
} from './Icons'

const Label = ({ children, required }) => (
  <label className="mb-1.5 block text-sm font-medium text-gray-600">
    {required && <span className="text-rose-500">*</span>} {children}
  </label>
)

const input =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'

// Compact field style for the single-row item layout.
const cInput =
  'w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-indigo-400'

// Small stacked field: tiny label above a compact control.
const Field = ({ label, required, className = '', children }) => (
  <div className={className}>
    <label className="mb-1 block whitespace-nowrap text-[11px] font-semibold text-gray-900">
      {required && <span className="text-rose-500">*</span>}{label}
    </label>
    {children}
  </div>
)

// Searchable multi-select for assistant stylists.
function AssistantSelect({ value = [], onChange }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = stylists.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()))
  const toggle = (name) =>
    onChange(value.includes(name) ? value.filter((n) => n !== name) : [...value, name])

  const label = value.length === 0 ? 'Add...' : value.length === 1 ? value[0] : `${value.length} selected`

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={value.length ? value.join(', ') : undefined}
        className={`${cInput} flex items-center justify-between gap-1 text-left`}
      >
        <span className={`truncate ${value.length ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
        <IconChevron width={14} height={14} className="shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="absolute left-0 z-40 mt-1 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <div className="relative">
            <IconSearch width={14} height={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search stylist..."
              className="w-full rounded-md border border-gray-200 py-1.5 pl-7 pr-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div className="mt-1 max-h-44 overflow-y-auto">
            {filtered.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={value.includes(s.name)}
                  onChange={() => toggle(s.name)}
                  className="h-4 w-4 accent-indigo-600"
                />
                <span className="text-sm text-gray-700">{s.name}</span>
              </label>
            ))}
            {filtered.length === 0 && <div className="px-2 py-2 text-xs text-gray-400">No stylist found</div>}
          </div>
        </div>
      )}
    </div>
  )
}

// Searchable single-select for the primary stylist.
function StylistSelect({ value, onChange, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = stylists.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()))
  const pick = (name) => {
    onChange(name)
    setOpen(false)
    setQ('')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${cInput} flex items-center justify-between gap-1 text-left`}
      >
        <span className={`truncate ${value ? 'text-gray-800' : 'text-gray-400'}`}>{value || placeholder}</span>
        <IconChevron width={14} height={14} className="shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="absolute left-0 z-40 mt-1 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <div className="relative">
            <IconSearch width={14} height={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search stylist..."
              className="w-full rounded-md border border-gray-200 py-1.5 pl-7 pr-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div className="mt-1 max-h-44 overflow-y-auto">
            {value && (
              <button
                type="button"
                onClick={() => pick('')}
                className="w-full rounded px-2 py-1.5 text-left text-xs text-gray-400 hover:bg-gray-50"
              >
                Clear selection
              </button>
            )}
            {filtered.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pick(s.name)}
                className={`flex w-full items-center rounded px-2 py-1.5 text-left text-sm hover:bg-indigo-50 ${
                  value === s.name ? 'font-semibold text-indigo-600' : 'text-gray-700'
                }`}
              >
                {s.name}
              </button>
            ))}
            {filtered.length === 0 && <div className="px-2 py-2 text-xs text-gray-400">No stylist found</div>}
          </div>
        </div>
      )}
    </div>
  )
}

// Generic searchable single-select over a list of string options.
function SearchSelect({ value, onChange, options, placeholder = 'Select...', searchPlaceholder = 'Search...', dropWidth = 'w-52' }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = options.filter((o) => o.toLowerCase().includes(q.toLowerCase()))
  const pick = (v) => {
    onChange(v)
    setOpen(false)
    setQ('')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${cInput} flex items-center justify-between gap-1 text-left`}
      >
        <span className={`truncate ${value ? 'text-gray-800' : 'text-gray-400'}`}>{value || placeholder}</span>
        <IconChevron width={14} height={14} className="shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className={`absolute left-0 z-40 mt-1 ${dropWidth} rounded-lg border border-gray-200 bg-white p-2 shadow-lg`}>
          <div className="relative">
            <IconSearch width={14} height={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-md border border-gray-200 py-1.5 pl-7 pr-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div className="mt-1 max-h-48 overflow-y-auto">
            {filtered.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => pick(o)}
                className={`flex w-full items-center rounded px-2 py-1.5 text-left text-sm hover:bg-indigo-50 ${
                  value === o ? 'font-semibold text-indigo-600' : 'text-gray-700'
                }`}
              >
                {o}
              </button>
            ))}
            {filtered.length === 0 && <div className="px-2 py-2 text-xs text-gray-400">No match</div>}
          </div>
        </div>
      )}
    </div>
  )
}

// Future dates (today → +90 days) and AM/PM time slots for the pickers.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const FUTURE_DATES = (() => {
  const arr = []
  const today = new Date()
  for (let i = 0; i < 90; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    arr.push(`${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`)
  }
  return arr
})()
const TIME_SLOTS = (() => {
  const arr = []
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 15, 30, 45]) {
      const ampm = h < 12 ? 'AM' : 'PM'
      const hh = h % 12 === 0 ? 12 : h % 12
      arr.push(`${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`)
    }
  }
  return arr
})()

let uidCounter = 0
const emptyService = () => ({
  uid: `svc-${uidCounter++}`,
  kind: 'service',
  typeLabel: 'Service',
  name: '',
  price: '',
  duration: 30,
  stylist: '',
  assistants: [],
  time: '10:00 AM',
  date: FUTURE_DATES[0],
})

// Per-kind styling for the appointment rows.
const kindMeta = {
  service: { label: 'Service', card: 'border-indigo-100 bg-indigo-50/40', dot: 'bg-indigo-600', text: 'text-indigo-600', pill: 'bg-indigo-100 text-indigo-700' },
  product: { label: 'Product', card: 'border-amber-100 bg-amber-50/50', dot: 'bg-amber-500', text: 'text-amber-600', pill: 'bg-amber-100 text-amber-700' },
  plan: { label: 'Plan', card: 'border-emerald-100 bg-emerald-50/50', dot: 'bg-emerald-600', text: 'text-emerald-600', pill: 'bg-emerald-100 text-emerald-700' },
}

// Per-tag styling — each item type gets its own row background, dot & pill.
const tagMeta = {
  Service: { card: 'border-indigo-100 bg-indigo-50/40', dot: 'bg-indigo-600', pill: 'bg-indigo-100 text-indigo-700' },
  Product: { card: 'border-amber-100 bg-amber-50/50', dot: 'bg-amber-500', pill: 'bg-amber-100 text-amber-700' },
  Membership: { card: 'border-emerald-100 bg-emerald-50/50', dot: 'bg-emerald-600', pill: 'bg-emerald-100 text-emerald-700' },
  Package: { card: 'border-sky-100 bg-sky-50/50', dot: 'bg-sky-600', pill: 'bg-sky-100 text-sky-700' },
  'Gift Card': { card: 'border-rose-100 bg-rose-50/50', dot: 'bg-rose-500', pill: 'bg-rose-100 text-rose-700' },
  Plan: { card: 'border-emerald-100 bg-emerald-50/50', dot: 'bg-emerald-600', pill: 'bg-emerald-100 text-emerald-700' },
}
const tagStyle = (tag) => tagMeta[tag] ?? tagMeta.Service

export default function NewAppointmentModal({ open, onClose, onBooked }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [recentOpen, setRecentOpen] = useState(false)
  const [homeService, setHomeService] = useState(false)
  const [takePayment, setTakePayment] = useState(false)
  const [rows, setRows] = useState([])
  const [remarks, setRemarks] = useState('')
  const [customer, setCustomer] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [source, setSource] = useState('')
  const [apptDate, setApptDate] = useState(FUTURE_DATES[0])
  const [apptTime, setApptTime] = useState('10:00 AM')
  const [custAddOpen, setCustAddOpen] = useState(false)
  const [clientOpen, setClientOpen] = useState(false)
  const [seqOpen, setSeqOpen] = useState(false)
  const navigate = useNavigate()

  // Move a row up (-1) or down (+1) in the list.
  const moveRow = (index, dir) =>
    setRows((rs) => {
      const j = index + dir
      if (j < 0 || j >= rs.length) return rs
      const next = [...rs]
      ;[next[index], next[j]] = [next[j], next[index]]
      return next
    })

  // Auto-sequence: group items by type order (Services → Products → Memberships → …).
  const autoSequence = () =>
    setRows((rs) => {
      const order = ['Service', 'Product', 'Membership', 'Package', 'Gift Card']
      const rank = (r) => {
        const i = order.indexOf(r.typeLabel || 'Service')
        return i === -1 ? 99 : i
      }
      return [...rs].sort((a, b) => rank(a) - rank(b))
    })

  const confirmBooking = () => {
    if (!source) return
    setConfirmOpen(false)
    setSource('')
    onBooked?.(source)
  }

  // "Take Payment Now" ON → book and jump straight to Billing.
  const handleBookAndPay = () => {
    onClose?.()
    navigate('/billing')
  }

  const removeRow = (uid) => setRows((r) => r.filter((x) => x.uid !== uid))
  const updateRow = (uid, patch) =>
    setRows((r) => r.map((x) => (x.uid === uid ? { ...x, ...patch } : x)))

  // Round-robin assign a stylist to every service row.
  const autoAssignStylists = () =>
    setRows((rs) => {
      let i = 0
      return rs.map((r) => {
        if (r.kind !== 'service') return r
        const stylist = stylists[i % stylists.length].name
        i += 1
        return { ...r, stylist }
      })
    })

  const handleModalAdd = (items) => {
    const newRows = items.map((it) => ({
      ...emptyService(),
      kind: it.kind ?? 'service',
      // Specific type label — plans carry Membership / Package / Gift Card.
      typeLabel: it.kind === 'plan' ? it.type || 'Plan' : it.kind === 'product' ? 'Product' : 'Service',
      name: it.name,
      category: it.category,
      price: it.price,
      duration: it.duration ?? 30,
    }))
    setRows((r) => {
      const firstEmpty = r.length === 1 && !r[0].name
      return firstEmpty ? newRows : [...r, ...newRows]
    })
  }

  // Running per-kind counter so labels read "Service 1", "Product 1", "Plan 1".
  const kindCounts = {}
  const rowNumbers = rows.map((r) => {
    const k = r.kind ?? 'service'
    kindCounts[k] = (kindCounts[k] ?? 0) + 1
    return kindCounts[k]
  })

  // Totals across all selected items.
  const totalItems = rows.length
  const totalPrice = rows.reduce((s, r) => s + (Number(r.price) || 0), 0)
  const totalDuration = rows.reduce(
    (s, r) => s + (r.kind === 'service' ? Number(r.duration) || 0 : 0),
    0
  )

  // Count breakdown by item type, e.g. "Services-2, Products-2, Memberships-1".
  const TYPE_ORDER = ['Service', 'Product', 'Membership', 'Package', 'Gift Card']
  const ABBR = {
    Service: 'SERV', Product: 'PROD', Membership: 'MBS',
    Package: 'PKG', 'Gift Card': 'GC',
  }
  const typeCounts = rows.reduce((acc, r) => {
    const t = r.typeLabel || kindMeta[r.kind]?.label || 'Service'
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})
  const typeBreakdown = TYPE_ORDER.filter((t) => typeCounts[t]).map((t) => `${ABBR[t]}-${typeCounts[t]}`)

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Right-side drawer — slides in, sits beside the 16rem sidebar */}
      <div
        style={{ width: 'calc(100% - 16rem)' }}
        className={`fixed right-0 top-0 z-40 flex h-screen flex-col bg-white transition-transform duration-300 ease-out ${
          open ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-gray-100 px-6 py-2.5">
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <IconClose width={18} height={18} />
          </button>
          <IconCalendar width={18} height={18} className="text-indigo-600" />
          <h2 className="text-base font-semibold text-gray-800">New Appointment</h2>

          {/* Top-right: selected customer chip + Add Customer button */}
          <div className="ml-auto flex items-center gap-3">
            {customer && (
              <button
                onClick={() => setClientOpen(true)}
                title="View client details"
                className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 py-1 pl-1.5 pr-3 hover:bg-emerald-100"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-semibold text-white">
                  {customer.name.charAt(0)}
                </span>
                <div className="text-left leading-tight">
                  <div className="text-[13px] font-semibold text-gray-800">{customer.name}</div>
                  <div className="text-[11px] text-gray-500">{customer.gender} · {customer.phone}</div>
                </div>
              </button>
            )}
            <button
              onClick={() => setCustAddOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
            >
              <IconUsers width={15} height={15} /> Add Customer
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-2 overflow-y-auto bg-gray-50/10 p-4">
          {/* Section 1 — Customer & schedule */}
          <section className="rounded-xl border border-sky-200 bg-sky-100/60 p-2">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
            <Field label={<span className="inline-flex items-center gap-1"><IconUsers width={13} height={13} /> Customer</span>} required className="lg:col-span-2">
              <CustomerSearch value={customer} onChange={setCustomer} />
            </Field>

            <Field label="Date" required>
              <SearchSelect value={apptDate} onChange={setApptDate} options={FUTURE_DATES} placeholder="Select date" searchPlaceholder="Search date..." />
            </Field>

            <Field label="Time" required>
              <SearchSelect value={apptTime} onChange={setApptTime} options={TIME_SLOTS} placeholder="Select time" searchPlaceholder="Search time..." />
            </Field>

            <Field label={<span className="inline-flex items-center gap-1"><IconHome width={13} height={13} /> Home Service</span>}>
              <button
                onClick={() => setHomeService((v) => !v)}
                className="flex h-[34px] w-full items-center gap-2 rounded-md border border-gray-200 bg-white px-2"
              >
                <span className={`relative h-4 w-8 shrink-0 rounded-full transition-colors ${homeService ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${homeService ? 'left-[18px]' : 'left-0.5'}`} />
                </span>
                <span className="truncate text-xs text-gray-600">
                  {homeService ? 'Yes — Home' : 'No — Salon'}
                </span>
              </button>
            </Field>

            {customer && (
              <Field label={<span className="invisible">Recent</span>}>
                <button
                  onClick={() => setRecentOpen(true)}
                  className="h-[34px] w-full rounded-md border border-gray-200 bg-white px-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Recent Visits
                </button>
              </Field>
            )}
          </div>
          </section>

          {/* Section 2 — Services / items */}
          <section className="rounded-xl border border-gray-200 bg-white p-2">

          {/* Service rows */}
          <div className="mt-0">
            {rows.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
                No items added yet — use <span className="font-medium text-gray-500">Browse Select Items</span> below to add services, products or plans.
              </div>
            ) : (
              <>
                {/* Column header (once) */}
                <div className="mb-1.5 flex items-center gap-2.5 px-3 text-[11px] font-semibold text-gray-900">
                  <span className="w-6 shrink-0" />
                  <span className="min-w-0 flex-1">Service / Item</span>
                  <span className="w-16 shrink-0">Duration</span>
                  <span className="w-36 shrink-0"><span className="text-rose-400">*</span>Primary Stylist</span>
                  <span className="w-36 shrink-0">Assistant(s)</span>
                  <span className="w-28 shrink-0">Date</span>
                  <span className="w-24 shrink-0">Time</span>
                  <span className="w-24 shrink-0">Price (₹)</span>
                  <span className="w-6 shrink-0" />
                </div>

                <div className="space-y-2">
                  {rows.map((row, idx) => {
                    const tag = row.typeLabel || kindMeta[row.kind]?.label || 'Service'
                    const meta = { ...tagStyle(tag), label: tag }
                    return (
                      <div key={row.uid} className={`rounded-lg border px-3 py-1.5 shadow-md ${meta.card}`}>
                        <div className="flex items-center gap-2.5">
                          <span
                            title={`${meta.label} ${rowNumbers[idx]}`}
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${meta.dot}`}
                          >
                            {rowNumbers[idx]}
                          </span>

                          {row.kind === 'service' ? (
                            <>
                              <div className="flex min-w-0 flex-1 items-center gap-2">
                                <span className="truncate text-sm font-semibold text-gray-800">
                                  {row.name || <span className="font-normal text-gray-400">—</span>}
                                </span>
                                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${meta.pill}`}>
                                  {row.typeLabel || meta.label}
                                </span>
                              </div>
                              <div className="w-16 shrink-0">
                                <input className={cInput} value={row.duration} onChange={(e) => updateRow(row.uid, { duration: e.target.value })} />
                              </div>
                              <div className="w-36 shrink-0">
                                <StylistSelect
                                  value={row.stylist}
                                  onChange={(v) => updateRow(row.uid, { stylist: v })}
                                />
                              </div>
                              <div className="w-36 shrink-0">
                                <AssistantSelect
                                  value={row.assistants}
                                  onChange={(v) => updateRow(row.uid, { assistants: v })}
                                />
                              </div>
                              <div className="w-28 shrink-0">
                                <SearchSelect value={row.date} onChange={(v) => updateRow(row.uid, { date: v })} options={FUTURE_DATES} placeholder="Date" searchPlaceholder="Search date..." />
                              </div>
                              <div className="w-24 shrink-0">
                                <SearchSelect value={row.time} onChange={(v) => updateRow(row.uid, { time: v })} options={TIME_SLOTS} placeholder="Time" searchPlaceholder="Search time..." />
                              </div>
                              <div className="w-24 shrink-0">
                                <input className={cInput} value={row.price} onChange={(e) => updateRow(row.uid, { price: e.target.value })} placeholder="0.00" />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex min-w-0 flex-1 items-center gap-2">
                                <span className="truncate text-sm font-semibold text-gray-800">{row.name}</span>
                                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${meta.pill}`}>
                                  {row.typeLabel || meta.label}
                                </span>
                              </div>
                              <span className="w-16 shrink-0" />
                              <span className="w-36 shrink-0" />
                              <span className="w-36 shrink-0" />
                              <span className="w-28 shrink-0" />
                              <span className="w-24 shrink-0" />
                              <div className="w-24 shrink-0 text-sm font-semibold text-gray-800">{currency(row.price)}</div>
                            </>
                          )}

                          <button
                            onClick={() => removeRow(row.uid)}
                            title="Remove item"
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-rose-50 hover:text-rose-500"
                          >
                            <IconClose width={16} height={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Totals row */}
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
                  <span className="w-24 shrink-0 text-indigo-600">{currency(totalPrice)}</span>
                  <span className="w-6 shrink-0" />
                </div>
              </>
            )}
          </div>

          {/* Auto-assign + Auto-sequence + Browse */}
          <div className="mt-4 flex gap-3">
            {rows.some((r) => r.kind === 'service') && (
              <button
                onClick={autoAssignStylists}
                className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
              >
                <IconUsers width={18} height={18} /> Auto Assign Stylist
              </button>
            )}
            {rows.length > 1 && (
              <button
                onClick={() => setSeqOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
              >
                <IconMenu width={18} height={18} /> Auto Sequence
              </button>
            )}
            <button
              onClick={() => setModalOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <IconGrid width={18} height={18} /> Browse Select Items
            </button>
          </div>
          </section>

          {/* Section 3 — Membership / Packages / Gift Cards */}
          {/* <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <IconTag width={18} height={18} className="text-indigo-600" />
              <span className="text-sm font-semibold text-gray-700">Membership / Packages / Gift Cards</span>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                {membershipPlans.length + packagePlans.length + giftCardPlans.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label>Membership Plan</Label>
                <select className={input}>
                  <option value="">Select membership plan to sell...</option>
                  {membershipPlans.map((p) => <option key={p.id}>{p.name} — {currency(p.price)}</option>)}
                </select>
              </div>
              <div>
                <Label>Package Plans</Label>
                <select className={input}>
                  <option value="">Select package plans to sell...</option>
                  {packagePlans.map((p) => <option key={p.id}>{p.name} — {currency(p.price)}</option>)}
                </select>
              </div>
              <div>
                <Label>Gift Card Plans</Label>
                <select className={input}>
                  <option value="">Select gift card plans to sell...</option>
                  {giftCardPlans.map((p) => <option key={p.id}>{p.name} — {currency(p.price)}</option>)}
                </select>
              </div>
            </div>
          </div> */}

        </div>

        {/* Sticky footer inside modal */}
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

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <button onClick={onClose} className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button className="rounded-lg px-5 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50">Save as Waiting</button>
              <button className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Save as Draft</button>
              <button
                onClick={takePayment ? handleBookAndPay : () => setConfirmOpen(true)}
                className="rounded-lg bg-[#4a7196] px-8 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#3d6083]"
              >
                {takePayment ? 'Book and Pay Now' : 'Book Appointment'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ServiceModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleModalAdd} />
      <RecentVisitsModal open={recentOpen} onClose={() => setRecentOpen(false)} />
      <AddCustomerModal open={custAddOpen} onClose={() => setCustAddOpen(false)} onAdd={setCustomer} />
      <ClientDetailsDrawer open={clientOpen} onClose={() => setClientOpen(false)} customer={customer} />
      <ClientDetailsDrawer open={clientOpen} onClose={() => setClientOpen(false)} customer={customer} />

      {/* Reorder / sequence modal */}
      {seqOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <IconMenu width={20} height={20} className="text-indigo-600" /> Reorder Services
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={autoSequence}
                  className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  <IconRefresh width={14} height={14} /> Auto-Sequence
                </button>
                <button onClick={() => setSeqOpen(false)} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                  <IconClose width={18} height={18} />
                </button>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">Use the arrows to reorder, or Auto-Sequence to group by type.</p>

            <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
              {rows.map((row, idx) => {
                const tag = row.typeLabel || kindMeta[row.kind]?.label || 'Service'
                const m = tagStyle(tag)
                return (
                  <div key={row.uid} className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${m.card}`}>
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${m.dot}`}>
                      {idx + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">{row.name}</span>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${m.pill}`}>{tag}</span>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => moveRow(idx, -1)}
                        disabled={idx === 0}
                        title="Move up"
                        className="rounded-md border border-gray-200 bg-white p-1 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <IconChevron width={16} height={16} className="rotate-180" />
                      </button>
                      <button
                        onClick={() => moveRow(idx, 1)}
                        disabled={idx === rows.length - 1}
                        title="Move down"
                        className="rounded-md border border-gray-200 bg-white p-1 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <IconChevron width={16} height={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSeqOpen(false)}
                className="rounded-lg bg-[#4a7196] px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#3d6083]"
              >
                Done
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
                className={`${input} resize-y`}
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
                onClick={() => { setConfirmOpen(false); setSource('') }}
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
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

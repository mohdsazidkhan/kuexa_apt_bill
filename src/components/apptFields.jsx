import { useState, useRef, useEffect } from 'react'
import { stylists } from '../data/services'
import { IconChevron, IconSearch } from './Icons'

// Shared field styles + controls used by the appointment & group-booking drawers.
export const cInput =
  'w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-indigo-400'

export const Field = ({ label, required, className = '', children }) => (
  <div className={className}>
    <label className="mb-1 block whitespace-nowrap text-[11px] font-semibold text-gray-900">
      {required && <span className="text-rose-500">*</span>}{label}
    </label>
    {children}
  </div>
)

// Future dates (today → +90 days) and AM/PM time slots.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const FUTURE_DATES = (() => {
  const arr = []
  const today = new Date()
  for (let i = 0; i < 90; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    arr.push(`${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`)
  }
  return arr
})()
export const TIME_SLOTS = (() => {
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
export const DEFAULT_TIME = '10:00 AM'

// Per-kind styling.
export const kindMeta = {
  service: { label: 'Service', card: 'bg-indigo-100 border-indigo-200', dot: 'bg-indigo-600', pill: 'bg-indigo-100 text-indigo-700' },
  product: { label: 'Product', card: 'bg-amber-100 border-amber-200', dot: 'bg-amber-500', pill: 'bg-amber-100 text-amber-700' },
  plan: { label: 'Plan', card: 'bg-emerald-100 border-emerald-200', dot: 'bg-emerald-600', pill: 'bg-emerald-100 text-emerald-700' },
}
const tagMeta = {
  Service: { card: 'bg-indigo-100 border-indigo-200', pill: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-600' },
  Product: { card: 'bg-amber-100 border-amber-200', pill: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  Membership: { card: 'bg-emerald-100 border-emerald-200', pill: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-600' },
  Package: { card: 'bg-sky-100 border-sky-200', pill: 'bg-sky-100 text-sky-700', dot: 'bg-sky-600' },
  'Gift Card': { card: 'bg-rose-100 border-rose-200', pill: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
  Plan: { card: 'bg-emerald-100 border-emerald-200', pill: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-600' },
}
export const tagStyle = (tag) => tagMeta[tag] ?? tagMeta.Service

// Derive a gender indicator from the service name.
export const serviceGender = (name = '') => {
  const n = name.toLowerCase()
  if (/female|women|ladies|girl/.test(n)) return 'F'
  if (/male|\bmen\b|men |gents|beard/.test(n)) return 'M'
  return 'U'
}

// Small M / F / U badge shown on a service item.
export function GenderBadge({ name }) {
  const g = serviceGender(name)
  const style = g === 'M' ? 'bg-blue-100 text-blue-700' : g === 'F' ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-500'
  const title = g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Unisex'
  return <span title={title} className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${style}`}>{g}</span>
}

let uidCounter = 0
export const emptyItem = () => ({
  uid: `it-${uidCounter++}`,
  kind: 'service',
  typeLabel: 'Service',
  name: '',
  category: undefined,
  price: '',
  duration: 30,
  stylist: '',
  assistants: [],
  time: DEFAULT_TIME,
  date: FUTURE_DATES[0],
})

// Map a browse-selected item to a booking row.
export const itemToRow = (it) => ({
  ...emptyItem(),
  kind: it.kind ?? 'service',
  typeLabel: it.kind === 'plan' ? it.type || 'Plan' : it.kind === 'product' ? 'Product' : 'Service',
  name: it.name,
  category: it.category,
  price: it.price,
  basePrice: it.price,
  duration: it.duration ?? 30,
})

// ---- Searchable single-select for the primary stylist ----
export function StylistSelect({ value, onChange, placeholder = 'Stylist', className = '' }) {
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const filtered = stylists.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()))
  const pick = (name) => { onChange(name); setOpen(false); setQ('') }
  
  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      setOpenUp(spaceBelow < 250 && spaceAbove > spaceBelow)
    }
    setOpen((o) => !o)
  }

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={handleToggle} className={`${cInput} ${className} flex items-center justify-between gap-1 text-left`}>
        <span className={`truncate ${value ? 'text-gray-800' : 'text-gray-400'}`}>{value || placeholder}</span>
        <IconChevron width={14} height={14} className="shrink-0 text-gray-400" />
      </button>
      {open && (
        <div className={`absolute left-0 z-50 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg ${openUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          <div className="relative">
            <IconSearch width={14} height={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stylist..." className="w-full rounded-md border border-gray-200 py-1.5 pl-7 pr-2 text-sm outline-none focus:border-indigo-400" />
          </div>
          <div className="mt-1 max-h-44 overflow-y-auto">
            {value && <button type="button" onClick={() => pick('')} className="w-full rounded px-2 py-1.5 text-left text-xs text-gray-400 hover:bg-gray-50">Clear selection</button>}
            {filtered.map((s) => (
              <button key={s.id} type="button" onClick={() => pick(s.name)} className={`flex w-full items-center rounded px-2 py-1.5 text-left text-sm hover:bg-indigo-50 ${value === s.name ? 'font-semibold text-indigo-600' : 'text-gray-700'}`}>{s.name}</button>
            ))}
            {filtered.length === 0 && <div className="px-2 py-2 text-xs text-gray-400">No stylist found</div>}
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Searchable multi-select for assistants ----
export function AssistantSelect({ value = [], onChange }) {
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const filtered = stylists.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()))
  const toggle = (name) => onChange(value.includes(name) ? value.filter((n) => n !== name) : [...value, name])
  const label = value.length === 0 ? 'Add...' : value.length === 1 ? value[0] : `${value.length} selected`
  
  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      setOpenUp(spaceBelow < 250 && spaceAbove > spaceBelow)
    }
    setOpen((o) => !o)
  }

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={handleToggle} title={value.length ? value.join(', ') : undefined} className={`${cInput} flex items-center justify-between gap-1 text-left`}>
        <span className={`truncate ${value.length ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
        <IconChevron width={14} height={14} className="shrink-0 text-gray-400" />
      </button>
      {open && (
        <div className={`absolute left-0 z-50 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg ${openUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          <div className="relative">
            <IconSearch width={14} height={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stylist..." className="w-full rounded-md border border-gray-200 py-1.5 pl-7 pr-2 text-sm outline-none focus:border-indigo-400" />
          </div>
          <div className="mt-1 max-h-44 overflow-y-auto">
            {filtered.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-50">
                <input type="checkbox" checked={value.includes(s.name)} onChange={() => toggle(s.name)} className="h-4 w-4 accent-indigo-600" />
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

// ---- Generic searchable single-select over string options ----
export function SearchSelect({ value, onChange, options, placeholder = 'Select...', searchPlaceholder = 'Search...', dropWidth = 'w-48' }) {
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const filtered = options.filter((o) => o.toLowerCase().includes(q.toLowerCase()))
  const pick = (v) => { onChange(v); setOpen(false); setQ('') }
  
  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      setOpenUp(spaceBelow < 250 && spaceAbove > spaceBelow)
    }
    setOpen((o) => !o)
  }

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={handleToggle} className={`${cInput} flex items-center justify-between gap-1 text-left`}>
        <span className={`truncate ${value ? 'text-gray-800' : 'text-gray-400'}`}>{value || placeholder}</span>
        <IconChevron width={14} height={14} className="shrink-0 text-gray-400" />
      </button>
      {open && (
        <div className={`absolute left-0 z-50 ${dropWidth} rounded-lg border border-gray-200 bg-white p-2 shadow-lg ${openUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          <div className="relative">
            <IconSearch width={14} height={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} className="w-full rounded-md border border-gray-200 py-1.5 pl-7 pr-2 text-sm outline-none focus:border-indigo-400" />
          </div>
          <div className="mt-1 max-h-48 overflow-y-auto">
            {filtered.map((o) => (
              <button key={o} type="button" onClick={() => pick(o)} className={`flex w-full items-center rounded px-2 py-1.5 text-left text-sm hover:bg-indigo-50 ${value === o ? 'font-semibold text-indigo-600' : 'text-gray-700'}`}>{o}</button>
            ))}
            {filtered.length === 0 && <div className="px-2 py-2 text-xs text-gray-400">No match</div>}
          </div>
        </div>
      )}
    </div>
  )
}

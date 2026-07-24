import { useMemo, useState } from 'react'
import { services, products, plans, serviceCategories, currency } from '../data/services'
import { IconScissors, IconClose, IconSearch, IconGrid, IconTag } from './Icons'
import { GenderBadge } from './apptFields'

const TABS = [
  { key: 'services', label: 'Services', icon: IconScissors, data: services },
  { key: 'products', label: 'Products', icon: IconGrid, data: products },
  { key: 'plans', label: 'Plans', icon: IconTag, data: plans },
]

// Tag pill colours for plan sub-types.
const planTagStyle = {
  Membership: 'bg-emerald-100 text-emerald-700',
  Package: 'bg-sky-100 text-sky-700',
  'Gift Card': 'bg-rose-100 text-rose-700',
}

export default function ServiceModal({ open, onClose, onAdd }) {
  const [tab, setTab] = useState('services')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState({})

  const active = TABS.find((t) => t.key === tab)

  const items = useMemo(() => {
    let list = active.data
    if (tab === 'services' && category !== 'All') {
      list = list.filter((s) => s.category === category)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(q))
    }
    return list
  }, [active, tab, category, query])

  // Map the active tab to a singular item kind tagged onto each selection.
  const kindByTab = { services: 'service', products: 'product', plans: 'plan' }

  const toggle = (item) =>
    setSelected((prev) => {
      const next = { ...prev }
      if (next[item.id]) delete next[item.id]
      else next[item.id] = { ...item, kind: kindByTab[tab] }
      return next
    })

  const count = Object.keys(selected).length

  const handleAdd = () => {
    onAdd?.(Object.values(selected))
    setSelected({})
    onClose?.()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Right-side drawer — same style as the New Appointment drawer */}
      <div
        style={{ width: 'calc(100% - 16rem)' }}
        className={`fixed right-0 top-0 z-50 flex h-screen flex-col bg-white transition-transform duration-300 ease-out ${
          open ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-gray-100 px-6 py-2.5">
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <IconClose width={18} height={18} />
          </button>
          <IconGrid width={18} height={18} className="text-indigo-600" />
          <h2 className="text-base font-semibold text-gray-800">Search or Select Items</h2>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50/40 px-6 py-4">
          {/* Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {TABS.map((t) => {
              const Icon = t.icon
              const on = t.key === tab
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${
                    on ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon width={16} height={16} /> {t.label}
                </button>
              )
            })}
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <IconSearch width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${active.label.toLowerCase()}... ( / to focus )`}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          {/* Category chips (services only) */}
          {tab === 'services' && (
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs">
              {serviceCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`transition-colors ${
                    category === c ? 'font-semibold text-indigo-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {items.map((item) => {
              const on = !!selected[item.id]
              return (
                <button
                  key={item.id}
                  onClick={() => toggle(item)}
                  className={`flex flex-col items-center rounded-lg border p-2.5 text-center transition-all ${
                    on
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  {item.type ? (
                    <span className={`mb-1 rounded px-1.5 py-0.5 text-[9px] font-semibold ${planTagStyle[item.type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {item.type}
                    </span>
                  ) : (
                    tab === 'services' && <span className="mb-1"><GenderBadge name={item.name} /></span>
                  )}
                  <span className="line-clamp-2 text-[11px] font-medium leading-tight text-gray-700">{item.name}</span>
                  <span className="mt-1 text-sm font-semibold text-indigo-600">{currency(item.price)}</span>
                  {item.duration != null && (
                    <span className="mt-0.5 text-[10px] text-gray-400">{item.duration} min</span>
                  )}
                </button>
              )
            })}
            {items.length === 0 && (
              <div className="col-span-full py-10 text-center text-sm text-gray-400">No items found</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-3">
          <button onClick={onClose} className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={count === 0}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add{count > 0 ? ` (${count})` : ''}
          </button>
        </div>
      </div>
    </>
  )
}

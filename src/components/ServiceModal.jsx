import { useMemo, useState, useEffect } from 'react'
import { services, products, plans, serviceCategories, currency } from '../data/services'
import { IconScissors, IconClose, IconSearch, IconGrid, IconTag } from './Icons'
import { GenderBadge } from './apptFields'

const TABS = [
  { key: 'services', label: 'Services', icon: IconScissors, data: services },
  { key: 'products', label: 'Products', icon: IconGrid, data: products },
  { key: 'plans', label: 'Offers', icon: IconTag, data: plans },
]

// Tag pill colours for plan sub-types.
const planTagStyle = {
  Membership: 'bg-emerald-100 text-emerald-700',
  Package: 'bg-sky-100 text-sky-700',
  'Gift Card': 'bg-rose-100 text-rose-700',
}

export default function ServiceModal({ open, onClose, onAdd, restrictedTab }) {
  const [tab, setTab] = useState('services')

  useEffect(() => {
    if (open) {
      setTab(restrictedTab || 'services')
    }
  }, [open, restrictedTab])
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
      // A product is findable by its brand as well as its name.
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.brand?.toLowerCase().includes(q))
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
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
      />

      {/* Right-side drawer — same style as the New Appointment drawer */}
      <div
        style={{ width: 'calc(100% - 16rem)' }}
        className={`fixed right-0 top-0 z-50 flex h-screen flex-col bg-white transition-transform duration-300 ease-out ${open ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-gray-100 bg-white px-6 py-3">
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <IconClose width={18} height={18} />
          </button>
          <IconGrid width={18} height={18} className="text-indigo-600" />
          <h2 className="text-base font-semibold text-gray-800">Search or Select Items</h2>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden bg-gray-50/40">
          {/* Top fixed area: Tabs & Search */}
          <div className="shrink-0 px-6 pt-4 pb-2 bg-white border-b border-gray-100">
            {/* Tabs */}
            {!restrictedTab && (
              <div className="grid grid-cols-3 gap-2">
              {TABS.map((t) => {
                const Icon = t.icon
                const on = t.key === tab
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${on ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    <Icon width={16} height={16} /> {t.label}
                  </button>
                )
              })}
            </div>
            )}

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
          </div>

          {/* Grid/List Area */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-4">
            {(() => {
              if (items.length === 0) {
                return <div className="w-full py-10 text-center text-sm text-gray-400">No items found</div>;
              }
              // Products are shelved by brand — that's how stock is bought and
              // counted. Services and offers stay grouped by category / type.
              const byBrand = tab === 'products';
              const groups = {};
              items.forEach(item => {
                const key = byBrand
                  ? (item.brand || 'Other')
                  : (item.category || item.type || 'Other');
                if (!groups[key]) groups[key] = [];
                groups[key].push(item);
              });

              // Brands run to a few dozen, so they're alphabetical to scan through;
              // categories keep the order they're listed in.
              const groupEntries = byBrand
                ? Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
                : Object.entries(groups);

              const groupCount = groupEntries.length;
              const columnStyle = groupCount <= 3
                ? { columnCount: groupCount, columnGap: '1rem' }
                : { columnWidth: '300px', columnGap: '1rem' };

              return (
                <div className="h-full" style={columnStyle}>
                  {groupEntries.map(([cat, catItems]) => (
                    <div key={cat} className="break-inside-avoid mb-4 border border-gray-200 bg-white shadow-sm flex flex-col rounded overflow-hidden">
                      <div className="bg-[#36536b] text-white text-center text-[11px] font-bold py-1.5 uppercase tracking-wider shrink-0">
                        {cat}
                      </div>
                      <div className="flex flex-col">
                        {catItems.map((item) => {
                          const on = !!selected[item.id];
                          return (
                            <button
                              key={item.id}
                              onClick={() => toggle(item)}
                              className={`flex items-center justify-between border-b border-gray-300 p-2.5 text-left transition-colors last:border-b-0 ${on ? 'bg-[#dceeff] text-gray-900 font-semibold' : 'bg-white hover:bg-gray-50 text-gray-700'
                                }`}
                            >
                              <span className="text-[13px] leading-tight flex-1 pr-2">{item.name}</span>
                              <span className="text-[14px] font-bold shrink-0 text-gray-800">{currency(item.price)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
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

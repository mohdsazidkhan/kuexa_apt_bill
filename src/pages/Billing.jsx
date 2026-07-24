import { useMemo, useState } from 'react'
import { services, products, plans, billingTabs, stylists, currency } from '../data/services'
import TopBar from '../components/TopBar'
import {
  IconScissors, IconGrid, IconTag, IconSearch, IconCart, IconTrash,
  IconPlus, IconGlobe, IconCalc, IconHistory, IconClock,
} from '../components/Icons'

const CATALOG_TABS = [
  { key: 'services', label: 'Services', icon: IconScissors, data: services },
  { key: 'products', label: 'Products', icon: IconGrid, data: products },
  { key: 'plans', label: 'Plans', icon: IconTag, data: plans },
]

const TAX_RATE = 0.18

export default function Billing() {
  const [tab, setTab] = useState('services')
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [items, setItems] = useState([
    { ...services[3], qty: 1, discount: 0, saleBy: '', stylist: '' }, // Women Ombrè Highlights
  ])
  const [manualDiscount, setManualDiscount] = useState(0)
  const [coupon, setCoupon] = useState('')

  const active = CATALOG_TABS.find((t) => t.key === tab)

  const catalog = useMemo(() => {
    let list = active.data
    if (tab === 'services' && filter !== 'All') list = list.filter((s) => s.tab === filter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(q))
    }
    return list
  }, [active, tab, filter, query])

  const addItem = (item) =>
    setItems((prev) => {
      const found = prev.find((i) => i.id === item.id)
      if (found) return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
      return [...prev, { ...item, qty: 1, discount: 0, saleBy: '', stylist: '' }]
    })

  const setQty = (id, delta) =>
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    )

  const updateItem = (id, patch) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id))

  const lineTotal = (i) => i.price * i.qty - Number(i.discount || 0)
  const subtotal = items.reduce((sum, i) => sum + lineTotal(i), 0)
  const afterDiscount = Math.max(0, subtotal - Number(manualDiscount || 0))
  const tax = afterDiscount * TAX_RATE
  const grandTotal = afterDiscount + tax

  return (
    <div className="-mx-6 -my-8 flex h-[calc(100vh)] flex-col">
      {/* Top bar */}
      <TopBar title="Billing" />

      {/* Sub header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Billing</h1>
          <p className="text-sm text-gray-400">Point of Sale — touch-optimized</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"><IconGlobe width={16} height={16} /> Currency</button>
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"><IconCalc width={16} height={16} /> Calculator</button>
          <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"><IconCart width={16} height={16} /> New Bill</button>
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"><IconHistory width={16} height={16} /> Bills History</button>
        </div>
      </div>

      {/* Body: catalog + bill */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden bg-gray-50 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Left: catalog */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 p-3">
            <div className="grid grid-cols-3 gap-2">
              {CATALOG_TABS.map((t) => {
                const Icon = t.icon
                const on = t.key === tab
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                      on ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon width={16} height={16} /> {t.label}
                  </button>
                )
              })}
            </div>

            <div className="relative mt-3">
              <IconSearch width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${active.label.toLowerCase()}... ( / to focus )`}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-indigo-400 focus:bg-white"
              />
            </div>

            {tab === 'services' && (
              <div className="mt-3 flex flex-wrap gap-2">
                {billingTabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      filter === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid flex-1 grid-cols-2 content-start gap-3 overflow-y-auto p-3 sm:grid-cols-3">
            {catalog.map((s) => (
              <button
                key={s.id}
                onClick={() => addItem(s)}
                className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-center transition-all hover:border-indigo-300 hover:shadow-sm"
              >
                <span className="line-clamp-2 text-sm font-semibold text-gray-700">{s.name}</span>
                <span className="mt-2 text-sm font-bold text-indigo-600">{currency(s.price)}</span>
                {s.duration != null && (
                  <span className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                    <IconClock width={11} height={11} /> {s.duration} min
                  </span>
                )}
              </button>
            ))}
            {catalog.length === 0 && (
              <div className="col-span-full py-10 text-center text-sm text-gray-400">No items found</div>
            )}
          </div>
        </div>

        {/* Right: bill */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
          {/* Customer bar */}
          <div className="flex items-center gap-2 border-b border-gray-100 p-3">
            <div className="relative flex-1">
              <IconSearch width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Search customer by name or phone..." className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-indigo-400 focus:bg-white" />
            </div>
            <button className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50">From Appt</button>
            <button className="rounded-lg border-2 border-indigo-500 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50">Walk-in</button>
          </div>

          {/* Bill items */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2 font-semibold text-gray-700">
              <IconCart width={18} height={18} /> Bill Items
            </div>
            <div className="flex items-center gap-4 text-sm">
              <button className="text-amber-600 hover:underline">Hold</button>
              <button className="text-gray-500 hover:underline">Held Sales</button>
              <button onClick={() => setItems([])} className="flex items-center gap-1 text-rose-500 hover:underline">
                <IconTrash width={14} height={14} /> Clear all
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {items.length === 0 && (
              <div className="py-16 text-center text-sm text-gray-400">
                No items yet — pick services from the left.
              </div>
            )}
            {items.map((i) => (
              <div key={i.id} className="mb-4 border-b border-gray-50 pb-4 last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-800">{i.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">{currency(i.price)}</span>
                    <button className="text-xs font-medium text-indigo-500 hover:underline">+ Discount</button>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                      <input
                        value={i.discount}
                        onChange={(e) => updateItem(i.id, { discount: e.target.value.replace(/[^\d.]/g, '') })}
                        className="w-20 rounded-md border border-gray-200 py-1 pl-5 pr-2 text-xs outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div className="flex items-center rounded-lg border border-gray-200">
                      <button onClick={() => setQty(i.id, -1)} className="px-2 py-1 text-gray-500 hover:bg-gray-50">−</button>
                      <span className="w-8 text-center text-sm font-medium">{i.qty}</span>
                      <button onClick={() => setQty(i.id, 1)} className="px-2 py-1 text-indigo-600 hover:bg-indigo-50"><IconPlus width={14} height={14} /></button>
                    </div>
                    <span className="w-20 text-right text-sm font-semibold text-gray-800">{currency(lineTotal(i))}</span>
                    <button onClick={() => removeItem(i.id)} className="text-gray-300 hover:text-rose-500"><IconTrash width={16} height={16} /></button>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <select
                    value={i.saleBy}
                    onChange={(e) => updateItem(i.id, { saleBy: e.target.value })}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-500 outline-none focus:border-indigo-400"
                  >
                    <option value="">Sale By (optional)...</option>
                    {stylists.map((s) => <option key={s.id}>{s.name}</option>)}
                  </select>
                  <select
                    value={i.stylist}
                    onChange={(e) => updateItem(i.id, { stylist: e.target.value })}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-500 outline-none focus:border-indigo-400"
                  >
                    <option value="">Assign stylist...</option>
                    {stylists.map((s) => <option key={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon + totals */}
          <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-4">
            <div className="mb-4">
              <div className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-600">
                <IconTag width={14} height={14} /> Coupon Code
              </div>
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Enter coupon code..."
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                />
                <button className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700">Apply</button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-800">{currency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Manual Discount</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                  <input
                    value={manualDiscount}
                    onChange={(e) => setManualDiscount(e.target.value.replace(/[^\d.]/g, ''))}
                    className="w-24 rounded-md border border-gray-200 py-1 pl-5 pr-2 text-right text-sm outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-500">
                  Tax (18%)
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">CGST+SGST</span>
                </span>
                <span className="font-medium text-gray-800">{currency(tax)}</span>
              </div>
              <div className="text-right text-[11px] text-gray-400">
                CGST 9%: {currency(tax / 2)} + SGST 9%: {currency(tax / 2)}
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                <span className="text-base font-bold text-gray-800">Grand Total</span>
                <span className="text-lg font-bold text-indigo-600">{currency(grandTotal)}</span>
              </div>
            </div>

            <button className="mt-4 w-full rounded-lg bg-[#4a7196] py-3 text-sm font-semibold text-white shadow hover:bg-[#3d6083]">
              Collect Payment · {currency(grandTotal)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

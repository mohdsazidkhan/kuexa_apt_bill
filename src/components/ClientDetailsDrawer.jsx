import { useState } from 'react'
import { currency } from '../data/services'
import { IconClose, IconHistory, IconTag, IconBilling } from './Icons'

// ---- Dummy client data ----
const transactions = [
  { bill: 'INV-63-2026-27-000016', date: '14 Jul 2026', total: 8260, paid: 0, outstanding: 8260, status: 'Pending' },
  { bill: 'INV-63-2026-27-000004', date: '07 Jul 2026', total: 4602, paid: 4602, outstanding: 0, status: 'Paid' },
  { bill: 'BILL-20260706162618-73', date: '06 Jul 2026', total: 11682, paid: 11682, outstanding: 0, status: 'Paid' },
  { bill: 'BILL-20260704105746-73', date: '04 Jul 2026', total: 8142, paid: 8142, outstanding: 0, status: 'Paid' },
  { bill: 'REF-BILL-20260703112253-63', date: '03 Jul 2026', total: 6920, paid: 0, outstanding: 6920, status: 'Refunded' },
  { bill: 'BILL-20260703112253-63', date: '03 Jul 2026', total: 6920, paid: 6920, outstanding: 0, status: 'Paid' },
  { bill: 'BILL-20260701151601-73', date: '01 Jul 2026', total: 1033, paid: 0, outstanding: 1033, status: 'Pending' },
]

// Each offer type — `balance` is what's remaining.
const memberships = [{ name: 'Membership Overall 03-07-2026', balance: 0, expiry: '03 Sep 2026', status: 'Active' }]
const packages = [
  { name: 'Hair Care Package (10 sittings)', balance: 4, unit: 'sittings left', expiry: '30 Dec 2026', status: 'Active' },
  { name: 'Facial Package (5 sittings)', balance: 0, unit: 'sittings left', expiry: '12 Aug 2026', status: 'Expired' },
]
const giftCards = [
  { name: 'Gift Card - ₹2000', balance: 1200, expiry: '31 Dec 2026', status: 'Active' },
  { name: 'Gift Card - ₹5000', balance: 0, expiry: '20 Jun 2026', status: 'Used' },
]
const wallet = { loyalty: 350, cashback: 150, advance: 500 }

const statusStyle = {
  Paid: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Refunded: 'bg-gray-100 text-gray-500',
  Active: 'bg-emerald-100 text-emerald-700',
  Expired: 'bg-rose-100 text-rose-600',
  Used: 'bg-gray-100 text-gray-500',
}

const Badge = ({ children }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[children] ?? 'bg-gray-100 text-gray-500'}`}>{children}</span>
)

const StatCard = ({ label, value, tint }) => (
  <div className={`rounded-xl border p-4 ${tint}`}>
    <div className="text-xs font-medium text-gray-500">{label}</div>
    <div className="mt-1 text-xl font-bold text-gray-800">{value}</div>
  </div>
)

function PlanTable({ title, rows, valueLabel, render }) {
  if (rows.length === 0) return null
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-gray-700">{title}</h4>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-4 py-2.5 font-medium">Plan</th>
              <th className="px-4 py-2.5 font-medium">{valueLabel}</th>
              <th className="px-4 py-2.5 font-medium">Expiry</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-2.5 font-medium text-indigo-600">{r.name}</td>
                <td className="px-4 py-2.5 text-gray-700">{render(r)}</td>
                <td className="px-4 py-2.5 text-gray-500">{r.expiry}</td>
                <td className="px-4 py-2.5"><Badge>{r.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ClientDetailsDrawer({ open, onClose, customer }) {
  const [tab, setTab] = useState('transactions')

  const tabs = [
    { key: 'transactions', label: 'Transactions', icon: IconHistory },
    { key: 'offers', label: 'Offers', icon: IconTag },
    { key: 'balances', label: 'Balances', icon: IconBilling },
  ]

  // Balances tab = only items with remaining balance.
  const memBal = memberships.filter((m) => m.balance > 0)
  const pkgBal = packages.filter((p) => p.balance > 0)
  const gcBal = giftCards.filter((g) => g.balance > 0)

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <div
        style={{ width: 'calc(100% - 16rem)' }}
        className={`fixed right-0 top-0 z-50 flex h-screen flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-3">
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <IconClose width={18} height={18} />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
            {customer?.name?.charAt(0) ?? 'C'}
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold text-gray-800">{customer?.name ?? 'Customer'}</div>
            <div className="text-xs text-gray-500">{customer?.gender ? `${customer.gender} · ` : ''}{customer?.phone}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200 px-4">
          {tabs.map((t) => {
            const Icon = t.icon
            const on = t.key === tab
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${on ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                <Icon width={15} height={15} /> {t.label}
              </button>
            )
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50/40 p-5">
          {tab === 'transactions' && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">#</th>
                    <th className="px-4 py-2.5 font-medium">Bill #</th>
                    <th className="px-4 py-2.5 font-medium">Date</th>
                    <th className="px-4 py-2.5 font-medium">Total</th>
                    <th className="px-4 py-2.5 font-medium">Paid</th>
                    <th className="px-4 py-2.5 font-medium">Outstanding</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={t.bill} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                      <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{t.bill}</td>
                      <td className="px-4 py-2.5 text-gray-500">{t.date}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{currency(t.total)}</td>
                      <td className="px-4 py-2.5 text-emerald-600">{currency(t.paid)}</td>
                      <td className="px-4 py-2.5">{t.outstanding > 0 ? <span className="text-rose-500">{currency(t.outstanding)}</span> : <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-2.5"><Badge>{t.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'offers' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatCard label="Loyalty Points" value={wallet.loyalty} tint="border-violet-100 bg-violet-50" />
                <StatCard label="Cashback" value={currency(wallet.cashback)} tint="border-emerald-100 bg-emerald-50" />
                <StatCard label="Advance Balance" value={currency(wallet.advance)} tint="border-sky-100 bg-sky-50" />
              </div>
              <PlanTable title="Memberships" rows={memberships} valueLabel="Balance (₹)" render={(r) => currency(r.balance)} />
              <PlanTable title="Packages" rows={packages} valueLabel="Remaining" render={(r) => `${r.balance} ${r.unit}`} />
              <PlanTable title="Gift Cards" rows={giftCards} valueLabel="Balance (₹)" render={(r) => currency(r.balance)} />
            </div>
          )}

          {tab === 'balances' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {wallet.loyalty > 0 && <StatCard label="Loyalty Points" value={wallet.loyalty} tint="border-violet-100 bg-violet-50" />}
                {wallet.cashback > 0 && <StatCard label="Cashback" value={currency(wallet.cashback)} tint="border-emerald-100 bg-emerald-50" />}
                {wallet.advance > 0 && <StatCard label="Advance Balance" value={currency(wallet.advance)} tint="border-sky-100 bg-sky-50" />}
              </div>
              <PlanTable title="Memberships" rows={memBal} valueLabel="Balance (₹)" render={(r) => currency(r.balance)} />
              <PlanTable title="Packages" rows={pkgBal} valueLabel="Remaining" render={(r) => `${r.balance} ${r.unit}`} />
              <PlanTable title="Gift Cards" rows={gcBal} valueLabel="Balance (₹)" render={(r) => currency(r.balance)} />
              {memBal.length === 0 && pkgBal.length === 0 && gcBal.length === 0 &&
                wallet.loyalty === 0 && wallet.cashback === 0 && wallet.advance === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-white py-10 text-center text-sm text-gray-400">
                    No remaining balances.
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

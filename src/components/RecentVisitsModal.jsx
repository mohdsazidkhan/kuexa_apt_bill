import { recentVisits, currency } from '../data/services'
import { IconClose, IconClock } from './Icons'

const statusStyle = {
  NoShow: 'text-rose-500',
  Completed: 'text-emerald-600',
  Cancelled: 'text-gray-400',
}

function VisitCard({ visit, index, total }) {
  const visitTotal = visit.items.reduce((s, i) => s + i.price, 0)
  return (
    <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 px-3 py-2.5">
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <div className="truncate text-sm">
          <span className="font-semibold text-gray-800">{visit.date}</span>{' '}
          <span className="text-gray-500">{visit.time}</span>
          <span className="text-gray-400"> · {visit.location}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-[11px] text-gray-400 sm:block">{index + 1} of {total}</span>
          <span className={`text-xs font-semibold ${statusStyle[visit.status] ?? 'text-gray-500'}`}>
            {visit.status}
          </span>
        </div>
      </div>

      {/* Service lines */}
      <div className="mt-1.5 space-y-0.5">
        {visit.items.map((it, i) => (
          <div key={i} className="flex items-center justify-between gap-2 text-[13px]">
            <span className="truncate">
              <span className="font-medium text-gray-700">{it.name}</span>
              <span className="text-gray-400"> · {it.stylist}</span>
            </span>
            <span className="shrink-0 font-medium text-indigo-600">{currency(it.price)}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between border-t border-indigo-100/70 pt-2">
        <span className="text-xs text-gray-500">
          Total: <span className="font-semibold text-gray-800">{currency(visitTotal)}</span>
        </span>
        <button className="rounded-md bg-[#4a7196] px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#3d6083]">
          Book Again
        </button>
      </div>
    </div>
  )
}

export default function RecentVisitsModal({ open, onClose }) {
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
          <IconClock width={18} height={18} className="text-indigo-600" />
          <h2 className="text-base font-semibold text-indigo-600">Recent Visits</h2>
          <span className="text-xs text-gray-400">Last 90 days · {recentVisits.length} visits</span>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 space-y-2.5 overflow-y-auto bg-gray-50/40 px-6 py-4">
          {recentVisits.map((v, i) => (
            <VisitCard key={v.id} visit={v} index={i} total={recentVisits.length} />
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-100 px-6 py-3">
          <button onClick={onClose} className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </>
  )
}

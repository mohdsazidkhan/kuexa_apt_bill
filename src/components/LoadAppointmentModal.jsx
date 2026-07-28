import { useState, useEffect } from 'react'
import { appointments } from '../data/appointments'
import { IconClose } from './Icons'

// Kanban column -> the status label / colour shown against an appointment.
const STATUS = {
  scheduled: { label: 'Scheduled', cls: 'bg-gray-100 text-gray-700' },
  checkedin: { label: 'Confirmed', cls: 'bg-teal-50 text-teal-600' },
  inprogress: { label: 'InProgress', cls: 'bg-sky-50 text-sky-600' },
  completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-600' },
  draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-500' },
  waiting: { label: 'Waiting', cls: 'bg-amber-50 text-amber-600' },
  rescheduled: { label: 'Rescheduled', cls: 'bg-fuchsia-50 text-fuchsia-600' },
  cancelled: { label: 'Cancelled', cls: 'bg-rose-50 text-rose-600' },
  noshow: { label: 'No Show', cls: 'bg-rose-50 text-rose-500' },
}
const statusOf = (a) => STATUS[a.column] || { label: a.column, cls: 'bg-gray-100 text-gray-600' }

export const IconCalendar = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
)

const IconSearch = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
)

export default function LoadAppointmentModal({ open, onClose, onLoad, initialQuery = '' }) {
  const [q, setQ] = useState(initialQuery)

  // Reset search to customer phone every time the modal opens
  useEffect(() => {
    if (open) setQ(initialQuery)
  }, [open, initialQuery])

  if (!open) return null

  const term = q.trim().toLowerCase()
  const EXCLUDED = ['cancelled', 'partialadvance', 'fulladvance']
  const list = appointments.filter((a) =>
    !EXCLUDED.includes(a.column) &&
    (!term || [a.id, a.customer, a.phone, statusOf(a).label].some((v) => (v || '').toLowerCase().includes(term)))
  )

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3.5">
          <IconCalendar className="text-indigo-600" />
          <h3 className="text-base font-semibold text-gray-800">Load from Appointment</h3>
          <button onClick={onClose} className="ml-auto rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <IconClose width={18} height={18} />
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by appointment no., customer name, phone, status..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-800 outline-none placeholder:text-gray-500 focus:border-indigo-400"
            />
          </div>
        </div>

        <div className="mt-2 flex-1 overflow-y-auto px-5 pb-4">
          {list.map((a) => {
            const st = statusOf(a)
            return (
              <div key={a.id} className="flex items-center gap-3 border-b border-gray-100 py-3 last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-semibold text-indigo-500">{a.id}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${st.cls}`}>{st.label}</span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                    <span>{a.date}</span>
                    {a.customer && a.customer !== 'Group' && (
                      <span>{a.customer}{a.phone ? ` · ${a.phone}` : ''}</span>
                    )}
                    <span>{a.services.length} service(s)</span>
                  </div>
                </div>
                <button
                  onClick={() => { onLoad?.(a); onClose?.() }}
                  className="shrink-0 rounded-lg bg-[#4a7196] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-[#3d6083]"
                >
                  Load
                </button>
              </div>
            )
          })}

          {list.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-400">No appointment matches “{q}”.</div>
          )}
        </div>
      </div>
    </div>
  )
}

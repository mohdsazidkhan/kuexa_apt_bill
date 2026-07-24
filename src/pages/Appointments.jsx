import { useEffect, useRef, useState } from 'react'
import NewAppointmentModal from '../components/NewAppointmentModal'
import GroupBookingModal from '../components/GroupBookingModal'
import KanbanBoard from '../components/KanbanBoard'
import TopBar from '../components/TopBar'
import { appointments } from '../data/appointments'
import { currency } from '../data/services'
import { IconPlus, IconCalendar, IconUsers, IconGrid, IconMenu, IconClock, IconRefresh, IconArrowUp, IconArrowDown } from '../components/Icons'

// ---- Top stat chips ----
const statChips = [
  { label: "Today's", value: 17, color: 'text-indigo-600 border-indigo-200' },
  { label: 'Scheduled', value: 119, color: 'text-sky-600 border-sky-200' },
  { label: 'In Progress', value: 10, color: 'text-amber-600 border-amber-200' },
  { label: 'Completed', value: 15, color: 'text-emerald-600 border-emerald-200' },
]

// ---- View tabs ----
const views = [
  { key: 'kanban', label: 'Kanban', icon: IconGrid },
  { key: 'list', label: 'List', icon: IconMenu },
  { key: 'scheduler', label: 'Scheduler', icon: IconCalendar },
  { key: 'stylist', label: 'Stylist', icon: IconUsers },
  { key: 'month', label: 'Month', icon: IconCalendar },
  { key: 'day', label: 'Day Calendar', icon: IconClock },
]

const dateFilters = [
  { label: 'Today', value: 17 },
  { label: 'This Week', value: 43 },
  { label: 'All Dates', value: 452 },
]
const statusFilters = [
  { label: 'All Status', value: 17 },
  { label: 'Scheduled', value: 3 },
  { label: 'Confirmed', value: 6 },
  { label: 'In Progress', value: 2 },
  { label: 'Completed', value: 2 },
  { label: 'No Show', value: 1 },
  { label: 'Cancelled', value: 0 },
]

const listStatusStyle = {
  Scheduled: 'bg-indigo-100 text-indigo-700',
  'Checked-In': 'bg-sky-100 text-sky-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Completed: 'bg-emerald-100 text-emerald-700',
}
const colToStatus = { scheduled: 'Scheduled', checkedin: 'Checked-In', inprogress: 'In Progress', completed: 'Completed' }

export default function Appointments() {
  const [open, setOpen] = useState(false)
  const [groupOpen, setGroupOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [view, setView] = useState('kanban')
  const [dateFilter, setDateFilter] = useState('Today')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const topRef = useRef(null)
  const bottomRef = useRef(null)

  const scrollToTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const handleBooked = (bookingSource) => {
    setOpen(false)
    setToast(`Appointment booked successfully (${bookingSource})`)
  }

  return (
    <div className="-mx-6 -my-8 flex h-screen flex-col overflow-hidden bg-gray-50">
      {/* Success toast */}
      {toast && (
        <div className="fixed right-6 top-6 z-[70] flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">✓</span>
          {toast}
        </div>
      )}

      {/* Top navbar */}
      <TopBar title="Appointments" />

      {/* Fixed top section — header, tabs, filters */}
      <div className="shrink-0 px-4 pt-2">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold text-gray-800">Appointments</h1>
          <div className="flex flex-wrap items-center gap-1.5">
            {statChips.map((s) => (
              <span key={s.label} className={`flex items-center gap-1 rounded-full border bg-white px-2 py-0.5 text-xs font-medium ${s.color}`}>
                <span className="font-bold">{s.value}</span> {s.label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50"><IconRefresh width={16} height={16} /></button>
          <button
            onClick={() => setGroupOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#3b5c7e] px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-[#32506e]"
          >
            <IconPlus width={14} height={14} /> New Appointment
          </button>
        </div>
      </div>

      {/* View tabs */}
      <div className="mt-1 flex flex-wrap items-center gap-1 border-b border-gray-200">
        {views.map((v) => {
          const Icon = v.icon
          const on = v.key === view
          return (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-2.5 py-2 text-xs font-medium transition-colors ${
                on ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon width={14} height={14} /> {v.label}
            </button>
          )
        })}
      </div>

      {/* Filter row */}
      <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-xl border border-gray-100 bg-white p-2">
        {dateFilters.map((f) => (
          <Chip key={f.label} active={dateFilter === f.label} onClick={() => setDateFilter(f.label)} label={f.label} value={f.value} />
        ))}
        <span className="mx-0.5 h-4 w-px bg-gray-200" />
        {statusFilters.map((f) => (
          <Chip key={f.label} active={statusFilter === f.label} onClick={() => setStatusFilter(f.label)} label={f.label} value={f.value} />
        ))}
        <select className="ml-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500 outline-none">
          <option>All stylists</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">{appointments.length} shown</span>
          <div className="flex items-center gap-1">
            <button
              onClick={scrollToTop}
              title="Scroll to top"
              className="rounded-md border border-gray-200 bg-white p-1 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <IconArrowUp width={14} height={14} />
            </button>
            <button
              onClick={scrollToBottom}
              title="Scroll to bottom"
              className="rounded-md border border-gray-200 bg-white p-1 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <IconArrowDown width={14} height={14} />
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Scrollable cards/board section */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-1">
      <div ref={topRef} />
      {/* Body */}
      <div className="mt-1">
        {view === 'kanban' && <KanbanBoard appointments={appointments} />}
        {view !== 'kanban' && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-center">
            <span className="text-lg font-semibold text-gray-700">{views.find((v) => v.key === view)?.label} view</span>
            <span className="mt-1 text-sm text-gray-400">Coming soon — Kanban fully built.</span>
          </div>
        )}
      </div>
      <div ref={bottomRef} />
      </div>

      <NewAppointmentModal open={open} onClose={() => setOpen(false)} onBooked={handleBooked} />
      <GroupBookingModal
        open={groupOpen}
        onClose={() => setGroupOpen(false)}
        onBooked={(n) => { setGroupOpen(false); setToast(`Group appointment booked for ${n} guest${n > 1 ? 's' : ''}`) }}
      />
    </div>
  )
}

function Chip({ active, onClick, label, value }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
      <span className={`rounded px-1 text-[11px] font-semibold ${active ? 'bg-white/20' : 'bg-white text-gray-500'}`}>{value}</span>
    </button>
  )
}


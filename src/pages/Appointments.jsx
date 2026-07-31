import { useEffect, useMemo, useState } from 'react'
// import NewAppointmentModal from '../components/NewAppointmentModal'
import GroupBookingModal from '../components/GroupBookingModal'
import KanbanBoard from '../components/KanbanBoard'
import TopBar from '../components/TopBar'
import { appointments, undoAppointmentStage, kanbanColumns, DAY_TODAY, DAY_NEXT } from '../data/appointments'
import { currency } from '../data/services'
import { IconPlus, IconCalendar, IconUsers, IconGrid, IconMenu, IconClock, IconRefresh, IconSearch, IconClose } from '../components/Icons'

// All the chip counters read off the real data, so they can't drift from the board —
// including after a card is moved back a stage, which is why they're counted on every
// render rather than once at import.
const inColumn = (key) => appointments.filter((a) => a.column === key).length
const onDate = (d) => appointments.filter((a) => a.date === d).length

// ---- Top stat chips ----
const buildStatChips = () => [
  { label: "Today's", value: onDate(DAY_TODAY), color: 'text-indigo-600 border-indigo-200' },
  { label: 'Scheduled', value: inColumn('scheduled'), color: 'text-sky-600 border-sky-200' },
  { label: 'In Progress', value: inColumn('inprogress'), color: 'text-amber-600 border-amber-200' },
  { label: 'Completed', value: inColumn('completed'), color: 'text-emerald-600 border-emerald-200' },
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

const buildDateFilters = () => [
  { label: 'Today', value: onDate(DAY_TODAY) },
  { label: 'This Week', value: onDate(DAY_TODAY) + onDate(DAY_NEXT) },
  { label: 'All Dates', value: appointments.length },
]
const buildStatusFilters = () => [
  { label: 'All Status', value: appointments.length },
  { label: 'Scheduled', value: inColumn('scheduled') },
  { label: 'Confirmed', value: inColumn('checkedin') },
  { label: 'In Progress', value: inColumn('inprogress') },
  { label: 'Completed', value: inColumn('completed') },
  { label: 'No Show', value: inColumn('noshow') },
  { label: 'Cancelled', value: inColumn('cancelled') },
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
  const [search, setSearch] = useState('')
  // Bumped whenever a card is moved between columns, so everything counted off the
  // shared appointment list is recomputed.
  const [revision, setRevision] = useState(0)

  // Search across appointment no., client (including a group's guests), phone,
  // services and any retail sold on the appointment.
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return [...appointments]
    const hit = (v) => String(v ?? '').toLowerCase().includes(q)
    return appointments.filter((a) =>
      hit(a.id) || hit(a.customer) || hit(a.phone) ||
      a.guests?.some((g) => hit(g.name) || hit(g.phone)) ||
      a.services.some((s) => hit(s.name)) ||
      a.products?.some((p) => hit(p.name)) ||
      a.offers?.some((o) => hit(o.name))
    )
  }, [search, revision])

  const statChips = useMemo(buildStatChips, [revision])
  const dateFilters = useMemo(buildDateFilters, [revision])
  const statusFilters = useMemo(buildStatusFilters, [revision])

  // "Undo" on a card walks it back one stage — Completed → In Progress →
  // Checked-In → Scheduled — and says where it landed.
  const undoStage = (appt) => {
    const prev = undoAppointmentStage(appt)
    if (!prev) return
    setRevision((r) => r + 1)
    const title = kanbanColumns.find((c) => c.key === prev)?.title ?? prev
    setToast(`${appt.customer} moved back to ${title}`)
  }
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

      {/* Fixed top section — header (title · view tabs · actions), filters */}
      <div className="shrink-0 px-4 pt-2">
        {/* Header — the view tabs sit centred between the title and the actions */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-1">
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

          <div className="flex flex-1 flex-wrap items-center justify-center gap-1">
            {views.map((v) => {
              const Icon = v.icon
              const on = v.key === view
              return (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={`-mb-1 flex items-center gap-1.5 border-b-2 px-2.5 py-2 text-xs font-medium transition-colors ${on ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                >
                  <Icon width={14} height={14} /> {v.label}
                </button>
              )
            })}
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

        {/* Filter row — chips take the space they need and wrap among themselves;
            the search box stays on the row, pinned to the right. */}
        <div className="mt-1 flex items-center gap-1.5 rounded-xl border border-gray-100 bg-white p-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {dateFilters.map((f) => (
              <Chip key={f.label} active={dateFilter === f.label} onClick={() => setDateFilter(f.label)} label={f.label} value={f.value} />
            ))}
            <span className="mx-0.5 h-4 w-px bg-gray-600" />
            {statusFilters.map((f) => (
              <Chip key={f.label} active={statusFilter === f.label} onClick={() => setStatusFilter(f.label)} label={f.label} value={f.value} />
            ))}
            <select className="ml-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500 outline-none">
              <option>All stylists</option>
            </select>
          </div>

          <div className="relative w-56 shrink-0">
            <IconSearch width={13} height={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Appt no, client, phone, service..."
              title="Search by appointment no., client, phone, service or product"
              className="w-full rounded-lg border border-gray-200 bg-white py-1 pl-7 pr-7 text-xs text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                title="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-rose-500"
              >
                <IconClose width={12} height={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Board section — no page scroll of its own; each Kanban column scrolls instead */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 pt-1">
        {/* Body */}
        <div className="mt-1 min-h-0 flex-1">
          {view === 'kanban' && <KanbanBoard appointments={visible} onUndo={undoStage} />}
          {view !== 'kanban' && (
            <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-center">
              <span className="text-lg font-semibold text-gray-700">{views.find((v) => v.key === view)?.label} view</span>
              <span className="mt-1 text-sm text-gray-400">Coming soon — Kanban fully built.</span>
            </div>
          )}
        </div>
      </div>

      {/* <NewAppointmentModal open={open} onClose={() => setOpen(false)} onBooked={handleBooked} /> */}
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
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
    >
      {label}
      <span className={`rounded px-1 text-[11px] font-semibold ${active ? 'bg-white/20' : 'bg-white text-gray-500'}`}>{value}</span>
    </button>
  )
}


import { kanbanColumns, accentClasses, serviceStatuses } from '../data/appointments'
import { currency } from '../data/services'
import { IconClock, IconUsers, IconCalendar, IconBilling } from './Icons'

// Columns whose cards should NOT show the Bill button.
const NO_BILL_COLUMNS = ['CANCELLED', 'NO SHOW', 'FULL ADVANCE']

// Category subtitle colour just for a bit of life.
const catColor = 'text-indigo-500'

function ActionBtn({ children, variant = 'ghost', className = '' }) {
  const styles = {
    primary: 'bg-[#4a7196] text-white hover:bg-[#3d6083]',
    ghost: 'border border-gray-200 text-gray-600 hover:bg-gray-50',
    danger: 'border border-rose-200 text-rose-600 hover:bg-rose-50',
  }
  return (
    <button className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${styles[variant]} ${className}`}>
      {children}
    </button>
  )
}

function Card({ appt, showBill = true }) {
  const total = appt.services.reduce((s, x) => s + x.price, 0)

  return (
    <div className="rounded-xl border border-gray-300 bg-white p-3 shadow">
      {/* Top: id + time */}
      <div className="flex items-start justify-between gap-2">
        <span className="truncate text-[11px] font-medium text-gray-400">{appt.id}</span>
        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-gray-700">
          <IconClock width={13} height={13} /> {appt.time}
        </span>
      </div>

      {/* Badges + High (same row) */}
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
        <span className="flex items-center gap-1 text-gray-500">
          <IconUsers width={12} height={12} /> {appt.source}
        </span>
        <span className={`rounded px-1.5 py-0.5 font-medium ${appt.billed ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
          {appt.billed ? 'Billed' : 'Not Billed'}
        </span>
        {appt.priority === 'High' && (
          <span className="flex items-center gap-1 rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> High
          </span>
        )}
      </div>

      {/* Customer · phone · date (same row) */}
      <div className="mt-1.5 flex flex-wrap justify-between items-center gap-x-2 gap-y-0.5">
        {appt.group ? (
          <span className="flex items-center gap-1 text-sm font-semibold text-fuchsia-600">
            <IconUsers width={14} height={14} /> Group · {appt.clients} clients
          </span>
        ) : (
          <span title={appt.customer} className="text-sm font-semibold text-gray-800">
            {appt.customer?.length > 15 ? appt.customer.slice(0, 15) + '...' : appt.customer}
          </span>
        )}
        {appt.phone && <span className="text-xs text-gray-500">{appt.phone}</span>}
        <span className="text-xs text-gray-400">· {appt.date}</span>
      </div>

      {/* Services */}
      <div className="mt-2 space-y-2 border-t border-gray-200 pt-2">
        {appt.services.map((sv, i) => (
          <div key={i} className="border-b border-gray-200 pb-2">
            {/* category · name .... price (same row) */}
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5">
                <span title={sv.name} className="truncate text-sm font-semibold text-gray-800">
                  {sv.name}
                </span>
                <span className={`shrink-0 text-[11px] ${catColor}`}>· {sv.duration}m</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-indigo-600">{currency(sv.price)}</span>
            </div>
            {/* stylist · date · time · duration (same row) */}
            <div className="mt-0.5 flex flex-wrap justify-between gap-x-2 text-xs text-gray-400">
              {sv.stylist && (
                <span className="flex items-center gap-1"><IconUsers width={11} height={11} /> {sv.stylist}</span>
              )}
              <span className="flex items-center gap-1"><IconCalendar width={11} height={11} /> {sv.date}</span>
              <span>{sv.time}</span>
            </div>
            {/* status dropdown · Not Billed · Total (same row) */}
            <div className="mt-1 flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <select defaultValue={sv.status} className="w-full appearance-none rounded-md border border-gray-200 bg-white py-1 pl-2 pr-6 text-xs text-gray-700 outline-none focus:border-indigo-400">
                  {serviceStatuses.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <span className="shrink-0 text-xs text-gray-400">Not Billed</span>
              {i === appt.services.length - 1 && (
                <span className="shrink-0 text-sm font-semibold text-gray-700">Total: {currency(total)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-2 space-y-2">
        {appt.column === 'scheduled' && (
          <ActionBtn variant="primary" className="w-full">✓ Confirm</ActionBtn>
        )}
        {appt.column === 'checkedin' && (
          <div className="grid grid-cols-2 gap-2">
            <ActionBtn variant="primary">▶ Start</ActionBtn>
            <ActionBtn variant="primary">✓ Complete</ActionBtn>
          </div>
        )}
        {(appt.column === 'inprogress' || appt.column === 'completed') && (
          <ActionBtn variant="primary" className="w-full">✓ Complete</ActionBtn>
        )}

        {showBill && (
          <ActionBtn variant="primary" className="flex w-full items-center justify-center gap-1.5">
            <IconBilling width={15} height={15} /> Bill Now
          </ActionBtn>
        )}

        <div className="flex items-center gap-2">
          <ActionBtn className="!px-2">✎</ActionBtn>
          {appt.column === 'scheduled' || appt.column === 'checkedin' ? (
            <>
              <ActionBtn variant="danger" className="flex-1">Cancel</ActionBtn>
              <ActionBtn variant="danger" className="flex-1">No Show</ActionBtn>
            </>
          ) : (
            <ActionBtn variant="danger" className="flex-1">No Show</ActionBtn>
          )}
        </div>
      </div>
    </div>
  )
}

export default function KanbanBoard({ appointments }) {
  return (
    <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 lg:grid-cols-4">
      {kanbanColumns.map((col) => {
        const items = appointments.filter((a) => a.column === col.key)
        const a = accentClasses[col.accent]
        return (
          <div key={col.key} className="flex flex-col">
            <div className={`flex items-center justify-between rounded-t-xl border-t-[3px] p-2 ${a.head}`}>
              <span className="text-sm font-bold tracking-wide">{col.title}</span>
              <span className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold text-white ${a.badge}`}>
                {items.length}
              </span>
            </div>
            <div className={`flex-1 space-y-2.5 rounded-b-xl border-x border-b p-2.5 ${a.body} min-w-280px max-w-320px`}>
              {items.map((appt) => <Card key={appt.id} appt={appt} showBill={!NO_BILL_COLUMNS.includes(col.title)} />)}
              {items.length === 0 && (
                <div className="py-8 text-center text-xs text-gray-400">No appointments</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

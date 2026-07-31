import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { kanbanColumns, accentClasses, serviceStatuses, completeAppointmentServices } from '../data/appointments'
import { currency } from '../data/services'
import { IconClock, IconUsers, IconCalendar, IconBilling, IconArrowUp, IconArrowDown, IconChevron, IconExternal } from './Icons'

// Columns whose cards should NOT show the Bill button — either nothing is left to
// bill, or (DRAFT) the appointment isn't confirmed yet. PARTIAL PAID keeps it,
// since the balance is still to collect.
const NO_BILL_COLUMNS = ['DRAFT', 'RESCHEDULED', 'CANCELLED', 'NO SHOW', 'FULLY PAID', 'REFUNDED']

// Columns whose cards are done and shouldn't offer an edit at all.
const NO_EDIT_COLUMNS = ['completed', 'rescheduled', 'partialadvance', 'fulladvance', 'partialpaid', 'paid', 'refunded', 'cancelled', 'noshow']

// Columns holding money that can be handed back — an advance, or a settled bill.
const REFUND_COLUMNS = ['partialadvance', 'fulladvance', 'paid', 'partialpaid']

// Payment state shown on a card. Part-paid and advance columns say so outright;
// everywhere else it's the plain Paid / Unpaid of the bill.
const PAY_STATE_BY_COLUMN = {
  partialadvance: { label: 'Partial Advance', chip: 'bg-amber-100 text-amber-700', text: 'font-semibold text-amber-600' },
  fulladvance: { label: 'Full Advance', chip: 'bg-emerald-100 text-emerald-700', text: 'font-semibold text-emerald-600' },
  partialpaid: { label: 'Partial-Paid', chip: 'bg-cyan-100 text-cyan-700', text: 'font-semibold text-cyan-700' },
  paid: { label: 'Fully Paid', chip: 'bg-teal-100 text-teal-700', text: 'font-semibold text-teal-700' },
  refunded: { label: 'Refunded', chip: 'bg-pink-100 text-pink-700', text: 'font-semibold text-pink-700' },
}
const payState = (appt) =>
  // A part-paid DANGEROUS card reads the same as the PARTIAL PAID column.
  (PART_PAID_ISSUES.includes(appt.issue) ? PAY_STATE_BY_COLUMN.partialpaid : null)
  ?? PAY_STATE_BY_COLUMN[appt.column] ?? (appt.billed
    ? { label: 'Paid', chip: 'bg-emerald-50 text-emerald-600', text: 'font-semibold text-emerald-600' }
    : { label: 'Unpaid', chip: 'bg-gray-100 text-gray-500', text: 'text-gray-400' })

// Columns where the appointment can still be marked complete.
const COMPLETE_COLUMNS = ['scheduled', 'checkedin', 'inprogress']

// Columns where the appointment can still be called off.
const CANCEL_COLUMNS = ['scheduled', 'checkedin', 'draft', 'waiting', 'partialadvance', 'fulladvance']

// Dead-end columns whose only way forward is booking the appointment again.
const REBOOK_COLUMNS = ['cancelled', 'noshow']

// What's actually wrong with a DANGEROUS card, and the fix it needs.
const ISSUE_TEXT = {
  'paid-not-completed': 'Payment taken, but the services are still In Progress',
  'done-not-paid': 'Services completed, but no payment has been taken',
  'scheduled-paid': 'Payment taken in full, but the services are still Scheduled',
  'scheduled-partpaid': 'Part payment taken, but the services are still Scheduled',
  'checkedin-paid': 'Payment taken in full, but the client is only Checked-In',
  'checkedin-partpaid': 'Part payment taken, but the client is only Checked-In',
}

// DANGEROUS cards where money changed hands before the work — part of it on a
// -partpaid issue, so those still have a balance to collect.
const PART_PAID_ISSUES = ['scheduled-partpaid', 'checkedin-partpaid']
// …and the ones still sitting at SCHEDULED, which can be checked in.
const SCHEDULED_ISSUES = ['scheduled-paid', 'scheduled-partpaid']

// Columns that are closed out one way or another — the service status is fixed.
// COMPLETED is the exception: it only locks once the bill has been paid.
const LOCKED_STATUS_COLUMNS = ['paid', 'partialpaid', 'refunded', 'cancelled', 'noshow']

// Horizontal board paging: four columns per arrow click, gap-4 between them.
const COLS_PER_PAGE = 4
const COL_GAP = 16

// "4:52 PM" -> minutes since midnight (for time sorting).
const parseTime = (t) => {
  const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(t || '')
  if (!m) return 0
  let h = Number(m[1]) % 12
  if (/PM/i.test(m[3])) h += 12
  return h * 60 + Number(m[2])
}

// Category subtitle colour just for a bit of life.
const catColor = 'text-indigo-500'

function ActionBtn({ children, variant = 'ghost', className = '', onClick, disabled = false, title }) {
  const styles = {
    primary: 'bg-[#4a7196] text-white hover:bg-[#3d6083]',
    ghost: 'border border-gray-200 text-gray-600 hover:bg-gray-50',
    danger: 'border border-rose-200 text-rose-600 hover:bg-rose-50',
    // reference action — points back at history rather than doing something
    linked: 'border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-lg px-2 py-2 text-xs font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// Circular pager sitting over the left / right edge of the board. Solid and
// pulsing while there is more board to reach, so it reads as "keep going".
function ScrollArrow({ side, onClick, disabled }) {
  const left = side === 'left'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={left ? 'Previous columns' : 'Next columns'}
      className={`absolute top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#2c4c6b] text-white shadow-lg ring-2 ring-white transition hover:bg-[#1e3a56] disabled:pointer-events-none disabled:opacity-0 ${
        disabled ? '' : 'animate-pulse'
      } ${left ? '-left-3' : '-right-3'}`}
    >
      <IconChevron width={18} height={18} strokeWidth={2.5} className={left ? 'rotate-90' : '-rotate-90'} />
    </button>
  )
}

function Card({ appt, showBill = true, onBill, onRefund, onReceive, onOpenLinked, cardRef, flash }) {
  const total = appt.services.reduce((s, x) => s + x.price, 0)
  // A finished appointment can't be edited at all; a billed one can't be billed again.
  const showEdit = !NO_EDIT_COLUMNS.includes(appt.column)
  const canBill = showBill && !appt.billed
  const canCancel = CANCEL_COLUMNS.includes(appt.column)
  const canRefund = REFUND_COLUMNS.includes(appt.column) && appt.paidAmount > 0
  // A paid-but-unfinished card needs completing; an unpaid-but-finished one needs billing.
  const canComplete = COMPLETE_COLUMNS.includes(appt.column) || (!!appt.issue && appt.issue !== 'done-not-paid')
  // Still only booked in — paid or not, the client has yet to be checked in.
  const canCheckIn = appt.column === 'scheduled' || SCHEDULED_ISSUES.includes(appt.issue)
  const isPartPaid = appt.column === 'partialpaid' || PART_PAID_ISSUES.includes(appt.issue)
  const pay = payState(appt)
  // A completed but still-unpaid appointment keeps an editable status.
  const statusLocked =
    LOCKED_STATUS_COLUMNS.includes(appt.column) || (appt.column === 'completed' && appt.billed)

  return (
    <div
      ref={cardRef}
      className={`rounded-xl border bg-white p-3 shadow transition-shadow ${
        flash ? 'border-indigo-500 ring-2 ring-indigo-400' : 'border-gray-300'
      }`}
    >
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
        <span className={`rounded px-1.5 py-0.5 font-medium ${pay.chip}`}>{pay.label}</span>
        {/* receipt / refund note / bill this card's money sits against */}
        {appt.docRef && (
          <button
            title={`Open ${appt.docRef}`}
            className="flex items-center gap-1 font-semibold text-indigo-600 hover:underline"
          >
            {appt.docRef} <IconExternal width={11} height={11} />
          </button>
        )}
        {appt.priority === 'High' && (
          <span className="flex items-center gap-1 rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> High
          </span>
        )}
      </div>

      {/* What's out of step on a DANGEROUS card */}
      {appt.issue && (
        <div className="mt-1.5 rounded-md border border-red-300 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700">
          ⚠ {ISSUE_TEXT[appt.issue]}
        </div>
      )}

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

      {/* Group booking: who is on it */}
      {appt.group && appt.guests?.length > 0 && (
        <div className="mt-1 space-y-0.5">
          {appt.guests.map((g) => (
            <div key={g.name} className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm font-semibold text-gray-800">{g.name}</span>
              {g.phone && <span className="text-xs text-gray-500">{g.phone}</span>}
            </div>
          ))}
        </div>
      )}

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
                <span className={`shrink-0 text-xs font-bold ${catColor}`}>· {sv.duration}m</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-indigo-600">{currency(sv.price)}</span>
            </div>
            {/* stylist · date · time · duration (same row) */}
            <div className="mt-0.5 flex flex-wrap justify-between gap-x-2 text-xs text-gray-400">
              {/* on a group booking, whose service this is */}
              {sv.client && (
                <span className="flex items-center gap-1 font-semibold text-fuchsia-600">
                  <IconUsers width={11} height={11} /> {sv.client}
                </span>
              )}
              {sv.stylist && (
                <span className="flex items-center gap-1"><IconUsers width={11} height={11} /> {sv.stylist}</span>
              )}
              <span className="flex items-center gap-1"><IconCalendar width={11} height={11} /> {sv.date}</span>
              <span>{sv.time}</span>
            </div>
            {/* status dropdown · billed state · Total (same row) */}
            <div className="mt-1 flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <select
                  defaultValue={sv.status}
                  disabled={statusLocked}
                  title={statusLocked ? 'Settled — the service status can no longer be changed' : undefined}
                  className={`w-full appearance-none rounded-md border py-1 pl-2 pr-6 text-xs outline-none focus:border-indigo-400 ${
                    statusLocked
                      ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  {serviceStatuses.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              {/* a service inherits the appointment's payment state */}
              <span className={`shrink-0 text-xs ${pay.text}`}>{pay.label}</span>
              {i === appt.services.length - 1 && (
                <span className="shrink-0 text-sm font-semibold text-gray-700">Total: {currency(total)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-2 space-y-2">
        {/* While the card is still only scheduled the two share a row; elsewhere
            Complete Appt. stands alone. */}
        {canComplete && (
          <div className={canCheckIn ? 'grid grid-cols-2 gap-2' : ''}>
            {canCheckIn && (
              <ActionBtn variant="primary" className="w-full">✓ Check In</ActionBtn>
            )}
            <ActionBtn variant="primary" className="w-full">✓ Complete Appt.</ActionBtn>
          </div>
        )}

        {/* A draft goes one of two ways: onto the schedule, or into the waiting list. */}
        {appt.column === 'draft' && (
          <div className="grid grid-cols-2 gap-2">
            <ActionBtn variant="primary" className="flex w-full items-center justify-center gap-1.5">
              <IconCalendar width={12} height={12} /> Schedule
            </ActionBtn>
            <ActionBtn variant="primary" className="flex w-full items-center justify-center gap-1.5">
              <IconClock width={12} height={12} /> Waiting
            </ActionBtn>
          </div>
        )}

        {/* A cancelled or no-show card is done with — the only way forward is
            booking it again. */}
        {REBOOK_COLUMNS.includes(appt.column) && (
          <ActionBtn variant="primary" className="flex w-full items-center justify-center gap-1.5">
            <IconCalendar width={13} height={13} /> Re-Book Appt.
          </ActionBtn>
        )}

        {/* A rescheduled card is re-booked rather than edited or billed. Same
            "linked" styling as Old Appointment — the two are a matched pair. */}
        {appt.column === 'rescheduled' && (
          <ActionBtn
            variant="linked"
            className="flex w-full items-center justify-center gap-1.5"
            onClick={appt.newApptId ? () => onOpenLinked?.(appt.newApptId) : undefined}
            title={appt.newApptId ? `Go to ${appt.newApptId}` : 'Book a replacement appointment'}
          >
            New Appointment <IconExternal width={13} height={13} />
          </ActionBtn>
        )}

        {/* Edit · Bill Now · Cancel share a row. A completed appointment isn't
            editable and a billed one has nothing left to bill, so this row can
            end up empty — in which case it's skipped entirely. */}
        {(showEdit || canBill || canRefund || canCancel) && (
          <div className="flex items-center gap-2">
            {showEdit && (
              <ActionBtn
                className="px-2"
                disabled={appt.billed}
                title={appt.billed ? 'Already billed — this appointment can no longer be edited' : 'Edit appointment'}
              >
                ✎
              </ActionBtn>
            )}
            {/* A part-paid bill already exists — what's left is collecting the balance. */}
            {canBill && (
              <ActionBtn
                onClick={() => (isPartPaid ? onReceive?.(appt) : onBill?.(appt))}
                variant="primary"
                className="flex flex-1 items-center justify-center gap-1.5"
              >
                <IconBilling width={14} height={14} />
                {isPartPaid ? 'Receive Pending Amount' : 'Bill Now'}
              </ActionBtn>
            )}
            {canRefund && (
              <ActionBtn
                onClick={() => onRefund?.(appt)}
                variant="danger"
                className="flex-1"
                title={`Refund ${currency(appt.paidAmount)}`}
              >
                Refund
              </ActionBtn>
            )}
            {canCancel && (
              <ActionBtn variant="danger" className="flex-1">Cancel</ActionBtn>
            )}
          </div>
        )}

        {/* Jump to the appointment this one replaced — a reference back rather than
            an action, so it sits last and carries its own colour. */}
        {appt.oldApptId && (
          <ActionBtn
            variant="linked"
            className="flex w-full items-center justify-center gap-1.5"
            onClick={() => onOpenLinked?.(appt.oldApptId)}
            title={`Go to ${appt.oldApptId}`}
          >
            <IconExternal width={13} height={13} /> Old Appointment
          </ActionBtn>
        )}
      </div>
    </div>
  )
}

export default function KanbanBoard({ appointments }) {
  // Per-column time sort direction: undefined = unsorted, 'asc' | 'desc'.
  const [sortDir, setSortDir] = useState({})
  const [confirmAppt, setConfirmAppt] = useState(null) // "Bill Now" confirmation
  const navigate = useNavigate()
  const cycleSort = (key) =>
    setSortDir((s) => ({ ...s, [key]: s[key] === 'asc' ? 'desc' : 'asc' }))

  // The board is one horizontal strip; the arrows page it four columns at a time.
  const strip = useRef(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const syncEdges = () => {
    const el = strip.current
    if (!el) return
    setAtStart(el.scrollLeft <= 1)
    setAtEnd(Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth - 1)
  }

  useEffect(() => {
    const el = strip.current
    if (!el) return
    syncEdges()
    el.addEventListener('scroll', syncEdges, { passive: true })
    window.addEventListener('resize', syncEdges)
    return () => {
      el.removeEventListener('scroll', syncEdges)
      window.removeEventListener('resize', syncEdges)
    }
  }, [])

  // Clicking a linked appointment brings that card into view — across columns and
  // down the column it lives in — and rings it briefly so it's easy to spot.
  const cardNodes = useRef({})
  const [flashId, setFlashId] = useState(null)
  const openLinked = (id) => {
    const node = cardNodes.current[id]
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    setFlashId(id)
    setTimeout(() => setFlashId((cur) => (cur === id ? null : cur)), 2500)
  }

  // Each column body scrolls on its own; these step it exactly one card at a time,
  // measured from the cards themselves since their heights differ.
  const bodies = useRef({})
  const stepCard = (key, dir) => {
    const el = bodies.current[key]
    if (!el) return
    const pad = parseFloat(getComputedStyle(el).paddingTop) || 0
    const boxTop = el.getBoundingClientRect().top
    const tops = Array.from(el.children).map(
      (c) => c.getBoundingClientRect().top - boxTop + el.scrollTop - pad
    )
    const cur = el.scrollTop
    const target = dir > 0
      ? tops.find((t) => t > cur + 1)
      : [...tops].reverse().find((t) => t < cur - 1)
    el.scrollTo({ top: Math.max(0, target ?? (dir > 0 ? el.scrollHeight : 0)), behavior: 'smooth' })
  }

  // Step from the real column width so it stays right at any viewport size.
  const page = (dir) => {
    const el = strip.current
    if (!el) return
    const col = el.firstElementChild
    const step = col ? (col.getBoundingClientRect().width + COL_GAP) * COLS_PER_PAGE : el.clientWidth
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  // Yes -> bill it now; No -> take an advance against it on the Payments screen instead.
  const generateBill = () => {
    completeAppointmentServices(confirmAppt)
    navigate('/billing', { state: { billAppointment: confirmAppt } })
    setConfirmAppt(null)
  }
  const takeAdvance = () => {
    navigate('/payments', { state: { advanceForAppointment: confirmAppt.id } })
    setConfirmAppt(null)
  }

  // Refund hands the advance back on the Payments screen; Receive collects the
  // outstanding balance there instead.
  const refundAppt = (appt) =>
    navigate('/payments', { state: { refundForAppointment: appt.id } })
  const receivePending = (appt) =>
    navigate('/payments', { state: { pendingForAppointment: appt.id } })

  return (
    <>
    {confirmAppt && (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="px-6 py-6 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#eef3f8] text-[#2c4c6b]">
              <IconBilling width={22} height={22} />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              Are you sure want to generate Bill of appointment :
            </p>
            <p className="mt-1 break-all text-sm font-bold text-indigo-600">{confirmAppt.id}</p>
            {/* nothing to promise when every service is already Completed */}
            {confirmAppt.services.some((s) => s.status !== 'Completed') && (
              <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                On Yes, all {confirmAppt.services.length} service
                {confirmAppt.services.length === 1 ? '' : 's'} of this appointment will be marked Completed.
              </p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              No takes you to Payments to collect an advance against it instead.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 border-t border-gray-100 px-6 py-4">
            {/* Cancel just backs out — unlike No, it doesn't go anywhere. */}
            <button
              onClick={() => setConfirmAppt(null)}
              className="w-full rounded-full border border-gray-300 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={takeAdvance}
              className="w-full rounded-full bg-gray-100 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              No
            </button>
            <button
              onClick={generateBill}
              className="w-full rounded-full bg-[#2c4c6b] py-2 text-sm font-semibold text-white hover:bg-[#1e3a56]"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    )}
    <div className="relative h-full">
      {/* page left / right — 4 columns per click */}
      <ScrollArrow side="left" onClick={() => page(-1)} disabled={atStart} />
      <ScrollArrow side="right" onClick={() => page(1)} disabled={atEnd} />

      <div
        ref={strip}
        style={{ '--scroll-thumb': '#4f46e5' }}
        className="thin-scroll flex h-full gap-4 overflow-x-auto py-2"
      >
      {kanbanColumns.map((col) => {
        const dir = sortDir[col.key]
        let items = appointments.filter((a) => a.column === col.key)
        if (dir) {
          items = [...items].sort((x, y) => (parseTime(x.time) - parseTime(y.time)) * (dir === 'desc' ? -1 : 1))
        }
        const a = accentClasses[col.accent]
        return (
          // exactly 4 columns fill the viewport (gap-4 × 3 = 3rem), min-width on small screens
          <div key={col.key} className="flex h-full w-[calc((100%-3rem)/4)] min-w-[280px] shrink-0 flex-col">
            <div className={`flex shrink-0 items-center justify-between rounded-t-xl border-t-[3px] p-2 ${a.head}`}>
              <span className="text-sm font-bold tracking-wide">{col.title}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => cycleSort(col.key)}
                  title={`Sort by time (${dir === 'desc' ? 'latest first' : 'earliest first'})`}
                  className="rounded p-0.5 hover:bg-black/5"
                >
                  {dir === 'desc'
                    ? <IconArrowDown width={14} height={14} />
                    : <IconArrowUp width={14} height={14} />}
                </button>
                {/* step this column one appointment at a time */}
                <button
                  onClick={() => stepCard(col.key, -1)}
                  title="Previous appointment"
                  className="rounded p-0.5 hover:bg-black/5"
                >
                  <IconChevron width={14} height={14} className="rotate-180" />
                </button>
                <button
                  onClick={() => stepCard(col.key, 1)}
                  title="Next appointment"
                  className="rounded p-0.5 hover:bg-black/5"
                >
                  <IconChevron width={14} height={14} />
                </button>
                <span className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold text-white ${a.badge}`}>
                  {items.length}
                </span>
              </div>
            </div>
            <div
              ref={(n) => { bodies.current[col.key] = n }}
              style={{ '--scroll-thumb': a.hex }}
              className={`thin-scroll min-h-0 flex-1 space-y-2.5 overflow-y-auto rounded-b-xl border-x border-b p-2.5 ${a.body}`}
            >
              {items.map((appt) => (
                <Card
                  key={appt.id}
                  appt={appt}
                  showBill={!NO_BILL_COLUMNS.includes(col.title)}
                  onBill={setConfirmAppt}
                  onRefund={refundAppt}
                  onReceive={receivePending}
                  onOpenLinked={openLinked}
                  cardRef={(n) => { cardNodes.current[appt.id] = n }}
                  flash={flashId === appt.id}
                />
              ))}
              {items.length === 0 && (
                <div className="py-8 text-center text-xs text-gray-400">No appointments</div>
              )}
            </div>
          </div>
        )
      })}
      </div>
    </div>
    </>
  )
}

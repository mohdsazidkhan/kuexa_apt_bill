import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import CustomerSearch from '../components/CustomerSearch'
import PaymentMethods from '../components/PaymentMethods'
import { currency } from '../data/services'
import { appointments, customerForAppointment } from '../data/appointments'
import {
  pendingBills, billPending, paidBills, billTotals,
  advanceAppointmentsFor, toAdvanceOption, refundableAppointmentsFor, toRefundOption, refundableAmount,
  pendingBillForAppointment, paidBillForAppointment, BILL_REFUND_COLUMNS,
} from '../data/payments'
import { IconSearch, IconClose, IconWallet } from '../components/Icons'

const TABS = [
  { key: 'pending', label: 'Pending Payment' },
  { key: 'advance', label: 'Advance Payment' },
  { key: 'refund', label: 'Refund Payment' },
]

const round2 = (n) => Math.round(n * 100) / 100
const num = (v) => Number(v) || 0

const cellInput =
  'h-7 w-full rounded border border-gray-300 bg-white px-2 text-right text-[12px] font-bold text-indigo-600 outline-none focus:border-indigo-500'

// Appointment status colour in the picker / roll-up.
const statusTone = (s) =>
  s === 'Full Advance' ? 'text-emerald-600'
    : s === 'Partial Advance' ? 'text-amber-600'
      : s === 'In Progress' ? 'text-sky-600'
        : 'text-indigo-600'

export default function Payments() {
  const [tab, setTab] = useState('pending')
  const [customer, setCustomer] = useState(null)
  const [toast, setToast] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  // — Pending Payment —
  const [pendChecked, setPendChecked] = useState(() => new Set())
  const [pendAmt, setPendAmt] = useState({})
  const [pendPaid, setPendPaid] = useState(0)

  // — Advance Payment — appointment is optional; an advance can be taken standalone.
  const [advAppt, setAdvAppt] = useState(null)
  const [advPaid, setAdvPaid] = useState(0)
  const [advRemarks, setAdvRemarks] = useState('')

  // — Refund Payment — against a bill's items, or against an appointment's advance.
  const [refundMode, setRefundMode] = useState('bill')
  const [refAppt, setRefAppt] = useState(null)
  const [refApptAmt, setRefApptAmt] = useState('')
  const [refBill, setRefBill] = useState(null)
  const [refChecked, setRefChecked] = useState(() => new Set())
  const [refQty, setRefQty] = useState({})
  const [refAmt, setRefAmt] = useState({})
  const [refPaid, setRefPaid] = useState(0)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(t)
  }, [toast])

  // A different client means a different set of bills — start clean.
  const changeCustomer = (c) => { resetAll(); setCustomer(c) }

  // Arriving from a Kanban card: "Bill Now → No" lands on Advance, "Refund" lands on
  // the refund tab in appointment mode — both with the client and appointment picked.
  useEffect(() => {
    const advanceId = location.state?.advanceForAppointment
    const refundId = location.state?.refundForAppointment
    const pendingId = location.state?.pendingForAppointment
    const apptId = advanceId ?? refundId ?? pendingId
    if (!apptId) return
    const appt = appointments.find((a) => a.id === apptId)
    if (!appt) return

    setCustomer(customerForAppointment(appt))
    // Selected outright rather than looked up in a picker list, so a completed or
    // already-billed appointment still arrives selected.
    if (advanceId) {
      setTab('advance')
      setAdvAppt(toAdvanceOption(appt))
    } else if (refundId) {
      setTab('refund')
      // Bill-backed money is refunded from that bill's items; an advance is
      // refunded against the appointment itself.
      if (BILL_REFUND_COLUMNS.includes(appt.column)) {
        setRefundMode('bill')
        setRefBill(paidBillForAppointment(appt.id))
        setRefChecked(new Set())
        setRefQty({})
        setRefAmt({})
      } else {
        setRefundMode('appointment')
        setRefAppt(toRefundOption(appt))
        setRefApptAmt('')
      }
    } else {
      // Land on Pending with this appointment's bill already ticked and its
      // outstanding amount filled in, ready to collect.
      setTab('pending')
      const bill = pendingBillForAppointment(appt.id)
      if (bill) {
        setPendChecked(new Set([bill.id]))
        setPendAmt({ [bill.id]: String(billPending(bill)) })
      }
    }
    navigate(location.pathname, { replace: true, state: null })
  }, [location.state, location.pathname, navigate])

  function resetAll() {
    setPendChecked(new Set()); setPendAmt({}); setPendPaid(0)
    setAdvAppt(null); setAdvRemarks(''); setAdvPaid(0)
    setRefundMode('bill'); setRefAppt(null); setRefApptAmt('')
    setRefBill(null); setRefChecked(new Set())
    setRefQty({}); setRefAmt({}); setRefPaid(0)
  }

  /* ---------------- Pending ---------------- */

  const togglePending = (b) => {
    const on = !pendChecked.has(b.id)
    const next = new Set(pendChecked)
    if (on) next.add(b.id); else next.delete(b.id)
    setPendChecked(next)
    // Tick a bill and it pre-fills the whole outstanding amount; edit it down for a part payment.
    setPendAmt((a) => ({ ...a, [b.id]: on ? a[b.id] || String(billPending(b)) : '' }))
  }

  const setPendingAmount = (b, val) => {
    const capped = num(val) > billPending(b) ? String(billPending(b)) : val
    setPendAmt((a) => ({ ...a, [b.id]: capped }))
    if (capped !== '') setPendChecked((prev) => (prev.has(b.id) ? prev : new Set(prev).add(b.id)))
  }

  const pendingTotals = useMemo(() => {
    const receiving = round2(
      pendingBills.reduce((s, b) => s + (pendChecked.has(b.id) ? num(pendAmt[b.id]) : 0), 0)
    )
    return {
      total: pendingBills.reduce((s, b) => s + b.total, 0),
      received: pendingBills.reduce((s, b) => s + b.received, 0),
      pending: pendingBills.reduce((s, b) => s + billPending(b), 0),
      receiving,
    }
  }, [pendChecked, pendAmt])

  /* ---------------- Refund ---------------- */

  const itemRemaining = (i) => round2(i.withTax - i.refunded)

  const pickBill = (b) => {
    setRefBill(b)
    setRefChecked(new Set())
    setRefQty({})
    setRefAmt({})
  }

  const toggleRefund = (i) => {
    const on = !refChecked.has(i.id)
    const next = new Set(refChecked)
    if (on) next.add(i.id); else next.delete(i.id)
    setRefChecked(next)
    if (!on) {
      setRefQty((q) => ({ ...q, [i.id]: '' }))
      setRefAmt((a) => ({ ...a, [i.id]: '' }))
    }
  }

  // Refund qty drives the amount pro-rata; the amount stays editable afterwards.
  const setRefundQty = (i, val) => {
    const q = val === '' ? '' : String(Math.max(0, Math.min(i.qty, num(val))))
    setRefQty((s) => ({ ...s, [i.id]: q }))
    if (q === '') return
    const amt = Math.min(itemRemaining(i), round2((i.withTax / i.qty) * num(q)))
    setRefAmt((s) => ({ ...s, [i.id]: String(amt) }))
    setRefChecked((prev) => (prev.has(i.id) ? prev : new Set(prev).add(i.id)))
  }

  const setRefundAmount = (i, val) => {
    const capped = num(val) > itemRemaining(i) ? String(itemRemaining(i)) : val
    setRefAmt((s) => ({ ...s, [i.id]: capped }))
    if (capped !== '') setRefChecked((prev) => (prev.has(i.id) ? prev : new Set(prev).add(i.id)))
  }

  const refundTotals = useMemo(() => {
    if (!refBill) return null
    const sum = (f) => round2(refBill.items.reduce((s, i) => s + f(i), 0))
    return {
      ...billTotals(refBill),
      qty: sum((i) => i.qty),
      refundQty: sum((i) => num(refQty[i.id])),
      refunded: sum((i) => i.refunded),
      remaining: sum((i) => itemRemaining(i)),
      refundNow: sum((i) => (refChecked.has(i.id) ? num(refAmt[i.id]) : 0)),
    }
  }, [refBill, refQty, refAmt, refChecked])

  // Only this client's own upcoming appointments can take an advance.
  const apptOptions = useMemo(() => advanceAppointmentsFor(customer), [customer])
  // …and only ones they've already paid an advance on can be refunded.
  const refundApptOptions = useMemo(() => refundableAppointmentsFor(customer), [customer])

  const apptRefundable = refundableAmount(refAppt)
  const setApptRefund = (val) =>
    setRefApptAmt(num(val) > apptRefundable ? String(apptRefundable) : val)

  /* ---------------- Footer ---------------- */

  const collected = tab === 'pending' ? pendPaid : tab === 'advance' ? advPaid : refPaid
  const target =
    tab === 'pending' ? pendingTotals.receiving
      : tab === 'advance' ? advPaid
        : refundMode === 'appointment' ? num(refApptAmt)
          : refundTotals?.refundNow ?? 0
  const remaining = round2(target - collected)
  const canPay = !!customer && target > 0 && remaining === 0

  const submit = () => {
    setToast(
      tab === 'pending' ? 'Payment received successfully'
        : tab === 'advance' ? 'Advance payment recorded successfully'
          : 'Refund processed successfully'
    )
    resetAll()
  }

  // Switching tab, client, bill or appointment starts the payment rows over.
  const payKey = `${tab}-${refundMode}-${customer?.id ?? 'none'}-${refBill?.id ?? 'none'}-${advAppt?.id ?? 'none'}-${refAppt?.id ?? 'none'}`

  return (
    <div className="-mx-6 -my-8 flex h-screen flex-col overflow-hidden bg-gray-50">
      <TopBar title={
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Kuexa &gt;</span>
          <span className="font-semibold text-gray-800">Payments</span>
        </div>
      } />

      {/* Pinned top section — the tabs and the customer bar stay put while the body scrolls */}
      <div className="shrink-0 px-6 pt-4">
        {/* Tabs */}
        <div className="mb-2 flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t.key
                  ? 'bg-[#2c4c6b] text-white shadow'
                  : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Customer, plus the tab's own record picker (appointment / bill) */}
        <div className="mb-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
          <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
            <div className="flex items-start gap-3">
              <span className="shrink-0 pt-1.5 text-sm font-bold text-gray-800">Customer</span>
              {/* just wide enough for the chip (name · gender · phone · Selected) on one line */}
              <div className="w-[380px]">
                <CustomerSearch value={customer} onChange={changeCustomer} confirmExisting={false} />
              </div>
            </div>

            {/* a refund can come off a bill's items or off an appointment's advance */}
            {tab === 'refund' && customer && (
              <div className="flex items-center gap-3">
                <span className="shrink-0 pt-1.5 text-sm font-bold text-gray-800">Refund of</span>
                <div className="flex h-[34px] items-center gap-0.5 rounded-md border border-gray-200 bg-gray-50 p-0.5">
                  {[['bill', 'Bill'], ['appointment', 'Appointment']].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setRefundMode(key)}
                      className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${
                        refundMode === key ? 'bg-[#2c4c6b] text-white shadow-sm' : 'text-gray-600 hover:bg-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'refund' && customer && refundMode === 'appointment' && (
              <SearchSelect
                label="Appt. No."
                placeholder="Search By Appointment No..."
                emptyText={`No advance paid by ${customer.name}`}
                width="w-[400px]"
                options={refundApptOptions}
                value={refAppt}
                onChange={(o) => { setRefAppt(o); setRefApptAmt('') }}
                chipMeta={(a) => (
                  <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-gray-500">{a.date}</span>
                )}
                meta={(a) => (
                  <>
                    <span className="whitespace-nowrap text-xs font-semibold text-gray-500">{a.date}</span>
                    <span className="text-xs font-bold text-emerald-600">{currency(a.paidAmount)}</span>
                    <span className={`text-xs font-bold ${statusTone(a.status)}`}>{a.status}</span>
                  </>
                )}
              />
            )}

            {tab === 'refund' && customer && refundMode === 'bill' && (
              <SearchSelect
                label="Bill No"
                placeholder="Search By Bill No..."
                emptyText="No bill found"
                width="w-[360px]"
                options={paidBills}
                value={refBill}
                onChange={pickBill}
                chipMeta={(b) => (
                  <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-gray-500">{b.date}</span>
                )}
                meta={(b) => (
                  <>
                    <span className="whitespace-nowrap text-xs font-semibold text-gray-500">{b.date}</span>
                    <span className="text-xs font-bold text-gray-700">{currency(b.received)}</span>
                    <span className="text-xs font-bold text-emerald-600">{b.status}</span>
                  </>
                )}
              />
            )}

            {tab === 'advance' && customer && (
              <SearchSelect
                label="Appointment"
                placeholder="Search By Appointment No..."
                emptyText={`No upcoming appointment for ${customer.name}`}
                width="w-[400px]"
                options={apptOptions}
                value={advAppt}
                onChange={setAdvAppt}
                chipMeta={(a) => (
                  <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-gray-500">{a.date}</span>
                )}
                meta={(a) => (
                  <>
                    <span className="whitespace-nowrap text-xs font-semibold text-gray-500">{a.date} · {a.time}</span>
                    <span className="text-xs font-bold text-gray-700">{currency(a.amount)}</span>
                    <span className={`text-xs font-bold ${statusTone(a.status)}`}>{a.status}</span>
                  </>
                )}
              />
            )}

            {/* the picked appointment's figures ride along in the same row */}
            {tab === 'advance' && advAppt && (
              <div className="flex items-center gap-5 whitespace-nowrap pt-1.5 text-[13px]">
                <Fact label="Items" value={advAppt.serviceCount} />
                <Fact label="Price" value={currency(advAppt.amount)} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {!customer ? (
          <EmptyState
            title="Select a customer to continue"
            hint="Search by name or phone above — their bills, balances and payment modes load here."
          />
        ) : tab === 'pending' ? (
          /* ---------------- Pending Payment ---------------- */
          <div className="space-y-2">
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left text-[12px] whitespace-nowrap">
                <thead className="border-b border-gray-200 bg-gray-100 text-gray-600">
                  <tr>
                    {/* header alignment mirrors each column's cells so they line up */}
                    <th className="w-12 px-4 py-2.5" />
                    <th className="px-4 py-2.5 text-left font-bold">Bill No</th>
                    <th className="px-4 py-2.5 text-left font-bold">Bill Date</th>
                    <th className="px-4 py-2.5 text-right font-bold">Total Amount</th>
                    <th className="px-4 py-2.5 text-right font-bold">Received Amount</th>
                    <th className="px-4 py-2.5 text-right font-bold">Pending Amount</th>
                    {/* pr-6 = cell padding + the input's own px-2, so it sits over the value */}
                    <th className="w-48 py-2.5 pl-4 pr-6 text-right font-bold">Receiving Now</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingBills.map((b) => (
                    <tr
                      key={b.id}
                      className={pendChecked.has(b.id) ? 'bg-indigo-50/70' : 'hover:bg-gray-50/60'}
                    >
                      <td className="px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={pendChecked.has(b.id)}
                          onChange={() => togglePending(b)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-indigo-600">
                        <span className="inline-flex items-center gap-2">
                          {b.no}
                          {pendChecked.has(b.id) && (
                            <span className="font-medium text-emerald-600">Selected</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">{b.date}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-gray-700">{currency(b.total)}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-emerald-600">{currency(b.received)}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-rose-500">{currency(billPending(b))}</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={pendAmt[b.id] ?? ''}
                          onChange={(e) => setPendingAmount(b, e.target.value)}
                          placeholder="0"
                          className={cellInput}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-gray-200 bg-gray-50 font-bold text-gray-800">
                  <tr>
                    <td className="px-4 py-2.5" colSpan={3}>Total</td>
                    <td className="px-4 py-2.5 text-right">{currency(pendingTotals.total)}</td>
                    <td className="px-4 py-2.5 text-right">{currency(pendingTotals.received)}</td>
                    <td className="px-4 py-2.5 text-right">{currency(pendingTotals.pending)}</td>
                    <td className="py-2.5 pl-4 pr-6 text-right text-indigo-600">{currency(pendingTotals.receiving)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <Section title="Benefits & Payment Modes">
              <PaymentMethods
                key={payKey}
                netTotal={pendingTotals.receiving}
                onPaidChange={setPendPaid}
                hasBenefits={customer?.id === 'c1'}
              />
            </Section>
          </div>
        ) : tab === 'advance' ? (
          /* ---------------- Advance Payment ---------------- */
          <div className="space-y-4">
            <Section title="Payment Mode">
              {/* With an appointment picked, its amount is the figure a ticked payment
                  row pre-fills; without one the advance is whatever gets typed. */}
              <PaymentMethods
                key={payKey}
                netTotal={advAppt?.amount ?? 0}
                onPaidChange={setAdvPaid}
                showSummary={false}
              />
            </Section>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <label className="mb-1.5 block text-sm font-bold text-gray-800">Remarks</label>
              <textarea
                rows={4}
                value={advRemarks}
                onChange={(e) => setAdvRemarks(e.target.value)}
                placeholder="Remarks"
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        ) : refundMode === 'appointment' ? (
          /* ------------- Refund Payment · against an advance ------------- */
          !refAppt ? (
            <EmptyState
              title="Pick an appointment to refund"
              hint={`Only appointments ${customer.name} has already paid an advance on can be refunded.`}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[13px] shadow-sm">
                <Fact label="Appt. Amount" value={currency(refAppt.amount)} />
                <Fact label="Amount Paid" value={currency(refAppt.paidAmount)} tone="text-emerald-600" />
                <Fact label="Already Refunded" value={currency(refAppt.refundedAmount)} />
                <Fact label="Refundable" value={currency(apptRefundable)} tone="text-rose-500" />
                <span className={`text-sm font-bold ${statusTone(refAppt.status)}`}>{refAppt.status}</span>

                <label className="ml-auto flex items-center gap-2 whitespace-nowrap">
                  <span className="text-sm font-bold text-gray-800">Refund Now</span>
                  <input
                    type="number"
                    value={refApptAmt}
                    onChange={(e) => setApptRefund(e.target.value)}
                    placeholder="0"
                    className="h-8 w-32 rounded border border-gray-300 bg-white px-2 text-right text-[13px] font-bold text-indigo-600 outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => setRefApptAmt(String(apptRefundable))}
                    className="rounded border border-gray-300 px-2 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Full
                  </button>
                </label>
              </div>

              <Section title="Payment Mode">
                <PaymentMethods key={payKey} netTotal={num(refApptAmt)} onPaidChange={setRefPaid} />
              </Section>
            </div>
          )
        ) : (
          /* ------------- Refund Payment · against a bill's items ------------- */
          !refBill ? (
            <EmptyState
              title="Pick a bill to refund"
              hint="Search a bill number above — its items, taxes and already-refunded amounts load here."
            />
          ) : (
            <div className="space-y-4">
              {/* Bill roll-up */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[13px] shadow-sm">
                <Fact label="Total Amount" value={currency(refundTotals.total)} />
                <Fact label="Disc. Amount" value={currency(refundTotals.disc)} tone="text-rose-500" />
                <Fact label="Amount After Disc." value={currency(refundTotals.afterDisc)} />
                <Fact label="Total Tax" value={currency(refundTotals.tax)} />
                <Fact label="Total With Tax" value={currency(refundTotals.withTax)} />
                <Fact label="Received Amount" value={currency(refBill.received)} tone="text-emerald-600" />
                <span className="text-sm font-bold text-emerald-600">{refBill.status}</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-[11px] whitespace-nowrap">
                  <thead className="border-b border-gray-200 bg-gray-100 text-gray-600">
                    <tr>
                      {/* header alignment mirrors each column's cells so they line up */}
                      <th className="w-10 px-3 py-2.5" />
                      <th className="px-3 py-2.5 text-left font-bold">Item Name</th>
                      <th className="px-3 py-2.5 text-right font-bold">Item Price</th>
                      <th className="px-3 py-2.5 text-right font-bold">Item Qty.</th>
                      {/* pr-5 = cell padding + the input's own px-2, so it sits over the value */}
                      <th className="w-24 py-2.5 pl-3 pr-5 text-right font-bold">Refund Qty.</th>
                      <th className="px-3 py-2.5 text-right font-bold">Item Disc.</th>
                      <th className="px-3 py-2.5 text-right font-bold">Item After Disc.</th>
                      <th className="px-3 py-2.5 text-right font-bold">Item Tax</th>
                      <th className="px-3 py-2.5 text-right font-bold">Item With Tax</th>
                      <th className="px-3 py-2.5 text-right font-bold">Received Amt.</th>
                      <th className="px-3 py-2.5 text-right font-bold">Refunded Amt.</th>
                      <th className="px-3 py-2.5 text-right font-bold">Remaining Amt.</th>
                      <th className="w-32 py-2.5 pl-3 pr-5 text-right font-bold">Refund Now</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {refBill.items.map((i) => (
                      <tr key={i.id} className="hover:bg-gray-50/60">
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={refChecked.has(i.id)}
                            onChange={() => toggleRefund(i)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="max-w-[260px] whitespace-normal px-3 py-2.5 font-medium text-gray-700">{i.name}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-gray-700">{currency(i.price)}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-gray-700">{i.qty}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={refQty[i.id] ?? ''}
                            onChange={(e) => setRefundQty(i, e.target.value)}
                            className={cellInput}
                          />
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold text-rose-500">{currency(i.disc)}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-gray-700">{currency(i.afterDisc)}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-gray-700">{currency(i.tax)}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-gray-800">{currency(i.withTax)}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-emerald-600">{currency(i.withTax)}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-gray-500">{currency(i.refunded)}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-gray-800">{currency(itemRemaining(i))}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={refAmt[i.id] ?? ''}
                            onChange={(e) => setRefundAmount(i, e.target.value)}
                            placeholder="0"
                            className={cellInput}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-gray-200 bg-gray-50 font-bold text-gray-800">
                    <tr>
                      <td className="px-3 py-2.5" colSpan={2}>Total</td>
                      <td className="px-3 py-2.5 text-right">{currency(refundTotals.total)}</td>
                      <td className="px-3 py-2.5 text-right">{refundTotals.qty}</td>
                      <td className="py-2.5 pl-3 pr-5 text-right">{refundTotals.refundQty}</td>
                      <td className="px-3 py-2.5 text-right">{currency(refundTotals.disc)}</td>
                      <td className="px-3 py-2.5 text-right">{currency(refundTotals.afterDisc)}</td>
                      <td className="px-3 py-2.5 text-right">{currency(refundTotals.tax)}</td>
                      <td className="px-3 py-2.5 text-right">{currency(refundTotals.withTax)}</td>
                      <td className="px-3 py-2.5 text-right">{currency(refundTotals.withTax)}</td>
                      <td className="px-3 py-2.5 text-right">{currency(refundTotals.refunded)}</td>
                      <td className="px-3 py-2.5 text-right">{currency(refundTotals.remaining)}</td>
                      <td className="py-2.5 pl-3 pr-5 text-right text-indigo-600">{currency(refundTotals.refundNow)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <Section title="Payment Mode">
                <PaymentMethods key={payKey} netTotal={refundTotals.refundNow} onPaidChange={setRefPaid} />
              </Section>
            </div>
          )
        )}
      </div>

      {/* Footer bar */}
      <div className="flex items-center gap-4 border-t border-gray-200 bg-white px-6 py-3">
        <span className="text-lg font-bold text-gray-800">
          Total Amount - {collected ? currency(collected) : '0'}
        </span>
        {remaining > 0 && (
          <span className="mx-auto text-lg font-bold text-rose-500">
            Remaining Amount {currency(remaining)}
          </span>
        )}
        {remaining < 0 && (
          <span className="mx-auto text-lg font-bold text-pink-600">
            Excess {currency(Math.abs(remaining))}
          </span>
        )}
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={resetAll}
            className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            CANCEL
          </button>
          <button
            onClick={submit}
            disabled={!canPay}
            className="rounded-md bg-[#2c4c6b] px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#1e3a56] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            PAYMENT
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-20 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-full bg-gray-900 px-6 py-3 text-white shadow-2xl">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  )
}

// Type-ahead over a list of records that each carry a `no` — used for both the
// refund's Bill No and the advance's Appointment picker.
// `meta` renders the extra columns of a dropdown row; `chipMeta` the extra detail
// shown next to the number once it is picked.
function SearchSelect({ label, placeholder, emptyText, options, value, onChange, meta, chipMeta, width = 'w-[320px]' }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter((o) => o.no.toLowerCase().includes(q)) : options
  }, [query, options])

  const pick = (o) => { onChange?.(o); setQuery(''); setOpen(false) }

  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 pt-1.5 text-sm font-bold text-gray-800">{label}</span>
      <div className={`relative ${width}`}>
        {value ? (
          <div className="flex h-[34px] items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-semibold text-indigo-600">{value.no}</span>
              {chipMeta?.(value)}
            </span>
            {/* same "Selected · ×" tail as the customer chip */}
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-sm font-medium text-emerald-600">Selected</span>
              <button onClick={() => pick(null)} className="text-gray-300 hover:text-rose-500">
                <IconClose width={16} height={16} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <IconSearch width={16} height={16} className="absolute left-3 top-[9px] text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder={placeholder}
              className="h-[34px] w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            {open && (
              // w-max lets a long row (appt no · date · amount · status) size the list
              <ul className="absolute z-20 mt-1 max-h-52 w-max min-w-full max-w-[560px] overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {results.length === 0 && (
                  <li className="px-3 py-3 text-center text-sm text-gray-400">{emptyText}</li>
                )}
                {results.map((o) => (
                  <li key={o.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(o)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-indigo-50"
                    >
                      <span className="truncate text-sm font-semibold text-gray-800">{o.no}</span>
                      {meta?.(o)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-bold text-gray-800">{title}</div>
      {children}
    </div>
  )
}

function Fact({ label, value, tone = 'text-gray-800' }) {
  return (
    <span className="text-gray-500">
      {label}: <span className={`font-bold ${tone}`}>{value}</span>
    </span>
  )
}

function EmptyState({ title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
        <IconWallet width={22} height={22} />
      </div>
      <h2 className="text-base font-bold text-gray-800">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-gray-400">{hint}</p>
    </div>
  )
}

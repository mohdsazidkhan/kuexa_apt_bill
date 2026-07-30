// Dummy data for the Payments screen (Pending / Advance / Refund).
// Kept separate from PendingBillsModal's list so the New Bill flow stays untouched.

import { appointments, parseApptDate } from './appointments'

const round2 = (n) => Math.round(n * 100) / 100

// Unpaid & part-paid bills of the selected client — settled from the "Pending Payment" tab.
export const pendingBills = [
  { id: 'pb1', no: 'BILL/000171/2025-26', date: '18-08-2025', total: 1305, received: 805 },
  { id: 'pb2', no: 'BILL/000300/2025-26', date: '23-08-2025', total: 4460, received: 4459 },
  { id: 'pb3', no: 'BILL/000301/2025-26', date: '23-08-2025', total: 5888, received: 1882 },
  { id: 'pb4', no: 'BILL/000979/2025-26', date: '28-10-2025', total: 7350, received: 4350 },
]

export const billPending = (b) => round2(Math.max(0, b.total - b.received))

// Which unpaid bill a PARTIAL PAID appointment belongs to. The dummy bill list is
// shorter than the column, so they're handed out round-robin — every such card still
// maps to a real bill, which is what "Receive Pending Amount" needs to preselect.
const partPaidAppointments = appointments.filter((a) => a.column === 'partialpaid')
export const pendingBillForAppointment = (apptId) => {
  const i = partPaidAppointments.findIndex((a) => a.id === apptId)
  return i === -1 ? null : pendingBills[i % pendingBills.length]
}

// price × qty, minus a flat line discount, plus line tax.
const item = (id, name, price, qty, disc, taxRate, refunded = 0) => {
  const gross = round2(price * qty)
  const afterDisc = round2(gross - disc)
  const tax = round2(afterDisc * taxRate)
  return {
    id, name, price, qty, disc, taxRate, refunded,
    gross, afterDisc, tax,
    withTax: round2(afterDisc + tax),
  }
}

// Fully/partly paid bills searchable in the "Refund Payment" tab.
export const paidBills = [
  {
    id: 'fb1',
    no: 'BILL/001530/2025-26',
    date: '12-11-2025',
    received: 111955,
    status: 'FullyPaid',
    items: [
      item('fb1-i1', 'FEMALE AIRBRUSH BRIDAL', 15000, 5, 7500, 0.18),
      item('fb1-i2', 'AMAZON SERIES ACAI OIL TREATMENT 60 ML 60 ML PACK OF 24', 1000, 24, 2400, 0.18),
      item('fb1-i3', 'FEMALE BODY POLISHING', 5000, 1, 500, 0.05),
    ],
  },
  {
    id: 'fb2',
    no: 'BILL/001529/2025-26',
    date: '11-11-2025',
    received: 9803,
    status: 'FullyPaid',
    items: [
      item('fb2-i1', 'AMAZON SERIES ACAI OIL TREATMENT 60 ML 60 ML PACK OF 24', 1000, 1, 300, 0.18),
      item('fb2-i2', 'QOD QOD ARGAN HAIR CONDITIONER AFTER CARE TREAT -1000 M 300 ML PACK OF 12', 1000, 1, 300, 0.05),
      item('fb2-i3', 'DE FABULOUS MARULA OIL MIRACLE REPAIR MASQUE 250 ML 250 ML PACK OF 12', 1000, 1, 300, 0.05),
    ],
  },
  {
    id: 'fb3',
    no: 'BILL/001528/2025-26',
    date: '09-11-2025',
    received: 19307,
    status: 'FullyPaid',
    items: [
      item('fb3-i1', 'WOMEN STRAIGHT HAIR THERAPY', 8000, 2, 1600, 0.18),
      item('fb3-i2', 'HAIR SPA STEAM', 1200, 2, 0, 0.05),
      item('fb3-i3', 'FEMALE ACRYLIC EXTENSION', 2000, 1, 200, 0.18, 500),
    ],
  },
]

// Columns whose money sits against a bill, so a refund is issued from that bill's
// items rather than from the appointment.
export const BILL_REFUND_COLUMNS = ['paid', 'partialpaid']

// Which bill such an appointment was billed on. Same round-robin idea as the pending
// bills, since the dummy bill list is shorter than the columns.
const billedAppointments = appointments.filter((a) => BILL_REFUND_COLUMNS.includes(a.column))
export const paidBillForAppointment = (apptId) => {
  const i = billedAppointments.findIndex((a) => a.id === apptId)
  return i === -1 ? null : paidBills[i % paidBills.length]
}

const COLUMN_LABEL = {
  scheduled: 'Scheduled', checkedin: 'Checked-In', inprogress: 'In Progress',
  completed: 'Completed', draft: 'Draft', waiting: 'Waiting',
  rescheduled: 'Rescheduled', partialadvance: 'Partial Advance',
  cancelled: 'Cancelled', fulladvance: 'Full Advance', noshow: 'No Show',
  partialpaid: 'Partial Paid', paid: 'Fully Paid', refunded: 'Refunded',
}

// Nothing upcoming left to collect an advance against.
const CLOSED_COLUMNS = ['cancelled', 'noshow', 'completed', 'paid', 'refunded', 'partialpaid', 'fulladvance']

// Kanban appointment -> the shape the advance picker renders.
export const toAdvanceOption = (a) => a && ({
  id: a.id,
  no: a.id,
  date: a.date,
  time: a.time,
  customer: a.customer,
  status: COLUMN_LABEL[a.column] ?? a.column,
  serviceCount: a.services.length,
  amount: round2(a.services.reduce((s, sv) => s + (Number(sv.price) || 0), 0)),
})

// Appointments the selected client can be charged an advance against: theirs only,
// dated today or later, still open (not billed, cancelled, completed or a no-show).
export const advanceAppointmentsFor = (customer) => {
  if (!customer) return []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const name = customer.name.trim().toLowerCase()

  const isTheirs = (a) =>
    String(a.customer).trim().toLowerCase() === name ||
    a.guests?.some((g) => g.name.trim().toLowerCase() === name) // group booking they're on

  return appointments
    .filter((a) => !a.billed && !CLOSED_COLUMNS.includes(a.column))
    .filter(isTheirs)
    .filter((a) => parseApptDate(a.date) >= today)
    .sort((a, b) => parseApptDate(a.date) - parseApptDate(b.date))
    .map(toAdvanceOption)
}

// Kanban appointment -> the shape the refund picker renders.
export const toRefundOption = (a) => a && ({
  ...toAdvanceOption(a),
  paidAmount: a.paidAmount || 0,
  refundedAmount: a.refundedAmount || 0,
})

// Appointments this client has paid an advance on — those are the ones a refund can be
// issued against, capped at whatever is still unrefunded. Bill-backed appointments are
// left out: they refund against their bill, on the other side of the tab.
export const refundableAppointmentsFor = (customer) => {
  if (!customer) return []
  const name = customer.name.trim().toLowerCase()

  return appointments
    .filter((a) => (a.paidAmount || 0) > 0 && !BILL_REFUND_COLUMNS.includes(a.column))
    .filter((a) =>
      String(a.customer).trim().toLowerCase() === name ||
      a.guests?.some((g) => g.name.trim().toLowerCase() === name)
    )
    .sort((a, b) => parseApptDate(a.date) - parseApptDate(b.date))
    .map(toRefundOption)
}

export const refundableAmount = (o) => (o ? round2((o.paidAmount || 0) - (o.refundedAmount || 0)) : 0)

// Bill-level roll-up shown above the refund item table.
export const billTotals = (bill) => {
  const sum = (f) => round2(bill.items.reduce((s, i) => s + f(i), 0))
  return {
    total: sum((i) => i.gross),
    disc: sum((i) => i.disc),
    afterDisc: sum((i) => i.afterDisc),
    tax: sum((i) => i.tax),
    withTax: sum((i) => i.withTax),
  }
}

// Dummy appointments for the Kanban board.
// column: scheduled | checkedin | inprogress | completed

import { customers, services, stylists } from './services'

// Dates are relative to whenever the demo is opened, so the board (and the Payments
// screen's "upcoming appointments" picker) never go stale.
const dayFrom = (n) => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
export const DAY_TODAY = dayFrom(0)
export const DAY_NEXT = dayFrom(1)
export const DAY_AFTER = dayFrom(2)

// "30 Jul 2026" -> Date, for comparing an appointment against today.
const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
export const parseApptDate = (s) => {
  const [d, m, y] = String(s).split(' ')
  return new Date(Number(y), MONTHS[m] ?? 0, Number(d))
}

// Billing an appointment closes it out: every service on it is marked Completed.
export const completeAppointmentServices = (appt) => {
  appt?.services?.forEach((s) => { s.status = 'Completed' })
}

// The client record behind an appointment — a real customer when phone/name match,
// otherwise a stand-in built from the appointment itself. A group booking resolves to
// its first client, since "Group" isn't a person you can bill or take an advance from.
export const customerForAppointment = (appt) => {
  if (!appt) return null
  const first = appt.group ? appt.guests?.[0] : null
  const name = first?.name ?? appt.customer
  const phone = first?.phone ?? appt.phone
  const matched = customers.find((c) => (phone && c.phone === phone) || c.name === name)
  return matched ?? { id: appt.id, name, phone: phone || '', gender: null }
}

// One unified set of status columns — each rendered exactly once.
// Order = 4 per row: [Scheduled, Checked-In, In Progress, Completed]
//                    [Draft, Waiting, Rescheduled, Partial Advance]
//                    [Full Advance, Partial Paid, Paid, Refunded]
//                    [Cancelled, No Show]
export const kanbanColumns = [
  { key: 'scheduled', title: 'SCHEDULED', accent: 'indigo' },
  { key: 'checkedin', title: 'CHECKED-IN', accent: 'sky' },
  { key: 'inprogress', title: 'IN PROGRESS', accent: 'amber' },
  { key: 'completed', title: 'COMPLETED', accent: 'emerald' },
  // Books vs floor disagree — needs someone to look at it.
  { key: 'dangerous', title: 'DANGEROUS', accent: 'danger' },
  { key: 'draft', title: 'DRAFT', accent: 'gray' },
  { key: 'waiting', title: 'WAITING', accent: 'lightyellow' },
  { key: 'rescheduled', title: 'RESCHEDULED', accent: 'magenta' },
  { key: 'partialadvance', title: 'PARTIAL ADVANCE', accent: 'yellow' },
  { key: 'fulladvance', title: 'FULL ADVANCE', accent: 'green' },
  // Post-billing payment states, modelled on FULL ADVANCE.
  { key: 'partialpaid', title: 'PARTIAL PAID', accent: 'cyan' },
  { key: 'paid', title: 'FULLY PAID', accent: 'teal' },
  { key: 'refunded', title: 'REFUNDED', accent: 'pink' },
  // Dead-end states last.
  { key: 'cancelled', title: 'CANCELLED', accent: 'red' },
  { key: 'noshow', title: 'NO SHOW', accent: 'brown' },
]

// Hand-written cards that other screens rely on (the group booking, the completed
// -but-unbilled one, …). `appointments` below is these plus generated filler.
const baseAppointments = [
  // --- SCHEDULED (2) ---
  {
    id: 'APT-20260723165418341-63', time: '4:52 PM', date: DAY_TODAY, source: 'Walk-in', billed: false,
    // Group booking: `guests` are the clients on it and every service names the one it
    // belongs to, so billing it can split into one guest per client.
    group: true, clients: 2, customer: 'Group', phone: '', priority: null, column: 'scheduled',
    guests: [
      { name: 'Priya Sharma', phone: '9834567812' },
      { name: 'Vikram Singh', phone: '9812345678' },
    ],
    services: [
      { name: 'Blow Dry & Styling', category: 'Hair', stylist: '', date: DAY_TODAY, time: '4:52 PM', duration: 45, price: 440, status: 'Scheduled', client: 'Priya Sharma' },
      { name: 'Facial - Basic Clean-Up', category: 'Skin Care', stylist: '', date: DAY_TODAY, time: '5:37 PM', duration: 60, price: 900, status: 'Scheduled', client: 'Vikram Singh' },
    ],
  },
  {
    id: 'APT-20260724090012045-11', time: '9:00 AM', date: DAY_TODAY, source: 'Phone', billed: false,
    customer: 'Ananya Gupta', phone: '9876543210', priority: null, column: 'scheduled',
    services: [{ name: 'Women Ombrè Highlights', category: 'Hair', stylist: 'PRIYA', date: DAY_TODAY, time: '9:00 AM', duration: 120, price: 7000, status: 'Scheduled' }],
  },

  // --- CHECKED-IN (2) ---
  {
    id: 'APT-20260721134354107-63', time: '11:06 AM', date: DAY_TODAY, source: 'Walk-in', billed: false,
    customer: 'Seema', phone: '9845347490', priority: null, column: 'checkedin',
    services: [{ name: 'Blow Dry & Styling', category: 'Hair', stylist: 'POONAM', date: DAY_TODAY, time: '11:06 AM', duration: 45, price: 440, status: 'Scheduled' }],
  },
  {
    id: 'APT-20260724115500332-08', time: '11:45 AM', date: DAY_TODAY, source: 'Walk-in', billed: false,
    customer: 'Karan Mehta', phone: '9654321870', priority: null, column: 'checkedin',
    services: [{ name: 'Men Express Color Treatment', category: 'Hair', stylist: 'RAHUL', date: DAY_TODAY, time: '11:45 AM', duration: 30, price: 3000, status: 'Scheduled' }],
  },

  // --- IN PROGRESS (2) ---
  {
    id: 'APT-20260720121828678-63', time: '3:00 PM', date: DAY_TODAY, source: 'Walk-in', billed: false,
    customer: 'Acharya Manoj Kumar', phone: '9871425920', priority: 'High', column: 'inprogress',
    services: [{ name: 'Blow Dry & Styling', category: 'Hair', stylist: 'POONAM', date: DAY_TODAY, time: '3:00 PM', duration: 45, price: 440, status: 'In Progress' }],
  },
  {
    id: 'APT-20260724140000119-42', time: '2:00 PM', date: DAY_TODAY, source: 'Online', billed: false,
    customer: 'Rajat Katiyar', phone: '7380785008', priority: null, column: 'inprogress',
    services: [{ name: 'Women Straight Hair Therapy', category: 'Hair', stylist: 'AARAV', date: DAY_TODAY, time: '2:00 PM', duration: 180, price: 8000, status: 'In Progress' }],
  },

  // --- COMPLETED (3) ---
  {
    // Services done but not billed yet — the one completed card that can still be billed.
    id: 'APT-20260724154500310-55', time: '3:45 PM', date: DAY_TODAY, source: 'Online', billed: false,
    customer: 'Rajat Katiyar', phone: '7380785008', priority: null, column: 'completed',
    services: [{ name: 'Hair Spa', category: 'Hair Treatments', stylist: 'AARAV', date: DAY_TODAY, time: '3:45 PM', duration: 50, price: 1200, status: 'Completed' }],
  },
  {
    id: 'APT-20260720121828999-63', time: '3:00 PM', date: DAY_TODAY, source: 'Walk-in', billed: true,
    customer: 'Acharya Manoj Kumar', phone: '9871425920', priority: 'High', column: 'completed',
    services: [{ name: 'Blow Dry & Styling', category: 'Hair', stylist: 'POONAM', date: DAY_TODAY, time: '3:00 PM', duration: 45, price: 440, status: 'Completed' }],
  },
  {
    id: 'APT-20260724130000551-19', time: '1:00 PM', date: DAY_TODAY, source: 'Phone', billed: true,
    customer: 'Rohit Malhotra', phone: '9765432109', priority: null, column: 'completed',
    services: [{ name: 'Hair Spa', category: 'Hair Treatments', stylist: 'SNEHA', date: DAY_TODAY, time: '1:00 PM', duration: 50, price: 1200, status: 'Completed' }],
  },

  // --- DRAFT (2) ---
  {
    id: 'APT-20260725114500801-03', time: '11:45 AM', date: DAY_NEXT, source: 'Walk-in', billed: false,
    customer: 'Imran Ansari', phone: '9700456123', priority: null, column: 'draft',
    services: [{ name: 'Men Airbrush Make Up', category: 'Airbrush Makeup', stylist: '', date: DAY_NEXT, time: '11:45 AM', duration: 160, price: 7000, status: 'Draft' }],
  },
  {
    id: 'APT-20260725103000442-27', time: '10:30 AM', date: DAY_NEXT, source: 'Online', billed: false,
    customer: 'Priya Sharma', phone: '9834567812', priority: null, column: 'draft',
    services: [{ name: 'Female Airbrush Party', category: 'Party Makeup', stylist: '', date: DAY_NEXT, time: '10:30 AM', duration: 50, price: 6000, status: 'Draft' }],
  },

  // --- WAITING (2) ---
  {
    id: 'APT-20260725180000660-14', time: '6:00 PM', date: DAY_NEXT, source: 'Walk-in', billed: false,
    customer: 'Sneha Reddy', phone: '9812309876', priority: null, column: 'waiting',
    services: [{ name: 'Facial - Basic Clean-Up', category: 'Skin Care', stylist: 'SNEHA', date: DAY_NEXT, time: '6:00 PM', duration: 60, price: 900, status: 'Waiting' }],
  },
  {
    id: 'APT-20260725123000318-22', time: '12:30 PM', date: DAY_NEXT, source: 'Walk-in', billed: false,
    customer: 'Vikram Singh', phone: '9812345678', priority: null, column: 'waiting',
    services: [{ name: 'Beard Grooming & Trim', category: 'Beard Service', stylist: 'IMRAN', date: DAY_NEXT, time: '12:30 PM', duration: 20, price: 250, status: 'Waiting' }],
  },

  // --- RESCHEDULED (2) ---
  {
    id: 'APT-20260726140000733-31', time: '2:00 PM', date: DAY_AFTER, source: 'Phone', billed: false,
    customer: 'Meera Nair', phone: '9900112233', priority: null, column: 'rescheduled',
    services: [{ name: 'Female Body Polishing', category: 'Body Spa', stylist: 'SNEHA', date: DAY_AFTER, time: '2:00 PM', duration: 60, price: 5000, status: 'Rescheduled' }],
  },
  {
    id: 'APT-20260726160000909-38', time: '4:00 PM', date: DAY_AFTER, source: 'Online', billed: false,
    customer: 'Karan Mehta', phone: '9654321870', priority: null, column: 'rescheduled',
    services: [{ name: 'Beard Grooming & Trim', category: 'Beard Service', stylist: 'RAHUL', date: DAY_AFTER, time: '4:00 PM', duration: 20, price: 250, status: 'Rescheduled' }],
  },

  // --- PARTIAL ADVANCE (2) ---
  {
    id: 'APT-20260726120000556-14', time: '12:00 PM', date: DAY_AFTER, source: 'Phone', billed: false,
    customer: 'Divya Iyer', phone: '9900456781', priority: null, column: 'partialadvance',
    services: [{ name: 'Female Body Polishing', category: 'Body Spa', stylist: 'SNEHA', date: DAY_AFTER, time: '12:00 PM', duration: 60, price: 5000, status: 'Confirmed' }],
  },
  {
    id: 'APT-20260726153000771-45', time: '3:30 PM', date: DAY_AFTER, source: 'Online', billed: false,
    customer: 'Ananya Gupta', phone: '9876543210', priority: null, column: 'partialadvance',
    services: [{ name: 'Hair Spa', category: 'Hair Treatments', stylist: 'PRIYA', date: DAY_AFTER, time: '3:30 PM', duration: 50, price: 1200, status: 'Confirmed' }],
  },

  // --- CANCELLED (2) ---
  {
    id: 'APT-20260725183000110-77', time: '6:30 PM', date: DAY_NEXT, source: 'Phone', billed: false,
    customer: 'Meera Nair', phone: '9900112233', priority: null, column: 'cancelled',
    services: [{ name: 'Beard Grooming & Trim', category: 'Beard Service', stylist: 'IMRAN', date: DAY_NEXT, time: '6:30 PM', duration: 20, price: 250, status: 'Cancelled' }],
  },
  {
    id: 'APT-20260725170000205-88', time: '5:00 PM', date: DAY_NEXT, source: 'Walk-in', billed: false,
    customer: 'Rohit Malhotra', phone: '9765432109', priority: null, column: 'cancelled',
    services: [{ name: 'Men Face De-tan', category: 'De Tan', stylist: 'AARAV', date: DAY_NEXT, time: '5:00 PM', duration: 30, price: 500, status: 'Cancelled' }],
  },

  // --- FULL ADVANCE (2) ---
  {
    id: 'APT-20260726170000207-57', time: '5:00 PM', date: DAY_AFTER, source: 'Phone', billed: false,
    customer: 'Divya Iyer', phone: '9900456781', priority: null, column: 'fulladvance',
    services: [{ name: 'Women Straight Hair Therapy', category: 'Hair', stylist: 'AARAV', date: DAY_AFTER, time: '5:00 PM', duration: 180, price: 8000, status: 'Confirmed' }],
  },
  {
    id: 'APT-20260726100000642-61', time: '10:00 AM', date: DAY_AFTER, source: 'Online', billed: false,
    customer: 'Rajat Katiyar', phone: '7380785008', priority: null, column: 'fulladvance',
    services: [{ name: 'Women Ombrè Highlights', category: 'Hair', stylist: 'PRIYA', date: DAY_AFTER, time: '10:00 AM', duration: 120, price: 7000, status: 'Confirmed' }],
  },

  // --- NO SHOW (2) ---
  {
    id: 'APT-20260724150000473-92', time: '3:00 PM', date: DAY_TODAY, source: 'Walk-in', billed: false,
    customer: 'Karan Mehta', phone: '9654321870', priority: null, column: 'noshow',
    services: [{ name: 'Blow Dry & Styling', category: 'Hair', stylist: 'POONAM', date: DAY_TODAY, time: '3:00 PM', duration: 45, price: 440, status: 'No Show' }],
  },
  {
    id: 'APT-20260724164500384-70', time: '4:45 PM', date: DAY_TODAY, source: 'Phone', billed: false,
    customer: 'Sneha Reddy', phone: '9812309876', priority: null, column: 'noshow',
    services: [{ name: 'Hair Massage', category: 'Head Massage', stylist: 'IMRAN', date: DAY_TODAY, time: '4:45 PM', duration: 30, price: 500, status: 'No Show' }],
  },
]

/* ---------------------------------------------------------------------------
 * Filler appointments — every column carries at least MIN_PER_COLUMN cards so
 * the board has something to page and scroll through. Generated from a fixed
 * seed (no Math.random) so the demo looks identical on every reload.
 * ------------------------------------------------------------------------- */

const MIN_PER_COLUMN = 10

// Service status that fits each column.
const SERVICE_STATUS = {
  scheduled: 'Scheduled', checkedin: 'Confirmed', inprogress: 'In Progress',
  completed: 'Completed', draft: 'Draft', waiting: 'Waiting',
  rescheduled: 'Rescheduled', partialadvance: 'Scheduled',
  cancelled: 'Cancelled', fulladvance: 'Scheduled', noshow: 'No Show',
  // Post-billing states — the service is done, only the money differs.
  partialpaid: 'Partial-Paid', paid: 'Completed', refunded: 'Refunded',
}

// Columns where a bill has already been raised and settled (or reversed). An advance
// is money taken up front, not a raised bill — those columns still need billing.
const BILLED_COLUMNS = ['paid', 'refunded']

const SOURCES = ['Walk-in', 'Phone', 'Online', 'WhatsApp']
const SLOT_TIMES = [
  '9:15 AM', '10:00 AM', '10:45 AM', '11:30 AM', '12:15 PM', '1:00 PM',
  '2:30 PM', '3:15 PM', '4:00 PM', '5:30 PM', '6:15 PM', '7:00 PM',
]
const DAYS = [DAY_TODAY, DAY_NEXT, DAY_AFTER]
const STYLIST_NAMES = stylists.map((s) => s.name.split(' ')[0].toUpperCase())

// Small LCG — deterministic stand-in for Math.random().
const seeded = (seed) => () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff
  return seed / 0x7fffffff
}

const fillerAppointments = []
let fillerN = 0

kanbanColumns.forEach((col, ci) => {
  const existing = baseAppointments.filter((a) => a.column === col.key).length
  const rand = seeded(ci * 7919 + 137)

  for (let i = existing; i < MIN_PER_COLUMN; i++) {
    fillerN++
    const pick = (arr) => arr[Math.floor(rand() * arr.length) % arr.length]
    const client = pick(customers)
    const date = DAYS[(ci + i) % DAYS.length]
    const time = SLOT_TIMES[(ci * 3 + i) % SLOT_TIMES.length]
    const count = rand() > 0.72 ? 2 : 1

    // DANGEROUS holds the two ways the books and the floor drift apart, alternating:
    // money taken while the work still reads In Progress, and work finished with
    // nothing collected.
    const issue = col.key !== 'dangerous' ? null
      : i % 2 === 0 ? 'paid-not-completed' : 'done-not-paid'
    const status = issue === 'paid-not-completed' ? 'In Progress'
      : issue === 'done-not-paid' ? 'Completed'
        : SERVICE_STATUS[col.key] ?? 'Scheduled'

    const items = Array.from({ length: count }, (_, k) => {
      const sv = pick(services)
      return {
        name: sv.name,
        category: sv.category,
        stylist: pick(STYLIST_NAMES),
        date,
        time: SLOT_TIMES[(ci * 3 + i + k) % SLOT_TIMES.length],
        duration: sv.duration,
        price: sv.price,
        status,
      }
    })

    fillerAppointments.push({
      id: `APT-2026073${String(100000 + fillerN * 37).padStart(9, '0')}-${String(11 + (fillerN % 88)).padStart(2, '0')}`,
      time,
      date,
      source: pick(SOURCES),
      // Only a settled appointment carries a bill.
      billed: issue
        ? issue === 'paid-not-completed'
        : BILLED_COLUMNS.includes(col.key) || (col.key === 'completed' && i % 2 === 0),
      customer: client.name,
      phone: client.phone,
      priority: rand() > 0.82 ? 'High' : null,
      column: col.key,
      issue,
      services: items,
    })
  }
})

// Money already collected against an appointment, and therefore refundable: the whole
// amount once it is FULL ADVANCE or PAID, ~40% while it is only a PARTIAL ADVANCE,
// nothing anywhere else. This is what the Payments screen can hand back.
const collectedOn = (a) => {
  const total = a.services.reduce((s, sv) => s + (Number(sv.price) || 0), 0)
  if (a.column === 'dangerous') return a.billed ? total : 0
  if (a.column === 'fulladvance' || a.column === 'paid') return total
  if (a.column === 'partialadvance' || a.column === 'partialpaid') return Math.round(total * 0.4)
  return 0
}

// The document each money state leaves behind: a receipt for an advance, a refund
// note, a bill. Numbers are derived from the appointment id so they stay stable.
const DOC_REF = {
  partialadvance: { prefix: 'RCPT/', digits: 7 },
  fulladvance: { prefix: 'RCPT/', digits: 7 },
  refunded: { prefix: 'RFND', digits: 5 },
  partialpaid: { prefix: 'BILL', digits: 6 },
  paid: { prefix: 'BILL', digits: 6 },
}
const docRefFor = (a) => {
  const d = DOC_REF[a.column]
  if (!d) return null
  return `${d.prefix}${a.id.replace(/\D/g, '').slice(-d.digits)}-25-2026`
}

export const appointments = [...baseAppointments, ...fillerAppointments].map((a) => ({
  ...a,
  paidAmount: collectedOn(a),
  refundedAmount: 0,
  docRef: docRefFor(a),
}))

// A rescheduled booking and the appointment that replaced it: linked both ways and
// carrying the same service, each at its own slot. No-ops if either id is missing.
const linkReschedule = (oldId, newId) => {
  const oldAppt = appointments.find((a) => a.id === oldId)
  const newAppt = appointments.find((a) => a.id === newId)
  if (!oldAppt || !newAppt) return
  oldAppt.newApptId = newId
  newAppt.oldApptId = oldId
  newAppt.services = oldAppt.services.map((s) => ({
    ...s,
    date: newAppt.date,
    time: newAppt.time,
    status: newAppt.services[0]?.status ?? s.status,
  }))
}

linkReschedule('APT-2026073000101850-61', 'APT-2026073000100111-14')

// Per-column visual accent classes.
export const accentClasses = {
  indigo: { head: 'bg-indigo-100 text-indigo-800 border-indigo-400', body: 'bg-indigo-50/60 border-indigo-300', badge: 'bg-indigo-500', bar: 'bg-indigo-400', hex: '#818cf8' },
  sky: { head: 'bg-sky-100 text-sky-800 border-sky-400', body: 'bg-sky-50/60 border-sky-300', badge: 'bg-sky-500', bar: 'bg-sky-400', hex: '#38bdf8' },
  amber: { head: 'bg-amber-100 text-amber-800 border-amber-400', body: 'bg-amber-50/60 border-amber-300', badge: 'bg-amber-500', bar: 'bg-amber-400', hex: '#fbbf24' },
  emerald: { head: 'bg-emerald-100 text-emerald-800 border-emerald-400', body: 'bg-emerald-50/60 border-emerald-300', badge: 'bg-emerald-500', bar: 'bg-emerald-400', hex: '#34d399' },
  // DRAFT — gray rgb(156,163,175)
  gray: { head: 'bg-[#9ca3af26] text-[#6b7280] border-[#9ca3af]', body: 'bg-[#9ca3af14] border-[#9ca3af44]', badge: 'bg-[#9ca3af]', bar: 'bg-[#9ca3af]', hex: '#9ca3af' },
  // WAITING — orange rgb(249,115,22)
  lightyellow: { head: 'bg-[#f9731626] text-[#c2410c] border-[#f97316]', body: 'bg-[#f9731614] border-[#f9731644]', badge: 'bg-[#f97316]', bar: 'bg-[#f97316]', hex: '#f97316' },
  // RESCHEDULED — magenta rgb(156,39,176)
  magenta: { head: 'bg-[#9c27b026] text-[#9c27b0] border-[#9c27b0]', body: 'bg-[#9c27b014] border-[#9c27b044]', badge: 'bg-[#9c27b0]', bar: 'bg-[#9c27b0]', hex: '#9c27b0' },
  // CANCELLED — red rgb(239,68,68)
  red: { head: 'bg-[#ef444426] text-[#b91c1c] border-[#ef4444]', body: 'bg-[#ef444414] border-[#ef444444]', badge: 'bg-[#ef4444]', bar: 'bg-[#ef4444]', hex: '#ef4444' },
  // NO SHOW — brown rgb(121,85,72)
  brown: { head: 'bg-[#79554826] text-[#795548] border-[#795548]', body: 'bg-[#79554814] border-[#79554844]', badge: 'bg-[#795548]', bar: 'bg-[#795548]', hex: '#795548' },
  // PARTIAL ADVANCE — amber rgb(245,158,11)
  yellow: { head: 'bg-[#f59e0b26] text-[#b45309] border-[#f59e0b]', body: 'bg-[#f59e0b14] border-[#f59e0b44]', badge: 'bg-[#f59e0b]', bar: 'bg-[#f59e0b]', hex: '#f59e0b' },
  // FULL ADVANCE — emerald rgb(16,185,129)
  green: { head: 'bg-[#10b98126] text-[#047857] border-[#10b981]', body: 'bg-[#10b98114] border-[#10b98144]', badge: 'bg-[#10b981]', bar: 'bg-[#10b981]', hex: '#10b981' },
  // PARTIAL PAID — cyan rgb(6,182,212)
  cyan: { head: 'bg-[#06b6d426] text-[#0e7490] border-[#06b6d4]', body: 'bg-[#06b6d414] border-[#06b6d444]', badge: 'bg-[#06b6d4]', bar: 'bg-[#06b6d4]', hex: '#06b6d4' },
  // PAID — teal rgb(13,148,136)
  teal: { head: 'bg-[#0d948826] text-[#115e59] border-[#0d9488]', body: 'bg-[#0d948814] border-[#0d948844]', badge: 'bg-[#0d9488]', bar: 'bg-[#0d9488]', hex: '#0d9488' },
  // DANGEROUS — deep red rgb(220,38,38); darker than CANCELLED so the two still read apart
  danger: { head: 'bg-[#dc262633] text-[#991b1b] border-[#dc2626]', body: 'bg-[#dc26261f] border-[#dc262666]', badge: 'bg-[#dc2626]', bar: 'bg-[#dc2626]', hex: '#dc2626' },
  // REFUNDED — pink rgb(236,72,153)
  pink: { head: 'bg-[#ec489926] text-[#be185d] border-[#ec4899]', body: 'bg-[#ec489914] border-[#ec489944]', badge: 'bg-[#ec4899]', bar: 'bg-[#ec4899]', hex: '#ec4899' },
}



export const serviceStatuses = ['Draft', 'Scheduled', 'Rescheduled', 'Confirmed', 'Waiting', 'In Progress', 'Completed', 'Partial-Paid', 'Refunded', 'No Show', 'Cancelled']

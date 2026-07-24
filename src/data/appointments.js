// Dummy appointments for the Kanban board.
// column: scheduled | checkedin | inprogress | completed

// One unified set of status columns — each rendered exactly once.
// Order = 4 per row: [Scheduled, Checked-In, In Progress, Completed]
//                    [Draft, Waiting, Rescheduled, Partial Advance]
//                    [Cancelled, Full Advance, No Show]
export const kanbanColumns = [
  { key: 'scheduled', title: 'SCHEDULED', accent: 'indigo' },
  { key: 'checkedin', title: 'CHECKED-IN', accent: 'sky' },
  { key: 'inprogress', title: 'IN PROGRESS', accent: 'amber' },
  { key: 'completed', title: 'COMPLETED', accent: 'emerald' },
  { key: 'draft', title: 'DRAFT', accent: 'gray' },
  { key: 'waiting', title: 'WAITING', accent: 'lightyellow' },
  { key: 'rescheduled', title: 'RESCHEDULED', accent: 'magenta' },
  { key: 'partialadvance', title: 'PARTIAL ADVANCE', accent: 'yellow' },
  { key: 'cancelled', title: 'CANCELLED', accent: 'red' },
  { key: 'fulladvance', title: 'FULL ADVANCE', accent: 'green' },
  { key: 'noshow', title: 'NO SHOW', accent: 'brown' },
]

export const appointments = [
  {
    id: 'APT-20260723165418341-63',
    time: '4:52 PM',
    date: '24 Jul 2026',
    source: 'Walk-in',
    billed: false,
    group: true,
    clients: 0,
    customer: 'Group',
    phone: '',
    priority: null,
    column: 'scheduled',
    services: [
      { name: 'Blow Dry & Styling', category: 'Hair', stylist: '', date: '24 Jul 2026', time: '4:52 PM', duration: 45, price: 440, status: 'Scheduled' },
      { name: 'Facial - Basic Clean-Up', category: 'Skin Care', stylist: '', date: '24 Jul 2026', time: '5:37 PM', duration: 60, price: 900, status: 'Scheduled' },
    ],
  },
  {
    id: 'APT-20260724090012045-11',
    time: '9:00 AM',
    date: '24 Jul 2026',
    source: 'Phone',
    billed: false,
    customer: 'Ananya Gupta',
    phone: '9876543210',
    priority: null,
    column: 'scheduled',
    services: [
      { name: 'Women Ombrè Highlights', category: 'Hair', stylist: 'PRIYA', date: '24 Jul 2026', time: '9:00 AM', duration: 120, price: 7000, status: 'Scheduled' },
    ],
  },
  {
    id: 'APT-20260724103000771-27',
    time: '10:30 AM',
    date: '24 Jul 2026',
    source: 'Online',
    billed: false,
    customer: 'Priya Sharma',
    phone: '9834567812',
    priority: null,
    column: 'scheduled',
    services: [
      { name: 'Female Airbrush Party', category: 'Makeup', stylist: 'SNEHA', date: '24 Jul 2026', time: '10:30 AM', duration: 50, price: 6000, status: 'Scheduled' },
    ],
  },
  {
    id: 'APT-20260721134354107-63',
    time: '11:06 AM',
    date: '24 Jul 2026',
    source: 'Walk-in',
    billed: false,
    customer: 'Seema',
    phone: '9845347490',
    priority: null,
    column: 'checkedin',
    services: [
      { name: 'Blow Dry & Styling', category: 'Hair', stylist: 'POONAM', date: '24 Jul 2026', time: '11:06 AM', duration: 45, price: 440, status: 'Scheduled' },
    ],
  },
  {
    id: 'APT-20260724115500332-08',
    time: '11:45 AM',
    date: '24 Jul 2026',
    source: 'Walk-in',
    billed: false,
    customer: 'Karan Mehta',
    phone: '9654321870',
    priority: null,
    column: 'checkedin',
    services: [
      { name: 'Men Express Color Treatment', category: 'Hair', stylist: 'RAHUL', date: '24 Jul 2026', time: '11:45 AM', duration: 30, price: 3000, status: 'Scheduled' },
    ],
  },
  {
    id: 'APT-20260724120000556-14',
    time: '12:00 PM',
    date: '24 Jul 2026',
    source: 'Phone',
    billed: false,
    customer: 'Divya Iyer',
    phone: '9900456781',
    priority: null,
    column: 'checkedin',
    services: [
      { name: 'Female Body Polishing', category: 'Skin Care', stylist: 'SNEHA', date: '24 Jul 2026', time: '12:00 PM', duration: 60, price: 5000, status: 'Scheduled' },
    ],
  },
  {
    id: 'APT-20260720121828678-63',
    time: '3:00 PM',
    date: '24 Jul 2026',
    source: 'Walk-in',
    billed: false,
    customer: 'Acharya Manoj Kumar',
    phone: '9871425920',
    priority: 'High',
    column: 'inprogress',
    services: [
      { name: 'Blow Dry & Styling', category: 'Hair', stylist: 'POONAM', date: '24 Jul 2026', time: '3:00 PM', duration: 45, price: 440, status: 'In Progress' },
    ],
  },
  {
    id: 'APT-20260724140000119-42',
    time: '2:00 PM',
    date: '24 Jul 2026',
    source: 'Online',
    billed: false,
    customer: 'Rajat Katiyar',
    phone: '7380785008',
    priority: null,
    column: 'inprogress',
    services: [
      { name: 'Women Straight Hair Therapy', category: 'Hair', stylist: 'AARAV', date: '24 Jul 2026', time: '2:00 PM', duration: 180, price: 8000, status: 'In Progress' },
    ],
  },
  {
    id: 'APT-20260720121828999-63',
    time: '3:00 PM',
    date: '24 Jul 2026',
    source: 'Walk-in',
    billed: true,
    customer: 'Acharya Manoj Kumar',
    phone: '9871425920',
    priority: 'High',
    column: 'completed',
    services: [
      { name: 'Blow Dry & Styling', category: 'Hair', stylist: 'POONAM', date: '24 Jul 2026', time: '3:00 PM', duration: 45, price: 440, status: 'Completed' },
    ],
  },
  {
    id: 'APT-20260724130000201-51', time: '1:00 PM', date: '24 Jul 2026', source: 'Online', billed: false,
    customer: 'Imran Ansari', phone: '9700456123', priority: null, column: 'draft',
    services: [{ name: 'Men Airbrush Make Up', category: 'Makeup', stylist: 'IMRAN', date: '24 Jul 2026', time: '1:00 PM', duration: 160, price: 7000, status: 'Scheduled' }],
  },
  {
    id: 'APT-20260724100000202-52', time: '10:00 AM', date: '24 Jul 2026', source: 'Walk-in', billed: false,
    customer: 'Sneha Reddy', phone: '9812309876', priority: null, column: 'waiting',
    services: [{ name: 'Facial - Basic Clean-Up', category: 'Skin Care', stylist: 'PRIYA', date: '24 Jul 2026', time: '10:00 AM', duration: 60, price: 900, status: 'Scheduled' }],
  },
  {
    id: 'APT-20260724160000203-53', time: '4:00 PM', date: '25 Jul 2026', source: 'Phone', billed: false,
    customer: 'Vikram Singh', phone: '9812345678', priority: null, column: 'rescheduled',
    services: [{ name: 'Beard Grooming & Trim', category: 'Grooming', stylist: 'RAHUL', date: '25 Jul 2026', time: '4:00 PM', duration: 20, price: 250, status: 'Rescheduled' }],
  },
  {
    id: 'APT-20260724090000204-54', time: '9:30 AM', date: '24 Jul 2026', source: 'Online', billed: false,
    customer: 'Meera Nair', phone: '9900112233', priority: null, column: 'cancelled',
    services: [{ name: 'Female Body Polishing', category: 'Skin Care', stylist: 'SNEHA', date: '24 Jul 2026', time: '9:30 AM', duration: 60, price: 5000, status: 'Cancelled' }],
  },
  {
    id: 'APT-20260724110000205-55', time: '11:00 AM', date: '24 Jul 2026', source: 'Walk-in', billed: false,
    customer: 'Karan Mehta', phone: '9654321870', priority: null, column: 'noshow',
    services: [{ name: 'Men Express Color Treatment', category: 'Hair', stylist: 'RAHUL', date: '24 Jul 2026', time: '11:00 AM', duration: 30, price: 3000, status: 'No Show' }],
  },
  {
    id: 'APT-20260724143000206-56', time: '2:30 PM', date: '26 Jul 2026', source: 'Online', billed: true,
    customer: 'Priya Sharma', phone: '9834567812', priority: null, column: 'partialadvance',
    services: [{ name: 'Female Airbrush Party', category: 'Makeup', stylist: 'SNEHA', date: '26 Jul 2026', time: '2:30 PM', duration: 50, price: 6000, status: 'Confirmed' }],
  },
  {
    id: 'APT-20260724170000207-57', time: '5:00 PM', date: '26 Jul 2026', source: 'Phone', billed: true,
    customer: 'Divya Iyer', phone: '9900456781', priority: null, column: 'fulladvance',
    services: [{ name: 'Women Straight Hair Therapy', category: 'Hair', stylist: 'AARAV', date: '26 Jul 2026', time: '5:00 PM', duration: 180, price: 8000, status: 'Confirmed' }],
  },
]

// Per-column visual accent classes.
export const accentClasses = {
  indigo: { head: 'bg-indigo-100 text-indigo-800 border-indigo-400', body: 'bg-indigo-50/60 border-indigo-300', badge: 'bg-indigo-500', bar: 'bg-indigo-400' },
  sky: { head: 'bg-sky-100 text-sky-800 border-sky-400', body: 'bg-sky-50/60 border-sky-300', badge: 'bg-sky-500', bar: 'bg-sky-400' },
  amber: { head: 'bg-amber-100 text-amber-800 border-amber-400', body: 'bg-amber-50/60 border-amber-300', badge: 'bg-amber-500', bar: 'bg-amber-400' },
  emerald: { head: 'bg-emerald-100 text-emerald-800 border-emerald-400', body: 'bg-emerald-50/60 border-emerald-300', badge: 'bg-emerald-500', bar: 'bg-emerald-400' },
  // DRAFT — gray rgb(156,163,175)
  gray: { head: 'bg-[#9ca3af26] text-[#6b7280] border-[#9ca3af]', body: 'bg-[#9ca3af14] border-[#9ca3af44]', badge: 'bg-[#9ca3af]', bar: 'bg-[#9ca3af]' },
  // WAITING — orange rgb(249,115,22)
  lightyellow: { head: 'bg-[#f9731626] text-[#c2410c] border-[#f97316]', body: 'bg-[#f9731614] border-[#f9731644]', badge: 'bg-[#f97316]', bar: 'bg-[#f97316]' },
  // RESCHEDULED — magenta rgb(156,39,176)
  magenta: { head: 'bg-[#9c27b026] text-[#9c27b0] border-[#9c27b0]', body: 'bg-[#9c27b014] border-[#9c27b044]', badge: 'bg-[#9c27b0]', bar: 'bg-[#9c27b0]' },
  // CANCELLED — red rgb(239,68,68)
  red: { head: 'bg-[#ef444426] text-[#b91c1c] border-[#ef4444]', body: 'bg-[#ef444414] border-[#ef444444]', badge: 'bg-[#ef4444]', bar: 'bg-[#ef4444]' },
  // NO SHOW — brown rgb(121,85,72)
  brown: { head: 'bg-[#79554826] text-[#795548] border-[#795548]', body: 'bg-[#79554814] border-[#79554844]', badge: 'bg-[#795548]', bar: 'bg-[#795548]' },
  // PARTIAL ADVANCE — amber rgb(245,158,11)
  yellow: { head: 'bg-[#f59e0b26] text-[#b45309] border-[#f59e0b]', body: 'bg-[#f59e0b14] border-[#f59e0b44]', badge: 'bg-[#f59e0b]', bar: 'bg-[#f59e0b]' },
  // FULL ADVANCE — emerald rgb(16,185,129)
  green: { head: 'bg-[#10b98126] text-[#047857] border-[#10b981]', body: 'bg-[#10b98114] border-[#10b98144]', badge: 'bg-[#10b981]', bar: 'bg-[#10b981]' },
}



export const serviceStatuses = ['Scheduled','Rescheduled', 'Confirmed', 'In Progress', 'Completed', 'No Show', 'Cancelled']

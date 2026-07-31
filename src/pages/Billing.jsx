import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import NewBillModal from '../components/NewBillModal'
import {
  IconSearch, IconCart, IconEye, IconEdit, IconTrash,
  IconReceipt, IconMail, IconMessage, IconArrowDown, IconArrowUp, IconClock, IconChevron
} from '../components/Icons'

const mockBills = [
  {
    id: 'BILL-20260610165216-73', customer: 'Rajat Katiyar', phone: '7435150000', apptId: '-',
    date: '10 Jun 2026', time: '04:52 PM', subTotal: 420, totalAmount: -247.80, discount: 672, tax: 4.20,
    netPayable: -248.00, received: 0, pending: 0, advance: 0, paymentMode: '-', createdBy: 'Hemant Arora',
    status: 'Pending', type: 'Sale'
  },
  {
    id: 'BILL-20260611130038-73', customer: 'Mohd Sazid', phone: '7678129912', apptId: 'APT-20260611125943449-73',
    date: '11 Jun 2026', time: '01:00 PM', subTotal: 4880, totalAmount: 4415.36, discount: 528, tax: 63.36,
    netPayable: 4415.00, received: 40, pending: 0, advance: 0, paymentMode: '-', createdBy: 'Mohd Sazid Khan',
    status: 'Pending', type: 'Sale'
  },
  {
    id: 'BILL-20260611132438-73', customer: 'Mohd Sazid', phone: '7678129912', apptId: '-',
    date: '11 Jun 2026', time: '01:24 PM', subTotal: 420, totalAmount: 172.20, discount: 252, tax: 4.20,
    netPayable: 172.00, received: 172, pending: 0, advance: 0, paymentMode: 'Cash', createdBy: 'Rajat Singh',
    status: 'Paid', type: 'Sale'
  },
  {
    id: 'BILL-20260620105550-73', customer: 'Mohd Sazid', phone: '7678129912', apptId: 'APT-20260611125943449-73',
    date: '20 Jun 2026', time: '10:55 AM', subTotal: 4880, totalAmount: 4415.36, discount: 528, tax: 63.36,
    netPayable: 4415.00, received: 4415, pending: 0, advance: 0, paymentMode: 'UPI', createdBy: 'Rajat Singh',
    status: 'Paid', type: 'Sale'
  },
  {
    id: 'BILL-20260620105743-73', customer: 'Anshu Saini', phone: '8528174444', apptId: 'APT-20260617103907215-73',
    date: '20 Jun 2026', time: '10:57 AM', subTotal: 210000, totalAmount: 84720, discount: 150000, tax: 2720,
    netPayable: 84720, received: 84720, pending: 0, advance: 0, paymentMode: 'Cash', createdBy: 'Rajat Singh',
    status: 'Paid', type: 'Sale'
  },
  {
    id: 'BILL-20260620111447-73', customer: 'Mohd Sazid', phone: '7678129912', apptId: 'APT-20260615142551542-73',
    date: '20 Jun 2026', time: '11:14 AM', subTotal: 4880, totalAmount: 1038.40, discount: 0, tax: 158.40,
    netPayable: 1038.00, received: 1038, pending: 0, advance: 0, paymentMode: 'Cash', createdBy: 'Rajat Singh',
    status: 'Paid', type: 'Sale'
  },
  {
    id: 'BILL-20260621093015-73', customer: 'Priya Sharma', phone: '9834567812', apptId: 'APT-20260621092210114-73',
    date: '21 Jun 2026', time: '09:30 AM', subTotal: 1340, totalAmount: 1265.20, discount: 134, tax: 59.20,
    netPayable: 1265.00, received: 1265, pending: 0, advance: 0, paymentMode: 'UPI', createdBy: 'Rajat Singh',
    status: 'Paid', type: 'Sale'
  },
  {
    id: 'BILL-20260621141122-73', customer: 'Vikram Singh', phone: '9812345678', apptId: '-',
    date: '21 Jun 2026', time: '02:11 PM', subTotal: 900, totalAmount: 855.00, discount: 90, tax: 45.00,
    netPayable: 855.00, received: 400, pending: 455, advance: 0, paymentMode: 'Cash', createdBy: 'Hemant Arora',
    status: 'Partial', type: 'Sale'
  },
  {
    id: 'BILL-20260622101540-73', customer: 'Meera Nair', phone: '9900112233', apptId: 'APT-20260622100012045-73',
    date: '22 Jun 2026', time: '10:15 AM', subTotal: 8000, totalAmount: 7600.00, discount: 800, tax: 400.00,
    netPayable: 7600.00, received: 7600, pending: 0, advance: 2000, paymentMode: 'Card', createdBy: 'Mohd Sazid Khan',
    status: 'Paid', type: 'Sale'
  },
  {
    id: 'BILL-20260622163050-73', customer: 'Anshu Saini', phone: '8528174444', apptId: '-',
    date: '22 Jun 2026', time: '04:30 PM', subTotal: 2500, totalAmount: 2375.00, discount: 250, tax: 125.00,
    netPayable: 2375.00, received: 0, pending: 2375, advance: 0, paymentMode: '-', createdBy: 'Rajat Singh',
    status: 'Pending', type: 'Sale'
  },
  {
    id: 'BILL-20260623112233-73', customer: 'Karan Mehta', phone: '9654321870', apptId: 'APT-20260623110500332-73',
    date: '23 Jun 2026', time: '11:22 AM', subTotal: 3000, totalAmount: 2850.00, discount: 300, tax: 150.00,
    netPayable: 2850.00, received: 2850, pending: 0, advance: 0, paymentMode: 'UPI', createdBy: 'Hemant Arora',
    status: 'Paid', type: 'Sale'
  },
  {
    id: 'BILL-20260623175814-73', customer: 'Seema', phone: '9845347490', apptId: '-',
    date: '23 Jun 2026', time: '05:58 PM', subTotal: 5000, totalAmount: 4750.00, discount: 500, tax: 250.00,
    netPayable: 4750.00, received: 4750, pending: 0, advance: 0, paymentMode: 'Cash', createdBy: 'Rajat Singh',
    status: 'Paid', type: 'Sale'
  },
  {
    id: 'BILL-20260624094500-73', customer: 'Ananya Gupta', phone: '9876543210', apptId: 'APT-20260624090012045-73',
    date: '24 Jun 2026', time: '09:45 AM', subTotal: 12555, totalAmount: 11927.25, discount: 1255.50, tax: 627.75,
    netPayable: 11927.00, received: 6000, pending: 5927, advance: 0, paymentMode: 'Card', createdBy: 'Mohd Sazid Khan',
    status: 'Partial', type: 'Sale'
  },
  {
    id: 'BILL-20260624131020-73', customer: 'Rajat Katiyar', phone: '7380785008', apptId: '-',
    date: '24 Jun 2026', time: '01:10 PM', subTotal: 650, totalAmount: 617.50, discount: 65, tax: 32.50,
    netPayable: 617.00, received: 617, pending: 0, advance: 0, paymentMode: 'UPI', createdBy: 'Rajat Singh',
    status: 'Paid', type: 'Sale'
  },
  {
    id: 'BILL-20260625102845-73', customer: 'Acharya Manoj Kumar', phone: '9871425920', apptId: 'APT-20260625101828678-73',
    date: '25 Jun 2026', time: '10:28 AM', subTotal: 440, totalAmount: 418.00, discount: 44, tax: 22.00,
    netPayable: 418.00, received: 0, pending: 418, advance: 0, paymentMode: '-', createdBy: 'Hemant Arora',
    status: 'Pending', type: 'Sale'
  },
  {
    id: 'BILL-20260625154210-73', customer: 'A Chaudhary', phone: '8697551059', apptId: '-',
    date: '25 Jun 2026', time: '03:42 PM', subTotal: 7340, totalAmount: 6973.00, discount: 734, tax: 367.00,
    netPayable: 6973.00, received: 6973, pending: 0, advance: 0, paymentMode: 'Card', createdBy: 'Rajat Singh',
    status: 'Paid', type: 'Sale'
  },
  {
    id: 'BILL-20260626111500-73', customer: 'Imran Ansari', phone: '9700456123', apptId: 'APT-20260626110101184-73',
    date: '26 Jun 2026', time: '11:15 AM', subTotal: 345, totalAmount: 327.75, discount: 34.50, tax: 17.25,
    netPayable: 328.00, received: 328, pending: 0, advance: 0, paymentMode: 'Cash', createdBy: 'Hemant Arora',
    status: 'Paid', type: 'Sale'
  },
  {
    id: 'BILL-20260626182030-73', customer: 'Neha Rajput', phone: '9123456780', apptId: '-',
    date: '26 Jun 2026', time: '06:20 PM', subTotal: 1500, totalAmount: 1425.00, discount: 150, tax: 75.00,
    netPayable: 1425.00, received: 0, pending: 0, advance: 0, paymentMode: '-', createdBy: 'Rajat Singh',
    status: 'Canceled', type: 'Sale'
  },
  {
    id: 'BILL-20260627100812-73', customer: 'Mohd Sazid', phone: '7678129912', apptId: 'APT-20260627095500119-73',
    date: '27 Jun 2026', time: '10:08 AM', subTotal: 9500, totalAmount: 9025.00, discount: 950, tax: 475.00,
    netPayable: 9025.00, received: 9025, pending: 0, advance: 3000, paymentMode: 'UPI', createdBy: 'Mohd Sazid Khan',
    status: 'Paid', type: 'Sale'
  },
  {
    id: 'BILL-20260627145533-73', customer: 'Priya Sharma', phone: '9834567812', apptId: '-',
    date: '27 Jun 2026', time: '02:55 PM', subTotal: 2900, totalAmount: 2755.00, discount: 290, tax: 145.00,
    netPayable: 2755.00, received: 1000, pending: 1755, advance: 0, paymentMode: 'Cash', createdBy: 'Rajat Singh',
    status: 'Partial', type: 'Sale'
  },
  {
    id: 'BILL-20260628093344-73', customer: 'Karan Mehta', phone: '9654321870', apptId: '-',
    date: '28 Jun 2026', time: '09:33 AM', subTotal: 500, totalAmount: 475.00, discount: 50, tax: 25.00,
    netPayable: 475.00, received: 475, pending: 0, advance: 0, paymentMode: 'Cash', createdBy: 'Hemant Arora',
    status: 'Paid', type: 'Sale'
  },
  {
    id: 'BILL-20260628160718-73', customer: 'Meera Nair', phone: '9900112233', apptId: 'APT-20260628155012045-73',
    date: '28 Jun 2026', time: '04:07 PM', subTotal: 30000, totalAmount: 28500.00, discount: 3000, tax: 1500.00,
    netPayable: 28500.00, received: 0, pending: 28500, advance: 0, paymentMode: '-', createdBy: 'Mohd Sazid Khan',
    status: 'Pending', type: 'Sale'
  },
  {
    id: 'BILL-20260629104925-73', customer: 'Vikram Singh', phone: '9812345678', apptId: 'APT-20260629100200114-73',
    date: '29 Jun 2026', time: '10:49 AM', subTotal: 1200, totalAmount: 1140.00, discount: 120, tax: 60.00,
    netPayable: 1140.00, received: 1140, pending: 0, advance: 0, paymentMode: 'UPI', createdBy: 'Rajat Singh',
    status: 'Paid', type: 'Sale'
  },
  {
    id: 'BILL-20260629172640-73', customer: 'Anshu Saini', phone: '8528174444', apptId: '-',
    date: '29 Jun 2026', time: '05:26 PM', subTotal: 8765, totalAmount: 8326.75, discount: 876.50, tax: 438.25,
    netPayable: 8327.00, received: 8327, pending: 0, advance: 0, paymentMode: 'Card', createdBy: 'Hemant Arora',
    status: 'Paid', type: 'Sale'
  },
  {
    id: 'BILL-20260630112055-73', customer: 'Seema', phone: '9845347490', apptId: 'APT-20260630105500288-73',
    date: '30 Jun 2026', time: '11:20 AM', subTotal: 5555, totalAmount: 5277.25, discount: 555.50, tax: 277.75,
    netPayable: 5277.00, received: 0, pending: 5277, advance: 1000, paymentMode: '-', createdBy: 'Rajat Singh',
    status: 'Pending', type: 'Sale'
  },
  {
    id: 'BILL-20260630181402-73', customer: 'Rajat Katiyar', phone: '7380785008', apptId: '-',
    date: '30 Jun 2026', time: '06:14 PM', subTotal: 2400, totalAmount: 2280.00, discount: 240, tax: 120.00,
    netPayable: 2280.00, received: 2280, pending: 0, advance: 0, paymentMode: 'UPI', createdBy: 'Mohd Sazid Khan',
    status: 'Paid', type: 'Sale'
  },
  {
    id: 'BILL-20260701095310-73', customer: 'Ananya Gupta', phone: '9876543210', apptId: '-',
    date: '01 Jul 2026', time: '09:53 AM', subTotal: 3400, totalAmount: 3230.00, discount: 340, tax: 170.00,
    netPayable: 3230.00, received: 0, pending: 0, advance: 0, paymentMode: '-', createdBy: 'Hemant Arora',
    status: 'Canceled', type: 'Sale'
  },
]

const currency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(val || 0)

const BILLS_PER_PAGE = 10

// "21 Jun 2026" -> Date, so the range picker can compare against it.
const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
const billDate = (s) => {
  const [d, m, y] = String(s).split(' ')
  return new Date(Number(y), MONTHS[m] ?? 0, Number(d))
}

// Page buttons around the current page: 1 … 4 5 6 … 12, collapsing once there are
// more pages than fit on the bar.
const pageNumbers = (page, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const first = Math.max(2, page - 1)
  const last = Math.min(total - 1, page + 1)
  const out = [1]
  if (first > 2) out.push('…')
  for (let i = first; i <= last; i++) out.push(i)
  if (last < total - 1) out.push('…')
  out.push(total)
  return out
}

export default function Billing() {
  const [newBillOpen, setNewBillOpen] = useState(false)
  const [billAppt, setBillAppt] = useState(null) // appointment handed over by "Bill Now"
  const [toast, setToast] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(t)
  }, [toast])

  // Arriving from a Kanban card's "Bill Now" → Yes: open the drawer on that appointment.
  // The state is cleared straight away so a reload doesn't re-open it.
  useEffect(() => {
    const appt = location.state?.billAppointment
    if (!appt) return
    setBillAppt(appt)
    setNewBillOpen(true)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.state, location.pathname, navigate])
  const [activeTab, setActiveTab] = useState('All')
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  // Chrome/Edge drop the calendar on showPicker(); elsewhere the click on the field
  // is enough on its own, so a failure here is not worth reporting.
  const openPicker = (e) => {
    try { e.currentTarget.showPicker?.() } catch { /* unsupported — native behaviour stands */ }
  }

  // Counted off the bills themselves, so the chips can't disagree with the table.
  const tabs = useMemo(() => {
    const of = (status) => mockBills.filter((b) => b.status === status).length
    return [
      { label: 'All', count: mockBills.length },
      { label: 'Paid', count: of('Paid') },
      { label: 'Pending', count: of('Pending') },
      { label: 'Partial', count: of('Partial') },
      { label: 'Canceled', count: of('Canceled') },
    ]
  }, [])

  // Status tab, free-text search and the date range, applied together.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const from = startDate ? new Date(startDate) : null
    const to = endDate ? new Date(endDate) : null
    return mockBills.filter((b) => {
      if (activeTab !== 'All' && b.status !== activeTab) return false
      if (q && !`${b.id} ${b.customer} ${b.phone}`.toLowerCase().includes(q)) return false
      if (from || to) {
        const d = billDate(b.date)
        if (from && d < from) return false
        if (to && d > to) return false
      }
      return true
    })
  }, [activeTab, query, startDate, endDate])

  const pageCount = Math.max(1, Math.ceil(filtered.length / BILLS_PER_PAGE))
  const currentPage = Math.min(page, pageCount)
  const firstOnPage = (currentPage - 1) * BILLS_PER_PAGE
  const pageBills = filtered.slice(firstOnPage, firstOnPage + BILLS_PER_PAGE)

  // Any change to what's being filtered starts again from page one.
  useEffect(() => { setPage(1) }, [activeTab, query, startDate, endDate])

  return (
    <div className="-mx-6 -my-8 flex h-screen flex-col overflow-hidden bg-gray-50">
      <TopBar title={
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Kuexa &gt;</span>
          <span className="font-semibold text-gray-800">Billing</span>
        </div>
      } />

      {/* The page itself doesn't scroll — header, summary and filters keep their
          height and the bills table takes whatever is left. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-4">
        {/* Header */}
        <div className="mb-4 flex shrink-0 items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Billing History <span className="pl-2 text-sm text-gray-400">(Total Bills {mockBills.length})</span></h1>
            
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNewBillOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition-colors"
            >
              <IconCart width={16} height={16} /> New Bill
            </button>
          </div>
        </div>

        
        {/* Billing Summary Collapsible */}
        <div className="mb-4 shrink-0 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <button 
            onClick={() => setSummaryOpen(!summaryOpen)} 
            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {summaryOpen ? <IconArrowUp width={14} height={14} /> : <IconArrowDown width={14} height={14} />}
            Billing Summary
            <span className="ml-2 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{mockBills.length} bills</span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">₹-8,88,11,98,567.80</span>
          </button>
          
          {summaryOpen && (
            <div className="border-t border-gray-100 bg-gray-50/30 p-4 space-y-4">
              
              {/* Top Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <IconReceipt width={20} height={20} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Bills</div>
                    <div className="text-xl font-bold text-indigo-600">{mockBills.length}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                    <span className="font-bold text-lg">₹</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</div>
                    <div className="text-xl font-bold text-sky-600">-8,88,11,98,567.80</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <span className="font-bold text-lg">✓</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Paid</div>
                    <div className="text-xl font-bold text-emerald-600">78</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <IconClock width={20} height={20} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pending / Partial</div>
                    <div className="text-xl font-bold text-amber-600">39</div>
                  </div>
                </div>
              </div>

              {/* Payment Mode Breakdown */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-4 text-xs font-semibold text-gray-800 uppercase tracking-wider">Payment Mode Breakdown</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-2 text-emerald-600"><span className="h-1 w-3 bg-emerald-500 inline-block rounded"></span> Cash</span>
                      <span className="text-gray-400">71 txn</span>
                    </div>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-emerald-600">
                      <span>₹16,49,147.75</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100"><div className="h-full w-[80%] rounded-full bg-emerald-500"></div></div>
                  </div>
                  
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-2 text-sky-600"><span className="h-1 w-3 bg-sky-500 inline-block rounded"></span> Adjustment</span>
                      <span className="text-gray-400">2 txn</span>
                    </div>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-sky-600">
                      <span>₹20,520.00</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100"><div className="h-full w-[5%] rounded-full bg-sky-500"></div></div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-2 text-indigo-600"><span className="h-1 w-3 bg-indigo-500 inline-block rounded"></span> Net Banking</span>
                      <span className="text-gray-400">1 txn</span>
                    </div>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-indigo-600">
                      <span>₹3,200.00</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100"><div className="h-full w-[2%] rounded-full bg-indigo-500"></div></div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-2 text-rose-500"><span className="h-1 w-3 bg-rose-500 inline-block rounded"></span> Refund</span>
                      <span className="text-gray-400">0 txn</span>
                    </div>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-rose-500">
                      <span>₹-9,505.20</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100"><div className="h-full w-[2%] rounded-full bg-rose-500"></div></div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-2 text-amber-500"><span className="h-1 w-3 bg-amber-500 inline-block rounded"></span> UPI</span>
                      <span className="text-gray-400">5 txn</span>
                    </div>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-amber-500">
                      <span>₹14,008.00</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100"><div className="h-full w-[5%] rounded-full bg-amber-500"></div></div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-2 text-slate-500"><span className="h-1 w-3 bg-slate-500 inline-block rounded"></span> Card</span>
                      <span className="text-gray-400">1 txn</span>
                    </div>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>₹2,705.00</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100"><div className="h-full w-[1%] rounded-full bg-slate-500"></div></div>
                  </div>
                </div>
              </div>

              {/* Today's Stats */}
              <div className="grid grid-cols-4 gap-4 border-t border-gray-100 pt-4 pb-2 text-center bg-transparent">
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Bills Today</div>
                  <div className="text-xl font-bold text-indigo-600">0</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Revenue</div>
                  <div className="text-xl font-bold text-emerald-500">₹0</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Outstanding</div>
                  <div className="text-xl font-bold text-amber-500">₹0</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Customers</div>
                  <div className="text-xl font-bold text-sky-500">0</div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Filters — search and date range on the left, status tabs on the right,
            all on one row. */}
        <div className="mb-3 flex shrink-0 flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <IconSearch width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bill number, customer name or phone..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-indigo-400 shadow-sm"
            />
          </div>
          {/* Date range — clicking anywhere on a field opens the picker, not just
              the calendar glyph. */}
          <div className="flex w-[310px] shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-500 shadow-sm focus-within:border-indigo-400">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onClick={openPicker}
              title="Start date"
              className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm text-gray-600 outline-none"
            />
            <span className="shrink-0 text-gray-400">→</span>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              onClick={openPicker}
              title="End date"
              className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm text-gray-600 outline-none"
            />
          </div>

          <div className="flex shrink-0 gap-1">
            {tabs.map(t => (
              <button
                key={t.label}
                onClick={() => setActiveTab(t.label)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${activeTab === t.label ? 'bg-indigo-600 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {t.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${activeTab === t.label ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table — fills the rest of the page and scrolls inside its own card, so
            there's no dead space under a short list. */}
        <div className="min-h-[220px] flex-1 overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-[11px] whitespace-nowrap">
            <thead className="sticky top-0 z-10 bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold">S.No</th>
                <th className="px-4 py-3 font-semibold">Bill #</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Appt #</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold text-right">Sub Total</th>
                <th className="px-4 py-3 font-semibold text-right">Total Amount</th>
                <th className="px-4 py-3 font-semibold text-right">Discount</th>
                <th className="px-4 py-3 font-semibold text-right">Tax</th>
                <th className="px-4 py-3 font-semibold text-right">Net Payable</th>
                <th className="px-4 py-3 font-semibold text-right">Received</th>
                <th className="px-4 py-3 font-semibold text-right">Pending</th>
                <th className="px-4 py-3 font-semibold text-right">Advance</th>
                <th className="px-4 py-3 font-semibold">Payment Mode</th>
                <th className="px-4 py-3 font-semibold">Created By</th>
                <th className="px-4 py-3 font-semibold">Payment Status</th>
                <th className="px-4 py-3 font-semibold">Transaction Type</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageBills.map((b, i) => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* numbering runs across pages, not from 1 on every page */}
                  <td className="px-4 py-3.5 text-gray-500 font-medium">{firstOnPage + i + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="text-indigo-600 font-semibold cursor-pointer hover:underline max-w-[120px] truncate" title={b.id}>
                      {b.id}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-gray-800">{b.customer}</div>
                    <div className="text-gray-400 mt-0.5">{b.phone}</div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 font-medium max-w-[100px] truncate" title={b.apptId}>
                    {b.apptId}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">
                    <div className="font-semibold">{b.date}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{b.time}</div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-gray-700">{currency(b.subTotal)}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-gray-700">{currency(b.totalAmount)}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-rose-500">{currency(b.discount)}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-gray-700">{currency(b.tax)}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-gray-900 bg-gray-50/50">{currency(b.netPayable)}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-emerald-500">{currency(b.received)}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-gray-400">{b.pending ? currency(b.pending) : '—'}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-gray-400">{b.advance ? currency(b.advance) : '—'}</td>
                  <td className="px-4 py-3.5 font-bold text-gray-700">
                    {b.paymentMode !== '-' && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {b.paymentMode}
                      </span>
                    )}
                    {b.paymentMode === '-' && '—'}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 font-medium">{b.createdBy}</td>
                  <td className="px-4 py-3.5">
                    <span className={`font-bold ${b.status === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-indigo-600 font-bold">{b.type}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5 text-indigo-500">
                      <button className="hover:text-indigo-800 transition-colors" title="View"><IconEye width={15} height={15} /></button>
                      <button className="hover:text-indigo-800 transition-colors" title="Edit"><IconEdit width={15} height={15} /></button>
                      <button className="text-emerald-500 hover:text-emerald-700 transition-colors" title="WhatsApp"><IconMessage width={15} height={15} /></button>
                      <button className="text-sky-500 hover:text-sky-700 transition-colors" title="Email"><IconMail width={15} height={15} /></button>
                      <button className="text-amber-500 hover:text-amber-700 transition-colors" title="Print"><IconReceipt width={15} height={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {pageBills.length === 0 && (
                <tr>
                  <td colSpan={18} className="px-4 py-10 text-center text-sm text-gray-400">
                    No bills match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination — sits under the table and stays put while the rows scroll */}
        <div className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-medium text-gray-500">
            {filtered.length === 0
              ? 'No bills'
              : `${firstOnPage + 1}–${firstOnPage + pageBills.length} of ${filtered.length} bills`}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              title="Previous page"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <IconChevron width={14} height={14} className="rotate-90" />
            </button>
            {pageNumbers(currentPage, pageCount).map((n, i) =>
              n === '…' ? (
                <span key={`gap-${i}`} className="px-1 text-xs text-gray-400">…</span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-7 min-w-7 rounded-lg px-2 text-xs font-semibold transition-colors ${
                    n === currentPage
                      ? 'bg-indigo-600 text-white'
                      : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage === pageCount}
              title="Next page"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <IconChevron width={14} height={14} className="-rotate-90" />
            </button>
          </div>
        </div>
      </div>

      <NewBillModal
        open={newBillOpen}
        initialAppointment={billAppt}
        onClose={() => setNewBillOpen(false)}
        onBooked={() => {
          setNewBillOpen(false);
          setToast('Bill Created Successfully');
        }}
        onSaveDraft={() => {
          setNewBillOpen(false);
          setToast('Bill Saved as Draft');
        }}
      />
      {/* Success toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}
    </div>
  )
}

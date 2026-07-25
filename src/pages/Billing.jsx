import { useState, useEffect } from 'react'
import TopBar from '../components/TopBar'
import NewBillModal from '../components/NewBillModal'
import {
  IconSearch, IconCart, IconMenu, IconEye, IconEdit, IconTrash,
  IconReceipt, IconMail, IconMessage, IconArrowDown, IconArrowUp, IconClock
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
]

const currency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(val || 0)

export default function Billing() {
  const [newBillOpen, setNewBillOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(t)
  }, [toast])
  const [activeTab, setActiveTab] = useState('All')
  const [summaryOpen, setSummaryOpen] = useState(false)

  const tabs = [
    { label: 'All', count: 122 },
    { label: 'Paid', count: 75 },
    { label: 'Pending', count: 44 },
    { label: 'Partial', count: 4 },
    { label: 'Canceled', count: 1 },
  ]

  return (
    <div className="-mx-6 -my-8 flex h-screen flex-col overflow-hidden bg-gray-50">
      <TopBar title={
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Kuexa &gt;</span>
          <span className="font-semibold text-gray-800">Billing</span>
        </div>
      } />

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Billing</h1>
            <p className="text-xs text-gray-400">122 bills total</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNewBillOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <IconCart width={16} height={16} /> New Bill
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-[#4a7196] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#3d6083] transition-colors">
              <IconMenu width={16} height={16} /> Bills History
            </button>
          </div>
        </div>

        
        {/* Billing Summary Collapsible */}
        <div className="mb-4 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <button 
            onClick={() => setSummaryOpen(!summaryOpen)} 
            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {summaryOpen ? <IconArrowUp width={14} height={14} /> : <IconArrowDown width={14} height={14} />}
            Billing Summary
            <span className="ml-2 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">122 bills</span>
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
                    <div className="text-xl font-bold text-indigo-600">122</div>
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

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <IconSearch width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              placeholder="Search bill number, customer name or phone..." 
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-indigo-400 shadow-sm" 
            />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-sm">
            <span>Start date</span>
            <span>→</span>
            <span>End date</span>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex gap-1">
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
          <div className="text-[11px] font-semibold text-gray-400">122 of 122 Bills</div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-left text-[11px] whitespace-nowrap">
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider border-b border-gray-200">
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
              {mockBills.map((b, i) => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3.5 text-gray-500 font-medium">{i + 1}</td>
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
            </tbody>
          </table>
        </div>
      </div>

      <NewBillModal 
        open={newBillOpen} 
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

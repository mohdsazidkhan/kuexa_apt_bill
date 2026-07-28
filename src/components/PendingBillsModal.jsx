import { currency } from '../data/services'

// Dummy unpaid bills of the client — picked here they get settled along with this bill.
export const PENDING_BILLS = [
  { id: 'pb1', no: 'BILL/000171/2025-26', date: '18-08-2025', amount: 500 },
  { id: 'pb2', no: 'BILL/000300/2025-26', date: '23-08-2025', amount: 1 },
  { id: 'pb3', no: 'BILL/000301/2025-26', date: '23-08-2025', amount: 4006 },
  { id: 'pb4', no: 'BILL/000979/2025-26', date: '28-10-2025', amount: 3000 },
]

export const billPending = (b) => Number(b.amount) || 0

export default function PendingBillsModal({ open, onClose, onSubmit, selectedIds = [], customerName = 'Client' }) {
  if (!open) return null

  // Ticks mirror what's already on the bill (all of them by default), and ticking a bill
  // pushes it into the bill right away — no need to hit "Update to Bill" first.
  const picked = new Set(selectedIds)
  const toggle = (id) => {
    const n = new Set(picked)
    n.has(id) ? n.delete(id) : n.add(id)
    onSubmit?.(PENDING_BILLS.filter((b) => n.has(b.id)))
  }

  const chosen = PENDING_BILLS.filter((b) => picked.has(b.id))
  const total = chosen.reduce((s, b) => s + billPending(b), 0)

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="bg-[#3b5a72] px-6 py-3">
          <h3 className="text-center text-base font-bold text-white">{customerName}&apos;s Pending Bills &amp; Amount</h3>
        </div>

        <div className="px-6 pt-4">
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_90px] gap-3 border-b border-gray-200 pb-2 text-sm font-bold text-[#3b5a72]">
            <span>Bill Number</span>
            <span>Date</span>
            <span>Amount</span>
            <span>Action</span>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {PENDING_BILLS.map((b) => (
              <label
                key={b.id}
                className="grid cursor-pointer grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_90px] items-center gap-3 border-b border-gray-100 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <span className="truncate">{b.no}</span>
                <span>{b.date}</span>
                <span>{currency(b.amount)}</span>
                <input
                  type="checkbox"
                  checked={picked.has(b.id)}
                  onChange={() => toggle(b.id)}
                  className="h-5 w-5 rounded-sm border-gray-300 text-[#e6006e] focus:ring-[#e6006e]"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-5">
          <span className="text-sm text-gray-600">
            {picked.size} bill{picked.size === 1 ? '' : 's'} selected ·{' '}
            <span className="font-bold text-gray-800">{currency(total)}</span>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-full border border-gray-300 px-7 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => { onSubmit?.(chosen); onClose?.() }}
              className="rounded-full bg-[#1e3a56] px-7 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#16293d]"
            >
              Update to Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

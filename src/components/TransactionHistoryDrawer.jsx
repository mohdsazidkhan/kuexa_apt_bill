import { IconClose } from './Icons'
import useDrawerTransition from './useDrawerTransition'

const dummyHistoryMem = [
  {
    id: 1,
    billNo: 'BILL/000783/2025-26',
    clientName: 'Anshu Saini',
    billDate: '01-10-2025',
    billTime: '05:43 PM',
    itemName: 'Women Shampooing & Conditioning - Signature',
    qty: 1,
    totalValue: '₹500',
    discount: '₹50',
    taxAmount: '₹22.5',
    amountWithTax: '₹472.5'
  }
]

const dummyHistoryPkg = [
  {
    id: 1,
    billNo: 'BILL/001556/2025-26',
    clientName: 'Riyma',
    billDate: '13-01-2026',
    billTime: '02:49 PM',
    itemName: 'Women Nail Extension',
    qty: 1,
    totalValue: '₹2600',
    discount: '₹2600',
    taxAmount: '₹0',
    amountWithTax: '₹0'
  }
]

export default function TransactionHistoryDrawer({ open, onClose, offerName }) {
  // Slides in from the right and back out again, same as the F&F drawer.
  const { mounted, shown, value: name } = useDrawerTransition(open, offerName)

  if (!mounted) return null

  const dummyHistory = name?.includes('Package') ? dummyHistoryPkg : dummyHistoryMem

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${shown ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
      />

      <div
        style={{ width: 'calc(100% - 12rem)' }}
        className={`fixed right-0 top-0 z-[60] flex h-screen flex-col bg-white transition-transform duration-300 ease-out ${shown ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center bg-[#46667d] px-2 py-1 text-white relative">
          <h2 className="text-lg font-bold tracking-wide">
            {name} Transaction History
          </h2>
          <button onClick={onClose} className="absolute right-4 top-1 rounded p-1 hover:bg-[#344d5f]">
            <IconClose width={20} height={20} />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="sticky top-0 bg-gray-100 border-b border-gray-200">
              <tr className="text-[#3c5775] font-bold text-xs uppercase">
                <th className="px-4 py-3 font-bold">Bill No.</th>
                <th className="px-4 py-3 font-bold">Client Name</th>
                <th className="px-4 py-3 font-bold">Bill Date</th>
                <th className="px-4 py-3 font-bold">Bill Time</th>
                <th className="px-4 py-3 font-bold">Item Name</th>
                <th className="px-4 py-3 text-center font-bold">Qty</th>
                <th className="px-4 py-3 text-center font-bold">Total Value</th>
                <th className="px-4 py-3 text-center font-bold">Discount</th>
                <th className="px-4 py-3 text-center font-bold">Tax Amount</th>
                <th className="px-4 py-3 text-center font-bold">Amount With Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {Array(15).fill(dummyHistory).flat().map((row, index) => (
                <tr key={`${row.id}-${index}`} className="hover:bg-gray-50/50">
                  <td className="px-4 py-4 text-gray-600">{row.billNo}</td>
                  <td className="px-4 py-4 text-gray-600">{row.clientName}</td>
                  <td className="px-4 py-4 text-gray-600">{row.billDate}</td>
                  <td className="px-4 py-4 text-gray-600">{row.billTime}</td>
                  <td className="px-4 py-4 text-gray-600">{row.itemName}</td>
                  <td className="px-4 py-4 text-center text-gray-600">{row.qty}</td>
                  <td className="px-4 py-4 text-center text-gray-600">{row.totalValue}</td>
                  <td className="px-4 py-4 text-center text-gray-600">{row.discount}</td>
                  <td className="px-4 py-4 text-center text-gray-600">{row.taxAmount}</td>
                  <td className="px-4 py-4 text-center text-gray-600">{row.amountWithTax}</td>
                </tr>
              ))}
              {dummyHistory.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

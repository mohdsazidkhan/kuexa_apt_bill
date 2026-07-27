import { useState } from 'react'
import { IconClose } from './Icons'

export default function ProductBatchesModal({ open, onClose, onSubmit, product }) {

  // Dummy batch data for the given product
  const batches = [
    { id: 1, barcode: '609728131814', batchNo: 'NA', mrp: '₹3050.85', salePrice: '₹3050.85', balanceQty: 99 },
    { id: 2, barcode: '609728131814', batchNo: 'NA', mrp: '₹3050.85', salePrice: '₹3050.85', balanceQty: 99 },
  ]

  const [quantities, setQuantities] = useState({})

  const handleQtyChange = (id, value) => {
    setQuantities(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = () => {
    onSubmit?.(quantities)
    onClose()
  }

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <div
        style={{ width: 'calc(100% - 16rem)' }}
        className={`fixed right-0 top-0 z-50 flex h-screen flex-col bg-white transition-transform duration-300 ease-out ${
          open ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 border-b border-gray-100 px-4 py-2">
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <IconClose width={18} height={18} />
          </button>
          <h2 className="shrink-0 text-base font-semibold text-gray-800">Enter Product Batches Quantity</h2>
        </div>

        <div className="overflow-x-auto flex-1 p-4">
          <table className="w-full text-left text-sm text-gray-700 border border-gray-200">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr className="text-[#3c5775] font-bold text-xs uppercase">
                <th className="p-3 border-r border-gray-200">Name</th>
                <th className="p-3 border-r border-gray-200">Brand</th>
                <th className="p-3 border-r border-gray-200">Category</th>
                <th className="p-3 border-r border-gray-200">Subcategory</th>
                <th className="p-3">Barcode</th>
                <th className="p-3">Batch No.</th>
                <th className="p-3 text-right">MRP</th>
                <th className="p-3 text-right">Sale Price</th>
                <th className="p-3 text-center">Balance Qty.</th>
                <th className="p-3 text-center">Bill Qty.</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch, index) => (
                <tr key={batch.id} className="border-b border-gray-200 hover:bg-gray-50/50">
                  {index === 0 && (
                    <>
                      <td rowSpan={batches.length} className="p-3 border-r border-gray-200 align-top text-gray-600 bg-white">
                        {product?.name || 'Amazon Series Acai Hair Oil Treatment 120 ml'}
                      </td>
                      <td rowSpan={batches.length} className="p-3 border-r border-gray-200 align-top text-gray-600 bg-white">
                        {product?.brand || 'Amazon Series'}
                      </td>
                      <td rowSpan={batches.length} className="p-3 border-r border-gray-200 align-top text-gray-600 bg-white">
                        {product?.category || 'Hair'}
                      </td>
                      <td rowSpan={batches.length} className="p-3 border-r border-gray-200 align-top text-gray-600 bg-white">
                        {product?.subcategory || 'Hair Treatment'}
                      </td>
                    </>
                  )}
                  <td className="p-3 text-gray-600">{batch.barcode}</td>
                  <td className="p-3 text-gray-600">{batch.batchNo}</td>
                  <td className="p-3 text-gray-600 text-right">{batch.mrp}</td>
                  <td className="p-3 text-gray-600 text-right">{batch.salePrice}</td>
                  <td className="p-3 text-gray-600 text-center">{batch.balanceQty}</td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      className="w-16 rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-center"
                      value={quantities[batch.id] || ''}
                      onChange={(e) => handleQtyChange(batch.id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="rounded-full border border-gray-400 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-full bg-[#1a3551] px-6 py-2 text-sm font-semibold text-white hover:bg-[#112336]"
          >
            Submit
          </button>
        </div>
      </div>
    </>
  )
}

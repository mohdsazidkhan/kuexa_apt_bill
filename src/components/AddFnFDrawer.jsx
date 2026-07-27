import { useState } from 'react'
import { currency } from '../data/services'
import { IconClose } from './Icons'

const dummyMemberships = [
  { id: 1, name: 'SilverCARD', type: 'Membership', price: 15000, end: '29-10-2025', added: true },
  { id: 2, name: 'Prive Membership', type: 'Membership', price: 1000, end: '04-11-2025', added: false },
  { id: 3, name: 'GTJ Black Card', type: 'Membership', price: 50000, end: '14-11-2025', added: false },
  { id: 4, name: 'Test Membership', type: 'Membership', price: 10000, end: '20-12-2024', added: false },
  { id: 5, name: 'GTJ Black Card', type: 'Membership', price: 50000, end: '20-11-2025', added: false },
  { id: 6, name: 'GTJ Gold Card', type: 'Membership', price: 30000, end: '20-11-2025', added: false },
  { id: 7, name: 'Prive Membership', type: 'Membership', price: 1000, end: '28-11-2025', added: false },
  { id: 8, name: 'Prive Membership', type: 'Membership', price: 1000, end: '12-12-2025', added: false },
]

export default function AddFnFDrawer({ open, onClose, primaryCustomer }) {
  const [selectedOffers, setSelectedOffers] = useState([1]) // ID 1 is pre-selected
  const [search, setSearch] = useState('')

  if (!primaryCustomer) return null

  const toggleOffer = (id) => {
    setSelectedOffers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
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
        style={{ width: 'calc(100% - 4rem)' }}
        className={`fixed right-0 top-0 z-50 flex h-screen flex-col bg-white transition-transform duration-300 ease-out ${
          open ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center bg-[#2c4c6b] px-6 py-4 text-white">
          <h2 className="text-lg font-bold tracking-wide">
            Add Anshu Saini To F&F Of {primaryCustomer.name}
          </h2>
          <button onClick={onClose} className="absolute right-4 top-4 rounded p-1 hover:bg-[#1a3551]">
            <IconClose width={20} height={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex w-72 items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <input
              type="text"
              placeholder="Search Customer..."
              className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 font-semibold text-[#1e88e5]">
              {primaryCustomer.name} 
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <div className="font-bold text-gray-800">{primaryCustomer.phone}</div>
            <div className="font-bold text-gray-800">{primaryCustomer.gender === 'Male' ? 'M' : 'F'}</div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-gray-200 font-bold text-[#2c4c6b]">
                <th className="px-6 py-4">Offer Name</th>
                <th className="px-6 py-4">Offer Type</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Benefit End Date</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dummyMemberships.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-semibold text-gray-600">{offer.name}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                      {offer.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{currency(offer.price)}</td>
                  <td className="px-6 py-4">{offer.end}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleOffer(offer.id)}
                      className={`flex h-6 w-6 items-center justify-center mx-auto rounded border ${
                        selectedOffers.includes(offer.id)
                          ? 'border-[#e91e63] bg-[#e91e63] text-white'
                          : 'border-gray-400 bg-white'
                      }`}
                    >
                      {selectedOffers.includes(offer.id) && (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-full border border-gray-400 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => {
              // Add logic here
              onClose()
            }}
            className="rounded-full bg-[#1b2f42] px-8 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#11202e]"
          >
            Add
          </button>
        </div>
      </div>
    </>
  )
}

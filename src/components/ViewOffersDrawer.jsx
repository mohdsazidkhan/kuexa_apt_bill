import { useEffect, useState } from 'react'
import { IconClose } from './Icons'
import TransactionHistoryDrawer from './TransactionHistoryDrawer'
import OfferDetailDrawer from './OfferDetailDrawer'
import useDrawerTransition from './useDrawerTransition'

const dummyOffers = [
  { id: 1, name: 'Prime membership (8373)', user: 'Anshu Saini', type: 'Membership', data: '10.00 %', end: '30-10-2026' },
  { id: 2, name: 'Bi mem value based Product (5120)', user: 'Anshu Saini', type: 'Membership', data: 'Rs. 34560.00', end: '15-11-2027' },
  { id: 3, name: 'Gold membership (2876)', user: 'ARUN KUMAR', type: 'Membership', data: '15.00 %', end: '21-11-2026' },
  { id: 4, name: 'Mem Both - New Year Overall (7543)', user: 'Anshu Saini', type: 'Membership', data: '30 % & Rs. 1200', end: '30-07-2026' },
  { id: 5, name: 'Mem Both - New Year Overall (1846)', user: 'Anshu Saini', type: 'Membership', data: '30 % & Rs. 1200', end: '06-08-2026' },
  { id: 6, name: 'Testing ()', user: 'Anshu Saini', type: 'Membership', data: '20.00 %', end: '31-10-2026' },
  { id: 7, name: 'Prive package (2726)', user: 'Saksham Gupta', type: 'Package', data: '14 Qty', end: '18-08-2027' },
  { id: 8, name: 'Product Package for Bi (1983)', user: 'Anshu Saini', type: 'Package', data: '6 Qty', end: '14-11-2026' },
  { id: 9, name: 'Christmas Special Package (0960)', user: 'Anshu Saini', type: 'Package', data: '20 Qty', end: '08-12-2026' },
  { id: 10, name: 'Christmas Special Package (8116)', user: 'Riyma', type: 'Package', data: '19 Qty', end: '13-12-2026' },
  { id: 11, name: 'CO_001_TESTING_SEP', user: 'Anshu Saini', type: 'ComboOffer', data: '1 Qty', end: '24-09-2026' },
]

export default function ViewOffersDrawer({ open, onClose, customer }) {
  const [selectedHistoryOffer, setSelectedHistoryOffer] = useState(null)
  const [selectedDetailOffer, setSelectedDetailOffer] = useState(null)
  // Slides in from the right and back out again, same as the F&F drawer.
  const { mounted, shown, value: client } = useDrawerTransition(open, customer)

  // Nothing stacked on top survives the drawer closing.
  useEffect(() => {
    if (!open) {
      setSelectedHistoryOffer(null)
      setSelectedDetailOffer(null)
    }
  }, [open])

  if (!mounted || !client) return null

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${shown ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
      />

      <div
        style={{ width: 'calc(100% - 16rem)' }}
        className={`fixed right-0 top-0 z-50 flex h-screen flex-col bg-white transition-transform duration-300 ease-out ${shown ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center bg-[#2c4c6b] px-2 py-1 text-white relative">
          <h2 className="text-lg font-bold tracking-wide">
            {client.name}&apos;s Offers
          </h2>
          <button onClick={onClose} className="absolute right-4 top-1 rounded p-1 hover:bg-[#1a3551]">
            <IconClose width={20} height={20} />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="sticky top-0 bg-white border-b border-gray-200">
              <tr className="text-[#3c5775] font-bold text-sm">
                <th className="px-2 py-1 font-bold">Offer Name</th>
                <th className="px-2 py-1 font-bold">Client Name</th>
                <th className="px-2 py-1 font-bold">Offer Type</th>
                <th className="px-2 py-1 font-bold">Offer Balance</th>
                <th className="px-2 py-1 font-bold whitespace-nowrap">Benefit End Date</th>
                <th className="px-2 py-1 text-center font-bold">Apply Offers</th>
                <th className="px-2 py-1 font-bold">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {Array(3).fill(dummyOffers).flat().map((offer, index) => (
                <tr key={`${offer.id}-${index}`} className="hover:bg-gray-50/50">
                  <td className="px-2 py-1 font-bold text-[#1e88e5] w-[25%]">
                    <button
                      onClick={() => setSelectedDetailOffer(offer)}
                      className="text-left hover:underline"
                    >
                      {offer.name}
                    </button>
                  </td>
                  <td className="px-2 py-1 font-bold text-[#1e88e5]">
                    <div className="flex items-center gap-1 cursor-pointer hover:underline">
                      {offer.user}
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </td>
                  <td className="px-2 py-1">
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${offer.type === 'Membership' ? 'bg-indigo-100 text-indigo-700' :
                      offer.type === 'Package' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                      {offer.type}
                    </span>
                  </td>
                  <td className="px-2 py-1 font-semibold text-gray-600">{offer.data}</td>
                  <td className="px-2 py-1 font-semibold text-gray-600">{offer.end}</td>
                  <td className="px-2 py-1 text-center">
                    <button className="rounded-full bg-[#2c75b3] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#225c8d]">
                      Apply Offers
                    </button>
                  </td>
                  <td className="px-2 py-1">
                    <button
                      onClick={() => setSelectedHistoryOffer(offer.name)}
                      className="text-sm font-semibold text-[#1e88e5] hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionHistoryDrawer
        open={!!selectedHistoryOffer}
        onClose={() => setSelectedHistoryOffer(null)}
        offerName={selectedHistoryOffer}
      />

      <OfferDetailDrawer
        open={!!selectedDetailOffer}
        onClose={() => setSelectedDetailOffer(null)}
        offer={selectedDetailOffer}
      />
    </>
  )
}

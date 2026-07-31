import { IconClose } from './Icons'
import useDrawerTransition from './useDrawerTransition'

const dummyServices = [
  { id: 1, name: "Men's Haircut", type: 'Service' },
  { id: 2, name: "Women's Haircut", type: 'Service' },
  { id: 3, name: "Men Hair Trimming", type: 'Service' },
  { id: 4, name: "Women Hair Trimming", type: 'Service' },
  { id: 5, name: "Men Haircut Creative", type: 'Service' },
  { id: 6, name: "Women Haircut Creative", type: 'Service' },
  { id: 7, name: "Women Fringe / Flicks", type: 'Service' },
  { id: 8, name: "Kid's Haircut (Boy)", type: 'Service' },
  { id: 9, name: "Kid's Haircut (Girl)", type: 'Service' },
  { id: 10, name: "Men Shaving", type: 'Service' },
  { id: 11, name: "Men Beard Trimming", type: 'Service' },
  { id: 12, name: "Men Beard Cutting", type: 'Service' },
  { id: 13, name: "Men Beard colouring", type: 'Service' },
  { id: 14, name: "Men Moustache Grooming", type: 'Service' },
  { id: 15, name: "Men Moustache Shaving", type: 'Service' },
  { id: 16, name: "Men Root Refresh Hair Colour", type: 'Service' },
  { id: 17, name: "Women Root Refresh Hair Colour", type: 'Service' },
  { id: 18, name: "Men Global Hair Colour", type: 'Service', qty: 2 },
  { id: 19, name: "Women Global Hair Colour", type: 'Service', qty: 2 },
  { id: 20, name: "Men Balayage Highlights", type: 'Service', qty: 2 },
  { id: 21, name: "Women Balayage Highlights", type: 'Service', qty: 2 },
]

const dummyComboServices = [
  { id: 1, name: "Women Hair Colour Cleansing", type: 'Service', qty: 0 },
  { id: 2, name: "Women Hair Colour Cleansing", type: 'Service', qty: 1 },
]

export default function OfferDetailDrawer({ open, onClose, offer: offerProp }) {
  // Slides in from the right and back out again, same as the F&F drawer.
  const { mounted, shown, value: offer } = useDrawerTransition(open, offerProp)

  if (!mounted || !offer) return null

  const isQuantityBased = offer.type === 'Package' || offer.type === 'ComboOffer'
  const isMembership = offer.type === 'Membership'

  // Add some dummy pricing data for memberships
  const baseServices = offer.type === 'ComboOffer' ? dummyComboServices : dummyServices
  const services = baseServices.map(s => ({
    ...s,
    price: '₹500',
    discount: '10%',
    afterDiscount: '₹450',
    totalQty: 5,
    usedQty: (5 - (s.qty ?? 2)),
    qty: s.qty ?? 2
  }))

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
          <h2 className="text-lg font-bold tracking-wide capitalize">
            {offer.name} Detail
          </h2>
          <button onClick={onClose} className="absolute right-4 top-1 rounded p-1 hover:bg-[#344d5f]">
            <IconClose width={20} height={20} />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="sticky top-0 bg-white border-b border-gray-200">
              <tr className="text-[#3c5775] font-bold text-xs uppercase">
                <th className="px-6 py-4 font-bold">Name</th>
                {isMembership && (
                  <>
                    <th className="px-6 py-4 font-bold">Price</th>
                    <th className="px-6 py-4 font-bold">Discount</th>
                    <th className="px-6 py-4 font-bold">After Discount</th>
                  </>
                )}
                {isQuantityBased && (
                  <>
                    <th className="px-6 py-4 font-bold text-center">Total Qty.</th>
                    <th className="px-6 py-4 font-bold text-center">Used Qty.</th>
                    <th className="px-6 py-4 font-bold text-center">Remaining Qty.</th>
                  </>
                )}
                <th className="px-6 py-4 font-bold w-32">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {Array(3).fill(services).flat().map((row, index) => (
                <tr key={`${row.id}-${index}`} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-semibold text-gray-600">{row.name}</td>
                  {isMembership && (
                    <>
                      <td className="px-6 py-3 text-gray-600">{row.price}</td>
                      <td className="px-6 py-3 text-gray-600">{row.discount}</td>
                      <td className="px-6 py-3 text-gray-600">{row.afterDiscount}</td>
                    </>
                  )}
                  {isQuantityBased && (
                    <>
                      <td className="px-6 py-3 text-center font-semibold text-gray-600">
                        {row.totalQty}
                      </td>
                      <td className="px-6 py-3 text-center font-semibold text-gray-600">
                        {row.usedQty}
                      </td>
                      <td className="px-6 py-3 text-center font-semibold text-gray-600">
                        {row.qty}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-3">
                    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                      {row.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

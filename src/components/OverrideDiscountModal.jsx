import { useEffect, useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

// Dummy coupons for the demo — value is the flat rupee discount the coupon carries.
export const COUPONS = [
  { id: 'c1', name: 'Coupon june testing', value: 200 },
  { id: 'c2', name: 'Monsoon Flat 500', value: 500 },
  { id: 'c3', name: 'First Visit 150', value: 150 },
  { id: 'c4', name: 'Festive Bonanza 1000', value: 1000 },
]

const TYPES = [
  { id: 'coupon', label: 'Coupon Code' },
  { id: 'amount', label: 'Flat' },
  { id: 'percentage', label: 'Percentage' },
]

// Underlined-select look from the reference design.
const selectCls =
  'w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm text-gray-800 outline-none focus:border-b-2 focus:border-b-rose-500'
const inputCls =
  'w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#2c4c6b]'

const Caret = () => (
  <svg
    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
    width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
  >
    <path d="M7 10l5 5 5-5z" />
  </svg>
)

export default function OverrideDiscountModal({ open, onClose, onApply, current }) {
  const [type, setType] = useState('coupon')
  const [couponId, setCouponId] = useState(COUPONS[0].id)
  const [value, setValue] = useState('')
  const [remarks, setRemarks] = useState('')
  const [confirm, setConfirm] = useState(false)

  // Reset to whatever override is currently applied every time the modal opens.
  useEffect(() => {
    if (!open) return
    setType(current?.type || 'coupon')
    setCouponId(current?.couponId || COUPONS[0].id)
    setValue(current?.value ?? '')
    setRemarks(current?.remarks || '')
    setConfirm(false)
  }, [open, current])

  if (!open) return null

  const coupon = COUPONS.find((c) => c.id === couponId)
  const isCoupon = type === 'coupon'
  const effValue = isCoupon ? coupon?.value ?? 0 : Number(value) || 0
  const canSubmit = isCoupon ? !!coupon : effValue > 0 && remarks.trim().length > 0

  const handleUpdate = () => {
    if (!canSubmit) return
    setConfirm(true)
  }

  const handleConfirmYes = () => {
    onApply?.({
      type,
      couponId: isCoupon ? couponId : null,
      couponName: isCoupon ? coupon?.name : null,
      value: effValue,
      remarks: isCoupon ? '' : remarks.trim(),
    })
    setConfirm(false)
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-[#3b5a72] px-6 py-3.5">
          <h3 className="text-center text-base font-bold uppercase tracking-wide text-white">Update Discount</h3>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="flex flex-wrap items-end gap-6">
            <div className="w-48">
              <label className="mb-1.5 block text-sm text-gray-700">Discount Type</label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => { setType(e.target.value); setValue(''); setRemarks('') }}
                  className={selectCls}
                >
                  {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <Caret />
              </div>
            </div>

            {isCoupon && (
              <div className="w-56">
                <label className="mb-1.5 block text-sm text-gray-700">Select Coupon</label>
                <div className="relative">
                  <select
                    value={couponId}
                    onChange={(e) => setCouponId(e.target.value)}
                    className={`${selectCls} border-b-2 border-b-rose-500`}
                  >
                    {COUPONS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <Caret />
                </div>
              </div>
            )}

            <div className="w-40">
              <label className="mb-1.5 block text-sm text-gray-700">Discount Value</label>
              {isCoupon ? (
                <div className={`${inputCls} bg-gray-50 text-center text-gray-600`}>{coupon?.value ?? 0}</div>
              ) : (
                <input
                  type="number"
                  min="0"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter Value"
                  className={`${inputCls} text-center`}
                />
              )}
            </div>
          </div>

          {!isCoupon && (
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter Remarks*"
              className="mt-5 w-full resize-none rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#2c4c6b]"
            />
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-full border border-gray-300 px-7 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={handleUpdate}
              disabled={!canSubmit}
              className="rounded-full bg-[#1e3a56] px-7 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#16293d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Update Discount
            </button>
          </div>
        </div>
      </div>

      {/* Confirm — bill-level override wipes every line-level discount */}
      <ConfirmDialog
        open={confirm}
        message="If you Override the Discount at Bill Level, the discount applied if any, on all previous items at Line Level, will be removed!"
        onNo={() => setConfirm(false)}
        onYes={handleConfirmYes}
      />
    </div>
  )
}

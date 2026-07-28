// Bold-statement confirm used across billing (override discount, advance / pending payment).
export default function ConfirmDialog({ open, message, onNo, onYes, zIndex = 'z-[90]' }) {
  if (!open) return null
  return (
    <div className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-black/50 p-4`}>
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="h-2.5 bg-[#3b5a72]" />
        <div className="px-7 py-6">
          <p className="text-lg font-bold leading-relaxed text-gray-900">{message}</p>
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onNo}
              className="rounded-full border border-gray-300 px-8 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              No
            </button>
            <button
              onClick={onYes}
              className="rounded-full bg-[#1e3a56] px-9 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#16293d]"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

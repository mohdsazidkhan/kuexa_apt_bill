import { useState, useEffect } from 'react'
import { IconUsers, IconClose, IconChevron } from './Icons'

const GENDERS = ['Male', 'Female', 'Other']
const cInput =
  'w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'

export default function AddCustomerModal({ open, onClose, onAdd, initial }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', gender: '' })

  // Reset the form from `initial` each time the modal opens.
  useEffect(() => {
    if (open) {
      setForm({
        firstName: initial?.firstName || '',
        lastName: initial?.lastName || '',
        phone: initial?.phone || '',
        gender: initial?.gender || '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const submit = () => {
    if (!form.firstName.trim() || !form.phone.trim()) return
    onAdd?.({
      id: `new-${Date.now()}`,
      name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      phone: form.phone.trim(),
      gender: form.gender || 'Other',
    })
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <IconUsers width={20} height={20} className="text-indigo-600" /> Add New Customer
          </h3>
          <button onClick={onClose} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <IconClose width={18} height={18} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-600"><span className="text-rose-500">*</span> First Name</label>
            <input
              autoFocus
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              placeholder="First name"
              className={cInput}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-600">Last Name</label>
            <input
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              placeholder="Last name"
              className={cInput}
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="mb-1.5 block text-sm font-medium text-gray-600"><span className="text-rose-500">*</span> Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/[^\d+\-\s]/g, '') }))}
            placeholder="Phone number"
            className={cInput}
          />
        </div>

        <div className="mt-3">
          <label className="mb-1.5 block text-sm font-medium text-gray-600">Gender</label>
          <div className="relative">
            <select
              value={form.gender}
              onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
              className={`${cInput} appearance-none pr-9`}
            >
              <option value="">Select gender</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <IconChevron width={16} height={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!form.firstName.trim() || !form.phone.trim()}
            className="rounded-lg bg-[#4a7196] px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#3d6083] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add Customer
          </button>
        </div>
      </div>
    </div>
  )
}

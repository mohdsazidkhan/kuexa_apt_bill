import { useMemo, useState, useEffect, useRef } from 'react'
import { customers } from '../data/services'
import { IconUsers, IconSearch, IconClose } from './Icons'
import AddCustomerModal from './AddCustomerModal'

const isPhoneQuery = (q) => /\d/.test(q) && /^[\d+\-\s]+$/.test(q)

export default function CustomerSearch({ value, onChange, autoFocus = false, focusTrigger = false }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [addInitial, setAddInitial] = useState({})
  const [promptedQuery, setPromptedQuery] = useState('')
  const [confirmClient, setConfirmClient] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (autoFocus && focusTrigger && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
        setOpen(true)
      }, 50)
    }
  }, [autoFocus, focusTrigger])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers.slice(0, 6)
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    )
  }, [query])

  const pick = (c) => {
    if (c.name.toLowerCase() === 'rajat katiyar') {
      setConfirmClient(c)
      return
    }
    proceedPick(c)
  }

  const proceedPick = (c) => {
    onChange?.(c)
    setConfirmClient(null);
    setOpen(false)
    setQuery('')
  }

  const clear = () => {
    onChange?.(null)
    setOpen(false)
    setQuery('')
  }

  // Open the add-customer modal, pre-filling from whatever was typed.
  const openAdd = () => {
    const q = query.trim()
    const phone = isPhoneQuery(q)
    const parts = q.split(/\s+/)
    setAddInitial({
      firstName: phone ? '' : parts[0] || '',
      lastName: phone ? '' : parts.slice(1).join(' '),
      phone: phone ? q : '',
      gender: '',
    })
    setOpen(false)
    setAddOpen(true)
  }

  // Auto-open the add-customer modal when a search yields nothing (debounced).
  useEffect(() => {
    const q = query.trim()
    if (!open || !q || results.length > 0 || addOpen || value) return
    if (q === promptedQuery) return
    const t = setTimeout(() => {
      setPromptedQuery(q)
      openAdd()
    }, 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open, results.length, addOpen, value, promptedQuery])

  const modal = (
    <AddCustomerModal
      open={addOpen}
      onClose={() => setAddOpen(false)}
      onAdd={pick}
      initial={addInitial}
    />
  )

  // Selected state — gender & phone now live in the modal header.
  if (value) {
    return (
      <>
        {confirmClient && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-xl overflow-hidden p-6 text-center">
              <p className="text-sm text-gray-600 mb-6">
                Invoice <strong className="text-yellow-500">DRAFT/25-26/002369</strong>, <strong className="text-green-600">APP/25-26/002369</strong>, <strong className="text-blue-600">BILL/000783/2025-26</strong> already created for <strong className="font-bold text-red-500">Rajat Katiyar</strong> Today. Do you still wish to continue for <strong className="font-bold text-red-500">Rajat Katiyar</strong>?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setConfirmClient(null)}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full"
                >
                  No
                </button>
                <button
                  onClick={() => proceedPick(confirmClient)}
                  className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex h-[34px] items-center justify-between rounded-md border border-gray-200 bg-white px-3">
          <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <IconUsers width={16} height={16} className="text-gray-400" />
            {value.name}
            {value.gender && <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">{value.gender}</span>}
            {value.phone && <span className="text-[11px] font-semibold text-gray-600">{value.phone}</span>}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-emerald-600">Selected</span>
            <button onClick={clear} className="text-gray-300 hover:text-rose-500">
              <IconClose width={16} height={16} />
            </button>
          </div>
        </div>
        {modal}
      </>
    )
  }

  // Search state
  return (
    <div>
      <div className="relative w-full">
        {confirmClient && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-xl overflow-hidden p-6 text-center">
              <p className="text-sm text-gray-600 mb-6">
                Invoice <strong className="text-yellow-500">DRAFT/25-26/002369</strong>, <a href="#" className="font-bold text-green-600">APP/25-26/002369</a>, <a href="#" className="font-bold text-blue-600">BILL/000783/2025-26</a> already created for <strong className="font-bold text-red-500">Rajat Katiyar</strong> Today. Do you still wish to continue for  <strong className="font-bold text-red-500">Rajat Katiyar</strong>?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setConfirmClient(null)}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full"
                >
                  No
                </button>
                <button
                  onClick={() => proceedPick(confirmClient)}
                  className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
        <IconSearch width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            if (isPhoneQuery(val)) {
              const digits = val.replace(/\D/g, '');
              if (digits.length > 10) return;
            }
            setQuery(val);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search by name or phone..."
          className="h-[34px] w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />

        {open && (
          <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {results.length === 0 && (
              <li className="px-3 py-3 text-center text-sm text-gray-400">
                No customer found — opening new customer form…
              </li>
            )}
            {results.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(c)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-indigo-50"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <IconUsers width={15} height={15} className="text-gray-400" />
                    {c.name}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 font-medium text-blue-600">{c.gender}</span>
                    {c.phone}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-1.5 text-xs text-gray-400">Type a name or phone number to search</p>
      {modal}
    </div>
  )
}

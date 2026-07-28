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
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 border-b border-gray-100 px-5 py-3.5 text-center">
                <p className="text-sm font-semibold text-gray-700">
                  Already created today for{' '}
                  <span className="text-red-500">Rajat Katiyar</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Do you still wish to continue?</p>
              </div>
              {/* 3 Columns */}
              <div className="grid grid-cols-3 gap-3 p-4">
                {/* Drafts */}
                <div className="flex flex-col gap-2 rounded-lg border border-yellow-300 bg-yellow-50 p-2">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">📝</span>
                    <span className="text-[11px] font-bold text-yellow-600 uppercase tracking-wide">Drafts</span>
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-200 scrollbar-track-transparent">
                    <a href="#" className="rounded bg-yellow-100 hover:bg-yellow-200 border border-yellow-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-yellow-700 transition-colors">DRAFT/25-26/002369</a>
                    <a href="#" className="rounded bg-yellow-100 hover:bg-yellow-200 border border-yellow-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-yellow-700 transition-colors">DRAFT/25-26/002370</a>
                    <a href="#" className="rounded bg-yellow-100 hover:bg-yellow-200 border border-yellow-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-yellow-700 transition-colors">DRAFT/25-26/002371</a>
                    <a href="#" className="rounded bg-yellow-100 hover:bg-yellow-200 border border-yellow-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-yellow-700 transition-colors">DRAFT/25-26/002372</a>
                    <a href="#" className="rounded bg-yellow-100 hover:bg-yellow-200 border border-yellow-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-yellow-700 transition-colors">DRAFT/25-26/002373</a>
                  </div>
                </div>
                {/* Appointments */}
                <div className="flex flex-col gap-2 rounded-lg border border-green-300 bg-green-50 p-2">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">📅</span>
                    <span className="text-[11px] font-bold text-green-600 uppercase tracking-wide">Appts</span>
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-transparent">
                    <a href="#" className="rounded bg-green-100 hover:bg-green-200 border border-green-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-green-700 transition-colors">APP/25-26/002369</a>
                    <a href="#" className="rounded bg-green-100 hover:bg-green-200 border border-green-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-green-700 transition-colors">APP/25-26/002370</a>
                    <a href="#" className="rounded bg-green-100 hover:bg-green-200 border border-green-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-green-700 transition-colors">APP/25-26/002371</a>
                    <a href="#" className="rounded bg-green-100 hover:bg-green-200 border border-green-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-green-700 transition-colors">APP/25-26/002372</a>
                    <a href="#" className="rounded bg-green-100 hover:bg-green-200 border border-green-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-green-700 transition-colors">APP/25-26/002373</a>
                  </div>
                </div>
                {/* Bills */}
                <div className="flex flex-col gap-2 rounded-lg border border-blue-300 bg-blue-50 p-2">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">🧾</span>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">Bills</span>
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                    <a href="#" className="rounded bg-blue-100 hover:bg-blue-200 border border-blue-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-blue-700 transition-colors">BILL/000783/2025-26</a>
                    <a href="#" className="rounded bg-blue-100 hover:bg-blue-200 border border-blue-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-blue-700 transition-colors">BILL/000784/2025-26</a>
                    <a href="#" className="rounded bg-blue-100 hover:bg-blue-200 border border-blue-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-blue-700 transition-colors">BILL/000785/2025-26</a>
                    <a href="#" className="rounded bg-blue-100 hover:bg-blue-200 border border-blue-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-blue-700 transition-colors">BILL/000786/2025-26</a>
                    <a href="#" className="rounded bg-blue-100 hover:bg-blue-200 border border-blue-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-blue-700 transition-colors">BILL/000787/2025-26</a>
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="flex justify-center gap-3 border-t border-gray-100 px-5 py-3.5">
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
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 border-b border-gray-100 px-5 py-3.5 text-center">
                <p className="text-sm font-semibold text-gray-700">
                  Already created today for{' '}
                  <span className="text-red-500">Rajat Katiyar</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Do you still wish to continue?</p>
              </div>
              {/* 3 Columns */}
              <div className="grid grid-cols-3 gap-3 p-4">
                {/* Drafts */}
                <div className="flex flex-col gap-2 rounded-lg border border-yellow-300 bg-yellow-50 p-2">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">📝</span>
                    <span className="text-[11px] font-bold text-yellow-600 uppercase tracking-wide">Drafts</span>
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-200 scrollbar-track-transparent">
                    <a href="#" className="rounded bg-yellow-100 hover:bg-yellow-200 border border-yellow-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-yellow-700 transition-colors">DRAFT/25-26/002369</a>
                    <a href="#" className="rounded bg-yellow-100 hover:bg-yellow-200 border border-yellow-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-yellow-700 transition-colors">DRAFT/25-26/002370</a>
                    <a href="#" className="rounded bg-yellow-100 hover:bg-yellow-200 border border-yellow-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-yellow-700 transition-colors">DRAFT/25-26/002371</a>
                    <a href="#" className="rounded bg-yellow-100 hover:bg-yellow-200 border border-yellow-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-yellow-700 transition-colors">DRAFT/25-26/002372</a>
                    <a href="#" className="rounded bg-yellow-100 hover:bg-yellow-200 border border-yellow-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-yellow-700 transition-colors">DRAFT/25-26/002373</a>
                  </div>
                </div>
                {/* Appointments */}
                <div className="flex flex-col gap-2 rounded-lg border border-green-300 bg-green-50 p-2">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">📅</span>
                    <span className="text-[11px] font-bold text-green-600 uppercase tracking-wide">Appts</span>
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-transparent">
                    <a href="#" className="rounded bg-green-100 hover:bg-green-200 border border-green-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-green-700 transition-colors">APP/25-26/002369</a>
                    <a href="#" className="rounded bg-green-100 hover:bg-green-200 border border-green-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-green-700 transition-colors">APP/25-26/002370</a>
                    <a href="#" className="rounded bg-green-100 hover:bg-green-200 border border-green-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-green-700 transition-colors">APP/25-26/002371</a>
                    <a href="#" className="rounded bg-green-100 hover:bg-green-200 border border-green-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-green-700 transition-colors">APP/25-26/002372</a>
                    <a href="#" className="rounded bg-green-100 hover:bg-green-200 border border-green-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-green-700 transition-colors">APP/25-26/002373</a>
                  </div>
                </div>
                {/* Bills */}
                <div className="flex flex-col gap-2 rounded-lg border border-blue-300 bg-blue-50 p-2">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">🧾</span>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">Bills</span>
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                    <a href="#" className="rounded bg-blue-100 hover:bg-blue-200 border border-blue-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-blue-700 transition-colors">BILL/000783/2025-26</a>
                    <a href="#" className="rounded bg-blue-100 hover:bg-blue-200 border border-blue-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-blue-700 transition-colors">BILL/000784/2025-26</a>
                    <a href="#" className="rounded bg-blue-100 hover:bg-blue-200 border border-blue-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-blue-700 transition-colors">BILL/000785/2025-26</a>
                    <a href="#" className="rounded bg-blue-100 hover:bg-blue-200 border border-blue-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-blue-700 transition-colors">BILL/000786/2025-26</a>
                    <a href="#" className="rounded bg-blue-100 hover:bg-blue-200 border border-blue-200 py-1.5 px-1.5 text-center text-[10px] font-semibold text-blue-700 transition-colors">BILL/000787/2025-26</a>
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="flex justify-center gap-3 border-t border-gray-100 px-5 py-3.5">
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

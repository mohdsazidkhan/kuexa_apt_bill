import { useMemo, useState, useEffect } from 'react'
import { customers } from '../data/services'
import { IconUsers, IconSearch, IconClose } from './Icons'
import AddCustomerModal from './AddCustomerModal'

const isPhoneQuery = (q) => /\d/.test(q) && /^[\d+\-\s]+$/.test(q)

export default function CustomerSearch({ value, onChange }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [addInitial, setAddInitial] = useState({})
  const [promptedQuery, setPromptedQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers.slice(0, 6)
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    )
  }, [query])

  const pick = (c) => {
    onChange?.(c)
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
        <div className="flex h-[34px] items-center justify-between rounded-md border border-gray-200 bg-white px-3">
          <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <IconUsers width={16} height={16} className="text-gray-400" />
            {value.name}
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
      <div className="relative">
        <IconSearch width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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

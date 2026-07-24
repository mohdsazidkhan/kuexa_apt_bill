import { IconMenu, IconSearch, IconBell } from './Icons'

// Shared top navbar — used across pages (Billing, Appointments, …).
export default function TopBar({ title }) {
  return (
    <div className="flex items-center gap-4 border-b border-gray-200 bg-white px-6 py-3">
      <button className="text-gray-500 hover:text-gray-800"><IconMenu width={20} height={20} /></button>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="font-medium">KUEXA</span>
        <span>›</span>
        <span className="font-semibold text-gray-800">{title}</span>
      </div>
      <div className="relative ml-4 hidden max-w-md flex-1 md:block">
        <IconSearch width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input placeholder="Search..." className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-indigo-400" />
      </div>
      <div className="ml-auto flex items-center gap-4">
        <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600">Tweak Khan Market ▾</button>
        <button className="relative text-gray-500 hover:text-gray-800">
          <IconBell width={20} height={20} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white">8</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white">M</div>
          <span className="hidden text-sm font-medium text-gray-700 lg:block">Mohd Sazid Khan</span>
        </div>
      </div>
    </div>
  )
}

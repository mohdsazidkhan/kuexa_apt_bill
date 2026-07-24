import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  IconDashboard, IconOperations, IconCalendar, IconUsers, IconBilling,
  IconMasters, IconHR, IconFinance, IconMarketing, IconConfig,
  IconAnalytics, IconSettings, IconChevron,
} from './Icons'

const groups = [
  { label: 'Dashboard', icon: IconDashboard, to: '/dashboard' },
  {
    label: 'Operations', icon: IconOperations, defaultOpen: true,
    children: [
      { label: 'Appointments', icon: IconCalendar, to: '/appointment' },
      { label: 'Customers', icon: IconUsers, to: '/customers' },
      { label: 'Billing', icon: IconBilling, to: '/billing' },
    ],
  },
  { label: 'Masters', icon: IconMasters, children: [] },
  { label: 'HR', icon: IconHR, children: [] },
  { label: 'Finance', icon: IconFinance, children: [] },
  { label: 'Marketing', icon: IconMarketing, children: [] },
  { label: 'Configuration', icon: IconConfig, children: [] },
  { label: 'Analytics', icon: IconAnalytics, children: [] },
  { label: 'Settings', icon: IconSettings, to: '/settings' },
]

function LeafLink({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
          isActive
            ? 'bg-indigo-600/90 text-white shadow-sm shadow-indigo-900/50'
            : 'text-slate-300/90 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <Icon width={18} height={18} />
      <span>{label}</span>
    </NavLink>
  )
}

function Group({ group }) {
  const [open, setOpen] = useState(group.defaultOpen ?? false)
  const Icon = group.icon

  if (group.to) return <LeafLink to={group.to} icon={Icon} label={group.label} />

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300/90 transition-colors hover:bg-white/5 hover:text-white"
      >
        <Icon width={18} height={18} />
        <span className="flex-1 text-left">{group.label}</span>
        <IconChevron
          width={16}
          height={16}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && group.children.length > 0 && (
        <div className="mt-1 space-y-1 pl-4">
          {group.children.map((c) => (
            <LeafLink key={c.label} to={c.to} icon={c.icon} label={c.label} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-gradient-to-b from-[#141a2e] to-[#0d1120] text-white">
      <div className="px-6 py-6">
        <span className="text-2xl font-semibold tracking-tight">Kuexa</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {groups.map((g) => (
          <Group key={g.label} group={g} />
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold">
            M
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium">Mohd Sazid Khan</div>
            <div className="text-xs text-slate-400">mohdsazidkhan</div>
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-500">Powered by KUEXA · v1.0.0</div>
      </div>
    </aside>
  )
}

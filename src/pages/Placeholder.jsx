export default function Placeholder({ title }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-600">
        {title?.[0] ?? 'K'}
      </div>
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-400">
        This is a placeholder screen. The Appointment and Billing modules are fully built.
      </p>
    </div>
  )
}

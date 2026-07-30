import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Appointments from './pages/Appointments'
import Billing from './pages/Billing'
import Payments from './pages/Payments'
import Placeholder from './pages/Placeholder'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50 text-gray-900">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-x-hidden px-6 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/appointment" replace />} />
            <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
            <Route path="/appointment" element={<Appointments />} />
            <Route path="/customers" element={<Placeholder title="Customers" />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
            <Route path="*" element={<Placeholder title="Not Found" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

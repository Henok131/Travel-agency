import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import ensureGlobalFlatpickr from './utils/flatpickrLoader'
import CreateRequest from './pages/CreateRequest'
import RequestsList from './pages/RequestsList'
import MainTable from './pages/MainTable'
import ExpensesList from './pages/ExpensesList'
import Dashboard from './pages/Dashboard'
import InvoicesList from './pages/InvoicesList'
import BookingsList from './pages/BookingsList'
import CustomersList from './pages/CustomersList'
import BankList from './pages/BankList'
import TaxPage from './pages/TaxPage'
import Settings from './pages/Settings'
import DocsViewer from './components/DocsViewer'
import CalculatorDashboard from './pages/CalculatorDashboard'

function App() {
  useEffect(() => {
    ensureGlobalFlatpickr()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<RequestsList />} />
      <Route path="/requests" element={<RequestsList />} />
      <Route path="/requests/new" element={<CreateRequest />} />
      <Route path="/main" element={<MainTable />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/expenses" element={<ExpensesList />} />
      <Route path="/invoices" element={<InvoicesList />} />
      <Route path="/bookings" element={<BookingsList />} />
      <Route path="/customers" element={<CustomersList />} />
      <Route path="/bank" element={<BankList />} />
      <Route path="/tax" element={<TaxPage />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/docs/:docId" element={<DocsViewer />} />
      <Route path="/calculators" element={<CalculatorDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

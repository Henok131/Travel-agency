import { Routes, Route, Navigate } from 'react-router-dom'
import { isSupabaseConfigured } from './lib/supabaseClient'
import CreateRequest from './pages/CreateRequest'
import RequestsList from './pages/RequestsList'
import MainTable from './pages/MainTable'
import ExpensesList from './pages/ExpensesList'
import Dashboard from './pages/Dashboard'
import InvoicesList from './pages/InvoicesList'
import BookingsList from './pages/BookingsList'
import BookingDetail from './pages/BookingDetail'
import CustomersList from './pages/CustomersList'
import BankList from './pages/BankList'
import TaxPage from './pages/TaxPage'
import Settings from './pages/Settings'
import DocsViewer from './components/DocsViewer'
import CalculatorDashboard from './pages/CalculatorDashboard'
import Search from './pages/Search'

function App() {
  if (!isSupabaseConfigured) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
        background: '#f8f9fa',
        color: '#1a1a1a'
      }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <p style={{ fontSize: '1.125rem', marginBottom: 8 }}>Supabase is not configured correctly. Check VITE_SUPABASE_URL.</p>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file (https, no localhost).</p>
        </div>
      </div>
    )
  }

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
      <Route path="/bookings/:id" element={<BookingDetail />} />
      <Route path="/customers" element={<CustomersList />} />
      <Route path="/bank" element={<BankList />} />
      <Route path="/tax" element={<TaxPage />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/docs/:docId" element={<DocsViewer />} />
      <Route path="/calculators" element={<CalculatorDashboard />} />
      <Route path="/search" element={<Search />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

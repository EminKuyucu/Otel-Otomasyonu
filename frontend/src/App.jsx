import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './layout/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Rooms from './pages/Rooms'
import Customers from './pages/Customers'
import ReservationCreate from './pages/ReservationCreate'
import Stock from './pages/Stock'
import Services from './pages/Services'
import Payments from './pages/Payments'
import Reports from './pages/Reports'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/reservations/new" element={<ReservationCreate />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/services" element={<Services />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App


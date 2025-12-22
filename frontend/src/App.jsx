import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './layout/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Rooms from './pages/Rooms'
import Customers from './pages/Customers'
import Staff from './pages/Staff'
import Reservations from './pages/Reservations'
import ReservationCreate from './pages/ReservationCreate'
import Stock from './pages/Stock'
import Services from './pages/Services'
import Payments from './pages/Payments'
import Reports from './pages/Reports'
import Dashboard from './pages/Dashboard'
import PrivateRoute from './components/PrivateRoute'
import RoleGuard from './components/RoleGuard'
import { ROLES } from './contexts/AuthContext'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              {/* Dashboard - All authenticated users */}
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* ADMIN Only Routes */}
              <Route path="/staff" element={
                <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                  <Staff />
                </RoleGuard>
              } />
              <Route path="/payments" element={
                <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                  <Payments />
                </RoleGuard>
              } />
              <Route path="/reports" element={
                <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                  <Reports />
                </RoleGuard>
              } />

              {/* RECEPTION Routes (ADMIN + RECEPTION) */}
              <Route path="/rooms" element={
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.RECEPTION]}>
                  <Rooms />
                </RoleGuard>
              } />
              <Route path="/customers" element={
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.RECEPTION]}>
                  <Customers />
                </RoleGuard>
              } />
              <Route path="/reservations" element={
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.RECEPTION]}>
                  <Reservations />
                </RoleGuard>
              } />
              <Route path="/reservations/new" element={
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.RECEPTION]}>
                  <ReservationCreate />
                </RoleGuard>
              } />
              <Route path="/services" element={
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.RECEPTION]}>
                  <Services />
                </RoleGuard>
              } />

              {/* OPERATIONS Routes (ADMIN + OPERATIONS) */}
              <Route path="/stock" element={
                <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.OPERATIONS]}>
                  <Stock />
                </RoleGuard>
              } />
            </Route>
          </Route>

          {/* Unauthorized Access Page */}
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <div className="text-red-500 text-6xl mb-4">🚫</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Yetkisiz Erişim</h1>
                <p className="text-gray-600 mb-4">
                  Bu sayfaya erişim yetkiniz bulunmamaktadır.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Geri Dön
                </button>
              </div>
            </div>
          } />

          {/* 404 Page */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <div className="text-gray-500 text-6xl mb-4">📄</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">404 - Sayfa Bulunamadı</h1>
                <p className="text-gray-600 mb-4">
                  Aradığınız sayfa bulunamadı.
                </p>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Ana Sayfa
                </button>
              </div>
            </div>
          } />
        </Routes>
  )
}

export default App


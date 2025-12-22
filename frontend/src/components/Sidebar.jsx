import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth, ROLES } from '../contexts/AuthContext'

// Role-based navigation links
const getNavigationLinks = (userRole) => {
  const allLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊', roles: [ROLES.ADMIN, ROLES.RECEPTION, ROLES.OPERATIONS] },

    // ADMIN only links
    { to: '/staff', label: 'Personel', icon: '👥', roles: [ROLES.ADMIN] },
    { to: '/payments', label: 'Ödemeler', icon: '💰', roles: [ROLES.ADMIN] },
    { to: '/reports', label: 'Raporlar', icon: '📈', roles: [ROLES.ADMIN] },

    // RECEPTION links (ADMIN + RECEPTION)
    { to: '/rooms', label: 'Odalar', icon: '🏨', roles: [ROLES.ADMIN, ROLES.RECEPTION] },
    { to: '/customers', label: 'Müşteriler', icon: '👤', roles: [ROLES.ADMIN, ROLES.RECEPTION] },
    { to: '/reservations', label: 'Rezervasyonlar', icon: '📅', roles: [ROLES.ADMIN, ROLES.RECEPTION] },
    { to: '/reservations/new', label: 'Rezervasyon Oluştur', icon: '➕', roles: [ROLES.ADMIN, ROLES.RECEPTION] },
    { to: '/services', label: 'Ekstra Hizmetler', icon: '🛎️', roles: [ROLES.ADMIN, ROLES.RECEPTION] },

    // OPERATIONS links (ADMIN + OPERATIONS)
    { to: '/stock', label: 'Stok Yönetimi', icon: '📦', roles: [ROLES.ADMIN, ROLES.OPERATIONS] },
  ]

  return allLinks.filter(link => link.roles.includes(userRole))
}

function Sidebar() {
  const navigate = useNavigate()
  const { user, role, logout } = useAuth()
  const navigationLinks = getNavigationLinks(role)

  const handleLogout = () => {
    logout() // Clear auth state
    navigate('/login') // Navigate to login page
  }

  const getRoleDisplayName = (role) => {
    const roleNames = {
      [ROLES.ADMIN]: 'Yönetici',
      [ROLES.RECEPTION]: 'Resepsiyon',
      [ROLES.OPERATIONS]: 'Operasyon'
    }
    return roleNames[role] || role
  }

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen sticky top-0 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-blue-600">Otel Admin</h1>
        {user && (
          <div className="mt-2">
            <div className="text-sm font-medium text-gray-800">{user.ad_soyad}</div>
            <div className="text-xs text-gray-500">Rol: {getRoleDisplayName(role)}</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navigationLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <span className="mr-3">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <span className="mr-3">🚪</span>
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}

export default Sidebar


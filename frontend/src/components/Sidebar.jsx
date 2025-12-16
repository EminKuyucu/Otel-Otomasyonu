import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/rooms', label: 'Odalar' },
  { to: '/customers', label: 'Müşteriler' },
  { to: '/staff', label: 'Personel' },
  { to: '/reservations', label: 'Rezervasyonlar' },
  { to: '/reservations/new', label: 'Rezervasyon Oluştur' },
  { to: '/stock', label: 'Stok' },
  { to: '/services', label: 'Ekstra Hizmetler' },
  { to: '/payments', label: 'Ödemeler' },
  { to: '/reports', label: 'Raporlar' },
]

function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md min-h-screen sticky top-0">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-blue-600">Otel Admin</h1>
      </div>
      <nav className="p-2 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar


import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const name = user?.ad_soyad || 'Personel'

  const handleLogout = () => {
    logout() // Clear auth state
    navigate('/login') // Navigate to login page
  }

  return (
    <header className="bg-white shadow p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Admin Panel</p>
        <h2 className="text-lg font-semibold text-gray-800">Hoş geldiniz</h2>
      </div>
      <div className="flex items-center space-x-3">
        <div className="flex flex-col text-right">
          <span className="text-sm font-medium text-gray-800">{name}</span>
          <span className="text-xs text-gray-500">Otel Otomasyonu</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md"
        >
          Çıkış
        </button>
      </div>
    </header>
  )
}

export default Header


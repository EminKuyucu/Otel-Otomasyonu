import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { dashboardService } from '../services/api'
import { getUser } from '../services/authService'
import {
  Home,
  Calendar,
  Bed,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  User,
  LogOut,
  Plus,
  Search,
  Bell,
  ChevronDown,
  CalendarDays,
  Users as UsersIcon,
  DoorOpen,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

const Dashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  // Dashboard verileri için state
  const [stats, setStats] = useState([])
  const [activeReservations, setActiveReservations] = useState([])
  const [todaysEvents, setTodaysEvents] = useState([])
  const [dashboardData, setDashboardData] = useState(null)

  // Kullanıcı bilgilerini ve dashboard verilerini yükle
  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Paralel olarak tüm dashboard verilerini çek
      const [statsResponse, reservationsResponse, eventsResponse] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getActiveReservations(),
        dashboardService.getTodaysEvents()
      ])

      if (statsResponse.success) {
        const statsData = statsResponse.data
        setDashboardData(statsData)

        // İstatistik kartlarını oluştur
        const newStats = [
          { title: 'Toplam Rezervasyon', value: statsData.total_reservations.toString(), icon: Calendar, color: 'text-blue-600' },
          { title: 'Dolu Odalar', value: statsData.occupied_rooms.toString(), icon: DoorOpen, color: 'text-red-600' },
          { title: 'Müsait Odalar', value: statsData.available_rooms.toString(), icon: Bed, color: 'text-green-600' },
          { title: 'Bugünkü Girişler', value: statsData.todays_checkins.toString(), icon: TrendingUp, color: 'text-purple-600' }
        ]
        setStats(newStats)
      }

      if (reservationsResponse.success) {
        setActiveReservations(reservationsResponse.data)
      }

      if (eventsResponse.success) {
        setTodaysEvents(eventsResponse.data)
      }

    } catch (err) {
      console.error('Dashboard verileri yüklenirken hata:', err)

      // Daha detaylı hata mesajı
      let errorMessage = 'Dashboard verileri yüklenirken bir hata oluştu.'
      if (err.response?.status === 401) {
        errorMessage = 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.'
      } else if (err.response?.status === 500) {
        errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.'
      } else if (!err.response) {
        errorMessage = 'Sunucuya bağlanılamıyor. Backend\'in çalıştığından emin olun.'
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      }

      setError(errorMessage)

      // Hata durumunda boş veriler göster
      setStats([
        { title: 'Toplam Rezervasyon', value: '0', icon: Calendar, color: 'text-blue-600' },
        { title: 'Dolu Odalar', value: '0', icon: DoorOpen, color: 'text-red-600' },
        { title: 'Müsait Odalar', value: '0', icon: Bed, color: 'text-green-600' },
        { title: 'Bugünkü Girişler', value: '0', icon: TrendingUp, color: 'text-purple-600' }
      ])
      setActiveReservations([])
      setTodaysEvents([])
    } finally {
      setLoading(false)
    }
  }

  // Buton click handler'ları
  const handleNewReservation = () => {
    navigate('/reservations')
  }

  const handleAddRoom = () => {
    navigate('/rooms')
  }

  const handleAddCustomer = () => {
    navigate('/customers')
  }

  // Sabit duyurular (şimdilik hardcoded, ileride backend'den çekilebilir)
  const announcements = [
    { type: 'info', message: 'Oda 205 temizlik için hazırlandı.', time: '10:30' },
    { type: 'warning', message: 'Rezervasyon 123 için ödeme bekleniyor.', time: '09:15' },
    { type: 'success', message: 'Yeni müşteri kaydı tamamlandı.', time: '08:45' }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aktif': return 'bg-green-100 text-green-800'
      case 'Bekliyor': return 'bg-yellow-100 text-yellow-800'
      case 'İptal': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'checkin': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'checkout': return <XCircle className="w-4 h-4 text-blue-600" />
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getAnnouncementIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'info': return <Bell className="w-4 h-4 text-blue-600" />
      default: return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-white text-xl font-bold">Otel Otomasyonu</h1>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <Link to="/" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <Home className="w-4 h-4 mr-2" />
                    Ana Sayfa
                  </Link>
                  <Link to="/reservations" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Rezervasyonlar
                  </Link>
                  <Link to="/rooms" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <Bed className="w-4 h-4 mr-2" />
                    Odalar
                  </Link>
                  <Link to="/customers" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Müşteriler
                  </Link>
                  <Link to="/payments" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Ödemeler
                  </Link>
                  <Link to="/reports" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Raporlar
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-white hover:bg-blue-700 p-2 rounded-md">
                <Bell className="w-5 h-5" />
              </button>
              <div className="relative">
                <button className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Profil
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-cover bg-center h-64" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80)'}}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            Hoşgeldiniz {user?.ad_soyad || 'Kullanıcı'}!
          </h1>
          <p className="text-xl text-gray-200 mb-8">Bugün otel yönetimini kolaylaştırın.</p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleNewReservation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Yeni Rezervasyon
            </button>
            <button
              onClick={handleAddRoom}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors duration-200"
            >
              <Bed className="w-5 h-5 mr-2" />
              Oda Ekle
            </button>
            <button
              onClick={handleAddCustomer}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors duration-200"
            >
              <UsersIcon className="w-5 h-5 mr-2" />
              Müşteri Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Reservations */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Aktif Rezervasyonlar</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İsim</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oda</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeReservations.length > 0 ? (
                      activeReservations.map((reservation) => (
                        <tr key={reservation.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reservation.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.room}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {reservation.checkin_date ? new Date(reservation.checkin_date).toLocaleDateString('tr-TR') : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                              {reservation.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                          {loading ? 'Yükleniyor...' : 'Aktif rezervasyon bulunamadı.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Occupancy Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Doluluk Oranı</h3>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <svg className="w-32 h-32" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      strokeDasharray={`${dashboardData ? dashboardData.occupancy_rate : 0}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {dashboardData ? `${dashboardData.occupancy_rate}%` : '0%'}
                      </div>
                      <div className="text-sm text-gray-500">Dolu</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-8">
            {/* Today's Events */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Bugünkü Giriş & Çıkışlar</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {todaysEvents.length > 0 ? (
                  todaysEvents.map((event, index) => (
                    <div key={index} className="px-6 py-4 flex items-center">
                      {getEventIcon(event.type)}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{event.name}</p>
                        <p className="text-sm text-gray-500">Oda {event.room} - {event.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-4 text-center text-sm text-gray-500">
                    {loading ? 'Yükleniyor...' : 'Bugün için olay bulunamadı.'}
                  </div>
                )}
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Duyurular</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {announcements.map((announcement, index) => (
                  <div key={index} className="px-6 py-4 flex items-start">
                    {getAnnouncementIcon(announcement.type)}
                    <div className="ml-3">
                      <p className="text-sm text-gray-900">{announcement.message}</p>
                      <p className="text-xs text-gray-500">{announcement.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
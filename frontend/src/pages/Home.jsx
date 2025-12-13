import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/rooms"
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Oda Yönetimi</h2>
          <p className="text-sm text-gray-600">Odaları görüntüle, ekle, düzenle</p>
        </Link>

        <Link
          to="/customers"
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Müşteri Yönetimi</h2>
          <p className="text-sm text-gray-600">Müşteri kayıtlarını yönet</p>
        </Link>

        <Link
          to="/staff"
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Personel Yönetimi</h2>
          <p className="text-sm text-gray-600">Personel hesaplarını yönet</p>
        </Link>

        <Link
          to="/reservations/new"
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Rezervasyon Oluştur</h2>
          <p className="text-sm text-gray-600">Yeni rezervasyon kaydı oluştur</p>
        </Link>

        <Link
          to="/stock"
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Stok Yönetimi</h2>
          <p className="text-sm text-gray-600">Depo stoklarını takip et</p>
        </Link>

        <Link
          to="/services"
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Ekstra Hizmetler</h2>
          <p className="text-sm text-gray-600">Hizmetleri yönet</p>
        </Link>

        <Link
          to="/payments"
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Ödemeler</h2>
          <p className="text-sm text-gray-600">Ödeme kayıtlarını görüntüle</p>
        </Link>

        <Link
          to="/reports"
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Raporlar</h2>
          <p className="text-sm text-gray-600">Raporları görüntüle</p>
        </Link>
      </div>
    </div>
  )
}

export default Home

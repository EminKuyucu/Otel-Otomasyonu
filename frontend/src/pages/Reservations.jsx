import { useEffect, useState } from 'react'
import { rezervasyonService } from '../services/rezervasyonService'
import { musteriService } from '../services/musteriService'
import { odaService } from '../services/odaService'

function Reservations() {
  const [reservations, setReservations] = useState([])
  const [customers, setCustomers] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingReservation, setEditingReservation] = useState(null)
  const [reservationStatuses, setReservationStatuses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [formData, setFormData] = useState({
    musteri_id: '',
    oda_id: '',
    giris_tarihi: '',
    cikis_tarihi: '',
    yetiskin_sayisi: 1,
    cocuk_sayisi: 0,
    rezervasyon_durumu: 'Aktif',
  })

  const fetchReservationOptions = async () => {
    try {
      const res = await rezervasyonService.getOptions()
      setReservationStatuses(res.data?.statuses || ['Bekliyor', 'Aktif', 'Tamamlandı', 'İptal'])
    } catch (err) {
      console.error('Rezervasyon seçenekleri yüklenemedi:', err)
      setReservationStatuses(['Bekliyor', 'Aktif', 'Tamamlandı', 'İptal'])
    }
  }

  const fetchReservations = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await rezervasyonService.getAll()
      setReservations(res.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Rezervasyonlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomersAndRooms = async () => {
    try {
      const [customersRes, roomsRes] = await Promise.all([
        musteriService.getAll(),
        odaService.getAll(),
      ])
      setCustomers(customersRes.data || [])
      setRooms(roomsRes.data || [])
    } catch (err) {
      console.error('Veri yüklenemedi:', err)
    }
  }

  useEffect(() => {
    fetchReservations()
    fetchCustomersAndRooms()
    fetchReservationOptions()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingReservation) {
        await rezervasyonService.update(editingReservation.rezervasyon_id, formData)
      } else {
        await rezervasyonService.create(formData)
      }
      setShowForm(false)
      setEditingReservation(null)
      setFormData({
        musteri_id: '',
        oda_id: '',
        giris_tarihi: '',
        cikis_tarihi: '',
        yetiskin_sayisi: 1,
        cocuk_sayisi: 0,
        rezervasyon_durumu: 'Aktif',
      })
      fetchReservations()
    } catch (err) {
      setError(err.response?.data?.error || 'İşlem başarısız')
    }
  }

  const handleEdit = (reservation) => {
    setEditingReservation(reservation)
    setFormData({
      musteri_id: reservation.musteri_id,
      oda_id: reservation.oda_id,
      giris_tarihi: reservation.giris_tarihi?.split('T')[0],
      cikis_tarihi: reservation.cikis_tarihi?.split('T')[0],
      yetiskin_sayisi: reservation.yetiskin_sayisi || 1,
      cocuk_sayisi: reservation.cocuk_sayisi || 0,
      rezervasyon_durumu: reservation.rezervasyon_durumu || 'Aktif',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu rezervasyonu silmek istediğinize emin misiniz?')) return
    try {
      await rezervasyonService.delete(id)
      fetchReservations()
    } catch (err) {
      setError(err.response?.data?.error || 'Silme işlemi başarısız')
    }
  }

  const getCustomerName = (id) => {
    const customer = customers.find((c) => c.musteri_id === id)
    return customer ? `${customer.ad} ${customer.soyad}` : 'Bilinmiyor'
  }

  const getRoomNumber = (id) => {
    const room = rooms.find((r) => r.oda_id === id)
    return room ? room.oda_no : 'Bilinmiyor'
  }

  const getStatusColor = (status) => {
    const colors = {
      'Aktif': 'bg-blue-100 text-blue-800',
      'Bekliyor': 'bg-yellow-100 text-yellow-800',
      'İptal': 'bg-red-100 text-red-800',
      'Tamamlandı': 'bg-green-100 text-green-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Rezervasyonlar</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingReservation(null)
            setFormData({
              musteri_id: '',
              oda_id: '',
              giris_tarihi: '',
              cikis_tarihi: '',
              yetiskin_sayisi: 1,
              cocuk_sayisi: 0,
              rezervasyon_durumu: 'Aktif',
            })
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Yeni Rezervasyon
        </button>
      </div>

      {/* Arama ve Filtre */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Müşteri Adı, Oda No Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Tüm Durumlar</option>
              {reservationStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {showForm && (
        <div className="mb-6 p-4 bg-white border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">
            {editingReservation ? 'Rezervasyon Düzenle' : 'Yeni Rezervasyon'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Müşteri</label>
                <select
                  required
                  value={formData.musteri_id}
                  onChange={(e) => setFormData({ ...formData, musteri_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Seç...</option>
                  {customers.map((c) => (
                    <option key={c.musteri_id} value={c.musteri_id}>
                      {c.ad} {c.soyad}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Oda</label>
                <select
                  required
                  value={formData.oda_id}
                  onChange={(e) => setFormData({ ...formData, oda_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Seç...</option>
                  {rooms.map((r) => (
                    <option key={r.oda_id} value={r.oda_id}>
                      Oda {r.oda_no} - {r.fiyat} ₺
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Giriş Tarihi</label>
                <input
                  type="date"
                  required
                  value={formData.giris_tarihi}
                  onChange={(e) => setFormData({ ...formData, giris_tarihi: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Çıkış Tarihi</label>
                <input
                  type="date"
                  required
                  value={formData.cikis_tarihi}
                  onChange={(e) => setFormData({ ...formData, cikis_tarihi: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Yetişkin</label>
                <input
                  type="number"
                  min="1"
                  value={formData.yetiskin_sayisi}
                  onChange={(e) => setFormData({ ...formData, yetiskin_sayisi: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Çocuk</label>
                <input
                  type="number"
                  min="0"
                  value={formData.cocuk_sayisi}
                  onChange={(e) => setFormData({ ...formData, cocuk_sayisi: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Durum</label>
                <select
                  required
                  value={formData.rezervasyon_durumu}
                  onChange={(e) => setFormData({ ...formData, rezervasyon_durumu: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Seç...</option>
                  {reservationStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Kaydet
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="text-center py-8">Yükleniyor...</div>}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Oda</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giriş</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Çıkış</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations
              .filter((reservation) => {
                const customerName = getCustomerName(reservation.musteri_id).toLowerCase()
                const roomNumber = getRoomNumber(reservation.oda_id).toString()
                const matchSearch = customerName.includes(searchTerm.toLowerCase()) || roomNumber.includes(searchTerm)
                const matchStatus = !filterStatus || reservation.rezervasyon_durumu === filterStatus
                return matchSearch && matchStatus
              })
              .map((reservation) => (
              <tr key={reservation.rezervasyon_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {getCustomerName(reservation.musteri_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getRoomNumber(reservation.oda_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(reservation.giris_tarihi).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(reservation.cikis_tarihi).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {reservation.toplam_ucret} ₺
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(reservation.rezervasyon_durumu)}`}>
                    {reservation.rezervasyon_durumu}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(reservation)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(reservation.rezervasyon_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Reservations

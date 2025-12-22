import { useEffect, useState } from 'react'
import { rezervasyonService } from '../services/rezervasyonService'
import { musteriService } from '../services/musteriService'
import { odaService } from '../services/odaService'
import { hizmetService } from '../services/hizmetService'
import { odemeService } from '../services/odemeService'

function Reservations() {
  const [reservations, setReservations] = useState([])
  const [customers, setCustomers] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingReservation, setEditingReservation] = useState(null)
  const [reservationStatuses, setReservationStatuses] = useState([])
  const [formData, setFormData] = useState({
    musteri_id: '',
    oda_id: '',
    giris_tarihi: '',
    cikis_tarihi: '',
    yetiskin_sayisi: 1,
    cocuk_sayisi: 0,
    rezervasyon_tipi: 'Kapıdan',
    rezervasyon_durumu: 'Aktif',
  })
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [dateConflict, setDateConflict] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)

  // Ekstra hizmetler için state'ler
  const [services, setServices] = useState([])
  const [selectedReservationId, setSelectedReservationId] = useState(null)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [serviceForm, setServiceForm] = useState({
    hizmet_id: '',
    adet: 1,
  })

  // Rezervasyon detay ve ödemeler için state'ler
  const [showReservationDetail, setShowReservationDetail] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [reservationPayments, setReservationPayments] = useState([])
  const [reservationExpenses, setReservationExpenses] = useState([])
  const [reservationReview, setReservationReview] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ puan: 5, yorum: '' })

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

  const fetchServices = async () => {
    try {
      const res = await hizmetService.getAll()
      setServices(res.data || [])
    } catch (err) {
      console.error('Hizmetler yüklenemedi:', err)
    }
  }

  useEffect(() => {
    fetchReservations()
    fetchCustomersAndRooms()
    fetchReservationOptions()
    fetchServices()
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
        rezervasyon_tipi: 'Kapıdan',
        rezervasyon_durumu: 'Aktif',
      })
      setSelectedCustomer(null)
      setDateConflict('')
      setTotalPrice(0)
      fetchReservations()
    } catch (err) {
      setError(err.response?.data?.error || 'İşlem başarısız')
    }
  }

  const handleEdit = (reservation) => {
    setEditingReservation(reservation)
    const customer = customers.find(c => c.musteri_id === reservation.musteri_id)
    setSelectedCustomer(customer)

    setFormData({
      musteri_id: reservation.musteri_id,
      oda_id: reservation.oda_id,
      giris_tarihi: reservation.giris_tarihi?.split('T')[0],
      cikis_tarihi: reservation.cikis_tarihi?.split('T')[0],
      yetiskin_sayisi: reservation.yetiskin_sayisi || 1,
      cocuk_sayisi: reservation.cocuk_sayisi || 0,
      rezervasyon_tipi: reservation.rezervasyon_tipi || 'Kapıdan',
      rezervasyon_durumu: reservation.rezervasyon_durumu || 'Aktif',
    })
    calculateTotalPrice(reservation.oda_id, reservation.giris_tarihi?.split('T')[0], reservation.cikis_tarihi?.split('T')[0])
    setShowForm(true)
  }


  // Toplam fiyat hesaplama
  const calculateTotalPrice = async (odaId, girisTarihi, cikisTarihi) => {
    if (!odaId || !girisTarihi || !cikisTarihi) {
      setTotalPrice(0)
      return
    }

    try {
      const oda = rooms.find(r => r.oda_id === parseInt(odaId))
      if (!oda) {
        setTotalPrice(0)
        return
      }

      const startDate = new Date(girisTarihi)
      const endDate = new Date(cikisTarihi)
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))

      if (days > 0) {
        setTotalPrice(days * parseFloat(oda.fiyat))
      } else {
        setTotalPrice(0)
      }
    } catch (err) {
      setTotalPrice(0)
    }
  }

  // Tarih çakışma kontrolü
  const checkDateConflict = async (odaId, girisTarihi, cikisTarihi, excludeId = null) => {
    if (!odaId || !girisTarihi || !cikisTarihi) {
      setDateConflict('')
      return
    }

    try {
      const response = await rezervasyonService.checkAvailability(odaId, girisTarihi, cikisTarihi, excludeId)
      if (!response.data.available) {
        setDateConflict('Bu tarihlerde oda müsait değil!')
      } else {
        setDateConflict('')
      }
    } catch (err) {
      setDateConflict('Tarih kontrol edilemedi')
    }
  }

  // Kişi sayısı validasyonu
  const validatePersonCount = (yetiskin, cocuk) => {
    const total = (yetiskin || 0) + (cocuk || 0)
    return total > 0 && total <= 6 // Maksimum 6 kişi
  }

  // Form değişiklik handler'ı
  const handleFormChange = (field, value) => {
    setFormData({...formData, [field]: value})

    // Otomatik hesaplamalar
    if (field === 'oda_id' || field === 'giris_tarihi' || field === 'cikis_tarihi') {
      calculateTotalPrice(
        field === 'oda_id' ? value : formData.oda_id,
        field === 'giris_tarihi' ? value : formData.giris_tarihi,
        field === 'cikis_tarihi' ? value : formData.cikis_tarihi
      )

      checkDateConflict(
        field === 'oda_id' ? value : formData.oda_id,
        field === 'giris_tarihi' ? value : formData.giris_tarihi,
        field === 'cikis_tarihi' ? value : formData.cikis_tarihi,
        editingReservation?.rezervasyon_id
      )
    }
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

      {/* Removed search and filter section - now shows all reservations */}

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {showForm && (
        <div className="mb-6 p-4 bg-white border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">
            {editingReservation ? 'Rezervasyon Düzenle' : 'Yeni Rezervasyon'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Müşteri Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Müşteri Seçimi *</label>
              <select
                required
                value={formData.musteri_id}
                onChange={(e) => {
                  const selectedId = e.target.value
                  setFormData({...formData, musteri_id: selectedId})
                  const customer = customers.find(c => c.musteri_id === parseInt(selectedId))
                  setSelectedCustomer(customer)
                }}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Müşteri Seçin</option>
                {customers.map((customer) => (
                  <option key={customer.musteri_id} value={customer.musteri_id}>
                    {customer.ad} {customer.soyad} - {customer.tc_kimlik_no}
                  </option>
                ))}
              </select>

              {selectedCustomer && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                  <div className="text-sm text-green-800">
                    <strong>Seçili Müşteri:</strong> {selectedCustomer.ad} {selectedCustomer.soyad}
                    <br />
                    <strong>TC:</strong> {selectedCustomer.tc_kimlik_no} | <strong>Tel:</strong> {selectedCustomer.telefon}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Oda Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Oda *</label>
                <select
                  required
                  value={formData.oda_id}
                  onChange={(e) => handleFormChange('oda_id', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Oda Seçin</option>
                  {rooms.map((r) => (
                    <option key={r.oda_id} value={r.oda_id}>
                      Oda {r.oda_no} - {r.tip} (₺{r.fiyat}/gün)
                    </option>
                  ))}
                </select>
              </div>

              {/* Rezervasyon Tipi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rezervasyon Tipi *</label>
                <select
                  required
                  value={formData.rezervasyon_tipi}
                  onChange={(e) => handleFormChange('rezervasyon_tipi', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Kapıdan">Kapıdan</option>
                  <option value="Online">Online</option>
                  <option value="Acente">Acente</option>
                  <option value="Ön Rezervasyon">Ön Rezervasyon</option>
                </select>
              </div>

              {/* Durum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durum *</label>
                <select
                  required
                  value={formData.rezervasyon_durumu}
                  onChange={(e) => handleFormChange('rezervasyon_durumu', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Durum Seçin</option>
                  {reservationStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tarihler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giriş Tarihi *</label>
                <input
                  required
                  type="date"
                  value={formData.giris_tarihi}
                  onChange={(e) => handleFormChange('giris_tarihi', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Çıkış Tarihi *</label>
                <input
                  required
                  type="date"
                  value={formData.cikis_tarihi}
                  onChange={(e) => handleFormChange('cikis_tarihi', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>

            {/* Kişi Sayısı */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yetişkin Sayısı *</label>
                <input
                  required
                  type="number"
                  min="1"
                  max="6"
                  value={formData.yetiskin_sayisi}
                  onChange={(e) => handleFormChange('yetiskin_sayisi', e.target.value)}
                  className={`w-full px-3 py-2 border rounded ${
                    !validatePersonCount(formData.yetiskin_sayisi, formData.cocuk_sayisi) ? 'border-red-500' : ''
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Çocuk Sayısı</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={formData.cocuk_sayisi}
                  onChange={(e) => handleFormChange('cocuk_sayisi', e.target.value)}
                  className={`w-full px-3 py-2 border rounded ${
                    !validatePersonCount(formData.yetiskin_sayisi, formData.cocuk_sayisi) ? 'border-red-500' : ''
                  }`}
                />
              </div>
            </div>

            {/* Validasyon ve Uyarılar */}
            {!validatePersonCount(formData.yetiskin_sayisi, formData.cocuk_sayisi) && (
              <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
                ⚠️ Toplam kişi sayısı 6'yı geçemez!
              </div>
            )}

            {dateConflict && (
              <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
                ⚠️ {dateConflict}
              </div>
            )}

            {/* Toplam Ücret Hesaplama */}
            {totalPrice > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-blue-800">
                    <strong>Toplam Tutar:</strong>
                    <br />
                    {(() => {
                      const startDate = new Date(formData.giris_tarihi)
                      const endDate = new Date(formData.cikis_tarihi)
                      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
                      const oda = rooms.find(r => r.oda_id === parseInt(formData.oda_id))
                      return `${days} gece × ₺${oda?.fiyat || 0} = ₺${totalPrice}`
                    })()}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    ₺{totalPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Form Butonları */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
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
            {reservations.map((reservation) => (
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

  // Ekstra hizmet harcama ekleme fonksiyonları
  const handleAddServiceExpense = async (e) => {
    e.preventDefault()
    if (!selectedReservationId || !serviceForm.hizmet_id) return

    try {
      const selectedService = services.find(s => s.hizmet_id === parseInt(serviceForm.hizmet_id))
      const harcamaData = {
        rezervasyon_id: selectedReservationId,
        hizmet_id: serviceForm.hizmet_id,
        adet: serviceForm.adet,
        toplam_fiyat: selectedService.birim_fiyat * serviceForm.adet
      }

      await hizmetService.createHarcama(harcamaData)
      setShowServiceForm(false)
      setServiceForm({ hizmet_id: '', adet: 1 })
      setSelectedReservationId(null)
      fetchReservations() // Listeyi yenile
    } catch (err) {
      setError(err.response?.data?.error || 'Harcama eklenemedi')
    }
  }
}

export default Reservations

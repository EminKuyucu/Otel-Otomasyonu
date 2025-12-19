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

  const handleOpenServiceForm = (reservationId) => {
    setSelectedReservationId(reservationId)
    setShowServiceForm(true)
    setServiceForm({ hizmet_id: '', adet: 1 })
  }

  const handleCloseServiceForm = () => {
    setShowServiceForm(false)
    setSelectedReservationId(null)
  }

  // Rezervasyon detay modalını açma
  const handleViewReservationDetail = async (reservation) => {
    setSelectedReservation(reservation)

    // Ödemeleri yükle
    try {
      const paymentsRes = await odemeService.getByReservation(reservation.rezervasyon_id)
      setReservationPayments(paymentsRes.data || [])
    } catch (err) {
      console.error('Ödemeler yüklenemedi:', err)
      setReservationPayments([])
    }

    // Harcamaları yükle
    try {
      const expensesRes = await hizmetService.getHarcamalar()
      const reservationExpenses = expensesRes.data.filter(
        expense => expense.rezervasyon_id === reservation.rezervasyon_id
      )
      setReservationExpenses(reservationExpenses || [])
    } catch (err) {
      console.error('Harcamalar yüklenemedi:', err)
      setReservationExpenses([])
    }

    // Değerlendirmeyi yükle (sadece tamamlanan rezervasyonlar için)
    if (reservation.rezervasyon_durumu === 'Tamamlandı') {
      try {
        const reviewRes = await rezervasyonService.getDegerlendirme(reservation.rezervasyon_id)
        setReservationReview(reviewRes.data)
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error('Değerlendirme yüklenemedi:', err)
        }
        setReservationReview(null)
      }
    } else {
      setReservationReview(null)
    }

    setShowReservationDetail(true)
  }

  const handleCloseReservationDetail = () => {
    setShowReservationDetail(false)
    setSelectedReservation(null)
    setReservationPayments([])
    setReservationExpenses([])
    setReservationReview(null)
    setShowReviewForm(false)
    setReviewForm({ puan: 5, yorum: '' })
  }

  // Değerlendirme işlemleri
  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!selectedReservation) return

    try {
      if (reservationReview) {
        // Güncelleme
        await rezervasyonService.updateDegerlendirme(selectedReservation.rezervasyon_id, reviewForm)
      } else {
        // Yeni oluşturma
        await rezervasyonService.createDegerlendirme(selectedReservation.rezervasyon_id, reviewForm)
      }

      // Değerlendirmeyi yeniden yükle
      const reviewRes = await rezervasyonService.getDegerlendirme(selectedReservation.rezervasyon_id)
      setReservationReview(reviewRes.data)
      setShowReviewForm(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Değerlendirme kaydedilemedi')
    }
  }

  const handleReviewFormChange = (e) => {
    const { name, value } = e.target
    setReviewForm(prev => ({ ...prev, [name]: value }))
  }

  const handleServiceFormChange = (e) => {
    const { name, value } = e.target
    setServiceForm(prev => ({ ...prev, [name]: value }))
  }

  // Rezervasyon durumu değiştirme fonksiyonu
  const handleStatusChange = async (id, newStatus) => {
    try {
      await rezervasyonService.update(id, { rezervasyon_durumu: newStatus })
      fetchReservations()
    } catch (err) {
      setError(err.response?.data?.error || 'Durum güncellenemedi')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Rezervasyon Yönetimi</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Yeni Rezervasyon
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Rezervasyonlar yükleniyor...</span>
        </div>
      ) : (
        <>
          {/* Arama ve Filtre */}
          <div className="mb-6 p-4 bg-white rounded-lg shadow space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Müşteri adı veya oda no ara..."
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
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Rezervasyon Tablosu */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oda
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giriş
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Çıkış
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations
                    .filter((reservation) => {
                      const matchSearch = getCustomerName(reservation.musteri_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        getRoomNumber(reservation.oda_id).toString().includes(searchTerm)
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
                          onClick={() => handleViewReservationDetail(reservation)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          Detay
                        </button>
                        <button
                          onClick={() => handleOpenServiceForm(reservation.rezervasyon_id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Hizmet Ekle
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

            {reservations.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">Kayıt bulunamadı</p>
                <p className="text-gray-400 text-sm mt-1">Arama kriterlerinizi kontrol edin</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Rezervasyon Form Modalı */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingReservation ? 'Rezervasyon Düzenle' : 'Yeni Rezervasyon'}
              </h3>
              <button
                onClick={() => {
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
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Müşteri</label>
                  <select
                    name="musteri_id"
                    value={formData.musteri_id}
                    onChange={(e) => setFormData({...formData, musteri_id: e.target.value})}
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Seçiniz</option>
                    {customers.map((c) => (
                      <option key={c.musteri_id} value={c.musteri_id}>
                        {c.ad} {c.soyad}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Oda</label>
                  <select
                    name="oda_id"
                    value={formData.oda_id}
                    onChange={(e) => setFormData({...formData, oda_id: e.target.value})}
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Seçiniz</option>
                    {rooms.map((r) => (
                      <option key={r.oda_id} value={r.oda_id}>
                        {r.oda_no} - {r.tip}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Giriş Tarihi</label>
                  <input
                    type="date"
                    name="giris_tarihi"
                    value={formData.giris_tarihi}
                    onChange={(e) => setFormData({...formData, giris_tarihi: e.target.value})}
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Çıkış Tarihi</label>
                  <input
                    type="date"
                    name="cikis_tarihi"
                    value={formData.cikis_tarihi}
                    onChange={(e) => setFormData({...formData, cikis_tarihi: e.target.value})}
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Yetişkin</label>
                  <input
                    type="number"
                    min="1"
                    name="yetiskin_sayisi"
                    value={formData.yetiskin_sayisi}
                    onChange={(e) => setFormData({...formData, yetiskin_sayisi: parseInt(e.target.value)})}
                    className="mt-1 w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Çocuk</label>
                  <input
                    type="number"
                    min="0"
                    name="cocuk_sayisi"
                    value={formData.cocuk_sayisi}
                    onChange={(e) => setFormData({...formData, cocuk_sayisi: parseInt(e.target.value)})}
                    className="mt-1 w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingReservation(null)
                  }}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70"
                >
                  {loading ? 'Kaydediliyor...' : (editingReservation ? 'Güncelle' : 'Oluştur')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ekstra Hizmet Ekleme Modalı */}
      {showServiceForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Ekstra Hizmet Ekle</h3>
              <button
                onClick={handleCloseServiceForm}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddServiceExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hizmet</label>
                <select
                  name="hizmet_id"
                  value={serviceForm.hizmet_id}
                  onChange={handleServiceFormChange}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="">Seçiniz</option>
                  {services.map((service) => (
                    <option key={service.hizmet_id} value={service.hizmet_id}>
                      {service.hizmet_adi} - {service.birim_fiyat} ₺ ({service.kategori})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Adet</label>
                <input
                  type="number"
                  min="1"
                  name="adet"
                  value={serviceForm.adet}
                  onChange={handleServiceFormChange}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
              {serviceForm.hizmet_id && (
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">
                    Toplam: {(() => {
                      const selectedService = services.find(s => s.hizmet_id === parseInt(serviceForm.hizmet_id))
                      return selectedService ? (selectedService.birim_fiyat * serviceForm.adet) : 0
                    })()} ₺
                  </p>
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseServiceForm}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rezervasyon Detay Modalı */}
      {showReservationDetail && selectedReservation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Rezervasyon Detayları - #{selectedReservation.rezervasyon_id}
              </h3>
              <button
                onClick={handleCloseReservationDetail}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Rezervasyon Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Rezervasyon Bilgileri</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Müşteri:</span>
                    <span className="font-medium">{getCustomerName(selectedReservation.musteri_id)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Oda:</span>
                    <span className="font-medium">{getRoomNumber(selectedReservation.oda_id)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giriş:</span>
                    <span className="font-medium">{new Date(selectedReservation.giris_tarihi).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Çıkış:</span>
                    <span className="font-medium">{new Date(selectedReservation.cikis_tarihi).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yetişkin/Çocuk:</span>
                    <span className="font-medium">{selectedReservation.yetiskin_sayisi || 0}/{selectedReservation.cocuk_sayisi || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durum:</span>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(selectedReservation.rezervasyon_durumu)}`}>
                      {selectedReservation.rezervasyon_durumu}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Finansal Özet</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam Tutar:</span>
                    <span className="font-bold text-blue-600">{selectedReservation.toplam_ucret} ₺</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ödenen Tutar:</span>
                    <span className="font-medium text-green-600">
                      {reservationPayments.reduce((sum, payment) => sum + parseFloat(payment.odenen_tutar || 0), 0)} ₺
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kalan Tutar:</span>
                    <span className="font-medium text-red-600">
                      {selectedReservation.toplam_ucret - reservationPayments.reduce((sum, payment) => sum + parseFloat(payment.odenen_tutar || 0), 0)} ₺
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hizmet Harcamaları:</span>
                    <span className="font-medium text-orange-600">
                      {reservationExpenses.reduce((sum, expense) => sum + parseFloat(expense.toplam_fiyat || 0), 0)} ₺
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ödeme Geçmişi */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Ödeme Geçmişi</h4>
              {reservationPayments.length > 0 ? (
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Tarih</th>
                        <th className="px-4 py-2 text-left">Tutar</th>
                        <th className="px-4 py-2 text-left">Ödeme Türü</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservationPayments.map((payment) => (
                        <tr key={payment.odeme_id} className="border-t">
                          <td className="px-4 py-2">
                            {new Date(payment.odeme_tarihi).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-4 py-2 font-medium">{payment.odenen_tutar} ₺</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {payment.odeme_turu}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded">Henüz ödeme yapılmamış.</p>
              )}
            </div>

            {/* Ekstra Hizmet Harcamaları */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Ekstra Hizmet Harcamaları</h4>
              {reservationExpenses.length > 0 ? (
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Hizmet</th>
                        <th className="px-4 py-2 text-left">Adet</th>
                        <th className="px-4 py-2 text-left">Birim Fiyat</th>
                        <th className="px-4 py-2 text-left">Toplam</th>
                        <th className="px-4 py-2 text-left">Tarih</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservationExpenses.map((expense) => {
                        const service = services.find(s => s.hizmet_id === expense.hizmet_id)
                        return (
                          <tr key={expense.harcama_id} className="border-t">
                            <td className="px-4 py-2 font-medium">
                              {service ? service.hizmet_adi : 'Bilinmeyen Hizmet'}
                            </td>
                            <td className="px-4 py-2">{expense.adet}</td>
                            <td className="px-4 py-2">{service ? service.birim_fiyat : 0} ₺</td>
                            <td className="px-4 py-2 font-medium">{expense.toplam_fiyat} ₺</td>
                            <td className="px-4 py-2">
                              {new Date(expense.islem_tarihi).toLocaleDateString('tr-TR')}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded">Henüz ekstra hizmet harcaması yok.</p>
              )}
            </div>

            {/* Müşteri Değerlendirmesi */}
            {selectedReservation.rezervasyon_durumu === 'Tamamlandı' && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800">Müşteri Değerlendirmesi</h4>
                  {!reservationReview && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Değerlendirme Ekle
                    </button>
                  )}
                  {reservationReview && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Düzenle
                    </button>
                  )}
                </div>

                {reservationReview ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < reservationReview.puan ? 'text-yellow-400' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {reservationReview.puan}/5 Puan
                      </span>
                    </div>
                    {reservationReview.yorum && (
                      <p className="text-sm text-gray-700 italic">"{reservationReview.yorum}"</p>
                    )}
                  </div>
                ) : showReviewForm ? (
                  <form onSubmit={handleSubmitReview} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Puan</label>
                      <select
                        name="puan"
                        value={reviewForm.puan}
                        onChange={handleReviewFormChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      >
                        {[5, 4, 3, 2, 1].map(num => (
                          <option key={num} value={num}>{num} Yıldız</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Yorum (İsteğe bağlı)</label>
                      <textarea
                        name="yorum"
                        value={reviewForm.yorum}
                        onChange={handleReviewFormChange}
                        className="w-full px-3 py-2 border rounded-md"
                        rows="3"
                        placeholder="Rezervasyon deneyiminiz hakkında yorumunuz..."
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-50"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        {reservationReview ? 'Güncelle' : 'Kaydet'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded">
                    Henüz değerlendirme yapılmamış. Rezervasyon tamamlandıktan sonra değerlendirme ekleyebilirsiniz.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseReservationDetail}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reservations

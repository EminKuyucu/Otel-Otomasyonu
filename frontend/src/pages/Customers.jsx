import { useEffect, useState } from 'react'
import { musteriService } from '../services/musteriService'
import { rezervasyonService } from '../services/rezervasyonService'
import { odaService } from '../services/odaService'
import CustomerReviews from '../components/CustomerReviews'

function Customers() {
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCustomerDetail, setShowCustomerDetail] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showQuickBooking, setShowQuickBooking] = useState(false)
  const [customerReservations, setCustomerReservations] = useState([])
  const [availableRooms, setAvailableRooms] = useState([])
  const [roomTypes, setRoomTypes] = useState([])

  // Arama filtre state'leri
  const [searchFilters, setSearchFilters] = useState({
    tc_kimlik_no: '',
    ad_soyad: '',
    telefon: ''
  })

  // Hızlı rezervasyon formu
  const [quickBookingForm, setQuickBookingForm] = useState({
    musteri_id: '',
    oda_id: '',
    giris_tarihi: '',
    cikis_tarihi: '',
    yetiskin_sayisi: 1,
    cocuk_sayisi: 0,
    rezervasyon_tipi: 'Kapıdan'
  })

  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    tc_kimlik_no: '',
    telefon: '',
    email: '',
    cinsiyet: 'Belirtilmemiş',
    adres: '',
  })

  const fetchCustomers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await musteriService.getAll()
      const customerList = res.data || []
      setCustomers(customerList)
      setFilteredCustomers(customerList)
    } catch (err) {
      setError(err.response?.data?.error || 'Müşteriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoomData = async () => {
    try {
      const [roomsRes, optionsRes] = await Promise.all([
        odaService.getAvailable(),
        odaService.getOptions()
      ])
      setAvailableRooms(roomsRes.data || [])
      setRoomTypes(optionsRes.data?.types || [])
    } catch (err) {
      console.error('Oda verileri yüklenemedi:', err)
    }
  }

  useEffect(() => {
    fetchCustomers()
    fetchRoomData()
  }, [])

  // Arama filtreleme
  useEffect(() => {
    const filtered = customers.filter(customer => {
      const tcMatch = !searchFilters.tc_kimlik_no ||
        customer.tc_kimlik_no?.toLowerCase().includes(searchFilters.tc_kimlik_no.toLowerCase())

      const nameMatch = !searchFilters.ad_soyad ||
        `${customer.ad} ${customer.soyad}`.toLowerCase().includes(searchFilters.ad_soyad.toLowerCase())

      const phoneMatch = !searchFilters.telefon ||
        customer.telefon?.includes(searchFilters.telefon)

      return tcMatch && nameMatch && phoneMatch
    })
    setFilteredCustomers(filtered)
  }, [customers, searchFilters])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingCustomer) {
        await musteriService.update(editingCustomer.musteri_id, formData)
      } else {
        await musteriService.create(formData)
      }
      setShowForm(false)
      setEditingCustomer(null)
      setFormData({
        ad: '',
        soyad: '',
        tc_kimlik_no: '',
        telefon: '',
        email: '',
        cinsiyet: 'Belirtilmemiş',
        adres: '',
      })
      fetchCustomers()
    } catch (err) {
      setError(err.response?.data?.error || 'İşlem başarısız')
    }
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setFormData({
      ad: customer.ad || '',
      soyad: customer.soyad || '',
      tc_kimlik_no: customer.tc_kimlik_no || '',
      telefon: customer.telefon || '',
      email: customer.email || '',
      cinsiyet: customer.cinsiyet || 'Belirtilmemiş',
      adres: customer.adres || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) return
    try {
      await musteriService.delete(id)
      fetchCustomers()
    } catch (err) {
      setError(err.response?.data?.error || 'Silme işlemi başarısız')
    }
  }

  // Müşteri detayını göster
  const handleViewCustomerDetail = async (customer) => {
    setSelectedCustomer(customer)
    setShowCustomerDetail(true)

    // Müşterinin rezervasyon geçmişini yükle
    try {
      // Tüm rezervasyonları al ve bu müşteriye ait olanları filtrele
      const res = await rezervasyonService.getAll()
      const customerReservations = res.data.filter(r => r.musteri_id === customer.musteri_id) || []
      setCustomerReservations(customerReservations)
    } catch (err) {
      console.error('Rezervasyon geçmişi yüklenemedi:', err)
      setCustomerReservations([])
    }
  }

  const handleCloseCustomerDetail = () => {
    setShowCustomerDetail(false)
    setSelectedCustomer(null)
    setCustomerReservations([])
  }

  // Anında oda al
  const handleQuickBooking = (customer) => {
    setSelectedCustomer(customer)
    setQuickBookingForm({
      musteri_id: customer.musteri_id,
      oda_id: '',
      giris_tarihi: '',
      cikis_tarihi: '',
      yetiskin_sayisi: 1,
      cocuk_sayisi: 0,
      rezervasyon_tipi: 'Kapıdan'
    })
    setShowQuickBooking(true)
  }

  const handleCloseQuickBooking = () => {
    setShowQuickBooking(false)
    setSelectedCustomer(null)
  }

  // Hızlı rezervasyon oluştur
  const handleSubmitQuickBooking = async (e) => {
    e.preventDefault()
    try {
      await rezervasyonService.create(quickBookingForm)
      setShowQuickBooking(false)
      setSelectedCustomer(null)
      alert('Rezervasyon başarıyla oluşturuldu!')
    } catch (err) {
      setError(err.response?.data?.error || 'Rezervasyon oluşturulamadı')
    }
  }

  // Arama filtrelerini güncelle
  const handleSearchFilterChange = (field, value) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Müşteri Yönetimi</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingCustomer(null)
            setFormData({
              ad: '',
              soyad: '',
              tc_kimlik_no: '',
              telefon: '',
              email: '',
              cinsiyet: 'Belirtilmemiş',
              adres: '',
            })
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Yeni Müşteri Ekle
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Gelişmiş Arama */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Müşteri Ara</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TC Kimlik No</label>
            <input
              type="text"
              placeholder="TC Kimlik No ile ara..."
              value={searchFilters.tc_kimlik_no}
              onChange={(e) => handleSearchFilterChange('tc_kimlik_no', e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
            <input
              type="text"
              placeholder="Ad Soyad ile ara..."
              value={searchFilters.ad_soyad}
              onChange={(e) => handleSearchFilterChange('ad_soyad', e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
        <input
          type="text"
              placeholder="Telefon ile ara..."
              value={searchFilters.telefon}
              onChange={(e) => handleSearchFilterChange('telefon', e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setSearchFilters({ tc_kimlik_no: '', ad_soyad: '', telefon: '' })}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Filtreleri Temizle
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-white border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">
            {editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ad *</label>
                <input
                  type="text"
                  required
                  value={formData.ad}
                  onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Soyad *</label>
                <input
                  type="text"
                  required
                  value={formData.soyad}
                  onChange={(e) => setFormData({ ...formData, soyad: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
                <input
                  type="text"
                  value={formData.tc_kimlik_no}
                  onChange={(e) => setFormData({ ...formData, tc_kimlik_no: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefon *</label>
                <input
                  type="text"
                  required
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cinsiyet</label>
                <select
                  value={formData.cinsiyet}
                  onChange={(e) => setFormData({ ...formData, cinsiyet: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Erkek">Erkek</option>
                  <option value="Kadın">Kadın</option>
                  <option value="Belirtilmemiş">Belirtilmemiş</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Adres</label>
                <textarea
                  value={formData.adres}
                  onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows="2"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingCustomer ? 'Güncelle' : 'Ekle'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingCustomer(null)
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Müşteriler yükleniyor...</span>
        </div>
      ) : (
        <>
          {/* Müşteri Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <div key={customer.musteri_id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  {/* Müşteri Başlık */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                    {customer.ad} {customer.soyad}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <span className="mr-1">📱</span>
                    {customer.telefon}
                      </p>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      customer.cinsiyet === 'Erkek' ? 'bg-blue-100 text-blue-800' :
                      customer.cinsiyet === 'Kadın' ? 'bg-pink-100 text-pink-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.cinsiyet || 'Belirtilmemiş'}
                    </div>
                  </div>

                  {/* Müşteri Detayları */}
                  <div className="space-y-2 mb-4">
                    {customer.tc_kimlik_no && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">TC:</span>
                        <span>{customer.tc_kimlik_no}</span>
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">📧</span>
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                  </div>

                  {/* İşlem Butonları */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewCustomerDetail(customer)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Detayları Gör
                    </button>
                    <button
                      onClick={() => handleQuickBooking(customer)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Anında Oda Al
                    </button>
                  </div>

                  {/* Düzenleme/Silme Butonları */}
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="flex-1 px-3 py-1 text-blue-600 text-sm border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(customer.musteri_id)}
                      className="flex-1 px-3 py-1 text-red-600 text-sm border border-red-600 rounded hover:bg-red-50 transition-colors"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">Müşteri bulunamadı</p>
              <p className="text-gray-400 text-sm mt-1">Arama kriterlerinizi kontrol edin</p>
            </div>
          )}
        </>
      )}

      {/* Müşteri Detay Modalı */}
      {showCustomerDetail && selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedCustomer.ad} {selectedCustomer.soyad}
              </h3>
              <button
                onClick={handleCloseCustomerDetail}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Sekmeler */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profil
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'reservations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('reservations')}
                >
                  Rezervasyonlar ({customerReservations.length})
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'reviews' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Değerlendirmeler
                </button>
              </nav>
            </div>

            {activeTab === 'profile' && (
              /* Profil Sekmesi */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Kişisel Bilgiler */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Kişisel Bilgiler</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ad Soyad:</span>
                        <span className="font-medium">{selectedCustomer.ad} {selectedCustomer.soyad}</span>
                      </div>
                      {selectedCustomer.tc_kimlik_no && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">TC Kimlik No:</span>
                          <span className="font-medium">{selectedCustomer.tc_kimlik_no}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Telefon:</span>
                        <span className="font-medium">{selectedCustomer.telefon}</span>
                      </div>
                      {selectedCustomer.email && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">E-posta:</span>
                          <span className="font-medium">{selectedCustomer.email}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cinsiyet:</span>
                        <span className="font-medium">{selectedCustomer.cinsiyet || 'Belirtilmemiş'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Adres Bilgileri */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Adres Bilgileri</h4>
                    <div className="text-gray-700">
                      {selectedCustomer.adres ? (
                        <p className="whitespace-pre-line">{selectedCustomer.adres}</p>
                      ) : (
                        <p className="text-gray-500 italic">Adres bilgisi bulunmuyor</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* İstatistikler */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Rezervasyon İstatistikleri</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{customerReservations.length}</div>
                      <div className="text-sm text-gray-600">Toplam Rezervasyon</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {customerReservations.filter(r => r.rezervasyon_durumu === 'Aktif').length}
                      </div>
                      <div className="text-sm text-gray-600">Aktif Rezervasyon</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {customerReservations.filter(r => r.rezervasyon_durumu === 'Tamamlandı').length}
                      </div>
                      <div className="text-sm text-gray-600">Tamamlanan</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {customerReservations.filter(r => r.rezervasyon_durumu === 'İptal').length}
                      </div>
                      <div className="text-sm text-gray-600">İptal Edilen</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reservations' && (
              /* Rezervasyonlar Sekmesi */
              <div className="space-y-4">
                {customerReservations.length > 0 ? (
                  customerReservations.map((reservation) => (
                    <div key={reservation.rezervasyon_id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-semibold text-lg">Rezervasyon #{reservation.rezervasyon_id}</h5>
                          <p className="text-sm text-gray-600">
                            Oda: {reservation.oda_id} | {reservation.yetiskin_sayisi} Yetişkin, {reservation.cocuk_sayisi} Çocuk
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          reservation.rezervasyon_durumu === 'Aktif' ? 'bg-green-100 text-green-800' :
                          reservation.rezervasyon_durumu === 'Tamamlandı' ? 'bg-blue-100 text-blue-800' :
                          reservation.rezervasyon_durumu === 'İptal' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {reservation.rezervasyon_durumu}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Giriş:</span>
                          <p className="font-medium">
                            {new Date(reservation.giris_tarihi).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Çıkış:</span>
                          <p className="font-medium">
                            {new Date(reservation.cikis_tarihi).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Rezervasyon Tipi:</span>
                          <p className="font-medium">{reservation.rezervasyon_tipi || 'Belirtilmemiş'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Toplam Tutar:</span>
                          <p className="font-medium text-green-600">{reservation.toplam_ucret} ₺</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Bu müşteri için rezervasyon bulunmuyor.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && selectedCustomer && (
              /* Değerlendirmeler Sekmesi */
              <CustomerReviews customerId={selectedCustomer.musteri_id} />
            )}

            {activeTab === 'reviews' && !selectedCustomer && (
              <div className="text-center py-8 text-gray-500">
                <p>Değerlendirmeleri görüntülemek için önce bir müşteri seçin.</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseCustomerDetail}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anında Oda Al Modalı */}
      {showQuickBooking && selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedCustomer.ad} {selectedCustomer.soyad} - Anında Oda Al
              </h3>
              <button
                onClick={handleCloseQuickBooking}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitQuickBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Oda Tipi</label>
                <select
                  value={quickBookingForm.oda_id}
                  onChange={(e) => setQuickBookingForm({...quickBookingForm, oda_id: e.target.value})}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="">Seçiniz</option>
                  {availableRooms.map((room) => (
                    <option key={room.oda_id} value={room.oda_id}>
                      Oda {room.oda_no} - {room.tip} ({room.fiyat} ₺/gün)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Giriş Tarihi</label>
                  <input
                    type="date"
                    value={quickBookingForm.giris_tarihi}
                    onChange={(e) => setQuickBookingForm({...quickBookingForm, giris_tarihi: e.target.value})}
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Çıkış Tarihi</label>
                  <input
                    type="date"
                    value={quickBookingForm.cikis_tarihi}
                    onChange={(e) => setQuickBookingForm({...quickBookingForm, cikis_tarihi: e.target.value})}
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Yetişkin</label>
                  <input
                    type="number"
                    min="1"
                    value={quickBookingForm.yetiskin_sayisi}
                    onChange={(e) => setQuickBookingForm({...quickBookingForm, yetiskin_sayisi: parseInt(e.target.value)})}
                    className="mt-1 w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Çocuk</label>
                  <input
                    type="number"
                    min="0"
                    value={quickBookingForm.cocuk_sayisi}
                    onChange={(e) => setQuickBookingForm({...quickBookingForm, cocuk_sayisi: parseInt(e.target.value)})}
                    className="mt-1 w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseQuickBooking}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Rezervasyon Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers

import { useEffect, useState } from 'react'
import { odaService } from '../services/odaService'
import { musteriService } from '../services/musteriService'
import { rezervasyonService } from '../services/rezervasyonService'
import RoomCard from '../components/RoomCard'
import RoomDetail from '../components/RoomDetail'
import ImageCarousel from '../components/ImageCarousel'

// Manzara bilgisine göre görsel URL'leri
const getRoomImage = (manzara) => {
  const viewImages = {
    'Bahçe': 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6',
    'Deniz': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    'Havuz': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
    'Orman': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
    'Panoramik': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    'Panoramik Deniz': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    'Şehir': 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892',
    'Yok': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'
  }
  return viewImages[manzara] || viewImages['Yok']
}

function Rooms() {
  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roomTypes, setRoomTypes] = useState([])
  const [roomStatuses, setRoomStatuses] = useState([])
  const [customers, setCustomers] = useState([])

  // Filtre state'leri
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [priceRange, setPriceRange] = useState([0, 1000])

  // Modal state'leri
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [showRoomDetail, setShowRoomDetail] = useState(false)
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [roomFeatures, setRoomFeatures] = useState([])
  const [roomImages, setRoomImages] = useState([])
  const [showQuickBooking, setShowQuickBooking] = useState(false)

  // Hızlı rezervasyon formu
  const [quickBookingForm, setQuickBookingForm] = useState({
    musteri_id: '',
    giris_tarihi: '',
    cikis_tarihi: '',
    yetiskin_sayisi: 1,
    cocuk_sayisi: 0,
    rezervasyon_tipi: 'Kapıdan'
  })


  const fetchRoomOptions = async () => {
    try {
      const res = await odaService.getOptions()
      setRoomTypes(res.data?.types || [])
      setRoomStatuses(res.data?.statuses || [])
    } catch (err) {
      console.error('Seçenekler yüklenemedi:', err)
    }
  }

  const fetchRooms = async () => {
    setLoading(true)
    setError('')
    try {
      // Tüm odaları backend'den getir (filtre için fiyat aralığı hesaplamak için)
      const res = await odaService.getAll()
      const roomList = res.data || []
      setRooms(roomList)

      // Fiyat aralığını hesapla
      if (roomList.length > 0) {
        const prices = roomList.map(room => parseFloat(room.fiyat || 0))
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)
        setPriceRange([minPrice, maxPrice])
      }

      // Başlangıçta tüm odaları göster
      setFilteredRooms(roomList)
    } catch (err) {
      setError(err.response?.data?.error || 'Odalar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const fetchFilteredRooms = async () => {
    setLoading(true)
    setError('')
    try {
      // Tüm filtreleri backend'e gönder
      const filters = {
        durum: filterStatus,
        oda_tipi: filterType,
        minFiyat: priceRange[0],
        maxFiyat: priceRange[1],
        arama: searchTerm || null
      }

      const res = await odaService.getFiltered(filters)
      const filteredRoomList = res.data || []
      setFilteredRooms(filteredRoomList)
    } catch (err) {
      setError(err.response?.data?.error || 'Filtreleme sırasında hata oluştu')
      // Hata durumunda boş liste göster
      setFilteredRooms([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const res = await musteriService.getAll()
      setCustomers(res.data || [])
    } catch (err) {
      console.error('Müşteriler yüklenemedi:', err)
    }
  }

  useEffect(() => {
    fetchRoomOptions()
    fetchRooms()
    fetchCustomers()
  }, [])

  // Tüm filtreleme işlemlerini backend'de yap
  useEffect(() => {
    fetchFilteredRooms()
  }, [filterType, filterStatus, priceRange, searchTerm])


  const handleDelete = async (id) => {
    if (!window.confirm('Bu odayı silmek istediğinize emin misiniz?')) return
    try {
      await odaService.delete(id)
      fetchRooms()
    } catch (err) {
      setError(err.response?.data?.error || 'Silme işlemi başarısız')
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await odaService.updateStatus(id, newStatus)
      fetchRooms()
    } catch (err) {
      setError(err.response?.data?.error || 'Durum güncellenemedi')
    }
  }


  // Oda kartı tıklama işlemi - Modal açma
  const handleRoomClick = (room) => {
    setSelectedRoomId(room.oda_id)
    setShowRoomDetail(true)
  }

  // Oda detay modalını açma
  const handleViewRoomDetail = async (room) => {
    setSelectedRoom(room)

    // Oda özelliklerini ve resimlerini yükle
    try {
      const [ozellikRes, resimRes] = await Promise.all([
        odaService.getOzellikler(room.oda_id),
        odaService.getResimler(room.oda_id)
      ])
      setRoomFeatures(ozellikRes.data.ozellikler || [])
      setRoomImages(resimRes.data || [])
    } catch (err) {
      console.error('Oda detayları yüklenemedi:', err)
      setRoomFeatures([])
      setRoomImages([])
    }

    setShowRoomModal(true)
  }

  // Modal kapatma işlemleri
  const handleCloseModal = () => {
    setShowRoomDetail(false)
    setSelectedRoomId(null)
  }

  const handleCloseRoomModal = () => {
    setShowRoomModal(false)
    setSelectedRoom(null)
    setRoomFeatures([])
    setRoomImages([])
  }

  // Oda güncellendiğinde listeyi yenileme
  const handleRoomUpdate = () => {
    fetchRooms()
  }

  // Yeni oda ekleme modal'ını açma
  const handleAddNewRoom = () => {
    setSelectedRoomId(null)
    setShowRoomDetail(true)
  }


  // Hızlı rezervasyon modalını açma
  const handleQuickBooking = (room) => {
    setSelectedRoom(room)
    setQuickBookingForm({
      musteri_id: '',
      giris_tarihi: '',
      cikis_tarihi: '',
      yetiskin_sayisi: 1,
      cocuk_sayisi: 0,
      rezervasyon_tipi: 'Kapıdan'
    })
    setShowQuickBooking(true)
  }

  // Hızlı rezervasyon oluştur
  const handleSubmitQuickBooking = async (e) => {
    e.preventDefault()
    if (!selectedRoom) return

    try {
      await rezervasyonService.create({
        ...quickBookingForm,
        oda_id: selectedRoom.oda_id
      })
      setShowQuickBooking(false)
      setSelectedRoom(null)
      alert('Rezervasyon başarıyla oluşturuldu!')
    } catch (err) {
      setError(err.response?.data?.error || 'Rezervasyon oluşturulamadı')
    }
  }


  // Filtre sıfırlama
  const handleResetFilters = () => {
    setSearchTerm('')
    setFilterStatus('')
    setFilterType('')
    if (rooms.length > 0) {
      const prices = rooms.map(room => parseFloat(room.fiyat || 0))
      setPriceRange([Math.min(...prices), Math.max(...prices)])
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Oda Yönetimi</h1>
        <button
          onClick={handleAddNewRoom}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Yeni Oda Ekle
        </button>
      </div>

      {/* Oda Filtreleme */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Oda Filtreleme</h3>
          <button
            onClick={handleResetFilters}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Filtreleri Temizle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Arama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Arama</label>
            <input
              type="text"
              placeholder="Oda no, tip veya manzara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Oda Tipi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Oda Tipi</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Tüm Tipler</option>
              <option value="Standart">Standart</option>
              <option value="Engelli Odası">Engelli Odası</option>
              <option value="Single Economy">Single Economy</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Aile">Aile</option>
              <option value="Connection Room">Connection Room</option>
              <option value="Corner Suit">Corner Suit</option>
              <option value="Balayı Suiti">Balayı Suiti</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Kral Dairesi">Kral Dairesi</option>
            </select>
          </div>

          {/* Durum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Tüm Durumlar</option>
              {roomStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Fiyat Aralığı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Fiyat: ₺{priceRange[1]}
            </label>
            <input
              type="range"
              min={rooms.length > 0 ? Math.min(...rooms.map(r => parseFloat(r.fiyat || 0))) : 0}
              max={rooms.length > 0 ? Math.max(...rooms.map(r => parseFloat(r.fiyat || 0))) : 1000}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full"
            />
          </div>
        </div>

        {/* Filtre Sonuçları */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredRooms.length} oda bulundu
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}


      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Odalar yükleniyor...</span>
        </div>
      ) : (
        <>
          {/* Oda Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRooms.map((room) => (
              <div key={room.oda_id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 overflow-hidden">
                {/* Oda Görseli */}
                <div className="h-48 relative overflow-hidden">
                  <img
                    src={getRoomImage(room.manzara)}
                    alt={`${room.manzara || 'Oda'} manzarası`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = getRoomImage('Yok')
                    }}
                  />
                  {/* Durum badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      room.durum === 'Boş' ? 'bg-green-500 text-white' :
                      room.durum === 'Dolu' ? 'bg-red-500 text-white' :
                      room.durum === 'Temizlikte' ? 'bg-yellow-500 text-white' :
                      room.durum === 'Rezerve' ? 'bg-blue-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {room.durum}
                    </span>
                  </div>
                </div>

                {/* Oda Bilgileri */}
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900">Oda {room?.oda_no ?? '—'}</h3>
                    <p className="text-sm text-gray-600">{room?.oda_tipi ?? room?.tip ?? '—'}</p>
                  </div>

                  <div className="space-y-1 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Oda Tipi:</span>
                      <span className="font-medium">{room?.oda_tipi ?? room?.tip ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Metrekare:</span>
                      <span className="font-medium">{room?.metrekare ?? "—"} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Günlük Ücret:</span>
                      <span className="font-bold text-green-600">₺{room?.ucret_gecelik ?? room?.fiyat ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Manzara:</span>
                      <span className="font-medium">{room?.manzara ?? "—"}</span>
                    </div>
                  </div>

                  {/* İşlem Butonları */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleViewRoomDetail(room)}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Detaylar
                    </button>
                    <button
                      onClick={() => handleQuickBooking(room)}
                      className={`px-3 py-2 text-sm rounded transition-colors ${
                        room.durum === 'Boş'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={room.durum !== 'Boş'}
                    >
                      Kirala
                    </button>
                  </div>

                  {/* Yönetici Butonları */}
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <button
                      onClick={() => handleRoomClick(room)}
                      className="flex-1 px-3 py-1 text-blue-600 text-sm border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(room.oda_id)}
                      className="flex-1 px-3 py-1 text-red-600 text-sm border border-red-600 rounded hover:bg-red-50 transition-colors"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {rooms.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">Kayıt bulunamadı</p>
              <p className="text-gray-400 text-sm mt-1">Arama kriterlerinizi kontrol edin</p>
            </div>
          )}
        </>
      )}

      {/* Oda Detay Modal */}
      <RoomDetail
        roomId={selectedRoomId}
        isOpen={showRoomDetail}
        onClose={handleCloseModal}
        onRoomUpdate={handleRoomUpdate}
        isNewRoom={!selectedRoomId}
      />

      {/* Oda Detay Modal */}
      {showRoomModal && selectedRoom && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Oda {selectedRoom.oda_no} - {selectedRoom.tip}
              </h3>
              <button
                onClick={handleCloseRoomModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sol Taraf - Galeri */}
              <div>
                {/* Oda Galeri */}
                <div className="mb-6">
                  <ImageCarousel
                    images={roomImages}
                    className="h-64"
                  />
                </div>

                {/* Oda Özellikleri */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Oda Özellikleri</h4>
                  {roomFeatures.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {roomFeatures.map((ozellik, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700">
                          <span className="mr-2">
                            {ozellik === 'Wi-Fi' ? '📶' :
                             ozellik === 'Klima' ? '❄️' :
                             ozellik === 'TV' ? '📺' :
                             ozellik === 'Minibar' ? '🍾' :
                             ozellik === 'Jakuzi' ? '🛁' : '✅'}
                          </span>
                          {ozellik}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Özellik bilgisi bulunmuyor</p>
                  )}
                </div>

                {/* İşlem Butonları */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      handleCloseRoomModal()
                      handleQuickBooking(selectedRoom)
                    }}
                    className={`px-4 py-3 text-white rounded-lg font-medium transition-colors ${
                      selectedRoom.durum === 'Boş'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    disabled={selectedRoom.durum !== 'Boş'}
                  >
                    Anında Kirala
                  </button>
                  <button className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Rezervasyon Yap
                  </button>
                </div>
              </div>

              {/* Sağ Taraf - Oda Bilgileri */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Oda Bilgileri</h4>

                <div className="space-y-4">
                  {/* Temel Bilgiler */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Oda Numarası</div>
                        <div className="text-xl font-bold text-gray-900">{selectedRoom.oda_no}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Oda Tipi</div>
                        <div className="text-xl font-bold text-gray-900">{selectedRoom.tip}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Metrekare</div>
                        <div className="text-xl font-bold text-gray-900">{selectedRoom.metrekare || 0} m²</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Günlük Ücret</div>
                        <div className="text-xl font-bold text-green-600">₺{selectedRoom.fiyat}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Durum:</span>
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                        selectedRoom.durum === 'Boş' ? 'bg-green-100 text-green-800' :
                        selectedRoom.durum === 'Dolu' ? 'bg-red-100 text-red-800' :
                        selectedRoom.durum === 'Temizlikte' ? 'bg-yellow-100 text-yellow-800' :
                        selectedRoom.durum === 'Rezerve' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedRoom.durum}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Manzara:</span>
                      <span className="text-sm text-gray-900">{selectedRoom.manzara || 'Belirtilmemiş'}</span>
                    </div>
                  </div>

                  {/* Oda Açıklaması */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Oda Hakkında</h5>
                    <p className="text-sm text-blue-800">
                      {selectedRoom.metrekare ? `${selectedRoom.metrekare} m²'lik ` : ''}
                      {selectedRoom.tip} oda {selectedRoom.manzara ? `${selectedRoom.manzara} manzaralı` : ''}.
                      Konforlu ve modern bir konaklama deneyimi için mükemmel seçim.
                      {roomImages.length > 0 && ` ${roomImages.length} adet fotoğraf mevcuttur.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseRoomModal}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hızlı Rezervasyon Modalı */}
      {showQuickBooking && selectedRoom && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Oda {selectedRoom.oda_no} - Hızlı Rezervasyon
              </h3>
              <button
                onClick={() => setShowQuickBooking(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitQuickBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Müşteri</label>
                <select
                  value={quickBookingForm.musteri_id}
                  onChange={(e) => setQuickBookingForm({...quickBookingForm, musteri_id: e.target.value})}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="">Müşteri Seçin</option>
                  {customers.map((customer) => (
                    <option key={customer.musteri_id} value={customer.musteri_id}>
                      {customer.ad} {customer.soyad}
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

              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Oda: {selectedRoom.oda_no} - {selectedRoom.tip}</div>
                <div className="text-sm font-medium text-gray-900">
                  Günlük Ücret: ₺{selectedRoom.fiyat}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowQuickBooking(false)}
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

export default Rooms

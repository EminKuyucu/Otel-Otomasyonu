import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { X } from 'lucide-react'
import { odaService } from '../services/odaService.js'
import ImageCarousel from './ImageCarousel'

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

// Güvenli veri normalizasyonu
const normalizeRoomData = (data) => {
  if (!data) return null

  // Array ise ilk elemanı al
  if (Array.isArray(data)) {
    data = data[0] || null
  }

  if (!data || typeof data !== 'object') return null

  return {
    oda_id: data.oda_id || null,
    oda_no: data.oda_no || data.oda_numarasi || '',
    tip: data.tip || data.oda_tipi || '',
    fiyat: data.fiyat || data.ucret_gecelik || 0,
    durum: data.durum || 'Boş',
    manzara: data.manzara || 'Yok',
    metrekare: data.metrekare || 0,
    // Backward compatibility için eski alanları da koru
    oda_tipi: data.oda_tipi || data.tip || '',
    ucret_gecelik: data.ucret_gecelik || data.fiyat || 0
  }
}

// Güvenli image normalizasyonu
const normalizeRoomImages = (images, fallbackManzara = 'Yok') => {
  if (!Array.isArray(images)) return []

  const validImages = images
    .filter(img =>
      img &&
      typeof img === 'object' &&
      typeof img.resim_url === 'string' &&
      img.resim_url.trim() !== '' &&
      img.resim_url !== 'undefined' &&
      img.resim_url !== 'null'
    )
    .map(img => ({
      resim_id: img.resim_id || `img_${Math.random()}`,
      resim_url: img.resim_url,
      resim_adi: img.resim_adi || 'Oda Görseli'
    }))

  // Geçerli görsel yoksa fallback ekle
  if (validImages.length === 0) {
    validImages.push({
      resim_id: 'default',
      resim_url: getRoomImage(fallbackManzara),
      resim_adi: 'Oda Görseli'
    })
  }

  return validImages
}

// Deep copy için yardımcı fonksiyon
const deepCopy = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (Array.isArray(obj)) return obj.map(item => deepCopy(item))

  const copied = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      copied[key] = deepCopy(obj[key])
    }
  }
  return copied
}

const RoomDetail = ({ roomId, isOpen, onClose, onRoomUpdate, isNewRoom = false }) => {
  // Güvenli roomId parsing
  const numericRoomId = useMemo(() => {
    if (!roomId) return null
    const parsed = parseInt(roomId, 10)
    return isNaN(parsed) ? null : parsed
  }, [roomId])

  // State'leri crash-proof hale getir
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [roomImages, setRoomImages] = useState([])

  // Oda detaylarını yükle - stable callback
  const loadRoomDetail = useCallback(async (roomId) => {
    if (!roomId) return

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const [roomResponse, imagesResponse] = await Promise.all([
        odaService.getById(roomId).catch(() => ({ data: null })),
        odaService.getResimler(roomId).catch(() => ({ data: [] }))
      ])

      // Veri normalizasyonu
      const normalizedRoom = normalizeRoomData(roomResponse?.data)
      const normalizedImages = normalizeRoomImages(imagesResponse?.data, normalizedRoom?.manzara)

      if (normalizedRoom) {
        setRoom(normalizedRoom)
        setEditForm(deepCopy(normalizedRoom))
        setRoomImages(normalizedImages)
      } else {
        setError('Oda verisi alınamadı')
        setRoomImages(normalizeRoomImages([], 'Yok'))
      }

    } catch (err) {
      console.error('Oda detayı yüklenirken hata:', err)
      const errorMessage = err?.response?.data?.error ||
                          err?.response?.data?.message ||
                          'Oda detayı yüklenemedi'
      setError(errorMessage)
      setRoomImages(normalizeRoomImages([], 'Yok'))
    } finally {
      setLoading(false)
    }
  }, []) // Dependency'leri kaldırdık - daha stabil

  // useEffect - race condition'ları önle
  useEffect(() => {
    if (isOpen) {
      if (isNewRoom) {
        // Yeni oda için güvenli başlangıç
        const defaultRoom = {
          oda_id: null,
          oda_no: '',
          tip: '',
          fiyat: 0,
          durum: 'Boş',
          manzara: 'Yok',
          metrekare: 0
        }
        setRoom(defaultRoom)
        setEditForm(deepCopy(defaultRoom))
        setRoomImages(normalizeRoomImages([], 'Yok'))
        setIsEditing(true)
        setError('')
        setSuccess('')
      } else if (numericRoomId) {
        // Sadece roomId varsa yükle
        loadRoomDetail(numericRoomId)
      }
    } else {
      // Modal kapanınca state'leri temizle
      setRoom(null)
      setEditForm({})
      setRoomImages([])
      setError('')
      setSuccess('')
      setIsEditing(false)
    }
  }, [isOpen, isNewRoom, numericRoomId])

  const handleEdit = useCallback(() => {
    setIsEditing(true)
    setError('')
    setSuccess('')
  }, [])

  const handleCancel = useCallback(() => {
    // Deep copy ile orijinal room'u geri yükle
    setEditForm(deepCopy(room))
    setIsEditing(false)
    setError('')
    setSuccess('')
  }, [room])

  const handleSave = useCallback(async () => {
    if (!editForm) return

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const roomData = {
        oda_no: editForm.oda_no || '',
        tip: editForm.tip || '',
        fiyat: parseFloat(editForm.fiyat) || 0,
        durum: editForm.durum || 'Boş',
        manzara: editForm.manzara || 'Yok',
        metrekare: editForm.metrekare ? parseInt(editForm.metrekare, 10) : null
      }

      if (isNewRoom) {
        await odaService.create(roomData)
        setSuccess('Oda başarıyla eklendi!')
        setTimeout(() => {
          if (onClose) onClose()
        }, 1500)
      } else {
        await odaService.update(editForm.oda_id, roomData)
        await loadRoomDetail(editForm.oda_id)
        setIsEditing(false)
        setSuccess('Oda başarıyla güncellendi!')
      }

      if (onRoomUpdate) onRoomUpdate()

    } catch (err) {
      console.error('Oda işlemi sırasında hata:', err)
      const errorMessage = err?.response?.data?.error ||
                          err?.response?.data?.message ||
                          (isNewRoom ? 'Oda eklenemedi' : 'Oda güncellenemedi')
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [editForm, isNewRoom, onClose, onRoomUpdate])

  const handleFormChange = useCallback((field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  // Modal açılmamışsa hiçbir şey render etme
  if (!isOpen) return null

  // Loading state - güvenli render
  if (loading && !room) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Oda bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Güvenli image render helper
  const renderRoomImages = () => {
    const currentManzara = isEditing ? editForm?.manzara : room?.manzara
    const validImages = roomImages.filter(img =>
      img && img.resim_url && typeof img.resim_url === 'string' && img.resim_url.trim() !== ''
    )

    // ImageCarousel sadece birden fazla geçerli görsel varsa render edilsin
    if (validImages.length > 1) {
      return (
        <ImageCarousel
          images={validImages.map(img => ({
            url: img.resim_url,
            alt: img.resim_adi || 'Oda fotoğrafı',
            id: img.resim_id
          }))}
          className="w-full h-full"
        />
      )
    }

    // Tek görsel varsa veya hiç görsel yoksa fallback göster
    const imageSrc = validImages[0]?.resim_url || getRoomImage(currentManzara || 'Yok')

    return (
      <img
        src={imageSrc}
        alt={`${currentManzara || 'Oda'} görseli`}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = getRoomImage('Yok')
        }}
      />
    )
  }

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
              {room ? `Oda ${room.oda_no || '—'} Detayları` : 'Oda Detayları'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                {success}
            </div>
            )}

            {/* Error Message */}
            {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
            )}

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Kaydediliyor...</p>
                </div>
              </div>
            )}

            {room ? (
              <>
                {/* Ana Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Sol Kolon - Görsel Slider (%55) */}
                  <div className="lg:col-span-7">
                    {/* Oda Fotoğraf Galerisi */}
                    <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden relative">
                      {renderRoomImages()}
                      {/* Oda bilgisi overlay */}
                      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded">
                        <div className="text-lg font-bold">
                          Oda {isEditing ? (editForm?.oda_no ?? '—') : (room?.oda_no ?? '—')}
                        </div>
                        <div className="text-sm">
                          {isEditing ? (editForm?.tip ?? '—') : (room?.tip ?? '—')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sağ Kolon - Oda Bilgileri (%45) */}
                  <div className="lg:col-span-5">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      {/* Oda Başlığı */}
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">
                          Oda {isEditing ? (editForm?.oda_no ?? '—') : (room?.oda_no ?? '—')}
                        </h3>
                      </div>

                      {/* 2x2 Bilgi Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Oda Tipi */}
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-xs text-gray-500 uppercase tracking-wider">Oda Tipi</div>
                          <div className="text-lg font-bold text-purple-600 mt-1">
                            {isEditing ? (editForm?.tip ?? '—') : (room?.tip ?? '—')}
                          </div>
                        </div>

                        {/* Metrekare */}
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-xs text-gray-500 uppercase tracking-wider">Metrekare</div>
                          <div className="text-xl font-bold text-blue-600 mt-1">
                            {isEditing ? (editForm?.metrekare ?? 0) : (room?.metrekare ?? 0)} m²
                          </div>
                        </div>

                        {/* Günlük Ücret */}
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-xs text-gray-500 uppercase tracking-wider">Günlük Ücret</div>
                          <div className="text-xl font-bold text-green-600 mt-1">
                            ₺{isEditing ? (editForm?.fiyat ?? 0) : (room?.fiyat ?? 0)}
                          </div>
                        </div>

                        {/* Durum */}
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-xs text-gray-500 uppercase tracking-wider">Durum</div>
                          <div className="mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              (isEditing ? editForm?.durum : room?.durum) === 'Boş' ? 'bg-green-100 text-green-800' :
                              (isEditing ? editForm?.durum : room?.durum) === 'Dolu' ? 'bg-red-100 text-red-800' :
                              (isEditing ? editForm?.durum : room?.durum) === 'Temizlikte' ? 'bg-yellow-100 text-yellow-800' :
                              (isEditing ? editForm?.durum : room?.durum) === 'Rezerve' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {isEditing ? (editForm?.durum ?? 'Boş') : (room?.durum ?? 'Boş')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Manzara Bilgisi */}
                      <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                        <div className="text-xs text-gray-500 uppercase tracking-wider text-center mb-2">Manzara</div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-indigo-800">
                            {isEditing ? (editForm?.manzara ?? 'Yok') : (room?.manzara ?? 'Yok')}
                          </div>
                        </div>
                      </div>

                      {/* Oda Hakkında */}
                      <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <h4 className="font-medium text-blue-900 mb-2">Oda Hakkında</h4>
                        <p className="text-sm text-blue-800">
                          {isEditing ? (editForm?.metrekare ?? 0) : (room?.metrekare ?? 0)} m²'lik
                          {isEditing ? (editForm?.tip ?? 'standart') : (room?.tip ?? 'standart')} oda
                          {isEditing ? editForm?.manzara : room?.manzara ?
                            ` ${isEditing ? editForm?.manzara : room?.manzara} manzaralı` : ''}.
                          Konforlu ve modern bir konaklama deneyimi için mükemmel seçim.
                          {roomImages && roomImages.length > 1 && ` ${roomImages.length} adet fotoğraf mevcuttur.`}
                        </p>
                      </div>

                      {/* Oda Özellikleri */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Oda Özellikleri</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center text-sm text-gray-700">
                              <span className="mr-2">✅</span>
                              Klima
                            </div>
                            <div className="flex items-center text-sm text-gray-700">
                              <span className="mr-2">✅</span>
                              Wi-Fi
                            </div>
                            <div className="flex items-center text-sm text-gray-700">
                              <span className="mr-2">✅</span>
                              TV
                            </div>
                            <div className="flex items-center text-sm text-gray-700">
                              <span className="mr-2">✅</span>
                              Minibar
                            </div>
                            <div className="flex items-center text-sm text-gray-700">
                              <span className="mr-2">✅</span>
                              Oda Servisi
                            </div>
                            <div className="flex items-center text-sm text-gray-700">
                              <span className="mr-2">✅</span>
                              Çay/Kahve Seti
                </div>
                </div>
              </div>

                        {/* Düzenleme Formu */}
                        {isEditing && (
                          <div className="mt-6 space-y-4">
                {/* Oda Numarası */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Oda Numarası</label>
                      <input
                        type="text"
                                value={editForm?.oda_no ?? ''}
                        onChange={(e) => handleFormChange('oda_no', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        placeholder="Oda numarası girin (örn: 101)"
                                disabled={loading}
                      />
                    </div>

                            {/* Metrekare */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Metrekare</label>
                              <input
                                type="number"
                                value={editForm?.metrekare ?? ''}
                                onChange={(e) => handleFormChange('metrekare', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                placeholder="Metrekare girin"
                                min="0"
                                disabled={loading}
                              />
                </div>

                {/* Oda Tipi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Oda Tipi</label>
                    <select
                                value={editForm?.tip ?? ''}
                      onChange={(e) => handleFormChange('tip', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                disabled={loading}
                    >
                                <option value="">Oda tipi seçin</option>
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
                                value={editForm?.durum ?? 'Boş'}
                      onChange={(e) => handleFormChange('durum', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                disabled={loading}
                    >
                                <option value="Boş">Boş</option>
                                <option value="Dolu">Dolu</option>
                                <option value="Temizlikte">Temizlikte</option>
                                <option value="Tadilat">Tadilat</option>
                                <option value="Rezerve">Rezerve</option>
                    </select>
                </div>

                {/* Manzara */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manzara</label>
                    <select
                                value={editForm?.manzara ?? ''}
                      onChange={(e) => handleFormChange('manzara', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                disabled={loading}
                    >
                                <option value="Yok">Yok</option>
                                <option value="Deniz">Deniz</option>
                                <option value="Panoramik Deniz">Panoramik Deniz</option>
                                <option value="Bahçe">Bahçe</option>
                                <option value="Havuz">Havuz</option>
                                <option value="Şehir">Şehir</option>
                                <option value="Orman">Orman</option>
                    </select>
                </div>

                {/* Gecelik Ücret */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gecelik Ücret</label>
                      <input
                        type="number"
                                value={editForm?.fiyat ?? ''}
                        onChange={(e) => handleFormChange('fiyat', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                placeholder="Gecelik ücret girin"
                        min="0"
                                disabled={loading}
                      />
                    </div>
                    </div>
                  )}
                      </div>
                    </div>
                </div>
              </div>
            </>
            ) : !loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Oda bilgisi bulunamadı</p>
            </div>
            ) : null}
        </div>

        {/* Modal Footer */}
        {room && (
            <div className="flex justify-between items-center p-6 border-t bg-gray-50">
              {/* Sol taraf - Düzenleme butonu */}
              <div>
                {!isEditing && !isNewRoom && (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    Düzenle
                  </button>
                )}
              </div>

              {/* Sağ taraf - Kaydet/İptal/Kapat butonları */}
              <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : (isNewRoom ? 'Ekle' : 'Kaydet')}
                </button>
              </>
            ) : (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    Kapat
                  </button>
                )}
              </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default RoomDetail
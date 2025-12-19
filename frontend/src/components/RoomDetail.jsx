import React, { useState, useEffect } from 'react'
import { X, Bed, Eye, DollarSign } from 'lucide-react'
import { odaService } from '../services/odaService.js'

// Manzara bilgisine göre görsel URL'leri
const getRoomImage = (manzara) => {
  const imageMap = {
    'Deniz': 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Panoramik Deniz': 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Bahçe': 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Havuz': 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Şehir': 'https://images.pexels.com/photos/2397658/pexels-photo-2397658.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Orman': 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Yok': 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600'
  }
  return imageMap[manzara] || imageMap['Yok']
}

// Oda durumuna göre renk eşleştirmesi
const getStatusColor = (durum) => {
  const colorMap = {
    'Boş': 'bg-green-100 text-green-800',
    'Dolu': 'bg-red-100 text-red-800',
    'Temizlikte': 'bg-yellow-100 text-yellow-800',
    'Tadilat': 'bg-gray-100 text-gray-800',
    'Rezerve': 'bg-blue-100 text-blue-800'
  }
  return colorMap[durum] || 'bg-gray-100 text-gray-800'
}

const RoomDetail = ({ roomId, isOpen, onClose, onRoomUpdate, isNewRoom = false }) => {
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})

  // Oda detaylarını yükle
  useEffect(() => {
    if (isOpen) {
      if (isNewRoom) {
        // Yeni oda için boş form başlat
        setRoom({
          oda_id: null,
          oda_no: '',
          tip: '',
          fiyat: '',
          durum: 'Boş',
          manzara: '',
          metrekare: ''
        })
        setEditForm({
          oda_no: '',
          tip: '',
          fiyat: '',
          durum: 'Boş',
          manzara: '',
          metrekare: ''
        })
        setIsEditing(true) // Yeni oda için otomatik düzenleme modunda aç
      } else if (roomId) {
        loadRoomDetail()
      }
    }
  }, [isOpen, roomId, isNewRoom])

  const loadRoomDetail = async () => {
    if (!roomId) return

    try {
      setLoading(true)
      setError('')
      const response = await odaService.getById(roomId)

      if (response && response.data) {
        setRoom(response.data)
        setEditForm(response.data)
      } else {
        setError('Oda verisi alınamadı')
      }
    } catch (err) {
      console.error('Oda detayı yüklenirken hata:', err)
      setError(err.response?.data?.error || err.response?.data?.message || 'Oda detayı yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditForm(room)
    setIsEditing(false)
    setError('')
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')

      // Backend beklentisine uygun veri formatı
      const roomData = {
        oda_no: editForm.oda_no,
        tip: editForm.tip,
        fiyat: parseFloat(editForm.fiyat) || 0,
        durum: editForm.durum,
        manzara: editForm.manzara || 'Yok',
        metrekare: editForm.metrekare ? parseInt(editForm.metrekare) : null
      }

      if (isNewRoom) {
        // Yeni oda oluştur
        await odaService.create(roomData)
        setError('Oda başarıyla eklendi!')
        // Kısa bir süre sonra modal'ı kapat
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        // Mevcut odayı güncelle
        await odaService.update(room.oda_id, roomData)
        // Güncellenmiş oda bilgilerini yeniden yükle
        await loadRoomDetail()
        setIsEditing(false)
      }

      // Parent component'i bilgilendir
      if (onRoomUpdate) {
        onRoomUpdate()
      }
    } catch (err) {
      console.error('Oda işlemi sırasında hata:', err)
      setError(err.response?.data?.error || err.response?.data?.message || (isNewRoom ? 'Oda eklenemedi' : 'Oda güncellenemedi'))
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Durum renklendirmesi için fonksiyon
  const getStatusColor = (status) => {
    switch (status) {
      case 'Boş': return 'bg-green-100 text-green-800'
      case 'Dolu': return 'bg-red-100 text-red-800'
      case 'Temizlikte': return 'bg-yellow-100 text-yellow-800'
      case 'Tadilat': return 'bg-gray-100 text-gray-800'
      case 'Rezerve': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isOpen) return null

  const statusColor = room ? getStatusColor(room.durum) : ''

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {room ? `Oda ${room.oda_no} Detayları` : 'Oda Detayları'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          ) : room ? (
            <>
              {/* Oda Görseli */}
              <div className="mb-6 h-48 bg-gray-200 rounded-lg overflow-hidden relative">
                <img
                  src={getRoomImage(isEditing ? editForm.manzara : room.manzara)}
                  alt={`${(isEditing ? editForm.manzara : room.manzara) || 'Manzara'} manzarası`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextElementSibling.style.display = 'flex'
                  }}
                  onLoad={(e) => {
                    e.target.nextElementSibling.style.display = 'none'
                  }}
                />
                {/* Fallback */}
                <div className="w-full h-full items-center justify-center flex bg-gradient-to-br from-blue-500 to-blue-600">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-2">🏨</div>
                    <div className="text-lg font-medium">
                      {(isEditing ? editForm.manzara : room.manzara) || 'Oda Manzarası'}
                    </div>
                  </div>
                </div>
                {/* Oda bilgisi overlay */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded">
                  <div className="text-lg font-bold">Oda {isEditing ? editForm.oda_no : room.oda_no}</div>
                  <div className="text-sm">{isEditing ? editForm.tip : room.tip}</div>
                </div>
              </div>

              {/* Oda Bilgileri */}
              <div className="space-y-4">
                {/* Oda Numarası */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Oda Numarası</label>
                  {isEditing ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">🏠</span>
                      <input
                        type="text"
                        value={editForm.oda_no || ''}
                        onChange={(e) => handleFormChange('oda_no', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                        placeholder="Oda numarası girin (örn: 101)"
                      />
                    </div>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="font-bold text-lg text-gray-800">🏠 {room.oda_no}</span>
                    </div>
                  )}
                </div>

                {/* Oda Tipi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Oda Tipi</label>
                  {isEditing ? (
                    <select
                      value={editForm.tip || ''}
                      onChange={(e) => handleFormChange('tip', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="">🔸 Oda tipi seçin</option>
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
                  ) : (
                    <div className="px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{room.tip}</span>
                    </div>
                  )}
                </div>

                {/* Durum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                  {isEditing ? (
                    <select
                      value={editForm.durum || 'Boş'}
                      onChange={(e) => handleFormChange('durum', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="Boş">🟢 Boş</option>
                      <option value="Dolu">🔴 Dolu</option>
                      <option value="Temizlikte">🟡 Temizlikte</option>
                      <option value="Tadilat">⚫ Tadilat</option>
                      <option value="Rezerve">🔵 Rezerve</option>
                    </select>
                  ) : (
                    <div className="px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(room.durum)}`}>
                        {room.durum === 'Boş' && '🟢 '}
                        {room.durum === 'Dolu' && '🔴 '}
                        {room.durum === 'Temizlikte' && '🟡 '}
                        {room.durum === 'Tadilat' && '⚫ '}
                        {room.durum === 'Rezerve' && '🔵 '}
                        {room.durum}
                      </span>
                    </div>
                  )}
                </div>

                {/* Manzara */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manzara</label>
                  {isEditing ? (
                    <select
                      value={editForm.manzara || ''}
                      onChange={(e) => handleFormChange('manzara', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="Yok">🏠 Yok</option>
                      <option value="Deniz">🌊 Deniz</option>
                      <option value="Panoramik Deniz">🌅 Panoramik Deniz</option>
                      <option value="Bahçe">🌸 Bahçe</option>
                      <option value="Havuz">🏊 Havuz</option>
                      <option value="Şehir">🏙️ Şehir</option>
                      <option value="Orman">🌲 Orman</option>
                    </select>
                  ) : (
                    <div className="px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {room.manzara === 'Deniz' && '🌊 '}
                        {room.manzara === 'Panoramik Deniz' && '🌅 '}
                        {room.manzara === 'Bahçe' && '🌸 '}
                        {room.manzara === 'Havuz' && '🏊 '}
                        {room.manzara === 'Şehir' && '🏙️ '}
                        {room.manzara === 'Orman' && '🌲 '}
                        {room.manzara === 'Yok' && '🏠 '}
                        {room.manzara || 'Yok'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Metrekare */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Metrekare</label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="number"
                        value={editForm.metrekare || ''}
                        onChange={(e) => handleFormChange('metrekare', e.target.value)}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                        placeholder="📐 Metrekare girin"
                        min="0"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">m²</span>
                    </div>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="font-medium text-lg text-blue-600">📐 {room.metrekare || 0} m²</span>
                    </div>
                  )}
                </div>

                {/* Gecelik Ücret */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gecelik Ücret</label>
                  {isEditing ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">₺</span>
                      <input
                        type="number"
                        value={editForm.fiyat || ''}
                        onChange={(e) => handleFormChange('fiyat', e.target.value)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                        placeholder="💰 Gecelik ücret girin"
                        min="0"
                      />
                    </div>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="font-bold text-xl text-green-600">💰 {room.fiyat} ₺</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Oda bilgisi bulunamadı</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {room && (
          <div className="flex justify-end p-6 border-t bg-gray-50 space-x-3">
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
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Kapat
                </button>
                {!isNewRoom && (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Düzenle
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomDetail
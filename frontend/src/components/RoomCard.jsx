import React, { useState, useEffect } from 'react'
import { Bed, Eye, DollarSign, Home, Wifi, Coffee, Car } from 'lucide-react'
import { odaService } from '../services/odaService'

// Manzara bilgisine göre görsel URL'leri (Pixabay'den ücretsiz görseller)
const getManzaraImage = (manzara) => {
  // Güvenilir CDN görselleri - network sorunu olursa otomatik fallback çalışır
  const imageMap = {
    'Deniz': 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Panoramik Deniz': 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Bahçe': 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Havuz': 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Şehir': 'https://images.pexels.com/photos/2397658/pexels-photo-2397658.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Orman': 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Yok': 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
  return imageMap[manzara] || imageMap['Yok']
}

// Manzara bilgisine göre renk eşleştirmesi
const getManzaraStyle = (manzara) => {
  const styleMap = {
    'Deniz': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'Panoramik Deniz': { bg: 'bg-blue-200', text: 'text-blue-900' },
    'Bahçe': { bg: 'bg-green-100', text: 'text-green-800' },
    'Havuz': { bg: 'bg-cyan-100', text: 'text-cyan-800' },
    'Şehir': { bg: 'bg-gray-100', text: 'text-gray-800' },
    'Orman': { bg: 'bg-green-200', text: 'text-green-900' },
    'Yok': { bg: 'bg-gray-50', text: 'text-gray-600' }
  }
  return styleMap[manzara] || styleMap['Yok']
}

// Oda durumuna göre renk eşleştirmesi
const getStatusColor = (durum) => {
  const colorMap = {
    'Boş': 'border-green-500 bg-green-50',
    'Dolu': 'border-red-500 bg-red-50',
    'Temizlikte': 'border-yellow-500 bg-yellow-50',
    'Tadilat': 'border-gray-500 bg-gray-50',
    'Rezerve': 'border-blue-500 bg-blue-50'
  }
  return colorMap[durum] || 'border-gray-500 bg-gray-50'
}

const RoomCard = ({ room, onClick }) => {
  const [ozellikler, setOzellikler] = useState([])
  const [ozelliklerLoading, setOzelliklerLoading] = useState(false)

  const statusColor = getStatusColor(room.durum)
  const manzaraStyle = getManzaraStyle(room.manzara)
  const manzaraImage = getManzaraImage(room.manzara)

  useEffect(() => {
    const loadOzellikler = async () => {
      if (room.oda_id) {
        setOzelliklerLoading(true)
        try {
          const res = await odaService.getOzellikler(room.oda_id)
          setOzellikler(res.data.ozellikler || [])
        } catch (err) {
          console.error('Oda özellikleri yüklenemedi:', err)
        } finally {
          setOzelliklerLoading(false)
        }
      }
    }

    loadOzellikler()
  }, [room.oda_id])

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-l-4 ${statusColor}`}
      onClick={() => onClick(room)}
    >
      {/* Oda Görseli */}
      <div className="h-32 relative overflow-hidden">
        <img
          src={manzaraImage}
          alt={`${room.manzara || 'Manzara'} manzarası`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Görsel yüklenemezse fallback göster
            e.target.style.display = 'none'
            e.target.nextElementSibling.style.display = 'flex'
          }}
          onLoad={(e) => {
            // Görsel başarıyla yüklendiğinde fallback'i gizle
            e.target.nextElementSibling.style.display = 'none'
          }}
        />
        {/* Fallback - görsel yüklenemezse veya yüklenene kadar */}
        <div className={`w-full h-full items-center justify-center flex ${
          room.manzara === 'Deniz' ? 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600' :
          room.manzara === 'Panoramik Deniz' ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600' :
          room.manzara === 'Bahçe' ? 'bg-gradient-to-br from-green-400 via-green-500 to-green-600' :
          room.manzara === 'Havuz' ? 'bg-gradient-to-br from-cyan-300 via-blue-400 to-blue-500' :
          room.manzara === 'Şehir' ? 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600' :
          room.manzara === 'Orman' ? 'bg-gradient-to-br from-green-600 via-green-700 to-green-800' :
          'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500'
        }`}>
          <div className="text-center text-white">
            <div className="text-3xl mb-1">
              {room.manzara === 'Deniz' ? '🌊' :
               room.manzara === 'Panoramik Deniz' ? '🌅' :
               room.manzara === 'Bahçe' ? '🌳' :
               room.manzara === 'Havuz' ? '🏊' :
               room.manzara === 'Şehir' ? '🏙️' :
               room.manzara === 'Orman' ? '🌲' :
               '🏨'}
            </div>
            <div className="text-sm font-medium">
              {room.manzara || 'Oda'}
            </div>
          </div>
        </div>
        {/* Overlay ile oda numarası */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm font-bold">
          {room.oda_no}
        </div>
        {/* Manzara bilgisi overlay */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          {room.manzara || 'Manzara Yok'}
        </div>
      </div>

      {/* Oda Bilgileri */}
      <div className="p-4">
        {/* Oda Tipi ve Durum */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{room.tip}</h3>
            <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
              room.durum === 'Boş' ? 'bg-green-100 text-green-800' :
              room.durum === 'Dolu' ? 'bg-red-100 text-red-800' :
              room.durum === 'Temizlikte' ? 'bg-yellow-100 text-yellow-800' :
              room.durum === 'Tadilat' ? 'bg-gray-100 text-gray-800' :
              room.durum === 'Rezerve' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {room.durum}
            </div>
          </div>
        </div>

        {/* Oda Bilgileri Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
          <div className="flex items-center">
            <Eye className="w-3 h-3 mr-1" />
            <span>{room.manzara || 'Manzara Yok'}</span>
          </div>
          <div className="flex items-center">
            <Home className="w-3 h-3 mr-1" />
            <span>{room.metrekare || 0} m²</span>
          </div>
        </div>

        {/* Oda Özellikleri */}
        {ozelliklerLoading ? (
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400 mr-1"></div>
            Özellikler yükleniyor...
          </div>
        ) : ozellikler.length > 0 ? (
          <div className="flex flex-wrap gap-1 mb-2">
            {ozellikler.slice(0, 3).map((ozellik, index) => (
              <span
                key={index}
                className="inline-flex items-center px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                title={ozellik}
              >
                {ozellik === 'Wi-Fi' && <Wifi className="w-2.5 h-2.5 mr-0.5" />}
                {ozellik === 'Klima' && <Home className="w-2.5 h-2.5 mr-0.5" />}
                {ozellik === 'Kahvaltı' && <Coffee className="w-2.5 h-2.5 mr-0.5" />}
                {ozellik === 'Otopark' && <Car className="w-2.5 h-2.5 mr-0.5" />}
                {!['Wi-Fi', 'Klima', 'Kahvaltı', 'Otopark'].includes(ozellik) && (
                  <span className="w-2.5 h-2.5 mr-0.5 rounded-full bg-gray-400"></span>
                )}
                <span className="truncate max-w-12">{ozellik}</span>
              </span>
            ))}
            {ozellikler.length > 3 && (
              <span className="inline-flex items-center px-1.5 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
                +{ozellikler.length - 3}
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-400 mb-2">Özellik bilgisi yok</div>
        )}

        {/* Fiyat */}
        <div className="flex justify-end">
          <div className="flex items-center font-semibold text-gray-900 text-sm">
            <DollarSign className="w-4 h-4 mr-1" />
            <span>{room.fiyat} ₺/gün</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomCard

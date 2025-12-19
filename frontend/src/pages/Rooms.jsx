import { useEffect, useState } from 'react'
import { odaService } from '../services/odaService'
import RoomCard from '../components/RoomCard'
import RoomDetail from '../components/RoomDetail'

function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roomTypes, setRoomTypes] = useState([])
  const [roomStatuses, setRoomStatuses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')

  // Modal state'leri
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [showRoomDetail, setShowRoomDetail] = useState(false)

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
      const res = await odaService.getAll()
      setRooms(res.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Odalar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoomOptions()
    fetchRooms()
  }, [])


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

  // Modal kapatma işlemi
  const handleCloseModal = () => {
    setShowRoomDetail(false)
    setSelectedRoomId(null)
  }

  // Oda güncellendiğinde listeyi yenileme
  const handleRoomUpdate = () => {
    fetchRooms()
  }

  // Yeni oda ekleme modal'ını açma
  const handleAddNewRoom = () => {
    setSelectedRoomId(null) // Yeni oda için null
    setShowRoomDetail(true)
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

      {/* Arama ve Filtre */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Oda No veya Tip Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Tüm Tipler</option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
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
          {/* Oda Kartları Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms
              .filter((room) => {
                const matchSearch = room.oda_no.toString().includes(searchTerm) || room.tip.toLowerCase().includes(searchTerm.toLowerCase())
                const matchType = !filterType || room.tip === filterType
                const matchStatus = !filterStatus || room.durum === filterStatus
                return matchSearch && matchType && matchStatus
              })
              .map((room) => (
                <RoomCard
                  key={room.oda_id}
                  room={room}
                  onClick={handleRoomClick}
                />
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
    </div>
  )
}

export default Rooms

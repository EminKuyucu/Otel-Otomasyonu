import { useEffect, useState } from 'react'
import api from '../services/api'

const statusBadge = {
  bos: 'bg-green-100 text-green-800',
  dolu: 'bg-red-100 text-red-800',
  tadilat: 'bg-yellow-100 text-yellow-800',
}

function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchRooms = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/rooms')
      setRooms(res.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Odalar alınamadı')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Odalar</h1>
        <button
          onClick={fetchRooms}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Yenile
        </button>
      </div>
      {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={room.oda_id} className="bg-white rounded-md shadow p-4 border">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Oda {room.oda_no}</h2>
                <span className={`text-xs px-2 py-1 rounded ${statusBadge[room.durum] || 'bg-gray-100 text-gray-700'}`}>
                  {room.durum}
                </span>
              </div>
              <p className="text-sm text-gray-600">Tip: {room.tip}</p>
              <p className="text-sm text-gray-600">Fiyat: {room.fiyat} ₺</p>
            </div>
          ))}
          {rooms.length === 0 && <p className="text-sm text-gray-600">Kayıt bulunamadı.</p>}
        </div>
      )}
    </div>
  )
}

export default Rooms


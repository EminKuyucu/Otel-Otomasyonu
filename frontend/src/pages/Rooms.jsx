import { useEffect, useState } from 'react'
import { odaService } from '../services/odaService'

const statusColors = {
  bos: 'bg-green-100 text-green-800',
  dolu: 'bg-red-100 text-red-800',
  tadilat: 'bg-yellow-100 text-yellow-800',
}

function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [formData, setFormData] = useState({
    oda_no: '',
    tip: '',
    fiyat: '',
    durum: 'bos',
  })

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
    fetchRooms()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingRoom) {
        await odaService.update(editingRoom.oda_id, formData)
      } else {
        await odaService.create(formData)
      }
      setShowForm(false)
      setEditingRoom(null)
      setFormData({ oda_no: '', tip: '', fiyat: '', durum: 'bos' })
      fetchRooms()
    } catch (err) {
      setError(err.response?.data?.error || 'İşlem başarısız')
    }
  }

  const handleEdit = (room) => {
    setEditingRoom(room)
    setFormData({
      oda_no: room.oda_no,
      tip: room.tip,
      fiyat: room.fiyat,
      durum: room.durum,
    })
    setShowForm(true)
  }

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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Oda Yönetimi</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingRoom(null)
            setFormData({ oda_no: '', tip: '', fiyat: '', durum: 'bos' })
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Yeni Oda Ekle
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {showForm && (
        <div className="mb-6 p-4 bg-white border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">
            {editingRoom ? 'Oda Düzenle' : 'Yeni Oda Ekle'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Oda No</label>
                <input
                  type="text"
                  required
                  value={formData.oda_no}
                  onChange={(e) => setFormData({ ...formData, oda_no: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tip</label>
                <input
                  type="text"
                  required
                  value={formData.tip}
                  onChange={(e) => setFormData({ ...formData, tip: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fiyat</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.fiyat}
                  onChange={(e) => setFormData({ ...formData, fiyat: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Durum</label>
                <select
                  value={formData.durum}
                  onChange={(e) => setFormData({ ...formData, durum: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="bos">Boş</option>
                  <option value="dolu">Dolu</option>
                  <option value="tadilat">Tadilat</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingRoom ? 'Güncelle' : 'Ekle'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingRoom(null)
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
        <p>Yükleniyor...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Oda No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tip</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiyat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.map((room) => (
                <tr key={room.oda_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{room.oda_no}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.tip}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.fiyat} ₺</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={room.durum}
                      onChange={(e) => handleStatusChange(room.oda_id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded ${statusColors[room.durum] || 'bg-gray-100'}`}
                    >
                      <option value="bos">Boş</option>
                      <option value="dolu">Dolu</option>
                      <option value="tadilat">Tadilat</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(room)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(room.oda_id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rooms.length === 0 && (
            <div className="p-6 text-center text-gray-500">Kayıt bulunamadı</div>
          )}
        </div>
      )}
    </div>
  )
}

export default Rooms

import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

function Stock() {
  const { role, hasRole } = useAuth()
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({ urun_adi: '', hizmet_id: '', stok_adedi: 0 })

  const isAdmin = hasRole('ADMIN')
  const isOperations = hasRole('OPERATIONS')

  const fetchStock = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/stock')
      setItems(res.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Stok verisi alınamadı')
    } finally {
      setLoading(false)
    }
  }

  const handleIncrease = async (urun_id, currentStock) => {
    const miktar = prompt('Artırılacak miktar:', '1')
    if (!miktar || isNaN(miktar) || parseInt(miktar) <= 0) return

    try {
      await api.post('/stock/increase', { urun_id, miktar: parseInt(miktar) })
      fetchStock()
    } catch (err) {
      setError(err.response?.data?.error || 'Stok artırma işlemi başarısız')
    }
  }

  const handleDecrease = async (urun_id, currentStock) => {
    const miktar = prompt('Azaltılacak miktar:', '1')
    if (!miktar || isNaN(miktar) || parseInt(miktar) <= 0) return

    if (parseInt(miktar) > currentStock) {
      setError('Azaltılacak miktar mevcut stoktan fazla olamaz')
      return
    }

    try {
      await api.post('/stock/decrease', { urun_id, miktar: parseInt(miktar) })
      fetchStock()
    } catch (err) {
      setError(err.response?.data?.error || 'Stok azaltma işlemi başarısız')
    }
  }

  const handleDelete = async (urun_id) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return

    try {
      await api.delete(`/stock/${urun_id}`)
      fetchStock()
    } catch (err) {
      setError(err.response?.data?.error || 'Ürün silme işlemi başarısız')
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await api.put(`/stock/${editingItem.urun_id}`, formData)
      } else {
        await api.post('/stock', formData)
      }
      setShowAddForm(false)
      setEditingItem(null)
      setFormData({ urun_adi: '', hizmet_id: '', stok_adedi: 0 })
      fetchStock()
    } catch (err) {
      setError(err.response?.data?.error || 'İşlem başarısız')
    }
  }

  useEffect(() => {
    fetchStock()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Stok Yönetimi</h1>
        <div className="flex space-x-2">
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Ürün Ekle
            </button>
          )}
          <button
            onClick={fetchStock}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Yenile
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-4 rounded-md shadow mb-4">
          <h3 className="text-lg font-semibold mb-3">
            {editingItem ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
          </h3>
          <form onSubmit={handleFormSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Ürün Adı</label>
              <input
                type="text"
                value={formData.urun_adi}
                onChange={(e) => setFormData({...formData, urun_adi: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hizmet ID (Opsiyonel)</label>
              <input
                type="number"
                value={formData.hizmet_id}
                onChange={(e) => setFormData({...formData, hizmet_id: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Başlangıç Stoğu</label>
              <input
                type="number"
                value={formData.stok_adedi}
                onChange={(e) => setFormData({...formData, stok_adedi: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border rounded-md"
                min="0"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingItem ? 'Güncelle' : 'Ekle'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingItem(null)
                  setFormData({ urun_adi: '', hizmet_id: '', stok_adedi: 0 })
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
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
        <div className="overflow-x-auto bg-white rounded-md shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Ürün</th>
                <th className="px-3 py-2 text-left">Stok</th>
                <th className="px-3 py-2 text-left">Hizmet ID</th>
                <th className="px-3 py-2 text-left">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.urun_id} className="border-t">
                  <td className="px-3 py-2">{i.urun_adi}</td>
                  <td className="px-3 py-2">
                    <span className={`font-semibold ${i.stok_adedi <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {i.stok_adedi}
                    </span>
                  </td>
                  <td className="px-3 py-2">{i.hizmet_id || '-'}</td>
                  <td className="px-3 py-2">
                    <div className="flex space-x-1">
                      {/* Stock Amount Controls - ADMIN and OPERATIONS */}
                      {(isAdmin || isOperations) && (
                        <>
                          <button
                            onClick={() => handleIncrease(i.urun_id, i.stok_adedi)}
                            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                            title="Stok Artır"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleDecrease(i.urun_id, i.stok_adedi)}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            title="Stok Azalt"
                            disabled={i.stok_adedi <= 0}
                          >
                            -
                          </button>
                        </>
                      )}

                      {/* Edit/Delete - Only ADMIN */}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => {
                              setEditingItem(i)
                              setFormData({
                                urun_adi: i.urun_adi,
                                hizmet_id: i.hizmet_id || '',
                                stok_adedi: i.stok_adedi
                              })
                              setShowAddForm(true)
                            }}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(i.urun_id)}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Sil
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-gray-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Stock


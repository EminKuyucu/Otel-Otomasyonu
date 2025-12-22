import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

function Services() {
  const { hasRole } = useAuth()
  const [services, setServices] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({ hizmet_adi: '', birim_fiyat: '', kategori: '' })

  const isAdmin = hasRole('ADMIN')
  const isOperations = hasRole('OPERATIONS')

  const fetchServices = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/services')
      setServices(res.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Hizmetler alınamadı')
    } finally {
      setLoading(false)
    }
  }


  const handleDelete = async (serviceId) => {
    if (!confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) return

    try {
      await api.delete(`/services/${serviceId}`)
      fetchServices()
    } catch (err) {
      setError(err.response?.data?.error || 'Hizmet silme başarısız')
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingService) {
        await api.put(`/services/${editingService.hizmet_id}`, formData)
      } else {
        await api.post('/services', formData)
      }
      setShowAddForm(false)
      setEditingService(null)
      setFormData({ hizmet_adi: '', birim_fiyat: '', kategori: '' })
      fetchServices()
    } catch (err) {
      setError(err.response?.data?.error || 'İşlem başarısız')
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Ekstra Hizmetler</h1>
        <div className="flex space-x-2">
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Hizmet Ekle
            </button>
          )}
          <button
            onClick={fetchServices}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Yenile
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}

      {/* Add/Edit Form - Only ADMIN */}
      {showAddForm && isAdmin && (
        <div className="bg-white p-4 rounded-md shadow mb-4">
          <h3 className="text-lg font-semibold mb-3">
            {editingService ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle'}
          </h3>
          <form onSubmit={handleFormSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Hizmet Adı</label>
              <input
                type="text"
                value={formData.hizmet_adi}
                onChange={(e) => setFormData({...formData, hizmet_adi: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Birim Fiyat</label>
              <input
                type="number"
                value={formData.birim_fiyat}
                onChange={(e) => setFormData({...formData, birim_fiyat: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border rounded-md"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <input
                type="text"
                value={formData.kategori}
                onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingService ? 'Güncelle' : 'Ekle'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingService(null)
                  setFormData({ hizmet_adi: '', birim_fiyat: '', kategori: '' })
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
                <th className="px-3 py-2 text-left">Hizmet</th>
                <th className="px-3 py-2 text-left">Fiyat</th>
                <th className="px-3 py-2 text-left">Kategori</th>
                {isAdmin && (
                  <th className="px-3 py-2 text-left">İşlemler</th>
                )}
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.hizmet_id} className="border-t">
                  <td className="px-3 py-2">{s.hizmet_adi}</td>
                  <td className="px-3 py-2">{s.birim_fiyat} ₺</td>
                  <td className="px-3 py-2">{s.kategori || '-'}</td>
                  {isAdmin && (
                    <td className="px-3 py-2">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setEditingService(s)
                            setFormData({
                              hizmet_adi: s.hizmet_adi,
                              birim_fiyat: s.birim_fiyat,
                              kategori: s.kategori || ''
                            })
                            setShowAddForm(true)
                          }}
                          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(s.hizmet_id)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="px-3 py-4 text-center text-gray-500">
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

export default Services


import { useEffect, useState } from 'react'
import api from '../services/api'

function Services() {
  const [services, setServices] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  useEffect(() => {
    fetchServices()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Ekstra Hizmetler</h1>
        <button
          onClick={fetchServices}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Yenile
        </button>
      </div>
      {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}
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
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.hizmet_id} className="border-t">
                  <td className="px-3 py-2">{s.hizmet_adi}</td>
                  <td className="px-3 py-2">{s.birim_fiyat} ₺</td>
                  <td className="px-3 py-2">{s.kategori || '-'}</td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-gray-500">
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


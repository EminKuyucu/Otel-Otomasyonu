import { useEffect, useState } from 'react'
import api from '../services/api'

function Stock() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  useEffect(() => {
    fetchStock()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Stok Yönetimi</h1>
        <button
          onClick={fetchStock}
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
                <th className="px-3 py-2 text-left">Ürün</th>
                <th className="px-3 py-2 text-left">Stok</th>
                <th className="px-3 py-2 text-left">Hizmet ID</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.urun_id} className="border-t">
                  <td className="px-3 py-2">{i.urun_adi}</td>
                  <td className="px-3 py-2">{i.stok_adedi}</td>
                  <td className="px-3 py-2">{i.hizmet_id || '-'}</td>
                </tr>
              ))}
              {items.length === 0 && (
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

export default Stock


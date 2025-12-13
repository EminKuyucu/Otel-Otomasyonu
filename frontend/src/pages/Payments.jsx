import { useEffect, useState } from 'react'
import api from '../services/api'

function Payments() {
  const [payments, setPayments] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchPayments = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/payments')
      setPayments(res.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Ödemeler alınamadı')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Ödemeler</h1>
        <button
          onClick={fetchPayments}
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
                <th className="px-3 py-2 text-left">Ödeme ID</th>
                <th className="px-3 py-2 text-left">Rezervasyon</th>
                <th className="px-3 py-2 text-left">Müşteri</th>
                <th className="px-3 py-2 text-left">Tutar</th>
                <th className="px-3 py-2 text-left">Tür</th>
                <th className="px-3 py-2 text-left">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.odeme_id} className="border-t">
                  <td className="px-3 py-2">{p.odeme_id}</td>
                  <td className="px-3 py-2">{p.rezervasyon_id}</td>
                  <td className="px-3 py-2">{p.musteri_id}</td>
                  <td className="px-3 py-2">{p.odenen_tutar} ₺</td>
                  <td className="px-3 py-2">{p.odeme_turu}</td>
                  <td className="px-3 py-2">
                    {p.odeme_tarihi ? new Date(p.odeme_tarihi).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
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

export default Payments


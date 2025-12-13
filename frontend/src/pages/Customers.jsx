import { useEffect, useState } from 'react'
import api from '../services/api'

function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchCustomers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/customers')
      setCustomers(res.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Müşteriler alınamadı')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Müşteriler</h1>
        <button
          onClick={fetchCustomers}
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
                <th className="px-3 py-2 text-left">Ad Soyad</th>
                <th className="px-3 py-2 text-left">Telefon</th>
                <th className="px-3 py-2 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.musteri_id} className="border-t">
                  <td className="px-3 py-2">{c.ad} {c.soyad}</td>
                  <td className="px-3 py-2">{c.telefon}</td>
                  <td className="px-3 py-2">{c.email}</td>
                </tr>
              ))}
              {customers.length === 0 && (
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

export default Customers


import { useEffect, useState } from 'react'
import api from '../services/api'

function Reports() {
  const [monthly, setMonthly] = useState([])
  const [reservations, setReservations] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchReports = async () => {
    setLoading(true)
    setError('')
    try {
      const [mRes, rRes] = await Promise.all([
        api.get('/reports/monthly'),
        api.get('/reports/reservations'),
      ])
      setMonthly(mRes.data || [])
      setReservations(rRes.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Raporlar alınamadı')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Raporlar</h1>
        <button
          onClick={fetchReports}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Yenile
        </button>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <>
          <section className="bg-white shadow rounded-md p-4">
            <h2 className="text-lg font-semibold mb-3">Aylık Kazanç</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Ay</th>
                    <th className="px-3 py-2 text-left">Gelir</th>
                    <th className="px-3 py-2 text-left">Rezervasyon Sayısı</th>
                    <th className="px-3 py-2 text-left">Ödeme Türü</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((m, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">{m.Donem || '-'}</td>
                      <td className="px-3 py-2">{m.Toplam_Kazanc || 0} ₺</td>
                      <td className="px-3 py-2">{m.Islem_Sayisi || '-'}</td>
                      <td className="px-3 py-2">{m.odeme_turu || '-'}</td>
                    </tr>
                  ))}
                  {monthly.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-gray-500">
                        Kayıt bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          <section className="bg-white shadow rounded-md p-4">
            <h2 className="text-lg font-semibold mb-3">Rezervasyon Detayları</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Rezervasyon</th>
                    <th className="px-3 py-2 text-left">Müşteri</th>
                    <th className="px-3 py-2 text-left">Oda</th>
                    <th className="px-3 py-2 text-left">Giriş</th>
                    <th className="px-3 py-2 text-left">Çıkış</th>
                    <th className="px-3 py-2 text-left">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">{r.rezervasyon_id}</td>
                      <td className="px-3 py-2">{r.musteri_id}</td>
                      <td className="px-3 py-2">{r.oda_id}</td>
                      <td className="px-3 py-2">
                        {r.giris_tarihi ? new Date(r.giris_tarihi).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-3 py-2">
                        {r.cikis_tarihi ? new Date(r.cikis_tarihi).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-3 py-2">{r.toplam_ucret || r.ucret || 0} ₺</td>
                    </tr>
                  ))}
                  {reservations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
                        Kayıt bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default Reports


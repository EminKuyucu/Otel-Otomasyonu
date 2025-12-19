import { useEffect, useState } from 'react'
import api from '../services/api'

function Reports() {
  const [monthly, setMonthly] = useState([])
  const [reservations, setReservations] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [reservationTypeFilter, setReservationTypeFilter] = useState('')
  const [filteredReservations, setFilteredReservations] = useState([])

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

  // Rezervasyonları filtrele
  useEffect(() => {
    if (reservationTypeFilter) {
      const filtered = reservations.filter(r => r.rezervasyon_tipi === reservationTypeFilter)
      setFilteredReservations(filtered)
    } else {
      setFilteredReservations(reservations)
    }
  }, [reservations, reservationTypeFilter])

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
            <h2 className="text-lg font-semibold mb-3">Aylık Kazanç Raporu</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Ay/Yıl</th>
                    <th className="px-3 py-2 text-left">Toplam Kazanç</th>
                    <th className="px-3 py-2 text-left">Rezervasyon Sayısı</th>
                    <th className="px-3 py-2 text-left">Ödeme Türü Dağılımı</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((m, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2 font-medium">{m.Donem || '-'}</td>
                      <td className="px-3 py-2 font-bold text-green-600">{m.Toplam_Kazanc || 0} ₺</td>
                      <td className="px-3 py-2">{m.Islem_Sayisi || 0}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          m.odeme_turu === 'Nakit' ? 'bg-green-100 text-green-800' :
                          m.odeme_turu === 'Kredi Kartı' ? 'bg-blue-100 text-blue-800' :
                          m.odeme_turu === 'Havale' ? 'bg-purple-100 text-purple-800' :
                          m.odeme_turu === 'Sanal Pos' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {m.odeme_turu || 'Belirtilmemiş'}
                        </span>
                      </td>
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
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Rezervasyon Detayları</h2>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Rezervasyon Tipi:</label>
                <select
                  value={reservationTypeFilter}
                  onChange={(e) => setReservationTypeFilter(e.target.value)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="">Tümü</option>
                  <option value="Online">Online</option>
                  <option value="Kapıdan">Kapıdan</option>
                  <option value="Acente">Acente</option>
                  <option value="Ön Rezervasyon">Ön Rezervasyon</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Rezervasyon ID</th>
                    <th className="px-3 py-2 text-left">Rezervasyon Tipi</th>
                    <th className="px-3 py-2 text-left">Müşteri</th>
                    <th className="px-3 py-2 text-left">Oda</th>
                    <th className="px-3 py-2 text-left">Giriş</th>
                    <th className="px-3 py-2 text-left">Çıkış</th>
                    <th className="px-3 py-2 text-left">Durum</th>
                    <th className="px-3 py-2 text-left">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((r, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">#{r.rezervasyon_id}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          r.rezervasyon_tipi === 'Online' ? 'bg-blue-100 text-blue-800' :
                          r.rezervasyon_tipi === 'Kapıdan' ? 'bg-green-100 text-green-800' :
                          r.rezervasyon_tipi === 'Acente' ? 'bg-purple-100 text-purple-800' :
                          r.rezervasyon_tipi === 'Ön Rezervasyon' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {r.rezervasyon_tipi || 'Belirtilmemiş'}
                        </span>
                      </td>
                      <td className="px-3 py-2">{r.musteri_id}</td>
                      <td className="px-3 py-2">{r.oda_id}</td>
                      <td className="px-3 py-2">
                        {r.giris_tarihi ? new Date(r.giris_tarihi).toLocaleDateString('tr-TR') : '-'}
                      </td>
                      <td className="px-3 py-2">
                        {r.cikis_tarihi ? new Date(r.cikis_tarihi).toLocaleDateString('tr-TR') : '-'}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          r.rezervasyon_durumu === 'Aktif' ? 'bg-green-100 text-green-800' :
                          r.rezervasyon_durumu === 'Tamamlandı' ? 'bg-blue-100 text-blue-800' :
                          r.rezervasyon_durumu === 'İptal' ? 'bg-red-100 text-red-800' :
                          r.rezervasyon_durumu === 'Bekliyor' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {r.rezervasyon_durumu || 'Belirtilmemiş'}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium">{r.toplam_ucret || r.ucret || 0} ₺</td>
                    </tr>
                  ))}
                  {filteredReservations.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-3 py-4 text-center text-gray-500">
                        {reservationTypeFilter ? 'Bu rezervasyon tipi için kayıt bulunamadı.' : 'Kayıt bulunamadı.'}
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


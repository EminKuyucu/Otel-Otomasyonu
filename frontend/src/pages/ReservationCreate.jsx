import { useEffect, useState } from 'react'
import api from '../services/api'

function ReservationCreate() {
  const [rooms, setRooms] = useState([])
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState({
    musteri_id: '',
    oda_id: '',
    giris_tarihi: '',
    cikis_tarihi: '',
    yetiskin_sayisi: 1,
    cocuk_sayisi: 0,
    rezervasyon_tipi: 'Online',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      const [roomsRes, customersRes] = await Promise.all([
        api.get('/rooms/available'),
        api.get('/customers'),
      ])
      setRooms(roomsRes.data || [])
      setCustomers(customersRes.data || [])
    } catch (err) {
      setError('Liste verileri alınamadı')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      await api.post('/reservations', {
        ...form,
        yetiskin_sayisi: Number(form.yetiskin_sayisi),
        cocuk_sayisi: Number(form.cocuk_sayisi),
      })
      setMessage('Rezervasyon oluşturuldu')
    } catch (err) {
      setError(err.response?.data?.error || 'Rezervasyon başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Rezervasyon Oluştur</h1>
      {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}
      {message && <p className="text-green-600 mb-3 text-sm">{message}</p>}
      <div className="bg-white shadow rounded-md p-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Müşteri</label>
              <select
                name="musteri_id"
                value={form.musteri_id}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md px-3 py-2"
                required
              >
                <option value="">Seçiniz</option>
                {customers.map((c) => (
                  <option key={c.musteri_id} value={c.musteri_id}>
                    {c.ad} {c.soyad}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Oda</label>
              <select
                name="oda_id"
                value={form.oda_id}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md px-3 py-2"
                required
              >
                <option value="">Seçiniz</option>
                {rooms.map((r) => (
                  <option key={r.oda_id} value={r.oda_id}>
                    {r.oda_no} - {r.tip}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Giriş Tarihi</label>
              <input
                type="date"
                name="giris_tarihi"
                value={form.giris_tarihi}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Çıkış Tarihi</label>
              <input
                type="date"
                name="cikis_tarihi"
                value={form.cikis_tarihi}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Yetişkin</label>
              <input
                type="number"
                min="1"
                name="yetiskin_sayisi"
                value={form.yetiskin_sayisi}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Çocuk</label>
              <input
                type="number"
                min="0"
                name="cocuk_sayisi"
                value={form.cocuk_sayisi}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rezervasyon Tipi</label>
              <select
                name="rezervasyon_tipi"
                value={form.rezervasyon_tipi}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md px-3 py-2"
                required
              >
                <option value="Online">Online</option>
                <option value="Kapıdan">Kapıdan</option>
                <option value="Acente">Acente</option>
                <option value="Ön Rezervasyon">Ön Rezervasyon</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? 'Gönderiliyor...' : 'Oluştur'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ReservationCreate


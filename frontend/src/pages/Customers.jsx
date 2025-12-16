import { useEffect, useState } from 'react'
import { musteriService } from '../services/musteriService'

function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    tc_kimlik_no: '',
    telefon: '',
    email: '',
    cinsiyet: 'Belirtilmemiş',
    adres: '',
  })

  const fetchCustomers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await musteriService.getAll()
      setCustomers(res.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Müşteriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingCustomer) {
        await musteriService.update(editingCustomer.musteri_id, formData)
      } else {
        await musteriService.create(formData)
      }
      setShowForm(false)
      setEditingCustomer(null)
      setFormData({
        ad: '',
        soyad: '',
        tc_kimlik_no: '',
        telefon: '',
        email: '',
        cinsiyet: 'Belirtilmemiş',
        adres: '',
      })
      fetchCustomers()
    } catch (err) {
      setError(err.response?.data?.error || 'İşlem başarısız')
    }
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setFormData({
      ad: customer.ad || '',
      soyad: customer.soyad || '',
      tc_kimlik_no: customer.tc_kimlik_no || '',
      telefon: customer.telefon || '',
      email: customer.email || '',
      cinsiyet: customer.cinsiyet || 'Belirtilmemiş',
      adres: customer.adres || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) return
    try {
      await musteriService.delete(id)
      fetchCustomers()
    } catch (err) {
      setError(err.response?.data?.error || 'Silme işlemi başarısız')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Müşteri Yönetimi</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingCustomer(null)
            setFormData({
              ad: '',
              soyad: '',
              tc_kimlik_no: '',
              telefon: '',
              email: '',
              cinsiyet: 'Belirtilmemiş',
              adres: '',
            })
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Yeni Müşteri Ekle
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Arama */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <input
          type="text"
          placeholder="Ad, Soyad, Telefon veya Email ile Ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-white border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">
            {editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ad *</label>
                <input
                  type="text"
                  required
                  value={formData.ad}
                  onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Soyad *</label>
                <input
                  type="text"
                  required
                  value={formData.soyad}
                  onChange={(e) => setFormData({ ...formData, soyad: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
                <input
                  type="text"
                  value={formData.tc_kimlik_no}
                  onChange={(e) => setFormData({ ...formData, tc_kimlik_no: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefon *</label>
                <input
                  type="text"
                  required
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cinsiyet</label>
                <select
                  value={formData.cinsiyet}
                  onChange={(e) => setFormData({ ...formData, cinsiyet: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Erkek">Erkek</option>
                  <option value="Kadın">Kadın</option>
                  <option value="Belirtilmemiş">Belirtilmemiş</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Adres</label>
                <textarea
                  value={formData.adres}
                  onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows="2"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingCustomer ? 'Güncelle' : 'Ekle'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingCustomer(null)
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad Soyad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TC Kimlik No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers
                .filter((customer) => {
                  const search = searchTerm.toLowerCase()
                  return (
                    customer.ad.toLowerCase().includes(search) ||
                    customer.soyad.toLowerCase().includes(search) ||
                    customer.telefon.includes(search) ||
                    customer.email?.toLowerCase().includes(search)
                  )
                })
                .map((customer) => (
                <tr key={customer.musteri_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {customer.ad} {customer.soyad}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.tc_kimlik_no || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.telefon}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(customer.musteri_id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && (
            <div className="p-6 text-center text-gray-500">Kayıt bulunamadı</div>
          )}
        </div>
      )}
    </div>
  )
}

export default Customers

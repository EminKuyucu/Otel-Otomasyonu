import { useEffect, useState } from 'react'
import { personelService } from '../services/personelService'

function Staff() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [formData, setFormData] = useState({
    kullanici_adi: '',
    sifre: '',
    ad_soyad: '',
    gorev: 'Personel',
    aktiflik: true,
  })

  const fetchStaff = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await personelService.getAll()
      setStaff(res.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Personel yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const submitData = { ...formData }
      // Şifre güncelleme için boş bırakılırsa gönderme
      if (editingStaff && !submitData.sifre) {
        delete submitData.sifre
      }
      if (editingStaff) {
        await personelService.update(editingStaff.personel_id, submitData)
      } else {
        await personelService.create(submitData)
      }
      setShowForm(false)
      setEditingStaff(null)
      setFormData({
        kullanici_adi: '',
        sifre: '',
        ad_soyad: '',
        gorev: 'Personel',
        aktiflik: true,
      })
      fetchStaff()
    } catch (err) {
      setError(err.response?.data?.error || 'İşlem başarısız')
    }
  }

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember)
    setFormData({
      kullanici_adi: staffMember.kullanici_adi || '',
      sifre: '',
      ad_soyad: staffMember.ad_soyad || '',
      gorev: staffMember.gorev || 'Personel',
      aktiflik: staffMember.aktiflik !== undefined ? staffMember.aktiflik : true,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu personeli silmek istediğinize emin misiniz?')) return
    try {
      await personelService.delete(id)
      fetchStaff()
    } catch (err) {
      setError(err.response?.data?.error || 'Silme işlemi başarısız')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Personel Yönetimi</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingStaff(null)
            setFormData({
              kullanici_adi: '',
              sifre: '',
              ad_soyad: '',
              gorev: 'Personel',
              aktiflik: true,
            })
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Yeni Personel Ekle
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {showForm && (
        <div className="mb-6 p-4 bg-white border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">
            {editingStaff ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kullanıcı Adı *</label>
                <input
                  type="text"
                  required
                  value={formData.kullanici_adi}
                  onChange={(e) => setFormData({ ...formData, kullanici_adi: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Şifre {editingStaff ? '(Değiştirmek için doldurun)' : '*'}
                </label>
                <input
                  type="password"
                  required={!editingStaff}
                  value={formData.sifre}
                  onChange={(e) => setFormData({ ...formData, sifre: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  required
                  value={formData.ad_soyad}
                  onChange={(e) => setFormData({ ...formData, ad_soyad: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Görev</label>
                <input
                  type="text"
                  value={formData.gorev}
                  onChange={(e) => setFormData({ ...formData, gorev: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Personel, Resepsiyon, Yönetici, vb."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Durum</label>
                <select
                  value={formData.aktiflik ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, aktiflik: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="true">Aktif</option>
                  <option value="false">Pasif</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingStaff ? 'Güncelle' : 'Ekle'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingStaff(null)
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı Adı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad Soyad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Görev</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staff.map((staffMember) => (
                <tr key={staffMember.personel_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {staffMember.kullanici_adi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {staffMember.ad_soyad}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {staffMember.gorev}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        staffMember.aktiflik
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {staffMember.aktiflik ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(staffMember)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(staffMember.personel_id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {staff.length === 0 && (
            <div className="p-6 text-center text-gray-500">Kayıt bulunamadı</div>
          )}
        </div>
      )}
    </div>
  )
}

export default Staff


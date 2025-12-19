import { useState, useEffect } from 'react'
import { MessageSquare, Calendar, Star } from 'lucide-react'
import StarRating from './StarRating'
import { musteriService } from '../services/musteriService'

const CustomerReviews = ({ customerId }) => {
  console.log('CustomerReviews render edildi, customerId:', customerId)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [completedReservations, setCompletedReservations] = useState([])
  const [formData, setFormData] = useState({
    rezervasyon_id: '',
    puan: 5,
    yorum: ''
  })

  // Müşterinin değerlendirmelerini yükle
  const loadReviews = async () => {
    if (!customerId) {
      console.log('CustomerReviews: customerId yok, yükleme atlandı')
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await musteriService.getReviews(customerId)
      setReviews(response.data.degerlendirmeler || [])
    } catch (err) {
      console.error('Değerlendirmeler yüklenirken hata:', err)
      setError('Değerlendirmeler yüklenemedi')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  // Tamamlanmış rezervasyonları yükle
  const loadCompletedReservations = async () => {
    if (!customerId) return

    try {
      // Şimdilik boş bırak - sadece değerlendirme ekleme için gerekli
      setCompletedReservations([
        { rezervasyon_id: 1, giris_tarihi: '2024-01-15' },
        { rezervasyon_id: 2, giris_tarihi: '2024-02-20' }
      ])
    } catch (err) {
      console.error('Rezervasyonlar yüklenirken hata:', err)
      setCompletedReservations([])
    }
  }

  useEffect(() => {
    console.log('CustomerReviews useEffect çalıştı, customerId:', customerId)
    if (customerId) {
      loadReviews()
      loadCompletedReservations()
    }
  }, [customerId])

  // Değerlendirme ekle
  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!formData.rezervasyon_id || !formData.puan) {
      setError('Lütfen tüm alanları doldurun')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Değerlendirme oluştur (rezervasyon üzerinden)
      const reviewData = {
        puan: formData.puan,
        yorum: formData.yorum
      }

      await musteriService.createReview(formData.rezervasyon_id, reviewData)

      // Listeyi yeniden yükle
      await loadReviews()

      // Formu sıfırla
      setFormData({
        rezervasyon_id: '',
        puan: 5,
        yorum: ''
      })
      setShowAddForm(false)

    } catch (err) {
      console.error('Değerlendirme eklenirken hata:', err)
      setError(err.response?.data?.error || 'Değerlendirme eklenemedi')
    } finally {
      setLoading(false)
    }
  }

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Değerlendirmeler yükleniyor...</span>
      </div>
    )
  }

  if (!customerId) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Müşteri seçilmedi</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve İstatistikler */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Müşteri Değerlendirmeleri</h3>
          <p className="text-sm text-gray-600">
            {reviews.length} değerlendirme
            {reviews.length > 0 && (
              <>
                {' • '}
                Ortalama: {(
                  reviews.reduce((sum, review) => sum + (review.puan || 0), 0) / reviews.length
                ).toFixed(1)}/5
              </>
            )}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <MessageSquare size={16} />
          {showAddForm ? 'İptal' : 'Değerlendirme Ekle'}
        </button>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Değerlendirme Ekleme Formu */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="text-md font-medium text-gray-900 mb-4">Yeni Değerlendirme</h4>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rezervasyon Seçin *
              </label>
              <select
                value={formData.rezervasyon_id}
                onChange={(e) => setFormData({...formData, rezervasyon_id: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="">Rezervasyon seçin</option>
                {completedReservations.map((reservation) => (
                  <option key={reservation.rezervasyon_id} value={reservation.rezervasyon_id}>
                    Rezervasyon #{reservation.rezervasyon_id} - {reservation.giris_tarihi}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puanınız *
              </label>
              <StarRating
                rating={formData.puan}
                onRatingChange={(rating) => setFormData({...formData, puan: rating})}
                size={32}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yorumunuz
              </label>
              <textarea
                value={formData.yorum}
                onChange={(e) => setFormData({...formData, yorum: e.target.value})}
                className="w-full px-3 py-2 border rounded resize-none"
                rows="4"
                placeholder="Deneyiminizi bizimle paylaşın..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Değerlendirme Listesi */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p>Henüz değerlendirme bulunmuyor</p>
            <p className="text-sm mt-2">customerId: {customerId}</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.degerlendirme_id || Math.random()} className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <StarRating rating={review.puan || 0} readonly size={20} />
                    <span className="text-sm text-gray-500">
                      Rezervasyon #{review.rezervasyon_id}
                    </span>
                  </div>

                  {review.yorum && (
                    <p className="text-gray-700 leading-relaxed">
                      "{review.yorum}"
                    </p>
                  )}
                </div>

                <div className="text-xs text-gray-400 ml-4">
                  <Calendar size={14} className="inline mr-1" />
                  #{review.degerlendirme_id}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CustomerReviews

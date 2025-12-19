import api from './api'

export const rezervasyonService = {
  getAll: () => api.get('/reservations/'),
  getOptions: () => api.get('/reservations/options'),
  getById: (id) => api.get(`/reservations/${id}/`),
  create: (data) => api.post('/reservations/', data),
  update: (id, data) => api.put(`/reservations/${id}/`, data),
  delete: (id) => api.delete(`/reservations/${id}/`),
  // Tarih müsaitlik kontrolü
  checkAvailability: (odaId, girisTarihi, cikisTarihi, excludeId) =>
    api.get('/reservations/check-availability', {
      params: { oda_id: odaId, giris_tarihi: girisTarihi, cikis_tarihi: cikisTarihi, exclude_id: excludeId }
    }),
  // Değerlendirme işlemleri
  getDegerlendirme: (id) => api.get(`/reservations/${id}/degerlendirme`),
  createDegerlendirme: (id, data) => api.post(`/reservations/${id}/degerlendirme`, data),
  updateDegerlendirme: (id, data) => api.put(`/reservations/${id}/degerlendirme`, data),
}




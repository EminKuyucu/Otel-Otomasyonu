import api from './api'

export const personelService = {
  getAll: () => api.get('/personel'),
  getById: (id) => api.get(`/personel/${id}`),
  create: (data) => api.post('/personel', data),
  update: (id, data) => api.put(`/personel/${id}`, data),
  delete: (id) => api.delete(`/personel/${id}`),
}




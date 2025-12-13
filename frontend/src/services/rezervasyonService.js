import api from './api'

export const rezervasyonService = {
  getAll: () => api.get('/rezervasyon/'),
  getById: (id) => api.get(`/rezervasyon/${id}`),
  create: (data) => api.post('/rezervasyon/', data),
  update: (id, data) => api.put(`/rezervasyon/${id}`, data),
  delete: (id) => api.delete(`/rezervasyon/${id}`),
}



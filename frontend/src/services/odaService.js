import api from './api'

export const odaService = {
  getAll: () => api.get('/oda/'),
  getById: (id) => api.get(`/oda/${id}`),
  create: (data) => api.post('/oda/', data),
  update: (id, data) => api.put(`/oda/${id}`, data),
  delete: (id) => api.delete(`/oda/${id}`),
}



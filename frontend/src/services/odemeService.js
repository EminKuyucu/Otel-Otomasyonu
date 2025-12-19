import api from './api'

export const odemeService = {
  getAll: () => api.get('/odeme/'),
  getById: (id) => api.get(`/odeme/${id}`),
  create: (data) => api.post('/odeme/', data),
  update: (id, data) => api.put(`/odeme/${id}`, data),
  delete: (id) => api.delete(`/odeme/${id}`),
}












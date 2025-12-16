import api from './api'

export const stokService = {
  getAll: () => api.get('/stock/'),
  getById: (id) => api.get(`/stock/${id}/`),
  create: (data) => api.post('/stock/', data),
  update: (id, data) => api.put(`/stock/${id}/`, data),
  delete: (id) => api.delete(`/stock/${id}/`),
}

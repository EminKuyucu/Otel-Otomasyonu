import api from './api'

export const musteriService = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  getExpenses: (id) => api.get(`/customers/${id}/harcamalar`),
  getReviews: (id) => api.get(`/customers/${id}/degerlendirme`),
}




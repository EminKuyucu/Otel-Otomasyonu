import api from './api'

export const rezervasyonService = {
  getAll: () => api.get('/reservations/'),
  getOptions: () => api.get('/reservations/options'),
  getById: (id) => api.get(`/reservations/${id}/`),
  create: (data) => api.post('/reservations/', data),
  update: (id, data) => api.put(`/reservations/${id}/`, data),
  delete: (id) => api.delete(`/reservations/${id}/`),
}




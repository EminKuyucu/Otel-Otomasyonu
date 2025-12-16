import api from './api'

export const odaService = {
  getAll: () => api.get('/rooms/'),
  getOptions: () => api.get('/rooms/options'),
  getAvailable: () => api.get('/rooms/available/'),
  getById: (id) => api.get(`/rooms/${id}/`),
  create: (data) => api.post('/rooms/', data),
  update: (id, data) => api.put(`/rooms/${id}/`, data),
  updateStatus: (id, status) => api.put(`/rooms/${id}/status/`, { durum: status }),
  delete: (id) => api.delete(`/rooms/${id}/`),
}




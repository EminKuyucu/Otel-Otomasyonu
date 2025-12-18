import api from './api'

export const hizmetService = {
  getAll: () => api.get('/hizmet/'),
  getById: (id) => api.get(`/hizmet/${id}`),
  create: (data) => api.post('/hizmet/', data),
  update: (id, data) => api.put(`/hizmet/${id}`, data),
  delete: (id) => api.delete(`/hizmet/${id}`),
  getHarcamalar: () => api.get('/hizmet/harcama'),
  createHarcama: (data) => api.post('/hizmet/harcama', data),
  getStok: () => api.get('/hizmet/stok'),
}








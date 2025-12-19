import api from './api'

export const odaService = {
  // Tüm odaları getir
  getAll: async () => {
    try {
      const response = await api.get('/rooms/')
      return response
    } catch (error) {
      console.error('Odalar alınırken hata:', error)
      throw error
    }
  },

  // Oda seçeneklerini getir (tip, durum)
  getOptions: async () => {
    try {
      const response = await api.get('/rooms/options')
      return response
    } catch (error) {
      console.error('Oda seçenekleri alınırken hata:', error)
      throw error
    }
  },

  // Müsait odaları getir
  getAvailable: async () => {
    try {
      const response = await api.get('/rooms/available/')
      return response
    } catch (error) {
      console.error('Müsait odalar alınırken hata:', error)
      throw error
    }
  },

  // ID'ye göre oda getir
  getById: async (id) => {
    console.log('odaService.getById çağrıldı, ID:', id)
    try {
      const response = await api.get(`/rooms/${id}/`)
      console.log('odaService.getById yanıtı:', response)
      return response
    } catch (error) {
      console.error('odaService.getById hatası:', error)
      console.error('odaService.getById hata detayı:', error.response?.data)
      throw error
    }
  },

  // Yeni oda oluştur
  create: async (data) => {
    try {
      const response = await api.post('/rooms/', data)
      return response
    } catch (error) {
      console.error('Oda oluşturulurken hata:', error)
      throw error
    }
  },

  // Oda bilgilerini güncelle
  update: async (id, data) => {
    try {
      const response = await api.put(`/rooms/${id}/`, data)
      return response
    } catch (error) {
      console.error('Oda güncellenirken hata:', error)
      throw error
    }
  },

  // Oda durumunu güncelle
  updateStatus: async (id, status) => {
    try {
      const response = await api.put(`/rooms/${id}/status/`, { durum: status })
      return response
    } catch (error) {
      console.error('Oda durumu güncellenirken hata:', error)
      throw error
    }
  },

  // Odayı sil
  delete: async (id) => {
    try {
      const response = await api.delete(`/rooms/${id}/`)
      return response
    } catch (error) {
      console.error('Oda silinirken hata:', error)
      throw error
    }
  },

  // Odanın özelliklerini getir (yeni endpoint)
  getOzellikler: async (odaId) => {
    try {
      const response = await api.get(`/odalar/${odaId}/ozellikler`)
      return response
    } catch (error) {
      console.error('Oda özellikleri alınırken hata:', error)
      throw error
    }
  },

  // Oda resimlerini getir
  getResimler: async (odaId) => {
    try {
      const response = await api.get(`/odalar/${odaId}/resimler`)
      return response
    } catch (error) {
      console.error('Oda resimleri alınırken hata:', error)
      throw error
    }
  }
}




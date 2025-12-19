import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Dashboard API servisleri
export const dashboardService = {
  // Dashboard istatistiklerini getir
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats')
      return response.data
    } catch (error) {
      console.error('Dashboard istatistikleri alınırken hata:', error)
      throw error
    }
  },

  // Aktif rezervasyonları getir
  getActiveReservations: async () => {
    try {
      const response = await api.get('/dashboard/active-reservations')
      return response.data
    } catch (error) {
      console.error('Aktif rezervasyonlar alınırken hata:', error)
      throw error
    }
  },

  // Bugünkü olayları getir
  getTodaysEvents: async () => {
    try {
      const response = await api.get('/dashboard/todays-events')
      return response.data
    } catch (error) {
      console.error('Bugünkü olaylar alınırken hata:', error)
      throw error
    }
  }
}

// Oda API servisleri
export const roomService = {
  // Tüm odaları getir
  getRooms: async () => {
    try {
      const response = await api.get('/rooms')
      return response.data
    } catch (error) {
      console.error('Odalar alınırken hata:', error)
      throw error
    }
  },

  // Yeni oda oluştur
  createRoom: async (roomData) => {
    try {
      const response = await api.post('/rooms', roomData)
      return response.data
    } catch (error) {
      console.error('Oda oluşturulurken hata:', error)
      throw error
    }
  },

  // Oda seçeneklerini getir (tip, durum)
  getRoomOptions: async () => {
    try {
      const response = await api.get('/rooms/options')
      return response.data
    } catch (error) {
      console.error('Oda seçenekleri alınırken hata:', error)
      throw error
    }
  }
}

// Müşteri API servisleri
export const customerService = {
  // Tüm müşterileri getir
  getCustomers: async () => {
    try {
      const response = await api.get('/customers')
      return response.data
    } catch (error) {
      console.error('Müşteriler alınırken hata:', error)
      throw error
    }
  },

  // Yeni müşteri oluştur
  createCustomer: async (customerData) => {
    try {
      const response = await api.post('/customers', customerData)
      return response.data
    } catch (error) {
      console.error('Müşteri oluşturulurken hata:', error)
      throw error
    }
  }
}

// Rezervasyon API servisleri
export const reservationService = {
  // Tüm rezervasyonları getir
  getReservations: async () => {
    try {
      const response = await api.get('/reservations')
      return response.data
    } catch (error) {
      console.error('Rezervasyonlar alınırken hata:', error)
      throw error
    }
  },

  // Yeni rezervasyon oluştur
  createReservation: async (reservationData) => {
    try {
      const response = await api.post('/reservations', reservationData)
      return response.data
    } catch (error) {
      console.error('Rezervasyon oluşturulurken hata:', error)
      throw error
    }
  }
}

export default api


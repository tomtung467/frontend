// Base Service class - all services extend this
import api from '@/api'

export default class BaseService {
  constructor(basePath = '') {
    this.basePath = basePath
  }

  async get(endpoint, config = {}) {
    try {
      const response = await api.get(`${this.basePath}${endpoint}`, config)
      return response.data.data || response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async post(endpoint, data = {}, config = {}) {
    try {
      const response = await api.post(`${this.basePath}${endpoint}`, data, config)
      return response.data.data || response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async put(endpoint, data = {}, config = {}) {
    try {
      const response = await api.put(`${this.basePath}${endpoint}`, data, config)
      return response.data.data || response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async patch(endpoint, data = {}, config = {}) {
    try {
      const response = await api.patch(`${this.basePath}${endpoint}`, data, config)
      return response.data.data || response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async delete(endpoint, config = {}) {
    try {
      const response = await api.delete(`${this.basePath}${endpoint}`, config)
      return response.data.data || response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  handleError(error) {
    console.error('API Error:', error)
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Có lỗi xảy ra'
    
    const errorCode = error.response?.status || 500
    
    const customError = new Error(errorMessage)
    customError.code = errorCode
    customError.response = error.response
    
    throw customError
  }
}

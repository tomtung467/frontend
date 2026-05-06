// Base Service class - all services extend this
import api from '@/api'
import { isAbortError } from '@/api/requestManager'
import { clearGetCache, clearInFlight, getCacheKey, getCachedValue, getInFlight, setCachedValue, setInFlight } from '@/api/getCache'

export default class BaseService {
  constructor(basePath = '') {
    this.basePath = basePath
  }

  async get(endpoint, config = {}) {
    const ttl = config.cacheTtl ?? 8000
    const cacheKey = getCacheKey(this.basePath, endpoint, config)
    const cached = getCachedValue(cacheKey, ttl)
    if (cached) return cached

    const pending = getInFlight(cacheKey)
    if (pending) return pending

    const request = api.get(`${this.basePath}${endpoint}`, config)
      .then((response) => {
        const value = response.data.data || response.data
        setCachedValue(cacheKey, value)
        return value
      })
      .catch((error) => {
        this.handleError(error)
      })
      .finally(() => clearInFlight(cacheKey))

    setInFlight(cacheKey, request)
    return request

    /*
    try {
      const response = await api.get(`${this.basePath}${endpoint}`, config)
      return response.data.data || response.data
    } catch (error) {
      this.handleError(error)
    }
    */
  }

  async post(endpoint, data = {}, config = {}) {
    try {
      const response = await api.post(`${this.basePath}${endpoint}`, data, config)
      clearGetCache(this.basePath)
      return response.data.data || response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async put(endpoint, data = {}, config = {}) {
    try {
      const response = await api.put(`${this.basePath}${endpoint}`, data, config)
      clearGetCache(this.basePath)
      return response.data.data || response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async patch(endpoint, data = {}, config = {}) {
    try {
      const response = await api.patch(`${this.basePath}${endpoint}`, data, config)
      clearGetCache(this.basePath)
      return response.data.data || response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async delete(endpoint, config = {}) {
    try {
      const response = await api.delete(`${this.basePath}${endpoint}`, config)
      clearGetCache(this.basePath)
      return response.data.data || response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  handleError(error) {
    if (isAbortError(error)) {
      throw error
    }

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

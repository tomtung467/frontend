import axios from 'axios'

// Debug: Log the API URL being used
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
console.log('API URL:', apiUrl)
console.log('VITE_API_URL env:', import.meta.env.VITE_API_URL)

const api = axios.create({
  baseURL: 'http://localhost:8000/api',  // Force port 8000 for testing
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
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

// Handle responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        )

        const { access_token } = response.data
        localStorage.setItem('token', access_token)
        api.defaults.headers.Authorization = `Bearer ${access_token}`

        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api

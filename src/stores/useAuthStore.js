import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const isAuthenticated = computed(() => !!token.value)
  const loading = ref(false)
  const error = ref(null)

  /**
   * Get default route based on user role
   */
  function getDefaultRoute() {
    if (!user.value) return '/login'
    
    const roleRoutes = {
      customer: '/menu',
      staff: '/floor-plan',
      chef: '/kitchen',
      manager: '/dashboard',
      admin: '/dashboard',
    }
    
    return roleRoutes[user.value.role] || '/menu'
  }

  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/login', credentials)
      token.value = response.data.access_token
      user.value = response.data.user
      localStorage.setItem('token', token.value)
      if (api.defaults.headers.common) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(data) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/register', data)
      token.value = response.data.access_token
      user.value = response.data.user
      localStorage.setItem('token', token.value)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      token.value = ''
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  async function refreshToken() {
    try {
      const response = await api.post('/auth/refresh')
      token.value = response.data.access_token
      localStorage.setItem('token', token.value)
      return response.data
    } catch (err) {
      logout()
      throw err
    }
  }

  async function getCurrentUser() {
    try {
      const response = await api.get('/auth/me')
      user.value = response.data.data || response.data.user || response.data
      return user.value
    } catch (err) {
      console.error('Failed to fetch current user:', err)
      throw err
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    getCurrentUser,
    getDefaultRoute,
  }
})

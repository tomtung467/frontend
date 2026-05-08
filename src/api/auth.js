import api from './index'

export const authAPI = {
  login(email, password) {
    return api.post('/auth/login', { email, password })
  },

  register(name, email, password, passwordConfirmation) {
    return api.post('/auth/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    })
  },

  logout() {
    return api.post('/auth/logout')
  },

  forgotPassword(email) {
    return api.post('/auth/forgot-password', { email })
  },

  resetPassword(email, token, password, passwordConfirmation) {
    return api.post('/auth/reset-password', {
      email,
      token,
      password,
      password_confirmation: passwordConfirmation,
    })
  },

  refreshToken() {
    return api.post('/auth/refresh')
  },

  getCurrentUser() {
    return api.get('/auth/me')
  },
}

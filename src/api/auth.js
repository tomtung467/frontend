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

  refreshToken() {
    return api.post('/auth/refresh')
  },

  getCurrentUser() {
    return api.get('/auth/me')
  },
}

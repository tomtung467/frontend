import BaseService from './BaseService'

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export default class AuthService extends BaseService {
  constructor() {
    super('/auth')
  }

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   */
  async login(credentials) {
    return this.post('/login', credentials)
  }

  /**
   * Register new user
   * @param {Object} data - { name, email, password, password_confirmation }
   */
  async register(data) {
    return this.post('/register', data)
  }

  /**
   * Logout user
   */
  async logout() {
    return this.post('/logout')
  }

  /**
   * Refresh JWT token
   */
  async refresh() {
    return this.post('/refresh')
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    return this.get('/me')
  }

  /**
   * Change password
   * @param {Object} data - { current_password, new_password, new_password_confirmation }
   */
  async changePassword(data) {
    return this.post('/change-password', data)
  }

  /**
   * Request password reset
   * @param {Object} data - { email }
   */
  async requestPasswordReset(data) {
    return this.post('/forgot-password', data)
  }

  /**
   * Reset password with token
   * @param {Object} data - { token, email, password, password_confirmation }
   */
  async resetPassword(data) {
    return this.post('/reset-password', data)
  }

  /**
   * Verify email
   * @param {Object} data - { token }
   */
  async verifyEmail(data) {
    return this.post('/verify-email', data)
  }
}

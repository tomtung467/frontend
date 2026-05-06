import BaseService from './BaseService'

/**
 * User Service
 * Handles user profile and settings
 */
export default class UserService extends BaseService {
  constructor() {
    super('/users')
  }

  /**
   * Get user profile
   * @param {number} id - User ID
   */
  async getUserProfile(id) {
    return this.get(`/${id}`)
  }

  /**
   * Update user profile
   * @param {number} id - User ID
   * @param {Object} data - { name, phone, avatar_url, bio }
   */
  async updateUserProfile(id, data) {
    return this.put(`/${id}`, data)
  }

  /**
   * Update user settings
   * @param {number} id - User ID
   * @param {Object} settings - User settings/preferences
   */
  async updateUserSettings(id, settings) {
    return this.put(`/${id}/settings`, settings)
  }

  /**
   * Get user settings
   * @param {number} id - User ID
   */
  async getUserSettings(id) {
    return this.get(`/${id}/settings`)
  }

  /**
   * Upload avatar
   * @param {number} id - User ID
   * @param {File} file - Image file
   */
  async uploadAvatar(id, file) {
    const formData = new FormData()
    formData.append('avatar', file)
    return this.post(`/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  /**
   * Delete user account
   * @param {number} id - User ID
   * @param {string} password - User password for confirmation
   */
  async deleteAccount(id, password) {
    return this.delete(`/${id}`, { data: { password } })
  }

  /**
   * Get user activity log
   * @param {number} id - User ID
   * @param {Object} filters - { limit, page }
   */
  async getUserActivityLog(id, filters = {}) {
    return this.get(`/${id}/activity-log`, { params: filters })
  }

  /**
   * Get user login history
   * @param {number} id - User ID
   * @param {Object} filters - { limit, page }
   */
  async getUserLoginHistory(id, filters = {}) {
    return this.get(`/${id}/login-history`, { params: filters })
  }

  /**
   * Enable two-factor authentication
   * @param {number} id - User ID
   */
  async enable2FA(id) {
    return this.post(`/${id}/2fa/enable`, {})
  }

  /**
   * Disable two-factor authentication
   * @param {number} id - User ID
   */
  async disable2FA(id) {
    return this.post(`/${id}/2fa/disable`, {})
  }

  /**
   * Verify 2FA code
   * @param {number} id - User ID
   * @param {string} code - OTP code
   */
  async verify2FACode(id, code) {
    return this.post(`/${id}/2fa/verify`, { code })
  }

  /**
   * Get user notification preferences
   * @param {number} id - User ID
   */
  async getNotificationPreferences(id) {
    return this.get(`/${id}/notifications`)
  }

  /**
   * Update notification preferences
   * @param {number} id - User ID
   * @param {Object} preferences - Notification preferences
   */
  async updateNotificationPreferences(id, preferences) {
    return this.put(`/${id}/notifications`, preferences)
  }

  /**
   * Get user notifications
   * @param {number} id - User ID
   * @param {Object} filters - { limit, page, read }
   */
  async getUserNotifications(id, filters = {}) {
    return this.get(`/${id}/notifications/list`, { params: filters })
  }

  /**
   * Mark notification as read
   * @param {number} id - User ID
   * @param {number} notificationId - Notification ID
   */
  async markNotificationAsRead(id, notificationId) {
    return this.put(`/${id}/notifications/${notificationId}/read`, {})
  }

  /**
   * Export user data
   * @param {number} id - User ID
   */
  async exportUserData(id) {
    return this.get(`/${id}/export`)
  }
}

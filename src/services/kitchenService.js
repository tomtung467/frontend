import BaseService from './BaseService'

/**
 * Kitchen Service
 * Handles kitchen queue and order preparation
 */
export default class KitchenService extends BaseService {
  constructor() {
    super('/kitchen')
  }

  /**
   * Get order queue
   * @param {Object} filters - { status, limit }
   */
  async getQueue(filters = {}) {
    return this.get('/queue', { params: filters })
  }

  /**
   * Get order details from kitchen view
   * @param {number} id - Order ID
   */
  async getOrderDetails(id) {
    return this.get(`/queue/${id}`)
  }

  /**
   * Update order status
   * @param {number} id - Order ID
   * @param {string} status - New status (pending, preparing, ready, completed)
   */
  async updateOrderStatus(id, status) {
    return this.put(`/orders/${id}/status`, { status })
  }

  /**
   * Mark order as ready for pickup
   * @param {number} id - Order ID
   */
  async markOrderReady(id) {
    return this.put(`/orders/${id}/status`, { status: 'ready' })
  }

  /**
   * Mark order as completed
   * @param {number} id - Order ID
   */
  async completeOrder(id) {
    return this.put(`/orders/${id}/complete`, {})
  }

  /**
   * Get ready orders (waiting for pickup)
   */
  async getReadyOrders() {
    return this.get('/ready-orders')
  }

  /**
   * Print order ticket
   * @param {number} id - Order ID
   */
  async printOrder(id) {
    return this.post(`/orders/${id}/print`, {})
  }

  /**
   * Get kitchen statistics
   */
  async getKitchenStats() {
    return this.get('/stats')
  }

  /**
   * Get average preparation time
   */
  async getAveragePrepTime() {
    return this.get('/stats/avg-prep-time')
  }

  /**
   * Get orders by status
   * @param {string} status - Filter by status
   */
  async getOrdersByStatus(status) {
    return this.get('/queue', { params: { status } })
  }

  /**
   * Add note to order
   * @param {number} id - Order ID
   * @param {string} note - Note content
   */
  async addOrderNote(id, note) {
    return this.post(`/orders/${id}/notes`, { note })
  }

  /**
   * Get all order notes
   * @param {number} id - Order ID
   */
  async getOrderNotes(id) {
    return this.get(`/orders/${id}/notes`)
  }
}

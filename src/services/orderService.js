import BaseService from './BaseService'

/**
 * Order Service
 * Handles order operations
 */
export default class OrderService extends BaseService {
  constructor() {
    super('/orders')
  }

  /**
   * Get all orders
   * @param {Object} filters - { status, table_id, limit, page }
   */
  async getOrders(filters = {}) {
    return this.get('', { params: filters })
  }

  /**
   * Get order details
   * @param {number} id - Order ID
   */
  async getOrderDetails(id) {
    return this.get(`/${id}`)
  }

  /**
   * Create new order
   * @param {Object} data - { table_id, items[], notes, customer_info }
   */
  async createOrder(data) {
    return this.post('', data)
  }

  /**
   * Update order
   * @param {number} id - Order ID
   * @param {Object} data - Updated order data
   */
  async updateOrder(id, data) {
    return this.put(`/${id}`, data)
  }

  /**
   * Update order status
   * @param {number} id - Order ID
   * @param {string} status - New status (pending, preparing, ready, completed, cancelled)
   */
  async updateOrderStatus(id, status) {
    return this.put(`/${id}/status`, { status })
  }

  async requestPayment(id) {
    return this.post(`/${id}/request-payment`, {})
  }

  /**
   * Cancel order
   * @param {number} id - Order ID
   * @param {string} reason - Cancellation reason
   */
  async cancelOrder(id, reason = '') {
    return this.delete(`/${id}`, { data: { reason } })
  }

  /**
   * Get orders for specific table
   * @param {number} tableId - Table ID
   */
  async getOrdersByTable(tableId) {
    return this.get(`/table/${tableId}`)
  }

  /**
   * Get order statistics
   */
  async getOrderStats() {
    return this.get('/stats/summary')
  }

  /**
   * Add item to order
   * @param {number} orderId - Order ID
   * @param {Object} item - { food_id, quantity, notes }
   */
  async addOrderItem(orderId, item) {
    return this.post(`/${orderId}/items`, item)
  }

  /**
   * Remove item from order
   * @param {number} orderId - Order ID
   * @param {number} itemId - Order item ID
   */
  async removeOrderItem(orderId, itemId) {
    return this.delete(`/${orderId}/items/${itemId}`)
  }

  /**
   * Update order item quantity
   * @param {number} orderId - Order ID
   * @param {number} itemId - Order item ID
   * @param {number} quantity - New quantity
   */
  async updateOrderItem(orderId, itemId, quantity) {
    return this.put(`/${orderId}/items/${itemId}`, { quantity })
  }

  /**
   * Get order timeline/history
   * @param {number} id - Order ID
   */
  async getOrderTimeline(id) {
    return this.get(`/${id}/timeline`)
  }
}

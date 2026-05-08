import api from './index'

export const orderAPI = {
  createOrder(data) {
    return api.post('/orders', data)
  },

  getOrders(params = {}) {
    return api.get('/orders', { params })
  },

  getOrderDetails(orderId) {
    return api.get(`/orders/${orderId}`)
  },

  updateOrderStatus(orderId, status) {
    return api.put(`/orders/${orderId}/status`, { status })
  },

  updateOrderItemStatus(orderId, itemId, status) {
    return api.put(`/orders/${orderId}/items/${itemId}/status`, { status })
  },

  cancelOrder(orderId) {
    return api.post(`/orders/${orderId}/cancel`)
  },

  getOrderStats(params = {}) {
    return api.get('/orders/stats', { params })
  },
}

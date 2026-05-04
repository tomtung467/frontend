import api from './index'

export const kitchenAPI = {
  getQueue() {
    return api.get('/kitchen/queue')
  },

  getOrderDetails(orderId) {
    return api.get(`/kitchen/queue/${orderId}`)
  },

  updateOrderStatus(orderId, status) {
    return api.put(`/kitchen/orders/${orderId}/status`, { status })
  },

  getReadyOrders() {
    return api.get('/kitchen/ready-orders')
  },

  completeOrder(orderId) {
    return api.put(`/kitchen/orders/${orderId}/complete`)
  },

  printOrder(orderId) {
    return api.post(`/kitchen/orders/${orderId}/print`)
  },
}

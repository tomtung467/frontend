import api from './index'

export const paymentAPI = {
  processPayment(orderId, data) {
    return api.post('/payments', { order_id: orderId, ...data })
  },

  getPaymentDetails(paymentId) {
    return api.get(`/payments/${paymentId}`)
  },

  getOrderPayments(orderId) {
    return api.get(`/orders/${orderId}/payments`)
  },

  generateInvoice(orderId) {
    return api.post(`/orders/${orderId}/invoice`)
  },

  getInvoice(invoiceId) {
    return api.get(`/invoices/${invoiceId}`)
  },

  applyCoupon(orderId, couponCode) {
    return api.post(`/orders/${orderId}/coupon`, { code: couponCode })
  },

  validateCoupon(couponCode) {
    return api.post('/coupons/validate', { code: couponCode })
  },
}

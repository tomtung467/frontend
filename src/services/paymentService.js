import BaseService from './BaseService'

/**
 * Payment Service
 * Handles payment and billing operations
 */
export default class PaymentService extends BaseService {
  constructor() {
    super('')
  }

  /**
   * Process payment
   * @param {Object} data - { order_id, amount, method, reference }
   */
  async processPayment(data) {
    return this.post('/payments', data)
  }

  /**
   * Get payment details
   * @param {number} id - Payment ID
   */
  async getPaymentDetails(id) {
    return this.get(`/payments/${id}`)
  }

  /**
   * Get order payments
   * @param {number} orderId - Order ID
   */
  async getOrderPayments(orderId) {
    return this.get(`/orders/${orderId}/payments`)
  }

  /**
   * Refund payment
   * @param {number} id - Payment ID
   * @param {string} reason - Refund reason
   */
  async refundPayment(id, reason = '') {
    return this.post(`/payments/${id}/refund`, { reason })
  }

  /**
   * Generate invoice
   * @param {number} orderId - Order ID
   * @param {Object} data - Invoice details
   */
  async generateInvoice(orderId, data = {}) {
    return this.post(`/orders/${orderId}/invoice`, data)
  }

  /**
   * Get invoice
   * @param {number} id - Invoice ID
   */
  async getInvoice(id) {
    return this.get(`/invoices/${id}`)
  }

  async getPayments(filters = {}) {
    return this.get('/payments', { params: filters })
  }

  async getInvoices(filters = {}) {
    return this.get('/invoices', { params: filters })
  }

  async getCurrentBills(filters = {}) {
    return this.get('/invoices/current', { params: filters })
  }

  /**
   * Get order invoices
   * @param {number} orderId - Order ID
   */
  async getOrderInvoices(orderId) {
    return this.get(`/orders/${orderId}/invoices`)
  }

  /**
   * Export invoice as PDF
   * @param {number} id - Invoice ID
   */
  async exportInvoicePDF(id) {
    return this.get(`/invoices/${id}/pdf`)
  }

  /**
   * Send invoice via email
   * @param {number} id - Invoice ID
   * @param {string} email - Recipient email
   */
  async sendInvoiceEmail(id, email) {
    return this.post(`/invoices/${id}/send-email`, { email })
  }

  /**
   * Apply coupon to order
   * @param {number} orderId - Order ID
   * @param {string} couponCode - Coupon code
   */
  async applyCoupon(orderId, couponCode) {
    return this.post(`/orders/${orderId}/coupon`, { coupon_code: couponCode })
  }

  /**
   * Validate coupon
   * @param {string} code - Coupon code
   */
  async validateCoupon(code) {
    return this.post('/coupons/validate', { code })
  }

  /**
   * Remove coupon from order
   * @param {number} orderId - Order ID
   */
  async removeCoupon(orderId) {
    return this.delete(`/orders/${orderId}/coupon`)
  }

  /**
   * Get all coupons
   */
  async getCoupons() {
    return this.get('/coupons')
  }

  /**
   * Create coupon
   * @param {Object} data - Coupon data
   */
  async createCoupon(data) {
    return this.post('/coupons', data)
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods() {
    return this.get('/methods')
  }

  /**
   * Get payment statistics
   * @param {Object} filters - { from_date, to_date }
   */
  async getPaymentStats(filters = {}) {
    return this.get('/stats', { params: filters })
  }

  /**
   * Get daily revenue
   * @param {Object} filters - { from_date, to_date }
   */
  async getDailyRevenue(filters = {}) {
    return this.get('/daily-revenue', { params: filters })
  }

  /**
   * Get payment breakdown
   * @param {Object} filters - { from_date, to_date }
   */
  async getPaymentBreakdown(filters = {}) {
    return this.get('/breakdown', { params: filters })
  }

  /**
   * Get outstanding payments
   */
  async getOutstandingPayments() {
    return this.get('/outstanding')
  }

  /**
   * Record payment received
   * @param {number} id - Payment ID
   */
  async recordPaymentReceived(id) {
    return this.post(`/${id}/received`, {})
  }
}

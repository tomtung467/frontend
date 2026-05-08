import api from './index'

export const analyticsAPI = {
  getDashboardData() {
    return api.get('/analytics/dashboard')
  },

  getRevenueData(params = {}) {
    return api.get('/analytics/revenue', { params })
  },

  getTopDishes(params = {}) {
    return api.get('/analytics/top-dishes', { params })
  },

  getOrderAnalytics(params = {}) {
    return api.get('/analytics/orders', { params })
  },

  getInventoryAnalytics(params = {}) {
    return api.get('/analytics/inventory', { params })
  },

  getEmployeePerformance(params = {}) {
    return api.get('/analytics/employees', { params })
  },

  getSalesReport(data) {
    return api.post('/analytics/reports', data)
  },

  getPaymentMethodBreakdown(params = {}) {
    return api.get('/analytics/payment-breakdown', { params })
  },

  getCustomerMetrics(params = {}) {
    return api.get('/analytics/customers', { params })
  },
}

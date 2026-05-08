import BaseService from './BaseService'

/**
 * Analytics Service
 * Handles analytics, reports and dashboard data
 */
export default class AnalyticsService extends BaseService {
  constructor() {
    super('/analytics')
  }

  /**
   * Get dashboard data
   * @param {Object} filters - { from_date, to_date }
   */
  async getDashboardData(filters = {}) {
    return this.get('/dashboard', { params: filters })
  }

  /**
   * Get revenue data
   * @param {Object} filters - { from_date, to_date, period }
   */
  async getRevenueData(filters = {}) {
    return this.get('/revenue', { params: filters })
  }

  /**
   * Get top dishes
   * @param {Object} filters - { limit, from_date, to_date }
   */
  async getTopDishes(filters = {}) {
    return this.get('/top-dishes', { params: filters })
  }

  /**
   * Get order analytics
   * @param {Object} filters - { from_date, to_date, status }
   */
  async getOrderAnalytics(filters = {}) {
    return this.get('/orders', { params: filters })
  }

  /**
   * Get inventory analytics
   * @param {Object} filters - { start_date, end_date }
   */
  async getInventoryAnalytics(filters = {}) {
    return this.get('/inventory', { params: filters })
  }

  /**
   * Get employee performance data
   * @param {Object} filters - { department_id, from_date, to_date }
   */
  async getEmployeePerformance(filters = {}) {
    return this.get('/employees', { params: filters })
  }

  /**
   * Generate sales report
   * @param {Object} data - { from_date, to_date, format, groupBy }
   */
  async generateSalesReport(data) {
    return this.post('/reports', data)
  }

  /**
   * Get sales report
   * @param {number} id - Report ID
   */
  async getSalesReport(id) {
    return this.get(`/reports/${id}`)
  }

  /**
   * Export report
   * @param {number} id - Report ID
   * @param {string} format - Export format (pdf, csv, excel)
   */
  async exportReport(id, format = 'pdf') {
    return this.get(`/reports/${id}/export`, { params: { format } })
  }

  /**
   * Get payment method breakdown
   * @param {Object} filters - { from_date, to_date }
   */
  async getPaymentMethodBreakdown(filters = {}) {
    return this.get('/payment-breakdown', { params: filters })
  }

  /**
   * Get customer metrics
   * @param {Object} filters - { from_date, to_date }
   */
  async getCustomerMetrics(filters = {}) {
    return this.get('/customers', { params: filters })
  }

  /**
   * Get table utilization
   * @param {Object} filters - { from_date, to_date }
   */
  async getTableUtilization(filters = {}) {
    return this.get('/table-utilization', { params: filters })
  }

  /**
   * Get busiest hours
   * @param {Object} filters - { from_date, to_date }
   */
  async getBusiestHours(filters = {}) {
    return this.get('/busiest-hours', { params: filters })
  }

  /**
   * Get staff productivity
   * @param {Object} filters - { from_date, to_date, department_id }
   */
  async getStaffProductivity(filters = {}) {
    return this.get('/staff-productivity', { params: filters })
  }

  /**
   * Get inventory analysis
   * @param {Object} filters - { from_date, to_date }
   */
  async getInventoryAnalysis(filters = {}) {
    return this.get('/inventory-analysis', { params: filters })
  }

  /**
   * Get cost analysis
   * @param {Object} filters - { from_date, to_date }
   */
  async getCostAnalysis(filters = {}) {
    return this.get('/cost-analysis', { params: filters })
  }

  /**
   * Get profit analysis
   * @param {Object} filters - { from_date, to_date, groupBy }
   */
  async getProfitAnalysis(filters = {}) {
    return this.get('/profit-analysis', { params: filters })
  }

  /**
   * Get year-over-year comparison
   * @param {Object} filters - { year1, year2 }
   */
  async getYearOverYearComparison(filters = {}) {
    return this.get('/yoy-comparison', { params: filters })
  }

  /**
   * Export dashboard snapshot
   * @param {string} format - Export format (pdf, image)
   */
  async exportDashboard(format = 'pdf') {
    return this.get('/dashboard/export', { params: { format } })
  }

  /**
   * Schedule report
   * @param {Object} data - Schedule configuration
   */
  async scheduleReport(data) {
    return this.post('/schedule-report', data)
  }

  /**
   * Get scheduled reports
   */
  async getScheduledReports() {
    return this.get('/scheduled-reports')
  }
}

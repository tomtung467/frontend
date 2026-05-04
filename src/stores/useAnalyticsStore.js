import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

export const useAnalyticsStore = defineStore('analytics', () => {
  const dashboardData = ref(null)
  const revenueData = ref([])
  const topDishes = ref([])
  const employeePerformance = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchDashboardData(period = 'today') {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/analytics/dashboard', { params: { period } })
      dashboardData.value = response.data
    } catch (err) {
      error.value = 'Failed to fetch dashboard data'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchRevenueData(startDate, endDate) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/analytics/revenue', {
        params: { start_date: startDate, end_date: endDate },
      })
      revenueData.value = response.data
    } catch (err) {
      error.value = 'Failed to fetch revenue data'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchTopDishes(limit = 10, period = 'month') {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/analytics/top-dishes', {
        params: { limit, period },
      })
      topDishes.value = response.data
    } catch (err) {
      error.value = 'Failed to fetch top dishes'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchEmployeePerformance(period = 'month') {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/analytics/employees', {
        params: { period },
      })
      employeePerformance.value = response.data
    } catch (err) {
      error.value = 'Failed to fetch employee performance'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function generateSalesReport(reportType, startDate, endDate) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/analytics/reports', {
        report_type: reportType,
        start_date: startDate,
        end_date: endDate,
      })
      return response.data
    } catch (err) {
      error.value = 'Failed to generate sales report'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    dashboardData,
    revenueData,
    topDishes,
    employeePerformance,
    loading,
    error,
    fetchDashboardData,
    fetchRevenueData,
    fetchTopDishes,
    fetchEmployeePerformance,
    generateSalesReport,
  }
})

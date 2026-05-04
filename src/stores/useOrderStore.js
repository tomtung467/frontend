import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const currentOrder = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchOrders(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams(filters)
      const response = await api.get(`/orders?${params.toString()}`)
      orders.value = response.data
    } catch (err) {
      error.value = 'Failed to fetch orders'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createOrder(data) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/orders', data)
      currentOrder.value = response.data
      orders.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = 'Failed to create order'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateOrderStatus(orderId, status) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/orders/${orderId}`, { status })
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index] = response.data
      }
      if (currentOrder.value?.id === orderId) {
        currentOrder.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = 'Failed to update order'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getOrderDetails(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}`)
      currentOrder.value = response.data
      return response.data
    } catch (err) {
      error.value = 'Failed to fetch order details'
      throw err
    }
  }

  return {
    orders,
    currentOrder,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    getOrderDetails,
  }
})

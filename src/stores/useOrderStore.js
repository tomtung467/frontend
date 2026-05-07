import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'
import { isAbortError } from '@/api/requestManager'
import {
  subscribeFirestoreList,
  syncOrderFirestore,
  syncOrdersFirestore,
} from '@/services/firebaseFirestoreService'

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
      orders.value = response.data?.data?.data || response.data?.data || response.data
      await syncOrdersFirestore(Array.isArray(orders.value) ? orders.value : [])
    } catch (err) {
      if (isAbortError(err)) throw err
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
      currentOrder.value = response.data?.data || response.data
      orders.value.push(currentOrder.value)
      await syncOrderFirestore(currentOrder.value)
      return currentOrder.value
    } catch (err) {
      if (isAbortError(err)) throw err
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
      const response = await api.put(`/orders/${orderId}/status`, { status })
      const updated = response.data?.data || response.data
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index] = updated
      }
      if (currentOrder.value?.id === orderId) {
        currentOrder.value = updated
      }
      await syncOrderFirestore(updated)
      return updated
    } catch (err) {
      if (isAbortError(err)) throw err
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
      currentOrder.value = response.data?.data || response.data
      return currentOrder.value
    } catch (err) {
      error.value = 'Failed to fetch order details'
      throw err
    }
  }

  async function requestPayment(orderId) {
    const response = await api.post(`/orders/${orderId}/request-payment`)
    const updated = response.data?.data || response.data
    const index = orders.value.findIndex(o => o.id === orderId)
    if (index !== -1) orders.value[index] = updated
    await syncOrderFirestore(updated)
    return updated
  }

  function subscribeToOrders(filters = {}, options = {}) {
    const path = filters.tableId || filters.table_id
      ? `tableOrders/${filters.tableId || filters.table_id}`
      : 'orders'

    return subscribeFirestoreList(path, (firestoreOrders) => {
      orders.value = firestoreOrders
    }, options)
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
    requestPayment,
    subscribeToOrders,
  }
})

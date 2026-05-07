import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'
import {
  subscribeFirestoreList,
  syncKitchenQueueFirestore,
  syncOrderFirestore,
} from '@/services/firebaseFirestoreService'

export const useKitchenStore = defineStore('kitchen', () => {
  const queue = ref([])
  const readyOrders = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchQueue() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/kitchen/queue')
      queue.value = response.data?.data || response.data
      await syncKitchenQueueFirestore(Array.isArray(queue.value) ? queue.value : [])
    } catch (err) {
      error.value = 'Failed to fetch kitchen queue'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchReadyOrders() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/kitchen/ready-orders')
      readyOrders.value = response.data?.data || response.data
    } catch (err) {
      error.value = 'Failed to fetch ready orders'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function updateOrderStatus(orderId, status) {
    try {
      const response = await api.put(`/kitchen/orders/${orderId}/status`, { status })
      const updated = response.data?.data || response.data
      const index = queue.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        queue.value[index] = updated
      }
      await syncOrderFirestore(updated)
      return updated
    } catch (err) {
      error.value = 'Failed to update order status'
      throw err
    }
  }

  async function completeOrder(orderId) {
    try {
      const response = await api.put(`/kitchen/orders/${orderId}/complete`)
      const updated = response.data?.data || response.data
      queue.value = queue.value.filter(o => o.id !== orderId)
      await syncOrderFirestore(updated)
      return updated
    } catch (err) {
      error.value = 'Failed to complete order'
      throw err
    }
  }

  async function printOrder(orderId) {
    try {
      const response = await api.post(`/kitchen/orders/${orderId}/print`)
      return response.data
    } catch (err) {
      error.value = 'Failed to print order'
      throw err
    }
  }

  function subscribeToQueue(options = {}) {
    return subscribeFirestoreList('kitchenQueue', (firestoreQueue) => {
      queue.value = firestoreQueue
    }, options)
  }

  return {
    queue,
    readyOrders,
    loading,
    error,
    fetchQueue,
    fetchReadyOrders,
    updateOrderStatus,
    completeOrder,
    printOrder,
    subscribeToQueue,
  }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

export const useKitchenStore = defineStore('kitchen', () => {
  const queue = ref([])
  const readyOrders = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchQueue(options = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/kitchen/queue')
      queue.value = response.data?.data || response.data
      if (options.syncFirestore) {
        const { syncKitchenQueueFirestore } = await import('@/services/firebaseFirestoreService')
        await syncKitchenQueueFirestore(Array.isArray(queue.value) ? queue.value : [])
      }
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
    const token = localStorage.getItem('token')
    const streamUrl = `${api.defaults.baseURL}/kitchen/queue-stream?token=${encodeURIComponent(token || '')}`
    let eventSource
    let disposed = false

    function startFallback(error) {
      options.onUnavailable?.(error)
    }

    if (typeof EventSource === 'undefined' || !token) {
      startFallback()
      return () => {
        disposed = true
      }
    }

    eventSource = new EventSource(streamUrl)
    eventSource.addEventListener('queue', (event) => {
      if (disposed) return
      try {
        const nextQueue = JSON.parse(event.data)
        queue.value = Array.isArray(nextQueue) ? nextQueue : []
        error.value = null
      } catch (parseError) {
        console.warn('Failed to parse kitchen queue stream:', parseError)
      }
    })
    eventSource.onerror = (streamError) => {
      if (!disposed) {
        console.info('Kitchen queue stream reconnecting...', streamError)
        startFallback(streamError)
      }
    }

    return () => {
      disposed = true
      eventSource?.close()
    }
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

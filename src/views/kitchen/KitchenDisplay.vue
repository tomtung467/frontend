<template>
  <div class="kitchen-display min-h-screen bg-gray-900">
    <!-- Header -->
    <header class="bg-black text-white p-4 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold">Kitchen Display System (KDS)</h1>
        <p class="text-gray-400">{{ currentTime }}</p>
      </div>
      <div class="text-right">
        <p class="text-2xl font-bold">{{ totalQueueItems }} Items</p>
        <p class="text-gray-400">{{ averageCookTime }}min avg</p>
      </div>
    </header>

    <!-- Section Filter -->
    <div class="bg-gray-800 text-white p-4 flex gap-4">
      <button
        v-for="section in sections"
        :key="section.id"
        @click="activeSection = section.id"
        :class="[
          'px-6 py-2 rounded-lg font-bold text-lg transition',
          activeSection === section.id
            ? 'bg-blue-600'
            : 'bg-gray-700 hover:bg-gray-600'
        ]"
      >
        {{ section.name }}
        <span class="ml-2 bg-gray-600 px-2 py-1 rounded text-sm">
          {{ getItemCountBySection(section.id) }}
        </span>
      </button>
    </div>

    <!-- Kanban Board -->
    <div class="p-6 grid grid-cols-3 gap-6">
      <!-- Queue Column -->
      <KitchenColumn
        title="Queue"
        :items="queueItems"
        status="queue"
        @start="startCooking"
      />

      <!-- Cooking Column -->
      <KitchenColumn
        title="Cooking"
        :items="cookingItems"
        status="preparing"
        @complete="markReady"
      />

      <!-- Ready Column -->
      <KitchenColumn
        title="Ready"
        :items="readyItems"
        status="ready"
        @pickup="notifyPickup"
      />
    </div>

    <!-- Real-time Alerts -->
    <div v-if="urgentOrders.length > 0" class="fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <h3 class="font-bold mb-2">⚠️ Urgent Orders</h3>
      <ul class="text-sm space-y-1">
        <li v-for="order in urgentOrders" :key="order.id">
          Table {{ order.table_number }} - {{ order.elapsed_time }}s waiting
        </li>
      </ul>
    </div>

    <!-- Statistics -->
    <div v-if="selectedItem" class="fixed bottom-4 left-4 bg-white text-gray-900 p-4 rounded-lg shadow-lg">
      <p class="font-bold">{{ selectedItem.food_name }}</p>
      <p class="text-gray-600">Qty: {{ selectedItem.quantity }}</p>
      <p class="text-sm mt-2">{{ selectedItem.notes }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useKitchen } from '@/composables/useKitchen'
import { useRealtime } from '@/composables/useRealtime'
import { useNotification } from '@/composables/useNotification'
import * as kitchenAPI from '@/api/kitchen'
import KitchenColumn from '@/components/kitchen/KitchenColumn.vue'

const { notifyKitchenReady } = useNotification()
const { startListeningToKitchen, stopListeningToKitchen } = useRealtime()

const loading = ref(false)
const queueItems = ref([])
const cookingItems = ref([])
const readyItems = ref([])
const selectedItem = ref(null)
const activeSection = ref('all')
const currentTime = ref('')

const sections = [
  { id: 'all', name: '🍽️ All' },
  { id: 'cold', name: '❄️ Cold Prep' },
  { id: 'hot', name: '🔥 Hot Station' },
  { id: 'beverage', name: '🥤 Beverage' },
]

// Computed
const allItems = computed(() => [...queueItems.value, ...cookingItems.value, ...readyItems.value])

const filteredItems = computed(() => {
  if (activeSection.value === 'all') return allItems.value
  return allItems.value.filter(item => item.section === activeSection.value)
})

const totalQueueItems = computed(() => allItems.value.length)

const averageCookTime = computed(() => {
  if (cookingItems.value.length === 0) return 0
  const total = cookingItems.value.reduce((sum, item) => sum + (item.elapsed_time || 0), 0)
  return Math.round(total / cookingItems.value.length)
})

const urgentOrders = computed(() => {
  return allItems.value
    .filter(item => item.elapsed_time > 300) // More than 5 minutes
    .sort((a, b) => b.elapsed_time - a.elapsed_time)
    .slice(0, 3)
})

// Methods
const fetchKitchenQueue = async () => {
  try {
    loading.value = true
    const response = await kitchenAPI.getQueue()
    const items = response.data.data

    queueItems.value = items.filter(i => i.status === 'queue')
    cookingItems.value = items.filter(i => i.status === 'preparing')
    readyItems.value = items.filter(i => i.status === 'ready')
  } catch (error) {
    console.error('Failed to fetch kitchen queue:', error)
  } finally {
    loading.value = false
  }
}

const startCooking = async (item) => {
  try {
    await kitchenAPI.updateItemStatus(item.id, 'preparing')
    
    // Move item from queue to cooking
    queueItems.value = queueItems.value.filter(i => i.id !== item.id)
    cookingItems.value.push({ ...item, status: 'preparing', started_at: new Date() })
    
    notifyKitchenReady('Cooking started')
  } catch (error) {
    console.error('Failed to start cooking:', error)
  }
}

const markReady = async (item) => {
  try {
    await kitchenAPI.updateItemStatus(item.id, 'ready')
    
    // Move item from cooking to ready
    cookingItems.value = cookingItems.value.filter(i => i.id !== item.id)
    readyItems.value.push({ ...item, status: 'ready', completed_at: new Date() })
    
    notifyKitchenReady(`${item.food_name} is ready!`)
  } catch (error) {
    console.error('Failed to mark as ready:', error)
  }
}

const notifyPickup = async (item) => {
  try {
    await kitchenAPI.updateItemStatus(item.id, 'served')
    readyItems.value = readyItems.value.filter(i => i.id !== item.id)
    notifyKitchenReady('Order picked up')
  } catch (error) {
    console.error('Failed to notify pickup:', error)
  }
}

const getItemCountBySection = (section) => {
  if (section === 'all') return totalQueueItems.value
  return filteredItems.value.filter(i => i.section === section).length
}

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  // Update time every second
  const timeInterval = setInterval(updateTime, 1000)
  updateTime()

  // Fetch queue data
  fetchKitchenQueue()

  // Refresh queue every 5 seconds
  const refreshInterval = setInterval(fetchKitchenQueue, 5000)

  // Listen to real-time updates
  startListeningToKitchen()

  onUnmounted(() => {
    clearInterval(timeInterval)
    clearInterval(refreshInterval)
    stopListeningToKitchen()
  })
})
</script>

<style scoped>
.kitchen-display {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.pulse-animation {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>

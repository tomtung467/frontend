<template>
  <div class="kitchen-display-view">
    <div class="kitchen-header">
      <h1>Kitchen Display System</h1>
      <button @click="refreshQueue" class="btn-refresh">Refresh Queue</button>
    </div>

    <div class="kitchen-content">
      <!-- Kanban Board Columns -->
      <div class="kanban-board">
        <div class="kanban-column pending">
          <h2>Pending <span class="count">{{ pendingOrders.length }}</span></h2>
          <div v-for="order in pendingOrders" :key="order.id" class="order-card">
            <div class="order-number">Order #{{ order.id }}</div>
            <div class="order-items">
              <div v-for="item in order.orderItems" :key="item.id" class="item">
                <span class="qty">{{ item.quantity }}x</span>
                <span class="name">{{ item.food_name }}</span>
              </div>
            </div>
            <button @click="updateStatus(order.id, 'cooking')" class="btn-action">
              Start Cooking
            </button>
          </div>
        </div>

        <div class="kanban-column cooking">
          <h2>Cooking <span class="count">{{ cookingOrders.length }}</span></h2>
          <div v-for="order in cookingOrders" :key="order.id" class="order-card">
            <div class="order-number">Order #{{ order.id }}</div>
            <div class="timer">{{ getTimer(order.id) }}</div>
            <div class="order-items">
              <div v-for="item in order.orderItems" :key="item.id" class="item">
                <span class="qty">{{ item.quantity }}x</span>
                <span class="name">{{ item.food_name }}</span>
              </div>
            </div>
            <button @click="updateStatus(order.id, 'ready')" class="btn-action">
              Ready to Serve
            </button>
          </div>
        </div>

        <div class="kanban-column ready">
          <h2>Ready <span class="count">{{ readyOrders.length }}</span></h2>
          <div v-for="order in readyOrders" :key="order.id" class="order-card">
            <div class="order-number">Order #{{ order.id }}</div>
            <div class="table-info">Table {{ order.table_id }}</div>
            <div class="order-items">
              <div v-for="item in order.orderItems" :key="item.id" class="item">
                <span class="qty">{{ item.quantity }}x</span>
                <span class="name">{{ item.food_name }}</span>
              </div>
            </div>
            <button @click="printOrder(order.id)" class="btn-print">
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useKitchenStore } from '@/stores/useKitchenStore'

const kitchenStore = useKitchenStore()
const timers = ref({})
let refreshInterval

const pendingOrders = computed(() => 
  kitchenStore.queue.filter(o => o.status === 'pending')
)
const cookingOrders = computed(() => 
  kitchenStore.queue.filter(o => o.status === 'cooking')
)
const readyOrders = computed(() => 
  kitchenStore.queue.filter(o => o.status === 'ready')
)

onMounted(async () => {
  await kitchenStore.fetchQueue()
  
  // Auto refresh every 5 seconds
  refreshInterval = setInterval(() => {
    kitchenStore.fetchQueue()
  }, 5000)

  // Start timers for cooking orders
  startTimers()
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

function startTimers() {
  cookingOrders.value.forEach(order => {
    if (!timers.value[order.id]) {
      const startTime = new Date(order.updated_at).getTime()
      timers.value[order.id] = 0
      
      const timerInterval = setInterval(() => {
        timers.value[order.id] = Math.floor(
          (new Date().getTime() - startTime) / 1000
        )
      }, 1000)
    }
  })
}

function getTimer(orderId) {
  const seconds = timers.value[orderId] || 0
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

async function refreshQueue() {
  await kitchenStore.fetchQueue()
}

async function updateStatus(orderId, status) {
  try {
    await kitchenStore.updateOrderStatus(orderId, status)
    if (status === 'cooking') {
      startTimers()
    }
  } catch (err) {
    console.error('Failed to update order status:', err)
  }
}

async function printOrder(orderId) {
  try {
    await kitchenStore.printOrder(orderId)
    alert('Order sent to printer')
  } catch (err) {
    console.error('Failed to print order:', err)
  }
}
</script>

<style scoped>
.kitchen-display-view {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.kitchen-header {
  background: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.kitchen-header h1 {
  margin: 0;
  color: #333;
}

.btn-refresh {
  background-color: #ff6b35;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-refresh:hover {
  background-color: #e55a25;
}

.kitchen-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  height: 100%;
}

.kanban-column {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.kanban-column h2 {
  margin: 0 0 15px 0;
  font-size: 18px;
  padding-bottom: 10px;
  border-bottom: 3px solid #ff6b35;
}

.kanban-column.pending h2 {
  border-bottom-color: #ff9800;
}

.kanban-column.cooking h2 {
  border-bottom-color: #f44336;
}

.kanban-column.ready h2 {
  border-bottom-color: #4caf50;
}

.count {
  background-color: #ff6b35;
  color: white;
  border-radius: 20px;
  padding: 2px 8px;
  font-size: 12px;
  margin-left: 10px;
}

.order-card {
  background: #f9f9f9;
  border: 2px solid #ddd;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  cursor: grab;
}

.order-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.order-number {
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  font-size: 16px;
}

.timer {
  background: #ffebee;
  color: #d32f2f;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  display: inline-block;
  margin-bottom: 8px;
  font-size: 14px;
}

.table-info {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: bold;
}

.order-items {
  background: white;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  border-left: 3px solid #ff6b35;
}

.item {
  display: flex;
  gap: 8px;
  padding: 5px 0;
  font-size: 14px;
  color: #333;
}

.qty {
  font-weight: bold;
  color: #ff6b35;
  min-width: 30px;
}

.btn-action,
.btn-print {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 12px;
  transition: background-color 0.3s;
}

.btn-action {
  background-color: #4caf50;
  color: white;
}

.btn-action:hover {
  background-color: #388e3c;
}

.btn-print {
  background-color: #2196f3;
  color: white;
}

.btn-print:hover {
  background-color: #1976d2;
}
</style>

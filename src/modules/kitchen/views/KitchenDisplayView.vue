<template>
  <MasterLayout>
    <main class="kitchen-page">
      <MasterPageHeader :title="t('kitchen.board')">
        <template #actions>
          <span v-if="kitchenStore.loading" class="header-spinner" aria-label="Đang làm mới"></span>
          <router-link class="ghost-action" to="/kitchen/queue">{{ t('kitchen.queueList') }}</router-link>
          <button class="primary-action" :disabled="kitchenStore.loading" @click="refreshQueue">{{ t('kitchen.refreshQueue') }}</button>
        </template>
      </MasterPageHeader>

      <p v-if="kitchenStore.error" class="state error">{{ kitchenStore.error }}</p>

      <section class="kanban-board">
        <article v-for="column in columns" :key="column.key" class="kanban-column" :class="column.key">
          <header>
            <h2>{{ column.label }}</h2>
            <span>{{ ordersByStatus(column.statuses).length }}</span>
          </header>

          <div v-if="ordersByStatus(column.statuses).length === 0" class="empty-column">
            {{ t('kitchen.noTickets') }}
          </div>

          <div v-for="order in ordersByStatus(column.statuses)" :key="order.id" class="order-card">
            <div class="order-topline">
              <strong>{{ order.order_number || `${t('kitchen.order')} #${order.id}` }}</strong>
              <span>{{ t('kitchen.table') }} {{ order.table_id }}</span>
            </div>
            <div v-if="column.key === 'cooking'" class="timer">{{ getTimer(order) }}</div>
            <div class="order-items">
              <div v-for="item in orderItems(order)" :key="item.id || item.food_id" class="item">
                <span class="qty">{{ item.quantity }}x</span>
                <span>{{ item.food?.name || item.food_name || item.name || `${t('menu.title')} #${item.food_id}` }}</span>
              </div>
            </div>
            <p v-if="order.customer_notes || order.special_requests" class="notes">
              {{ order.customer_notes || order.special_requests }}
            </p>
            <button v-if="column.next" class="ticket-action" @click="updateStatus(order.id, column.next.status)">
              {{ column.next.label }}
            </button>
            <button v-else class="ticket-action done" @click="completeOrder(order.id)">
              {{ t('kitchen.markServed') }}
            </button>
          </div>
        </article>
      </section>
    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import { useKitchenStore } from '@/stores/useKitchenStore'
import { t } from '@/languages'

const kitchenStore = useKitchenStore()
const now = ref(Date.now())
let refreshInterval
let timerInterval
let unsubscribeQueue
let stopped = false

const columns = computed(() => [
  { key: 'pending', label: t('kitchen.pending'), statuses: ['pending', 'confirmed'], next: { status: 'in_progress', label: t('kitchen.startCooking') } },
  { key: 'cooking', label: t('kitchen.cooking'), statuses: ['in_progress'], next: { status: 'ready', label: t('kitchen.readyToServe') } },
  { key: 'ready', label: t('kitchen.ready'), statuses: ['ready'], next: null },
])

onMounted(async () => {
  await kitchenStore.fetchQueue()
  unsubscribeQueue = kitchenStore.subscribeToQueue({
    onUnavailable: startPolling,
  })
  timerInterval = setInterval(() => { now.value = Date.now() }, 1000)
})

onBeforeRouteLeave(() => {
  stopRealtime()
})

onUnmounted(() => {
  stopRealtime()
})

function stopRealtime() {
  if (stopped) return
  stopped = true
  clearInterval(refreshInterval)
  clearInterval(timerInterval)
  unsubscribeQueue?.()
}

function startPolling() {
  if (refreshInterval) return
  refreshInterval = setInterval(() => kitchenStore.fetchQueue(), 5000)
}

function ordersByStatus(statuses) {
  return kitchenStore.queue.filter((order) => statuses.includes(order.status))
}

function orderItems(order) {
  return order.order_items || order.orderItems || order.items || []
}

async function refreshQueue() {
  await kitchenStore.fetchQueue()
}

async function updateStatus(orderId, status) {
  await kitchenStore.updateOrderStatus(orderId, status)
  await kitchenStore.fetchQueue()
}

async function completeOrder(orderId) {
  await kitchenStore.completeOrder(orderId)
  await kitchenStore.fetchQueue()
}

function getTimer(order) {
  const start = new Date(order.updated_at || order.created_at).getTime()
  const seconds = Math.max(0, Math.floor((now.value - start) / 1000))
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.kitchen-page { min-height: calc(100vh - 48px); background: #f5f7fb; padding: 24px; }
button, .ghost-action { border: 0; border-radius: 7px; min-height: 40px; padding: 0 14px; display: inline-flex; align-items: center; text-decoration: none; cursor: pointer; font-weight: 700; }
.primary-action { background: #ff6333; color: #fff; }
.primary-action:disabled { opacity: .78; cursor: wait; }
.ghost-action { background: #fff; color: #344054; border: 1px solid #d0d5dd; }
.header-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(17, 24, 39, .18);
  border-top-color: #ff6333;
  border-radius: 50%;
  animation: spin .75s linear infinite;
}
.state { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; margin-bottom: 14px; }
.state.error { color: #b42318; background: #fffbfa; border-color: #fecdca; }
.kanban-board { display: grid; grid-template-columns: repeat(3, minmax(280px, 1fr)); gap: 18px; min-height: calc(100vh - 170px); }
.kanban-column { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; box-shadow: 0 2px 8px rgba(16,24,40,.08); }
.kanban-column header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 3px solid #ff9800; }
.kanban-column.cooking header { border-bottom-color: #ef4444; }
.kanban-column.ready header { border-bottom-color: #22c55e; }
h2 { margin: 0; font-size: 20px; color: #111827; }
header span { background: #ff6333; color: #fff; border-radius: 999px; min-width: 30px; height: 26px; display: inline-grid; place-items: center; font-weight: 800; }
.empty-column { margin-top: 18px; color: #98a2b3; text-align: center; padding: 34px 10px; border: 1px dashed #d0d5dd; border-radius: 8px; }
.order-card { margin-top: 14px; background: #f9fafb; border: 1px solid #d0d5dd; border-left: 5px solid #ff6333; border-radius: 8px; padding: 14px; }
.order-topline { display: flex; justify-content: space-between; gap: 10px; color: #111827; }
.order-topline span { color: #475467; font-size: 13px; }
.timer { display: inline-block; margin-top: 8px; padding: 4px 8px; background: #fef3f2; color: #b42318; border-radius: 6px; font-weight: 800; }
.order-items { background: #fff; border-radius: 6px; padding: 10px; margin: 12px 0; }
.item { display: flex; gap: 8px; padding: 5px 0; color: #344054; }
.qty { min-width: 34px; color: #ff6333; font-weight: 800; }
.notes { margin: 0 0 12px; color: #475467; font-size: 13px; }
.ticket-action { width: 100%; justify-content: center; background: #16a34a; color: #fff; }
.ticket-action.done { background: #155eef; }
@keyframes spin {
  to { transform: rotate(360deg); }
}
@media (max-width: 980px) {
  .kanban-board { grid-template-columns: 1fr; }
}
</style>

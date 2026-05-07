<template>
  <MasterLayout show-footer>
    <main class="orders-page">
      <MasterPageHeader :title="t('nav.orders')">
        <template #actions>
          <select v-model="statusFilter" class="filter-control" @change="loadOrders">
            <option value="">{{ t('billing.allStatuses') }}</option>
            <option v-for="status in statuses" :key="status" :value="status">
              {{ statusLabel(status) }}
            </option>
          </select>
          <button class="ghost-action" @click="loadOrders">{{ t('customer.refresh') }}</button>
        </template>
      </MasterPageHeader>

      <section class="summary-row">
        <article>
          <span>{{ t('customer.activeOrders') }}</span>
          <strong>{{ activeOrders.length }}</strong>
        </article>
        <article>
          <span>{{ t('customer.readyToServe') }}</span>
          <strong>{{ readyOrders.length }}</strong>
        </article>
        <article>
          <span>{{ t('customer.paymentRequested') }}</span>
          <strong>{{ paymentRequested }}</strong>
        </article>
      </section>

      <p v-if="loading" class="state">{{ t('customer.loadingOrders') }}</p>
      <p v-else-if="error" class="state error">{{ error }}</p>

      <section v-else-if="orders.length" class="orders-list">
        <article v-for="order in orders" :key="order.id" class="order-card">
          <header>
            <div>
              <h2>{{ order.order_number || `${t('kitchen.order')} #${order.id}` }}</h2>
              <p>{{ t('kitchen.table') }} {{ order.table_id || '-' }} - {{ formatDate(order.created_at) }}</p>
            </div>
            <span class="status" :class="order.status">{{ statusLabel(order.status) }}</span>
          </header>

          <div class="order-body">
            <div>
              <h3>{{ t('customer.orderedItems') }}</h3>
              <ul v-if="orderItems(order).length">
                <li v-for="item in orderItems(order)" :key="item.id || item.food_id">
                  <span>{{ item.food?.name || item.food_name || item.name || `${t('menu.title')} #${item.food_id}` }}</span>
                  <strong>x{{ item.quantity }}</strong>
                </li>
              </ul>
              <p v-else class="muted">{{ t('customer.noDetails') }}</p>
            </div>

            <aside>
              <span>{{ t('customer.total') }}</span>
              <strong>{{ formatPrice(order.total_price || order.total_amount) }}</strong>
              <em v-if="order.payment_requested_at">{{ t('billing.customerPayment') }}</em>
            </aside>
          </div>
        </article>
      </section>

      <section v-else class="state empty">
        <h2>{{ t('customer.noOrders') }}</h2>
      </section>
    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import { useOrderStore } from '@/stores/useOrderStore'
import { currentLanguage, t } from '@/languages'

const orderStore = useOrderStore()
const loading = ref(false)
const error = ref('')
const statusFilter = ref('')
const statuses = ['pending', 'confirmed', 'in_progress', 'ready', 'served', 'paid', 'cancelled']

const orders = computed(() => Array.isArray(orderStore.orders) ? orderStore.orders : [])
const activeOrders = computed(() => orders.value.filter((order) => ['pending', 'confirmed', 'in_progress'].includes(order.status)))
const readyOrders = computed(() => orders.value.filter((order) => ['ready', 'served'].includes(order.status)))
const paymentRequested = computed(() => orders.value.filter((order) => order.payment_requested_at).length)

onMounted(async () => {
  await loadOrders()
})

async function loadOrders() {
  loading.value = true
  error.value = ''
  try {
    const filters = statusFilter.value ? { status: statusFilter.value } : {}
    await orderStore.fetchOrders(filters)
  } catch (err) {
    error.value = err.message || t('customer.loadingOrders')
  } finally {
    loading.value = false
  }
}

function orderItems(order) {
  return order.items || order.orderItems || order.order_items || []
}

function statusLabel(status) {
  return t(`status.${status}`)
}

function formatPrice(price) {
  const locale = currentLanguage.value === 'en' ? 'en-US' : 'vi-VN'
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND' }).format(Number(price || 0))
}

function formatDate(date) {
  const locale = currentLanguage.value === 'en' ? 'en-US' : 'vi-VN'
  return date ? new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(date)) : '-'
}
</script>

<style scoped>
.orders-page { padding: 24px; width: min(1180px, 100%); margin: 0 auto; }
.filter-control { min-height: 38px; border: 1px solid #d0d5dd; border-radius: 7px; padding: 0 12px; color: #344054; background: #fff; }
.summary-row { display: grid; grid-template-columns: repeat(3, minmax(180px, 1fr)); gap: 14px; margin-bottom: 18px; }
.summary-row article, .order-card, .state { background: #fff; border: 1px solid #dfe3ea; border-radius: 8px; box-shadow: 0 3px 10px rgba(16,24,40,.05); }
.summary-row article { padding: 16px; }
.summary-row span, .muted { color: #667085; }
.summary-row strong { display: block; margin-top: 6px; color: #111827; font-size: 28px; }
.orders-list { display: grid; gap: 16px; }
.order-card { padding: 18px; }
.order-card header, .order-body { display: flex; justify-content: space-between; gap: 18px; }
.order-card header { align-items: flex-start; padding-bottom: 14px; border-bottom: 1px solid #eaecf0; }
h2, h3, p { margin: 0; }
h2 { color: #111827; font-size: 22px; }
h3 { color: #111827; font-size: 16px; margin-bottom: 10px; }
.order-card header p { color: #667085; margin-top: 4px; }
.status { border-radius: 999px; padding: 6px 10px; background: #eff8ff; color: #175cd3; font-size: 12px; font-weight: 800; white-space: nowrap; }
.status.ready, .status.served, .status.paid { background: #ecfdf3; color: #027a48; }
.status.cancelled { background: #fef3f2; color: #b42318; }
.order-body { padding-top: 16px; }
ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 8px; }
li { display: flex; justify-content: space-between; gap: 12px; color: #344054; }
aside { min-width: 220px; display: grid; align-content: start; gap: 10px; padding: 14px; border-radius: 8px; background: #f8fafc; }
aside span { color: #667085; }
aside strong { color: #f05a28; font-size: 24px; }
aside em { color: #b42318; font-style: normal; font-weight: 800; }
button, .ghost-action { min-height: 38px; border: 0; border-radius: 7px; padding: 0 14px; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; font-weight: 800; cursor: pointer; }
.ghost-action { background: #f2f4f7; color: #344054; }
.state { padding: 28px; color: #475467; text-align: center; }
.state.error { color: #b42318; background: #fffbfa; border-color: #fecdca; }
@media (max-width: 760px) {
  .orders-page { padding: 16px; }
  .summary-row { grid-template-columns: 1fr; }
  .order-card header, .order-body { flex-direction: column; }
  aside { min-width: 0; }
}
</style>

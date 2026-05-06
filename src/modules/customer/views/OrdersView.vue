<template>
  <MasterLayout show-footer>
    <main class="orders-page">
      <MasterPageHeader title="Đơn của tôi">
        <template #actions>
          <router-link :to="tableId ? `/menu/table/${tableId}` : '/menu'" class="ghost-action">Gọi thêm món</router-link>
          <button @click="loadOrders" class="ghost-action">Làm mới</button>
        </template>
      </MasterPageHeader>

      <section class="summary-row">
        <article>
          <span>Đơn đang xử lý</span>
          <strong>{{ activeOrders.length }}</strong>
        </article>
        <article>
          <span>Sẵn sàng phục vụ</span>
          <strong>{{ readyOrders.length }}</strong>
        </article>
        <article>
          <span>Đã gọi thanh toán</span>
          <strong>{{ paymentRequested }}</strong>
        </article>
      </section>

      <p v-if="loading" class="state">Đang tải đơn hàng...</p>
      <p v-else-if="error" class="state error">{{ error }}</p>
      <section v-else-if="orders.length" class="orders-list">
        <article v-for="order in orders" :key="order.id" class="order-card">
          <header>
            <div>
              <h2>{{ order.order_number || `Đơn #${order.id}` }}</h2>
              <p>Bàn {{ order.table_id }} · {{ formatDate(order.created_at) }}</p>
            </div>
            <span class="status" :class="order.status">{{ statusLabel(order.status) }}</span>
          </header>

          <div class="order-body">
            <div>
              <h3>Món đã gọi</h3>
              <ul v-if="orderItems(order).length">
                <li v-for="item in orderItems(order)" :key="item.id || item.food_id">
                  <span>{{ item.food?.name || item.food_name || item.name || `Món #${item.food_id}` }}</span>
                  <strong>x{{ item.quantity }}</strong>
                </li>
              </ul>
              <p v-else class="muted">Đơn này chưa có chi tiết món.</p>
            </div>

            <aside>
              <span>Tổng tiền</span>
              <strong>{{ formatPrice(order.total_price || order.total_amount) }}</strong>
              <button
                v-if="canRequestPayment(order)"
                class="primary-action"
                @click="requestPayment(order)"
              >
                Gọi nhân viên thanh toán
              </button>
              <p v-else-if="order.payment_requested_at" class="success-note">
                Nhân viên đã nhận yêu cầu thanh toán.
              </p>
            </aside>
          </div>
        </article>
      </section>

      <section v-else class="state empty">
        <h2>Chưa có đơn hàng</h2>
        <router-link :to="tableId ? `/menu/table/${tableId}` : '/menu'" class="primary-link">Xem thực đơn</router-link>
      </section>
    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import { useOrderStore } from '@/stores/useOrderStore'

const orderStore = useOrderStore()
const route = useRoute()
const loading = ref(false)
const error = ref('')
const tableId = computed(() => route.params.tableId || '')

const orders = computed(() => Array.isArray(orderStore.orders) ? orderStore.orders : [])
const activeOrders = computed(() => orders.value.filter((order) => ['pending', 'confirmed', 'in_progress'].includes(order.status)))
const readyOrders = computed(() => orders.value.filter((order) => ['ready', 'served'].includes(order.status)))
const paymentRequested = computed(() => orders.value.filter((order) => order.payment_requested_at).length)

onMounted(loadOrders)

async function loadOrders() {
  loading.value = true
  error.value = ''
  try {
    await orderStore.fetchOrders(tableId.value ? { table_id: tableId.value } : {})
  } catch (err) {
    error.value = err.message || 'Không thể tải đơn hàng.'
  } finally {
    loading.value = false
  }
}

function orderItems(order) {
  return order.items || order.orderItems || order.order_items || []
}

function canRequestPayment(order) {
  return ['confirmed', 'in_progress', 'ready', 'served'].includes(order.status) && !order.payment_requested_at
}

async function requestPayment(order) {
  try {
    await orderStore.requestPayment(order.id)
  } catch (err) {
    error.value = err.message || 'Không thể gửi yêu cầu thanh toán.'
  }
}

function statusLabel(status) {
  return {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã nhận',
    in_progress: 'Đang làm',
    ready: 'Đã xong',
    served: 'Đã phục vụ',
    paid: 'Đã thanh toán',
    cancelled: 'Đã hủy',
  }[status] || status
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price || 0))
}

function formatDate(date) {
  return date ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(date)) : '-'
}
</script>

<style scoped>
.orders-page { padding: 24px; width: min(1180px, 100%); margin: 0 auto; }
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
button, .ghost-action, .primary-link { min-height: 38px; border: 0; border-radius: 7px; padding: 0 14px; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; font-weight: 800; cursor: pointer; }
.ghost-action { background: #f2f4f7; color: #344054; }
.primary-action, .primary-link { background: #155eef; color: #fff; }
.success-note { color: #027a48; font-weight: 800; }
.state { padding: 28px; color: #475467; text-align: center; }
.state.error { color: #b42318; background: #fffbfa; border-color: #fecdca; }
.state.empty { display: grid; gap: 14px; justify-items: center; }
@media (max-width: 760px) {
  .orders-page { padding: 16px; }
  .summary-row { grid-template-columns: 1fr; }
  .order-card header, .order-body { flex-direction: column; }
  aside { min-width: 0; }
}
</style>

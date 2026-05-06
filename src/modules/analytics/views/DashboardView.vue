<template>
  <MasterLayout show-footer>
    <main class="dashboard-view">
      <MasterPageHeader title="Tổng quan" />

      <section class="metric-grid">
        <article v-for="metric in metrics" :key="metric.label" class="metric-card" :class="metric.tone">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small>{{ metric.hint }}</small>
        </article>
      </section>

      <section class="chart-grid">
        <article class="panel chart-panel">
          <header><h2>Doanh thu theo ngày</h2></header>
          <div class="bar-chart">
            <div v-for="point in revenueChart" :key="point.label" class="bar-item">
              <div class="bar-track">
                <span :style="{ height: `${point.height}%` }"></span>
              </div>
              <small>{{ point.label }}</small>
            </div>
          </div>
        </article>

        <article class="panel chart-panel">
          <header><h2>Tình trạng đơn</h2></header>
          <div class="status-chart">
            <div v-for="slice in orderStatusChart" :key="slice.label">
              <span>{{ slice.label }}</span>
              <strong>{{ slice.value }}</strong>
              <div><em :style="{ width: `${slice.width}%` }"></em></div>
            </div>
          </div>
        </article>
      </section>

      <section class="work-grid">
        <article class="panel wide">
          <header>
            <h2>Bàn đang phục vụ</h2>
            <button @click="loadDashboard">Làm mới</button>
          </header>
          <div class="table-strip">
            <div v-for="table in activeTables" :key="table.id" class="table-pill" :class="{ alert: table.payment_requested_at }">
              <strong>Bàn {{ table.table_number }}</strong>
              <span>{{ table.current_customer_count || table.capacity }} khách</span>
              <small>{{ table.occupied_since ? `Vào ${formatTime(table.occupied_since)}` : 'Chưa có giờ vào' }}</small>
              <em v-if="table.payment_requested_at">Khách gọi thanh toán</em>
            </div>
            <p v-if="activeTables.length === 0" class="empty">Chưa có bàn đang phục vụ.</p>
          </div>
        </article>

        <article class="panel">
          <header><h2>Việc cần xử lý</h2></header>
          <ul class="task-list">
            <li><span class="dot danger"></span><strong>{{ paymentRequests }}</strong> bàn gọi thanh toán</li>
            <li><span class="dot success"></span><strong>{{ readyOrders }}</strong> đơn/món đã xong</li>
            <li><span class="dot warning"></span><strong>{{ lowStockCount }}</strong> nguyên liệu sắp hết</li>
            <li><span class="dot info"></span><strong>{{ pendingOrders }}</strong> đơn chờ bếp</li>
          </ul>
        </article>
      </section>

      <section class="work-grid lower">
        <article class="panel">
          <header><h2>Đơn mới gần đây</h2></header>
          <div class="compact-list">
            <div v-for="order in recentOrders" :key="order.id">
              <span>{{ order.order_number || `#${order.id}` }}</span>
              <strong>{{ formatCurrency(order.total_price || order.total_amount) }}</strong>
              <small>Bàn {{ order.table_id }} · {{ order.status }}</small>
            </div>
            <p v-if="recentOrders.length === 0" class="empty">Chưa có đơn hàng.</p>
          </div>
        </article>

        <article class="panel">
          <header><h2>Tồn kho cần chú ý</h2></header>
          <div class="compact-list">
            <div v-for="item in lowStockItems" :key="item.id">
              <span>{{ item.name }}</span>
              <strong>{{ number(item.current_quantity ?? item.quantity) }} {{ item.unit }}</strong>
              <small>Tối thiểu {{ number(item.min_quantity ?? item.min_stock_level) }}</small>
            </div>
            <p v-if="lowStockItems.length === 0" class="empty">Tồn kho ổn định.</p>
          </div>
        </article>

        <article class="panel">
          <header><h2>Thanh toán</h2></header>
          <div class="compact-list">
            <div v-for="payment in recentPayments" :key="payment.id">
              <span>{{ payment.payment_method || 'payment' }}</span>
              <strong>{{ formatCurrency(payment.amount) }}</strong>
              <small>{{ payment.status }} · {{ formatTime(payment.paid_at || payment.created_at) }}</small>
            </div>
            <p v-if="recentPayments.length === 0" class="empty">Chưa có thanh toán.</p>
          </div>
        </article>
      </section>
    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import { analyticsService, inventoryService, orderService, paymentService, tableService } from '@/services'

const dashboardData = ref({})
const tables = ref([])
const orders = ref([])
const inventory = ref([])
const payments = ref([])

const activeTables = computed(() =>
  tables.value.filter((table) => ['occupied', 'reserved'].includes(table.status) || table.payment_requested_at).slice(0, 8)
)
const recentOrders = computed(() => orders.value.slice(0, 5))
const recentPayments = computed(() => payments.value.slice(0, 5))
const lowStockItems = computed(() => inventory.value.filter(isLowStock).slice(0, 5))
const lowStockCount = computed(() => inventory.value.filter(isLowStock).length)
const pendingOrders = computed(() => orders.value.filter((order) => ['pending', 'confirmed', 'in_progress'].includes(order.status)).length)
const readyOrders = computed(() => orders.value.filter((order) => ['ready', 'served'].includes(order.status)).length)
const paymentRequests = computed(() => activeTables.value.filter((table) => table.payment_requested_at).length)
const revenueChart = computed(() => {
  const byDay = orders.value.reduce((acc, order) => {
    const date = new Date(order.created_at || Date.now())
    const label = `${date.getDate()}/${date.getMonth() + 1}`
    acc[label] = (acc[label] || 0) + Number(order.total_price || order.total_amount || 0)
    return acc
  }, {})
  const points = Object.entries(byDay).slice(-7)
  const fallback = points.length ? points : [['Hôm nay', Number(dashboardData.value.total_revenue || 0)]]
  const max = Math.max(...fallback.map(([, value]) => value), 1)
  return fallback.map(([label, value]) => ({ label, height: Math.max(8, Math.round((value / max) * 100)) }))
})
const orderStatusChart = computed(() => {
  const rows = [
    ['Chờ bếp', pendingOrders.value],
    ['Đã xong', readyOrders.value],
    ['Đã thanh toán', orders.value.filter((order) => order.status === 'paid').length],
    ['Đã hủy', orders.value.filter((order) => order.status === 'cancelled').length],
  ]
  const max = Math.max(...rows.map(([, value]) => value), 1)
  return rows.map(([label, value]) => ({ label, value, width: Math.max(6, Math.round((value / max) * 100)) }))
})

const metrics = computed(() => [
  { label: 'Doanh thu hôm nay', value: formatCurrency(dashboardData.value.total_revenue), hint: 'Tổng tiền đã ghi nhận', tone: 'revenue' },
  { label: 'Đơn hàng', value: dashboardData.value.total_orders || orders.value.length, hint: `${pendingOrders.value} đang xử lý`, tone: 'orders' },
  { label: 'Bàn đang phục vụ', value: activeTables.value.length, hint: `${paymentRequests.value} bàn gọi thanh toán`, tone: 'tables' },
  { label: 'Tồn kho thấp', value: lowStockCount.value, hint: 'Cần bổ sung nguyên liệu', tone: 'stock' },
  { label: 'Giá trị TB/đơn', value: formatCurrency(dashboardData.value.avg_order_value), hint: 'Theo dữ liệu dashboard', tone: 'average' },
])

onMounted(loadDashboard)

async function loadDashboard() {
  const results = await Promise.allSettled([
    analyticsService.getDashboardData({ period: 'today' }),
    tableService.getAllTables(),
    orderService.getOrders(),
    inventoryService.getInventory(),
    paymentService.getPayments(),
  ])

  dashboardData.value = results[0].value || {}
  tables.value = normalizeList(results[1].value)
  orders.value = normalizeList(results[2].value)
  inventory.value = normalizeList(results[3].value)
  payments.value = normalizeList(results[4].value)
}

function normalizeList(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  return []
}

function isLowStock(item) {
  return Number(item.current_quantity ?? item.quantity ?? 0) <= Number(item.min_quantity ?? item.min_stock_level ?? 0)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0))
}

function formatTime(value) {
  return value ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '-'
}

function number(value) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(Number(value || 0))
}
</script>

<style scoped>
.dashboard-view { padding: 24px; width: min(1440px, 100%); margin: 0 auto; }
.metric-grid { display: grid; grid-template-columns: repeat(5, minmax(170px, 1fr)); gap: 16px; margin-bottom: 18px; }
.metric-card, .panel { background: #fff; border: 1px solid #dfe3ea; border-radius: 8px; box-shadow: 0 3px 10px rgba(16,24,40,.05); }
.metric-card { padding: 18px; min-height: 118px; }
.metric-card span, .compact-list small, .table-pill small { color: #667085; }
.metric-card strong { display: block; margin: 8px 0 5px; font-size: 30px; color: #111827; line-height: 1; }
.metric-card small { color: #475467; }
.metric-card.revenue strong, .metric-card.average strong { color: #f05a28; }
.metric-card.stock strong, .table-pill.alert em { color: #b42318; }
.chart-grid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(320px, .8fr); gap: 18px; margin-bottom: 18px; }
.work-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(320px, .75fr); gap: 18px; margin-bottom: 18px; }
.work-grid.lower { grid-template-columns: repeat(3, minmax(260px, 1fr)); }
.panel { padding: 18px; min-width: 0; }
.panel header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
h2 { margin: 0; font-size: 18px; color: #111827; }
button { min-height: 36px; border: 0; border-radius: 7px; padding: 0 12px; color: #344054; background: #f2f4f7; cursor: pointer; }
.bar-chart { display: grid; grid-template-columns: repeat(7, minmax(38px, 1fr)); align-items: end; gap: 12px; min-height: 210px; padding-top: 10px; }
.bar-item { display: grid; gap: 8px; justify-items: center; color: #667085; }
.bar-track { display: flex; align-items: end; width: 100%; height: 170px; border-radius: 8px; background: #f2f4f7; overflow: hidden; }
.bar-track span { display: block; width: 100%; min-height: 8px; border-radius: 8px 8px 0 0; background: linear-gradient(180deg, #2f80ed 0%, #155eef 100%); }
.status-chart { display: grid; gap: 14px; }
.status-chart div div { height: 10px; border-radius: 999px; background: #f2f4f7; overflow: hidden; }
.status-chart em { display: block; height: 100%; border-radius: inherit; background: #f05a28; }
.status-chart span { color: #475467; }
.status-chart strong { float: right; color: #111827; }
.table-strip { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
.table-pill { display: grid; gap: 4px; padding: 14px; border-radius: 8px; background: #f8fafc; border: 1px solid #e5e7eb; }
.table-pill.alert { background: #fffbfa; border-color: #fecdca; }
.table-pill em { font-style: normal; font-size: 12px; font-weight: 800; }
.task-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
.task-list li { display: flex; align-items: center; gap: 10px; color: #344054; }
.task-list strong { min-width: 28px; color: #111827; font-size: 20px; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: #155eef; }
.dot.danger { background: #d92d20; }
.dot.warning { background: #f79009; }
.dot.success { background: #12b76a; }
.compact-list { display: grid; gap: 10px; }
.compact-list div { display: grid; grid-template-columns: 1fr auto; gap: 3px 12px; padding-bottom: 10px; border-bottom: 1px solid #eaecf0; }
.compact-list small { grid-column: 1 / -1; }
.compact-list strong { color: #111827; }
.empty { margin: 0; color: #667085; }
@media (max-width: 1100px) {
  .metric-grid { grid-template-columns: repeat(2, minmax(170px, 1fr)); }
  .work-grid, .work-grid.lower, .chart-grid { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .dashboard-view { padding: 16px; }
  .metric-grid { grid-template-columns: 1fr; }
}
</style>

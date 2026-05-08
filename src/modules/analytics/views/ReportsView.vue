<template>
  <MasterLayout show-footer>
    <main class="ops-page">
      <MasterPageHeader :title="t('analytics.reports')">
        <template #actions>
          <button class="primary-action" :disabled="loading" @click="generateReport">
            {{ loading ? t('analytics.generatingReport') : t('analytics.createReport') }}
          </button>
        </template>
      </MasterPageHeader>

      <form class="toolbar" @submit.prevent="generateReport">
        <select v-model="form.report_type" @change="loadSnapshots">
          <option value="sales">{{ t('analytics.salesReport') }}</option>
          <option value="orders">{{ t('analytics.ordersReport') }}</option>
          <option value="inventory">{{ t('analytics.inventoryReport') }}</option>
        </select>
        <input v-model="form.start_date" type="date" required @change="loadSnapshots" />
        <input v-model="form.end_date" type="date" required @change="loadSnapshots" />
        <button class="ghost-action" type="button" @click="loadSnapshots">{{ t('customer.refresh') }}</button>
      </form>

      <section class="summary-strip">
        <div class="metric primary">
          <span>{{ summaryMetrics[0].label }}</span>
          <strong>{{ summaryMetrics[0].value }}</strong>
        </div>
        <div class="metric">
          <span>{{ summaryMetrics[1].label }}</span>
          <strong>{{ summaryMetrics[1].value }}</strong>
        </div>
        <div class="metric">
          <span>{{ summaryMetrics[2].label }}</span>
          <strong>{{ summaryMetrics[2].value }}</strong>
        </div>
        <div class="metric">
          <span>{{ summaryMetrics[3].label }}</span>
          <strong>{{ summaryMetrics[3].value }}</strong>
        </div>
      </section>

      <p v-if="loading" class="state">{{ t('analytics.loadingReportData') }}</p>

      <section class="report-grid">
        <div v-if="form.report_type !== 'inventory'" class="report-panel">
          <div class="panel-head">
            <h2>{{ t('analytics.topDishes') }}</h2>
            <span>{{ topDishes.length }} {{ t('analytics.dish') }}</span>
          </div>
          <div v-if="topDishes.length" class="rank-list">
            <article v-for="dish in topDishes" :key="dish.food_id || dish.id || dish.name" class="rank-item">
              <div>
                <strong>{{ dish.name || dish.food_name || dish.food?.name || t('analytics.dish') }}</strong>
                <small>{{ dishQuantity(dish) }} {{ t('analytics.orders') }}</small>
              </div>
              <span class="rank-bar"><i :style="{ width: dishPercent(dish) + '%' }"></i></span>
            </article>
          </div>
          <p v-else class="muted">{{ t('analytics.noDishData') }}</p>
        </div>

        <div v-else class="report-panel">
          <div class="panel-head">
            <h2>{{ t('analytics.inventoryReport') }}</h2>
            <span>{{ inventoryItems.length }} {{ t('analytics.items') }}</span>
          </div>
          <div v-if="inventoryItems.length" class="rank-list">
            <article v-for="item in inventoryItems.slice(0, 10)" :key="item.id" class="rank-item">
              <div>
                <strong>{{ item.name }}</strong>
                <small>
                  {{ formatQuantity(item.current_quantity) }} {{ item.unit }}
                  / {{ t('analytics.minimumStockShort') }} {{ formatQuantity(item.min_quantity) }}
                </small>
              </div>
              <span class="rank-bar" :class="{ danger: item.is_low_stock }">
                <i :style="{ width: stockPercent(item) + '%' }"></i>
              </span>
            </article>
          </div>
          <p v-else class="muted">{{ t('analytics.noInventoryData') }}</p>
        </div>

        <div v-if="form.report_type !== 'inventory'" class="report-panel">
          <div class="panel-head">
            <h2>{{ t('analytics.orderAnalytics') }}</h2>
            <span>{{ orders.length }} {{ t('analytics.orderDays') }}</span>
          </div>
          <div v-if="orders.length" class="data-table">
            <table>
              <thead>
                <tr>
                  <th>{{ t('analytics.date') }}</th>
                  <th>{{ t('analytics.orders') }}</th>
                  <th>{{ t('analytics.revenue') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in paginatedOrders" :key="row.date">
                  <td>{{ formatDate(row.date) }}</td>
                  <td>{{ row.total_orders || 0 }}</td>
                  <td><strong>{{ formatCurrency(row.total_revenue) }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <nav v-if="orders.length" class="pagination">
            <span>Tổng {{ orders.length }},</span>
            <span>Hiển thị</span>
            <select v-model.number="orderPageSize">
              <option :value="7">7</option>
              <option :value="14">14</option>
              <option :value="30">30</option>
            </select>
            <button class="page-button" :disabled="orderPage === 1" @click="orderPage--">‹</button>
            <strong>{{ orderPage }}</strong>
            <button class="page-button" :disabled="orderPage === orderTotalPages" @click="orderPage++">›</button>
          </nav>
          <p v-if="orders.length === 0" class="muted">{{ t('analytics.noOrderAnalytics') }}</p>
        </div>

        <div v-else class="report-panel">
          <div class="panel-head">
            <h2>{{ t('analytics.inventoryMovement') }}</h2>
            <span>{{ inventoryMovements.length }} {{ t('analytics.orderDays') }}</span>
          </div>
          <div v-if="inventoryMovements.length" class="data-table">
            <table>
              <thead>
                <tr>
                  <th>{{ t('analytics.date') }}</th>
                  <th>{{ t('analytics.movements') }}</th>
                  <th>{{ t('analytics.stockIn') }}</th>
                  <th>{{ t('analytics.stockOut') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in paginatedInventoryMovements" :key="row.date">
                  <td>{{ formatDate(row.date) }}</td>
                  <td>{{ row.movements || 0 }}</td>
                  <td><strong>{{ formatQuantity(row.stock_in) }}</strong></td>
                  <td><strong>{{ formatQuantity(row.stock_out) }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <nav v-if="inventoryMovements.length" class="pagination">
            <span>Tổng {{ inventoryMovements.length }},</span>
            <span>Hiển thị</span>
            <select v-model.number="movementPageSize">
              <option :value="7">7</option>
              <option :value="14">14</option>
              <option :value="30">30</option>
            </select>
            <button class="page-button" :disabled="movementPage === 1" @click="movementPage--">‹</button>
            <strong>{{ movementPage }}</strong>
            <button class="page-button" :disabled="movementPage === movementTotalPages" @click="movementPage++">›</button>
          </nav>
          <p v-else class="muted">{{ t('analytics.noInventoryMovement') }}</p>
        </div>
      </section>

    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import { showNotification } from '@/composables/usePopup'
import { isAbortError } from '@/api/requestManager'
import { analyticsService } from '@/services'
import { currentLanguage, t } from '@/languages'

const today = new Date().toISOString().slice(0, 10)
const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)

const form = reactive({ report_type: 'sales', start_date: monthStart, end_date: today })
const revenue = ref([])
const topDishes = ref([])
const orders = ref([])
const inventory = ref(null)
const report = ref(null)
const loading = ref(false)
const error = ref('')
const orderPage = ref(1)
const orderPageSize = ref(7)
const movementPage = ref(1)
const movementPageSize = ref(7)

const totalRevenue = computed(() =>
  orders.value.reduce((sum, row) => sum + Number(row.total_revenue || row.revenue || 0), 0)
)
const totalOrders = computed(() =>
  orders.value.reduce((sum, row) => sum + Number(row.total_orders || row.orders || 0), 0)
)
const averageOrderValue = computed(() => totalOrders.value ? totalRevenue.value / totalOrders.value : 0)
const maxDishQuantity = computed(() => Math.max(1, ...topDishes.value.map(dishQuantity)))
const inventorySummary = computed(() => inventory.value?.summary || {})
const inventoryItems = computed(() => inventory.value?.items || [])
const inventoryMovements = computed(() => inventory.value?.movements_by_day || [])
const orderTotalPages = computed(() => Math.max(1, Math.ceil(orders.value.length / orderPageSize.value)))
const paginatedOrders = computed(() => {
  const start = (orderPage.value - 1) * orderPageSize.value
  return orders.value.slice(start, start + orderPageSize.value)
})
const movementTotalPages = computed(() => Math.max(1, Math.ceil(inventoryMovements.value.length / movementPageSize.value)))
const paginatedInventoryMovements = computed(() => {
  const start = (movementPage.value - 1) * movementPageSize.value
  return inventoryMovements.value.slice(start, start + movementPageSize.value)
})
const summaryMetrics = computed(() => {
  if (form.report_type === 'inventory') {
    return [
      { label: t('analytics.stockValue'), value: formatCurrency(inventorySummary.value.total_stock_value) },
      { label: t('analytics.items'), value: formatNumber(inventorySummary.value.total_items) },
      { label: t('analytics.lowStock'), value: formatNumber(inventorySummary.value.low_stock_items) },
      { label: t('analytics.movements'), value: formatNumber(inventorySummary.value.movements) },
    ]
  }

  if (form.report_type === 'orders') {
    return [
      { label: t('analytics.orders'), value: formatNumber(totalOrders.value) },
      { label: t('analytics.revenue'), value: formatCurrency(totalRevenue.value) },
      { label: t('analytics.orderDays'), value: formatNumber(orders.value.length) },
      { label: t('analytics.averageOrderValue'), value: formatCurrency(averageOrderValue.value) },
    ]
  }

  return [
    { label: t('analytics.revenue'), value: formatCurrency(totalRevenue.value) },
    { label: t('analytics.orders'), value: formatNumber(totalOrders.value) },
    { label: t('analytics.topDishes'), value: formatNumber(topDishes.value.length) },
    { label: t('analytics.averageOrderValue'), value: formatCurrency(averageOrderValue.value) },
  ]
})

onMounted(loadSnapshots)

watch(() => [form.report_type, form.start_date, form.end_date], () => {
  orderPage.value = 1
  movementPage.value = 1
})
watch(orderPageSize, () => {
  orderPage.value = 1
})
watch(movementPageSize, () => {
  movementPage.value = 1
})
watch(orderTotalPages, (pages) => {
  if (orderPage.value > pages) orderPage.value = pages
})
watch(movementTotalPages, (pages) => {
  if (movementPage.value > pages) movementPage.value = pages
})

async function loadSnapshots() {
  loading.value = true
  error.value = ''
  try {
    const filters = { start_date: form.start_date, end_date: form.end_date }
    const [revenueData, dishData, orderData] = await Promise.all([
      analyticsService.getRevenueData(filters),
      analyticsService.getTopDishes({ ...filters, limit: 8 }),
      analyticsService.getOrderAnalytics(filters),
    ])
    revenue.value = Array.isArray(revenueData) ? revenueData : revenueData?.data || []
    topDishes.value = Array.isArray(dishData) ? dishData : dishData?.data || []
    orders.value = Array.isArray(orderData) ? orderData : orderData?.data || []

    if (form.report_type === 'inventory') {
      inventory.value = await analyticsService.getInventoryAnalytics(filters)
    } else {
      inventory.value = null
    }
  } catch (err) {
    if (isAbortError(err)) return
    showPopup('danger', t('common.error'), err.message || t('analytics.failedLoadAnalytics'))
  } finally {
    loading.value = false
  }
}

async function generateReport() {
  loading.value = true
  error.value = ''
  try {
    report.value = await analyticsService.generateSalesReport({ ...form })
    await loadSnapshots()
    showPopup('success', t('analytics.generatedReport'), t('analytics.generatedReportBody'))
  } catch (err) {
    if (isAbortError(err)) return
    showPopup('danger', t('common.error'), err.message || t('analytics.failedGenerateReport'))
  } finally {
    loading.value = false
  }
}

function showPopup(type, title, message = '') {
  showNotification({ type, title, message })
}

function dishQuantity(dish) {
  return Number(dish.total_quantity || dish.quantity_sold || dish.quantity || dish.orders_count || 0)
}

function dishPercent(dish) {
  return Math.max(6, Math.round((dishQuantity(dish) / maxDishQuantity.value) * 100))
}

function locale() {
  return currentLanguage.value === 'en' ? 'en-US' : 'vi-VN'
}

function formatCurrency(value) {
  return new Intl.NumberFormat(locale(), { style: 'currency', currency: 'VND' }).format(Number(value || 0))
}

function formatNumber(value) {
  return new Intl.NumberFormat(locale()).format(Number(value || 0))
}

function formatQuantity(value) {
  return new Intl.NumberFormat(locale(), { maximumFractionDigits: 2 }).format(Number(value || 0))
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat(locale()).format(new Date(value)) : '-'
}

function stockPercent(item) {
  const max = Math.max(Number(item.max_quantity || 0), Number(item.current_quantity || 0), 1)
  return Math.max(6, Math.min(100, Math.round((Number(item.current_quantity || 0) / max) * 100)))
}

</script>

<style scoped>
.ops-page { padding: 24px; width: min(1320px, 100%); margin: 0 auto; }
.toolbar, .summary-strip { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
h2 { margin: 0; font-size: 18px; color: #111827; }
.toolbar, .report-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; margin-bottom: 14px; }
input, select { min-height: 38px; border: 1px solid #d0d5dd; border-radius: 6px; padding: 0 10px; background: #fff; }
button { border: 0; border-radius: 6px; min-height: 38px; padding: 0 14px; cursor: pointer; }
button:disabled { opacity: .55; cursor: not-allowed; }
.primary-action { background: #155eef; color: #fff; }
.ghost-action { background: #f2f4f7; color: #344054; }
.summary-strip { margin-bottom: 14px; }
.metric { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; min-width: 180px; }
.metric span { display: block; color: #667085; font-size: 13px; }
.metric strong { font-size: 22px; color: #111827; }
.metric.primary strong { color: #155eef; }
.state { padding: 18px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; color: #475467; }
.report-grid { display: grid; grid-template-columns: minmax(300px, .85fr) minmax(420px, 1.15fr); gap: 14px; }
.panel-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.panel-head span { color: #667085; font-size: 13px; }
.rank-list { display: grid; gap: 12px; }
.rank-item { display: grid; gap: 8px; }
.rank-item strong, .rank-item small { display: block; }
.rank-item small, .muted { color: #667085; }
.rank-bar { height: 8px; border-radius: 999px; overflow: hidden; background: #eef2f6; }
.rank-bar i { display: block; height: 100%; border-radius: inherit; background: #155eef; }
.rank-bar.danger i { background: #d92d20; }
.data-table { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px; border-bottom: 1px solid #eaecf0; text-align: left; }
th { color: #667085; font-size: 12px; text-transform: uppercase; background: #f9fafb; }
.pagination { display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-top: 12px; color: #344054; }
.pagination select { width: 74px; min-height: 34px; }
.pagination strong { display: grid; place-items: center; min-width: 34px; height: 34px; border-radius: 6px; background: #f2f4f7; color: #111827; }
.page-button { min-width: 34px; min-height: 34px; padding: 0; background: transparent; color: #98a2b3; font-size: 24px; }
.page-button:not(:disabled) { color: #344054; }
@media (max-width: 860px) { .report-grid { grid-template-columns: 1fr; } .ops-page { padding: 16px; } }
</style>

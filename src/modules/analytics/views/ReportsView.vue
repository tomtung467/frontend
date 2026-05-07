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
        <select v-model="form.report_type">
          <option value="sales">{{ t('analytics.salesReport') }}</option>
          <option value="orders">{{ t('analytics.ordersReport') }}</option>
          <option value="inventory">{{ t('analytics.inventoryReport') }}</option>
        </select>
        <input v-model="form.start_date" type="date" required />
        <input v-model="form.end_date" type="date" required />
        <button class="ghost-action" type="button" @click="loadSnapshots">{{ t('customer.refresh') }}</button>
      </form>

      <section class="summary-strip">
        <div class="metric primary">
          <span>{{ t('analytics.revenue') }}</span>
          <strong>{{ formatCurrency(totalRevenue) }}</strong>
        </div>
        <div class="metric">
          <span>{{ t('analytics.orders') }}</span>
          <strong>{{ totalOrders }}</strong>
        </div>
        <div class="metric">
          <span>{{ t('analytics.topDishes') }}</span>
          <strong>{{ topDishes.length }}</strong>
        </div>
        <div class="metric">
          <span>{{ t('analytics.averageOrderValue') }}</span>
          <strong>{{ formatCurrency(averageOrderValue) }}</strong>
        </div>
      </section>

      <p v-if="loading" class="state">{{ t('analytics.loadingReportData') }}</p>

      <section class="report-grid">
        <div class="report-panel">
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

        <div class="report-panel">
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
                <tr v-for="row in orders" :key="row.date">
                  <td>{{ formatDate(row.date) }}</td>
                  <td>{{ row.total_orders || 0 }}</td>
                  <td><strong>{{ formatCurrency(row.total_revenue) }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="muted">{{ t('analytics.noOrderAnalytics') }}</p>
        </div>
      </section>

    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
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
const report = ref(null)
const loading = ref(false)
const error = ref('')

const totalRevenue = computed(() =>
  orders.value.reduce((sum, row) => sum + Number(row.total_revenue || row.revenue || 0), 0)
)
const totalOrders = computed(() =>
  orders.value.reduce((sum, row) => sum + Number(row.total_orders || row.orders || 0), 0)
)
const averageOrderValue = computed(() => totalOrders.value ? totalRevenue.value / totalOrders.value : 0)
const maxDishQuantity = computed(() => Math.max(1, ...topDishes.value.map(dishQuantity)))

onMounted(loadSnapshots)

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
  return Number(dish.total_quantity || dish.quantity || dish.orders_count || 0)
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

function formatDate(value) {
  return value ? new Intl.DateTimeFormat(locale()).format(new Date(value)) : '-'
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
.data-table { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px; border-bottom: 1px solid #eaecf0; text-align: left; }
th { color: #667085; font-size: 12px; text-transform: uppercase; background: #f9fafb; }
@media (max-width: 860px) { .report-grid { grid-template-columns: 1fr; } .ops-page { padding: 16px; } }
</style>

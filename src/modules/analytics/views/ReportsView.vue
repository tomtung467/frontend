<template>
  <MasterLayout show-footer>
    <main class="ops-page">
      <MasterPageHeader :title="t('analytics.reports')">
        <template #actions>
          <button class="primary-action" @click="generateReport" :disabled="loading">
            {{ loading ? 'Đang tạo...' : 'Tạo báo cáo' }}
          </button>
        </template>
      </MasterPageHeader>

      <form class="toolbar" @submit.prevent="generateReport">
        <select v-model="form.report_type">
          <option value="sales">Sales</option>
          <option value="orders">Orders</option>
          <option value="inventory">Inventory</option>
        </select>
        <input v-model="form.start_date" type="date" required />
        <input v-model="form.end_date" type="date" required />
      </form>

      <section class="summary-strip">
        <div class="metric">
          <span>Revenue points</span>
          <strong>{{ revenue.length }}</strong>
        </div>
        <div class="metric">
          <span>Top dishes</span>
          <strong>{{ topDishes.length }}</strong>
        </div>
        <div class="metric">
          <span>Order days</span>
          <strong>{{ orders.length }}</strong>
        </div>
      </section>

      <p v-if="error" class="state error">{{ error }}</p>
      <p v-if="loading" class="state">Loading report data...</p>

      <section v-if="report" class="report-panel">
        <h2>Generated report</h2>
        <pre>{{ JSON.stringify(report, null, 2) }}</pre>
      </section>

      <section class="report-grid">
        <div class="report-panel">
          <h2>Top dishes</h2>
          <ol v-if="topDishes.length">
            <li v-for="dish in topDishes" :key="dish.food_id || dish.id || dish.name">
              <span>{{ dish.name || dish.food_name || dish.food?.name || 'Dish' }}</span>
              <strong>{{ dish.total_quantity || dish.quantity || dish.orders_count || 0 }}</strong>
            </li>
          </ol>
          <p v-else class="muted">No dish data yet.</p>
        </div>

        <div class="report-panel">
          <h2>Order analytics</h2>
          <div v-if="orders.length" class="data-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in orders" :key="row.date">
                  <td>{{ row.date }}</td>
                  <td>{{ row.total_orders }}</td>
                  <td>{{ formatCurrency(row.total_revenue) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="muted">No order analytics yet.</p>
        </div>
      </section>
    </main>
  </MasterLayout>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import { analyticsService } from '@/services'
import { t } from '@/languages'

const today = new Date().toISOString().slice(0, 10)
const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)

const form = reactive({ report_type: 'sales', start_date: monthStart, end_date: today })
const revenue = ref([])
const topDishes = ref([])
const orders = ref([])
const report = ref(null)
const loading = ref(false)
const error = ref('')

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
    error.value = err.message || 'Failed to load analytics.'
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
  } catch (err) {
    error.value = err.message || 'Failed to generate report.'
  } finally {
    loading.value = false
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0))
}
</script>

<style scoped>
.ops-page { padding: 24px; width: min(1320px, 100%); margin: 0 auto; }
.toolbar, .summary-strip { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
h2 { margin: 0 0 12px; font-size: 18px; color: #111827; }
.toolbar, .report-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; margin-bottom: 14px; }
input, select { min-height: 38px; border: 1px solid #d0d5dd; border-radius: 6px; padding: 0 10px; background: #fff; }
button { border: 0; border-radius: 6px; min-height: 38px; padding: 0 14px; cursor: pointer; }
button:disabled { opacity: .55; cursor: not-allowed; }
.primary-action { background: #155eef; color: #fff; }
.summary-strip { margin-bottom: 14px; }
.metric { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; min-width: 170px; }
.metric span { display: block; color: #667085; font-size: 13px; }
.metric strong { font-size: 22px; color: #111827; }
.state { padding: 18px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; color: #475467; }
.state.error { color: #b42318; border-color: #fecdca; background: #fffbfa; }
.report-grid { display: grid; grid-template-columns: minmax(280px, .8fr) minmax(360px, 1.2fr); gap: 14px; }
ol { margin: 0; padding-left: 20px; }
li { padding: 8px 0; border-bottom: 1px solid #eaecf0; }
li span { display: inline-block; min-width: 160px; }
.muted { color: #667085; margin: 0; }
pre { margin: 0; white-space: pre-wrap; color: #344054; font-size: 12px; }
.data-table { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 11px 12px; border-bottom: 1px solid #eaecf0; text-align: left; }
th { color: #667085; font-size: 12px; text-transform: uppercase; background: #f9fafb; }
@media (max-width: 860px) { .report-grid { grid-template-columns: 1fr; } .ops-page { padding: 16px; } }
</style>

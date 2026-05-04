<template>
  <MasterLayout show-footer>
    <div class="dashboard-view">
      <h1>Dashboard</h1>
      <div v-if="dashboardData" class="dashboard-cards">
        <div class="card">
          <h3>Total Revenue</h3>
          <p class="value">{{ formatPrice(dashboardData.total_revenue) }}</p>
        </div>
        <div class="card">
          <h3>Total Orders</h3>
          <p class="value">{{ dashboardData.total_orders }}</p>
        </div>
        <div class="card">
          <h3>Avg Order Value</h3>
          <p class="value">{{ formatPrice(dashboardData.avg_order_value) }}</p>
        </div>
      </div>
    </div>
  </MasterLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAnalyticsStore } from '@/stores/useAnalyticsStore'
import MasterLayout from '@/components/MasterLayout.vue'

const analyticsStore = useAnalyticsStore()
const dashboardData = ref(null)

onMounted(async () => {
  try {
    await analyticsStore.fetchDashboardData('today')
    dashboardData.value = analyticsStore.dashboardData
  } catch (err) {
    console.error('Failed to fetch dashboard data:', err)
  }
})

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}
</script>

<style scoped>
.dashboard-view {
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.card h3 {
  margin-top: 0;
  color: #666;
  font-size: 14px;
  text-transform: uppercase;
}

.card .value {
  font-size: 32px;
  font-weight: bold;
  color: #ff6b35;
  margin: 10px 0;
}
</style>

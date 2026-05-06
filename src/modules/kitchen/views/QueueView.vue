<template>
  <MasterLayout show-footer>
    <main class="queue-page">
      <MasterPageHeader title="Hàng đợi bếp">
        <template #actions>
          <router-link to="/kitchen" class="primary-action">Bảng bếp</router-link>
        </template>
      </MasterPageHeader>

      <p v-if="kitchenStore.error" class="state error">{{ kitchenStore.error }}</p>
      <p v-else-if="kitchenStore.loading" class="state">Loading queue...</p>

      <div v-else class="data-table">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Table</th>
              <th>Items</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="kitchenStore.queue.length === 0">
              <td colspan="5" class="empty">No active kitchen tickets.</td>
            </tr>
            <tr v-for="order in kitchenStore.queue" :key="order.id">
              <td>{{ order.order_number || `#${order.id}` }}</td>
              <td>{{ order.table_id }}</td>
              <td>{{ orderItems(order).length }}</td>
              <td><span class="badge">{{ order.status }}</span></td>
              <td>{{ formatDate(order.updated_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </MasterLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import { useKitchenStore } from '@/stores/useKitchenStore'

const kitchenStore = useKitchenStore()

onMounted(() => kitchenStore.fetchQueue())

function orderItems(order) {
  return order.order_items || order.orderItems || order.items || []
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '-'
}
</script>

<style scoped>
.queue-page { padding: 24px; width: min(1200px, 100%); margin: 0 auto; }
.primary-action { display: inline-flex; align-items: center; min-height: 38px; padding: 0 14px; border-radius: 7px; background: #155eef; color: #fff; text-decoration: none; font-weight: 700; }
.state { padding: 18px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; color: #475467; }
.state.error { color: #b42318; border-color: #fecdca; background: #fffbfa; }
.data-table { overflow-x: auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 13px 14px; border-bottom: 1px solid #eaecf0; text-align: left; }
th { color: #667085; font-size: 12px; text-transform: uppercase; background: #f9fafb; }
.empty { text-align: center; color: #98a2b3; padding: 34px; }
.badge { border-radius: 999px; padding: 4px 9px; font-size: 12px; background: #eff8ff; color: #175cd3; }
</style>

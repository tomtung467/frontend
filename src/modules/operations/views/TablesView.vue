<template>
  <MasterLayout show-footer>
    <div class="tables-view">
      <MasterPageHeader :title="t('tables.title')" />
      <div class="tables-list">
        <div v-for="table in tables" :key="table.id" class="table-card">
          <div class="table-header">
            <h3>{{ t('tables.table') }} {{ table.table_number }}</h3>
            <span class="status" :class="normalizedStatus(table)">{{ statusLabel(table) }}</span>
          </div>
          <div class="table-info">
            <p><strong>{{ t('tables.capacity') }}:</strong> {{ table.capacity }} {{ t('tables.guests') }}</p>
            <p><strong>{{ t('tables.section') }}:</strong> {{ table.section || t('tables.commonSection') }}</p>
            <p v-if="table.occupied_since"><strong>{{ t('tables.occupiedSince') }}:</strong> {{ formatTime(table.occupied_since) }}</p>
            <p v-if="table.ready_items_count"><strong>{{ t('tables.readyItems') }}:</strong> {{ table.ready_items_count }}</p>
            <p v-if="table.payment_requested_at" class="payment-alert">{{ t('tables.paymentRequested') }}</p>
          </div>
          <div class="table-actions">
            <button class="btn-available" @click="updateStatus(table.id, 'empty')">
              {{ t('tables.empty') }}
            </button>
            <button class="btn-occupied" @click="updateStatus(table.id, 'occupied')">
              {{ t('tables.occupied') }}
            </button>
            <button class="btn-reserved" @click="updateStatus(table.id, 'reserved')">
              {{ t('tables.reserved') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </MasterLayout>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { isAbortError } from '@/api/requestManager'
import { useTableStore } from '@/stores/useTableStore'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import { showPopup } from '@/composables/usePopup'
import { currentLanguage, t } from '@/languages'

const tableStore = useTableStore()
const tables = computed(() => tableStore.tables)
let unsubscribeTables

onMounted(async () => {
  try {
    await tableStore.fetchTables({ summary: 1 })
    unsubscribeTables = tableStore.subscribeToTables()
  } catch (err) {
    if (!isAbortError(err)) throw err
  }
})

onUnmounted(() => {
  unsubscribeTables?.()
})

async function updateStatus(tableId, status) {
  try {
    await tableStore.updateTableStatus(tableId, status)
  } catch (err) {
    showPopup({ type: 'danger', title: t('common.error'), message: t('tables.updateFailed') })
  }
}

function normalizedStatus(table) {
  return table.status === 'empty' ? 'available' : table.status
}

function statusLabel(table) {
  return {
    empty: t('tables.empty'),
    available: t('tables.available'),
    occupied: t('tables.occupied'),
    reserved: t('tables.reserved'),
    maintenance: t('tables.maintenance'),
  }[table.status] || table.status
}

function formatTime(value) {
  const locale = currentLanguage.value === 'en' ? 'en-US' : 'vi-VN'
  return value ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '-'
}
</script>

<style scoped>
.tables-view {
  padding: 20px;
}

.tables-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.table-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
}

.table-header h3 {
  margin: 0;
  color: #333;
}

.status {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status.available {
  background-color: #d4edda;
  color: #155724;
}

.status.occupied {
  background-color: #ffebee;
  color: #d32f2f;
}

.status.reserved {
  background-color: #fff3cd;
  color: #856404;
}

.table-info {
  margin-bottom: 15px;
  color: #666;
  font-size: 14px;
}

.table-info p {
  margin: 5px 0;
}

.payment-alert {
  display: inline-flex;
  margin-top: 8px !important;
  padding: 6px 9px;
  border-radius: 6px;
  background: #fef3f2;
  color: #b42318;
  font-weight: 800;
}

.table-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

button {
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: opacity 0.3s;
}

.btn-available {
  background-color: #4caf50;
  color: white;
}

.btn-occupied {
  background-color: #ff6b35;
  color: white;
}

.btn-reserved {
  background-color: #ff9800;
  color: white;
}

button:hover {
  opacity: 0.8;
}
</style>

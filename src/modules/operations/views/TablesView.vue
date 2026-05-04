<template>
  <MasterLayout show-footer>
    <div class="tables-view">
      <h1>Table Management</h1>
      <div class="tables-list">
        <div v-for="table in tables" :key="table.id" class="table-card">
          <div class="table-header">
            <h3>Table {{ table.table_number }}</h3>
            <span class="status" :class="table.status">{{ table.status }}</span>
          </div>
          <div class="table-info">
            <p><strong>Capacity:</strong> {{ table.capacity }} seats</p>
            <p><strong>Section:</strong> {{ table.section || 'General' }}</p>
          </div>
          <div class="table-actions">
            <button @click="updateStatus(table.id, 'available')" class="btn-available">
              Available
            </button>
            <button @click="updateStatus(table.id, 'occupied')" class="btn-occupied">
              Occupied
            </button>
            <button @click="updateStatus(table.id, 'reserved')" class="btn-reserved">
              Reserved
            </button>
          </div>
        </div>
      </div>
    </div>
  </MasterLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTableStore } from '@/stores/useTableStore'
import MasterLayout from '@/components/MasterLayout.vue'

const tableStore = useTableStore()
const tables = ref([])

onMounted(async () => {
  await tableStore.fetchTables()
  tables.value = tableStore.tables
})

async function updateStatus(tableId, status) {
  try {
    await tableStore.updateTableStatus(tableId, status)
    const table = tables.value.find(t => t.id === tableId)
    if (table) {
      table.status = status
    }
  } catch (err) {
    alert('Failed to update table status')
  }
}
</script>

<style scoped>
.tables-view {
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
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

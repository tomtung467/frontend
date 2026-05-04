<template>
  <MasterLayout show-footer>
    <div class="floor-plan-view">
      <h1>Floor Plan</h1>
      <div class="floor-plan">
        <div v-for="table in tables" :key="table.id" class="table-item" :class="table.status">
          <div class="table-number">{{ table.table_number }}</div>
          <div class="table-capacity">{{ table.capacity }} seats</div>
          <div class="table-status">{{ table.status }}</div>
          <button v-if="table.status === 'available'" @click="selectTable(table)" class="btn-select">
            Select
          </button>
          <button v-else class="btn-occupied" disabled>
            Occupied
          </button>
        </div>
      </div>
    </div>
  </MasterLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTableStore } from '@/stores/useTableStore'
import MasterLayout from '@/components/MasterLayout.vue'

const router = useRouter()
const tableStore = useTableStore()
const tables = ref([])

onMounted(async () => {
  await tableStore.fetchTables()
  tables.value = tableStore.tables
})

function selectTable(table) {
  tableStore.selectTable(table)
  router.push('/menu')
}
</script>

<style scoped>
.floor-plan-view {
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.floor-plan {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.table-item {
  aspect-ratio: 1;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.table-item.available {
  background-color: #4caf50;
  color: white;
}

.table-item.available:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.table-item.occupied {
  background-color: #ff6b35;
  color: white;
}

.table-item.reserved {
  background-color: #ff9800;
  color: white;
}

.table-item.maintenance {
  background-color: #9e9e9e;
  color: white;
}

.table-number {
  font-size: 24px;
  font-weight: bold;
}

.table-capacity {
  font-size: 12px;
  opacity: 0.8;
}

.table-status {
  font-size: 10px;
  text-transform: uppercase;
  margin-top: 5px;
}

.btn-select,
.btn-occupied {
  position: absolute;
  bottom: 10px;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background: white;
  color: #333;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
}

.btn-occupied {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-select:hover {
  background: #f0f0f0;
}
</style>

<template>
  <MasterLayout show-footer>
    <div class="inventory-view">
      <h1>Inventory Management</h1>
      <div class="inventory-grid">
        <div v-for="item in inventory" :key="item.id" class="inventory-item">
          <h3>{{ item.name }}</h3>
          <p>Quantity: {{ item.quantity }} {{ item.unit }}</p>
          <p>Cost: ${{ item.cost_per_unit }}</p>
          <p :class="item.quantity <= item.min_stock_level ? 'low-stock' : ''">
            Min Stock: {{ item.min_stock_level }}
          </p>
        </div>
      </div>
    </div>
  </MasterLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import MasterLayout from '@/components/MasterLayout.vue'

const inventory = ref([])

onMounted(async () => {
  try {
    const response = await api.get('/inventory')
    inventory.value = response.data
  } catch (err) {
    console.error('Failed to fetch inventory:', err)
  }
})
</script>

<style scoped>
.inventory-view {
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.inventory-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.inventory-item h3 {
  margin-top: 0;
  color: #333;
}

.inventory-item p {
  margin: 10px 0;
  color: #666;
}

.low-stock {
  color: #d32f2f;
  font-weight: bold;
}
</style>

<template>
  <MasterLayout show-footer>
    <div class="menu-management-view">
      <h1>Menu Management</h1>
      <div class="menu-list">
        <div v-for="food in foods" :key="food.id" class="menu-item">
          <h3>{{ food.food_name }}</h3>
          <p>Price: ${{ food.price }}</p>
          <p>Available: {{ food.is_available ? 'Yes' : 'No' }}</p>
        </div>
      </div>
    </div>
  </MasterLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import MasterLayout from '@/components/MasterLayout.vue'

const foods = ref([])

onMounted(async () => {
  try {
    const response = await api.get('/menu')
    foods.value = response.data
  } catch (err) {
    console.error('Failed to fetch menu:', err)
  }
})
</script>

<style scoped>
.menu-management-view {
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.menu-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.menu-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.menu-item h3 {
  margin-top: 0;
  color: #333;
}

.menu-item p {
  margin: 10px 0;
  color: #666;
}
</style>

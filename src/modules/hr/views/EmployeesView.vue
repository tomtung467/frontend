<template>
  <MasterLayout show-footer>
    <div class="employees-view">
      <h1>Employee Management</h1>
      <div class="employees-list">
        <div v-for="employee in employees" :key="employee.id" class="employee-card">
          <h3>{{ employee.user?.name }}</h3>
          <p><strong>Position:</strong> {{ employee.position }}</p>
          <p><strong>Department:</strong> {{ employee.department?.name }}</p>
          <p><strong>Status:</strong> {{ employee.status }}</p>
        </div>
      </div>
    </div>
  </MasterLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import MasterLayout from '@/components/MasterLayout.vue'

const employees = ref([])

onMounted(async () => {
  try {
    const response = await api.get('/employees')
    employees.value = response.data
  } catch (err) {
    console.error('Failed to fetch employees:', err)
  }
})
</script>

<style scoped>
.employees-view {
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.employees-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.employee-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.employee-card h3 {
  margin-top: 0;
  color: #333;
}

.employee-card p {
  margin: 10px 0;
  color: #666;
}
</style>

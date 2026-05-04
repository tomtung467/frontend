<template>
  <MasterLayout show-footer>
    <div class="departments-view">
      <h1>Department Management</h1>
      <div class="departments-list">
        <div v-for="department in departments" :key="department.id" class="department-card">
          <h3>{{ department.name }}</h3>
          <p>Employees: {{ department.employees?.length || 0 }}</p>
        </div>
      </div>
    </div>
  </MasterLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import MasterLayout from '@/components/MasterLayout.vue'

const departments = ref([])

onMounted(async () => {
  try {
    const response = await api.get('/departments')
    departments.value = response.data
  } catch (err) {
    console.error('Failed to fetch departments:', err)
  }
})
</script>

<style scoped>
.departments-view {
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.departments-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.department-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.department-card h3 {
  margin-top: 0;
  color: #333;
}

.department-card p {
  margin: 10px 0;
  color: #666;
}
</style>

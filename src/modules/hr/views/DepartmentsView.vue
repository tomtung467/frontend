<template>
  <MasterLayout show-footer>
    <div class="departments-view">
      <MasterPageHeader :title="t('hr.departments')" />
      <div class="departments-list">
        <div v-for="department in departments" :key="department.id" class="department-card">
          <h3>{{ department.name }}</h3>
          <p>{{ t('hr.departmentEmployees') }}: {{ department.employees?.length || 0 }}</p>
        </div>
      </div>
    </div>
  </MasterLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '@/api'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import { t } from '@/languages'

const departments = ref([])

onMounted(async () => {
  try {
    const response = await api.get('/departments')
    departments.value = response.data
  } catch (err) {
    console.error(t('hr.failedDepartments'), err)
  }
})
</script>

<style scoped>
.departments-view {
  padding: 20px;
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

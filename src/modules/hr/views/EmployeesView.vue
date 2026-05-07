<template>
  <MasterLayout show-footer>
    <main class="ops-page">
      <MasterPageHeader :title="t('hr.employees')">
        <template #actions>
          <button class="ghost-action" @click="loadEmployees">{{ t('hr.refresh') }}</button>
        </template>
      </MasterPageHeader>

      <form class="inline-form" @submit.prevent="createEmployee">
        <input v-model="form.first_name" required :placeholder="t('hr.firstName')" />
        <input v-model="form.last_name" required :placeholder="t('hr.lastName')" />
        <input v-model="form.email" required type="email" :placeholder="t('hr.loginEmail')" />
        <input v-model="form.position" required :placeholder="t('hr.position')" />
        <select v-model="form.department_id">
          <option value="">{{ t('hr.noDepartment') }}</option>
          <option v-for="department in departments" :key="department.id" :value="department.id">{{ department.name }}</option>
        </select>
        <select v-model="form.role">
          <option value="staff">{{ t('hr.staff') }}</option>
          <option value="chef">{{ t('hr.chef') }}</option>
          <option value="manager">{{ t('hr.manager') }}</option>
        </select>
        <input v-model.number="form.salary" required type="number" step="100000" :placeholder="t('hr.salary')" />
        <input v-model="form.hire_date" required type="date" />
        <button class="primary-action" :disabled="saving">{{ saving ? t('menu.saving') : t('hr.addEmployee') }}</button>
      </form>

      <section class="summary-strip">
        <div class="metric"><span>{{ t('hr.total') }}</span><strong>{{ employees.length }}</strong></div>
        <div class="metric"><span>{{ t('hr.active') }}</span><strong>{{ countByStatus('active') }}</strong></div>
        <div class="metric warning"><span>{{ t('hr.onLeave') }}</span><strong>{{ countByStatus('on_leave') }}</strong></div>
      </section>

      <section class="toolbar">
        <input v-model="search" type="search" :placeholder="t('hr.search')" />
        <select v-model="statusFilter">
          <option value="">{{ t('hr.allStatuses') }}</option>
          <option value="active">{{ t('hr.active') }}</option>
          <option value="inactive">{{ t('hr.inactive') }}</option>
          <option value="on_leave">{{ t('hr.onLeave') }}</option>
          <option value="terminated">{{ t('hr.terminated') }}</option>
        </select>
      </section>

      <p v-if="error" class="state error">{{ error }}</p>
      <p v-else-if="loading" class="state">{{ t('hr.loading') }}</p>
      <p v-else-if="filteredEmployees.length === 0" class="state">{{ t('hr.noEmployees') }}</p>

      <div v-else class="data-table">
        <table>
          <thead>
            <tr>
              <th>{{ t('hr.employee') }}</th>
              <th>{{ t('hr.department') }}</th>
              <th>{{ t('hr.position') }}</th>
              <th>{{ t('hr.hireDate') }}</th>
              <th>{{ t('hr.salary') }}</th>
              <th>{{ t('inventory.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee in filteredEmployees" :key="employee.id">
              <td>
                <strong>{{ employeeName(employee) }}</strong>
                <small>{{ employee.employee_id_number || employee.employee_code || employee.user?.email }}</small>
              </td>
              <td>{{ employee.department?.name || t('hr.unassigned') }}</td>
              <td>{{ employee.position }}</td>
              <td>{{ formatDate(employee.hire_date) }}</td>
              <td>{{ formatCurrency(employee.salary) }}</td>
              <td>
                <select class="status-select" :value="employee.status" @change="updateStatus(employee, $event.target.value)">
                  <option value="active">{{ t('hr.active') }}</option>
                  <option value="inactive">{{ t('hr.inactive') }}</option>
                  <option value="on_leave">{{ t('hr.onLeave') }}</option>
                  <option value="terminated">{{ t('hr.terminated') }}</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import { employeeService } from '@/services'
import { currentLanguage, t } from '@/languages'

const employees = ref([])
const departments = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const search = ref('')
const statusFilter = ref('')
const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  position: '',
  department_id: '',
  role: 'staff',
  salary: null,
  hire_date: new Date().toISOString().slice(0, 10),
  status: 'active',
})

const filteredEmployees = computed(() => {
  const query = search.value.trim().toLowerCase()
  return employees.value.filter((employee) => {
    const haystack = [
      employeeName(employee),
      employee.position,
      employee.department?.name,
      employee.user?.email,
      employee.employee_id_number,
    ].join(' ').toLowerCase()
    return (!query || haystack.includes(query)) && (!statusFilter.value || employee.status === statusFilter.value)
  })
})

onMounted(loadEmployees)

async function loadEmployees() {
  loading.value = true
  error.value = ''
  try {
    const [employeeList, departmentList] = await Promise.all([
      employeeService.getEmployees(),
      employeeService.getDepartments(),
    ])
    employees.value = employeeList
    departments.value = departmentList
  } catch (err) {
    error.value = err.message || t('hr.failedLoad')
  } finally {
    loading.value = false
  }
}

async function createEmployee() {
  saving.value = true
  error.value = ''
  try {
    await employeeService.createEmployee({
      ...form.value,
      name: `${form.value.first_name} ${form.value.last_name}`.trim(),
      department_id: form.value.department_id || null,
      password: 'password123',
    })
    form.value = {
      first_name: '',
      last_name: '',
      email: '',
      position: '',
      department_id: '',
      role: 'staff',
      salary: null,
      hire_date: new Date().toISOString().slice(0, 10),
      status: 'active',
    }
    await loadEmployees()
  } catch (err) {
    error.value = err.message || t('hr.failedCreate')
  } finally {
    saving.value = false
  }
}

async function updateStatus(employee, status) {
  if (saving.value || employee.status === status) return
  saving.value = true
  error.value = ''
  try {
    await employeeService.updateEmployeeStatus(employee.id, status)
    employee.status = status
  } catch (err) {
    error.value = err.message || t('hr.failedUpdate')
  } finally {
    saving.value = false
  }
}

function employeeName(employee) {
  return [employee.first_name, employee.last_name].filter(Boolean).join(' ') || employee.user?.name || t('hr.unnamed')
}

function countByStatus(status) {
  return employees.value.filter((employee) => employee.status === status).length
}

function locale() {
  return currentLanguage.value === 'en' ? 'en-US' : 'vi-VN'
}

function formatCurrency(value) {
  return new Intl.NumberFormat(locale(), { style: 'currency', currency: 'VND' }).format(Number(value || 0))
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat(locale()).format(new Date(value))
}
</script>

<style scoped>
.ops-page { padding: 24px; width: min(1320px, 100%); margin: 0 auto; }
.toolbar, .summary-strip, .inline-form { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.summary-strip { margin-bottom: 18px; }
.metric { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; min-width: 170px; }
.metric span { display: block; color: #667085; font-size: 13px; }
.metric strong { font-size: 22px; color: #111827; }
.metric.warning strong { color: #b42318; }
.toolbar, .inline-form { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 14px; }
input, select { min-height: 38px; border: 1px solid #d0d5dd; border-radius: 6px; padding: 0 10px; background: #fff; }
.toolbar input { min-width: 280px; flex: 1; }
.inline-form input, .inline-form select { flex: 1 1 150px; }
button { border: 0; border-radius: 6px; min-height: 38px; padding: 0 14px; cursor: pointer; }
.ghost-action { background: #f2f4f7; color: #344054; }
.primary-action { background: #155eef; color: #fff; }
.state { padding: 18px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; color: #475467; }
.state.error { color: #b42318; border-color: #fecdca; background: #fffbfa; }
.data-table { overflow-x: auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 13px 14px; border-bottom: 1px solid #eaecf0; text-align: left; vertical-align: middle; }
th { color: #667085; font-size: 12px; text-transform: uppercase; background: #f9fafb; }
td strong, td small { display: block; }
td small { color: #667085; margin-top: 3px; }
.status-select { min-width: 130px; }
@media (max-width: 720px) { .ops-page { padding: 16px; } .toolbar input { min-width: 100%; } }
</style>

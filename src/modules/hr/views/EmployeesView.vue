<template>
  <MasterLayout show-footer>
    <main class="ops-page">
      <MasterPageHeader :title="t('hr.employees')">
        <template #actions>
          <div class="header-controls">
            <input v-model="search" type="search" :placeholder="t('hr.search')" />
            <select v-model="statusFilter">
              <option value="">{{ t('hr.allStatuses') }}</option>
              <option value="active">{{ t('hr.active') }}</option>
              <option value="inactive">{{ t('hr.inactive') }}</option>
              <option value="on_leave">{{ t('hr.onLeave') }}</option>
              <option value="terminated">{{ t('hr.terminated') }}</option>
            </select>
          </div>
          <button class="primary-action" @click="openCreateModal">{{ t('hr.addEmployee') }}</button>
        </template>
      </MasterPageHeader>

      <section class="summary-strip">
        <div class="metric"><span>{{ t('hr.total') }}</span><strong>{{ employees.length }}</strong></div>
        <div class="metric"><span>{{ t('hr.active') }}</span><strong>{{ countByStatus('active') }}</strong></div>
        <div class="metric warning"><span>{{ t('hr.onLeave') }}</span><strong>{{ countByStatus('on_leave') }}</strong></div>
      </section>

      <p v-if="loading" class="state">{{ t('hr.loading') }}</p>
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
              <th>{{ t('hr.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee in paginatedEmployees" :key="employee.id">
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
              <td>
                <div class="row-actions">
                  <button class="ghost-action compact" @click="openEditModal(employee)">{{ t('menu.edit') }}</button>
                  <button class="danger-action compact" :disabled="saving" @click="askDeleteEmployee(employee)">{{ t('menu.delete') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav v-if="filteredEmployees.length" class="pagination">
        <span>Tổng {{ filteredEmployees.length }},</span>
        <span>Hiển thị</span>
        <select v-model.number="pageSize">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
        <button class="page-button" :disabled="currentPage === 1" @click="currentPage--">‹</button>
        <strong>{{ currentPage }}</strong>
        <button class="page-button" :disabled="currentPage === totalPages" @click="currentPage++">›</button>
      </nav>

      <Teleport to="body">
        <transition name="drawer-fade">
          <div v-if="formModalOpen" class="drawer-backdrop" @click.self="closeFormModal">
            <aside class="entity-drawer" role="dialog" aria-modal="true">
              <header class="drawer-header">
                <div>
                  <h2>{{ editingId ? t('hr.updateEmployee') : t('hr.addEmployee') }}</h2>
                  <p>{{ editingId ? `${form.first_name} ${form.last_name}`.trim() : t('hr.position') }}</p>
                </div>
                <button class="icon-action" type="button" aria-label="Close" @click="closeFormModal">&times;</button>
              </header>

              <form class="drawer-form" @submit.prevent="saveEmployee">
                <div class="form-row">
                  <label>
                    <span>{{ t('hr.firstName') }}</span>
                    <input v-model="form.first_name" required :placeholder="t('hr.firstName')" />
                  </label>
                  <label>
                    <span>{{ t('hr.lastName') }}</span>
                    <input v-model="form.last_name" required :placeholder="t('hr.lastName')" />
                  </label>
                </div>
                <label>
                  <span>{{ t('hr.loginEmail') }}</span>
                  <input v-model="form.email" required type="email" :placeholder="t('hr.loginEmail')" />
                </label>
                <label>
                  <span>{{ t('hr.position') }}</span>
                  <input v-model="form.position" required :placeholder="t('hr.position')" />
                </label>
                <div class="form-row">
                  <label>
                    <span>{{ t('hr.department') }}</span>
                    <select v-model="form.department_id">
                      <option value="">{{ t('hr.noDepartment') }}</option>
                      <option v-for="department in departments" :key="department.id" :value="department.id">{{ department.name }}</option>
                    </select>
                  </label>
                  <label>
                    <span>{{ t('hr.role') }}</span>
                    <select v-model="form.role">
                      <option value="staff">{{ t('hr.staff') }}</option>
                      <option value="chef">{{ t('hr.chef') }}</option>
                      <option value="manager">{{ t('hr.manager') }}</option>
                    </select>
                  </label>
                </div>
                <div class="form-row">
                  <label>
                    <span>{{ t('hr.salary') }}</span>
                    <input v-model.number="form.salary" required type="number" step="100000" :placeholder="t('hr.salary')" />
                  </label>
                  <label>
                    <span>{{ t('hr.hireDate') }}</span>
                    <input v-model="form.hire_date" required type="date" />
                  </label>
                </div>
                <footer class="drawer-actions">
                  <button type="button" class="ghost-action" @click="closeFormModal">{{ t('user.cancel') }}</button>
                  <button class="primary-action" :disabled="saving">{{ saving ? t('menu.saving') : editingId ? t('hr.updateEmployee') : t('hr.addEmployee') }}</button>
                </footer>
              </form>
            </aside>
          </div>
        </transition>
      </Teleport>

      <UiPopup
        v-model="popup.open"
        :type="popup.type"
        :title="popup.title"
        :message="popup.message"
        :confirm-text="popup.confirmText"
        :cancel-text="popup.cancelText"
        @confirm="handlePopupConfirm"
        @cancel="closePopup"
      />
    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import UiPopup from '@/components/common/UiPopup.vue'
import { showNotification } from '@/composables/usePopup'
import { isAbortError } from '@/api/requestManager'
import { employeeService } from '@/services'
import { currentLanguage, t } from '@/languages'

const employees = ref([])
const departments = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const search = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const editingId = ref(null)
const formModalOpen = ref(false)
const pendingDelete = ref(null)
const popup = reactive({
  open: false,
  type: 'info',
  title: '',
  message: '',
  confirmText: 'OK',
  cancelText: '',
  action: '',
})
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
const totalPages = computed(() => Math.max(1, Math.ceil(filteredEmployees.value.length / pageSize.value)))
const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredEmployees.value.slice(start, start + pageSize.value)
})

watch([search, statusFilter, pageSize], () => {
  currentPage.value = 1
})
watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
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
    if (isAbortError(err)) return
    error.value = err.message || t('hr.failedLoad')
  } finally {
    loading.value = false
  }
}

async function saveEmployee() {
  saving.value = true
  error.value = ''
  try {
    const payload = {
      ...form.value,
      name: `${form.value.first_name} ${form.value.last_name}`.trim(),
      department_id: form.value.department_id || null,
    }
    if (!editingId.value) payload.password = 'password123'
    if (editingId.value) {
      await employeeService.updateEmployee(editingId.value, payload)
    } else {
      await employeeService.createEmployee(payload)
    }
    closeFormModal()
    await loadEmployees()
  } catch (err) {
    if (isAbortError(err)) return
    showPopup('danger', t('common.error'), err.message || (editingId.value ? t('hr.failedUpdate') : t('hr.failedCreate')))
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
    if (isAbortError(err)) return
    showPopup('danger', t('common.error'), err.message || t('hr.failedUpdate'))
  } finally {
    saving.value = false
  }
}

function openCreateModal() {
  resetForm()
  formModalOpen.value = true
}

function openEditModal(employee) {
  editEmployee(employee)
  formModalOpen.value = true
}

function editEmployee(employee) {
  editingId.value = employee.id
  const nameParts = employeeName(employee).split(' ')
  form.value = {
    first_name: employee.first_name || nameParts.slice(0, -1).join(' ') || employeeName(employee),
    last_name: employee.last_name || nameParts.slice(-1)[0] || '',
    email: employee.user?.email || employee.email || '',
    position: employee.position || '',
    department_id: employee.department_id || employee.department?.id || '',
    role: employee.user?.role || employee.role || 'staff',
    salary: Number(employee.salary || 0),
    hire_date: employee.hire_date || new Date().toISOString().slice(0, 10),
    status: employee.status || 'active',
  }
}

function closeFormModal() {
  formModalOpen.value = false
  resetForm()
}

function resetForm() {
  editingId.value = null
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
}

function askDeleteEmployee(employee) {
  pendingDelete.value = employee
  Object.assign(popup, {
    open: true,
    type: 'danger',
    title: t('hr.deleteEmployeeTitle'),
    message: `${t('hr.deleteEmployeeBody')} ${employeeName(employee)}?`,
    confirmText: t('menu.delete'),
    cancelText: t('user.cancel'),
    action: 'delete',
  })
}

async function deleteEmployee(employee) {
  saving.value = true
  try {
    await employeeService.deleteEmployee(employee.id)
    if (editingId.value === employee.id) resetForm()
    await loadEmployees()
  } catch (err) {
    if (isAbortError(err)) return
    showPopup('danger', t('common.error'), err.message || t('hr.failedDelete'))
  } finally {
    saving.value = false
  }
}

function handlePopupConfirm() {
  const action = popup.action
  closePopup()
  if (action === 'delete' && pendingDelete.value) {
    deleteEmployee(pendingDelete.value)
    pendingDelete.value = null
  }
}

function showPopup(type, title, message = '') {
  showNotification({ type, title, message })
}

function closePopup() {
  popup.open = false
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
.ops-page { padding: 24px; width: min(1320px, 100%); margin: 0 auto; box-sizing: border-box; }
.header-controls, .summary-strip { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.summary-strip { margin-bottom: 18px; }
.metric { flex: 1 1 170px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; min-width: 0; }
.metric span { display: block; color: #667085; font-size: 13px; }
.metric strong { font-size: 22px; color: #111827; }
.metric.warning strong { color: #b42318; }
input, select { min-height: 38px; border: 1px solid #d0d5dd; border-radius: 6px; padding: 0 10px; background: #fff; }
.header-controls input { width: min(360px, 42vw); }
.header-controls select { width: 170px; }
button { border: 0; border-radius: 6px; min-height: 38px; padding: 0 14px; cursor: pointer; }
.ghost-action { background: #f2f4f7; color: #344054; }
.primary-action { background: #155eef; color: #fff; }
.state { padding: 18px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; color: #475467; }
.data-table { overflow-x: auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
table { width: 100%; min-width: 900px; border-collapse: collapse; }
th, td { padding: 13px 14px; border-bottom: 1px solid #eaecf0; text-align: left; vertical-align: middle; }
th { color: #667085; font-size: 12px; text-transform: uppercase; background: #f9fafb; }
td strong, td small { display: block; }
td small { color: #667085; margin-top: 3px; }
.status-select { min-width: 130px; }
.row-actions { display: flex; gap: 8px; }
.compact { min-height: 34px; padding: 0 10px; }
.danger-action { background: #b42318; color: #fff; }
.drawer-backdrop { position: fixed; inset: 0; z-index: 2900; display: flex; justify-content: flex-end; background: rgba(15, 23, 42, .34); }
.entity-drawer { width: min(560px, 100%); height: 100%; overflow-y: auto; background: #fff; box-shadow: -18px 0 44px rgba(15, 23, 42, .18); }
.drawer-header { position: sticky; top: 0; z-index: 1; display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; padding: 22px 24px; border-bottom: 1px solid #eaecf0; background: #fff; }
.drawer-header h2 { margin: 0; font-size: 24px; color: #111827; }
.drawer-header p { margin: 6px 0 0; color: #667085; }
.icon-action { display: grid; place-items: center; width: 38px; height: 38px; min-height: 38px; border-radius: 7px; padding: 0; background: #f2f4f7; color: #344054; font-size: 26px; line-height: 1; }
.drawer-form { display: grid; gap: 16px; padding: 20px 24px 24px; }
.drawer-form label { display: grid; gap: 7px; color: #344054; font-weight: 700; }
.drawer-form input, .drawer-form select { width: 100%; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.drawer-actions { position: sticky; bottom: 0; display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid #eaecf0; background: #fff; }
.drawer-fade-enter-active, .drawer-fade-leave-active { transition: opacity .18s ease; }
.drawer-fade-enter-active .entity-drawer, .drawer-fade-leave-active .entity-drawer { transition: transform .2s ease; }
.drawer-fade-enter-from, .drawer-fade-leave-to { opacity: 0; }
.drawer-fade-enter-from .entity-drawer, .drawer-fade-leave-to .entity-drawer { transform: translateX(28px); }
.pagination { display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-top: 14px; color: #344054; }
.pagination select { width: 74px; min-height: 34px; flex: none; }
.pagination strong { display: grid; place-items: center; min-width: 34px; height: 34px; border-radius: 6px; background: #f2f4f7; color: #111827; }
.page-button { min-width: 34px; min-height: 34px; padding: 0; background: transparent; color: #98a2b3; font-size: 24px; }
.page-button:not(:disabled) { color: #344054; }
@media (max-width: 720px) { .ops-page { padding: 16px; } .summary-strip { gap: 10px; } .header-controls, .header-controls input, .header-controls select { width: 100%; } .form-row { grid-template-columns: 1fr; } }
</style>

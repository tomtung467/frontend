<template>
  <MasterLayout show-footer>
    <main class="ops-page">
      <MasterPageHeader :title="t('inventory.title')">
        <template #actions>
          <div class="header-controls">
            <input v-model="search" type="search" :placeholder="t('inventory.search')" />
            <select v-model="stockFilter">
              <option value="all">{{ t('inventory.allStock') }}</option>
              <option value="low">{{ t('inventory.lowOnly') }}</option>
            </select>
          </div>
          <button class="primary-action" :disabled="saving" @click="openCreateModal">
            {{ t('inventory.addIngredient') }}
          </button>
        </template>
      </MasterPageHeader>

      <section class="summary-strip">
        <div class="metric"><span>{{ t('inventory.totalItems') }}</span><strong>{{ inventory.length }}</strong></div>
        <div class="metric warning"><span>{{ t('inventory.lowStock') }}</span><strong>{{ lowStockCount }}</strong></div>
        <div class="metric"><span>{{ t('inventory.inventoryValue') }}</span><strong>{{ formatCurrency(totalValue) }}</strong></div>
      </section>

      <p v-if="loading" class="state">{{ t('inventory.loading') }}</p>
      <p v-else-if="filteredInventory.length === 0" class="state">{{ t('inventory.noMatch') }}</p>

      <div v-else class="data-table">
        <table>
          <thead>
            <tr>
              <th>{{ t('inventory.ingredient') }}</th>
              <th>{{ t('inventory.category') }}</th>
              <th>{{ t('inventory.stock') }}</th>
              <th>{{ t('inventory.minimum') }}</th>
              <th>{{ t('inventory.unitCost') }}</th>
              <th>{{ t('inventory.status') }}</th>
              <th>{{ t('inventory.adjust') }}</th>
              <th>{{ t('hr.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedInventory" :key="item.id">
              <td>
                <strong>{{ item.name }}</strong>
                <small>{{ item.description || t('inventory.noNotes') }}</small>
              </td>
              <td>{{ item.category || t('inventory.general') }}</td>
              <td>
                <div class="stock-cell">
                  <strong>{{ number(item.current_quantity ?? item.quantity) }} {{ item.unit }}</strong>
                  <span class="stock-bar"><i :class="{ danger: isLowStock(item) }" :style="{ width: stockPercent(item) + '%' }"></i></span>
                </div>
              </td>
              <td>{{ number(item.min_quantity ?? item.min_stock_level) }} {{ item.unit }}</td>
              <td>{{ formatCurrency(item.unit_cost ?? item.cost_per_unit) }}</td>
              <td>
                <span class="badge" :class="{ danger: isLowStock(item) }">
                  {{ isLowStock(item) ? t('inventory.lowStock') : t('inventory.healthy') }}
                </span>
              </td>
              <td>
                <div class="adjust">
                  <input v-model.number="adjustments[item.id]" type="number" step="0.01" />
                  <button :disabled="saving || !adjustments[item.id]" @click="adjustStock(item)">{{ t('inventory.apply') }}</button>
                </div>
              </td>
              <td>
                <div class="row-actions">
                  <button class="ghost-action compact" @click="openEditModal(item)">{{ t('menu.edit') }}</button>
                  <button class="danger-action compact" :disabled="saving" @click="askDeleteIngredient(item)">{{ t('menu.delete') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav v-if="filteredInventory.length > pageSize" class="pagination">
        <span>Tổng {{ filteredInventory.length }},</span>
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
                  <h2>{{ editingId ? t('inventory.updateIngredient') : t('inventory.addIngredient') }}</h2>
                  <p>{{ editingId ? form.name : t('inventory.ingredientName') }}</p>
                </div>
                <button class="icon-action" type="button" aria-label="Close" @click="closeFormModal">&times;</button>
              </header>

              <form class="drawer-form" @submit.prevent="saveIngredient">
                <label>
                  <span>{{ t('inventory.ingredientName') }}</span>
                  <input v-model="form.name" required :placeholder="t('inventory.ingredientName')" />
                </label>
                <label>
                  <span>{{ t('inventory.category') }}</span>
                  <input v-model="form.category" :placeholder="t('inventory.category')" />
                </label>
                <div class="form-row">
                  <label>
                    <span>{{ t('inventory.quantity') }}</span>
                    <input v-model.number="form.current_quantity" required type="number" step="0.01" :placeholder="t('inventory.quantity')" />
                  </label>
                  <label>
                    <span>{{ t('inventory.unit') }}</span>
                    <input v-model="form.unit" required :placeholder="t('inventory.unit')" />
                  </label>
                </div>
                <div class="form-row">
                  <label>
                    <span>{{ t('inventory.minimum') }}</span>
                    <input v-model.number="form.min_quantity" type="number" step="0.01" :placeholder="t('inventory.minimum')" />
                  </label>
                  <label>
                    <span>{{ t('inventory.unitCost') }}</span>
                    <input v-model.number="form.unit_cost" type="number" step="100" :placeholder="t('inventory.unitCost')" />
                  </label>
                </div>
                <footer class="drawer-actions">
                  <button type="button" class="ghost-action" @click="closeFormModal">{{ t('user.cancel') }}</button>
                  <button class="primary-action" :disabled="saving">
                    {{ saving ? t('menu.saving') : editingId ? t('inventory.updateIngredient') : t('inventory.addIngredient') }}
                  </button>
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
import { inventoryService } from '@/services'
import { currentLanguage, t } from '@/languages'

const inventory = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const search = ref('')
const stockFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const editingId = ref(null)
const formModalOpen = ref(false)
const adjustments = reactive({})
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

const form = reactive({
  name: '',
  category: '',
  current_quantity: 0,
  unit: '',
  min_quantity: 0,
  unit_cost: 0,
})

const filteredInventory = computed(() => {
  const query = search.value.trim().toLowerCase()
  return inventory.value.filter((item) => {
    const matchesSearch = !query ||
      item.name?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    const matchesStock = stockFilter.value === 'all' || isLowStock(item)
    return matchesSearch && matchesStock
  })
})
const totalPages = computed(() => Math.max(1, Math.ceil(filteredInventory.value.length / pageSize.value)))
const paginatedInventory = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredInventory.value.slice(start, start + pageSize.value)
})

watch([search, stockFilter, pageSize], () => {
  currentPage.value = 1
})
watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

const lowStockCount = computed(() => inventory.value.filter(isLowStock).length)
const totalValue = computed(() =>
  inventory.value.reduce((sum, item) => {
    const qty = Number(item.current_quantity ?? item.quantity ?? 0)
    const cost = Number(item.unit_cost ?? item.cost_per_unit ?? 0)
    return sum + qty * cost
  }, 0)
)

onMounted(loadInventory)

async function loadInventory() {
  loading.value = true
  error.value = ''
  try {
    inventory.value = await inventoryService.getInventory()
  } catch (err) {
    if (isAbortError(err)) return
    showPopup('danger', t('common.error'), err.message || t('inventory.failedLoad'))
  } finally {
    loading.value = false
  }
}

async function saveIngredient() {
  if (!form.name || !form.unit) return
  saving.value = true
  error.value = ''
  try {
    if (editingId.value) {
      await inventoryService.updateIngredient(editingId.value, { ...form })
    } else {
      await inventoryService.createIngredient({ ...form })
    }
    closeFormModal()
    await loadInventory()
  } catch (err) {
    if (isAbortError(err)) return
    showPopup('danger', t('common.error'), err.message || (editingId.value ? t('inventory.failedUpdate') : t('inventory.failedCreate')))
  } finally {
    saving.value = false
  }
}

function openCreateModal() {
  resetForm()
  formModalOpen.value = true
}

function openEditModal(item) {
  editingId.value = item.id
  Object.assign(form, {
    name: item.name || '',
    category: item.category || '',
    current_quantity: Number(item.current_quantity ?? item.quantity ?? 0),
    unit: item.unit || '',
    min_quantity: Number(item.min_quantity ?? item.min_stock_level ?? 0),
    unit_cost: Number(item.unit_cost ?? item.cost_per_unit ?? 0),
  })
  formModalOpen.value = true
}

function closeFormModal() {
  formModalOpen.value = false
  resetForm()
}

function resetForm() {
  editingId.value = null
  Object.assign(form, { name: '', category: '', current_quantity: 0, unit: '', min_quantity: 0, unit_cost: 0 })
}

async function adjustStock(item) {
  const amount = Number(adjustments[item.id] || 0)
  if (!amount) return
  saving.value = true
  error.value = ''
  try {
    await inventoryService.updateStock(item.id, amount, amount > 0 ? 'purchase' : 'adjustment')
    adjustments[item.id] = ''
    await loadInventory()
  } catch (err) {
    if (isAbortError(err)) return
    showPopup('danger', t('common.error'), err.message || t('inventory.failedUpdate'))
  } finally {
    saving.value = false
  }
}

function askDeleteIngredient(item) {
  pendingDelete.value = item
  Object.assign(popup, {
    open: true,
    type: 'danger',
    title: t('inventory.deleteIngredientTitle'),
    message: `${t('inventory.deleteIngredientBody')} ${item.name}?`,
    confirmText: t('menu.delete'),
    cancelText: t('user.cancel'),
    action: 'delete',
  })
}

async function deleteIngredient(item) {
  saving.value = true
  error.value = ''
  try {
    await inventoryService.deleteIngredient(item.id)
    await loadInventory()
  } catch (err) {
    if (isAbortError(err)) return
    showPopup('danger', t('common.error'), err.message || t('inventory.failedDelete'))
  } finally {
    saving.value = false
  }
}

function handlePopupConfirm() {
  const action = popup.action
  closePopup()
  if (action === 'delete' && pendingDelete.value) {
    deleteIngredient(pendingDelete.value)
    pendingDelete.value = null
  }
}

function showPopup(type, title, message = '') {
  showNotification({ type, title, message })
}

function closePopup() {
  popup.open = false
}

function isLowStock(item) {
  return Number(item.current_quantity ?? item.quantity ?? 0) <= Number(item.min_quantity ?? item.min_stock_level ?? 0)
}

function stockPercent(item) {
  const qty = Number(item.current_quantity ?? item.quantity ?? 0)
  const min = Number(item.min_quantity ?? item.min_stock_level ?? 1)
  return Math.max(6, Math.min(100, Math.round((qty / Math.max(min * 2, 1)) * 100)))
}

function locale() {
  return currentLanguage.value === 'en' ? 'en-US' : 'vi-VN'
}

function formatCurrency(value) {
  return new Intl.NumberFormat(locale(), { style: 'currency', currency: 'VND' }).format(Number(value || 0))
}

function number(value) {
  return new Intl.NumberFormat(locale(), { maximumFractionDigits: 2 }).format(Number(value || 0))
}

</script>

<style scoped>
.ops-page { padding: 24px; width: min(1320px, 100%); margin: 0 auto; box-sizing: border-box; }
.header-controls, .summary-strip { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.summary-strip { margin-bottom: 18px; }
.metric { flex: 1 1 190px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; min-width: 0; }
.metric span { display: block; color: #667085; font-size: 13px; }
.metric strong { font-size: 22px; color: #111827; }
.metric.warning strong { color: #b42318; }
input, select { min-height: 38px; border: 1px solid #d0d5dd; border-radius: 6px; padding: 0 10px; background: #fff; }
.header-controls input { width: min(360px, 42vw); }
.header-controls select { width: 170px; }
button { border: 0; border-radius: 6px; min-height: 38px; padding: 0 14px; cursor: pointer; }
button:disabled { opacity: .55; cursor: not-allowed; }
.primary-action { background: #155eef; color: #fff; }
.ghost-action { background: #f2f4f7; color: #344054; }
.state { padding: 18px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; color: #475467; }
.data-table { overflow-x: auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
table { width: 100%; min-width: 860px; border-collapse: collapse; }
th, td { padding: 13px 14px; border-bottom: 1px solid #eaecf0; text-align: left; vertical-align: middle; }
th { color: #667085; font-size: 12px; text-transform: uppercase; background: #f9fafb; }
td strong, td small { display: block; }
td small { color: #667085; margin-top: 3px; }
.badge { display: inline-flex; border-radius: 999px; padding: 4px 9px; font-size: 12px; background: #ecfdf3; color: #027a48; }
.badge.danger { background: #fef3f2; color: #b42318; }
.stock-cell { display: grid; gap: 7px; min-width: 150px; }
.stock-cell strong { color: #101828; }
.stock-bar { height: 7px; border-radius: 999px; overflow: hidden; background: #eef2f6; }
.stock-bar i { display: block; height: 100%; border-radius: inherit; background: #12b76a; }
.stock-bar i.danger { background: #f04438; }
.adjust { display: flex; gap: 8px; }
.adjust input { width: 90px; min-width: 90px; }
.adjust button { background: #344054; color: #fff; }
.danger-action { background: #b42318; color: #fff; }
.row-actions { display: flex; gap: 8px; }
.compact { min-height: 34px; padding: 0 10px; }
.drawer-backdrop { position: fixed; inset: 0; z-index: 2900; display: flex; justify-content: flex-end; background: rgba(15, 23, 42, .34); }
.entity-drawer { width: min(520px, 100%); height: 100%; overflow-y: auto; background: #fff; box-shadow: -18px 0 44px rgba(15, 23, 42, .18); }
.drawer-header { position: sticky; top: 0; z-index: 1; display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; padding: 22px 24px; border-bottom: 1px solid #eaecf0; background: #fff; }
.drawer-header h2 { margin: 0; font-size: 24px; color: #111827; }
.drawer-header p { margin: 6px 0 0; color: #667085; }
.icon-action { display: grid; place-items: center; width: 38px; height: 38px; min-height: 38px; border-radius: 7px; padding: 0; background: #f2f4f7; color: #344054; font-size: 26px; line-height: 1; }
.drawer-form { display: grid; gap: 16px; padding: 20px 24px 24px; }
.drawer-form label { display: grid; gap: 7px; color: #344054; font-weight: 700; }
.drawer-form input { width: 100%; }
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

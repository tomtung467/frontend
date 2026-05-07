<template>
  <MasterLayout show-footer>
    <main class="ops-page">
      <MasterPageHeader :title="t('inventory.title')">
        <template #actions>
          <button class="primary-action" :disabled="saving" @click="createIngredient">
            {{ saving ? t('menu.saving') : t('inventory.addIngredient') }}
          </button>
        </template>
      </MasterPageHeader>

      <section class="summary-strip">
        <div class="metric"><span>{{ t('inventory.totalItems') }}</span><strong>{{ inventory.length }}</strong></div>
        <div class="metric warning"><span>{{ t('inventory.lowStock') }}</span><strong>{{ lowStockCount }}</strong></div>
        <div class="metric"><span>{{ t('inventory.inventoryValue') }}</span><strong>{{ formatCurrency(totalValue) }}</strong></div>
      </section>

      <section class="toolbar">
        <input v-model="search" type="search" :placeholder="t('inventory.search')" />
        <select v-model="stockFilter">
          <option value="all">{{ t('inventory.allStock') }}</option>
          <option value="low">{{ t('inventory.lowOnly') }}</option>
        </select>
        <button class="ghost-action" @click="loadInventory">{{ t('customer.refresh') }}</button>
      </section>

      <form class="inline-form" @submit.prevent="createIngredient">
        <input v-model="form.name" required :placeholder="t('inventory.ingredientName')" />
        <input v-model="form.category" :placeholder="t('inventory.category')" />
        <input v-model.number="form.current_quantity" required type="number" step="0.01" :placeholder="t('inventory.quantity')" />
        <input v-model="form.unit" required :placeholder="t('inventory.unit')" />
        <input v-model.number="form.min_quantity" type="number" step="0.01" :placeholder="t('inventory.minimum')" />
        <input v-model.number="form.unit_cost" type="number" step="100" :placeholder="t('inventory.unitCost')" />
      </form>

      <p v-if="error" class="state error">{{ error }}</p>
      <p v-else-if="loading" class="state">{{ t('inventory.loading') }}</p>
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
              <th>{{ t('menu.delete') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredInventory" :key="item.id">
              <td>
                <strong>{{ item.name }}</strong>
                <small>{{ item.description || t('inventory.noNotes') }}</small>
              </td>
              <td>{{ item.category || t('inventory.general') }}</td>
              <td>{{ number(item.current_quantity ?? item.quantity) }} {{ item.unit }}</td>
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
                <button class="danger-action" :disabled="saving" @click="deleteIngredient(item)">{{ t('menu.delete') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import { inventoryService } from '@/services'
import { currentLanguage, t } from '@/languages'

const inventory = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const search = ref('')
const stockFilter = ref('all')
const adjustments = reactive({})

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
    error.value = err.message || t('inventory.failedLoad')
  } finally {
    loading.value = false
  }
}

async function createIngredient() {
  if (!form.name || !form.unit) return
  saving.value = true
  error.value = ''
  try {
    await inventoryService.createIngredient({ ...form })
    Object.assign(form, { name: '', category: '', current_quantity: 0, unit: '', min_quantity: 0, unit_cost: 0 })
    await loadInventory()
  } catch (err) {
    error.value = err.message || t('inventory.failedCreate')
  } finally {
    saving.value = false
  }
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
    error.value = err.message || t('inventory.failedUpdate')
  } finally {
    saving.value = false
  }
}

async function deleteIngredient(item) {
  saving.value = true
  error.value = ''
  try {
    await inventoryService.deleteIngredient(item.id)
    await loadInventory()
  } catch (err) {
    error.value = err.message || t('inventory.failedDelete')
  } finally {
    saving.value = false
  }
}

function isLowStock(item) {
  return Number(item.current_quantity ?? item.quantity ?? 0) <= Number(item.min_quantity ?? item.min_stock_level ?? 0)
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
.ops-page { padding: 24px; width: min(1320px, 100%); margin: 0 auto; }
.toolbar, .summary-strip, .inline-form { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.summary-strip { margin-bottom: 18px; }
.metric { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; min-width: 190px; }
.metric span { display: block; color: #667085; font-size: 13px; }
.metric strong { font-size: 22px; color: #111827; }
.metric.warning strong { color: #b42318; }
.toolbar, .inline-form { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 14px; }
input, select { min-height: 38px; border: 1px solid #d0d5dd; border-radius: 6px; padding: 0 10px; background: #fff; }
.toolbar input { min-width: 280px; flex: 1; }
.inline-form input { flex: 1 1 150px; }
button { border: 0; border-radius: 6px; min-height: 38px; padding: 0 14px; cursor: pointer; }
button:disabled { opacity: .55; cursor: not-allowed; }
.primary-action { background: #155eef; color: #fff; }
.ghost-action { background: #f2f4f7; color: #344054; }
.state { padding: 18px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; color: #475467; }
.state.error { color: #b42318; border-color: #fecdca; background: #fffbfa; }
.data-table { overflow-x: auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 13px 14px; border-bottom: 1px solid #eaecf0; text-align: left; vertical-align: middle; }
th { color: #667085; font-size: 12px; text-transform: uppercase; background: #f9fafb; }
td strong, td small { display: block; }
td small { color: #667085; margin-top: 3px; }
.badge { display: inline-flex; border-radius: 999px; padding: 4px 9px; font-size: 12px; background: #ecfdf3; color: #027a48; }
.badge.danger { background: #fef3f2; color: #b42318; }
.adjust { display: flex; gap: 8px; }
.adjust input { width: 90px; min-width: 90px; }
.adjust button { background: #344054; color: #fff; }
.danger-action { background: #b42318; color: #fff; }
@media (max-width: 720px) { .ops-page { padding: 16px; } .toolbar input { min-width: 100%; } }
</style>

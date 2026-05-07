<template>
  <main class="customer-menu">
    <section class="hero">
      <button class="logout-button" @click="logout">{{ t('customer.logout') }}</button>
      <div>
        <p class="eyebrow">{{ t('customer.restaurantMenu') }}</p>
        <h1>{{ t('customer.heroTitle') }}</h1>
      </div>
      <div class="table-picker">
        <div class="mode-switch">
          <button :class="{ active: visitMode === 'dine_in' }" @click="visitMode = 'dine_in'">{{ t('customer.eatNow') }}</button>
          <button :class="{ active: visitMode === 'reservation' }" @click="visitMode = 'reservation'">{{ t('customer.reserve') }}</button>
        </div>
        <label>{{ t('customer.table') }}</label>
        <select v-model="selectedTableId" @change="selectTable">
          <option value="">{{ t('customer.selectTable') }}</option>
          <option
            v-for="table in tables"
            :key="table.id"
            :value="table.id"
            :disabled="visitMode === 'reservation' && table.status !== 'empty'"
          >
            {{ tableOptionLabel(table) }}
          </option>
        </select>
      </div>
    </section>

    <section class="customer-shell">
      <aside class="reservation-panel">
        <h2>{{ visitMode === 'dine_in' ? t('customer.diningAtRestaurant') : t('customer.reserveTable') }}</h2>
        <p class="panel-copy">
          {{ visitMode === 'dine_in' ? t('customer.dineInCopy') : t('customer.reserveCopy') }}
        </p>
        <form v-if="visitMode === 'reservation'" @submit.prevent="reserveTable">
          <input v-model="reservation.customer_name" required :placeholder="t('customer.yourName')" />
          <input v-model="reservation.customer_phone" required :placeholder="t('customer.phone')" />
          <input v-model="reservation.customer_email" type="email" :placeholder="t('customer.email')" />
          <input v-model="reservation.reservation_time" required type="datetime-local" />
          <input v-model.number="reservation.number_of_guests" required type="number" min="1" :placeholder="t('customer.guests')" />
          <textarea v-model="reservation.special_requests" :placeholder="t('customer.specialRequests')"></textarea>
          <button :disabled="reservationSaving">{{ reservationSaving ? t('customer.saving') : t('customer.bookTable') }}</button>
        </form>
        <div v-else class="walk-in-card">
          <strong>{{ selectedTableId ? `${t('customer.table')} ${selectedTableId}` : t('customer.noTableSelected') }}</strong>
          <span>{{ selectedTableId ? t('customer.readyForOrdering') : t('customer.chooseTable') }}</span>
        </div>
        <p v-if="reservationMessage" class="message">{{ reservationMessage }}</p>
      </aside>

      <section class="menu-content">
        <div class="categories-filter">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="selectCategory(category)"
            :class="{ active: selectedCategory?.id === category.id }"
          >
            {{ category.name }}
          </button>
        </div>

        <p v-if="error" class="state error">{{ error }}</p>
        <p v-else-if="loading" class="state">{{ t('customer.loadingMenu') }}</p>
        <div v-else class="foods-grid">
          <article v-for="food in foods" :key="food.id" class="food-card">
            <img :src="dishImageUrl(food)" :alt="food.name || food.food_name" />
            <div class="food-info">
              <div>
                <h3>{{ food.name || food.food_name }}</h3>
                <p>{{ food.description || t('customer.freshPrepared') }}</p>
              </div>
              <div class="food-footer">
                <strong>{{ formatPrice(food.price) }}</strong>
                <button @click="addToCart(food)">{{ t('customer.add') }}</button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>

    <div class="floating-cart">
      <div>
        <strong>{{ t('customer.itemCount', { count: cartStore.itemCount }) }}</strong>
        <span>{{ formatPrice(cartStore.totalPrice) }}</span>
      </div>
      <router-link :to="cartPath">{{ t('customer.viewCart') }}</router-link>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import api from '@/api'
import { useMenuStore } from '@/stores/useMenuStore'
import { useCartStore } from '@/stores/useCartStore'
import { useTableStore } from '@/stores/useTableStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useRoute, useRouter } from 'vue-router'
import { resolveAssetUrl } from '@/utils/assetUrl'
import { currentLanguage, t } from '@/languages'

const menuStore = useMenuStore()
const cartStore = useCartStore()
const tableStore = useTableStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const categories = ref([])
const foods = ref([])
const tables = computed(() => tableStore.tables)
const selectedCategory = ref(null)
const selectedTableId = ref(route.params.tableId || cartStore.tableId || '')
const visitMode = ref('dine_in')
const loading = ref(false)
const error = ref('')
const reservationSaving = ref(false)
const reservationMessage = ref('')
let unsubscribeTables

const reservation = reactive({
  table_id: '',
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  reservation_time: '',
  number_of_guests: 2,
  special_requests: '',
})

const cartPath = computed(() => selectedTableId.value ? `/cart/table/${selectedTableId.value}` : '/cart')

onMounted(async () => {
  loading.value = true
  try {
    if (selectedTableId.value) cartStore.setTable(selectedTableId.value)
    await Promise.all([menuStore.fetchCategories(), tableStore.fetchTables()])
    unsubscribeTables = tableStore.subscribeToTables()
    categories.value = menuStore.categories
    if (categories.value.length > 0) {
      await selectCategory(categories.value[0])
    }
  } catch (err) {
    error.value = t('customer.failedMenu')
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  unsubscribeTables?.()
})

async function selectCategory(category) {
  loading.value = true
  error.value = ''
  try {
    await menuStore.fetchCategoryFoods(category.id)
    foods.value = menuStore.foods
    selectedCategory.value = category
  } catch (err) {
    error.value = t('customer.failedDishes')
  } finally {
    loading.value = false
  }
}

function addToCart(food) {
  if (!selectedTableId.value) {
    error.value = t('customer.selectTableFirst')
    return
  }
  cartStore.setTable(selectedTableId.value)
  cartStore.addItem(food)
}

function selectTable() {
  cartStore.setTable(selectedTableId.value)
  if (selectedTableId.value && route.params.tableId !== String(selectedTableId.value)) {
    router.replace(`/menu/table/${selectedTableId.value}`)
  }
}

async function logout() {
  await authStore.logout()
  router.push('/login')
}

async function reserveTable() {
  const tableId = reservation.table_id || selectedTableId.value
  if (!tableId) {
    reservationMessage.value = t('customer.selectTableFirstReserve')
    return
  }
  const table = tables.value.find((item) => Number(item.id) === Number(tableId))
  if (table?.status !== 'empty') {
    reservationMessage.value = t('customer.onlyEmptyReserved')
    return
  }
  reservationSaving.value = true
  reservationMessage.value = ''
  try {
    const reservationTime = reservation.reservation_time.replace('T', ' ') + ':00'
    await api.post('/reservations', {
      ...reservation,
      table_id: tableId,
      reservation_time: reservationTime,
      pre_order_items: cartStore.items,
    })
    reservationMessage.value = t('customer.reservationSaved')
    Object.assign(reservation, {
      table_id: '',
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      reservation_time: '',
      number_of_guests: 2,
      special_requests: '',
    })
  } catch (err) {
    reservationMessage.value = err.response?.data?.message || t('customer.reservationFailed')
  } finally {
    reservationSaving.value = false
  }
}

function fallbackImage(food) {
  const label = encodeURIComponent(food.name || food.food_name || 'Dish')
  return `https://placehold.co/640x420/f3f4f6/344054?text=${label}`
}

function dishImageUrl(food) {
  return food.image_url ? resolveAssetUrl(food.image_url) : fallbackImage(food)
}

function tableOptionLabel(table) {
  const label = t('customer.tableOption', {
    table: table.table_number || table.id,
    capacity: table.capacity || 4,
  })
  return table.status !== 'empty' ? `${label} - ${t('customer.tableBusy')}` : label
}

function formatPrice(price) {
  const locale = currentLanguage.value === 'en' ? 'en-US' : 'vi-VN'
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND' }).format(Number(price || 0))
}
</script>

<style scoped>
.customer-menu { min-height: 100vh; background: #f7f4ee; color: #1f2937; padding-bottom: 92px; }
.hero { min-height: 260px; background: linear-gradient(rgba(18, 26, 37, .58), rgba(18, 26, 37, .58)), url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80') center/cover; color: #fff; padding: 42px clamp(18px, 5vw, 72px); display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; position: relative; }
.logout-button { position: absolute; top: 18px; right: 18px; min-height: 38px; border: 1px solid rgba(255,255,255,.45); border-radius: 7px; background: rgba(17,24,39,.55); color: #fff; padding: 0 14px; cursor: pointer; font-weight: 800; }
.eyebrow { margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0; color: rgba(255,255,255,.8); }
h1 { margin: 0; max-width: 760px; font-size: clamp(34px, 5vw, 64px); line-height: 1.02; }
.table-picker { background: rgba(255,255,255,.95); color: #111827; border-radius: 8px; padding: 14px; min-width: 260px; }
.mode-switch { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }
.mode-switch button { min-height: 36px; border: 1px solid #d0d5dd; border-radius: 7px; background: #fff; cursor: pointer; font-weight: 700; }
.mode-switch button.active { background: #111827; color: #fff; border-color: #111827; }
.table-picker label { display: block; font-size: 12px; color: #667085; margin-bottom: 6px; }
select, input, textarea { width: 100%; min-height: 40px; border: 1px solid #d0d5dd; border-radius: 7px; padding: 0 10px; background: #fff; }
textarea { min-height: 76px; padding-top: 10px; resize: vertical; }
.customer-shell { display: grid; grid-template-columns: 310px 1fr; gap: 22px; width: min(1360px, calc(100% - 36px)); margin: -34px auto 0; position: relative; }
.reservation-panel, .food-card, .state { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 12px 34px rgba(16,24,40,.08); }
.reservation-panel { padding: 18px; align-self: start; }
.reservation-panel h2 { margin: 0 0 14px; font-size: 20px; }
.panel-copy { color: #667085; margin: -4px 0 14px; font-size: 14px; line-height: 1.45; }
.reservation-panel form { display: grid; gap: 10px; }
.walk-in-card { display: grid; gap: 4px; padding: 14px; border: 1px dashed #d0d5dd; border-radius: 8px; background: #f9fafb; }
.walk-in-card span { color: #667085; }
.reservation-panel button, .food-footer button, .floating-cart a { min-height: 40px; border: 0; border-radius: 7px; background: #c2410c; color: #fff; padding: 0 14px; font-weight: 800; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
.message { margin: 12px 0 0; color: #475467; font-size: 13px; }
.menu-content { min-width: 0; }
.categories-filter { display: flex; gap: 10px; overflow-x: auto; padding: 0 0 14px; }
.categories-filter button { min-height: 40px; border: 1px solid #e5e7eb; background: #fff; border-radius: 999px; padding: 0 16px; white-space: nowrap; cursor: pointer; color: #344054; }
.categories-filter button.active { background: #1f2937; color: #fff; border-color: #1f2937; }
.foods-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 18px; }
.food-card { overflow: hidden; display: flex; flex-direction: column; min-height: 390px; }
.food-card img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; background: #f2f4f7; }
.food-info { padding: 15px; display: flex; flex-direction: column; justify-content: space-between; gap: 16px; flex: 1; }
.food-info h3 { margin: 0 0 8px; font-size: 18px; }
.food-info p { margin: 0; color: #667085; font-size: 14px; line-height: 1.45; }
.food-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.food-footer strong { color: #9a3412; }
.state { padding: 18px; color: #475467; }
.state.error { color: #b42318; border-color: #fecdca; background: #fffbfa; }
.floating-cart { position: fixed; left: 50%; bottom: 18px; transform: translateX(-50%); width: min(520px, calc(100% - 28px)); background: #111827; color: #fff; border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 14px 42px rgba(16,24,40,.3); z-index: 50; }
.floating-cart span { display: block; color: rgba(255,255,255,.72); font-size: 13px; margin-top: 2px; }
.floating-cart a { background: #fff; color: #111827; }
@media (max-width: 900px) {
  .hero { align-items: flex-start; flex-direction: column; }
  .table-picker { width: 100%; }
  .customer-shell { grid-template-columns: 1fr; margin-top: 18px; }
}
</style>

<template>
  <main class="customer-menu">
    <header class="customer-topbar">
      <button class="brand-block" @click="router.push('/menu')">
        <span class="brand-mark"><v-icon size="22">mdi-food-fork-drink</v-icon></span>
        <span>
          <strong>Nhà Hàng Phương Nam</strong>
          <small>{{ selectedTableId ? `${t('customer.table')} ${selectedTableId}` : t('customer.selectTable') }}</small>
        </span>
      </button>

      <div class="topbar-center">MENU</div>

      <div class="topbar-actions">
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
        <button class="logout-button" :title="t('customer.logout')" @click="logout">
          <v-icon size="21">mdi-logout</v-icon>
          <span>{{ t('customer.logout') }}</span>
        </button>
        <button class="cart-toggle" @click="cartPanelOpen = true">
          <v-icon size="22">mdi-cart-outline</v-icon>
          <span v-if="cartStore.itemCount">{{ cartStore.itemCount }}</span>
        </button>
      </div>
    </header>

    <section class="customer-layout">
      <aside class="category-rail">
        <h2>{{ t('menu.category') }}</h2>
        <button :class="{ active: !selectedCategory }" @click="selectCategory(null)">
          {{ t('menu.allCategories') }}
        </button>
        <button
          v-for="category in categories"
          :key="category.id"
          :class="{ active: selectedCategory?.id === category.id }"
          @click="selectCategory(category)"
        >
          {{ category.name }}
        </button>
      </aside>

      <section class="menu-stage">
        <div class="menu-search">
          <v-icon size="21">mdi-magnify</v-icon>
          <input v-model="search" :placeholder="t('menu.searchDishes')" />
        </div>

        <div class="mode-row">
          <div class="mode-switch">
            <button :class="{ active: visitMode === 'dine_in' }" @click="visitMode = 'dine_in'">{{ t('customer.eatNow') }}</button>
            <button :class="{ active: visitMode === 'reservation' }" @click="visitMode = 'reservation'">{{ t('customer.reserve') }}</button>
          </div>
          <button v-if="visitMode === 'reservation'" class="reservation-toggle" @click="reservationOpen = !reservationOpen">
            {{ t('customer.reserveTable') }}
          </button>
        </div>

        <form v-if="visitMode === 'reservation' && reservationOpen" class="reservation-form" @submit.prevent="reserveTable">
          <input v-model="reservation.customer_name" required :placeholder="t('customer.yourName')" />
          <input v-model="reservation.customer_phone" required :placeholder="t('customer.phone')" />
          <input v-model="reservation.customer_email" type="email" :placeholder="t('customer.email')" />
          <input v-model="reservation.reservation_time" required type="datetime-local" />
          <input v-model.number="reservation.number_of_guests" required type="number" min="1" :placeholder="t('customer.guests')" />
          <textarea v-model="reservation.special_requests" :placeholder="t('customer.specialRequests')"></textarea>
          <button :disabled="reservationSaving">{{ reservationSaving ? t('customer.saving') : t('customer.bookTable') }}</button>
        </form>
        <p v-if="reservationMessage" class="message">{{ reservationMessage }}</p>

        <p v-if="error" class="state error">{{ error }}</p>
        <p v-else-if="loading" class="state">{{ t('customer.loadingMenu') }}</p>
        <p v-else-if="filteredFoods.length === 0" class="state">{{ t('menu.noDishes') }}</p>

        <div v-else class="foods-grid">
          <article v-for="food in filteredFoods" :key="food.id" class="food-card">
            <img :src="dishImageUrl(food)" :alt="food.name || food.food_name" />
            <div class="food-info">
              <h3>{{ food.name || food.food_name }}</h3>
              <p>{{ food.description || t('customer.freshPrepared') }}</p>
              <div class="food-footer">
                <strong>{{ formatPrice(food.price) }}</strong>
                <div v-if="cartQuantity(food.id)" class="quantity-pill">
                  <button @click="updateCartQuantity(food.id, cartQuantity(food.id) - 1)">−</button>
                  <span>{{ cartQuantity(food.id) }}</span>
                  <button @click="updateCartQuantity(food.id, cartQuantity(food.id) + 1)">+</button>
                </div>
                <button v-else class="add-button" @click="addToCart(food)">+</button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <button
        v-if="cartPanelOpen"
        class="cart-backdrop"
        type="button"
        aria-label="Dong gio hang"
        @click="cartPanelOpen = false"
      ></button>

      <aside class="cart-panel" :class="{ open: cartPanelOpen }">
        <header>
          <h2>{{ selectedTableId ? t('customer.currentBillTable', { table: selectedTableId }) : t('customer.currentBill') }}</h2>
          <button class="panel-close" @click="cartPanelOpen = false">×</button>
        </header>
        <div v-if="invoiceLoading" class="empty-cart">Đang tải hóa đơn...</div>
        <div v-else-if="activeInvoiceItems.length || cartStore.items.length" class="cart-list">
          <section v-if="activeInvoiceItems.length" class="invoice-section">
            <h3>Món đã gọi</h3>
            <article v-for="item in activeInvoiceItems" :key="`invoice-${item.id}`" class="cart-line invoice-line">
              <div>
                <strong>{{ invoiceItemName(item) }}</strong>
                <div class="cart-meta">
                  <span>x{{ item.quantity }}</span>
                  <span>{{ statusLabel(item.status, activeInvoice?.status) }}</span>
                </div>
              </div>
              <button
                v-if="canCancelInvoiceItem(item)"
                class="remove-line"
                title="Hủy món"
                @click="cancelInvoiceItem(item)"
              >
                Ã—
              </button>
              <b>{{ formatPrice(invoiceItemTotal(item)) }}</b>
            </article>
          </section>

          <section v-if="cartStore.items.length" class="invoice-section">
            <h3>Món mới chọn</h3>
          <article v-for="item in cartStore.items" :key="item.food_id" class="cart-line">
            <div>
              <strong>{{ item.food_name }}</strong>
              <div class="cart-controls">
                <button @click="updateCartQuantity(item.food_id, item.quantity - 1)">−</button>
                <span>{{ item.quantity }}</span>
                <button @click="updateCartQuantity(item.food_id, item.quantity + 1)">+</button>
              </div>
            </div>
            <button class="remove-line" @click="cartStore.removeItem(item.food_id)">×</button>
            <b>{{ formatPrice(item.price * item.quantity) }}</b>
          </article>
          </section>
        </div>
        <p v-else class="empty-cart">Hóa đơn hiện chưa có món.</p>
        <p v-if="invoiceError" class="message">{{ invoiceError }}</p>
        <footer>
          <div>
            <span>{{ t('customer.total') }}:</span>
            <strong>{{ formatPrice(invoiceTotal) }}</strong>
          </div>
          <button v-if="cartStore.items.length" @click="checkout">{{ t('customer.sendOrder') }}</button>
          <button v-else :disabled="!activeInvoice || activeInvoice.payment_requested_at" @click="requestPayment">
            {{ activeInvoice?.payment_requested_at ? t('customer.paymentAccepted') : t('customer.requestPayment') }}
          </button>
        </footer>
      </aside>
    </section>

    <button class="floating-cart" @click="cartPanelOpen = true">
      <v-icon size="24">mdi-cart-outline</v-icon>
      <span>{{ cartStore.itemCount }}</span>
    </button>
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
import { showPopup } from '@/composables/usePopup'
import { currentLanguage, t } from '@/languages'

const menuStore = useMenuStore()
const cartStore = useCartStore()
const tableStore = useTableStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const categories = ref([])
const foods = ref([])
const allFoods = ref([])
const tables = computed(() => tableStore.tables)
const selectedCategory = ref(null)
const selectedTableId = ref(route.params.tableId || cartStore.tableId || '')
const visitMode = ref('dine_in')
const search = ref('')
const cartPanelOpen = ref(false)
const reservationOpen = ref(false)
const loading = ref(false)
const error = ref('')
const activeInvoice = ref(null)
const invoiceLoading = ref(false)
const invoiceError = ref('')
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

const filteredFoods = computed(() => {
  const query = search.value.trim().toLowerCase()
  const categoryId = selectedCategory.value?.id
  const source = categoryId
    ? allFoods.value.filter((food) => Number(food.category_id || food.category?.id) === Number(categoryId))
    : allFoods.value

  return source.filter((food) => {
    const haystack = `${food.name || food.food_name || ''} ${food.description || ''}`.toLowerCase()
    return !query || haystack.includes(query)
  })
})

const activeInvoiceItems = computed(() =>
  (activeInvoice.value ? orderItems(activeInvoice.value) : [])
    .filter((item) => item.status !== 'cancelled')
)

const activeInvoiceTotal = computed(() =>
  activeInvoiceItems.value.reduce((total, item) => total + invoiceItemTotal(item), 0)
)

const invoiceTotal = computed(() => activeInvoiceTotal.value + cartStore.totalPrice)

onMounted(async () => {
  loading.value = true
  try {
    if (selectedTableId.value) cartStore.setTable(selectedTableId.value)
    await Promise.all([menuStore.fetchCategories(), tableStore.fetchTables()])
    unsubscribeTables = tableStore.subscribeToTables()
    categories.value = menuStore.categories
    await loadAllFoods()
    await loadActiveInvoice()
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
  selectedCategory.value = category
  error.value = ''
}

async function loadAllFoods() {
  loading.value = true
  error.value = ''
  try {
    const payload = await menuStore.fetchAllMenus()
    allFoods.value = normalizeFoods(payload)
    foods.value = allFoods.value
    selectedCategory.value = null
  } catch (err) {
    error.value = t('customer.failedDishes')
  } finally {
    loading.value = false
  }
}

function normalizeFoods(payload) {
  const source = payload?.data || payload || []
  if (Array.isArray(source)) {
    return source.flatMap((entry) => {
      if (Array.isArray(entry.foods)) {
        return entry.foods.map((food) => ({
          ...food,
          category_id: food.category_id || entry.id,
          category: food.category || { id: entry.id, name: entry.name },
        }))
      }
      return entry
    })
  }
  if (Array.isArray(source.foods)) return source.foods
  if (Array.isArray(source.categories)) {
    return source.categories.flatMap((category) =>
      (category.foods || []).map((food) => ({
        ...food,
        category_id: food.category_id || category.id,
        category: food.category || { id: category.id, name: category.name },
      }))
    )
  }
  return []
}

function addToCart(food) {
  if (!selectedTableId.value) {
    error.value = t('customer.selectTableFirst')
    return
  }
  cartStore.setTable(selectedTableId.value)
  cartStore.addItem(food)
}

async function selectTable() {
  cartStore.setTable(selectedTableId.value)
  if (selectedTableId.value && route.params.tableId !== String(selectedTableId.value)) {
    router.replace(`/menu/table/${selectedTableId.value}`)
  }
  await loadActiveInvoice()
}

function cartQuantity(foodId) {
  return cartStore.items.find((item) => Number(item.food_id) === Number(foodId))?.quantity || 0
}

function updateCartQuantity(foodId, quantity) {
  cartStore.updateQuantity(foodId, quantity)
}

async function checkout() {
  if (!selectedTableId.value) {
    error.value = t('customer.selectTableFirst')
    return
  }
  try {
    await cartStore.checkout('cash')
    await loadActiveInvoice()
    showPopup({ type: 'success', title: t('common.saved'), message: t('customer.orderSent') })
    cartPanelOpen.value = true
  } catch (err) {
    showPopup({ type: 'danger', title: t('customer.checkoutFailed'), message: err.message })
  }
}

async function loadActiveInvoice() {
  activeInvoice.value = null
  invoiceError.value = ''
  if (!selectedTableId.value) return

  invoiceLoading.value = true
  try {
    const response = await api.get('/orders', {
      params: {
        table_id: selectedTableId.value,
        per_page: 20,
      },
    })
    const orders = response.data?.data?.data || response.data?.data || response.data || []
    activeInvoice.value = orders.find((order) => !['paid', 'cancelled'].includes(order.status)) || null
  } catch (err) {
    invoiceError.value = err.response?.data?.message || 'Không thể tải hóa đơn hiện tại.'
  } finally {
    invoiceLoading.value = false
  }
}

function orderItems(order) {
  return order.items || order.orderItems || order.order_items || []
}

function invoiceItemName(item) {
  return item.food?.name || item.food_name || item.name || `${t('menu.title')} #${item.food_id}`
}

function invoiceItemTotal(item) {
  return Number(item.total_price || item.price * item.quantity || 0)
}

function canCancelInvoiceItem(item) {
  return ['pending', 'confirmed'].includes(item.status || 'pending')
    && !['paid', 'cancelled', 'served'].includes(activeInvoice.value?.status)
}

async function cancelInvoiceItem(item) {
  if (!activeInvoice.value || !canCancelInvoiceItem(item)) return

  try {
    await api.put(`/orders/${activeInvoice.value.id}/items/${item.id}/status`, { status: 'cancelled' })
    await loadActiveInvoice()
  } catch (err) {
    invoiceError.value = err.response?.data?.message || 'Không thể hủy món đã bắt đầu nấu.'
  }
}

async function requestPayment() {
  if (!activeInvoice.value) return

  try {
    await api.post(`/orders/${activeInvoice.value.id}/request-payment`)
    await loadActiveInvoice()
  } catch (err) {
    invoiceError.value = err.response?.data?.message || t('customer.reservationFailed')
  }
}

function statusLabel(status, orderStatus = '') {
  if (!status && orderStatus === 'in_progress') {
    return 'Đang nấu'
  }

  if (!status && orderStatus === 'ready') {
    return 'Đã xong'
  }

  const labels = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã nhận',
    preparing: 'Đang nấu',
    ready: 'Đã xong',
    served: 'Đã phục vụ',
    paid: 'Đã thanh toán',
    cancelled: 'Đã hủy',
  }

  return labels[status] || labels.pending
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
.customer-menu { min-height: 100vh; background: #f6f6f4; color: #151515; }
.customer-topbar { position: sticky; top: 0; z-index: 100; display: grid; grid-template-columns: minmax(220px, 1fr) auto minmax(220px, 1fr); align-items: center; gap: 16px; min-height: 58px; padding: 8px 18px; border-bottom: 1px solid #d7d7d7; background: #fff; box-shadow: 0 2px 10px rgba(15, 23, 42, .06); }
.brand-block { display: inline-flex; align-items: center; gap: 9px; min-width: 0; border: 0; background: transparent; text-align: left; cursor: pointer; }
.brand-mark { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 7px; background: #ff5a00; color: #fff; }
.brand-block strong, .brand-block small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.brand-block strong { font-size: 15px; }
.brand-block small { color: #667085; font-size: 12px; }
.topbar-center { font-weight: 800; font-size: 18px; letter-spacing: .02em; }
.topbar-actions { display: flex; justify-content: flex-end; align-items: center; gap: 10px; min-width: 0; }
.topbar-actions select { width: 190px; min-height: 36px; border: 1px solid #d0d5dd; border-radius: 7px; background: #fff; padding: 0 9px; }
.logout-button { display: inline-flex; align-items: center; gap: 6px; min-height: 36px; border: 1px solid #e5e7eb; border-radius: 999px; background: #fff; color: #344054; padding: 0 12px; cursor: pointer; font-weight: 800; }
.logout-button:hover { border-color: #ff5a00; color: #ff5a00; background: #fff7ed; }
.cart-toggle { position: relative; display: grid; place-items: center; width: 38px; height: 38px; border: 0; border-radius: 999px; background: #fff4ed; color: #ff5a00; cursor: pointer; }
.cart-toggle span, .floating-cart span { position: absolute; top: -3px; right: -3px; display: grid; place-items: center; min-width: 18px; height: 18px; border-radius: 999px; background: #d92d20; color: #fff; font-size: 11px; font-weight: 900; }
.customer-layout { display: grid; grid-template-columns: 138px minmax(0, 1fr); gap: 18px; width: min(1420px, calc(100% - 34px)); margin: 0 auto; }
.category-rail { position: sticky; top: 58px; align-self: start; height: calc(100vh - 58px); padding-top: 12px; border-right: 1px solid #e5e7eb; background: #fff; }
.category-rail h2 { margin: 0 0 8px; color: #667085; font-size: 13px; font-weight: 800; text-transform: uppercase; }
.category-rail button { display: block; width: calc(100% - 8px); min-height: 38px; margin-bottom: 4px; border: 0; border-radius: 7px; background: transparent; color: #475467; text-align: left; padding: 0 10px; cursor: pointer; }
.category-rail button.active { background: #fff3e8; color: #ff5a00; font-weight: 900; }
.menu-stage { min-width: 0; padding: 16px 0 44px; }
.menu-search { display: flex; align-items: center; gap: 8px; height: 42px; margin-bottom: 14px; border: 1px solid #d0d5dd; border-radius: 8px; background: #fff; padding: 0 12px; color: #98a2b3; }
.menu-search input { width: 100%; border: 0; outline: 0; font-size: 14px; background: transparent; }
.mode-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
.mode-switch { display: inline-grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 3px; border: 1px solid #e5e7eb; border-radius: 999px; background: #fff; }
.mode-switch button, .reservation-toggle { min-height: 34px; border: 0; border-radius: 999px; padding: 0 14px; background: transparent; cursor: pointer; font-weight: 800; }
.mode-switch button.active, .reservation-toggle { background: #ff5a00; color: #fff; }
.reservation-form { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; }
.reservation-form input, .reservation-form textarea { min-height: 38px; border: 1px solid #d0d5dd; border-radius: 7px; padding: 0 10px; }
.reservation-form textarea { grid-column: span 2; padding-top: 9px; resize: vertical; }
.reservation-form button { border: 0; border-radius: 7px; background: #ff5a00; color: #fff; font-weight: 900; cursor: pointer; }
.message { margin: 0 0 12px; color: #475467; font-size: 13px; }
.foods-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }
.food-card { overflow: hidden; display: flex; flex-direction: column; min-height: 294px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; }
.food-card img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; background: #f2f4f7; }
.food-info { display: grid; gap: 8px; padding: 12px; }
.food-info h3 { margin: 0; font-size: 15px; font-weight: 900; }
.food-info p { min-height: 38px; margin: 0; color: #667085; font-size: 13px; line-height: 1.45; }
.food-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 2px; }
.food-footer strong { color: #ff5a00; font-size: 14px; }
.add-button, .quantity-pill button { display: grid; place-items: center; width: 28px; height: 28px; border: 0; border-radius: 8px; background: #ff5a00; color: #fff; cursor: pointer; font-size: 20px; font-weight: 900; }
.quantity-pill { display: inline-grid; grid-template-columns: 28px 28px 28px; align-items: center; gap: 4px; }
.quantity-pill span { text-align: center; font-weight: 900; color: #ff5a00; }
.state { padding: 18px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; color: #475467; }
.state.error { color: #b42318; border-color: #fecdca; background: #fffbfa; }
.cart-backdrop { position: fixed; inset: 0; z-index: 2300; border: 0; background: rgba(15, 23, 42, .42); cursor: default; }
.cart-panel { position: fixed; inset: 0 0 0 auto; z-index: 2310; display: flex; flex-direction: column; width: min(380px, 92vw); height: 100vh; min-width: 0; border-left: 1px solid #e5e7eb; background: #fff; box-shadow: -22px 0 50px rgba(15, 23, 42, .22); transform: translateX(110%); opacity: 0; pointer-events: none; transition: transform .2s ease, opacity .2s ease; }
.cart-panel.open { transform: none; opacity: 1; pointer-events: auto; }
.cart-panel header { display: flex; justify-content: space-between; align-items: center; min-height: 58px; padding: 0 14px; }
.cart-panel h2 { margin: 0; font-size: 16px; }
.panel-close { display: block; border: 0; background: transparent; color: #667085; font-size: 26px; cursor: pointer; }
.cart-list { flex: 1; overflow-y: auto; padding: 8px 10px; }
.invoice-section { display: grid; gap: 6px; margin-bottom: 14px; }
.invoice-section h3 { margin: 4px 4px 2px; color: #344054; font-size: 13px; font-weight: 900; }
.cart-line { position: relative; display: grid; grid-template-columns: 1fr auto; gap: 8px; padding: 12px 4px; border-bottom: 1px solid #eaecf0; }
.cart-line strong { display: block; margin-bottom: 8px; font-size: 14px; }
.cart-line b { grid-column: 1 / -1; color: #ff5a00; text-align: right; font-size: 13px; }
.cart-meta { display: inline-flex; align-items: center; gap: 8px; color: #667085; font-size: 12px; font-weight: 800; }
.cart-controls { display: inline-flex; align-items: center; gap: 7px; }
.cart-controls button { display: grid; place-items: center; width: 22px; height: 22px; padding: 0; border: 1px solid #d0d5dd; border-radius: 999px; background: #fff; cursor: pointer; line-height: 1; font-size: 14px; font-weight: 800; }
.remove-line { display: grid; place-items: center; width: 28px; height: 28px; padding: 0; border: 0; background: transparent; color: #f04438; cursor: pointer; font-size: 0; line-height: 1; }
.remove-line::before { content: "x"; font-size: 16px; font-weight: 900; }
.empty-cart { flex: 1; margin: 0; padding: 18px 14px; color: #667085; }
.cart-panel footer { margin-top: auto; padding: 14px; border-top: 1px solid #e5e7eb; }
.cart-panel footer div { display: flex; justify-content: space-between; margin-bottom: 12px; font-weight: 900; }
.cart-panel footer strong { color: #ff5a00; }
.cart-panel footer button { width: 100%; min-height: 42px; border: 0; border-radius: 7px; background: #ff5a00; color: #fff; font-weight: 900; cursor: pointer; }
.cart-panel footer button:disabled { opacity: .55; cursor: not-allowed; }
.floating-cart { display: none; }
@media (max-width: 1100px) {
  .customer-layout { grid-template-columns: 124px minmax(0, 1fr); }
  .cart-panel { width: min(340px, 92vw); }
  .floating-cart { position: fixed; right: 18px; bottom: 18px; z-index: 2100; display: grid; place-items: center; width: 54px; height: 54px; border: 0; border-radius: 999px; background: #ff5a00; color: #fff; box-shadow: 0 14px 34px rgba(15, 23, 42, .24); }
}
@media (max-width: 760px) {
  .customer-topbar { grid-template-columns: 1fr auto; }
  .topbar-center { display: none; }
  .topbar-actions select { display: none; }
  .logout-button span { display: none; }
  .logout-button { width: 38px; padding: 0; justify-content: center; }
  .customer-layout { display: block; width: min(100% - 24px, 680px); }
  .category-rail { position: static; height: auto; display: flex; gap: 8px; overflow-x: auto; margin: 10px 0 0; padding: 8px 0 10px; border-right: 0; background: transparent; }
  .category-rail h2 { display: none; }
  .category-rail button { flex: 0 0 auto; width: auto; min-height: 36px; margin: 0; padding: 0 13px; border: 1px solid #e5e7eb; border-radius: 999px; background: #fff; white-space: nowrap; }
  .foods-grid { grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr)); }
  .reservation-form { grid-template-columns: 1fr; }
  .reservation-form textarea { grid-column: auto; }
}
@media (max-width: 520px) {
  .customer-topbar { padding: 8px 10px; }
  .brand-block strong { max-width: 180px; }
  .mode-row { align-items: stretch; flex-direction: column; }
  .mode-switch { width: 100%; }
}
</style>

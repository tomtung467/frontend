<template>
  <div class="cart-view">
    <div class="container">
      <header class="customer-topbar">
        <button @click="continueShopping" class="btn-continue compact">{{ t('customer.backToMenu') }}</button>
        <h1>{{ tableId ? t('customer.currentBillTable', { table: tableId }) : t('customer.currentBill') }}</h1>
        <button @click="logout" class="btn-logout">{{ t('customer.logout') }}</button>
      </header>

      <div v-if="cartStore.items.length > 0" class="cart-content">
        <div class="cart-items">
          <div v-for="item in cartStore.items" :key="item.food_id" class="cart-item">
            <div class="item-info">
              <h3>{{ item.food_name }}</h3>
              <p>{{ t('customer.price') }}: {{ formatPrice(item.price) }}</p>
            </div>
            <div class="item-quantity">
              <button @click="decreaseQuantity(item.food_id)">-</button>
              <input v-model.number="item.quantity" type="number" min="1" />
              <button @click="increaseQuantity(item.food_id)">+</button>
            </div>
            <div class="item-total">
              {{ formatPrice(item.price * item.quantity) }}
            </div>
            <button @click="removeItem(item.food_id)" class="btn-remove">
              {{ t('customer.remove') }}
            </button>
          </div>
        </div>

        <div class="cart-summary">
          <h2>{{ t('customer.orderSummary') }}</h2>
          <div class="summary-item">
            <span>{{ t('kitchen.items') }}:</span>
            <span>{{ cartStore.itemCount }}</span>
          </div>
          <div class="summary-item">
            <span>{{ t('customer.subtotal') }}:</span>
            <span>{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>
          <div class="summary-item">
            <span>{{ t('customer.tax') }}:</span>
            <span>{{ formatPrice(cartStore.totalPrice * 0.1) }}</span>
          </div>
          <div class="summary-item total">
            <span>{{ t('customer.total') }}:</span>
            <span>{{ formatPrice(cartStore.totalPrice * 1.1) }}</span>
          </div>

          <button @click="checkout" class="btn-checkout">
            {{ t('customer.sendOrder') }}
          </button>
          <button @click="continueShopping" class="btn-continue">
            {{ t('customer.continueShopping') }}
          </button>
        </div>
      </div>

      <div v-else class="empty-cart">
        <h2>{{ t('customer.emptyCart') }}</h2>
        <router-link :to="tableId ? `/menu/table/${tableId}` : '/menu'" class="btn-back">
          {{ t('customer.backToMenu') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/useCartStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { showPopup } from '@/composables/usePopup'
import { currentLanguage, t } from '@/languages'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()
const tableId = computed(() => route.params.tableId || cartStore.tableId)

onMounted(() => {
  if (route.params.tableId) cartStore.setTable(route.params.tableId)
})

function increaseQuantity(foodId) {
  const item = cartStore.items.find(i => i.food_id === foodId)
  if (item) {
    item.quantity++
  }
}

function decreaseQuantity(foodId) {
  const item = cartStore.items.find(i => i.food_id === foodId)
  if (item && item.quantity > 1) {
    item.quantity--
  }
}

function removeItem(foodId) {
  cartStore.removeItem(foodId)
}

function continueShopping() {
  router.push(tableId.value ? `/menu/table/${tableId.value}` : '/menu')
}

async function checkout() {
  try {
    await cartStore.checkout('card')
    showPopup({ type: 'success', title: t('common.saved'), message: t('customer.orderSent') })
    router.push(tableId.value ? `/orders/table/${tableId.value}` : '/my-orders')
  } catch (err) {
    showPopup({ type: 'danger', title: t('customer.checkoutFailed'), message: err.message })
  }
}

async function logout() {
  await authStore.logout()
  router.push('/login')
}

function formatPrice(price) {
  const locale = currentLanguage.value === 'en' ? 'en-US' : 'vi-VN'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}
</script>

<style scoped>
.cart-view { min-height: 100vh; padding: 18px; background: #f6f6f4; color: #151515; }
.container { width: min(1080px, 100%); margin: 0 auto; }
.customer-topbar { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 14px; min-height: 58px; margin-bottom: 18px; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; }
h1 { margin: 0; text-align: center; color: #151515; font-size: clamp(20px, 3vw, 30px); }
.btn-logout, .btn-continue.compact { min-height: 38px; border: 0; border-radius: 7px; padding: 0 14px; cursor: pointer; font-weight: 900; }
.btn-logout { background: #151515; color: #fff; }
.btn-continue.compact { width: auto; margin-top: 0; background: #fff3e8; color: #ff5a00; }
.cart-content { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 18px; }
.cart-items, .cart-summary, .empty-cart { border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; }
.cart-items { padding: 8px 18px; }
.cart-item { display: grid; grid-template-columns: minmax(0, 1fr) auto 120px auto; gap: 14px; align-items: center; padding: 16px 0; border-bottom: 1px solid #eaecf0; }
.cart-item:last-child { border-bottom: 0; }
.item-info h3 { margin: 0 0 5px; color: #151515; font-size: 16px; }
.item-info p { margin: 0; color: #667085; font-size: 13px; }
.item-quantity { display: inline-flex; gap: 5px; align-items: center; }
.item-quantity button, .item-quantity input { width: 34px; height: 34px; border: 1px solid #d0d5dd; border-radius: 999px; background: #fff; text-align: center; }
.item-quantity button { cursor: pointer; color: #ff5a00; font-weight: 900; }
.item-total { text-align: right; font-weight: 900; color: #ff5a00; }
.btn-remove { min-height: 34px; border: 0; border-radius: 7px; background: #fef3f2; color: #b42318; padding: 0 12px; cursor: pointer; font-weight: 900; }
.cart-summary { position: sticky; top: 16px; height: fit-content; padding: 18px; }
.cart-summary h2 { margin: 0 0 18px; font-size: 18px; }
.summary-item { display: flex; justify-content: space-between; padding: 11px 0; border-bottom: 1px solid #eaecf0; color: #475467; }
.summary-item.total { border-bottom: 0; color: #151515; font-size: 18px; font-weight: 900; }
.summary-item.total span:last-child { color: #ff5a00; }
.btn-checkout, .btn-continue { width: 100%; min-height: 42px; margin-top: 12px; border-radius: 7px; cursor: pointer; font-weight: 900; }
.btn-checkout { border: 0; background: #ff5a00; color: #fff; }
.btn-continue { border: 1px solid #ff5a00; background: #fff; color: #ff5a00; }
.empty-cart { padding: 48px 20px; text-align: center; }
.empty-cart h2 { color: #667085; margin-bottom: 20px; }
.btn-back { display: inline-flex; align-items: center; min-height: 42px; border-radius: 7px; background: #ff5a00; color: white; padding: 0 22px; text-decoration: none; font-weight: 900; }
@media (max-width: 820px) {
  .customer-topbar { grid-template-columns: 1fr; }
  h1 { text-align: left; }
  .cart-content { grid-template-columns: 1fr; }
  .cart-summary { position: static; }
  .cart-item { grid-template-columns: 1fr; align-items: start; }
  .item-total { text-align: left; }
}
</style>

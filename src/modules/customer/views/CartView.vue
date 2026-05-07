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
.cart-view {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin: 0;
  color: #333;
}

.customer-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
}

.btn-logout {
  background: #111827;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  margin-bottom: 30px;
}

.cart-items {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.cart-item {
  display: grid;
  grid-template-columns: 1fr 150px 100px 100px;
  gap: 15px;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-info h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.item-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.item-quantity {
  display: flex;
  gap: 5px;
}

.item-quantity button,
.item-quantity input {
  width: 40px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.item-quantity button {
  background: #f0f0f0;
  cursor: pointer;
}

.item-quantity button:hover {
  background: #e0e0e0;
}

.item-total {
  text-align: right;
  font-weight: bold;
  color: #ff6b35;
}

.btn-remove {
  background: #d32f2f;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-remove:hover {
  background: #c62828;
}

.cart-summary {
  background: white;
  border-radius: 8px;
  padding: 20px;
  height: fit-content;
}

.cart-summary h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  color: #333;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.summary-item.total {
  border-bottom: none;
  font-weight: bold;
  font-size: 16px;
  color: #ff6b35;
  padding: 15px 0;
}

.btn-checkout,
.btn-continue {
  width: 100%;
  padding: 12px;
  margin-top: 15px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn-continue.compact {
  width: auto;
  margin-top: 0;
}

.btn-checkout {
  background-color: #ff6b35;
  color: white;
  margin-bottom: 10px;
}

.btn-checkout:hover {
  background-color: #e55a25;
}

.btn-continue {
  background-color: #f0f0f0;
  color: #333;
  border: 2px solid #ff6b35;
}

.btn-continue:hover {
  background-color: #e8e8e8;
}

.empty-cart {
  background: white;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
}

.empty-cart h2 {
  color: #666;
  margin-bottom: 20px;
}

.btn-back {
  display: inline-block;
  background-color: #ff6b35;
  color: white;
  padding: 12px 30px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn-back:hover {
  background-color: #e55a25;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-item {
    grid-template-columns: 1fr;
  }

  .item-total {
    text-align: left;
  }
}
</style>

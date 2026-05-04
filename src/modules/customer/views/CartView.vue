<template>
  <div class="cart-view">
    <div class="container">
      <h1>Shopping Cart</h1>

      <div v-if="cartStore.items.length > 0" class="cart-content">
        <div class="cart-items">
          <div v-for="item in cartStore.items" :key="item.food_id" class="cart-item">
            <div class="item-info">
              <h3>{{ item.food_name }}</h3>
              <p>Price: {{ formatPrice(item.price) }}</p>
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
              Remove
            </button>
          </div>
        </div>

        <div class="cart-summary">
          <h2>Order Summary</h2>
          <div class="summary-item">
            <span>Items:</span>
            <span>{{ cartStore.itemCount }}</span>
          </div>
          <div class="summary-item">
            <span>Subtotal:</span>
            <span>{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>
          <div class="summary-item">
            <span>Tax (10%):</span>
            <span>{{ formatPrice(cartStore.totalPrice * 0.1) }}</span>
          </div>
          <div class="summary-item total">
            <span>Total:</span>
            <span>{{ formatPrice(cartStore.totalPrice * 1.1) }}</span>
          </div>

          <button @click="checkout" class="btn-checkout">
            Proceed to Checkout
          </button>
          <button @click="continueShopping" class="btn-continue">
            Continue Shopping
          </button>
        </div>
      </div>

      <div v-else class="empty-cart">
        <h2>Your cart is empty</h2>
        <router-link to="/menu" class="btn-back">
          Back to Menu
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/useCartStore'

const router = useRouter()
const cartStore = useCartStore()

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
  router.push('/menu')
}

async function checkout() {
  try {
    await cartStore.checkout('card')
    alert('Order placed successfully!')
    router.push('/orders')
  } catch (err) {
    alert('Checkout failed: ' + err.message)
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
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
  margin-bottom: 30px;
  color: #333;
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

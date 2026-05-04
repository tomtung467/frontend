<template>
  <div class="orders-view">
    <div class="container">
      <h1>My Orders</h1>

      <div v-if="!loading && orderStore.orders.length > 0" class="orders-list">
        <div v-for="order in orderStore.orders" :key="order.id" class="order-card">
          <div class="order-header">
            <h3>Order #{{ order.id }}</h3>
            <span class="order-status" :class="order.status">
              {{ order.status }}
            </span>
          </div>
          <div class="order-details">
            <p><strong>Table:</strong> {{ order.table_id }}</p>
            <p><strong>Total:</strong> {{ formatPrice(order.total_price) }}</p>
            <p><strong>Date:</strong> {{ formatDate(order.created_at) }}</p>
          </div>
          <div class="order-items">
            <h4>Items:</h4>
            <ul>
              <li v-for="item in order.orderItems" :key="item.id">
                {{ item.food_name }} x{{ item.quantity }} = {{ formatPrice(item.price * item.quantity) }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div v-else-if="loading" class="loading">
        <p>Loading orders...</p>
      </div>

      <div v-else class="no-orders">
        <h2>No orders yet</h2>
        <router-link to="/menu" class="btn-back">
          Back to Menu
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useOrderStore } from '@/stores/useOrderStore'

const orderStore = useOrderStore()
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    await orderStore.fetchOrders()
  } catch (err) {
    console.error('Failed to fetch orders:', err)
  } finally {
    loading.value = false
  }
})

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

function formatDate(date) {
  return new Date(date).toLocaleString('vi-VN')
}
</script>

<style scoped>
.orders-view {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
}

.order-header h3 {
  margin: 0;
  color: #333;
}

.order-status {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.order-status.pending {
  background-color: #fff3cd;
  color: #856404;
}

.order-status.cooking {
  background-color: #fff3cd;
  color: #856404;
}

.order-status.ready {
  background-color: #d4edda;
  color: #155724;
}

.order-status.completed {
  background-color: #d1ecf1;
  color: #0c5460;
}

.order-status.cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.order-details {
  margin-bottom: 15px;
  color: #666;
  font-size: 14px;
}

.order-details p {
  margin: 5px 0;
}

.order-items h4 {
  margin-top: 15px;
  margin-bottom: 10px;
  color: #333;
  font-size: 14px;
}

.order-items ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.order-items li {
  padding: 5px 0;
  color: #666;
  font-size: 13px;
  border-bottom: 1px solid #eee;
}

.order-items li:last-child {
  border-bottom: none;
}

.loading,
.no-orders {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
}

.no-orders h2 {
  color: #666;
  margin-bottom: 20px;
}

.btn-back {
  display: inline-block;
  background-color: #ff6b35;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
}

.btn-back:hover {
  background-color: #e55a25;
}
</style>

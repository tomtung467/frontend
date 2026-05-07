import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { syncOrderFirestore } from '@/services/firebaseFirestoreService'

export const useCartStore = defineStore('cart', () => {
  const carts = ref(JSON.parse(localStorage.getItem('table_carts') || '{}'))
  const tableId = ref(null)
  const items = computed(() => tableId.value ? (carts.value[String(tableId.value)] || []) : [])
  const totalPrice = computed(() => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
  const itemCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  function persist() {
    localStorage.setItem('table_carts', JSON.stringify(carts.value))
  }

  function ensureTableCart() {
    if (!tableId.value) throw new Error('Vui lòng chọn bàn trước.')
    const key = String(tableId.value)
    if (!carts.value[key]) carts.value[key] = []
    return carts.value[key]
  }

  function addItem(food, quantity = 1) {
    const cartItems = ensureTableCart()
    const existingItem = cartItems.find(item => item.food_id === food.id)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cartItems.push({
        food_id: food.id,
        food_name: food.name || food.food_name,
        price: food.price,
        quantity: quantity,
        category_id: food.category_id,
        image_url: food.image_url,
      })
    }
    persist()
  }

  function removeItem(foodId) {
    const key = String(tableId.value)
    carts.value[key] = items.value.filter(item => item.food_id !== foodId)
    persist()
  }

  function updateQuantity(foodId, quantity) {
    const item = items.value.find(item => item.food_id === foodId)
    if (item) {
      if (quantity <= 0) {
        removeItem(foodId)
      } else {
        item.quantity = quantity
      }
      persist()
    }
  }

  function clearCart() {
    if (tableId.value) {
      carts.value[String(tableId.value)] = []
      persist()
    }
  }

  async function checkout(paymentMethod) {
    try {
      const response = await api.post('/orders', {
        table_id: tableId.value,
        items: items.value,
        payment_method: paymentMethod,
        total_price: totalPrice.value,
      })
      const order = response.data?.data || response.data
      await syncOrderFirestore(order)
      clearCart()
      return response.data
    } catch (err) {
      console.error('Checkout failed:', err)
      throw err
    }
  }

  function setTable(table) {
    tableId.value = table?.id || table
  }

  return {
    items,
    tableId,
    totalPrice,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    checkout,
    setTable,
  }
})

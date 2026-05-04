import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const tableId = ref(null)
  const totalPrice = computed(() => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
  const itemCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  function addItem(food, quantity = 1) {
    const existingItem = items.value.find(item => item.food_id === food.id)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({
        food_id: food.id,
        food_name: food.food_name,
        price: food.price,
        quantity: quantity,
        category_id: food.category_id,
      })
    }
  }

  function removeItem(foodId) {
    items.value = items.value.filter(item => item.food_id !== foodId)
  }

  function updateQuantity(foodId, quantity) {
    const item = items.value.find(item => item.food_id === foodId)
    if (item) {
      if (quantity <= 0) {
        removeItem(foodId)
      } else {
        item.quantity = quantity
      }
    }
  }

  function clearCart() {
    items.value = []
  }

  async function checkout(paymentMethod) {
    try {
      const response = await api.post('/orders', {
        table_id: tableId.value,
        items: items.value,
        payment_method: paymentMethod,
        total_price: totalPrice.value,
      })
      clearCart()
      return response.data
    } catch (err) {
      console.error('Checkout failed:', err)
      throw err
    }
  }

  function setTable(table) {
    tableId.value = table
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

<template>
  <div class="container mx-auto px-4 py-8">
    <header class="mb-8">
      <h1 class="text-4xl font-bold text-gray-800">Restaurant Menu</h1>
      <p class="text-gray-600 mt-2">Bàn {{ tableNumber }} - Table {{ tableNumber }}</p>
    </header>

    <!-- AI Assistant Button -->
    <div class="mb-6">
      <button
        @click="showAIAssistant = true"
        class="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" />
        </svg>
        AI Assistant
      </button>
    </div>

    <!-- Search Bar -->
    <div class="mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Tìm kiếm món ăn... / Search dishes..."
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <!-- Category Tabs -->
    <div class="mb-6 flex gap-2 overflow-x-auto">
      <button
        v-for="category in categories"
        :key="category.id"
        @click="selectedCategory = category.id"
        :class="[
          'px-4 py-2 rounded-lg whitespace-nowrap transition',
          selectedCategory === category.id
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        ]"
      >
        {{ category.name }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Menu Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MenuCard
        v-for="food in filteredFoods"
        :key="food.id"
        :food="food"
        @add-to-cart="addToCart"
        @view-details="viewDetails"
      />
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredFoods.length === 0" class="text-center py-12">
      <p class="text-gray-600 text-lg">Không tìm thấy món ăn / No dishes found</p>
    </div>

    <!-- Floating Cart -->
    <div
      v-if="cartCount > 0"
      class="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg cursor-pointer hover:bg-blue-700 transition"
      @click="showCart = true"
    >
      <div class="flex items-center gap-2">
        <span class="text-2xl">🛒</span>
        <span class="font-bold">{{ cartCount }}</span>
      </div>
    </div>

    <!-- AI Assistant Modal -->
    <AIAssistant
      v-if="showAIAssistant"
      @close="showAIAssistant = false"
      @select-food="handleAISelection"
    />

    <!-- Cart Modal -->
    <CartModal v-if="showCart" @close="showCart = false" />

    <!-- Food Details Modal -->
    <FoodDetailModal
      v-if="selectedFood"
      :food="selectedFood"
      @close="selectedFood = null"
      @add-to-cart="addToCart"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCart } from '@/composables/useCart'
import { useNotification } from '@/composables/useNotification'
import { useRoute } from 'vue-router'
import MenuCard from '@/components/customer/MenuCard.vue'
import AIAssistant from '@/components/customer/AIAssistant.vue'
import CartModal from '@/components/customer/CartModal.vue'
import FoodDetailModal from '@/components/customer/FoodDetailModal.vue'
import * as menuAPI from '@/api/menu'

const route = useRoute()
const { addToCart: addCartItem, items: cartItems, total: cartTotal } = useCart()
const { showSuccess, showError } = useNotification()

const loading = ref(false)
const foods = ref([])
const categories = ref([])
const selectedCategory = ref(null)
const searchQuery = ref('')
const tableNumber = ref(route.params.tableId || 1)
const showAIAssistant = ref(false)
const showCart = ref(false)
const selectedFood = ref(null)

// Computed
const filteredFoods = computed(() => {
  let result = foods.value

  // Filter by category
  if (selectedCategory.value) {
    result = result.filter(f => f.category_id === selectedCategory.value)
  }

  // Filter by search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(f =>
      f.name.toLowerCase().includes(query) ||
      f.description.toLowerCase().includes(query)
    )
  }

  return result
})

const cartCount = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
)

// Methods
const fetchMenuData = async () => {
  try {
    loading.value = true
    const [foodsRes, categoriesRes] = await Promise.all([
      menuAPI.getFoods(),
      menuAPI.getCategories()
    ])

    foods.value = foodsRes.data.data
    categories.value = categoriesRes.data.data

    if (categories.value.length > 0) {
      selectedCategory.value = categories.value[0].id
    }
  } catch (error) {
    showError('Failed to load menu')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const addToCart = (food, quantity = 1, notes = '') => {
  try {
    addCartItem({
      id: food.id,
      name: food.name,
      price: food.price,
      quantity,
      notes,
      image_url: food.image_url
    })
    showSuccess(`${food.name} added to cart`)
  } catch (error) {
    showError('Failed to add to cart')
  }
}

const viewDetails = (food) => {
  selectedFood.value = food
}

const handleAISelection = (food) => {
  addToCart(food, 1)
  showAIAssistant.value = false
  showSuccess(`${food.name} được thêm vào giỏi hàng`)
}

// Lifecycle
onMounted(() => {
  fetchMenuData()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>

// Lifecycle
onMounted(() => {
  fetchMenuData()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
}

/* Add smooth transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

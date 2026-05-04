<template>
  <div class="menu-view">
    <div class="container">
      <h1>E-Menu</h1>
      
      <!-- Categories Filter -->
      <div class="categories-filter">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category.id)"
          :class="{ active: selectedCategory?.id === category.id }"
          class="category-btn"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- Foods Grid -->
      <div v-if="!loading" class="foods-grid">
        <div v-for="food in foods" :key="food.id" class="food-card">
          <div class="food-image">
            <img :src="food.image_url || '/placeholder-food.jpg'" :alt="food.food_name" />
          </div>
          <div class="food-info">
            <h3>{{ food.food_name }}</h3>
            <p class="description">{{ food.description }}</p>
            <div class="food-footer">
              <span class="price">{{ formatPrice(food.price) }}</span>
              <button @click="addToCart(food)" class="btn-add-to-cart">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="loading">
        <p>Loading menu...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMenuStore } from '@/stores/useMenuStore'
import { useCartStore } from '@/stores/useCartStore'

const menuStore = useMenuStore()
const cartStore = useCartStore()

const categories = ref([])
const foods = ref([])
const selectedCategory = ref(null)
const loading = ref(false)
const error = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    await menuStore.fetchCategories()
    categories.value = menuStore.categories
    if (categories.value.length > 0) {
      await selectCategory(categories.value[0].id)
    }
  } catch (err) {
    error.value = 'Failed to load menu'
  } finally {
    loading.value = false
  }
})

async function selectCategory(categoryId) {
  loading.value = true
  try {
    await menuStore.fetchCategoryFoods(categoryId)
    foods.value = menuStore.foods
    selectedCategory.value = menuStore.selectedCategory
  } catch (err) {
    error.value = 'Failed to load foods'
  } finally {
    loading.value = false
  }
}

function addToCart(food) {
  cartStore.addItem(food)
  alert(`${food.food_name} added to cart!`)
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}
</script>

<style scoped>
.menu-view {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.categories-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  overflow-x: auto;
  padding: 10px 0;
}

.category-btn {
  padding: 10px 20px;
  border: 2px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 20px;
  font-size: 14px;
  white-space: nowrap;
  transition: all 0.3s;
}

.category-btn:hover {
  border-color: #ff6b35;
}

.category-btn.active {
  background-color: #ff6b35;
  color: white;
  border-color: #ff6b35;
}

.foods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.food-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.food-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.food-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.food-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.food-info {
  padding: 15px;
}

.food-info h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.description {
  color: #666;
  font-size: 13px;
  margin-bottom: 15px;
  line-height: 1.4;
}

.food-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-weight: bold;
  color: #ff6b35;
  font-size: 16px;
}

.btn-add-to-cart {
  background-color: #ff6b35;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.3s;
}

.btn-add-to-cart:hover {
  background-color: #e55a25;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 16px;
}

.error {
  color: #d32f2f;
  background-color: #ffebee;
  border-radius: 8px;
}
</style>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
        <h2 class="text-xl font-bold">Chi tiết món ăn</h2>
        <button
          @click="closeModal"
          class="text-gray-500 hover:text-gray-700 text-2xl leading-none"
        >
          ✕
        </button>
      </div>

      <!-- Body -->
      <div class="p-6">
        <!-- Image -->
        <div class="w-full h-64 bg-gray-200 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
          <img
            v-if="food?.image"
            :src="food.image"
            :alt="food.name"
            class="w-full h-full object-cover"
          />
          <span v-else class="text-6xl">🍽️</span>
        </div>

        <!-- Name -->
        <h1 class="text-2xl font-bold mb-2">{{ food?.name }}</h1>

        <!-- Category -->
        <p class="text-sm text-gray-500 mb-3">{{ food?.category?.name }}</p>

        <!-- Rating -->
        <div class="flex items-center gap-2 mb-4">
          <div class="flex text-yellow-400">
            <span v-for="i in 5" :key="i">
              {{ i <= (food?.rating || 4) ? '⭐' : '☆' }}
            </span>
          </div>
          <span class="text-sm text-gray-600">({{ food?.reviews || 0 }} reviews)</span>
        </div>

        <!-- Price -->
        <div class="mb-4">
          <p class="text-3xl font-bold text-blue-600">{{ formatPrice(food?.price) }}</p>
          <p v-if="food?.original_price > food?.price" class="text-sm text-gray-400 line-through">
            {{ formatPrice(food?.original_price) }}
          </p>
        </div>

        <!-- Description -->
        <div class="mb-4">
          <h3 class="font-semibold mb-2">Mô tả</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            {{ food?.description || 'Không có mô tả' }}
          </p>
        </div>

        <!-- Ingredients (if available) -->
        <div v-if="food?.ingredients?.length > 0" class="mb-4">
          <h3 class="font-semibold mb-2">Thành phần chính</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="ingredient in food.ingredients"
              :key="ingredient.id"
              class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
            >
              {{ ingredient.name }}
            </span>
          </div>
        </div>

        <!-- Quantity Selector -->
        <div class="mb-6">
          <label class="block text-sm font-semibold mb-2">Số lượng</label>
          <div class="flex items-center gap-3">
            <button
              @click="quantity = Math.max(1, quantity - 1)"
              class="bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded-lg flex items-center justify-center font-bold"
            >
              −
            </button>
            <input
              v-model.number="quantity"
              type="number"
              min="1"
              class="w-16 text-center border border-gray-300 rounded-lg py-2"
            />
            <button
              @click="quantity = quantity + 1"
              class="bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded-lg flex items-center justify-center font-bold"
            >
              +
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div class="mb-6">
          <label class="block text-sm font-semibold mb-2">Ghi chú đặc biệt</label>
          <textarea
            v-model="notes"
            placeholder="Ví dụ: không cay, thêm muối..."
            class="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none"
            rows="3"
          />
        </div>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
            @click="closeModal"
            class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
          >
            Hủy
          </button>
          <button
            @click="addToCart"
            :disabled="!food?.is_available"
            class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
          >
            {{ food?.is_available ? `Thêm vào giỏi hàng - ${formatPrice(food?.price * quantity)}` : 'Hết hàng' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  food: Object,
  isOpen: Boolean
})

const emit = defineEmits(['close', 'add-to-cart'])

const quantity = ref(1)
const notes = ref('')

watch(() => props.isOpen, (val) => {
  if (val) {
    quantity.value = 1
    notes.value = ''
  }
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const closeModal = () => {
  emit('close')
}

const addToCart = () => {
  emit('add-to-cart', {
    ...props.food,
    quantity: quantity.value,
    notes: notes.value
  })
  closeModal()
}
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}
</style>

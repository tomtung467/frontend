<template>
  <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer" @click="handleClick">
    <!-- Image -->
    <div class="relative w-full h-48 bg-gray-200 overflow-hidden">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="food.name"
        class="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        <span class="text-4xl">🍽️</span>
      </div>
      
      <!-- Badge -->
      <div v-if="food.is_available === false" class="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
        Hết hàng
      </div>
      <div v-else-if="food.discount" class="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
        -{{ food.discount }}%
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <!-- Name & Category -->
      <div class="mb-2">
        <h3 class="text-lg font-semibold text-gray-800 truncate">{{ food.name }}</h3>
        <p class="text-sm text-gray-500">{{ food.category?.name || 'Không xác định' }}</p>
      </div>

      <!-- Description -->
      <p class="text-sm text-gray-600 mb-3 line-clamp-2">
        {{ food.description || 'Không có mô tả' }}
      </p>

      <!-- Rating & Reviews -->
      <div class="flex items-center gap-2 mb-3">
        <div class="flex text-yellow-400">
          <span v-for="i in 5" :key="i" class="text-sm">
            {{ i <= (food.rating || 4) ? '⭐' : '☆' }}
          </span>
        </div>
        <span class="text-xs text-gray-500">({{ food.reviews || 0 }})</span>
      </div>

      <!-- Price & Action -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xl font-bold text-blue-600">
            {{ formatPrice(food.price) }}
          </p>
          <p v-if="food.original_price > food.price" class="text-xs text-gray-400 line-through">
            {{ formatPrice(food.original_price) }}
          </p>
        </div>
        <button
          @click.stop="handleAddToCart"
          :disabled="!food.is_available"
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
        >
          {{ food.is_available ? '+ Thêm' : 'Hết' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue'
import { resolveAssetUrl } from '@/utils/assetUrl'

const props = defineProps({
  food: {
    type: Object,
    required: true,
    default: () => ({
      id: null,
      name: '',
      description: '',
      price: 0,
      original_price: 0,
      category: null,
      image: null,
      rating: 4,
      reviews: 0,
      is_available: true,
      discount: 0
    })
  }
})

const emit = defineEmits(['add-to-cart', 'view-details'])

const imageUrl = computed(() => {
  const value = props.food.image || props.food.image_url
  return value ? resolveAssetUrl(value) : ''
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const handleClick = () => {
  emit('view-details', props.food)
}

const handleAddToCart = () => {
  if (props.food.is_available) {
    emit('add-to-cart', props.food)
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

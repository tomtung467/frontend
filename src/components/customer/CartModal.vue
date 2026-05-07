<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4">
    <div class="bg-white rounded-t-lg md:rounded-lg w-full md:max-w-md md:max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
        <h2 class="text-xl font-bold">🛒 Giỏ hàng</h2>
        <button @click="closeCart" class="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
      </div>

      <!-- Body -->
      <div class="p-4">
        <!-- Empty State -->
        <div v-if="items.length === 0" class="text-center py-8">
          <p class="text-2xl mb-2">🛒</p>
          <p class="text-gray-600">Giỏi hàng trống</p>
        </div>

        <!-- Items List -->
        <div v-else class="space-y-4 mb-6">
          <div
            v-for="(item, index) in items"
            :key="index"
            class="border border-gray-200 rounded-lg p-3 flex gap-3"
          >
            <!-- Item Image -->
            <div class="w-20 h-20 bg-gray-200 rounded flex-shrink-0 overflow-hidden flex items-center justify-center">
              <img
                v-if="item.image"
                :src="item.image"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-2xl">🍽️</span>
            </div>

            <!-- Item Details -->
            <div class="flex-1 flex flex-col justify-between">
              <div>
                <h4 class="font-semibold text-sm">{{ item.name }}</h4>
                <p class="text-xs text-gray-500">{{ item.category?.name }}</p>
                <p v-if="item.notes" class="text-xs text-gray-600 italic mt-1">
                  Ghi chú: {{ item.notes }}
                </p>
              </div>
              <p class="text-sm font-semibold text-blue-600">
                {{ formatPrice(item.price * item.quantity) }}
              </p>
            </div>

            <!-- Quantity & Remove -->
            <div class="flex flex-col items-center justify-between">
              <button
                @click="removeItem(index)"
                class="text-red-500 hover:text-red-700 font-bold"
              >
                ✕
              </button>
              <div class="flex items-center gap-1">
                <button
                  @click="updateQuantity(index, item.quantity - 1)"
                  class="bg-gray-200 hover:bg-gray-300 w-6 h-6 rounded flex items-center justify-center text-xs"
                >
                  −
                </button>
                <span class="w-6 text-center text-sm font-semibold">{{ item.quantity }}</span>
                <button
                  @click="updateQuantity(index, item.quantity + 1)"
                  class="bg-gray-200 hover:bg-gray-300 w-6 h-6 rounded flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Promo Code -->
        <div v-if="items.length > 0" class="mb-4">
          <div class="flex gap-2">
            <input
              v-model="promoCode"
              placeholder="Mã khuyến mãi"
              class="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <button
              @click="applyPromo"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold"
            >
              Áp dụng
            </button>
          </div>
          <p v-if="discount > 0" class="text-sm text-green-600 mt-2">
            Đã áp dụng giảm: {{ formatPrice(discount) }}
          </p>
        </div>

        <!-- Summary -->
        <div v-if="items.length > 0" class="border-t pt-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span>Tiền hàng:</span>
            <span>{{ formatPrice(subtotal) }}</span>
          </div>
          <div v-if="discount > 0" class="flex justify-between text-sm text-green-600">
            <span>Giảm giá:</span>
            <span>-{{ formatPrice(discount) }}</span>
          </div>
          <div class="flex justify-between text-lg font-bold border-t pt-2">
            <span>Tổng cộng:</span>
            <span class="text-blue-600">{{ formatPrice(total) }}</span>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div v-if="items.length > 0" class="sticky bottom-0 border-t bg-white p-4 flex gap-3">
        <button
          @click="closeCart"
          class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg"
        >
          Tiếp tục mua
        </button>
        <button
          @click="checkout"
          class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg"
        >
          Thanh toán
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showPopup } from '@/composables/usePopup'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'checkout'])

const items = ref([])
const promoCode = ref('')
const discount = ref(0)

const subtotal = computed(() => {
  return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const total = computed(() => {
  return Math.max(0, subtotal.value - discount.value)
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const closeCart = () => {
  emit('close')
}

const removeItem = (index) => {
  items.value.splice(index, 1)
}

const updateQuantity = (index, newQuantity) => {
  if (newQuantity <= 0) {
    removeItem(index)
  } else {
    items.value[index].quantity = newQuantity
  }
}

const applyPromo = () => {
  // Placeholder: In real implementation, validate with backend
  if (promoCode.value === 'DISCOUNT10') {
    discount.value = subtotal.value * 0.1
  } else if (promoCode.value === 'DISCOUNT20') {
    discount.value = subtotal.value * 0.2
  } else {
    discount.value = 0
    showPopup({ type: 'warning', title: 'Mã khuyến mãi', message: 'Mã khuyến mãi không hợp lệ' })
  }
}

const checkout = () => {
  emit('checkout', {
    items: items.value,
    subtotal: subtotal.value,
    discount: discount.value,
    total: total.value
  })
}

// Allow external updates
defineExpose({
  addItem: (item) => items.value.push(item),
  setItems: (newItems) => {
    items.value = newItems
  },
  getItems: () => items.value
})
</script>

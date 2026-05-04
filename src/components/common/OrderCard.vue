<template>
  <div class="border border-gray-300 rounded-lg p-3 hover:shadow-md transition">
    <!-- Status Badge -->
    <div class="flex justify-between items-start mb-2">
      <h4 class="font-semibold text-gray-800">Order #{{ order.id }}</h4>
      <span :class="['px-2 py-1 rounded text-xs font-bold', statusClass]">
        {{ statusText[order.status] }}
      </span>
    </div>

    <!-- Items Count -->
    <p class="text-sm text-gray-600 mb-2">
      {{ order.items_count }} {{ order.items_count > 1 ? 'items' : 'item' }}
    </p>

    <!-- Price & Time -->
    <div class="flex justify-between items-center">
      <p class="font-bold text-blue-600">{{ formatPrice(order.total) }}</p>
      <p class="text-xs text-gray-500">{{ formatTime(order.created_at) }}</p>
    </div>

    <!-- Action -->
    <button
      @click="viewDetails"
      class="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition"
    >
      Xem chi tiết
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view-details'])

const statusText = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang chuẩn bị',
  ready: 'Sẵn sàng',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy'
}

const statusClass = computed(() => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
    delivered: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[props.order.status] || classes.pending
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const formatTime = (time) => {
  return new Date(time).toLocaleDateString('vi-VN')
}

const viewDetails = () => {
  emit('view-details', props.order)
}
</script>

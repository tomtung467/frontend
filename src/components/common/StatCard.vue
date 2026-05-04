<template>
  <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
    <!-- Header -->
    <div class="flex justify-between items-start mb-2">
      <div>
        <h3 class="text-lg font-bold text-gray-800">{{ stat.label }}</h3>
        <p class="text-sm text-gray-500">{{ stat.description }}</p>
      </div>
      <div :class="['text-2xl', iconColorClass]">{{ stat.icon }}</div>
    </div>

    <!-- Value -->
    <div class="flex items-baseline gap-2">
      <p class="text-3xl font-bold text-gray-900">{{ stat.value }}</p>
      <p v-if="stat.change" :class="['text-sm font-semibold', changeColorClass]">
        {{ stat.change > 0 ? '↑' : '↓' }} {{ Math.abs(stat.change) }}%
      </p>
    </div>

    <!-- Trend -->
    <p v-if="stat.trend" class="text-xs text-gray-500 mt-2">
      {{ stat.trend }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stat: {
    type: Object,
    required: true,
    default: () => ({
      label: '',
      description: '',
      value: 0,
      icon: '📊',
      change: 0,
      trend: '',
      colorClass: 'text-blue-600'
    })
  }
})

const iconColorClass = computed(() => props.stat.colorClass || 'text-blue-600')

const changeColorClass = computed(() => {
  return props.stat.change > 0 ? 'text-green-600' : 'text-red-600'
})
</script>

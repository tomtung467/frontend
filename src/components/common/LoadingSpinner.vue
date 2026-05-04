<template>
  <div class="inline-flex items-center justify-center">
    <div
      :class="[
        'animate-spin rounded-full',
        sizeClasses[size],
        'border-4 border-gray-200 border-t-blue-600'
      ]"
    />
    <span v-if="text" :class="['ml-3', textSizeClasses[size]]">
      {{ text }}
    </span>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  text: String
})

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
}

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
}
</script>

<template>
  <div class="toast" :class="`toast-${type}`">
    <div class="toast-icon">
      <span v-if="type === 'success'">✓</span>
      <span v-else-if="type === 'error'">✕</span>
      <span v-else-if="type === 'warning'">⚠</span>
      <span v-else>ℹ</span>
    </div>
    <div class="toast-content">
      <div class="toast-title">{{ title }}</div>
      <div v-if="message" class="toast-message">{{ message }}</div>
    </div>
    <button class="toast-close" @click="$emit('close')">✕</button>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value),
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    default: 5000,
  },
})

const emit = defineEmits(['close'])

onMounted(() => {
  if (props.duration > 0) {
    setTimeout(() => {
      emit('close')
    }, props.duration)
  }
})
</script>

<style scoped>
.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.toast-success {
  border-left: 4px solid #10b981;
}

.toast-error {
  border-left: 4px solid #ef4444;
}

.toast-warning {
  border-left: 4px solid #f59e0b;
}

.toast-info {
  border-left: 4px solid #3b82f6;
}

.toast-icon {
  flex-shrink: 0;
  font-size: 18px;
  font-weight: bold;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.toast-message {
  color: #6b7280;
  font-size: 13px;
  margin-top: 4px;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #333;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>

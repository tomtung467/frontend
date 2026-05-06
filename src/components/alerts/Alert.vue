<template>
  <div class="alert" :class="`alert-${type}`">
    <div class="alert-icon">
      <span v-if="type === 'success'">✓</span>
      <span v-else-if="type === 'error'">✕</span>
      <span v-else-if="type === 'warning'">⚠</span>
      <span v-else>ℹ</span>
    </div>
    <div class="alert-content">
      <div class="alert-title">{{ title }}</div>
      <div v-if="message" class="alert-message">{{ message }}</div>
      <slot></slot>
    </div>
    <button v-if="closable" class="alert-close" @click="$emit('close')">
      ✕
    </button>
  </div>
</template>

<script setup>
defineProps({
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
  closable: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['close'])
</script>

<style scoped>
.alert {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
  font-size: 14px;
}

.alert-success {
  background-color: #d1fae5;
  border-left-color: #10b981;
  color: #065f46;
}

.alert-error {
  background-color: #fee2e2;
  border-left-color: #ef4444;
  color: #7f1d1d;
}

.alert-warning {
  background-color: #fef3c7;
  border-left-color: #f59e0b;
  color: #78350f;
}

.alert-info {
  background-color: #dbeafe;
  border-left-color: #3b82f6;
  color: #1e3a8a;
}

.alert-icon {
  flex-shrink: 0;
  font-size: 18px;
  font-weight: bold;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.alert-message {
  opacity: 0.9;
  margin-top: 4px;
}

.alert-close {
  flex-shrink: 0;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.alert-close:hover {
  opacity: 1;
}
</style>

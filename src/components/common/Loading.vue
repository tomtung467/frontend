<template>
  <div class="loading-spinner">
    <div class="spinner"></div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: 'Đang tải...',
  },
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

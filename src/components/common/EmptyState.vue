<template>
  <div class="empty-state">
    <div class="empty-icon">{{ icon }}</div>
    <h3 class="empty-title">{{ title }}</h3>
    <p v-if="message" class="empty-message">{{ message }}</p>
    <button v-if="actionText" class="empty-action" @click="$emit('action')">
      {{ actionText }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: '📭',
  },
  title: {
    type: String,
    default: 'Không có dữ liệu',
  },
  message: {
    type: String,
    default: 'Hiện không có dữ liệu nào để hiển thị.',
  },
  actionText: {
    type: String,
    default: '',
  },
})

defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
}

.empty-message {
  color: #6b7280;
  font-size: 14px;
  margin: 0 0 20px 0;
  max-width: 300px;
}

.empty-action {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.empty-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>

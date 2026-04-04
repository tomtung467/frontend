<template>
  <button class="auth-button" :disabled="loading" @click="$emit('click')">
    {{ loading ? "Đang xử lý..." : title }}
  </button>
</template>

<script setup>
defineProps({
  title: String,
  loading: Boolean,
});

defineEmits(["click"]);
</script>

<style scoped>
.auth-button {
  width: 100%;
  padding: 12px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
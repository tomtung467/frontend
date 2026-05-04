<template>
  <div class="master-button">
    <button
      :type="type"
      :disabled="disabled || isLoading"
      :class="[
        'btn',
        `btn-${variant}`,
        { 'btn-loading': isLoading }
      ]"
      @click="handleClick"
    >
      <span v-if="!isLoading">{{ label }}</span>
      <span v-else class="loading-text">{{ loadingText }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  label: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  onClick?: () => void | Promise<void>;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  loadingText: 'Loading...'
});

const emit = defineEmits(['click']);

const handleClick = async () => {
  emit('click');
  if (props.onClick) {
    await props.onClick();
  }
};
</script>

<style scoped>
.master-button {
  display: inline-block;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: capitalize;
}

.btn:focus {
  outline: none;
}

.btn-primary {
  background-color: #2196f3;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1976d2;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

.btn-secondary {
  background-color: #757575;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #616161;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #d32f2f;
}

.btn-success {
  background-color: #4caf50;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #388e3c;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loading {
  opacity: 0.8;
}

.loading-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-text::after {
  content: '';
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

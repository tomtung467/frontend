<template>
  <div class="master-radio-group">
    <div class="radio-label" v-if="label">{{ label }}</div>
    <div class="radio-options">
      <label v-for="option in options" :key="option.value" class="radio-option">
        <input
          v-model="localValue"
          type="radio"
          :value="option.value"
          :disabled="disabled"
          class="radio-input"
        />
        <span class="radio-checkmark"></span>
        <span class="radio-text">{{ option.label }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Option {
  label: string;
  value: string | number;
}

interface Props {
  modelValue: string | number;
  options: Option[];
  label?: string;
  disabled?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits(['update:modelValue']);

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script>

<style scoped>
.master-radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
}

.radio-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  font-size: 0.95rem;
  color: #333;
}

.radio-input {
  display: none;
}

.radio-checkmark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #ddd;
  border-radius: 50%;
  background-color: white;
  transition: all 0.2s ease;
}

.radio-input:checked + .radio-checkmark {
  border-color: #2196f3;
  background-color: #2196f3;
}

.radio-input:checked + .radio-checkmark::after {
  content: '';
  display: block;
  width: 0.5rem;
  height: 0.5rem;
  background-color: white;
  border-radius: 50%;
}

.radio-input:disabled + .radio-checkmark {
  opacity: 0.6;
  cursor: not-allowed;
}

.radio-text {
  flex: 1;
}
</style>

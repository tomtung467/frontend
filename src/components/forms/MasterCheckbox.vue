<template>
  <div class="master-checkbox-group">
    <label class="checkbox-label">
      <input
        v-model="localValue"
        type="checkbox"
        :disabled="disabled"
        class="checkbox-input"
      />
      <span class="checkbox-checkmark"></span>
      <span v-if="label" class="checkbox-text">{{ label }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: boolean;
  label?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>());

const emit = defineEmits(['update:modelValue']);

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script>

<style scoped>
.master-checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  font-size: 0.95rem;
  color: #333;
}

.checkbox-input {
  display: none;
}

.checkbox-checkmark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  background-color: white;
  transition: all 0.2s ease;
}

.checkbox-input:checked + .checkbox-checkmark {
  background-color: #2196f3;
  border-color: #2196f3;
}

.checkbox-input:checked + .checkbox-checkmark::after {
  content: '✓';
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.checkbox-input:disabled + .checkbox-checkmark {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkbox-text {
  flex: 1;
}
</style>

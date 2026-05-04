<template>
  <div class="master-select-group">
    <label v-if="label" :for="selectId" class="select-label">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>
    <select
      :id="selectId"
      v-model="localValue"
      class="master-select"
      :class="{ 'select-error': error }"
      :disabled="disabled"
      :required="required"
      @blur="$emit('blur')"
      @focus="$emit('focus')"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <span v-if="error" class="select-error-message">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Option {
  label: string;
  value: string | number;
}

interface Props {
  modelValue: string | number;
  label?: string;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: ''
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const selectId = ref(`select-${Math.random().toString(36).substr(2, 9)}`);
</script>

<style scoped>
.master-select-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.select-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
}

.required-asterisk {
  color: #f44336;
  margin-left: 0.25rem;
}

.master-select {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  transition: all 0.3s ease;
  cursor: pointer;
}

.master-select:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.master-select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #999;
}

.master-select.select-error {
  border-color: #f44336;
}

.master-select.select-error:focus {
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
}

.select-error-message {
  color: #f44336;
  font-size: 0.875rem;
}
</style>

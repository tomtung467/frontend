<template>
  <div class="master-input-group">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>
    <input
      :id="inputId"
      v-model="localValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      class="master-input"
      :class="{ 'input-error': error }"
      @blur="$emit('blur')"
      @focus="$emit('focus')"
    />
    <span v-if="error" class="input-error-message">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  modelValue: string | number;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  modelValue: ''
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`);
</script>

<style scoped>
.master-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
}

.required-asterisk {
  color: #f44336;
  margin-left: 0.25rem;
}

.master-input {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.master-input:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.master-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #999;
}

.master-input.input-error {
  border-color: #f44336;
}

.master-input.input-error:focus {
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
}

.input-error-message {
  color: #f44336;
  font-size: 0.875rem;
}
</style>

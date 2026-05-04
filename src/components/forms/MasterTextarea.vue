<template>
  <div class="master-textarea-group">
    <label v-if="label" :for="textareaId" class="textarea-label">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>
    <textarea
      :id="textareaId"
      v-model="localValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      class="master-textarea"
      :class="{ 'textarea-error': error }"
      @blur="$emit('blur')"
      @focus="$emit('focus')"
    ></textarea>
    <span v-if="error" class="textarea-error-message">{{ error }}</span>
    <span v-if="showCharCount" class="char-count">
      {{ localValue.length }} / {{ maxLength }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  modelValue: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  rows: 4,
  showCharCount: false
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (!props.maxLength || value.length <= props.maxLength) {
      emit('update:modelValue', value);
    }
  }
});

const textareaId = ref(`textarea-${Math.random().toString(36).substr(2, 9)}`);
</script>

<style scoped>
.master-textarea-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.textarea-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
}

.required-asterisk {
  color: #f44336;
  margin-left: 0.25rem;
}

.master-textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
}

.master-textarea:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.master-textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #999;
}

.master-textarea.textarea-error {
  border-color: #f44336;
}

.master-textarea.textarea-error:focus {
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
}

.textarea-error-message {
  color: #f44336;
  font-size: 0.875rem;
}

.char-count {
  font-size: 0.75rem;
  color: #999;
  text-align: right;
}
</style>

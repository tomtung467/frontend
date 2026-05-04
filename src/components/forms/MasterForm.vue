<template>
  <div class="master-form">
    <form @submit.prevent="handleSubmit">
      <!-- Form Fields -->
      <div class="form-content">
        <slot></slot>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button 
          type="submit" 
          class="btn-submit"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">{{ submitLabel }}</span>
          <span v-else class="loading-spinner">Loading...</span>
        </button>
        <button 
          type="button" 
          class="btn-cancel"
          @click="handleCancel"
          :disabled="isLoading"
        >
          Cancel
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  submitLabel?: string;
  onSubmit?: (data: any) => Promise<void>;
  onCancel?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Submit'
});

const isLoading = ref(false);
const errorMessage = ref('');

const handleSubmit = async () => {
  if (!props.onSubmit) return;
  
  try {
    isLoading.value = true;
    errorMessage.value = '';
    await props.onSubmit({});
  } catch (error: any) {
    errorMessage.value = error?.message || 'An error occurred';
  } finally {
    isLoading.value = false;
  }
};

const handleCancel = () => {
  if (props.onCancel) {
    props.onCancel();
  }
};
</script>

<style scoped>
.master-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.btn-submit,
.btn-cancel {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-submit {
  background-color: #2196f3;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background-color: #1976d2;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

.btn-submit:disabled {
  background-color: #90caf9;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #e0e0e0;
  color: #333;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #bdbdbd;
}

.btn-cancel:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.alert-danger {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
}
</style>

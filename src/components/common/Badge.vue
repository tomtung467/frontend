<template>
  <div class="badge" :class="[`badge-${type}`, `badge-${size}`]">
    {{ text }}
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'default',
    validator: (value) =>
      [
        'default',
        'primary',
        'success',
        'danger',
        'warning',
        'info',
      ].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
})
</script>

<style scoped>
.badge {
  display: inline-block;
  font-weight: 600;
  border-radius: 9999px;
  white-space: nowrap;
}

/* Sizes */
.badge-sm {
  padding: 2px 8px;
  font-size: 11px;
}

.badge-md {
  padding: 4px 12px;
  font-size: 12px;
}

.badge-lg {
  padding: 6px 16px;
  font-size: 13px;
}

/* Types */
.badge-default {
  background-color: #e5e7eb;
  color: #333;
}

.badge-primary {
  background-color: #dbeafe;
  color: #1e40af;
}

.badge-success {
  background-color: #d1fae5;
  color: #065f46;
}

.badge-danger {
  background-color: #fee2e2;
  color: #7f1d1d;
}

.badge-warning {
  background-color: #fef3c7;
  color: #78350f;
}

.badge-info {
  background-color: #dbeafe;
  color: #1e3a8a;
}
</style>

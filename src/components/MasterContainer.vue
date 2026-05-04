<template>
  <div class="master-container">
    <div class="container-header">
      <h1 v-if="title" class="container-title">{{ title }}</h1>
      <p v-if="subtitle" class="container-subtitle">{{ subtitle }}</p>
    </div>

    <div class="container-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  subtitle?: string;
  maxWidth?: string;
}

withDefaults(defineProps<Props>(), {
  maxWidth: '1200px'
});
</script>

<style scoped>
.master-container {
  max-width: v-bind(maxWidth);
  margin: 0 auto;
  padding: 2rem;
}

.container-header {
  margin-bottom: 2rem;
}

.container-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.container-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.container-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>

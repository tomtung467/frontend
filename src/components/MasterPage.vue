<template>
  <div class="master-page">
    <header class="page-header">
      <div class="header-content">
        <h1 v-if="title" class="page-title">{{ title }}</h1>
        <nav v-if="breadcrumbs" class="breadcrumbs">
          <a v-for="(crumb, idx) in breadcrumbs" :key="idx" href="#">
            {{ crumb }}
            <span v-if="idx < breadcrumbs.length - 1" class="separator">/</span>
          </a>
        </nav>
      </div>
      <div class="header-actions">
        <slot name="header-actions"></slot>
      </div>
    </header>

    <main class="page-body">
      <slot></slot>
    </main>

    <footer v-if="hasFooter" class="page-footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';

interface Props {
  title?: string;
  breadcrumbs?: string[];
}

const props = defineProps<Props>();
const slots = useSlots();

const hasFooter = computed(() => !!slots.footer);
</script>

<style scoped>
.master-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.page-header {
  background-color: white;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.breadcrumbs {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.breadcrumbs a {
  color: #2196f3;
  text-decoration: none;
}

.breadcrumbs a:hover {
  text-decoration: underline;
}

.separator {
  color: #999;
  margin: 0 0.25rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.page-body {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.page-footer {
  background-color: white;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>

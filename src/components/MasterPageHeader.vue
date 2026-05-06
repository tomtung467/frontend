<template>
  <section class="master-page-header">
    <div class="title-block">
      <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
      <h1 class="page-title">{{ title }}</h1>
    </div>

    <div v-if="hasActions" class="page-actions">
      <slot name="actions"></slot>
    </div>
  </section>
</template>

<script setup>
import { computed, useSlots } from 'vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})

const slots = useSlots()
const hasActions = computed(() => Boolean(slots.actions))
</script>

<style scoped>
.master-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 66px;
  width: 100vw;
  margin: -24px calc(50% - 50vw) 24px;
  padding: 16px clamp(20px, 2.4vw, 36px);
  background: #ececec;
  border: 0;
  box-sizing: border-box;
}

.title-block {
  min-width: 0;
}

.page-subtitle {
  margin: 0 0 3px;
  color: #6f6f6f;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
}

.page-title {
  margin: 0;
  color: #252525;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.15;
}

.page-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 720px) {
  .master-page-header {
    align-items: flex-start;
    flex-direction: column;
    padding: 14px 16px;
  }

  .page-title {
    font-size: 26px;
  }

  .page-actions {
    justify-content: flex-start;
    width: 100%;
  }
}
</style>

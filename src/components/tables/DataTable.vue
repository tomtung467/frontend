<template>
  <div class="data-table-wrapper">
    <div v-if="loading" class="table-loading">
      <Loading text="Đang tải dữ liệu..." />
    </div>

    <div v-else-if="items.length === 0" class="table-empty">
      <EmptyState
        :title="emptyTitle"
        :message="emptyMessage"
        :action-text="emptyAction"
        @action="$emit('empty-action')"
      />
    </div>

    <div v-else>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="column in columns" :key="column.key" class="table-header">
                {{ column.label }}
              </th>
              <th v-if="hasActions" class="table-header">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in items" :key="index" class="table-row">
              <td v-for="column in columns" :key="column.key" class="table-cell">
                <slot :name="`cell-${column.key}`" :item="item" :column="column">
                  {{ item[column.key] }}
                </slot>
              </td>
              <td v-if="hasActions" class="table-cell actions">
                <slot name="actions" :item="item"></slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination" class="table-pagination">
        <button
          :disabled="currentPage === 1"
          class="pagination-btn"
          @click="previousPage"
        >
          ← Trước
        </button>
        <span class="pagination-info">
          Trang {{ currentPage }} / {{ totalPages }}
        </span>
        <button
          :disabled="currentPage === totalPages"
          class="pagination-btn"
          @click="nextPage"
        >
          Sau →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Loading from './Loading.vue'
import EmptyState from './EmptyState.vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Boolean,
    default: false,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  emptyTitle: {
    type: String,
    default: 'Không có dữ liệu',
  },
  emptyMessage: {
    type: String,
    default: 'Hiện không có dữ liệu nào để hiển thị.',
  },
  emptyAction: {
    type: String,
    default: '',
  },
})

defineSlots()
defineEmits(['empty-action'])

const currentPage = ref(1)

const totalPages = computed(() => {
  return Math.ceil(props.items.length / props.itemsPerPage)
})

const paginatedItems = computed(() => {
  if (!props.pagination) return props.items
  const start = (currentPage.value - 1) * props.itemsPerPage
  return props.items.slice(start, start + props.itemsPerPage)
})

const hasActions = computed(() => {
  return !!props.items && props.items.length > 0
})

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}
</script>

<style scoped>
.data-table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-loading {
  padding: 40px;
  text-align: center;
}

.table-empty {
  padding: 20px;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  padding: 12px 16px;
  background: #f9fafb;
  font-weight: 600;
  text-align: left;
  color: #333;
  border-bottom: 2px solid #e5e7eb;
  font-size: 13px;
}

.table-row {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f9fafb;
}

.table-cell {
  padding: 12px 16px;
  color: #333;
  font-size: 14px;
}

.table-cell.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.table-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.pagination-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 13px;
  color: #6b7280;
}
</style>

<template>
  <div class="master-table-wrapper">
    <!-- Search Bar -->
    <div v-if="enableSearch" class="table-search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search..."
        class="search-input"
      />
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="master-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key" class="table-header">
              <div class="header-content" @click="sortBy(col.key)">
                {{ col.label }}
                <span v-if="sortColumn === col.key" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
            </th>
            <th v-if="showActions" class="table-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredRows.length === 0" class="no-data-row">
            <td :colspan="columns.length + (showActions ? 1 : 0)" class="no-data">
              No data available
            </td>
          </tr>
          <tr v-for="row in paginatedRows" :key="row.id" class="table-row">
            <td v-for="col in columns" :key="col.key" class="table-cell">
              {{ getNestedValue(row, col.key) }}
            </td>
            <td v-if="showActions" class="table-cell action-cell">
              <button
                v-if="onEdit"
                class="action-btn edit-btn"
                @click="onEdit(row)"
                title="Edit"
              >
                ✎
              </button>
              <button
                v-if="onDelete"
                class="action-btn delete-btn"
                @click="onDelete(row)"
                title="Delete"
              >
                ✕
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="table-pagination">
      <button
        :disabled="currentPage === 1"
        class="pagination-btn"
        @click="currentPage--"
      >
        Previous
      </button>
      <span class="pagination-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button
        :disabled="currentPage === totalPages"
        class="pagination-btn"
        @click="currentPage++"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Column {
  key: string;
  label: string;
}

interface Row {
  id: string | number;
  [key: string]: any;
}

interface Props {
  columns: Column[];
  rows: Row[];
  enableSearch?: boolean;
  showActions?: boolean;
  pageSize?: number;
  onEdit?: (row: Row) => void;
  onDelete?: (row: Row) => void;
}

const props = withDefaults(defineProps<Props>(), {
  enableSearch: true,
  showActions: true,
  pageSize: 10
});

const searchQuery = ref('');
const currentPage = ref(1);
const sortColumn = ref('');
const sortDirection = ref<'asc' | 'desc'>('asc');

const filteredRows = computed(() => {
  let filtered = [...props.rows];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((row) =>
      props.columns.some((col) =>
        String(getNestedValue(row, col.key)).toLowerCase().includes(query)
      )
    );
  }

  if (sortColumn.value) {
    filtered.sort((a, b) => {
      const aVal = getNestedValue(a, sortColumn.value);
      const bVal = getNestedValue(b, sortColumn.value);

      if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredRows.value.length / props.pageSize)
);

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize;
  return filteredRows.value.slice(start, start + props.pageSize);
});

const sortBy = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
  currentPage.value = 1;
};

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
};
</script>

<style scoped>
.master-table-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-search-bar {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.search-input {
  width: 100%;
  max-width: 300px;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.table-container {
  overflow-x: auto;
}

.master-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.table-header {
  background-color: #f5f5f5;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
  cursor: pointer;
  user-select: none;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-icon {
  font-size: 0.75rem;
  color: #2196f3;
}

.table-row:hover {
  background-color: #f9f9f9;
}

.table-cell {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  color: #555;
}

.no-data-row .no-data {
  text-align: center;
  color: #999;
  padding: 2rem !important;
}

.action-cell {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.edit-btn {
  background-color: #2196f3;
  color: white;
}

.edit-btn:hover {
  background-color: #1976d2;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

.table-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f5f5f5;
  border-color: #2196f3;
}

.pagination-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination-info {
  color: #666;
  font-size: 0.95rem;
}
</style>

import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'
import { isAbortError } from '@/api/requestManager'

export const useTableStore = defineStore('table', () => {
  const tables = ref([])
  const selectedTable = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchTables(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/tables', { params: filters })
      tables.value = response.data
    } catch (err) {
      if (isAbortError(err)) throw err
      error.value = 'Failed to fetch tables'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function getTableDetails(tableId) {
    try {
      const response = await api.get(`/tables/${tableId}`)
      return response.data
    } catch (err) {
      if (isAbortError(err)) throw err
      error.value = 'Failed to fetch table details'
      throw err
    }
  }

  async function updateTableStatus(tableId, status) {
    try {
      const response = await api.put(`/tables/${tableId}/status`, { status })
      const index = tables.value.findIndex(t => t.id === tableId)
      if (index !== -1) {
        tables.value[index] = response.data
      }
      return response.data
    } catch (err) {
      if (isAbortError(err)) throw err
      error.value = 'Failed to update table status'
      throw err
    }
  }

  async function assignTable(tableId, numberOfGuests) {
    try {
      const response = await api.post(`/tables/${tableId}/assign`, { number_of_guests: numberOfGuests })
      selectedTable.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to assign table'
      throw err
    }
  }

  async function releaseTable(tableId) {
    try {
      const response = await api.post(`/tables/${tableId}/release`)
      return response.data
    } catch (err) {
      error.value = 'Failed to release table'
      throw err
    }
  }

  async function mergeTables(primaryTableId, mergedTableIds) {
    try {
      const response = await api.post('/tables/merge', {
        primary_table_id: primaryTableId,
        merged_table_ids: mergedTableIds,
      })
      return response.data
    } catch (err) {
      error.value = 'Failed to merge tables'
      throw err
    }
  }

  function selectTable(table) {
    selectedTable.value = table
  }

  return {
    tables,
    selectedTable,
    loading,
    error,
    fetchTables,
    getTableDetails,
    updateTableStatus,
    assignTable,
    releaseTable,
    mergeTables,
    selectTable,
  }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'
import { isAbortError } from '@/api/requestManager'
import {
  subscribeFirestoreList,
  syncTableFirestore,
  syncTablesFirestore,
} from '@/services/firebaseFirestoreService'

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
      tables.value = response.data?.data || response.data
      await syncTablesFirestore(Array.isArray(tables.value) ? tables.value : [])
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
      return response.data?.data || response.data
    } catch (err) {
      if (isAbortError(err)) throw err
      error.value = 'Failed to fetch table details'
      throw err
    }
  }

  async function updateTableStatus(tableId, status) {
    try {
      const response = await api.put(`/tables/${tableId}/status`, { status })
      const updated = response.data?.data || response.data
      const index = tables.value.findIndex(t => t.id === tableId)
      if (index !== -1) {
        tables.value[index] = updated
      }
      await syncTableFirestore(updated)
      return updated
    } catch (err) {
      if (isAbortError(err)) throw err
      error.value = 'Failed to update table status'
      throw err
    }
  }

  async function assignTable(tableId, numberOfGuests) {
    try {
      const response = await api.post(`/tables/${tableId}/assign`, { number_of_guests: numberOfGuests })
      const updated = response.data?.data || response.data
      selectedTable.value = updated
      await syncTableFirestore(updated)
      return updated
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to assign table'
      throw err
    }
  }

  async function releaseTable(tableId) {
    try {
      const response = await api.post(`/tables/${tableId}/release`)
      const updated = response.data?.data || response.data
      await syncTableFirestore(updated)
      return updated
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

  function subscribeToTables(options = {}) {
    return subscribeFirestoreList('tables', (firestoreTables) => {
      tables.value = firestoreTables.sort((a, b) => {
        const left = Number(a.table_number || a.id || 0)
        const right = Number(b.table_number || b.id || 0)
        return left - right
      })
    }, options)
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
    subscribeToTables,
  }
})

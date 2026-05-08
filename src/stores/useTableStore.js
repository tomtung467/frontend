import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'
import { isAbortError } from '@/api/requestManager'

export const useTableStore = defineStore('table', () => {
  const tables = ref([])
  const selectedTable = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchTables(filters = {}, options = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/tables', { params: filters })
      tables.value = response.data?.data || response.data
      if (options.syncFirestore !== false) await syncTables(Array.isArray(tables.value) ? tables.value : [])
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
      patchLocalTable(tableId, updated)
      await syncTable(updated)
      return updated
    } catch (err) {
      if (isAbortError(err)) throw err
      error.value = 'Failed to update table status'
      throw err
    }
  }

  async function createTable(data) {
    try {
      const response = await api.post('/tables', data)
      const created = response.data?.data || response.data
      tables.value = [...tables.value, created]
      await syncTable(created)
      return created
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create table'
      throw err
    }
  }

  async function updateTable(tableId, data) {
    try {
      const response = await api.put(`/tables/${tableId}`, data)
      const updated = response.data?.data || response.data
      const merged = patchLocalTable(tableId, updated)
      await syncTable(merged || updated)
      return updated
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update table'
      throw err
    }
  }

  async function deleteTable(tableId) {
    try {
      await api.delete(`/tables/${tableId}`)
      tables.value = tables.value.filter(t => t.id !== tableId)
      await syncTables(tables.value)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete table'
      throw err
    }
  }

  async function assignTable(tableId, numberOfGuests) {
    try {
      const response = await api.post(`/tables/${tableId}/assign`, { number_of_guests: numberOfGuests })
      const updated = response.data?.data || response.data
      selectedTable.value = updated
      patchLocalTable(tableId, updated)
      await syncTable(updated)
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
      patchLocalTable(tableId, updated)
      await syncTable(updated)
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
      await fetchTables()
      return response.data
    } catch (err) {
      error.value = 'Failed to merge tables'
      throw err
    }
  }

  async function unmergeTables(primaryTableId) {
    try {
      const response = await api.post(`/tables/merge/${primaryTableId}/unmerge`)
      await fetchTables()
      return response.data
    } catch (err) {
      error.value = 'Failed to unmerge tables'
      throw err
    }
  }

  function patchLocalTable(tableId, data) {
    const index = tables.value.findIndex(t => t.id === tableId)
    if (index === -1) return null
    tables.value[index] = { ...tables.value[index], ...data }
    return tables.value[index]
  }

  function selectTable(table) {
    selectedTable.value = table
  }

  function subscribeToTables(options = {}) {
    let unsubscribe = null
    let closed = false

    import('@/services/firebaseFirestoreService').then(({ subscribeFirestoreList }) => {
      if (closed) return
      unsubscribe = subscribeFirestoreList('tables', (firestoreTables) => {
        tables.value = firestoreTables.sort((a, b) => {
          const left = Number(a.table_number || a.id || 0)
          const right = Number(b.table_number || b.id || 0)
          return left - right
        })
      }, options)
    })

    return () => {
      closed = true
      unsubscribe?.()
    }
  }

  async function syncTables(records) {
    const { syncTablesFirestore } = await import('@/services/firebaseFirestoreService')
    await syncTablesFirestore(records)
  }

  async function syncTable(table) {
    const { syncTableFirestore } = await import('@/services/firebaseFirestoreService')
    await syncTableFirestore(table)
  }

  return {
    tables,
    selectedTable,
    loading,
    error,
    fetchTables,
    getTableDetails,
    updateTableStatus,
    createTable,
    updateTable,
    deleteTable,
    assignTable,
    releaseTable,
    mergeTables,
    unmergeTables,
    selectTable,
    subscribeToTables,
  }
})

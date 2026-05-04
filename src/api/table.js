import api from './index'

export const tableAPI = {
  getAllTables(params = {}) {
    return api.get('/tables', { params })
  },

  getTableDetails(tableId) {
    return api.get(`/tables/${tableId}`)
  },

  updateTableStatus(tableId, status) {
    return api.put(`/tables/${tableId}/status`, { status })
  },

  assignTable(tableId, data) {
    return api.post(`/tables/${tableId}/assign`, data)
  },

  releaseTable(tableId) {
    return api.post(`/tables/${tableId}/release`)
  },

  createReservation(data) {
    return api.post('/reservations', data)
  },

  getReservations(params = {}) {
    return api.get('/reservations', { params })
  },

  mergeTables(data) {
    return api.post('/tables/merge', data)
  },

  unmergeTables(mergeId) {
    return api.post(`/tables/merge/${mergeId}/unmerge`)
  },
}

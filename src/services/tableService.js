import BaseService from './BaseService'

/**
 * Table Service
 * Handles table and reservation management
 */
export default class TableService extends BaseService {
  constructor() {
    super('/tables')
  }

  /**
   * Get all tables
   * @param {Object} filters - { status, area, limit, page }
   */
  async getAllTables(filters = {}) {
    return this.get('', { params: filters })
  }

  /**
   * Get table details
   * @param {number} id - Table ID
   */
  async getTableDetails(id) {
    return this.get(`/${id}`)
  }

  /**
   * Create new table
   * @param {Object} data - { number, capacity, area, section }
   */
  async createTable(data) {
    return this.post('', data)
  }

  /**
   * Update table
   * @param {number} id - Table ID
   * @param {Object} data - Updated table data
   */
  async updateTable(id, data) {
    return this.put(`/${id}`, data)
  }

  /**
   * Delete table
   * @param {number} id - Table ID
   */
  async deleteTable(id) {
    return this.delete(`/${id}`)
  }

  /**
   * Update table status
   * @param {number} id - Table ID
   * @param {string} status - New status (available, occupied, reserved, cleaning)
   */
  async updateTableStatus(id, status) {
    return this.put(`/${id}/status`, { status })
  }

  /**
   * Assign staff to table
   * @param {number} id - Table ID
   * @param {number} staffId - Staff ID
   */
  async assignTable(id, staffId) {
    return this.post(`/${id}/assign`, { staff_id: staffId })
  }

  /**
   * Release table
   * @param {number} id - Table ID
   */
  async releaseTable(id) {
    return this.post(`/${id}/release`, {})
  }

  /**
   * Get floor plan layout
   */
  async getFloorPlan() {
    return this.get('/floor-plan')
  }

  /**
   * Update floor plan layout
   * @param {Object} layout - Floor plan layout data
   */
  async updateFloorPlan(layout) {
    return this.put('/floor-plan', layout)
  }

  /**
   * Merge tables
   * @param {number[]} tableIds - Array of table IDs to merge
   */
  async mergeTables(tableIds) {
    return this.post('/merge', { table_ids: tableIds })
  }

  /**
   * Unmerge tables
   * @param {number} mergedTableId - Merged table ID
   */
  async unmergeTables(mergedTableId) {
    return this.post(`/${mergedTableId}/unmerge`, {})
  }

  /**
   * Create reservation
   * @param {Object} data - { customer_name, phone, table_id, date, time, guests }
   */
  async createReservation(data) {
    return this.post('/reservations', data)
  }

  /**
   * Get reservations
   * @param {Object} filters - { status, date, limit, page }
   */
  async getReservations(filters = {}) {
    return this.get('/reservations', { params: filters })
  }

  /**
   * Get reservation details
   * @param {number} id - Reservation ID
   */
  async getReservationDetails(id) {
    return this.get(`/reservations/${id}`)
  }

  /**
   * Update reservation
   * @param {number} id - Reservation ID
   * @param {Object} data - Updated reservation data
   */
  async updateReservation(id, data) {
    return this.put(`/reservations/${id}`, data)
  }

  /**
   * Cancel reservation
   * @param {number} id - Reservation ID
   * @param {string} reason - Cancellation reason
   */
  async cancelReservation(id, reason = '') {
    return this.delete(`/reservations/${id}`, { data: { reason } })
  }

  /**
   * Check in reservation
   * @param {number} id - Reservation ID
   */
  async checkInReservation(id) {
    return this.post(`/reservations/${id}/check-in`, {})
  }

  /**
   * Get table by reservation
   * @param {number} reservationId - Reservation ID
   */
  async getTableByReservation(reservationId) {
    return this.get(`/reservations/${reservationId}/table`)
  }
}

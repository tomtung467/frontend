import BaseService from './BaseService'

/**
 * Inventory Service
 * Handles inventory and ingredient management
 */
export default class InventoryService extends BaseService {
  constructor() {
    super('/inventory')
  }

  /**
   * Get all inventory items
   * @param {Object} filters - { search, low_stock, limit, page }
   */
  async getInventory(filters = {}) {
    return this.get('', { params: filters })
  }

  /**
   * Get inventory item details
   * @param {number} id - Ingredient ID
   */
  async getItemDetails(id) {
    return this.get(`/${id}`)
  }

  /**
   * Create ingredient
   * @param {Object} data - { name, unit, current_stock, minimum_stock, price }
   */
  async createIngredient(data) {
    return this.post('/ingredients', data)
  }

  /**
   * Update ingredient
   * @param {number} id - Ingredient ID
   * @param {Object} data - Updated ingredient data
   */
  async updateIngredient(id, data) {
    return this.put(`/ingredients/${id}`, data)
  }

  /**
   * Delete ingredient
   * @param {number} id - Ingredient ID
   */
  async deleteIngredient(id) {
    return this.delete(`/ingredients/${id}`)
  }

  /**
   * Update stock quantity
   * @param {number} id - Ingredient ID
   * @param {number} quantity - New quantity
   * @param {string} reason - Reason for adjustment (purchase, adjustment, loss)
   */
  async updateStock(id, quantity, reason = 'adjustment') {
    return this.post(`/${id}/stock`, { quantity, action_type: reason })
  }

  /**
   * Adjust stock
   * @param {number} id - Ingredient ID
   * @param {number} amount - Amount to adjust (positive or negative)
   */
  async adjustStock(id, amount) {
    return this.post(`/${id}/adjust`, { amount })
  }

  /**
   * Get low stock items
   */
  async getLowStockItems() {
    return this.get('/low-stock')
  }

  /**
   * Get inventory logs for item
   * @param {number} id - Ingredient ID
   * @param {Object} filters - { limit, page, from_date, to_date }
   */
  async getInventoryLogs(id, filters = {}) {
    return this.get(`/${id}/logs`, { params: filters })
  }

  /**
   * Get inventory summary
   */
  async getInventorySummary() {
    return this.get('/summary')
  }

  /**
   * Get inventory valuation
   */
  async getInventoryValuation() {
    return this.get('/valuation')
  }

  /**
   * Export inventory report
   * @param {string} format - Export format (csv, pdf, excel)
   */
  async exportInventoryReport(format = 'csv') {
    return this.get('/export', { params: { format } })
  }

  /**
   * Get ingredients by recipe
   * @param {number} recipeId - Recipe ID
   */
  async getRecipeIngredients(recipeId) {
    return this.get(`/recipes/${recipeId}/ingredients`)
  }

  /**
   * Deduct ingredients from stock when order is prepared
   * @param {number} orderId - Order ID
   */
  async deductOrderIngredients(orderId) {
    return this.post(`/orders/${orderId}/deduct-ingredients`, {})
  }
}

import api from './index'

export const inventoryAPI = {
  getInventory(params = {}) {
    return api.get('/inventory', { params })
  },

  getIngredientDetails(ingredientId) {
    return api.get(`/inventory/${ingredientId}`)
  },

  updateStock(ingredientId, quantity) {
    return api.post(`/inventory/${ingredientId}/stock`, { quantity })
  },

  getLowStockItems() {
    return api.get('/inventory/low-stock')
  },

  getInventoryLogs(ingredientId) {
    return api.get(`/inventory/${ingredientId}/logs`)
  },

  createIngredient(data) {
    return api.post('/inventory/ingredients', data)
  },

  updateIngredient(ingredientId, data) {
    return api.put(`/inventory/ingredients/${ingredientId}`, data)
  },
}

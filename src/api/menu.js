import api from './index'

export const menuAPI = {
  getCategories() {
    return api.get('/menu/categories')
  },

  getCategoryFoods(categoryId) {
    return api.get(`/menu/categories/${categoryId}/foods`)
  },

  getFoodDetails(foodId) {
    return api.get(`/menu/foods/${foodId}`)
  },

  getAllMenus() {
    return api.get('/menu')
  },

  createFood(data) {
    return api.post('/menu/foods', data)
  },

  updateFood(foodId, data) {
    return api.put(`/menu/foods/${foodId}`, data)
  },

  deleteFood(foodId) {
    return api.delete(`/menu/foods/${foodId}`)
  },

  getRecipes() {
    return api.get('/menu/recipes')
  },

  createRecipe(data) {
    return api.post('/menu/recipes', data)
  },
}

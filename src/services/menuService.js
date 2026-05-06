import BaseService from './BaseService'

/**
 * Menu Service
 * Handles menu, food, category and recipe management
 */
export default class MenuService extends BaseService {
  constructor() {
    super('/menu')
  }

  // ============== CATEGORIES ==============

  /**
   * Get all categories
   */
  async getCategories(filters = {}) {
    return this.get('/categories', { params: filters })
  }

  /**
   * Get category by ID
   * @param {number} id - Category ID
   */
  async getCategoryById(id) {
    return this.get(`/categories/${id}`)
  }

  /**
   * Create new category
   * @param {Object} data - { name, description, image_url }
   */
  async createCategory(data) {
    return this.post('/categories', data)
  }

  /**
   * Update category
   * @param {number} id - Category ID
   * @param {Object} data - { name, description, image_url }
   */
  async updateCategory(id, data) {
    return this.put(`/categories/${id}`, data)
  }

  /**
   * Delete category
   * @param {number} id - Category ID
   */
  async deleteCategory(id) {
    return this.delete(`/categories/${id}`)
  }

  // ============== FOODS ==============

  /**
   * Get all foods
   * @param {Object} filters - Optional filters { category_id, search, limit, page }
   */
  async getFoods(filters = {}) {
    return this.get('/foods', { params: filters })
  }

  /**
   * Get foods by category
   * @param {number} categoryId - Category ID
   */
  async getCategoryFoods(categoryId) {
    return this.get(`/categories/${categoryId}/foods`)
  }

  /**
   * Get food details
   * @param {number} id - Food ID
   */
  async getFoodDetails(id) {
    return this.get(`/foods/${id}`)
  }

  /**
   * Create new food
   * @param {Object} data - { name, description, price, category_id, image_url }
   */
  async createFood(data) {
    return this.post('/foods', data)
  }

  /**
   * Update food
   * @param {number} id - Food ID
   * @param {Object} data - { name, description, price, category_id, image_url }
   */
  async updateFood(id, data) {
    return this.put(`/foods/${id}`, data)
  }

  /**
   * Delete food
   * @param {number} id - Food ID
   */
  async deleteFood(id) {
    return this.delete(`/foods/${id}`)
  }

  // ============== RECIPES ==============

  /**
   * Get all recipes
   */
  async getRecipes() {
    return this.get('/recipes')
  }

  /**
   * Get recipe details
   * @param {number} id - Recipe ID
   */
  async getRecipeDetails(id) {
    return this.get(`/recipes/${id}`)
  }

  /**
   * Create recipe
   * @param {Object} data - { name, food_id, ingredients[] }
   */
  async createRecipe(data) {
    return this.post('/recipes', data)
  }

  /**
   * Update recipe
   * @param {number} id - Recipe ID
   * @param {Object} data - { name, ingredients[] }
   */
  async updateRecipe(id, data) {
    return this.put(`/recipes/${id}`, data)
  }

  /**
   * Delete recipe
   * @param {number} id - Recipe ID
   */
  async deleteRecipe(id) {
    return this.delete(`/recipes/${id}`)
  }

  /**
   * Get complete menu (all categories with foods)
   */
  async getCompleteMenu() {
    return this.get('/complete-menu')
  }

  /**
   * Search foods
   * @param {string} query - Search query
   */
  async searchFoods(query) {
    return this.get('/foods', { params: { search: query } })
  }
}

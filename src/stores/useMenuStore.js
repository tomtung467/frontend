import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useMenuStore = defineStore('menu', () => {
  const categories = ref([])
  const foods = ref([])
  const recipes = ref([])
  const selectedCategory = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/menu/categories')
      categories.value = response.data
    } catch (err) {
      error.value = 'Failed to fetch categories'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchCategoryFoods(categoryId) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/menu/categories/${categoryId}/foods`)
      foods.value = response.data.foods
      selectedCategory.value = response.data.category
    } catch (err) {
      error.value = 'Failed to fetch foods'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchAllMenus() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/menu')
      return response.data
    } catch (err) {
      error.value = 'Failed to fetch menu'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchRecipes() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/menu/recipes')
      recipes.value = response.data
    } catch (err) {
      error.value = 'Failed to fetch recipes'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function getFoodDetails(foodId) {
    try {
      const response = await api.get(`/menu/foods/${foodId}`)
      return response.data
    } catch (err) {
      error.value = 'Failed to fetch food details'
      throw err
    }
  }

  return {
    categories,
    foods,
    recipes,
    selectedCategory,
    loading,
    error,
    fetchCategories,
    fetchCategoryFoods,
    fetchAllMenus,
    fetchRecipes,
    getFoodDetails,
  }
})

<template>
  <MasterLayout show-footer>
    <main class="ops-page">
      <MasterPageHeader :title="t('menu.title')">
        <template #actions>
          <button class="primary-action" @click="saveFood" :disabled="saving">
            {{ saving ? t('menu.saving') : editingId ? t('menu.updateDish') : t('menu.addDish') }}
          </button>
        </template>
      </MasterPageHeader>

      <section class="toolbar">
        <input v-model="search" type="search" :placeholder="t('menu.searchDishes')" />
        <select v-model="categoryFilter">
          <option value="">{{ t('menu.allCategories') }}</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
        <button class="ghost-action" @click="resetForm">{{ t('menu.clearForm') }}</button>
      </section>

      <form class="inline-form" @submit.prevent="saveFood">
        <input v-model="form.name" required :placeholder="t('menu.dishName')" />
        <select v-model="form.category_id" required>
          <option value="" disabled>{{ t('menu.category') }}</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
        <input v-model.number="form.price" required type="number" step="1000" :placeholder="t('menu.price')" />
        <input v-model.number="form.preparation_time" type="number" :placeholder="t('menu.minutes')" />
        <input v-model="form.image_url" :placeholder="t('menu.imageUrl')" />
        <input ref="fileInput" type="file" accept="image/*" @change="handleImageFile" />
        <label class="checkbox"><input v-model="form.is_available" type="checkbox" /> {{ t('menu.available') }}</label>
        <label class="checkbox"><input v-model="form.is_popular" type="checkbox" /> {{ t('menu.popular') }}</label>
        <textarea v-model="form.description" :placeholder="t('menu.description')"></textarea>
      </form>

      <div v-if="form.image_url" class="image-preview">
        <img :src="dishImageUrl({ image_url: form.image_url, name: form.name })" alt="Dish preview" />
        <button class="ghost-action" @click="removeImage">{{ t('menu.removeImage') }}</button>
      </div>

      <p v-if="error" class="state error">{{ error }}</p>
      <p v-else-if="loading" class="state">{{ t('menu.loading') }}</p>
      <p v-else-if="filteredFoods.length === 0" class="state">{{ t('menu.noDishes') }}</p>

      <div v-else class="menu-grid">
        <article v-for="food in filteredFoods" :key="food.id" class="dish">
          <div>
            <img class="dish-image" :src="dishImageUrl(food)" :alt="food.name || food.food_name" />
            <div class="dish-title">
              <h2>{{ food.name || food.food_name }}</h2>
              <span class="badge" :class="{ muted: !food.is_available }">
                {{ food.is_available ? t('menu.available') : t('menu.hidden') }}
              </span>
            </div>
            <p>{{ food.description || t('menu.noDescription') }}</p>
          </div>
          <div class="dish-meta">
            <span>{{ food.category?.name || categoryName(food.category_id) }}</span>
            <strong>{{ formatCurrency(food.price) }}</strong>
          </div>
          <div class="dish-actions">
            <button @click="editFood(food)">{{ t('menu.edit') }}</button>
            <button class="danger" @click="deleteFood(food)" :disabled="saving">{{ t('menu.delete') }}</button>
          </div>
        </article>
      </div>
    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { isAbortError } from '@/api/requestManager'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import { menuService } from '@/services'
import { resolveAssetUrl } from '@/utils/assetUrl'
import { currentLanguage, t } from '@/languages'

const foods = ref([])
const categories = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const search = ref('')
const categoryFilter = ref('')
const editingId = ref(null)
const fileInput = ref(null)
const selectedImageFile = ref(null)

const blankForm = {
  name: '',
  category_id: '',
  price: null,
  preparation_time: null,
  image_url: '',
  description: '',
  is_available: true,
  is_popular: false,
}
const form = reactive({ ...blankForm })

const filteredFoods = computed(() => {
  const query = search.value.trim().toLowerCase()
  return foods.value.filter((food) => {
    const name = (food.name || food.food_name || '').toLowerCase()
    const matchesSearch = !query || name.includes(query) || food.description?.toLowerCase().includes(query)
    const matchesCategory = !categoryFilter.value || Number(food.category_id) === Number(categoryFilter.value)
    return matchesSearch && matchesCategory
  })
})

onMounted(loadData)

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const [foodList, categoryList] = await Promise.all([
      menuService.getFoods({ fields: 'id,name,price,category_id,description,is_available,is_popular,image_url,preparation_time' }),
      menuService.getCategories({ simple: 1 }),
    ])
    foods.value = foodList
    categories.value = categoryList
  } catch (err) {
    if (isAbortError(err)) return
    error.value = err.message || t('menu.failedLoad')
  } finally {
    loading.value = false
  }
}

async function saveFood() {
  if (!form.name || !form.category_id || !form.price) return
  saving.value = true
  error.value = ''
  try {
    const { data, config } = buildFoodPayload()
    if (editingId.value) {
      await menuService.updateFood(editingId.value, data, config)
    } else {
      await menuService.createFood(data, config)
    }
    resetForm()
    await loadData()
  } catch (err) {
    error.value = err.message || t('menu.failedSave')
  } finally {
    saving.value = false
  }
}

function editFood(food) {
  editingId.value = food.id
  Object.assign(form, {
    name: food.name || food.food_name || '',
    category_id: food.category_id || '',
    price: Number(food.price || 0),
    preparation_time: food.preparation_time || null,
    description: food.description || '',
    is_available: Boolean(food.is_available),
    is_popular: Boolean(food.is_popular),
    image_url: food.image_url || '',
  })
}

async function deleteFood(food) {
  saving.value = true
  error.value = ''
  try {
    await menuService.deleteFood(food.id)
    if (editingId.value === food.id) resetForm()
    await loadData()
  } catch (err) {
    error.value = err.message || t('menu.failedDelete')
  } finally {
    saving.value = false
  }
}

function resetForm() {
  editingId.value = null
  selectedImageFile.value = null
  Object.assign(form, { ...blankForm })
  if (fileInput.value) fileInput.value.value = ''
}

function buildFoodPayload() {
  if (!selectedImageFile.value) {
    return {
      data: { ...form },
      config: {},
    }
  }

  const data = new FormData()
  data.append('name', form.name)
  data.append('category_id', form.category_id)
  data.append('price', form.price)
  data.append('is_available', form.is_available ? '1' : '0')
  data.append('is_popular', form.is_popular ? '1' : '0')
  data.append('image_file', selectedImageFile.value)

  if (form.description) data.append('description', form.description)
  if (form.preparation_time) data.append('preparation_time', form.preparation_time)

  return {
    data,
    config: { headers: { 'Content-Type': 'multipart/form-data' } },
  }
}

function categoryName(id) {
  return categories.value.find((category) => Number(category.id) === Number(id))?.name || t('menu.uncategorized')
}

function formatCurrency(value) {
  return new Intl.NumberFormat(currentLanguage.value === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value || 0))
}

async function handleImageFile(event) {
  const file = event.target.files?.[0]
  if (!file) return

  error.value = ''

  if (!file.type.startsWith('image/')) {
    error.value = t('menu.chooseImage')
    if (fileInput.value) fileInput.value.value = ''
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    error.value = t('menu.imageTooLarge')
    if (fileInput.value) fileInput.value.value = ''
    return
  }

  selectedImageFile.value = file
  form.image_url = URL.createObjectURL(file)
}

function removeImage() {
  if (form.image_url?.startsWith('blob:')) {
    URL.revokeObjectURL(form.image_url)
  }
  selectedImageFile.value = null
  form.image_url = ''
  if (fileInput.value) fileInput.value.value = ''
}

function fallbackImage(food) {
  const label = encodeURIComponent(food.name || food.food_name || 'Dish')
  return `https://placehold.co/640x420/f3f4f6/344054?text=${label}`
}

function dishImageUrl(food) {
  return food.image_url ? resolveAssetUrl(food.image_url) : fallbackImage(food)
}
</script>

<style scoped>
.ops-page { padding: 24px; width: min(1320px, 100%); margin: 0 auto; }
.toolbar, .inline-form, .dish-title, .dish-meta, .dish-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
h2 { margin: 0; font-size: 18px; color: #111827; }
.toolbar, .inline-form { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 14px; }
input, select, textarea { min-height: 38px; border: 1px solid #d0d5dd; border-radius: 6px; padding: 0 10px; background: #fff; }
textarea { padding-top: 9px; min-width: 260px; min-height: 38px; resize: vertical; }
.toolbar input { min-width: 280px; flex: 1; }
.inline-form input, .inline-form select { flex: 1 1 150px; }
.inline-form input[type="file"] { padding-top: 7px; }
.image-preview { display: flex; gap: 12px; align-items: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 14px; }
.image-preview img { width: 96px; height: 72px; object-fit: cover; border-radius: 6px; background: #f2f4f7; }
.checkbox { display: inline-flex; gap: 8px; align-items: center; color: #344054; }
.checkbox input { min-height: auto; }
button { border: 0; border-radius: 6px; min-height: 38px; padding: 0 14px; cursor: pointer; background: #344054; color: #fff; }
button:disabled { opacity: .55; cursor: not-allowed; }
.primary-action { background: #155eef; }
.ghost-action { background: #f2f4f7; color: #344054; }
.danger { background: #b42318; }
.state { padding: 18px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; color: #475467; }
.state.error { color: #b42318; border-color: #fecdca; background: #fffbfa; }
.menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
.dish { display: flex; flex-direction: column; justify-content: space-between; gap: 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; min-height: 190px; }
.dish-image { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border-radius: 6px; background: #f2f4f7; margin-bottom: 12px; }
.dish p { color: #667085; margin: 8px 0 0; }
.dish-title, .dish-meta, .dish-actions { justify-content: space-between; }
.dish-meta { color: #475467; }
.dish-meta strong { color: #111827; }
.badge { border-radius: 999px; padding: 4px 9px; font-size: 12px; background: #ecfdf3; color: #027a48; }
.badge.muted { background: #f2f4f7; color: #667085; }
@media (max-width: 720px) { .ops-page { padding: 16px; } .toolbar input { min-width: 100%; } }
</style>

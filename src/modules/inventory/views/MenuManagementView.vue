<template>
  <MasterLayout show-footer>
    <main class="ops-page">
      <MasterPageHeader :title="t('menu.title')">
        <template #actions>
          <div class="header-controls">
            <input v-model="search" type="search" :placeholder="t('menu.searchDishes')" />
            <select v-model="categoryFilter">
              <option value="">{{ t('menu.allCategories') }}</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
            </select>
          </div>
          <button class="primary-action" @click="openCreateModal">
            {{ t('menu.addDish') }}
          </button>
        </template>
      </MasterPageHeader>

      <p v-if="loading" class="state">{{ t('menu.loading') }}</p>
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
            <button @click="openEditModal(food)">{{ t('menu.edit') }}</button>
            <button class="danger" @click="askDeleteFood(food)" :disabled="saving">{{ t('menu.delete') }}</button>
          </div>
        </article>
      </div>

      <Teleport to="body">
        <transition name="drawer-fade">
          <div v-if="formModalOpen" class="drawer-backdrop" @click.self="closeFormModal">
            <aside class="dish-drawer" role="dialog" aria-modal="true">
              <header class="drawer-header">
                <div>
                  <h2>{{ editingId ? t('menu.updateDish') : t('menu.addDish') }}</h2>
                  <p>{{ editingId ? form.name : t('menu.newDishHint') }}</p>
                </div>
                <button class="icon-action" type="button" aria-label="Close" @click="closeFormModal">&times;</button>
              </header>

              <form class="drawer-form" @submit.prevent="saveFood">
                <label>
                  <span>{{ t('menu.dishName') }}</span>
                  <input v-model="form.name" required :placeholder="t('menu.dishName')" />
                </label>

                <div class="form-row">
                  <label>
                    <span>{{ t('menu.category') }}</span>
                    <select v-model="form.category_id" required>
                      <option value="" disabled>{{ t('menu.category') }}</option>
                      <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
                    </select>
                  </label>
                  <label>
                    <span>{{ t('menu.price') }}</span>
                    <input v-model.number="form.price" required type="number" step="1000" :placeholder="t('menu.price')" />
                  </label>
                </div>

                <div class="form-row">
                  <label>
                    <span>{{ t('menu.minutes') }}</span>
                    <input v-model.number="form.preparation_time" type="number" :placeholder="t('menu.minutes')" />
                  </label>
                  <div class="switches drawer-switches">
                    <label class="checkbox"><input v-model="form.is_available" type="checkbox" /> {{ t('menu.available') }}</label>
                    <label class="checkbox"><input v-model="form.is_popular" type="checkbox" /> {{ t('menu.popular') }}</label>
                  </div>
                </div>

                <label class="upload-field drawer-upload">
                  <input ref="fileInput" type="file" accept="image/*" @change="handleImageFile" />
                  <span>{{ selectedImageFile ? selectedImageFile.name : t('menu.chooseImage') }}</span>
                </label>

                <div v-if="form.image_url" class="image-preview">
                  <img :src="dishImageUrl({ image_url: form.image_url, name: form.name })" alt="Dish preview" />
                  <button type="button" class="ghost-action" @click="removeImage">{{ t('menu.removeImage') }}</button>
                </div>

                <label>
                  <span>{{ t('menu.description') }}</span>
                  <textarea v-model="form.description" :placeholder="t('menu.description')"></textarea>
                </label>

                <footer class="drawer-actions">
                  <button type="button" class="ghost-action" @click="closeFormModal">{{ t('user.cancel') }}</button>
                  <button class="primary-action" :disabled="saving">
                    {{ saving ? t('menu.saving') : editingId ? t('menu.updateDish') : t('menu.addDish') }}
                  </button>
                </footer>
              </form>
            </aside>
          </div>
        </transition>
      </Teleport>

      <UiPopup
        v-model="popup.open"
        :type="popup.type"
        :title="popup.title"
        :message="popup.message"
        :confirm-text="popup.confirmText"
        :cancel-text="popup.cancelText"
        @confirm="handlePopupConfirm"
        @cancel="closePopup"
      />
    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { isAbortError } from '@/api/requestManager'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import UiPopup from '@/components/common/UiPopup.vue'
import { showNotification } from '@/composables/usePopup'
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
const formModalOpen = ref(false)
const fileInput = ref(null)
const selectedImageFile = ref(null)
const pendingDelete = ref(null)
const popup = reactive({
  open: false,
  type: 'info',
  title: '',
  message: '',
  confirmText: 'OK',
  cancelText: '',
  action: '',
})

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
  const wasEditing = Boolean(editingId.value)
  try {
    const { data, config } = buildFoodPayload()
    if (editingId.value) {
      await menuService.updateFood(editingId.value, data, config)
    } else {
      await menuService.createFood(data, config)
    }
    resetForm()
    formModalOpen.value = false
    await loadData()
    showPopup('success', t('common.saved'), wasEditing ? t('menu.updateDish') : t('menu.addDish'))
  } catch (err) {
    showPopup('danger', t('common.error'), err.message || t('menu.failedSave'))
  } finally {
    saving.value = false
  }
}

function openCreateModal() {
  resetForm()
  formModalOpen.value = true
}

function openEditModal(food) {
  editFood(food)
  formModalOpen.value = true
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

function closeFormModal() {
  formModalOpen.value = false
  resetForm()
}

function askDeleteFood(food) {
  pendingDelete.value = food
  Object.assign(popup, {
    open: true,
    type: 'danger',
    title: t('menu.deleteDishTitle') || t('menu.delete'),
    message: `${t('menu.deleteDishBody')} ${food.name || food.food_name}?`,
    confirmText: t('menu.delete'),
    cancelText: t('user.cancel'),
    action: 'delete',
  })
}

async function deleteFood(food) {
  saving.value = true
  error.value = ''
  try {
    await menuService.deleteFood(food.id)
    if (editingId.value === food.id) resetForm()
    await loadData()
    showPopup('success', t('menu.deleted'), t('menu.deletedBody'))
  } catch (err) {
    showPopup('danger', t('common.error'), err.message || t('menu.failedDelete'))
  } finally {
    saving.value = false
  }
}

function handlePopupConfirm() {
  const action = popup.action
  closePopup()
  if (action === 'delete' && pendingDelete.value) {
    deleteFood(pendingDelete.value)
    pendingDelete.value = null
  }
}

function showPopup(type, title, message = '') {
  showNotification({ type, title, message })
}

function closePopup() {
  popup.open = false
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
    showPopup('danger', t('common.error'), error.value)
    if (fileInput.value) fileInput.value.value = ''
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    error.value = t('menu.imageTooLarge')
    showPopup('danger', t('common.error'), error.value)
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
.ops-page { padding: 24px; width: min(1320px, 100%); margin: 0 auto; box-sizing: border-box; }
.header-controls, .dish-title, .dish-meta, .dish-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
h2 { margin: 0; font-size: 18px; color: #111827; }
.header-controls input { width: min(360px, 42vw); }
.header-controls select { width: 210px; }
input, select, textarea { min-height: 38px; border: 1px solid #d0d5dd; border-radius: 6px; padding: 0 10px; background: #fff; }
textarea { padding-top: 9px; min-height: 108px; resize: vertical; }
.upload-field { display: flex; align-items: center; min-height: 38px; border: 1px dashed #98a2b3; border-radius: 6px; padding: 0 12px; color: #344054; background: #f9fafb; cursor: pointer; }
.upload-field input { display: none; }
.switches { display: flex; align-items: center; gap: 14px; }
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
.menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr)); gap: 14px; }
.dish { display: flex; flex-direction: column; justify-content: space-between; gap: 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; min-height: 190px; }
.dish-image { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border-radius: 6px; background: #f2f4f7; margin-bottom: 12px; }
.dish p { color: #667085; margin: 8px 0 0; }
.dish-title, .dish-meta, .dish-actions { justify-content: space-between; }
.dish-meta { color: #475467; }
.dish-meta strong { color: #111827; }
.badge { border-radius: 999px; padding: 4px 9px; font-size: 12px; background: #ecfdf3; color: #027a48; }
.badge.muted { background: #f2f4f7; color: #667085; }
.drawer-backdrop { position: fixed; inset: 0; z-index: 2900; display: flex; justify-content: flex-end; background: rgba(15, 23, 42, .34); }
.dish-drawer { width: min(560px, 100%); height: 100%; overflow-y: auto; background: #fff; box-shadow: -18px 0 44px rgba(15, 23, 42, .18); }
.drawer-header { position: sticky; top: 0; z-index: 1; display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; padding: 22px 24px; border-bottom: 1px solid #eaecf0; background: #fff; }
.drawer-header h2 { font-size: 24px; }
.drawer-header p { margin: 6px 0 0; color: #667085; }
.icon-action { display: grid; place-items: center; width: 38px; height: 38px; min-height: 38px; border-radius: 7px; padding: 0; background: #f2f4f7; color: #344054; font-size: 26px; line-height: 1; }
.drawer-form { display: grid; gap: 16px; padding: 20px 24px 24px; }
.drawer-form label { display: grid; gap: 7px; color: #344054; font-weight: 700; }
.drawer-form input, .drawer-form select, .drawer-form textarea { width: 100%; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: end; }
.drawer-switches { min-height: 38px; }
.drawer-upload { font-weight: 500; }
.drawer-actions { position: sticky; bottom: 0; display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid #eaecf0; background: #fff; }
.drawer-fade-enter-active, .drawer-fade-leave-active { transition: opacity .18s ease; }
.drawer-fade-enter-active .dish-drawer, .drawer-fade-leave-active .dish-drawer { transition: transform .2s ease; }
.drawer-fade-enter-from, .drawer-fade-leave-to { opacity: 0; }
.drawer-fade-enter-from .dish-drawer, .drawer-fade-leave-to .dish-drawer { transform: translateX(28px); }
@media (max-width: 720px) { .ops-page { padding: 16px; } .header-controls, .header-controls input, .header-controls select { width: 100%; } .form-row { grid-template-columns: 1fr; } .dish { padding: 14px; } }
</style>

<template>
  <MasterLayout show-footer>
    <main class="profile-page">
      <MasterPageHeader :title="t('user.profile')" />

      <section class="profile-grid">
        <form class="profile-panel" @submit.prevent="updateProfile">
          <div class="profile-hero">
            <div class="avatar">{{ userInitials }}</div>
            <div>
              <h2>{{ user.name || t('user.fallbackName') }}</h2>
              <p>{{ user.email }}</p>
            </div>
          </div>

          <div class="form-grid">
            <label>
              <span>{{ t('profile.fullName') }}</span>
              <input v-model="form.name" required />
            </label>
            <label>
              <span>Email</span>
              <input v-model="form.email" disabled />
            </label>
            <label>
              <span>{{ t('profile.phone') }}</span>
              <input v-model="form.phone" />
            </label>
            <label>
              <span>{{ t('profile.address') }}</span>
              <input v-model="form.address" />
            </label>
            <label class="wide">
              <span>{{ t('profile.bio') }}</span>
              <textarea v-model="form.bio"></textarea>
            </label>
          </div>

          <div class="actions">
            <button class="primary-action" :disabled="savingProfile">{{ savingProfile ? t('menu.saving') : t('profile.saveChanges') }}</button>
            <button type="button" class="ghost-action" @click="initializeForm">{{ t('user.cancel') }}</button>
          </div>
        </form>

        <aside class="side-panel">
          <h2>{{ t('profile.account') }}</h2>
          <dl>
            <div><dt>{{ t('profile.role') }}</dt><dd>{{ user.role || '-' }}</dd></div>
            <div><dt>{{ t('profile.joinedAt') }}</dt><dd>{{ formatDate(user.created_at) }}</dd></div>
          </dl>
          <button class="primary-action full" @click="showPasswordForm = !showPasswordForm">
            {{ t('user.changePassword') }}
          </button>
          <button class="ghost-action full" @click="goToSettings">{{ t('user.settings') }}</button>
        </aside>
      </section>

      <section v-if="showPasswordForm" class="profile-panel password-panel">
        <div class="panel-head">
          <h2>{{ t('user.changePassword') }}</h2>
          <button class="ghost-action" @click="resetPasswordForm">{{ t('user.cancel') }}</button>
        </div>
        <form class="form-grid" @submit.prevent="changePassword">
          <label>
            <span>{{ t('profile.currentPassword') }}</span>
            <input v-model="passwordForm.current_password" type="password" required />
          </label>
          <label>
            <span>{{ t('profile.newPassword') }}</span>
            <input v-model="passwordForm.new_password" type="password" required minlength="8" />
          </label>
          <label>
            <span>{{ t('profile.confirmPassword') }}</span>
            <input v-model="passwordForm.password_confirmation" type="password" required minlength="8" />
          </label>
          <div class="password-strength wide">
            <span>{{ t('profile.passwordStrength') }}</span>
            <strong :style="{ color: passwordStrengthColor }">{{ passwordStrengthText }}</strong>
            <i><b :style="{ width: passwordStrength + '%', background: passwordStrengthColor }"></b></i>
          </div>
          <div class="actions wide">
            <button class="primary-action" :disabled="savingPassword">{{ savingPassword ? t('menu.saving') : t('profile.updatePassword') }}</button>
          </div>
        </form>
      </section>

    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import { showNotification } from '@/composables/usePopup'
import { useAuthStore } from '@/stores/useAuthStore'
import { currentLanguage, t } from '@/languages'

const router = useRouter()
const authStore = useAuthStore()
const savingProfile = ref(false)
const savingPassword = ref(false)
const showPasswordForm = ref(false)
const form = reactive({ name: '', email: '', phone: '', address: '', bio: '' })
const passwordForm = reactive({ current_password: '', new_password: '', password_confirmation: '' })

const user = computed(() => authStore.user || {})
const userInitials = computed(() => {
  const source = user.value?.name || user.value?.email || 'U'
  return source.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U'
})

const passwordStrength = computed(() => {
  const pwd = passwordForm.new_password
  let score = 0
  if (pwd.length >= 8) score += 30
  if (pwd.length >= 12) score += 10
  if (/[a-z]/.test(pwd)) score += 15
  if (/[A-Z]/.test(pwd)) score += 15
  if (/[0-9]/.test(pwd)) score += 15
  if (/[^A-Za-z0-9]/.test(pwd)) score += 15
  return Math.min(score, 100)
})

const passwordStrengthColor = computed(() => {
  if (passwordStrength.value < 40) return '#d92d20'
  if (passwordStrength.value < 75) return '#dc6803'
  return '#039855'
})

const passwordStrengthText = computed(() => {
  if (passwordStrength.value < 40) return t('profile.weak')
  if (passwordStrength.value < 75) return t('profile.medium')
  return t('profile.strong')
})

onMounted(() => {
  initializeForm()
  showPasswordForm.value = router.currentRoute.value.query.password === '1'
})

function initializeForm() {
  Object.assign(form, {
    name: user.value?.name || '',
    email: user.value?.email || '',
    phone: user.value?.phone || '',
    address: user.value?.address || '',
    bio: user.value?.bio || '',
  })
}

async function updateProfile() {
  savingProfile.value = true
  try {
    authStore.$patch({ user: { ...user.value, ...form } })
    showPopup('success', t('profile.profileSaved'), t('profile.profileSavedBody'))
  } catch (err) {
    showPopup('danger', t('common.error'), err.message || t('profile.profileFailed'))
  } finally {
    savingProfile.value = false
  }
}

async function changePassword() {
  if (passwordForm.new_password !== passwordForm.password_confirmation) {
    showPopup('warning', t('common.error'), t('profile.passwordMismatch'))
    return
  }
  savingPassword.value = true
  try {
    await api.post('/auth/change-password', {
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
      new_password_confirmation: passwordForm.password_confirmation,
    })
    resetPasswordForm()
    showPopup('success', t('profile.passwordUpdated'), t('profile.passwordUpdatedBody'))
  } catch (err) {
    showPopup('danger', t('common.error'), err.response?.data?.message || err.message || t('profile.passwordFailed'))
  } finally {
    savingPassword.value = false
  }
}

function resetPasswordForm() {
  Object.assign(passwordForm, { current_password: '', new_password: '', password_confirmation: '' })
  showPasswordForm.value = false
}

function showPopup(type, title, message = '') {
  showNotification({ type, title, message })
}

function goToSettings() {
  router.push({ name: 'Settings' })
}

function locale() {
  return currentLanguage.value === 'en' ? 'en-US' : 'vi-VN'
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat(locale()).format(new Date(value)) : '-'
}
</script>

<style scoped>
.profile-page { padding: 24px; width: min(1180px, 100%); margin: 0 auto; }
.profile-grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 16px; align-items: start; }
.profile-panel, .side-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; }
.profile-hero { display: flex; align-items: center; gap: 16px; padding-bottom: 16px; margin-bottom: 16px; border-bottom: 1px solid #eaecf0; }
.avatar { display: grid; place-items: center; width: 76px; height: 76px; border-radius: 999px; background: #1e6abc; color: #fff; font-size: 26px; font-weight: 900; }
h2 { margin: 0; color: #101828; }
p { margin: 5px 0 0; color: #667085; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
label { display: grid; gap: 6px; color: #344054; font-weight: 700; }
input, textarea { width: 100%; min-height: 40px; border: 1px solid #d0d5dd; border-radius: 7px; padding: 0 11px; background: #fff; }
input:disabled { background: #f9fafb; color: #667085; }
textarea { min-height: 92px; padding-top: 10px; resize: vertical; }
.wide { grid-column: 1 / -1; }
.actions, .panel-head { display: flex; justify-content: space-between; gap: 10px; align-items: center; margin-top: 18px; }
button { border: 0; border-radius: 7px; min-height: 40px; padding: 0 14px; cursor: pointer; font-weight: 800; }
button:disabled { opacity: .55; cursor: not-allowed; }
.primary-action { background: #155eef; color: #fff; }
.ghost-action { background: #f2f4f7; color: #344054; }
.full { width: 100%; margin-top: 10px; }
dl { display: grid; gap: 12px; margin: 16px 0; }
dt { color: #667085; font-size: 13px; }
dd { margin: 3px 0 0; color: #101828; font-weight: 800; }
.password-panel { margin-top: 16px; }
.password-strength { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; color: #475467; }
.password-strength i { grid-column: 1 / -1; height: 8px; border-radius: 999px; background: #eef2f6; overflow: hidden; }
.password-strength b { display: block; height: 100%; border-radius: inherit; }
@media (max-width: 860px) { .profile-grid { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .profile-page { padding: 16px; } .form-grid { grid-template-columns: 1fr; } .wide { grid-column: auto; } }
</style>

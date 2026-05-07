<template>
  <MasterLayout>
    <main class="settings-page">
      <MasterPageHeader :title="t('settings.title')">
        <template #actions>
          <button class="primary-action" @click="saveSettings">{{ t('common.saveSettings') }}</button>
        </template>
      </MasterPageHeader>

      <div class="settings-layout">
        <aside class="settings-menu">
          <button
            v-for="item in settingsMenu"
            :key="item.id"
            :class="{ active: activeTab === item.id }"
            @click="activeTab = item.id"
          >
            <v-icon size="20">{{ item.icon }}</v-icon>
            <span>{{ item.title }}</span>
          </button>
        </aside>

        <section v-if="activeTab === 'general'" class="panel">
          <h2>{{ t('settings.general') }}</h2>
          <div class="form-grid">
            <label>
              {{ t('settings.siteName') }}
              <input v-model="generalSettings.siteName" />
            </label>
            <label>
              {{ t('settings.language') }}
              <select v-model="generalSettings.language" @change="saveSettings">
                <option v-for="language in languageOptions" :key="language.value" :value="language.value">
                  {{ t(language.labelKey) }}
                </option>
              </select>
            </label>
            <label>
              {{ t('settings.theme') }}
              <select v-model="generalSettings.theme">
                <option value="light">{{ t('settings.light') }}</option>
                <option value="dark">{{ t('settings.dark') }}</option>
                <option value="auto">{{ t('settings.auto') }}</option>
              </select>
            </label>
            <label>
              {{ t('settings.dateFormat') }}
              <select v-model="generalSettings.date_format">
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </label>
            <label>
              {{ t('settings.navigation') }}
              <select v-model="generalSettings.nav_layout" @change="saveSettings">
                <option value="top">{{ t('settings.topBar') }}</option>
                <option value="side">{{ t('settings.leftSidebar') }}</option>
              </select>
            </label>
          </div>
        </section>

        <section v-if="isAdmin && activeTab === 'security'" class="panel">
          <h2>{{ t('settings.security') }}</h2>
          <div class="toggle-list">
            <label><input v-model="securitySettings.two_factor_enabled" type="checkbox" /> {{ t('settings.twoFactor') }}</label>
            <label><input v-model="securitySettings.audit_log" type="checkbox" /> {{ t('settings.auditLog') }}</label>
            <label><input v-model="securitySettings.force_strong_passwords" type="checkbox" /> {{ t('settings.strongPasswords') }}</label>
          </div>
        </section>
      </div>
    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { appSettings, saveAppSettings } from '@/config/appSettings'
import { languageOptions, t } from '@/languages'
import { showNotification } from '@/composables/usePopup'

const activeTab = ref('general')
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role === 'admin')

const settingsMenu = computed(() => [
  { id: 'general', title: t('settings.general'), icon: 'mdi-cog' },
  ...(isAdmin.value ? [{ id: 'security', title: t('settings.security'), icon: 'mdi-shield-lock' }] : []),
])

const generalSettings = reactive({
  siteName: appSettings.siteName,
  language: appSettings.language,
  theme: appSettings.theme || 'light',
  date_format: appSettings.dateFormat || 'DD/MM/YYYY',
  nav_layout: appSettings.navLayout,
})

const securitySettings = reactive({
  two_factor_enabled: false,
  audit_log: true,
  force_strong_passwords: true,
})

watch(isAdmin, (canManage) => {
  if (!canManage && activeTab.value !== 'general') {
    activeTab.value = 'general'
  }
}, { immediate: true })

function saveSettings() {
  saveAppSettings({
    siteName: generalSettings.siteName.trim() || 'RestaurantApp',
    language: generalSettings.language,
    theme: generalSettings.theme,
    dateFormat: generalSettings.date_format,
    navLayout: generalSettings.nav_layout,
  })
  document.title = appSettings.siteName
  showNotification({ type: 'success', title: t('common.saved'), message: t('common.settingsSaved') })
}
</script>

<style scoped>
.settings-page { padding: 24px; width: min(1120px, 100%); margin: 0 auto; }
h2 { margin: 0; color: #111827; font-size: 20px; }
.settings-layout { display: grid; grid-template-columns: 240px 1fr; gap: 18px; }
.settings-menu, .panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
.settings-menu { padding: 8px; align-self: start; }
.settings-menu button { width: 100%; display: flex; align-items: center; gap: 9px; min-height: 42px; padding: 0 12px; border: 0; border-radius: 6px; background: transparent; cursor: pointer; color: #344054; }
.settings-menu button.active { background: #eff8ff; color: #175cd3; font-weight: 700; }
.panel { padding: 18px; min-width: 0; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-top: 14px; }
label { color: #344054; font-size: 14px; }
input, select { display: block; width: 100%; margin-top: 6px; min-height: 40px; border: 1px solid #d0d5dd; border-radius: 7px; padding: 0 10px; background: #fff; }
button { min-height: 38px; border: 0; border-radius: 7px; padding: 0 14px; cursor: pointer; font-weight: 700; }
.primary-action { background: #155eef; color: #fff; }
.toggle-list { display: grid; gap: 14px; margin-top: 16px; }
.toggle-list label { display: flex; gap: 10px; align-items: center; }
.toggle-list input { width: 18px; height: 18px; margin: 0; accent-color: #155eef; }
@media (max-width: 820px) {
  .settings-layout { grid-template-columns: 1fr; }
}
</style>

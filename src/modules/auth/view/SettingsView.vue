<template>
  <MasterLayout>
    <main class="settings-page">
      <MasterPageHeader :title="t('settings.title')">
        <template #actions>
          <button class="primary-action" @click="saveSettings">
            {{ isAdmin ? t('common.savePermissions') : t('common.saveSettings') }}
          </button>
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
              {{ t('settings.language') }}
              <select v-model="generalSettings.language" @change="saveGeneralSettings">
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
              <select v-model="generalSettings.nav_layout" @change="saveGeneralSettings">
                <option value="top">{{ t('settings.topBar') }}</option>
                <option value="side">{{ t('settings.leftSidebar') }}</option>
              </select>
            </label>
          </div>
          <p v-if="message && !isAdmin" class="message">{{ message }}</p>
        </section>

        <section v-if="isAdmin && activeTab === 'permissions'" class="panel">
          <div class="panel-title">
            <div>
              <h2>{{ t('settings.rolePermissions') }}</h2>
              <p>{{ t('settings.permissionsDescription') }}</p>
            </div>
            <button class="ghost-action" @click="resetPermissions">{{ t('common.resetDefaults') }}</button>
          </div>

          <div class="permission-table">
            <table>
              <thead>
                <tr>
                  <th>{{ t('settings.tab') }}</th>
                  <th v-for="role in editableRoles" :key="role.key">{{ role.label }}</th>
                  <th>{{ t('settings.admin') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in NAV_ITEMS" :key="item.key">
                  <td>
                    <v-icon size="18">{{ item.icon }}</v-icon>
                    <strong>{{ navLabel(item) }}</strong>
                    <small>{{ item.path }}</small>
                  </td>
                  <td v-for="role in editableRoles" :key="role.key">
                    <input
                      type="checkbox"
                      :checked="matrix[item.key]?.includes(role.key)"
                      @change="togglePermission(item.key, role.key)"
                    />
                  </td>
                  <td>
                    <span class="always-on">{{ t('settings.full') }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="message" class="message">{{ message }}</p>
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
import {
  NAV_ITEMS,
  ROLES,
  getPermissionMatrix,
  resetPermissionMatrix,
  savePermissionMatrix,
} from '@/config/permissions'

const activeTab = ref('general')
const matrix = reactive(getPermissionMatrix())
const message = ref('')
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role === 'admin')

const settingsMenu = computed(() => [
  { id: 'general', title: t('settings.general'), icon: 'mdi-cog' },
  ...(isAdmin.value ? [
    { id: 'permissions', title: t('settings.permissions'), icon: 'mdi-account-key' },
    { id: 'security', title: t('settings.security'), icon: 'mdi-shield-lock' },
  ] : []),
])

const editableRoles = computed(() => ROLES.filter((role) => role.key !== 'admin' && role.key !== 'customer'))

const generalSettings = reactive({
  language: appSettings.language,
  theme: 'light',
  date_format: 'DD/MM/YYYY',
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

function togglePermission(permissionKey, roleKey) {
  if (!isAdmin.value) return

  const current = new Set(matrix[permissionKey] || [])
  if (current.has(roleKey)) {
    current.delete(roleKey)
  } else {
    current.add(roleKey)
  }
  matrix[permissionKey] = Array.from(current)
  message.value = ''
}

function savePermissions() {
  if (!isAdmin.value) return

  savePermissionMatrix(matrix)
  saveGeneralSettings()
  message.value = t('common.permissionsSaved')
}

function saveSettings() {
  if (isAdmin.value) {
    savePermissions()
    return
  }

  saveGeneralSettings()
  message.value = t('common.settingsSaved')
}

function saveGeneralSettings() {
  saveAppSettings({
    language: generalSettings.language,
    navLayout: generalSettings.nav_layout,
  })
}

function resetPermissions() {
  if (!isAdmin.value) return

  resetPermissionMatrix()
  Object.assign(matrix, getPermissionMatrix())
  message.value = t('common.permissionsReset')
}

function navLabel(item) {
  return item.labelKey ? t(item.labelKey) : item.label
}
</script>

<style scoped>
.settings-page { padding: 24px; width: min(1320px, 100%); margin: 0 auto; }
h2 { margin: 0; color: #111827; }
h2 { font-size: 20px; }
.settings-layout { display: grid; grid-template-columns: 240px 1fr; gap: 18px; }
.settings-menu, .panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
.settings-menu { padding: 8px; align-self: start; }
.settings-menu button { width: 100%; display: flex; align-items: center; gap: 9px; min-height: 42px; padding: 0 12px; border: 0; border-radius: 6px; background: transparent; cursor: pointer; color: #344054; }
.settings-menu button.active { background: #eff8ff; color: #175cd3; font-weight: 700; }
.panel { padding: 18px; min-width: 0; }
.panel-title { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 14px; }
.panel-title p { margin: 6px 0 0; color: #667085; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-top: 14px; }
label { color: #344054; font-size: 14px; }
select { display: block; width: 100%; margin-top: 6px; min-height: 40px; border: 1px solid #d0d5dd; border-radius: 7px; padding: 0 10px; background: #fff; }
button { min-height: 38px; border: 0; border-radius: 7px; padding: 0 14px; cursor: pointer; font-weight: 700; }
.primary-action { background: #155eef; color: #fff; }
.ghost-action { background: #f2f4f7; color: #344054; }
.permission-table { overflow-x: auto; border: 1px solid #eaecf0; border-radius: 8px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px; border-bottom: 1px solid #eaecf0; text-align: center; }
th { color: #667085; background: #f9fafb; text-transform: uppercase; font-size: 12px; }
td:first-child, th:first-child { text-align: left; min-width: 230px; }
td:first-child strong, td:first-child small { display: block; }
td:first-child small { color: #667085; margin-top: 3px; }
input[type="checkbox"] { width: 18px; height: 18px; accent-color: #155eef; }
.always-on { display: inline-flex; border-radius: 999px; padding: 4px 9px; background: #ecfdf3; color: #027a48; font-size: 12px; font-weight: 800; }
.message { margin: 14px 0 0; color: #027a48; }
.toggle-list { display: grid; gap: 14px; margin-top: 16px; }
.toggle-list label { display: flex; gap: 10px; align-items: center; }
@media (max-width: 820px) {
  .settings-layout { grid-template-columns: 1fr; }
}
</style>

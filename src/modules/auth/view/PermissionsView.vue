<template>
  <MasterLayout>
    <main class="permissions-page">
      <MasterPageHeader :title="t('settings.permissions')">
        <template #actions>
          <button class="ghost-action" @click="resetPermissions">{{ t('common.resetDefaults') }}</button>
          <button class="primary-action" @click="savePermissions">{{ t('common.savePermissions') }}</button>
        </template>
      </MasterPageHeader>

      <section class="panel">
        <div class="panel-title">
          <div>
            <h2>{{ t('settings.rolePermissions') }}</h2>
            <p>{{ t('settings.permissionsDescription') }}</p>
          </div>
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
      </section>
    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, reactive } from 'vue'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import {
  NAV_ITEMS,
  ROLES,
  getPermissionMatrix,
  resetPermissionMatrix,
  savePermissionMatrix,
} from '@/config/permissions'
import { t } from '@/languages'
import { showNotification } from '@/composables/usePopup'

const matrix = reactive(getPermissionMatrix())
const editableRoles = computed(() => ROLES.filter((role) => role.key !== 'admin' && role.key !== 'customer'))

function togglePermission(permissionKey, roleKey) {
  const current = new Set(matrix[permissionKey] || [])
  if (current.has(roleKey)) {
    current.delete(roleKey)
  } else {
    current.add(roleKey)
  }
  matrix[permissionKey] = Array.from(current)
}

function savePermissions() {
  savePermissionMatrix(matrix)
  showNotification({ type: 'success', title: t('common.saved'), message: t('common.permissionsSaved') })
}

function resetPermissions() {
  resetPermissionMatrix()
  Object.assign(matrix, getPermissionMatrix())
  showNotification({ type: 'success', title: t('common.saved'), message: t('common.permissionsReset') })
}

function navLabel(item) {
  return item.labelKey ? t(item.labelKey) : item.label
}
</script>

<style scoped>
.permissions-page { padding: 24px; width: min(1320px, 100%); margin: 0 auto; }
h2 { margin: 0; color: #111827; font-size: 20px; }
.panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; min-width: 0; }
.panel-title { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 14px; }
.panel-title p { margin: 6px 0 0; color: #667085; }
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
</style>

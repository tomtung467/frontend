<template>
  <aside v-if="appSettings.navLayout === 'side' && !smAndDown" class="side-navbar">
    <button class="side-brand" @click="goHome">
      <v-icon size="28">mdi-silverware-fork-knife</v-icon>
    </button>

    <nav class="side-menu">
      <v-tooltip v-for="item in visibleNavItems" :key="item.key" :text="navLabel(item)" location="end">
        <template #activator="{ props }">
          <button
            v-bind="props"
            class="side-nav-btn"
            :class="{ active: route.path === item.path }"
            @click="router.push(item.path)"
          >
            <v-icon size="25">{{ item.icon }}</v-icon>
          </button>
        </template>
      </v-tooltip>
    </nav>

    <div class="side-bottom">
      <MenuUser v-if="authStore.user" :user="authStore.user" variant="side" @logout="handleLogout" />
    </div>
  </aside>

  <v-app-bar v-else elevation="2" color="primary" class="master-navbar" density="compact">
    <div class="navbar-wrapper">
      <v-toolbar-title class="navbar-brand" @click="goHome">
        <v-icon size="24">mdi-silverware-fork-knife</v-icon>
        <span class="brand-name">{{ appSettings.siteName }}</span>
      </v-toolbar-title>

      <v-btn
        v-if="smAndDown"
        icon
        variant="text"
        size="small"
        class="mobile-menu-btn"
        aria-label="Open navigation"
        @click="mobileDrawer = true"
      >
        <v-icon size="25">mdi-menu</v-icon>
      </v-btn>

      <div v-if="!smAndDown" class="navbar-menu">
        <v-tooltip v-for="item in visibleNavItems" :key="item.key" :text="navLabel(item)" location="bottom">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              variant="text"
              size="small"
              class="menu-icon-btn"
              :class="{ active: route.path === item.path }"
              @click="router.push(item.path)"
            >
              <v-icon size="23">{{ item.icon }}</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </div>

      <v-spacer />

      <div class="navbar-actions">
        <v-menu location="bottom end" origin="top end" transition="scale-transition" :close-on-content-click="false">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon size="small" class="action-icon-btn notification-btn">
              <v-badge
                v-if="recentActivities.length"
                :content="recentActivities.length > 9 ? '9+' : recentActivities.length"
                color="error"
                offset-x="-2"
                offset-y="-2"
              >
                <v-icon>mdi-bell-outline</v-icon>
              </v-badge>
              <v-icon v-else>mdi-bell-outline</v-icon>
            </v-btn>
          </template>

          <v-card class="activity-menu" width="360">
            <header class="activity-header">
              <strong>{{ t('common.recentChanges') }}</strong>
              <button v-if="recentActivities.length" @click="clearActivities">{{ t('common.clear') }}</button>
            </header>
            <v-divider />
            <div v-if="recentActivities.length" class="activity-list">
              <article v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                <span class="activity-dot"></span>
                <div>
                  <strong>{{ activity.title }}</strong>
                  <p v-if="activity.message">{{ activity.message }}</p>
                  <small>{{ formatActivityTime(activity.timestamp) }}</small>
                </div>
              </article>
            </div>
            <p v-else class="activity-empty">{{ t('common.noRecentChanges') }}</p>
          </v-card>
        </v-menu>

        <v-divider vertical class="mx-2 opacity-50" />
        <MenuUser v-if="authStore.user" :user="authStore.user" @logout="handleLogout" />
      </div>
    </div>
  </v-app-bar>

  <v-navigation-drawer
    v-if="smAndDown"
    v-model="mobileDrawer"
    temporary
    location="left"
    width="304"
    class="mobile-nav-drawer"
  >
    <div class="mobile-drawer-header">
      <button class="drawer-brand" @click="goHomeAndClose">
        <v-icon size="26">mdi-silverware-fork-knife</v-icon>
        <span>{{ appSettings.siteName }}</span>
      </button>
      <button class="drawer-close" aria-label="Close navigation" @click="mobileDrawer = false">
        <v-icon size="22">mdi-close</v-icon>
      </button>
    </div>

    <nav class="mobile-nav-list">
      <button
        v-for="item in visibleNavItems"
        :key="item.key"
        class="mobile-nav-item"
        :class="{ active: route.path === item.path }"
        @click="navigateTo(item.path)"
      >
        <v-icon size="24">{{ item.icon }}</v-icon>
        <span>{{ navLabel(item) }}</span>
      </button>
    </nav>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/useAuthStore'
import { getVisibleNavItems } from '@/config/permissions'
import { appSettings } from '@/config/appSettings'
import { t } from '@/languages'
import MenuUser from './MenuUser.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { smAndDown } = useDisplay()

const mobileDrawer = ref(false)
const recentActivities = ref([])

const visibleNavItems = computed(() => getVisibleNavItems(authStore.user?.role || 'customer'))

onMounted(async () => {
  loadActivities()
  window.addEventListener('restaurant-activity', recordActivity)
  if (!authStore.user && authStore.isAuthenticated) {
    try {
      await authStore.getCurrentUser()
    } catch (err) {
      console.error('Failed to load user:', err)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('restaurant-activity', recordActivity)
})

function goHome() {
  router.push(authStore.getDefaultRoute())
}

function goHomeAndClose() {
  mobileDrawer.value = false
  goHome()
}

function navigateTo(path) {
  mobileDrawer.value = false
  router.push(path)
}

function navLabel(item) {
  return item.labelKey ? t(item.labelKey) : item.label
}

function loadActivities() {
  try {
    recentActivities.value = JSON.parse(localStorage.getItem('restaurant-recent-activities') || '[]')
  } catch {
    recentActivities.value = []
  }
}

function recordActivity(event) {
  const detail = event.detail || {}
  if (!detail.title && !detail.message) return
  const activity = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: detail.title || t('common.saved'),
    message: detail.message || '',
    timestamp: detail.timestamp || new Date().toISOString(),
  }
  recentActivities.value = [activity, ...recentActivities.value].slice(0, 8)
  localStorage.setItem('restaurant-recent-activities', JSON.stringify(recentActivities.value))
}

function clearActivities() {
  recentActivities.value = []
  localStorage.removeItem('restaurant-recent-activities')
}

function formatActivityTime(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.master-navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
}

.side-navbar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 1000;
  width: 88px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 14px 10px;
  background: #1e6abc;
  box-shadow: 2px 0 10px rgba(16, 24, 40, .14);
}

.side-brand,
.side-nav-btn {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border: 0;
  border-radius: 8px;
  color: #fff;
  background: transparent;
  cursor: pointer;
}

.side-brand {
  background: rgba(255, 255, 255, .14);
}

.side-menu {
  display: grid;
  gap: 7px;
  width: 100%;
  justify-items: center;
}

.side-bottom {
  margin-top: auto;
}

.side-nav-btn.active,
.side-nav-btn:hover {
  background: rgba(255, 255, 255, .2);
}
.navbar-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 0 14px;
}
.navbar-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto !important;
  max-width: 210px;
  cursor: pointer;
  color: white;
  font-weight: 700;
}
.brand-name {
  font-size: 15px;
  white-space: nowrap;
}
.navbar-menu,
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.menu-icon-btn,
.action-icon-btn,
.mobile-menu-btn {
  color: white !important;
}
.menu-icon-btn.active,
.menu-icon-btn:hover,
.action-icon-btn:hover,
.mobile-menu-btn:hover {
  background-color: rgba(255, 255, 255, .18) !important;
}
@media (max-width: 960px) {
  .master-navbar {
    min-width: 0;
  }

  .navbar-wrapper {
    gap: 8px;
    min-width: 0;
    padding: 0 10px;
  }

  .brand-name {
    display: none;
  }

  .navbar-actions {
    gap: 2px;
    min-width: 0;
  }

}

@media (max-width: 520px) {
  .navbar-wrapper {
    padding: 0 8px;
  }

  .navbar-actions :deep(.v-divider) {
    display: none;
  }

  .navbar-actions :deep(.user-name-text) {
    display: none;
  }
}

.notification-btn :deep(.v-badge__badge) {
  font-size: 10px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
}

.activity-menu {
  overflow: hidden;
}

.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 14px;
}

.activity-header strong {
  color: #101828;
  font-size: 15px;
}

.activity-header button {
  border: 0;
  background: transparent;
  color: #155eef;
  cursor: pointer;
  font-weight: 700;
}

.activity-list {
  display: grid;
  max-height: 340px;
  overflow-y: auto;
}

.activity-item {
  display: grid;
  grid-template-columns: 10px 1fr;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid #eaecf0;
}

.activity-dot {
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 999px;
  background: #155eef;
}

.activity-item strong {
  display: block;
  color: #101828;
  font-size: 14px;
}

.activity-item p {
  margin: 2px 0 0;
  color: #475467;
  font-size: 13px;
  line-height: 1.35;
}

.activity-item small {
  display: block;
  margin-top: 5px;
  color: #98a2b3;
}

.activity-empty {
  margin: 0;
  padding: 18px 14px;
  color: #667085;
}

.mobile-nav-drawer {
  border-right: 1px solid #d0d5dd;
}

.mobile-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 64px;
  padding: 12px 14px;
  background: #1e6abc;
  color: white;
}

.drawer-brand,
.drawer-close,
.mobile-nav-item {
  border: 0;
  cursor: pointer;
}

.drawer-brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  color: white;
  background: transparent;
  font-weight: 800;
  font-size: 17px;
}

.drawer-brand span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drawer-close {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  color: white;
  background: rgba(255, 255, 255, .14);
}

.mobile-nav-list {
  display: grid;
  gap: 4px;
  padding: 10px;
}

.mobile-nav-item {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 48px;
  padding: 0 12px;
  border-radius: 8px;
  background: transparent;
  color: #344054;
  text-align: left;
  font-size: 15px;
  font-weight: 700;
}

.mobile-nav-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-nav-item.active {
  background: #eaf3ff;
  color: #155eef;
}

.mobile-nav-item:hover {
  background: #f2f4f7;
}
</style>

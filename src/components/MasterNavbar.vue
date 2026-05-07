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
        <v-tooltip text="Search" location="bottom">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon size="small" class="action-icon-btn" @click="searchExpanded = !searchExpanded">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-text-field
          v-if="searchExpanded"
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          @blur="searchExpanded = false"
          placeholder="Search"
          density="compact"
          variant="outlined"
          hide-details
          class="search-field"
          autofocus
        />

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
import { computed, onMounted, ref } from 'vue'
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

const searchQuery = ref('')
const searchExpanded = ref(false)
const mobileDrawer = ref(false)

const visibleNavItems = computed(() => getVisibleNavItems(authStore.user?.role || 'customer'))

onMounted(async () => {
  if (!authStore.user && authStore.isAuthenticated) {
    try {
      await authStore.getCurrentUser()
    } catch (err) {
      console.error('Failed to load user:', err)
    }
  }
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

function handleSearch() {
  const query = searchQuery.value.trim()
  if (!query) return
  const firstMatch = visibleNavItems.value.find((item) => navLabel(item).toLowerCase().includes(query.toLowerCase()))
  if (firstMatch) router.push(firstMatch.path)
}

function navLabel(item) {
  return item.labelKey ? t(item.labelKey) : item.label
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
.search-field {
  width: 190px;
  background: rgba(255, 255, 255, .12);
  border-radius: 6px;
}
.search-field :deep(.v-field__input) {
  color: white;
  font-size: 13px;
}
.search-field :deep(.v-field__input)::placeholder {
  color: rgba(255, 255, 255, .72);
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

  .search-field {
    display: none;
  }
}

@media (max-width: 520px) {
  .navbar-wrapper {
    padding: 0 8px;
  }

  .navbar-actions :deep(.v-divider),
  .navbar-actions .action-icon-btn {
    display: none;
  }

  .navbar-actions :deep(.user-name-text) {
    display: none;
  }
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

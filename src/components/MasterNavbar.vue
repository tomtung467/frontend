<template>
  <aside v-if="appSettings.navLayout === 'side' && !smAndDown" class="side-navbar">
    <button class="side-brand" @click="goHome">
      <v-icon size="28">mdi-silverware-fork-knife</v-icon>
    </button>

    <nav class="side-menu">
      <v-tooltip v-for="item in visibleNavItems" :key="item.key" :text="item.label" location="end">
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
      <button class="side-nav-btn" @click="router.push('/settings')">
        <v-icon size="25">mdi-cog</v-icon>
      </button>
    </div>
  </aside>

  <v-app-bar v-else elevation="2" color="primary" class="master-navbar" density="compact">
    <div class="navbar-wrapper">
      <v-toolbar-title class="navbar-brand" @click="goHome">
        <v-icon size="24">mdi-silverware-fork-knife</v-icon>
        <span class="brand-name">RestaurantApp</span>
      </v-toolbar-title>

      <div v-if="!smAndDown" class="navbar-menu">
        <v-tooltip v-for="item in visibleNavItems" :key="item.key" :text="item.label" location="bottom">
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

      <v-menu v-else offset-y>
        <template #activator="{ props }">
          <v-btn v-bind="props" icon size="small" class="menu-icon-btn">
            <v-icon size="24">mdi-menu</v-icon>
          </v-btn>
        </template>
        <v-list density="compact" min-width="230">
          <v-list-item
            v-for="item in visibleNavItems"
            :key="item.key"
            :prepend-icon="item.icon"
            @click="router.push(item.path)"
          >
            <v-list-item-title>{{ item.label }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

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
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/useAuthStore'
import { getVisibleNavItems } from '@/config/permissions'
import { appSettings } from '@/config/appSettings'
import MenuUser from './MenuUser.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { smAndDown } = useDisplay()

const searchQuery = ref('')
const searchExpanded = ref(false)

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

function handleSearch() {
  const query = searchQuery.value.trim()
  if (!query) return
  const firstMatch = visibleNavItems.value.find((item) => item.label.toLowerCase().includes(query.toLowerCase()))
  if (firstMatch) router.push(firstMatch.path)
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
.action-icon-btn {
  color: white !important;
}
.menu-icon-btn.active,
.menu-icon-btn:hover,
.action-icon-btn:hover {
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
  .brand-name {
    display: none;
  }
  .search-field {
    display: none;
  }
}
</style>

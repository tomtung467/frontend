<template>
  <v-app-bar elevation="4" :color="appBarColor" class="master-navbar" density="compact">
    <div class="navbar-wrapper">
      <!-- Logo & Brand -->
      <v-toolbar-title class="navbar-brand" @click="goHome">
        <div class="brand-logo">
          <span class="logo-icon">🍽️</span>
          <span class="brand-name">RestaurantApp</span>
        </div>
      </v-toolbar-title>

      <!-- Navigation Menu - Icon Based with Tooltips -->
      <div class="navbar-menu" v-if="!smAndDown">
        <!-- Dashboard -->
        <v-tooltip text="Dashboard" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon variant="text" size="small" @click="navigateTo('dashboard')" class="menu-icon-btn">
              <v-icon size="24">mdi-chart-box</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <!-- Management Dropdown -->
        <v-menu offset-y open-on-hover>
          <template v-slot:activator="{ props }">
            <v-tooltip text="Quản lý" location="bottom">
              <template v-slot:activator="{ props: tooltipProps }">
                <v-btn v-bind="mergeProps(props, tooltipProps)" icon variant="text" size="small" class="menu-icon-btn">
                  <v-icon size="24">mdi-toolbox</v-icon>
                  <v-icon end size="16">mdi-chevron-down</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </template>
          <v-list density="compact" nav min-width="200">
            <v-list-item @click="navigateTo('orders')" prepend-icon="mdi-clipboard-list">
              <v-list-item-title>Quản lý đơn hàng</v-list-item-title>
            </v-list-item>
            <v-list-item  @click="navigateTo('menu')" prepend-icon="mdi-food">
              <v-list-item-title>Quản lý menu</v-list-item-title>
            </v-list-item>
            <v-list-item @click="navigateTo('tables')" prepend-icon="mdi-table-furniture">
              <v-list-item-title>Quản lý bàn</v-list-item-title>
            </v-list-item>
            <v-list-item  @click="navigateTo('inventory')" prepend-icon="mdi-package-variant">
              <v-list-item-title>Quản lý kho</v-list-item-title>
            </v-list-item>
            <v-list-item @click="navigateTo('employees')" prepend-icon="mdi-account-group">
              <v-list-item-title>Quản lý nhân viên</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- Reports -->
        <v-tooltip text="Báo cáo" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon variant="text" size="small" @click="navigateTo('reports')" class="menu-icon-btn">
              <v-icon size="24">mdi-chart-line</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </div>

      <!-- Mobile Menu -->
      <v-menu v-else offset-y>
        <template #activator="{ props }">
          <v-btn v-bind="props" icon size="small" class="menu-icon-btn">
            <v-icon size="24">mdi-menu</v-icon>
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item @click="navigateTo('dashboard')" prepend-icon="mdi-chart-box">
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item prepend-icon="mdi-toolbox" @click="managementOpen = !managementOpen">
            <v-list-item-title>Quản lý</v-list-item-title>
            <template #append>
              <v-icon :class="{ 'rotate-180': managementOpen }">mdi-chevron-down</v-icon>
            </template>
          </v-list-item>
          <v-list v-if="managementOpen" density="compact" class="pl-4">
            <v-list-item @click="navigateTo('orders')" prepend-icon="mdi-clipboard-list">
              <v-list-item-title>Quản lý đơn hàng</v-list-item-title>
            </v-list-item>
            <v-list-item @click="navigateTo('menu')" prepend-icon="mdi-food">
              <v-list-item-title>Quản lý menu</v-list-item-title>
            </v-list-item>
            <v-list-item @click="navigateTo('tables')" prepend-icon="mdi-table-furniture">
              <v-list-item-title>Quản lý bàn</v-list-item-title>
            </v-list-item>
            <v-list-item @click="navigateTo('inventory')" prepend-icon="mdi-package-variant">
              <v-list-item-title>Quản lý kho</v-list-item-title>
            </v-list-item>
            <v-list-item @click="navigateTo('employees')" prepend-icon="mdi-account-group">
              <v-list-item-title>Quản lý nhân viên</v-list-item-title>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-list-item  @click="navigateTo('reports')" prepend-icon="mdi-chart-line">
            <v-list-item-title>Báo cáo</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-spacer></v-spacer>

      <!-- Right Side Actions - Icon Based -->
      <div class="navbar-actions">
        <!-- Search -->
        <div class="search-container">
          <v-tooltip text="Tìm kiếm" location="bottom">
            <template v-slot:activator="{ props }">
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
            placeholder="Tìm kiếm..."
            density="compact"
            variant="outlined"
            hide-details
            class="search-field expanded"
            autofocus
          ></v-text-field>
        </div>

        <!-- Notifications -->
        <v-menu offset-y open-on-hover>
          <template v-slot:activator="{ props }">
            <v-tooltip text="Thông báo" location="bottom">
              <template v-slot:activator="{ props: tooltipProps }">
                <v-btn v-bind="mergeProps(props, tooltipProps)" icon size="small" class="action-icon-btn">
                  <v-badge :content="notificationCount" :model-value="notificationCount > 0" color="error" overlap dot>
                    <v-icon>mdi-bell</v-icon>
                  </v-badge>
                </v-btn>
              </template>
            </v-tooltip>
          </template>
          <v-list width="350" max-height="400" class="overflow-y-auto">
            <v-list-item v-if="notificationCount === 0" disabled>
              <v-list-item-title class="text-center">Không có thông báo</v-list-item-title>
            </v-list-item>
            <div v-else>
              <v-list-item-title class="px-4 py-2">
                <strong>Bạn có {{ notificationCount }} thông báo mới</strong>
              </v-list-item-title>
              <v-divider></v-divider>
            </div>
          </v-list>
        </v-menu>

        <!-- User Menu -->
        <v-divider :thickness="2" vertical class="mx-2" style="opacity: 0.3"></v-divider>
        <MenuUser v-if="authStore.user" :user="authStore.user" @logout="handleLogout" />
      </div>
    </div>
  </v-app-bar>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import MenuUser from './MenuUser.vue';

const authStore = useAuthStore();
const router = useRouter();
const { smAndDown } = useDisplay();

const searchQuery = ref('');
const notificationCount = ref(3);
const searchExpanded = ref(false);
const managementOpen = ref(false);
const appBarColor = ref('primary');

// Check user role
const userRole = computed(() => authStore.user?.role || '');

// Check if user has specific role
const hasRole = (roles) => {
  if (Array.isArray(roles)) {
    return roles.includes(userRole.value);
  }
  return userRole.value === roles;
};

// Show menu items based on role
const canViewMenuManagement = computed(() => hasRole('manager'));
const canViewTables = computed(() => hasRole(['staff', 'manager']));
const canViewInventory = computed(() => hasRole(['manager', 'chef']));
const canViewEmployees = computed(() => hasRole('manager'));
const canViewReports = computed(() => hasRole(['manager', 'admin']));

onMounted(async () => {
  if (!authStore.user && authStore.isAuthenticated) {
    try {
      await authStore.getCurrentUser();
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  }
});

const goHome = () => {
  router.push('/');
};

const navigateTo = (route) => {
  const routeMap = {
    dashboard: '/dashboard',
    orders: '/orders',
    menu: '/menu-management',
    tables: '/tables',
    inventory: '/inventory',
    employees: '/employees',
    reports: '/reports',
    settings: '/settings',
  };

  const path = routeMap[route] || `/${route}`;
  router.push(path);
};

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return;
  
  try {
    // TODO: Implement actual search logic based on search query
    // For now, log the search
    console.log('Search for:', searchQuery.value);
    
    // You can add global search or route to a search results page
    // router.push({ name: 'SearchResults', query: { q: searchQuery.value } });
  } catch (err) {
    console.error('Search failed:', err);
  }
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

// Helper function to merge tooltip and menu props
const mergeProps = (menuProps, tooltipProps) => {
  return { ...tooltipProps, ...menuProps };
};
</script>

<style scoped>
.master-navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0 1rem;
}

/* Brand/Logo */
.navbar-brand {
  display: flex;
  align-items: center;
  margin-right: 1rem;
  cursor: pointer;
  flex-shrink: 0;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  white-space: nowrap;
}

.logo-icon {
  font-size: 1.3rem;
}

/* Navigation Menu - Icon Based */
.navbar-menu {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  flex-wrap: wrap;
}

.menu-icon-btn {
  color: white !important;
  transition: all 0.2s ease;
}

.menu-icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
  transform: scale(1.1);
}

/* Right Actions */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

/* Search Container */
.search-container {
  display: flex;
  align-items: center;
}

.search-field {
  width: 40px;
  transition: width 0.3s ease;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

.search-field.expanded {
  width: 200px;
}

.search-field :deep(.v-field__input) {
  color: white;
  font-size: 0.875rem;
}

.search-field :deep(.v-field__input)::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-field :deep(.v-icon) {
  color: white;
}

/* Action Buttons */
.action-icon-btn {
  color: white !important;
  transition: all 0.2s ease;
}

.action-icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.2) !important;
  transform: scale(1.1);
}

/* Responsive */
@media (max-width: 960px) {
  .brand-name {
    display: none;
  }

  .search-field {
    display: none;
  }

  .navbar-brand {
    margin-right: 0.5rem;
  }
}

/* Rotate animation for menu toggles */
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

/* Badge styling */
:deep(.v-badge__badge) {
  font-size: 0.7rem;
}
</style>

<template>
  <v-app-bar elevation="4" :color="appBarColor" class="master-navbar">
    <div class="navbar-wrapper">
      <!-- Logo & Brand -->
      <v-app-bar-nav-icon class="navbar-brand">
        <div class="brand-logo">
          <span class="logo-icon">🍽️</span>
          <span class="brand-name">RestaurantApp</span>
        </div>
      </v-app-bar-nav-icon>

      <!-- Navigation Menu -->
      <div class="navbar-menu">
        <v-btn variant="text" @click="navigateTo('dashboard')" class="menu-btn">
          <v-icon start>mdi-chart-box</v-icon>
          Dashboard
        </v-btn>

        <!-- Management Menu -->
        <v-menu open-on-hover>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" variant="text" class="menu-btn">
              <v-icon start>mdi-cog</v-icon>
              Quản lý
              <v-icon end size="small">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list density="compact" nav>
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
        </v-menu>

        <v-btn variant="text" @click="navigateTo('reports')" class="menu-btn">
          <v-icon start>mdi-chart-line</v-icon>
          Báo cáo
        </v-btn>
      </div>

      <v-spacer></v-spacer>

      <!-- Right Side Actions -->
      <div class="navbar-actions">
        <!-- Search -->
        <v-text-field
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          prepend-inner-icon="mdi-magnify"
          placeholder="Tìm kiếm..."
          density="compact"
          variant="outlined"
          hide-details
          class="search-field"
        ></v-text-field>

        <!-- Notifications -->
        <v-menu open-on-hover>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon size="small" class="action-btn">
              <v-badge :content="notificationCount" :model-value="notificationCount > 0" color="error">
                <v-icon>mdi-bell</v-icon>
              </v-badge>
            </v-btn>
          </template>
          <v-list width="300" max-height="400" class="overflow-y-auto">
            <v-list-item v-if="notificationCount === 0">
              <v-list-item-title>Không có thông báo</v-list-item-title>
            </v-list-item>
            <v-list-item v-else>
              <v-list-item-title>Bạn có {{ notificationCount }} thông báo mới</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- User Menu -->
        <MenuUser v-if="authStore.user" :user="authStore.user" @logout="handleLogout" />
      </div>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'vue-router';
import MenuUser from './MenuUser.vue';

const authStore = useAuthStore();
const router = useRouter();
const searchQuery = ref('');
const notificationCount = ref(3);

const appBarColor = ref('primary');

onMounted(async () => {
  if (!authStore.user && authStore.isAuthenticated) {
    try {
      await authStore.getCurrentUser();
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  }
});

const navigateTo = (route: string) => {
  console.log('Navigate to:', route);
  // TODO: Implement actual routing based on route parameter
};

const handleSearch = () => {
  console.log('Search for:', searchQuery.value);
  // TODO: Implement search logic
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
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
  gap: 1rem;
  width: 100%;
}

.navbar-brand {
  display: flex;
  align-items: center;
  margin-right: 1rem;
  cursor: pointer;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.1rem;
}

.logo-icon {
  font-size: 1.5rem;
}

/* Navigation Menu */
.navbar-menu {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.menu-btn {
  color: white;
  text-transform: none;
  letter-spacing: normal;
  font-weight: 500;
}

.menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Right Actions */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

/* Search Field */
.search-field {
  width: 200px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

/* Action Button */
.action-btn {
  color: white;
}

.action-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Responsive */
@media (max-width: 960px) {
  .navbar-menu {
    display: none;
  }

  .search-field {
    display: none;
  }
}
</style>

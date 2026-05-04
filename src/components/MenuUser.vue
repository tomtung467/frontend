<template>
  <v-menu v-model="menu" location="bottom end" origin="top end" transition="scale-transition">
    <template v-slot:activator="{ props }">
      <v-chip v-bind="props" pill link class="user-chip">
        <v-avatar start>
          <v-img :src="userAvatar" alt="User Avatar">
            <template v-slot:error>
              <v-img src="https://via.placeholder.com/40?text=No+User"></v-img>
            </template>
          </v-img>
        </v-avatar>
        <div class="chip-content">
          <span class="user-name-text">{{ userName }}</span>
        </div>
      </v-chip>
    </template>

    <v-card width="300">
      <v-list>
        <!-- User Info Header -->
        <v-list-item class="user-header">
          <template v-slot:prepend>
            <v-avatar>
              <v-img :src="userAvatar" alt="User Avatar">
                <template v-slot:error>
                  <v-img src="https://via.placeholder.com/48?text=No+User"></v-img>
                </template>
              </v-img>
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-600">
            {{ userName }}
          </v-list-item-title>

          <v-list-item-subtitle>
            {{ userEmail }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list>
        <!-- Profile -->
        <v-list-item
          prepend-icon="mdi-account-circle"
          link
          @click="goToProfile"
        >
          <v-list-item-title>Hồ sơ cá nhân</v-list-item-title>
        </v-list-item>

        <!-- Settings -->
        <v-list-item
          prepend-icon="mdi-cog"
          link
          @click="goToSettings"
        >
          <v-list-item-title>Cài đặt</v-list-item-title>
        </v-list-item>

        <!-- Change Password -->
        <v-list-item
          prepend-icon="mdi-lock-reset"
          link
          @click="goToChangePassword"
        >
          <v-list-item-title>Đổi mật khẩu</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <!-- Logout -->
      <v-list>
        <v-list-item
          prepend-icon="mdi-logout"
          link
          color="error"
          @click="handleLogout"
        >
          <v-list-item-title>Đăng xuất</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>

  <!-- Logout Confirmation Dialog -->
  <v-dialog v-model="showLogoutDialog" width="400px" persistent>
    <v-sheet rounded="lg">
      <v-card>
        <v-card-text class="pa-6">
          <div class="text-center">
            <v-icon color="warning" size="48" class="mb-4">mdi-logout</v-icon>
            <h3 class="text-h5 mb-4">Xác nhận đăng xuất</h3>
            <p class="text-subtitle1 mb-6">
              Bạn có chắc chắn muốn đăng xuất không?
            </p>
          </div>
        </v-card-text>

        <v-card-actions class="justify-end gap-2 pa-4">
          <v-btn variant="outlined" @click="showLogoutDialog = false">
            Hủy
          </v-btn>
          <v-btn color="error" @click="confirmLogout">
            Đăng xuất
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-sheet>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

interface User {
  id?: string | number;
  name: string;
  email: string;
  avatar?: string;
}

interface Props {
  user: User;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  logout: [];
}>();

const router = useRouter();
const menu = ref(false);
const showLogoutDialog = ref(false);

const userName = computed(() => props.user?.name || 'Người dùng');
const userEmail = computed(() => props.user?.email || '');
const userAvatar = computed(() => props.user?.avatar || 'https://via.placeholder.com/40?text=Avatar');

const goToProfile = () => {
  menu.value = false;
  router.push({ name: 'Profile' }).catch(() => {});
};

const goToSettings = () => {
  menu.value = false;
  router.push({ name: 'Settings' }).catch(() => {});
};

const goToChangePassword = () => {
  menu.value = false;
  router.push({ name: 'ChangePassword' }).catch(() => {});
};

const handleLogout = () => {
  menu.value = false;
  showLogoutDialog.value = true;
};

const confirmLogout = () => {
  showLogoutDialog.value = false;
  emit('logout');
};
</script>

<style scoped>
.user-chip {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-chip:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.chip-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-left: 0.5rem;
}

.user-name-text {
  font-size: 0.9rem;
  font-weight: 500;
  display: block;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-header {
  padding: 1rem;
  background-color: #f5f5f5;
}
</style>

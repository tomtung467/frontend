<template>
  <v-menu v-model="menu" location="bottom end" origin="top end" transition="scale-transition">
    <template #activator="{ props: menuProps }">
      <button v-if="variant === 'side'" v-bind="menuProps" class="side-user-btn" :title="userName">
        <v-avatar size="38" color="white" class="side-user-avatar">
          <v-img v-if="userAvatar" :src="userAvatar" alt="User Avatar">
            <template #error>
              <span class="avatar-initials">{{ userInitials }}</span>
            </template>
          </v-img>
          <span v-else class="avatar-initials">{{ userInitials }}</span>
        </v-avatar>
      </button>

      <v-chip v-else v-bind="menuProps" pill link class="user-chip">
        <v-avatar start color="white">
          <v-img v-if="userAvatar" :src="userAvatar" alt="User Avatar">
            <template #error>
              <span class="avatar-initials">{{ userInitials }}</span>
            </template>
          </v-img>
          <span v-else class="avatar-initials">{{ userInitials }}</span>
        </v-avatar>
        <div class="chip-content">
          <span class="user-name-text">{{ userName }}</span>
        </div>
      </v-chip>
    </template>

    <v-card width="300">
      <v-list>
        <v-list-item class="user-header">
          <template #prepend>
            <v-avatar color="primary">
              <v-img v-if="userAvatar" :src="userAvatar" alt="User Avatar">
                <template #error>
                  <span class="header-avatar-initials">{{ userInitials }}</span>
                </template>
              </v-img>
              <span v-else class="header-avatar-initials">{{ userInitials }}</span>
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

      <v-divider />

      <v-list>
        <v-list-item prepend-icon="mdi-account-circle" link @click="goToProfile">
          <v-list-item-title>Ho so ca nhan</v-list-item-title>
        </v-list-item>

        <v-list-item prepend-icon="mdi-cog" link @click="goToSettings">
          <v-list-item-title>Cai dat</v-list-item-title>
        </v-list-item>

        <v-list-item prepend-icon="mdi-lock-reset" link @click="goToChangePassword">
          <v-list-item-title>Doi mat khau</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider />

      <v-list>
        <v-list-item prepend-icon="mdi-logout" link color="error" @click="handleLogout">
          <v-list-item-title>Dang xuat</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>

  <v-dialog v-model="showLogoutDialog" width="400px" persistent>
    <v-sheet rounded="lg">
      <v-card>
        <v-card-text class="pa-6">
          <div class="text-center">
            <v-icon color="warning" size="48" class="mb-4">mdi-logout</v-icon>
            <h3 class="text-h5 mb-4">Xac nhan dang xuat</h3>
            <p class="text-subtitle1 mb-6">
              Ban co chac chan muon dang xuat khong?
            </p>
          </div>
        </v-card-text>

        <v-card-actions class="justify-end gap-2 pa-4">
          <v-btn variant="outlined" @click="showLogoutDialog = false">
            Huy
          </v-btn>
          <v-btn color="error" @click="confirmLogout">
            Dang xuat
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-sheet>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

interface User {
  id?: string | number;
  name: string;
  email: string;
  avatar?: string;
}

interface Props {
  user: User;
  variant?: 'chip' | 'side';
}

const props = defineProps<Props>();
const emit = defineEmits<{
  logout: [];
}>();

const router = useRouter();
const menu = ref(false);
const showLogoutDialog = ref(false);

const variant = computed(() => props.variant || 'chip');
const userName = computed(() => props.user?.name || 'Nguoi dung');
const userEmail = computed(() => props.user?.email || '');
const userAvatar = computed(() => props.user?.avatar || '');
const userInitials = computed(() => {
  const source = userName.value || userEmail.value || 'U';
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
});

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

.side-user-btn {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border: 0;
  border-radius: 8px;
  background: rgba(255, 255, 255, .16);
  cursor: pointer;
}

.side-user-btn:hover {
  background: rgba(255, 255, 255, .26);
}

.side-user-avatar {
  color: #1e6abc;
  font-weight: 800;
}

.avatar-initials,
.header-avatar-initials {
  display: inline-grid;
  place-items: center;
  width: 100%;
  height: 100%;
  font-weight: 800;
}

.avatar-initials {
  color: #1e6abc;
  font-size: 13px;
}

.header-avatar-initials {
  color: white;
  font-size: 14px;
}
</style>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-6">Hồ sơ cá nhân</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-card class="pa-6">
          <v-form @submit.prevent="updateProfile" ref="formRef">
            <!-- Avatar Section -->
            <div class="text-center mb-6">
              <v-avatar size="120" class="mb-4">
                <v-img :src="userAvatar" :alt="user?.name">
                  <template v-slot:error>
                    <v-icon size="120">mdi-account-circle</v-icon>
                  </template>
                </v-img>
              </v-avatar>
              <div>
                <v-btn variant="outlined" color="primary" size="small">
                  Thay đổi ảnh
                </v-btn>
              </div>
            </div>

            <v-divider class="mb-6"></v-divider>

            <!-- Personal Information -->
            <h3 class="text-h6 mb-4">Thông tin cá nhân</h3>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.name"
                  label="Tên đầy đủ"
                  variant="outlined"
                  :rules="nameRules"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.email"
                  label="Email"
                  variant="outlined"
                  type="email"
                  :rules="emailRules"
                  required
                  disabled
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.phone"
                  label="Số điện thoại"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.address"
                  label="Địa chỉ"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.bio"
                  label="Tiểu sử"
                  variant="outlined"
                  rows="4"
                  multiline
                ></v-text-field>
              </v-col>
            </v-row>

            <v-divider class="my-6"></v-divider>

            <!-- Account Information -->
            <h3 class="text-h6 mb-4">Thông tin tài khoản</h3>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="user.role"
                  label="Vai trò"
                  variant="outlined"
                  disabled
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  :model-value="user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : ''"
                  label="Ngày tham gia"
                  variant="outlined"
                  disabled
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Buttons -->
            <v-row class="mt-6">
              <v-col cols="12" class="d-flex gap-2">
                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  :loading="isLoading"
                >
                  <v-icon start>mdi-content-save</v-icon>
                  Lưu thay đổi
                </v-btn>
                <v-btn
                  variant="outlined"
                  size="large"
                  @click="resetForm"
                >
                  Hủy
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-6">
          <h3 class="text-h6 mb-4">Hành động nhanh</h3>
          <v-list density="compact">
            <v-list-item
              prepend-icon="mdi-lock-reset"
              link
              @click="goToChangePassword"
            >
              <v-list-item-title>Đổi mật khẩu</v-list-item-title>
            </v-list-item>
            <v-list-item
              prepend-icon="mdi-cog"
              link
              @click="goToSettings"
            >
              <v-list-item-title>Cài đặt</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();
const formRef = ref(null);
const isLoading = ref(false);

const form = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  bio: '',
});

const user = computed(() => authStore.user || {});
const userAvatar = computed(() => user.value?.avatar || 'https://via.placeholder.com/120?text=Avatar');

const nameRules = [
  (v) => !!v || 'Tên không được để trống',
  (v) => v?.length >= 2 || 'Tên phải có ít nhất 2 ký tự',
];

const emailRules = [
  (v) => !!v || 'Email không được để trống',
  (v) => /.+@.+\..+/.test(v) || 'Email không hợp lệ',
];

const initializeForm = () => {
  form.value = {
    name: user.value?.name || '',
    email: user.value?.email || '',
    phone: user.value?.phone || '',
    address: user.value?.address || '',
    bio: user.value?.bio || '',
  };
};

const updateProfile = async () => {
  const isValid = await formRef.value?.validate();
  if (!isValid?.valid) return;

  isLoading.value = true;
  try {
    // TODO: Make API call to update profile
    console.log('Updating profile:', form.value);
    // await api.put('/auth/profile', form.value);
    authStore.$patch({
      user: {
        ...user.value,
        ...form.value,
      },
    });
  } catch (err) {
    console.error('Failed to update profile:', err);
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  initializeForm();
};

const goToChangePassword = () => {
  router.push({ name: 'ChangePassword' });
};

const goToSettings = () => {
  router.push({ name: 'Settings' });
};

onMounted(() => {
  initializeForm();
});
</script>

<style scoped>
</style>

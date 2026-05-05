<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-6">Đổi mật khẩu</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6" lg="5">
        <v-card class="pa-6">
          <v-form @submit.prevent="changePassword" ref="formRef">
            <!-- Current Password -->
            <v-text-field
              v-model="form.current_password"
              label="Mật khẩu hiện tại"
              type="password"
              variant="outlined"
              :rules="passwordRules"
              required
              class="mb-4"
              prepend-inner-icon="mdi-lock"
            ></v-text-field>

            <v-divider class="my-6"></v-divider>

            <!-- New Password -->
            <v-text-field
              v-model="form.new_password"
              label="Mật khẩu mới"
              type="password"
              variant="outlined"
              :rules="newPasswordRules"
              required
              class="mb-4"
              prepend-inner-icon="mdi-lock-outline"
              hint="Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
              persistent-hint
            ></v-text-field>

            <!-- Confirm New Password -->
            <v-text-field
              v-model="form.password_confirmation"
              label="Xác nhận mật khẩu mới"
              type="password"
              variant="outlined"
              :rules="confirmPasswordRules"
              required
              class="mb-6"
              prepend-inner-icon="mdi-lock-check"
            ></v-text-field>

            <!-- Password Strength Indicator -->
            <div v-if="form.new_password" class="mb-6">
              <div class="d-flex justify-space-between mb-2">
                <span class="text-caption">Độ mạnh mật khẩu</span>
                <span class="text-caption" :style="{ color: passwordStrengthColor }">
                  {{ passwordStrengthText }}
                </span>
              </div>
              <v-progress-linear
                :model-value="passwordStrength"
                :color="passwordStrengthColor"
                height="6"
              ></v-progress-linear>
            </div>

            <!-- Buttons -->
            <v-row class="mt-6">
              <v-col cols="12" class="d-flex gap-2">
                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  :loading="isLoading"
                >
                  <v-icon start>mdi-check</v-icon>
                  Cập nhật mật khẩu
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

          <!-- Info Card -->
          <v-card class="mt-6 pa-4 bg-blue-lighten-5">
            <v-list density="compact">
              <v-list-item prepend-icon="mdi-information">
                <v-list-item-title class="text-caption">
                  Mật khẩu phải chứa ít nhất 8 ký tự
                </v-list-item-title>
              </v-list-item>
              <v-list-item prepend-icon="mdi-information">
                <v-list-item-title class="text-caption">
                  Bao gồm chữ hoa (A-Z), chữ thường (a-z)
                </v-list-item-title>
              </v-list-item>
              <v-list-item prepend-icon="mdi-information">
                <v-list-item-title class="text-caption">
                  Bao gồm số (0-9) và ký tự đặc biệt (!@#$%^&*)
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';

const router = useRouter();
const formRef = ref(null);
const isLoading = ref(false);

const form = ref({
  current_password: '',
  new_password: '',
  password_confirmation: '',
});

const passwordRules = [
  (v) => !!v || 'Mật khẩu hiện tại không được để trống',
];

const newPasswordRules = [
  (v) => !!v || 'Mật khẩu mới không được để trống',
  (v) => v?.length >= 8 || 'Mật khẩu phải có ít nhất 8 ký tự',
  (v) => /[A-Z]/.test(v) || 'Mật khẩu phải chứa ít nhất một chữ hoa',
  (v) => /[a-z]/.test(v) || 'Mật khẩu phải chứa ít nhất một chữ thường',
  (v) => /[0-9]/.test(v) || 'Mật khẩu phải chứa ít nhất một số',
  (v) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v) || 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt',
];

const confirmPasswordRules = [
  (v) => !!v || 'Xác nhận mật khẩu không được để trống',
  (v) => v === form.value.new_password || 'Mật khẩu xác nhận không khớp',
];

const passwordStrength = computed(() => {
  let strength = 0;
  const pwd = form.value.new_password;

  if (!pwd) return 0;
  if (pwd.length >= 8) strength += 20;
  if (pwd.length >= 12) strength += 10;
  if (/[a-z]/.test(pwd)) strength += 20;
  if (/[A-Z]/.test(pwd)) strength += 20;
  if (/[0-9]/.test(pwd)) strength += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) strength += 15;

  return Math.min(strength, 100);
});

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value;
  if (strength < 30) return '#f44336';
  if (strength < 60) return '#ff9800';
  if (strength < 80) return '#ffc107';
  return '#4caf50';
});

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value;
  if (strength < 30) return 'Yếu';
  if (strength < 60) return 'Trung bình';
  if (strength < 80) return 'Khá';
  return 'Mạnh';
});

const changePassword = async () => {
  const isValid = await formRef.value?.validate();
  if (!isValid?.valid) return;

  isLoading.value = true;
  try {
    await api.post('/auth/change-password', {
      current_password: form.value.current_password,
      new_password: form.value.new_password,
      new_password_confirmation: form.value.password_confirmation,
    });

    // Success notification
    console.log('Password changed successfully');
    resetForm();
    // Navigate back or show success message
    setTimeout(() => {
      router.push('/');
    }, 1500);
  } catch (err) {
    console.error('Failed to change password:', err);
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    current_password: '',
    new_password: '',
    password_confirmation: '',
  };
  formRef.value?.resetValidation();
};
</script>

<style scoped>
</style>

<template>
  <div class="login-page">
    <div class="bg-circle circle-1"></div>
    <div class="bg-circle circle-2"></div>
    <div class="bg-circle circle-3"></div>
    <div class="bg-circle circle-4"></div>
    <div class="bg-circle circle-5"></div>

    <section class="login-card">
      <header class="card-head">
        <span class="brand-mark">
          <v-icon size="24">mdi-food-fork-drink</v-icon>
        </span>
        <div>
          <p>Nhà Hàng Phương Nam</p>
          <h1>{{ pageTitle }}</h1>
        </div>
      </header>

      <form v-if="mode === 'login'" class="auth-form" @submit.prevent="handleLogin">
        <label>
          <span>Email <b>*</b></span>
          <div class="input-wrap">
            <v-icon size="20">mdi-account-outline</v-icon>
            <input
              v-model="email"
              type="email"
              autocomplete="username"
              placeholder="customer@restaurant.com"
            />
          </div>
        </label>

        <label>
          <span>Mật khẩu <b>*</b></span>
          <div class="input-wrap">
            <v-icon size="20">mdi-lock-outline</v-icon>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Nhập mật khẩu"
            />
            <button type="button" class="icon-button" @click="showPassword = !showPassword">
              <v-icon size="20">{{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}</v-icon>
            </button>
          </div>
        </label>

        <div class="options-row">
          <label class="remember-label">
            <input v-model="rememberMe" type="checkbox" />
            <span>Nhớ tài khoản</span>
          </label>
          <button class="text-button" type="button" @click="openForgot">
            Quên mật khẩu?
          </button>
        </div>

        <p v-if="error" class="message error">{{ error }}</p>

        <button class="primary-button" type="submit" :disabled="loading">
          <v-icon v-if="!loading" size="20">mdi-login</v-icon>
          <span class="spinner" v-else></span>
          {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>

        <p class="register-text">
          Chưa có tài khoản?
          <router-link to="/register">Đăng ký tài khoản</router-link>
        </p>
      </form>

      <form v-else-if="mode === 'forgot'" class="auth-form" @submit.prevent="requestReset">
        <p class="helper-text">
          Nhập email tài khoản. Hệ thống sẽ tạo mã đặt lại mật khẩu cho bạn.
        </p>

        <label>
          <span>Email <b>*</b></span>
          <div class="input-wrap">
            <v-icon size="20">mdi-email-outline</v-icon>
            <input v-model="resetEmail" type="email" autocomplete="username" placeholder="email@example.com" />
          </div>
        </label>

        <p v-if="successMessage" class="message success">{{ successMessage }}</p>
        <p v-if="resetToken" class="token-box">
          <span>Mã reset</span>
          <strong>{{ resetToken }}</strong>
        </p>
        <p v-if="error" class="message error">{{ error }}</p>

        <button class="primary-button" type="submit" :disabled="loading">
          <v-icon v-if="!loading" size="20">mdi-key-outline</v-icon>
          <span class="spinner" v-else></span>
          {{ loading ? 'Đang tạo mã...' : 'Tạo mã đặt lại' }}
        </button>

        <div class="secondary-actions">
          <button class="ghost-button" type="button" @click="mode = 'login'">Quay lại đăng nhập</button>
          <button class="ghost-button strong" type="button" @click="mode = 'reset'">Tôi đã có mã</button>
        </div>
      </form>

      <form v-else class="auth-form" @submit.prevent="resetPassword">
        <p class="helper-text">
          Nhập mã reset và mật khẩu mới để hoàn tất.
        </p>

        <label>
          <span>Email <b>*</b></span>
          <div class="input-wrap">
            <v-icon size="20">mdi-email-outline</v-icon>
            <input v-model="resetEmail" type="email" autocomplete="username" placeholder="email@example.com" />
          </div>
        </label>

        <label>
          <span>Mã reset <b>*</b></span>
          <div class="input-wrap">
            <v-icon size="20">mdi-ticket-confirmation-outline</v-icon>
            <input v-model="resetToken" type="text" autocomplete="one-time-code" placeholder="Dán mã reset" />
          </div>
        </label>

        <label>
          <span>Mật khẩu mới <b>*</b></span>
          <div class="input-wrap">
            <v-icon size="20">mdi-lock-reset</v-icon>
            <input v-model="newPassword" :type="showNewPassword ? 'text' : 'password'" autocomplete="new-password" />
            <button type="button" class="icon-button" @click="showNewPassword = !showNewPassword">
              <v-icon size="20">{{ showNewPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}</v-icon>
            </button>
          </div>
        </label>

        <label>
          <span>Nhập lại mật khẩu <b>*</b></span>
          <div class="input-wrap">
            <v-icon size="20">mdi-lock-check-outline</v-icon>
            <input v-model="newPasswordConfirmation" :type="showNewPassword ? 'text' : 'password'" autocomplete="new-password" />
          </div>
        </label>

        <p v-if="successMessage" class="message success">{{ successMessage }}</p>
        <p v-if="error" class="message error">{{ error }}</p>

        <button class="primary-button" type="submit" :disabled="loading">
          <v-icon v-if="!loading" size="20">mdi-check-circle-outline</v-icon>
          <span class="spinner" v-else></span>
          {{ loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu' }}
        </button>

        <button class="ghost-button full" type="button" @click="mode = 'login'">Quay lại đăng nhập</button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()

const mode = ref('login')
const email = ref('')
const password = ref('')
const rememberMe = ref(true)
const showPassword = ref(false)
const showNewPassword = ref(false)
const loading = ref(false)
const error = ref('')
const successMessage = ref('')
const resetEmail = ref('')
const resetToken = ref('')
const newPassword = ref('')
const newPasswordConfirmation = ref('')

const pageTitle = computed(() => {
  if (mode.value === 'forgot') return 'Quên mật khẩu'
  if (mode.value === 'reset') return 'Đặt lại mật khẩu'
  return 'Đăng nhập'
})

onMounted(() => {
  const rememberedEmail = localStorage.getItem('rememberEmail')
  if (rememberedEmail) email.value = rememberedEmail
})

async function handleLogin() {
  error.value = ''
  successMessage.value = ''

  if (!email.value.trim() || !password.value.trim()) {
    error.value = 'Vui lòng nhập đầy đủ email và mật khẩu'
    return
  }

  try {
    loading.value = true
    await authStore.login({
      email: email.value.trim(),
      password: password.value.trim(),
    })

    if (rememberMe.value) {
      localStorage.setItem('rememberEmail', email.value.trim())
    } else {
      localStorage.removeItem('rememberEmail')
    }

    await router.push(authStore.getDefaultRoute())
  } catch (err) {
    error.value = err?.response?.data?.message || 'Đăng nhập thất bại'
  } finally {
    loading.value = false
  }
}

function openForgot() {
  error.value = ''
  successMessage.value = ''
  resetEmail.value = email.value.trim()
  mode.value = 'forgot'
}

async function requestReset() {
  error.value = ''
  successMessage.value = ''
  resetToken.value = ''

  if (!resetEmail.value.trim()) {
    error.value = 'Vui lòng nhập email'
    return
  }

  try {
    loading.value = true
    const response = await api.post('/auth/forgot-password', {
      email: resetEmail.value.trim(),
    })
    resetToken.value = response.data.reset_token || ''
    successMessage.value = 'Đã tạo mã đặt lại mật khẩu. Vui lòng dùng mã bên dưới để đặt mật khẩu mới.'
    mode.value = 'reset'
  } catch (err) {
    error.value = err?.response?.data?.message || 'Không thể tạo mã đặt lại mật khẩu'
  } finally {
    loading.value = false
  }
}

async function resetPassword() {
  error.value = ''
  successMessage.value = ''

  if (!resetEmail.value.trim() || !resetToken.value.trim() || !newPassword.value || !newPasswordConfirmation.value) {
    error.value = 'Vui lòng nhập đầy đủ thông tin'
    return
  }

  if (newPassword.value !== newPasswordConfirmation.value) {
    error.value = 'Mật khẩu nhập lại không khớp'
    return
  }

  try {
    loading.value = true
    await api.post('/auth/reset-password', {
      email: resetEmail.value.trim(),
      token: resetToken.value.trim(),
      password: newPassword.value,
      password_confirmation: newPasswordConfirmation.value,
    })
    successMessage.value = 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.'
    password.value = ''
    newPassword.value = ''
    newPasswordConfirmation.value = ''
    email.value = resetEmail.value.trim()
    setTimeout(() => {
      mode.value = 'login'
    }, 900)
  } catch (err) {
    error.value = err?.response?.data?.message || 'Không thể đặt lại mật khẩu'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 24% 46%, rgba(255,255,255,.18) 0 8px, transparent 9px),
    linear-gradient(135deg, #7e76e8 0%, #d94c2c 35%, #ca0fa1 65%, #c75e7f 100%);
  padding: 24px;
}

.login-card {
  position: relative;
  z-index: 2;
  width: min(560px, 100%);
  border: 1px solid rgba(255,255,255,.7);
  border-radius: 8px;
  background: rgba(255, 255, 255, .94);
  box-shadow: 0 24px 70px rgba(17, 24, 39, .28);
  padding: 30px 28px 24px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 26px;
  text-align: left;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 8px;
  background: #ff5a00;
  color: #fff;
  box-shadow: 0 10px 24px rgba(255, 90, 0, .28);
}

.card-head p {
  margin: 0 0 2px;
  color: #667085;
  font-size: 13px;
  font-weight: 800;
}

.card-head h1 {
  margin: 0;
  color: #111827;
  font-size: 28px;
  line-height: 1.1;
}

.auth-form {
  display: grid;
  gap: 16px;
}

label span {
  display: block;
  margin-bottom: 7px;
  color: #344054;
  font-size: 14px;
}

label b {
  color: #f04438;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 48px;
  border: 1px solid #cfd6e3;
  border-radius: 8px;
  background: #eef5ff;
  color: #667085;
  padding: 0 12px;
  transition: border-color .16s ease, box-shadow .16s ease, background .16s ease;
}

.input-wrap:focus-within {
  border-color: #ff7a1a;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(255, 90, 0, .13);
}

.input-wrap input {
  width: 100%;
  min-width: 0;
  height: 46px;
  border: 0;
  outline: 0;
  background: transparent;
  color: #111827;
  font-size: 16px;
  padding: 0 10px;
}

.icon-button {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #344054;
  cursor: pointer;
}

.icon-button:hover {
  background: rgba(15, 23, 42, .06);
}

.options-row,
.secondary-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.remember-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #344054;
  font-size: 15px;
}

.remember-label span {
  margin: 0;
}

.text-button,
.ghost-button {
  border: 0;
  background: transparent;
  color: #344054;
  cursor: pointer;
  font-weight: 800;
  text-decoration: underline;
}

.ghost-button {
  min-height: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  padding: 0 12px;
  text-decoration: none;
}

.ghost-button.strong {
  border-color: #ff5a00;
  color: #ff5a00;
}

.ghost-button.full {
  width: 100%;
}

.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  min-height: 48px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(90deg, #ff5a00, #f04438);
  color: #fff;
  cursor: pointer;
  font-size: 17px;
  font-weight: 900;
  box-shadow: 0 14px 28px rgba(240, 68, 56, .25);
  transition: transform .16s ease, box-shadow .16s ease, opacity .16s ease;
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(240, 68, 56, .3);
}

.primary-button:disabled {
  cursor: not-allowed;
  opacity: .68;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,.45);
  border-top-color: #fff;
  border-radius: 999px;
  animation: spin .75s linear infinite;
}

.helper-text,
.register-text {
  margin: 0;
  color: #475467;
  line-height: 1.5;
}

.register-text {
  text-align: center;
  font-size: 15px;
}

.register-text a {
  margin-left: 6px;
  color: #155eef;
  font-weight: 900;
}

.message {
  margin: 0;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.45;
}

.message.error {
  border: 1px solid #fecdca;
  background: #fffbfa;
  color: #b42318;
}

.message.success {
  border: 1px solid #abefc6;
  background: #f6fef9;
  color: #067647;
}

.token-box {
  display: grid;
  gap: 6px;
  margin: 0;
  border: 1px dashed #ff9b54;
  border-radius: 8px;
  background: #fff7ed;
  padding: 10px 12px;
}

.token-box span {
  color: #9a3412;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.token-box strong {
  overflow-wrap: anywhere;
  color: #111827;
  font-size: 13px;
}

.bg-circle {
  position: absolute;
  z-index: 1;
  border-radius: 50%;
}

.circle-1 {
  width: 160px;
  height: 160px;
  left: 7%;
  top: 38%;
  background: rgba(30, 55, 110, .2);
}

.circle-2 {
  width: 210px;
  height: 210px;
  right: 5%;
  top: 22%;
  background: rgba(80, 40, 90, .14);
}

.circle-3 {
  width: 120px;
  height: 120px;
  right: 10%;
  bottom: 8%;
  background: rgba(255, 255, 255, .22);
}

.circle-4 {
  width: 80px;
  height: 80px;
  left: 39%;
  bottom: 9%;
  background: rgba(255, 255, 255, .3);
}

.circle-5 {
  width: 18px;
  height: 18px;
  left: 25%;
  top: 47%;
  background: rgba(255, 255, 255, .4);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .login-page {
    padding: 14px;
  }

  .login-card {
    padding: 22px 16px 18px;
  }

  .card-head {
    justify-content: flex-start;
  }

  .card-head h1 {
    font-size: 24px;
  }

  .options-row,
  .secondary-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>

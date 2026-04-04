<template>
  <div class="login-page">
    <div class="bg-circle circle-1"></div>
    <div class="bg-circle circle-2"></div>
    <div class="bg-circle circle-3"></div>
    <div class="bg-circle circle-4"></div>
    <div class="bg-circle circle-5"></div>

    <div class="login-card">
      <h1 class="title">Đăng nhập</h1>

      <div class="form-group">
        <label>Tên đăng nhập <span>*</span></label>
        <div class="input-wrap">
          <span class="input-icon">👤</span>
          <input
            v-model="email"
            type="text"
            placeholder="Nhập email hoặc tên đăng nhập"
            class="custom-input"
          />
        </div>
      </div>

      <div class="form-group">
        <label>Mật khẩu <span>*</span></label>
        <div class="input-wrap">
          <span class="input-icon">🔐</span>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Nhập mật khẩu"
            class="custom-input"
          />
          <button
            type="button"
            class="toggle-btn"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? "🙈" : "👁" }}
          </button>
        </div>
      </div>

      <div class="options-row">
        <label class="remember-label">
          <input type="checkbox" v-model="rememberMe" />
          <span>Nhớ tài khoản</span>
        </label>

        <button class="forgot-link" type="button">
          Quên mật khẩu?
        </button>
      </div>

      <p v-if="error" class="error-text">{{ error }}</p>

      <button
        class="role-btn admin-btn"
        @click="handleRoleLogin('admin')"
        :disabled="loading"
      >
        Quản lý
      </button>

      <button
        class="role-btn customer-btn"
        @click="handleRoleLogin('customer')"
        :disabled="loading"
      >
        Khách hàng
      </button>

      <p class="register-text">
        Chưa có tài khoản?
        <router-link to="/register" class="register-link">
          Đăng ký tài khoản
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { loginService } from "../features/login/loginService";
import { saveAuthData } from "../functions/authStorage";

const router = useRouter();

const email = ref("");
const password = ref("");
const rememberMe = ref(true);
const showPassword = ref(false);
const loading = ref(false);
const error = ref("");

const handleRoleLogin = async (role) => {
  error.value = "";

  if (!email.value.trim() || !password.value.trim()) {
    error.value = "Vui lòng nhập đầy đủ tài khoản và mật khẩu";
    return;
  }

  try {
    loading.value = true;

    const data = await loginService({
      email: email.value.trim(),
      password: password.value.trim(),
      role,
    });

    saveAuthData(data);

    if (rememberMe.value) {
      localStorage.setItem("rememberEmail", email.value);
    } else {
      localStorage.removeItem("rememberEmail");
    }

    router.push("/dashboard");
  } catch (err) {
    error.value = err?.response?.data?.message || "Đăng nhập thất bại";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #7e76e8 0%, #d94c2c 35%, #ca0fa1 65%, #c75e7f 100%);
}

.login-card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 560px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 8px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
  padding: 32px 28px 24px;
}

.title {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 28px;
  color: #111;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.form-group label span {
  color: #ff4d4f;
}

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  opacity: 0.75;
}

.custom-input {
  width: 100%;
  height: 48px;
  border: 1px solid #bfc3cc;
  border-radius: 4px;
  padding: 0 44px 0 44px;
  font-size: 16px;
  box-sizing: border-box;
  background: #fff;
  outline: none;
}

.custom-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
}

.toggle-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
}

.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0 18px;
  gap: 12px;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #333;
}

.forgot-link {
  border: none;
  background: transparent;
  color: #222;
  font-size: 15px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.error-text {
  color: #d93025;
  margin-bottom: 14px;
  font-size: 14px;
}

.role-btn {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.role-btn:hover {
  transform: translateY(-1px);
}

.role-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.admin-btn {
  background: linear-gradient(90deg, #ff1f71, #ea1e63);
}

.customer-btn {
  background: linear-gradient(90deg, #ff5a36, #ff4636);
}

.register-text {
  text-align: center;
  margin: 8px 0 0;
  font-size: 15px;
  color: #333;
}

.register-link {
  margin-left: 6px;
  color: #1d4ed8;
  font-weight: 600;
  text-decoration: underline;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  z-index: 1;
}

.circle-1 {
  width: 160px;
  height: 160px;
  left: 7%;
  top: 38%;
  background: rgba(30, 55, 110, 0.2);
}

.circle-2 {
  width: 210px;
  height: 210px;
  right: 5%;
  top: 22%;
  background: rgba(80, 40, 90, 0.14);
}

.circle-3 {
  width: 120px;
  height: 120px;
  right: 10%;
  bottom: 8%;
  background: rgba(255, 255, 255, 0.22);
}

.circle-4 {
  width: 80px;
  height: 80px;
  left: 39%;
  bottom: 9%;
  background: rgba(255, 255, 255, 0.3);
}

.circle-5 {
  width: 18px;
  height: 18px;
  left: 25%;
  top: 47%;
  background: rgba(255, 255, 255, 0.4);
}

@media (max-width: 768px) {
  .login-card {
    max-width: 92%;
    padding: 24px 18px 20px;
  }

  .title {
    font-size: 24px;
  }

  .role-btn {
    font-size: 16px;
  }

  .options-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
<template>
  <div class="register-page">
    <div class="bg-circle circle-1"></div>
    <div class="bg-circle circle-2"></div>
    <div class="bg-circle circle-3"></div>
    <div class="bg-circle circle-4"></div>
    <div class="bg-circle circle-5"></div>

    <div class="register-card">
      <h1 class="title">Đăng ký</h1>

      <div class="form-group">
        <label>Họ và tên <span>*</span></label>
        <div class="input-wrap">
          <span class="input-icon">👤</span>
          <input
            v-model="fullName"
            type="text"
            placeholder="Nhập họ và tên"
            class="custom-input"
          />
        </div>
      </div>

      <div class="form-group">
        <label>Email <span>*</span></label>
        <div class="input-wrap">
          <span class="input-icon">📧</span>
          <input
            v-model="email"
            type="email"
            placeholder="Nhập email"
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

      <div class="form-group">
        <label>Nhập lại mật khẩu <span>*</span></label>
        <div class="input-wrap">
          <span class="input-icon">🔒</span>
          <input
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Nhập lại mật khẩu"
            class="custom-input"
          />
          <button
            type="button"
            class="toggle-btn"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            {{ showConfirmPassword ? "🙈" : "👁" }}
          </button>
        </div>
      </div>

      <p v-if="error" class="error-text">{{ error }}</p>

      <button
        class="submit-btn"
        @click="handleRegister"
        :disabled="loading"
      >
        {{ loading ? "Đang xử lý..." : "Đăng ký tài khoản" }}
      </button>

      <p class="login-text">
        Đã có tài khoản?
        <router-link to="/login" class="login-link">
          Đăng nhập
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import useRegister from "../features/register/useRegister";

const {
  fullName,
  email,
  password,
  confirmPassword,
  loading,
  error,
  handleRegister,
} = useRegister();

const showPassword = ref(false);
const showConfirmPassword = ref(false);
</script>

<style scoped>
.register-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #7e76e8 0%, #d94c2c 35%, #ca0fa1 65%, #c75e7f 100%);
}

.register-card {
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

.error-text {
  color: #d93025;
  margin-bottom: 14px;
  font-size: 14px;
}

.submit-btn {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 6px;
  background: linear-gradient(90deg, #2563eb, #1d4ed8);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.submit-btn:hover {
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-text {
  text-align: center;
  margin: 18px 0 0;
  font-size: 15px;
  color: #333;
}

.login-link {
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
  .register-card {
    max-width: 92%;
    padding: 24px 18px 20px;
  }

  .title {
    font-size: 24px;
  }

  .submit-btn {
    font-size: 16px;
  }
}
</style>
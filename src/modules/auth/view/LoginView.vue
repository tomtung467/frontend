<template>
  <div class="page">
    <div class="card">
      <h2>Đăng nhập</h2>

      <AuthInput v-model="email" placeholder="Nhập email" type="email" />
      <AuthInput v-model="password" placeholder="Nhập mật khẩu" type="password" />

      <p v-if="error" class="error">{{ error }}</p>

      <AuthButton title="Đăng nhập" :loading="loading" @click="handleLogin" />

      <p class="link-text">
        Chưa có tài khoản?
        <router-link to="/register">Đăng ký</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import AuthInput from "../../../components/AuthInput.vue";
import AuthButton from "../../../components/AuthButton.vue";
import useLogin from "../features/login/useLogin";

const { email, password, loading, error, handleLogin } = useLogin();
</script>

<style scoped>
.page {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  background: linear-gradient(135deg, #e0e7ff, #f0f9ff);
}

.card {
  width: 100%;
  max-width: 500px; /* tăng lên */
  background: white;
  padding: 32px;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.error {
  color: red;
  margin-bottom: 12px;
  font-size: 14px;
}

.link-text {
  margin-top: 16px;
  text-align: center;
}
</style>
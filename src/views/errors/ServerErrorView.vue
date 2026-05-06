<template>
  <div class="error-container">
    <div class="error-content">
      <div class="error-code">500</div>
      <div class="error-title">Lỗi máy chủ</div>
      <p class="error-message">
        Xin lỗi, hệ thống gặp sự cố. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.
      </p>
      <div class="error-actions">
        <button class="btn btn-primary" @click="reload">
          Tải lại trang
        </button>
        <button class="btn btn-secondary" @click="goHome">
          Về trang chủ
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const reload = () => {
  window.location.reload()
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.error-content {
  text-align: center;
  color: white;
  animation: fadeIn 0.5s ease-in;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.error-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 15px;
}

.error-message {
  font-size: 16px;
  margin-bottom: 30px;
  max-width: 400px;
  opacity: 0.9;
}

.error-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 30px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.btn-primary {
  background-color: white;
  color: #fa709a;
}

.btn-primary:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

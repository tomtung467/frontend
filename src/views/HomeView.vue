<template>
  <div class="dashboard-page">
    <MasterLayout>
      <div class="dashboard-header">
        <h1 class="dashboard-title">
          👋 Xin chào, {{ userName }}!
        </h1>
        <p class="dashboard-subtitle">
          Chào mừng bạn đến với hệ thống quản lý nhà hàng
        </p>
      </div>

      <!-- Role-Based Content -->
      <div v-if="userRole === 'customer'" class="role-section">
        <div class="welcome-card">
          <h2>Khách hàng</h2>
          <div class="quick-links">
            <router-link to="/menu" class="link-btn">
              📋 Xem thực đơn
            </router-link>
            <router-link to="/cart" class="link-btn">
              🛒 Giỏ hàng
            </router-link>
            <router-link to="/my-orders" class="link-btn">
              📝 Đơn hàng của tôi
            </router-link>
          </div>
        </div>
      </div>

      <div v-else-if="userRole === 'chef'" class="role-section">
        <div class="welcome-card">
          <h2>Đầu bếp</h2>
          <div class="quick-links">
            <router-link to="/kitchen" class="link-btn">
              👨‍🍳 Màn hình bếp
            </router-link>
            <router-link to="/kitchen/queue" class="link-btn">
              📋 Hàng chờ
            </router-link>
            <router-link to="/inventory" class="link-btn">
              📦 Nguyên liệu
            </router-link>
          </div>
        </div>
      </div>

      <div v-else-if="userRole === 'staff'" class="role-section">
        <div class="welcome-card">
          <h2>Nhân viên</h2>
          <div class="quick-links">
            <router-link to="/floor-plan" class="link-btn">
              🗺️ Sơ đồ tầng
            </router-link>
            <router-link to="/tables" class="link-btn">
              🪑 Quản lý bàn
            </router-link>
            <router-link to="/orders" class="link-btn">
              📝 Đơn hàng
            </router-link>
          </div>
        </div>
      </div>

      <div v-else-if="userRole === 'manager'" class="role-section">
        <div class="welcome-card">
          <h2>Quản lý</h2>
          <div class="quick-links">
            <router-link to="/analytics/dashboard" class="link-btn">
              📊 Tổng quan
            </router-link>
            <router-link to="/menu-management" class="link-btn">
              🍽️ Quản lý menu
            </router-link>
            <router-link to="/employees" class="link-btn">
              👥 Nhân sự
            </router-link>
            <router-link to="/inventory" class="link-btn">
              📦 Kho hàng
            </router-link>
          </div>
        </div>
      </div>

      <!-- General Info Cards -->
      <div class="info-cards">
        <div class="info-card">
          <div class="card-icon">🔐</div>
          <h3>Bảo mật</h3>
          <p>Thông tin của bạn được bảo vệ bởi mã hóa SSL</p>
        </div>
        <div class="info-card">
          <div class="card-icon">📱</div>
          <h3>Đa nền tảng</h3>
          <p>Truy cập từ bất kỳ thiết bị nào bất kỳ lúc nào</p>
        </div>
        <div class="info-card">
          <div class="card-icon">⚡</div>
          <h3>Hiệu suất</h3>
          <p>Hệ thống nhanh, ổn định và đáng tin cậy</p>
        </div>
        <div class="info-card">
          <div class="card-icon">🎯</div>
          <h3>Hỗ trợ</h3>
          <p>Đội hỗ trợ 24/7 sẵn sàng giúp bạn</p>
        </div>
      </div>

      <!-- Profile Link -->
      <div class="profile-section">
        <router-link to="/profile" class="view-profile">
          👤 Xem hồ sơ của tôi
        </router-link>
      </div>
    </MasterLayout>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import MasterLayout from '@/components/MasterLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

const userName = ref('')
const userRole = ref('')

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  userName.value = authStore.user?.name || 'Người dùng'
  userRole.value = authStore.user?.role || 'customer'
})
</script>

<style scoped>
.dashboard-page {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 40px;
  animation: slideDown 0.6s ease-out;
}

.dashboard-title {
  font-size: 36px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.dashboard-subtitle {
  font-size: 18px;
  color: #666;
}

.role-section {
  margin-bottom: 40px;
}

.welcome-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-in;
}

.welcome-card h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.link-btn {
  display: block;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.link-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 40px 0;
}

.info-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.info-card h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}

.info-card p {
  color: #666;
  font-size: 14px;
}

.profile-section {
  text-align: center;
  margin-top: 40px;
}

.view-profile {
  display: inline-block;
  padding: 12px 30px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.view-profile:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(245, 87, 108, 0.4);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>

<template>
  <MasterLayout show-footer>
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Chào mừng trở lại, Nguyễn Văn A</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary">
          <span>➕</span> Tạo đơn hàng
        </button>
      </div>
    </div>

    <!-- Main Dashboard Container -->
    <div class="dashboard-container">
      <!-- Stats Grid -->
      <div class="stats-grid">
        <MasterCard title="Tổng Doanh Thu">
          <div class="stat-value">{{ formatCurrency(totalRevenue) }}</div>
          <div class="stat-change positive">
            <span>📈</span> +12.5% so với tuần trước
          </div>
        </MasterCard>

        <MasterCard title="Tổng Đơn Hàng">
          <div class="stat-value">{{ totalOrders }}</div>
          <div class="stat-change positive">
            <span>📈</span> +8 đơn hôm nay
          </div>
        </MasterCard>

        <MasterCard title="Giá Trị Trung Bình">
          <div class="stat-value">{{ formatCurrency(avgOrderValue) }}</div>
          <div class="stat-change neutral">
            <span>➡️</span> Bằng ngày hôm qua
          </div>
        </MasterCard>

        <MasterCard title="Khách Hàng Hôm Nay">
          <div class="stat-value">{{ totalCustomers }}</div>
          <div class="stat-change positive">
            <span>📈</span> +15% so với hôm qua
          </div>
        </MasterCard>
      </div>

      <!-- Charts & Reports Section -->
      <div class="content-grid">
        <!-- Left Column -->
        <div class="left-column">
          <!-- Revenue Chart -->
          <MasterCard title="Doanh Thu Theo Ngày" class="chart-card">
            <div class="chart-placeholder">
              <div class="chart-bar" style="height: 60%;"></div>
              <div class="chart-bar" style="height: 75%;"></div>
              <div class="chart-bar" style="height: 85%;"></div>
              <div class="chart-bar" style="height: 70%;"></div>
              <div class="chart-bar" style="height: 90%;"></div>
              <div class="chart-bar" style="height: 80%;"></div>
              <div class="chart-bar" style="height: 95%;"></div>
            </div>
            <p class="chart-caption">Biểu đồ doanh thu 7 ngày gần nhất</p>
          </MasterCard>

          <!-- Recent Orders -->
          <MasterCard title="Đơn Hàng Gần Đây" class="orders-card">
            <div class="orders-list">
              <div
                v-for="order in recentOrders"
                :key="order.id"
                class="order-item"
              >
                <div class="order-info">
                  <div class="order-id">{{ order.id }}</div>
                  <div class="order-details">
                    <p class="order-customer">{{ order.customer }}</p>
                    <p class="order-time">{{ order.time }}</p>
                  </div>
                </div>
                <div class="order-amount">{{ formatCurrency(order.amount) }}</div>
                <span class="order-status" :class="order.status">
                  {{ order.statusLabel }}
                </span>
              </div>
            </div>
          </MasterCard>
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Top Dishes -->
          <MasterCard title="Những Món Ăn Nổi Tiếng" class="dishes-card">
            <div class="dishes-list">
              <div
                v-for="(dish, idx) in topDishes"
                :key="idx"
                class="dish-item"
              >
                <div class="dish-rank">{{ idx + 1 }}</div>
                <div class="dish-info">
                  <p class="dish-name">{{ dish.name }}</p>
                  <p class="dish-sales">{{ dish.sales }} bán hôm nay</p>
                </div>
                <div class="dish-bar">
                  <div
                    class="dish-bar-fill"
                    :style="{ width: dish.percentage + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </MasterCard>

          <!-- System Status -->
          <MasterCard title="Trạng Thái Hệ Thống" class="status-card">
            <div class="status-items">
              <div class="status-item">
                <div class="status-indicator online"></div>
                <div class="status-info">
                  <p class="status-name">Máy chủ</p>
                  <p class="status-detail">Online</p>
                </div>
              </div>
              <div class="status-item">
                <div class="status-indicator online"></div>
                <div class="status-info">
                  <p class="status-name">Cơ sở dữ liệu</p>
                  <p class="status-detail">Kết nối thành công</p>
                </div>
              </div>
              <div class="status-item">
                <div class="status-indicator online"></div>
                <div class="status-info">
                  <p class="status-name">Thanh toán</p>
                  <p class="status-detail">Hoạt động bình thường</p>
                </div>
              </div>
              <div class="status-item">
                <div class="status-indicator offline"></div>
                <div class="status-info">
                  <p class="status-name">Backup</p>
                  <p class="status-detail">Chưa được khởi tạo</p>
                </div>
              </div>
            </div>
          </MasterCard>
        </div>
      </div>
    </div>
  </MasterLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MasterLayout from '@/components/MasterLayout.vue';
import MasterCard from '@/components/MasterCard.vue';

// Stats Data
const totalRevenue = ref(15750000); // 15.75M VND
const totalOrders = ref(47);
const avgOrderValue = ref(335000); // 335K VND
const totalCustomers = ref(24);

// Recent Orders
const recentOrders = ref([
  {
    id: 'ORD001',
    customer: 'Nguyễn Minh Hùng',
    time: '5 phút trước',
    amount: 450000,
    status: 'completed',
    statusLabel: 'Hoàn thành'
  },
  {
    id: 'ORD002',
    customer: 'Trần Thanh Tú',
    time: '15 phút trước',
    amount: 350000,
    status: 'preparing',
    statusLabel: 'Đang chuẩn bị'
  },
  {
    id: 'ORD003',
    customer: 'Phạm Linh Chi',
    time: '25 phút trước',
    amount: 280000,
    status: 'completed',
    statusLabel: 'Hoàn thành'
  },
  {
    id: 'ORD004',
    customer: 'Đoàn Minh Tuấn',
    time: '40 phút trước',
    amount: 620000,
    status: 'delivered',
    statusLabel: 'Đã giao'
  }
]);

// Top Dishes
const topDishes = ref([
  { name: 'Phở Bò Truyền Thống', sales: 12, percentage: 100 },
  { name: 'Cơm Tấm Sườn', sales: 10, percentage: 83 },
  { name: 'Bánh Mì Thịt Nướng', sales: 8, percentage: 67 },
  { name: 'Cánh Gà Chiên Nước Mắm', sales: 7, percentage: 58 },
  { name: 'Mỳ Ý Sốt Cà Chua', sales: 6, percentage: 50 }
]);

// Utility Functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(value);
};
</script>

<style scoped>
.dashboard-header {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  padding: 2rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.page-subtitle {
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  opacity: 0.95;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  width: 100%;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2196f3;
  margin-bottom: 0.5rem;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
}

.stat-change.positive {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.stat-change.neutral {
  background-color: #fff3e0;
  color: #e65100;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Chart Card */
.chart-card {
  min-height: 300px;
}

.chart-placeholder {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.chart-bar {
  width: 15%;
  background: linear-gradient(180deg, #2196f3 0%, #64b5f6 100%);
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.chart-bar:hover {
  opacity: 0.8;
  transform: scaleY(1.05);
}

.chart-caption {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

/* Orders Card */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 6px;
  border-left: 3px solid #2196f3;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.order-id {
  font-weight: 600;
  color: #2196f3;
  font-size: 0.95rem;
}

.order-details {
  flex: 1;
}

.order-customer {
  margin: 0;
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.order-time {
  margin: 0.25rem 0 0 0;
  color: #999;
  font-size: 0.85rem;
}

.order-amount {
  font-weight: 600;
  color: #4caf50;
  min-width: 100px;
  text-align: right;
}

.order-status {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.order-status.completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.order-status.preparing {
  background-color: #fff3e0;
  color: #e65100;
}

.order-status.delivered {
  background-color: #e3f2fd;
  color: #1565c0;
}

/* Dishes Card */
.dishes-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.dish-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dish-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  flex-shrink: 0;
}

.dish-info {
  flex: 1;
}

.dish-name {
  margin: 0;
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.dish-sales {
  margin: 0.25rem 0 0 0;
  color: #999;
  font-size: 0.85rem;
}

.dish-bar {
  width: 60px;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  flex-shrink: 0;
}

.dish-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50 0%, #8bc34a 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Status Card */
.status-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  animation: pulse 2s infinite;
}

.status-indicator.online {
  background-color: #4caf50;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.6);
}

.status-indicator.offline {
  background-color: #f44336;
  animation: none;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 8px rgba(76, 175, 80, 0.6);
  }
  50% {
    box-shadow: 0 0 12px rgba(76, 175, 80, 0.8);
  }
}

.status-info {
  flex: 1;
}

.status-name {
  margin: 0;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.status-detail {
  margin: 0.25rem 0 0 0;
  color: #999;
  font-size: 0.8rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header-actions {
    justify-content: stretch;
  }

  .btn {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .order-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-amount {
    text-align: left;
    min-width: auto;
  }

  .dashboard-container {
    padding: 1rem;
  }
}
</style>

<template>
  <div class="master-layout" :class="{ 'nav-vertical': isSideNavActive }">
    <!-- Top Navbar -->
    <MasterNavbar />

    <!-- Main Content -->
    <v-main class="layout-body">
      <slot></slot>
    </v-main>

    <!-- Footer (Optional) -->
    <footer v-if="false" class="layout-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>RestaurantApp</h4>
          <p>Quản lý nhà hàng chuyên nghiệp</p>
        </div>
        <div class="footer-section">
          <h4>Liên kết nhanh</h4>
          <ul>
            <li><a href="#">Dashboard</a></li>
            <li><a href="#">Quản lý</a></li>
            <li><a href="#">Báo cáo</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Hỗ trợ</h4>
          <ul>
            <li><a href="#">Trợ giúp</a></li>
            <li><a href="#">Liên hệ</a></li>
            <li><a href="#">Cài đặt</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 RestaurantApp. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import MasterNavbar from './MasterNavbar.vue';
import { appSettings } from '@/config/appSettings';

interface Props {
  showFooter?: boolean;
}

withDefaults(defineProps<Props>(), {
  showFooter: false
});

const { smAndDown } = useDisplay();
const isSideNavActive = computed(() => appSettings.navLayout === 'side' && !smAndDown.value);
</script>

<style scoped>
.master-layout {
  --side-nav-width: 88px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.master-layout.nav-vertical {
  display: grid;
  grid-template-columns: var(--side-nav-width) minmax(0, 1fr);
  grid-template-rows: minmax(100vh, auto);
}

.layout-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.nav-vertical .layout-body {
  grid-column: 2;
  margin-left: 0;
  width: 100%;
}

.nav-vertical :deep(.master-page-header) {
  width: calc(100vw - var(--side-nav-width));
  margin-left: calc((100% - (100vw - var(--side-nav-width))) / 2);
  margin-right: calc((100% - (100vw - var(--side-nav-width))) / 2);
}

.layout-footer {
  background-color: #2c3e50;
  color: white;
  padding: 3rem 1.5rem 1rem;
  margin-top: auto;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: white;
}

.footer-section p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.footer-section ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-section li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 0.9rem;
}

.footer-section a:hover {
  color: white;
  text-decoration: underline;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}
</style>

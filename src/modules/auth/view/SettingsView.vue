<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-6">Cài đặt</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="3">
        <!-- Settings Menu -->
        <v-list density="compact" class="rounded-lg border">
          <v-list-item
            v-for="item in settingsMenu"
            :key="item.id"
            :active="activeTab === item.id"
            @click="activeTab = item.id"
            link
            :prepend-icon="item.icon"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>

      <v-col cols="12" md="9">
        <!-- General Settings -->
        <v-card v-if="activeTab === 'general'" class="pa-6 mb-6">
          <h3 class="text-h6 mb-4">Cài đặt chung</h3>
          <v-divider class="mb-4"></v-divider>

          <v-form @submit.prevent="saveGeneralSettings">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="generalSettings.language"
                  label="Ngôn ngữ"
                  :items="languages"
                  item-title="name"
                  item-value="code"
                  variant="outlined"
                ></v-select>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="generalSettings.theme"
                  label="Chủ đề"
                  :items="['light', 'dark', 'auto']"
                  variant="outlined"
                ></v-select>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="generalSettings.date_format"
                  label="Định dạng ngày"
                  :items="['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']"
                  variant="outlined"
                ></v-select>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" class="d-flex gap-2">
                <v-btn type="submit" color="primary">
                  <v-icon start>mdi-content-save</v-icon>
                  Lưu
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card>

        <!-- Privacy Settings -->
        <v-card v-if="activeTab === 'privacy'" class="pa-6 mb-6">
          <h3 class="text-h6 mb-4">Quyền riêng tư</h3>
          <v-divider class="mb-4"></v-divider>

          <v-form @submit.prevent="savePrivacySettings">
            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="privacySettings.profile_public"
                  label="Hồ sơ công khai"
                  description="Cho phép người khác xem hồ sơ của bạn"
                ></v-switch>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="privacySettings.show_email"
                  label="Hiển thị email"
                  description="Cho phép người khác thấy địa chỉ email của bạn"
                ></v-switch>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="privacySettings.show_activity"
                  label="Hiển thị hoạt động"
                  description="Cho phép người khác xem hoạt động của bạn"
                ></v-switch>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" class="d-flex gap-2">
                <v-btn type="submit" color="primary">
                  <v-icon start>mdi-content-save</v-icon>
                  Lưu
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card>

        <!-- Notification Settings -->
        <v-card v-if="activeTab === 'notifications'" class="pa-6 mb-6">
          <h3 class="text-h6 mb-4">Thông báo</h3>
          <v-divider class="mb-4"></v-divider>

          <v-form @submit.prevent="saveNotificationSettings">
            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="notificationSettings.email_notifications"
                  label="Thông báo qua email"
                  description="Nhận thông báo qua email"
                ></v-switch>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="notificationSettings.order_updates"
                  label="Cập nhật đơn hàng"
                  description="Thông báo về trạng thái đơn hàng"
                ></v-switch>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="notificationSettings.promotions"
                  label="Khuyến mãi"
                  description="Nhận thông báo về khuyến mãi và ưu đãi"
                ></v-switch>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" class="d-flex gap-2">
                <v-btn type="submit" color="primary">
                  <v-icon start>mdi-content-save</v-icon>
                  Lưu
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card>

        <!-- Security Settings -->
        <v-card v-if="activeTab === 'security'" class="pa-6 mb-6">
          <h3 class="text-h6 mb-4">Bảo mật</h3>
          <v-divider class="mb-4"></v-divider>

          <v-row>
            <v-col cols="12">
              <h4 class="text-subtitle2 mb-2">Xác thực hai yếu tố (2FA)</h4>
              <p class="text-caption mb-4">Bảo vệ tài khoản của bạn bằng xác thực hai yếu tố</p>
              <v-btn
                variant="outlined"
                size="small"
                @click="enable2FA"
                :disabled="securitySettings.two_factor_enabled"
              >
                <v-icon start>mdi-shield-check</v-icon>
                {{ securitySettings.two_factor_enabled ? 'Đã bật' : 'Bật xác thực 2FA' }}
              </v-btn>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <v-row>
            <v-col cols="12">
              <h4 class="text-subtitle2 mb-2">Các phiên đang hoạt động</h4>
              <v-list density="compact">
                <v-list-item v-for="session in activeSessions" :key="session.id">
                  <template v-slot:prepend>
                    <v-icon>mdi-devices</v-icon>
                  </template>
                  <v-list-item-title>{{ session.device }}</v-list-item-title>
                  <v-list-item-subtitle>{{ session.location }} - {{ session.last_active }}</v-list-item-subtitle>
                  <template v-slot:append v-if="!session.is_current">
                    <v-btn icon size="small" @click="logoutSession(session.id)">
                      <v-icon>mdi-logout</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card>

        <!-- Data & Privacy -->
        <v-card v-if="activeTab === 'data'" class="pa-6">
          <h3 class="text-h6 mb-4">Dữ liệu & Quyền riêng tư</h3>
          <v-divider class="mb-4"></v-divider>

          <v-row>
            <v-col cols="12">
              <h4 class="text-subtitle2 mb-2">Tải xuống dữ liệu của bạn</h4>
              <p class="text-caption mb-4">Tải một bản sao tất cả dữ liệu cá nhân của bạn</p>
              <v-btn variant="outlined" size="small" @click="downloadData">
                <v-icon start>mdi-download</v-icon>
                Tải dữ liệu
              </v-btn>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <v-row>
            <v-col cols="12">
              <h4 class="text-subtitle2 mb-2 text-error">Xóa tài khoản</h4>
              <p class="text-caption mb-4">Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn</p>
              <v-btn color="error" size="small" @click="deleteAccount">
                <v-icon start>mdi-delete</v-icon>
                Xóa tài khoản
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeTab = ref('general');

const settingsMenu = [
  { id: 'general', title: 'Cài đặt chung', icon: 'mdi-cog' },
  { id: 'privacy', title: 'Quyền riêng tư', icon: 'mdi-lock' },
  { id: 'notifications', title: 'Thông báo', icon: 'mdi-bell' },
  { id: 'security', title: 'Bảo mật', icon: 'mdi-shield' },
  { id: 'data', title: 'Dữ liệu & Quyền riêng tư', icon: 'mdi-database' },
];

const languages = [
  { name: 'Tiếng Việt', code: 'vi' },
  { name: 'English', code: 'en' },
];

const generalSettings = ref({
  language: 'vi',
  theme: 'light',
  date_format: 'DD/MM/YYYY',
});

const privacySettings = ref({
  profile_public: false,
  show_email: false,
  show_activity: false,
});

const notificationSettings = ref({
  email_notifications: true,
  order_updates: true,
  promotions: false,
});

const securitySettings = ref({
  two_factor_enabled: false,
});

const activeSessions = ref([
  {
    id: 1,
    device: 'Chrome on Windows',
    location: 'Hà Nội',
    last_active: 'Bây giờ',
    is_current: true,
  },
  {
    id: 2,
    device: 'Safari on iPhone',
    location: 'Thành phố Hồ Chí Minh',
    last_active: '2 giờ trước',
    is_current: false,
  },
]);

const saveGeneralSettings = () => {
  console.log('Saving general settings:', generalSettings.value);
  // TODO: Call API to save settings
};

const savePrivacySettings = () => {
  console.log('Saving privacy settings:', privacySettings.value);
  // TODO: Call API to save settings
};

const saveNotificationSettings = () => {
  console.log('Saving notification settings:', notificationSettings.value);
  // TODO: Call API to save settings
};

const enable2FA = () => {
  // TODO: Implement 2FA setup
  console.log('Enabling 2FA');
};

const logoutSession = (sessionId) => {
  console.log('Logging out session:', sessionId);
  // TODO: Call API to logout session
};

const downloadData = () => {
  console.log('Downloading data');
  // TODO: Implement data download
};

const deleteAccount = () => {
  if (confirm('Bạn chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
    console.log('Deleting account');
    // TODO: Call API to delete account
  }
};
</script>

<style scoped>
</style>

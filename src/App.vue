<template>
  <v-app>
    <router-view />
    <NotificationHost />
  </v-app>
</template>

<script setup>
import { watchEffect } from 'vue'
import NotificationHost from '@/components/common/NotificationHost.vue'
import { appSettings } from '@/config/appSettings'

watchEffect(() => {
  document.title = appSettings.siteName || 'RestaurantApp'
})
</script>

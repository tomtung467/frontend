<template>
  <MasterLayout show-footer>
    <div class="payments-view">
      <h1>Payments</h1>
      <p>Payment management will be displayed here</p>
    </div>
  </MasterLayout>
</template>

<script setup>
import MasterLayout from '@/components/MasterLayout.vue'
</script>

<style scoped>
.payments-view {
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}
</style>

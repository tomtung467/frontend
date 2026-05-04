<template>
  <MasterLayout show-footer>
    <div class="reports-view">
      <h1>Reports</h1>
      <p>Sales reports will be displayed here</p>
    </div>
  </MasterLayout>
</template>

<script setup>
import MasterLayout from '@/components/MasterLayout.vue'
</script>

<style scoped>
.reports-view {
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}
</style>

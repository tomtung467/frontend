<template>
  <MasterLayout show-footer>
    <div class="invoices-view">
      <h1>Invoices</h1>
      <p>Invoice management will be displayed here</p>
    </div>
  </MasterLayout>
</template>

<script setup>
import MasterLayout from '@/components/MasterLayout.vue'
</script>

<style scoped>
.invoices-view {
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}
</style>

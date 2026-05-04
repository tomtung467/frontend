<template>
  <MasterLayout show-footer>
    <div class="queue-view">
      <h1>Kitchen Queue</h1>
      <p>Order queue will be displayed here</p>
    </div>
  </MasterLayout>
</template>

<script setup>
import MasterLayout from '@/components/MasterLayout.vue'
</script>

<style scoped>
.queue-view {
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}
</style>

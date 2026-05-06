<template>
  <MasterLayout show-footer>
    <main class="ops-page">
      <MasterPageHeader title="Hóa đơn">
        <template #actions>
          <button class="ghost-action" @click="loadInvoices">Làm mới</button>
        </template>
      </MasterPageHeader>

      <section class="toolbar">
        <input v-model="search" type="search" placeholder="Search invoice, order or payment" />
        <select v-model="statusFilter">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="issued">Issued</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </section>

      <p v-if="error" class="state error">{{ error }}</p>
      <p v-else-if="loading" class="state">Loading invoices...</p>
      <p v-else-if="filteredInvoices.length === 0" class="state">No invoices found.</p>

      <div v-else class="data-table">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Payment</th>
              <th>Subtotal</th>
              <th>Tax</th>
              <th>Discount</th>
              <th>Total</th>
              <th>Status</th>
              <th>Issued</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in filteredInvoices" :key="invoice.id">
              <td><strong>{{ invoice.invoice_number }}</strong></td>
              <td>#{{ invoice.payment_id }}</td>
              <td>{{ formatCurrency(invoice.subtotal) }}</td>
              <td>{{ formatCurrency(invoice.tax) }}</td>
              <td>{{ formatCurrency(invoice.discount) }}</td>
              <td>{{ formatCurrency(invoice.total) }}</td>
              <td><span class="badge">{{ invoice.status }}</span></td>
              <td>{{ formatDate(invoice.issued_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import { paymentService } from '@/services'

const invoices = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const statusFilter = ref('')

const filteredInvoices = computed(() => {
  const query = search.value.trim().toLowerCase()
  return invoices.value.filter((invoice) => {
    const haystack = [invoice.invoice_number, invoice.payment_id, invoice.payment?.order?.order_number].join(' ').toLowerCase()
    return (!query || haystack.includes(query)) && (!statusFilter.value || invoice.status === statusFilter.value)
  })
})

onMounted(loadInvoices)

async function loadInvoices() {
  loading.value = true
  error.value = ''
  try {
    invoices.value = await paymentService.getInvoices()
  } catch (err) {
    error.value = err.message || 'Failed to load invoices.'
  } finally {
    loading.value = false
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0))
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '-'
}
</script>

<style scoped>
.ops-page { padding: 24px; width: min(1320px, 100%); margin: 0 auto; }
.toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.toolbar { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 14px; }
input, select { min-height: 38px; border: 1px solid #d0d5dd; border-radius: 6px; padding: 0 10px; background: #fff; }
.toolbar input { min-width: 280px; flex: 1; }
button { border: 0; border-radius: 6px; min-height: 38px; padding: 0 14px; cursor: pointer; }
.ghost-action { background: #f2f4f7; color: #344054; }
.state { padding: 18px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; color: #475467; }
.state.error { color: #b42318; border-color: #fecdca; background: #fffbfa; }
.data-table { overflow-x: auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 13px 14px; border-bottom: 1px solid #eaecf0; text-align: left; }
th { color: #667085; font-size: 12px; text-transform: uppercase; background: #f9fafb; }
.badge { border-radius: 999px; padding: 4px 9px; font-size: 12px; background: #eff8ff; color: #175cd3; }
@media (max-width: 720px) { .ops-page { padding: 16px; } .toolbar input { min-width: 100%; } }
</style>

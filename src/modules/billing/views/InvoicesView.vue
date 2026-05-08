<template>
  <MasterLayout show-footer>
    <main class="ops-page">
      <MasterPageHeader :title="t('billing.invoices')">
        <template #actions>
          <button class="ghost-action" @click="loadInvoices">{{ t('billing.refresh') }}</button>
        </template>
      </MasterPageHeader>

      <section v-if="currentBills.length" class="current-bills">
        <article v-for="bill in currentBills" :key="bill.id" class="bill-card" :class="{ alert: bill.payment_requested_at }">
          <div>
            <strong>{{ t('billing.table') }} {{ bill.table?.table_number || bill.table_id }}</strong>
            <span>{{ bill.order_number }} - {{ orderStatusLabel(bill.status) }}</span>
          </div>
          <div>
            <span>{{ t('billing.subtotal') }}</span>
            <strong>{{ formatCurrency(bill.total_price) }}</strong>
          </div>
          <em v-if="bill.payment_requested_at">{{ t('billing.customerPayment') }}</em>
        </article>
      </section>

      <section class="toolbar">
        <input v-model="search" type="search" :placeholder="t('billing.searchInvoice')" />
        <select v-model="statusFilter">
          <option value="">{{ t('billing.allStatuses') }}</option>
          <option value="draft">{{ t('billing.draft') }}</option>
          <option value="issued">{{ t('billing.issued') }}</option>
          <option value="paid">{{ t('billing.paid') }}</option>
          <option value="overdue">{{ t('billing.overdue') }}</option>
          <option value="cancelled">{{ t('billing.cancelled') }}</option>
        </select>
      </section>

      <p v-if="loading" class="state">{{ t('billing.loadingInvoices') }}</p>
      <p v-else-if="filteredInvoices.length === 0" class="state">{{ t('billing.noInvoices') }}</p>

      <div v-else class="data-table">
        <table>
          <thead>
            <tr>
              <th>{{ t('billing.invoice') }}</th>
              <th>{{ t('billing.payment') }}</th>
              <th>{{ t('billing.subtotal') }}</th>
              <th>{{ t('billing.tax') }}</th>
              <th>{{ t('billing.discount') }}</th>
              <th>{{ t('billing.total') }}</th>
              <th>{{ t('billing.status') }}</th>
              <th>{{ t('billing.issued') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in paginatedInvoices" :key="invoice.id">
              <td><strong>{{ invoice.invoice_number }}</strong></td>
              <td>#{{ invoice.payment_id }}</td>
              <td>{{ formatCurrency(invoice.subtotal) }}</td>
              <td>{{ formatCurrency(invoice.tax) }}</td>
              <td>{{ formatCurrency(invoice.discount) }}</td>
              <td><strong>{{ formatCurrency(invoice.total) }}</strong></td>
              <td><span class="badge" :class="invoice.status">{{ invoiceStatusLabel(invoice.status) }}</span></td>
              <td>{{ formatDate(invoice.issued_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav v-if="filteredInvoices.length" class="pagination">
        <span>Tổng {{ filteredInvoices.length }},</span>
        <span>Hiển thị</span>
        <select v-model.number="pageSize">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
        <button class="page-button" :disabled="currentPage === 1" @click="currentPage--">‹</button>
        <strong>{{ currentPage }}</strong>
        <button class="page-button" :disabled="currentPage === totalPages" @click="currentPage++">›</button>
      </nav>

    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import { showNotification } from '@/composables/usePopup'
import { isAbortError } from '@/api/requestManager'
import { paymentService } from '@/services'
import { currentLanguage, t } from '@/languages'

const invoices = ref([])
const currentBills = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const filteredInvoices = computed(() => {
  const query = search.value.trim().toLowerCase()
  return invoices.value.filter((invoice) => {
    const haystack = [invoice.invoice_number, invoice.payment_id, invoice.payment?.order?.order_number].join(' ').toLowerCase()
    return (!query || haystack.includes(query)) && (!statusFilter.value || invoice.status === statusFilter.value)
  })
})
const totalPages = computed(() => Math.max(1, Math.ceil(filteredInvoices.value.length / pageSize.value)))
const paginatedInvoices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredInvoices.value.slice(start, start + pageSize.value)
})

watch([search, statusFilter, pageSize], () => {
  currentPage.value = 1
})
watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

onMounted(loadInvoices)

async function loadInvoices() {
  loading.value = true
  error.value = ''
  try {
    invoices.value = await paymentService.getInvoices()
    currentBills.value = await paymentService.getCurrentBills()
  } catch (err) {
    if (isAbortError(err)) return
    showPopup('danger', t('common.error'), err.message || t('billing.failedInvoices'))
  } finally {
    loading.value = false
  }
}

function showPopup(type, title, message = '') {
  showNotification({ type, title, message })
}

function invoiceStatusLabel(status) {
  return {
    draft: t('billing.draft'),
    issued: t('billing.issued'),
    paid: t('billing.paid'),
    overdue: t('billing.overdue'),
    cancelled: t('billing.cancelled'),
  }[status] || status || '-'
}

function orderStatusLabel(status) {
  const translated = t(`status.${status}`)
  return translated === `status.${status}` ? (status || '-') : translated
}

function locale() {
  return currentLanguage.value === 'en' ? 'en-US' : 'vi-VN'
}

function formatCurrency(value) {
  return new Intl.NumberFormat(locale(), { style: 'currency', currency: 'VND' }).format(Number(value || 0))
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat(locale(), { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '-'
}

</script>

<style scoped>
.ops-page { padding: 24px; width: min(1320px, 100%); margin: 0 auto; }
.toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.current-bills { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; margin-bottom: 14px; }
.bill-card { display: flex; justify-content: space-between; gap: 12px; align-items: center; background: #fff; border: 1px solid #dfe3ea; border-radius: 8px; padding: 14px; }
.bill-card div { display: grid; gap: 3px; }
.bill-card span { color: #667085; font-size: 13px; }
.bill-card strong { color: #111827; }
.bill-card.alert { border-color: #fecdca; background: #fffbfa; }
.bill-card em { color: #b42318; font-style: normal; font-weight: 800; font-size: 12px; }
.toolbar { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 14px; }
input, select { min-height: 38px; border: 1px solid #d0d5dd; border-radius: 6px; padding: 0 10px; background: #fff; }
.toolbar input { min-width: 280px; flex: 1; }
button { border: 0; border-radius: 6px; min-height: 38px; padding: 0 14px; cursor: pointer; }
.ghost-action { background: #f2f4f7; color: #344054; }
.state { padding: 18px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; color: #475467; }
.data-table { overflow-x: auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 13px 14px; border-bottom: 1px solid #eaecf0; text-align: left; }
th { color: #667085; font-size: 12px; text-transform: uppercase; background: #f9fafb; }
.badge { border-radius: 999px; padding: 4px 9px; font-size: 12px; background: #eff8ff; color: #175cd3; }
.badge.paid { background: #ecfdf3; color: #027a48; }
.badge.overdue, .badge.cancelled { background: #fef3f2; color: #b42318; }
.badge.draft { background: #f2f4f7; color: #344054; }
.pagination { display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-top: 14px; color: #344054; }
.pagination select { width: 74px; min-height: 34px; }
.pagination strong { display: grid; place-items: center; min-width: 34px; height: 34px; border-radius: 6px; background: #f2f4f7; color: #111827; }
.page-button { min-width: 34px; min-height: 34px; padding: 0; background: transparent; color: #98a2b3; font-size: 24px; }
.page-button:not(:disabled) { color: #344054; }
@media (max-width: 720px) { .ops-page { padding: 16px; } .toolbar input { min-width: 100%; } }
</style>

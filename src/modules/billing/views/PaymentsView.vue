<template>
  <MasterLayout show-footer>
    <main class="ops-page">
      <MasterPageHeader :title="t('billing.payments')">
        <template #actions>
          <div class="header-controls">
            <input v-model="search" type="search" :placeholder="t('billing.searchPayment')" />
            <select v-model="methodFilter">
              <option value="">{{ t('billing.allMethods') }}</option>
              <option value="cash">{{ t('billing.cash') }}</option>
              <option value="card">{{ t('billing.card') }}</option>
              <option value="qr_code">{{ t('billing.qrCode') }}</option>
              <option value="digital_wallet">{{ t('billing.digitalWallet') }}</option>
            </select>
          </div>
          <button class="primary-action" :disabled="saving" @click="openPaymentModal">
            {{ t('billing.recordPayment') }}
          </button>
        </template>
      </MasterPageHeader>

      <section class="summary-strip">
        <div class="metric"><span>{{ t('billing.totalPayments') }}</span><strong>{{ payments.length }}</strong></div>
        <div class="metric"><span>{{ t('billing.completed') }}</span><strong>{{ countByStatus('completed') }}</strong></div>
        <div class="metric"><span>{{ t('billing.paidValue') }}</span><strong>{{ formatCurrency(totalPaid) }}</strong></div>
      </section>

      <p v-if="loading" class="state">{{ t('billing.loadingPayments') }}</p>
      <p v-else-if="payments.length === 0" class="state">{{ t('billing.noPayments') }}</p>

      <div v-else class="data-table">
        <table>
          <thead>
            <tr>
              <th>{{ t('billing.id') }}</th>
              <th>{{ t('billing.order') }}</th>
              <th>{{ t('billing.method') }}</th>
              <th>{{ t('billing.amount') }}</th>
              <th>{{ t('billing.status') }}</th>
              <th>{{ t('billing.paidAt') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in paginatedPayments" :key="payment.id">
              <td>#{{ payment.id }}</td>
              <td>{{ payment.order?.order_number || payment.order_id }}</td>
              <td>{{ paymentMethodLabel(payment.payment_method) }}</td>
              <td>{{ formatCurrency(payment.amount) }}</td>
              <td><span class="badge" :class="payment.status">{{ paymentStatusLabel(payment.status) }}</span></td>
              <td>{{ formatDate(payment.paid_at || payment.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav v-if="filteredPayments.length" class="pagination">
        <span>Tổng {{ filteredPayments.length }},</span>
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

      <Teleport to="body">
        <transition name="drawer-fade">
          <div v-if="formModalOpen" class="drawer-backdrop" @click.self="closePaymentModal">
            <aside class="entity-drawer" role="dialog" aria-modal="true">
              <header class="drawer-header">
                <div>
                  <h2>{{ t('billing.recordPayment') }}</h2>
                  <p>{{ t('billing.order') }}</p>
                </div>
                <button class="icon-action" type="button" aria-label="Close" @click="closePaymentModal">&times;</button>
              </header>

              <form class="drawer-form" @submit.prevent="processPayment">
                <label>
                  <span>{{ t('billing.orderId') }}</span>
                  <input v-model.number="form.order_id" required type="number" :placeholder="t('billing.orderId')" />
                </label>
                <label>
                  <span>{{ t('billing.amount') }}</span>
                  <input v-model.number="form.amount" required type="number" step="1000" :placeholder="t('billing.amount')" />
                </label>
                <label>
                  <span>{{ t('billing.method') }}</span>
                  <select v-model="form.payment_method" required>
                    <option value="cash">{{ t('billing.cash') }}</option>
                    <option value="card">{{ t('billing.card') }}</option>
                    <option value="qr_code">{{ t('billing.qrCode') }}</option>
                    <option value="digital_wallet">{{ t('billing.digitalWallet') }}</option>
                  </select>
                </label>
                <label>
                  <span>{{ t('billing.referenceCode') }}</span>
                  <input v-model="form.reference_code" :placeholder="t('billing.referenceCode')" />
                </label>
                <footer class="drawer-actions">
                  <button type="button" class="ghost-action" @click="closePaymentModal">{{ t('user.cancel') }}</button>
                  <button class="primary-action" :disabled="saving">{{ saving ? t('billing.processing') : t('billing.recordPayment') }}</button>
                </footer>
              </form>
            </aside>
          </div>
        </transition>
      </Teleport>

    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import { showNotification } from '@/composables/usePopup'
import { isAbortError } from '@/api/requestManager'
import { paymentService } from '@/services'
import { currentLanguage, t } from '@/languages'

const payments = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const search = ref('')
const methodFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const formModalOpen = ref(false)
const form = reactive({ order_id: null, amount: null, payment_method: 'cash', reference_code: '' })

const totalPaid = computed(() =>
  payments.value
    .filter((payment) => payment.status === 'completed')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
)

const filteredPayments = computed(() => {
  const query = search.value.trim().toLowerCase()
  return payments.value.filter((payment) => {
    const haystack = [payment.id, payment.order_id, payment.order?.order_number, payment.reference_code].join(' ').toLowerCase()
    return (!query || haystack.includes(query)) && (!methodFilter.value || payment.payment_method === methodFilter.value)
  })
})
const totalPages = computed(() => Math.max(1, Math.ceil(filteredPayments.value.length / pageSize.value)))
const paginatedPayments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredPayments.value.slice(start, start + pageSize.value)
})

watch([search, methodFilter, pageSize], () => {
  currentPage.value = 1
})
watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

onMounted(loadPayments)

async function loadPayments() {
  loading.value = true
  error.value = ''
  try {
    payments.value = await paymentService.getPayments()
  } catch (err) {
    if (isAbortError(err)) return
    showPopup('danger', t('common.error'), err.message || t('billing.failedPayments'))
  } finally {
    loading.value = false
  }
}

async function processPayment() {
  if (!form.order_id || !form.amount) return
  saving.value = true
  error.value = ''
  try {
    await paymentService.processPayment({ ...form })
    Object.assign(form, { order_id: null, amount: null, payment_method: 'cash', reference_code: '' })
    formModalOpen.value = false
    await loadPayments()
  } catch (err) {
    if (isAbortError(err)) return
    showPopup('danger', t('common.error'), err.message || t('billing.failedRecord'))
  } finally {
    saving.value = false
  }
}

function openPaymentModal() {
  formModalOpen.value = true
}

function closePaymentModal() {
  formModalOpen.value = false
  Object.assign(form, { order_id: null, amount: null, payment_method: 'cash', reference_code: '' })
}

function showPopup(type, title, message = '') {
  showNotification({ type, title, message })
}

function paymentMethodLabel(method) {
  const labels = {
    cash: t('billing.cash'),
    card: t('billing.card'),
    qr_code: t('billing.qrCode'),
    digital_wallet: t('billing.digitalWallet'),
  }
  return labels[method] || method || '-'
}

function paymentStatusLabel(status) {
  return {
    completed: t('billing.completed'),
    pending: t('status.pending'),
    failed: t('billing.failed'),
    refunded: t('billing.refunded'),
  }[status] || status || '-'
}

function countByStatus(status) {
  return payments.value.filter((payment) => payment.status === status).length
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
.ops-page { padding: 24px; width: min(1320px, 100%); margin: 0 auto; box-sizing: border-box; }
.header-controls, .summary-strip { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.summary-strip { margin-bottom: 14px; }
input, select { min-height: 38px; border: 1px solid #d0d5dd; border-radius: 6px; padding: 0 10px; background: #fff; flex: 1 1 160px; }
.header-controls input { width: min(360px, 42vw); flex: none; }
.header-controls select { width: 190px; flex: none; }
button { border: 0; border-radius: 6px; min-height: 38px; padding: 0 14px; cursor: pointer; }
button:disabled { opacity: .55; cursor: not-allowed; }
.primary-action { background: #155eef; color: #fff; }
.ghost-action { background: #f2f4f7; color: #344054; }
.metric { flex: 1 1 190px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; min-width: 0; }
.metric span { display: block; color: #667085; font-size: 13px; }
.metric strong { font-size: 22px; color: #111827; }
.state { padding: 18px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; color: #475467; }
.data-table { overflow-x: auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
table { width: 100%; min-width: 720px; border-collapse: collapse; }
th, td { padding: 13px 14px; border-bottom: 1px solid #eaecf0; text-align: left; }
th { color: #667085; font-size: 12px; text-transform: uppercase; background: #f9fafb; }
.badge { border-radius: 999px; padding: 4px 9px; font-size: 12px; background: #ecfdf3; color: #027a48; }
.badge.pending { background: #fffaeb; color: #b54708; }
.badge.failed { background: #fef3f2; color: #b42318; }
.badge.refunded { background: #f2f4f7; color: #344054; }
.drawer-backdrop { position: fixed; inset: 0; z-index: 2900; display: flex; justify-content: flex-end; background: rgba(15, 23, 42, .34); }
.entity-drawer { width: min(480px, 100%); height: 100%; overflow-y: auto; background: #fff; box-shadow: -18px 0 44px rgba(15, 23, 42, .18); }
.drawer-header { position: sticky; top: 0; z-index: 1; display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; padding: 22px 24px; border-bottom: 1px solid #eaecf0; background: #fff; }
.drawer-header h2 { margin: 0; font-size: 24px; color: #111827; }
.drawer-header p { margin: 6px 0 0; color: #667085; }
.icon-action { display: grid; place-items: center; width: 38px; height: 38px; min-height: 38px; border-radius: 7px; padding: 0; background: #f2f4f7; color: #344054; font-size: 26px; line-height: 1; }
.drawer-form { display: grid; gap: 16px; padding: 20px 24px 24px; }
.drawer-form label { display: grid; gap: 7px; color: #344054; font-weight: 700; }
.drawer-form input, .drawer-form select { width: 100%; flex: none; }
.drawer-actions { position: sticky; bottom: 0; display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid #eaecf0; background: #fff; }
.drawer-fade-enter-active, .drawer-fade-leave-active { transition: opacity .18s ease; }
.drawer-fade-enter-active .entity-drawer, .drawer-fade-leave-active .entity-drawer { transition: transform .2s ease; }
.drawer-fade-enter-from, .drawer-fade-leave-to { opacity: 0; }
.drawer-fade-enter-from .entity-drawer, .drawer-fade-leave-to .entity-drawer { transform: translateX(28px); }
.pagination { display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-top: 14px; color: #344054; }
.pagination select { width: 74px; min-height: 34px; flex: none; }
.pagination strong { display: grid; place-items: center; min-width: 34px; height: 34px; border-radius: 6px; background: #f2f4f7; color: #111827; }
.page-button { min-width: 34px; min-height: 34px; padding: 0; background: transparent; color: #98a2b3; font-size: 24px; }
.page-button:not(:disabled) { color: #344054; }
@media (max-width: 720px) { .ops-page { padding: 16px; } .header-controls, .header-controls input, .header-controls select { width: 100%; } }
</style>

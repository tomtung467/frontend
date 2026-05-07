<template>
  <MasterLayout show-footer>
    <main class="ops-page">
      <MasterPageHeader :title="t('billing.payments')">
        <template #actions>
          <button class="primary-action" :disabled="saving" @click="processPayment">
            {{ saving ? t('billing.processing') : t('billing.recordPayment') }}
          </button>
        </template>
      </MasterPageHeader>

      <form class="inline-form" @submit.prevent="processPayment">
        <input v-model.number="form.order_id" required type="number" :placeholder="t('billing.orderId')" />
        <input v-model.number="form.amount" required type="number" step="1000" :placeholder="t('billing.amount')" />
        <select v-model="form.payment_method" required>
          <option value="cash">{{ t('billing.cash') }}</option>
          <option value="card">{{ t('billing.card') }}</option>
          <option value="qr_code">{{ t('billing.qrCode') }}</option>
          <option value="digital_wallet">{{ t('billing.digitalWallet') }}</option>
        </select>
        <input v-model="form.reference_code" :placeholder="t('billing.referenceCode')" />
      </form>

      <section class="summary-strip">
        <div class="metric"><span>{{ t('billing.totalPayments') }}</span><strong>{{ payments.length }}</strong></div>
        <div class="metric"><span>{{ t('billing.completed') }}</span><strong>{{ countByStatus('completed') }}</strong></div>
        <div class="metric"><span>{{ t('billing.paidValue') }}</span><strong>{{ formatCurrency(totalPaid) }}</strong></div>
      </section>

      <p v-if="error" class="state error">{{ error }}</p>
      <p v-else-if="loading" class="state">{{ t('billing.loadingPayments') }}</p>
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
            <tr v-for="payment in payments" :key="payment.id">
              <td>#{{ payment.id }}</td>
              <td>{{ payment.order?.order_number || payment.order_id }}</td>
              <td>{{ payment.payment_method }}</td>
              <td>{{ formatCurrency(payment.amount) }}</td>
              <td><span class="badge">{{ payment.status }}</span></td>
              <td>{{ formatDate(payment.paid_at || payment.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import MasterLayout from '@/components/MasterLayout.vue'
import MasterPageHeader from '@/components/MasterPageHeader.vue'
import { paymentService } from '@/services'
import { currentLanguage, t } from '@/languages'

const payments = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const form = reactive({ order_id: null, amount: null, payment_method: 'cash', reference_code: '' })

const totalPaid = computed(() =>
  payments.value
    .filter((payment) => payment.status === 'completed')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
)

onMounted(loadPayments)

async function loadPayments() {
  loading.value = true
  error.value = ''
  try {
    payments.value = await paymentService.getPayments()
  } catch (err) {
    error.value = err.message || t('billing.failedPayments')
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
    await loadPayments()
  } catch (err) {
    error.value = err.message || t('billing.failedRecord')
  } finally {
    saving.value = false
  }
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
.ops-page { padding: 24px; width: min(1320px, 100%); margin: 0 auto; }
.inline-form, .summary-strip { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.inline-form, .summary-strip { margin-bottom: 14px; }
.inline-form { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
input, select { min-height: 38px; border: 1px solid #d0d5dd; border-radius: 6px; padding: 0 10px; background: #fff; flex: 1 1 160px; }
button { border: 0; border-radius: 6px; min-height: 38px; padding: 0 14px; cursor: pointer; }
button:disabled { opacity: .55; cursor: not-allowed; }
.primary-action { background: #155eef; color: #fff; }
.metric { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; min-width: 190px; }
.metric span { display: block; color: #667085; font-size: 13px; }
.metric strong { font-size: 22px; color: #111827; }
.state { padding: 18px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; color: #475467; }
.state.error { color: #b42318; border-color: #fecdca; background: #fffbfa; }
.data-table { overflow-x: auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 13px 14px; border-bottom: 1px solid #eaecf0; text-align: left; }
th { color: #667085; font-size: 12px; text-transform: uppercase; background: #f9fafb; }
.badge { border-radius: 999px; padding: 4px 9px; font-size: 12px; background: #ecfdf3; color: #027a48; }
@media (max-width: 720px) { .ops-page { padding: 16px; } }
</style>

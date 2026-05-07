<template>
  <Teleport to="body">
    <transition name="popup-fade">
      <div v-if="modelValue" class="popup-backdrop" @click.self="closeOnBackdrop ? close() : null">
        <section class="popup" role="dialog" aria-modal="true">
          <div class="popup-icon" :class="type">
            <span v-if="type === 'success'">✓</span>
            <span v-else-if="type === 'danger'">!</span>
            <span v-else-if="type === 'warning'">!</span>
            <span v-else>i</span>
          </div>
          <div class="popup-copy">
            <h2>{{ title }}</h2>
            <p v-if="message">{{ message }}</p>
          </div>
          <div class="popup-actions">
            <button v-if="cancelText" class="btn ghost" @click="$emit('cancel')">{{ cancelText }}</button>
            <button class="btn" :class="type" @click="$emit('confirm')">{{ confirmText }}</button>
          </div>
        </section>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  type: { type: String, default: 'info' },
  confirmText: { type: String, default: 'OK' },
  cancelText: { type: String, default: '' },
  closeOnBackdrop: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.popup-backdrop {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(15, 23, 42, .38);
}

.popup {
  width: min(420px, 100%);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 20px 48px rgba(15, 23, 42, .22);
  padding: 24px;
}

.popup-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 999px;
  margin-bottom: 14px;
  font-size: 24px;
  font-weight: 900;
}

.popup-icon.info { background: #eff8ff; color: #175cd3; }
.popup-icon.success { background: #ecfdf3; color: #027a48; }
.popup-icon.warning { background: #fffaeb; color: #b54708; }
.popup-icon.danger { background: #fef3f2; color: #b42318; }

.popup-copy h2 {
  margin: 0;
  font-size: 22px;
  color: #101828;
}

.popup-copy p {
  margin: 8px 0 0;
  color: #475467;
  line-height: 1.5;
}

.popup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.btn {
  min-height: 40px;
  border: 0;
  border-radius: 7px;
  padding: 0 16px;
  background: #155eef;
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

.btn.ghost {
  border: 1px solid #d0d5dd;
  background: #fff;
  color: #344054;
}

.btn.danger { background: #b42318; }
.btn.warning { background: #dc6803; }
.btn.success { background: #039855; }

.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity .16s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}
</style>

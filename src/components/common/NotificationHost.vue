<template>
  <Teleport to="body">
    <div class="notifications" aria-live="polite">
      <transition-group name="note" tag="div" class="notification-stack">
        <article v-for="note in notifications" :key="note.id" class="notification" :class="note.type">
          <div class="note-icon">
            <span v-if="note.type === 'success'">✓</span>
            <span v-else-if="note.type === 'danger'">!</span>
            <span v-else-if="note.type === 'warning'">!</span>
            <span v-else>i</span>
          </div>
          <div class="note-copy">
            <strong>{{ note.title }}</strong>
            <p v-if="note.message">{{ note.message }}</p>
          </div>
          <button class="note-close" @click="dismiss(note.id)">×</button>
        </article>
      </transition-group>
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const notifications = ref([])
let nextId = 1

function notify(event) {
  const detail = event.detail || {}
  if (isRouteCancelNotice(detail)) return
  const id = nextId++
  const note = {
    id,
    type: detail.type || 'info',
    title: detail.title || '',
    message: detail.message || '',
  }
  notifications.value = [note, ...notifications.value].slice(0, 5)
  window.setTimeout(() => dismiss(id), detail.duration || 4200)
}

function isRouteCancelNotice({ title = '', message = '' }) {
  const text = `${title} ${message}`.trim().toLowerCase()
  return text === 'canceled' ||
    text === 'cancelled' ||
    text.includes('err_canceled') ||
    text.includes('err_cancelled') ||
    text.includes('request canceled') ||
    text.includes('request cancelled') ||
    text.includes('request aborted')
}

function dismiss(id) {
  notifications.value = notifications.value.filter((note) => note.id !== id)
}

onMounted(() => window.addEventListener('restaurant-notification', notify))
onUnmounted(() => window.removeEventListener('restaurant-notification', notify))
</script>

<style scoped>
.notifications {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 3200;
  width: min(390px, calc(100vw - 36px));
  pointer-events: none;
}

.notification-stack {
  display: grid;
  gap: 10px;
}

.notification {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  gap: 12px;
  align-items: start;
  padding: 14px;
  border: 1px solid #d0d5dd;
  border-left: 4px solid #155eef;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 14px 34px rgba(15, 23, 42, .16);
  pointer-events: auto;
}

.notification.success { border-left-color: #039855; }
.notification.warning { border-left-color: #dc6803; }
.notification.danger { border-left-color: #d92d20; }

.note-icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #eff8ff;
  color: #175cd3;
  font-weight: 900;
}

.success .note-icon { background: #ecfdf3; color: #027a48; }
.warning .note-icon { background: #fffaeb; color: #b54708; }
.danger .note-icon { background: #fef3f2; color: #b42318; }

.note-copy strong {
  display: block;
  color: #101828;
  font-size: 15px;
}

.note-copy p {
  margin: 3px 0 0;
  color: #475467;
  line-height: 1.4;
  font-size: 14px;
}

.note-close {
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #667085;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
}

.note-close:hover {
  background: #f2f4f7;
}

.note-enter-active,
.note-leave-active {
  transition: all .18s ease;
}

.note-enter-from,
.note-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>

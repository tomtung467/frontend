<template>
  <MasterLayout show-footer>
    <main class="floor-plan-view">
      <section class="floor-toolbar">
        <div class="title-group">
          <span class="title-icon">SU</span>
          <h1>{{ t('tables.floorPlan') }} - Phá»¥c vá»¥</h1>
        </div>
        <time class="current-date">{{ currentDate }}</time>
      </section>

      <section class="control-row">
        <nav class="floor-tabs" aria-label="Khu vá»±c bÃ n">
          <button
            v-for="floor in floors"
            :key="floor"
            :class="{ active: floor === activeFloor }"
            type="button"
            @click="activeFloor = floor"
          >
            {{ floor }}
          </button>
        </nav>

        <div class="layout-controls">
          <select v-model="layoutMode" aria-label="Kiá»ƒu layout">
            <option value="free">Layout tá»± do</option>
            <option value="grid">Layout lÆ°á»›i</option>
            <option value="compact">Layout gá»n</option>
          </select>
          <button class="soft-button" type="button" @click="editMode = !editMode">
            {{ editMode ? 'Xong' : 'Chá»‰nh sá»­a' }}
          </button>
          <button class="primary-button" type="button" @click="startAddTable">ThÃªm bÃ n</button>
        </div>
      </section>

      <section class="floor-content">
        <div class="floor-board">
          <div class="board-head">
            <div class="legend">
              <span><i class="legend-box available"></i>{{ t('tables.available') }}</span>
              <span><i class="legend-box occupied"></i>{{ t('tables.occupied') }}</span>
              <span><i class="legend-box reserved"></i>{{ t('tables.reserved') }}</span>
            </div>
            <p v-if="editMode" class="edit-hint">KÃ©o bÃ n Ä‘á»ƒ Ä‘á»•i vá»‹ trÃ­. Chá»n nhiá»u bÃ n Ä‘á»ƒ gá»™p.</p>
          </div>

          <div
            ref="boardRef"
            class="table-map"
            :class="[layoutMode, { 'editing-grid': editMode && layoutMode === 'grid', 'dragging-grid': dragState && layoutMode === 'grid' }]"
            @pointermove="dragTable"
            @pointerup="endDrag"
            @pointerleave="endDrag"
          >
            <button
              v-for="table in visibleTables"
              :key="table.id"
              class="table-node"
              :class="[normalizedStatus(table), resolvedShape(table), { selected: selectedIds.includes(table.id), merged: mergedChildren(table.id).length, dragging: dragState?.id === table.id }]"
              :style="tableStyle(table)"
              type="button"
              @click="handleTableClick(table)"
              @pointerdown="startDrag($event, table)"
            >
              <strong>{{ t('tables.table') }} {{ table.table_number }}</strong>
              <span>{{ table.capacity }} ngÆ°á»i</span>
              <small v-if="mergedChildren(table.id).length">+{{ mergedChildren(table.id).length }} bÃ n</small>
            </button>
            <p v-if="visibleTables.length === 0" class="empty-state">KhÃ´ng cÃ³ bÃ n trong khu vá»±c nÃ y</p>
          </div>

          <div class="status-summary">
            <article class="summary-card available">
              <strong>{{ t('tables.available') }}</strong>
              <span>{{ statusCounts.available }} bÃ n</span>
            </article>
            <article class="summary-card occupied">
              <strong>Äang phá»¥c vá»¥</strong>
              <span>{{ statusCounts.occupied }} bÃ n</span>
            </article>
            <article class="summary-card reserved">
              <strong>{{ t('tables.reserved') }}</strong>
              <span>{{ statusCounts.reserved }} bÃ n</span>
            </article>
          </div>
        </div>

        <aside class="side-panel">
          <section class="service-panel">
            <header>
              <span class="service-icon">!</span>
              <strong>MÃ³n cáº§n phá»¥c vá»¥ ({{ displayServiceItems.length }})</strong>
            </header>
            <div class="service-list">
              <article v-for="item in displayServiceItems" :key="item.id">
                <strong>{{ item.label }}</strong>
                <small>{{ item.detail }}</small>
              </article>
              <p v-if="displayServiceItems.length === 0">khÃ´ng cÃ³ mÃ³n nÃ o cáº§n phá»¥c vá»¥</p>
            </div>
          </section>

          <section class="editor-panel">
            <header>
              <strong>{{ editingTable ? 'ThÃ´ng tin bÃ n' : 'Táº¡o bÃ n má»›i' }}</strong>
              <button v-if="editingTable" type="button" @click="clearSelection">Bá» chá»n</button>
            </header>

            <form class="table-form" @submit.prevent="saveTable">
              <label>
                Sá»‘ bÃ n
                <input v-model.number="form.table_number" type="number" min="1" required />
              </label>
              <label>
                Sá»‘ gháº¿
                <input v-model.number="form.capacity" type="number" min="1" required />
              </label>
              <label>
                Khu vá»±c
                <input v-model.trim="form.section" type="text" placeholder="Táº§ng 1" />
              </label>
              <label>
                Kiá»ƒu bÃ n
                <select v-model="form.shape">
                  <option value="circle">TrÃ²n</option>
                  <option value="square">VuÃ´ng</option>
                  <option value="rectangle">Chá»¯ nháº­t</option>
                </select>
              </label>
              <label>
                Tráº¡ng thÃ¡i
                <select v-model="form.status">
                  <option value="empty">Trá»‘ng</option>
                  <option value="occupied">CÃ³ khÃ¡ch</option>
                  <option value="reserved">Äáº·t trÆ°á»›c</option>
                </select>
              </label>

              <div class="form-actions">
                <button class="primary-button" type="submit">{{ editingTable ? 'LÆ°u' : 'ThÃªm bÃ n' }}</button>
                <button v-if="editingTable" class="danger-button" type="button" @click="removeTable">XÃ³a</button>
              </div>
            </form>

            <div class="merge-actions">
              <button class="soft-button" type="button" :disabled="selectedIds.length < 2" @click="mergeSelectedTables">
                Gá»™p bÃ n
              </button>
              <button class="soft-button" type="button" :disabled="!canUnmerge" @click="unmergeSelectedTable">
                TÃ¡ch bÃ n
              </button>
            </div>
          </section>
        </aside>
      </section>
    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useTableStore } from '@/stores/useTableStore'
import MasterLayout from '@/components/MasterLayout.vue'
import { t, currentLanguage } from '@/languages'

const tableStore = useTableStore()
const tables = computed(() => tableStore.tables)
const activeFloor = ref('')
const editMode = ref(false)
const layoutMode = ref('free')
const selectedIds = ref([])
const boardRef = ref(null)
const now = ref(new Date())
const dragState = ref(null)
const suppressNextClick = ref(false)
const form = reactive(blankForm())
let unsubscribeTables
let clock
const gridCell = { width: 56, height: 40, span: 3, padding: 18 }

const currentDate = computed(() =>
  new Intl.DateTimeFormat(locale(), {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(now.value)
)

const floors = computed(() => {
  const names = tables.value.map((table) => table.section || 'Táº§ng 1')
  return [...new Set(names)].sort((a, b) => String(a).localeCompare(String(b), 'vi', { numeric: true }))
})

const floorTables = computed(() =>
  tables.value
    .filter((table) => (table.section || 'Táº§ng 1') === activeFloor.value)
    .sort((a, b) => Number(a.table_number || a.id || 0) - Number(b.table_number || b.id || 0))
)

const visibleTables = computed(() =>
  floorTables.value
    .filter((table) => !table.merged_into_table_id)
    .map((table, index) => withDefaultPosition(table, index))
)

const editingTable = computed(() => tables.value.find((table) => table.id === selectedIds.value[0]) || null)
const canUnmerge = computed(() => selectedIds.value.length === 1 && mergedChildren(selectedIds.value[0]).length > 0)

const statusCounts = computed(() => (
  visibleTables.value.reduce((counts, table) => {
    const status = normalizedStatus(table)
    if (status === 'available') counts.available += 1
    if (status === 'occupied') counts.occupied += 1
    if (status === 'reserved') counts.reserved += 1
    return counts
  }, { available: 0, occupied: 0, reserved: 0 })
))

const serviceItems = computed(() =>
  visibleTables.value
    .filter((table) => table.payment_requested_at || Number(table.ready_items_count || 0) > 0)
    .map((table) => ({
      id: table.id,
      label: `${t('tables.table')} ${table.table_number}`,
      detail: table.payment_requested_at ? 'KhÃ¡ch gá»i thanh toÃ¡n' : `${table.ready_items_count} mÃ³n Ä‘Ã£ xong`,
    }))
)

const displayServiceItems = computed(() =>
  visibleTables.value.flatMap((table) => tableServiceItems(table))
)

onMounted(async () => {
  await tableStore.fetchTables()
  activeFloor.value = floors.value[0] || 'Táº§ng 1'
  unsubscribeTables = tableStore.subscribeToTables()
  clock = window.setInterval(() => {
    now.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  unsubscribeTables?.()
  window.clearInterval(clock)
})

watch(floors, (nextFloors) => {
  if (!nextFloors.includes(activeFloor.value)) {
    activeFloor.value = nextFloors[0] || 'Táº§ng 1'
  }
})

watch(editingTable, (table) => {
  Object.assign(form, table ? tableToForm(table) : blankForm(activeFloor.value))
}, { immediate: true })

function blankForm(section = activeFloor.value || 'Táº§ng 1') {
  const nextNumber = Math.max(0, ...tables.value.map((table) => Number(table.table_number || 0))) + 1
  return {
    table_number: nextNumber || 1,
    capacity: 4,
    section,
    shape: 'rectangle',
    status: 'empty',
  }
}

function tableToForm(table) {
  return {
    table_number: Number(table.table_number || 1),
    capacity: Number(table.capacity || 4),
    section: table.section || activeFloor.value || 'Táº§ng 1',
    shape: resolvedShape(table),
    status: table.status || 'empty',
  }
}

function tableServiceItems(table) {
  const readyItems = (table.orders || [])
    .flatMap((order) => order.order_items || order.orderItems || [])
    .filter((item) => item.status === 'ready')
    .map((item) => ({
      id: `${table.id}-${item.id}`,
      label: `${item.food?.name || item.food_name || `Mon #${item.food_id || item.id}`} x ${item.quantity || 1}`,
      detail: `${t('tables.table')} ${table.table_number}`,
    }))

  if (readyItems.length) return readyItems
  if (!table.payment_requested_at) return []

  return [{
    id: `pay-${table.id}`,
    label: `${t('tables.table')} ${table.table_number}`,
    detail: 'Khach goi thanh toan',
  }]
}

function startAddTable() {
  selectedIds.value = []
  Object.assign(form, blankForm(activeFloor.value))
  editMode.value = true
}

async function saveTable() {
  const payload = {
    table_number: form.table_number,
    capacity: form.capacity,
    section: form.section || activeFloor.value || 'Táº§ng 1',
    shape: form.shape,
    status: form.status,
  }

  if (editingTable.value) {
    await tableStore.updateTable(editingTable.value.id, payload)
  } else {
    await tableStore.createTable({
      ...payload,
      layout_x: 80,
      layout_y: 80,
    })
  }
  await tableStore.fetchTables()
}

async function removeTable() {
  if (!editingTable.value) return
  await tableStore.deleteTable(editingTable.value.id)
  clearSelection()
}

async function mergeSelectedTables() {
  const [primaryId, ...restIds] = selectedIds.value
  if (!primaryId || restIds.length === 0) return
  await tableStore.mergeTables(primaryId, restIds)
  selectedIds.value = [primaryId]
}

async function unmergeSelectedTable() {
  if (!canUnmerge.value) return
  await tableStore.unmergeTables(selectedIds.value[0])
}

function clearSelection() {
  selectedIds.value = []
  Object.assign(form, blankForm(activeFloor.value))
}

function handleTableClick(table) {
  if (suppressNextClick.value) {
    suppressNextClick.value = false
    return
  }

  if (!editMode.value) {
    selectedIds.value = [table.id]
    Object.assign(form, tableToForm(table))
    return
  }

  if (selectedIds.value.includes(table.id)) {
    selectedIds.value = selectedIds.value.filter((id) => id !== table.id)
  } else {
    selectedIds.value = [...selectedIds.value, table.id]
  }
}

function startDrag(event, table) {
  if (!editMode.value || !['free', 'grid'].includes(layoutMode.value)) return
  const board = boardRef.value?.getBoundingClientRect()
  if (!board) return
  event.preventDefault()
  dragState.value = {
    id: table.id,
    moved: false,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: event.clientX - board.left - Number(table.layout_x || 0),
    offsetY: event.clientY - board.top - Number(table.layout_y || 0),
  }
  event.currentTarget.setPointerCapture?.(event.pointerId)
}

function dragTable(event) {
  if (!dragState.value || !boardRef.value) return
  const board = boardRef.value.getBoundingClientRect()
  const table = tables.value.find((item) => item.id === dragState.value.id)
  if (!table) return
  const hasMoved = Math.abs(event.clientX - dragState.value.startX) > 4 || Math.abs(event.clientY - dragState.value.startY) > 4
  dragState.value.moved = dragState.value.moved || hasMoved

  const next = normalizePosition(
    Math.round(event.clientX - board.left - dragState.value.offsetX),
    Math.round(event.clientY - board.top - dragState.value.offsetY),
    board,
  )
  table.layout_x = next.x
  table.layout_y = next.y
}

async function endDrag() {
  if (!dragState.value) return
  suppressNextClick.value = dragState.value.moved
  const table = tables.value.find((item) => item.id === dragState.value.id)
  dragState.value = null
  if (!table) return
  await tableStore.updateTable(table.id, {
    layout_x: table.layout_x,
    layout_y: table.layout_y,
    shape: resolvedShape(table),
  })
}

function withDefaultPosition(table, index) {
  if (table.layout_x !== null && table.layout_x !== undefined && table.layout_y !== null && table.layout_y !== undefined) {
    return table
  }
  return {
    ...table,
    layout_x: gridCell.padding + (index % 5) * gridCell.width * gridCell.span,
    layout_y: gridCell.padding + Math.floor(index / 5) * gridCell.height * gridCell.span,
  }
}

function tableStyle(table) {
  if (!['free', 'grid'].includes(layoutMode.value)) return null
  return {
    left: `${Number(table.layout_x || 0)}px`,
    top: `${Number(table.layout_y || 0)}px`,
  }
}

function normalizePosition(x, y, board) {
  const maxX = Math.max(8, board.width - 180)
  const maxY = Math.max(8, board.height - 130)

  if (layoutMode.value !== 'grid') {
    return {
      x: clamp(x, 8, maxX),
      y: clamp(y, 8, maxY),
    }
  }

  const tableGridWidth = gridCell.width * gridCell.span
  const tableGridHeight = gridCell.height * gridCell.span
  const snappedX = gridCell.padding + Math.round((x - gridCell.padding) / tableGridWidth) * tableGridWidth
  const snappedY = gridCell.padding + Math.round((y - gridCell.padding) / tableGridHeight) * tableGridHeight

  return {
    x: clamp(snappedX, gridCell.padding, maxX),
    y: clamp(snappedY, gridCell.padding, maxY),
  }
}

function mergedChildren(tableId) {
  return tables.value.filter((table) => Number(table.merged_into_table_id) === Number(tableId))
}

function normalizedStatus(table) {
  return table.status === 'empty' ? 'available' : table.status
}

function resolvedShape(table) {
  if (['circle', 'square', 'rectangle'].includes(table.shape)) return table.shape
  return Number(table.capacity || 0) <= 2 ? 'circle' : 'rectangle'
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function locale() {
  return currentLanguage.value === 'en' ? 'en-US' : 'vi-VN'
}
</script>

<style scoped>
.floor-plan-view { min-height: calc(100vh - 80px); padding: 8px 28px 28px; background: #f6f6f6; }
.floor-toolbar { display: grid; grid-template-columns: minmax(360px, 1fr) 260px; gap: 8px; align-items: center; margin-bottom: 12px; }
.title-group { display: flex; align-items: center; gap: 12px; min-height: 50px; }
.title-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 8px; color: #fff; background: #a142f4; font-size: 13px; font-weight: 900; }
h1 { margin: 0; color: #111827; font-size: 20px; font-weight: 900; }
.current-date { justify-self: end; color: #344054; font-weight: 800; text-transform: capitalize; }
.control-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
.floor-tabs, .layout-controls, .form-actions, .merge-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
button, select, input { min-height: 38px; border: 1px solid #d0d5dd; border-radius: 6px; background: #fff; color: #111827; font: inherit; }
button, select { padding: 0 12px; cursor: pointer; font-weight: 800; }
input, select { width: 100%; padding: 0 10px; }
button:disabled { opacity: .5; cursor: not-allowed; }
.floor-tabs button { min-width: 100px; background: #e5e7eb; color: #374151; font-size: 18px; }
.floor-tabs button.active, .primary-button { color: #fff; background: #a142f4; border-color: #a142f4; }
.soft-button { background: #f2f4f7; color: #344054; }
.danger-button { background: #b42318; border-color: #b42318; color: #fff; }
.floor-content { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 28px; align-items: start; margin-top: 28px; }
.floor-board, .service-panel, .editor-panel { background: #fff; border: 1px solid #e5e7eb; box-shadow: 0 3px 10px rgba(16, 24, 40, .14); }
.floor-board { min-height: 740px; border-radius: 8px; padding: 34px 34px 24px; }
.board-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.legend { display: flex; align-items: center; justify-content: flex-end; gap: 18px; color: #374151; font-size: 13px; margin-left: auto; }
.legend span { display: inline-flex; align-items: center; gap: 6px; }
.legend-box { width: 14px; height: 14px; border-radius: 3px; background: #fff; border: 2px solid currentColor; }
.legend-box.available { color: #00c853; }
.legend-box.occupied { color: #ff3d4f; }
.legend-box.reserved { color: #ffb300; }
.edit-hint { margin: 0; color: #667085; font-size: 13px; }
.table-map { position: relative; min-height: 520px; border-radius: 8px; background: #fff; overflow: hidden; }
.table-map.grid { position: relative; min-height: 520px; }
.table-map.dragging-grid::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(161, 66, 244, .45) 1px, transparent 1px),
    linear-gradient(90deg, rgba(161, 66, 244, .45) 1px, transparent 1px);
  background-size: 56px 40px;
  background-position: 18px 18px;
  opacity: 1;
}
.table-map.grid.editing-grid::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(161, 66, 244, .14) 1px, transparent 1px),
    linear-gradient(90deg, rgba(161, 66, 244, .14) 1px, transparent 1px);
  background-size: 56px 40px;
  background-position: 18px 18px;
}
.table-map.compact { display: grid; position: static; align-items: center; justify-items: center; }
.table-map.compact { grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 18px; min-height: 380px; }
.table-node { position: absolute; z-index: 1; display: grid; place-items: center; align-content: center; gap: 4px; width: 168px; height: 120px; border: 3px solid #00c853; border-radius: 14px; background: #d8f8e2; color: #111827; cursor: pointer; transition: transform .1s ease, box-shadow .1s ease; touch-action: none; will-change: left, top; }
.table-map.grid .table-node { transition: left .2s ease, top .2s ease, transform .1s ease, box-shadow .1s ease; }
.table-map.grid .table-node.dragging { transition: left .12s ease-out, top .12s ease-out, transform .1s ease, box-shadow .1s ease; }
.table-map.compact .table-node { position: static; }
.table-node.circle { width: 120px; height: 120px; border-radius: 50%; }
.table-node.square { width: 120px; height: 120px; border-radius: 14px; }
.table-node.rectangle { width: 168px; height: 120px; border-radius: 14px; }
.table-node strong { font-size: 14px; line-height: 1.1; }
.table-node span, .table-node small { font-size: 12px; color: #111827; }
.table-node.available:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(0, 200, 83, .18); }
.table-node.occupied { border-color: #ff3d4f; background: #ffe0e0; }
.table-node.reserved { border-color: #ffb300; background: #fff7bf; }
.table-node.maintenance { border-color: #98a2b3; background: #f2f4f7; }
.table-node.selected { box-shadow: 0 0 0 4px rgba(161, 66, 244, .22); }
.table-node.merged::after { content: ""; position: absolute; inset: -10px; border: 2px dashed #a142f4; border-radius: inherit; pointer-events: none; }
.status-summary { display: grid; grid-template-columns: repeat(3, minmax(170px, 1fr)); gap: 20px; margin-top: 28px; }
.summary-card { display: grid; gap: 20px; min-height: 112px; padding: 22px 28px; border-radius: 8px; border: 1px solid; }
.summary-card strong { font-size: 17px; }
.summary-card span { font-size: 13px; }
.summary-card.available { border-color: #bbf7d0; background: #dcfce7; color: #00a152; }
.summary-card.occupied { border-color: #fecaca; background: #fee2e2; color: #ff3d4f; }
.summary-card.reserved { border-color: #fde68a; background: #fef9c3; color: #f59e0b; }
.side-panel { display: grid; gap: 18px; }
.service-panel { min-height: 300px; }
.service-panel header, .editor-panel header { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 64px; padding: 0 18px; }
.service-panel header { justify-content: flex-start; background: #dcfce7; border-bottom: 1px solid #bbf7d0; color: #15803d; font-size: 18px; }
.service-icon { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; border: 2px solid currentColor; font-size: 11px; }
.service-list { display: grid; gap: 12px; padding: 22px 18px; }
.service-list article { display: grid; gap: 4px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: #f8fafc; }
.service-list small, .service-list p, .empty-state { color: #98a2b3; }
.service-list p, .empty-state { margin: 0; text-align: center; }
.empty-state { position: absolute; inset: 0; display: grid; place-items: center; }
.editor-panel { border-radius: 8px; padding-bottom: 16px; }
.editor-panel header { border-bottom: 1px solid #eaecf0; }
.editor-panel header button { width: auto; min-height: 32px; background: #f2f4f7; }
.table-form { display: grid; gap: 12px; padding: 16px 18px; }
.table-form label { display: grid; gap: 6px; color: #344054; font-weight: 800; font-size: 13px; }
.merge-actions { padding: 0 18px; }
@media (max-width: 1240px) {
  .floor-content { grid-template-columns: 1fr; }
  .side-panel { grid-template-columns: repeat(2, minmax(260px, 1fr)); }
}
@media (max-width: 820px) {
  .floor-plan-view { padding: 14px; }
  .floor-toolbar { grid-template-columns: 1fr; }
  .current-date { justify-self: start; }
  .control-row, .board-head { align-items: stretch; flex-direction: column; }
  .floor-board { padding: 18px; }
  .status-summary, .side-panel { grid-template-columns: 1fr; }
}
</style>


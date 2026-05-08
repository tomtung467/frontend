<template>
  <MasterLayout show-footer>
    <main class="floor-plan-view">
      <section class="floor-toolbar">
        <div class="title-group">
          <span class="title-icon">SU</span>
          <h1>{{ t('tables.floorPlan') }} - Phục vụ</h1>
        </div>
        <time class="current-date">{{ currentDate }}</time>
      </section>

      <section class="control-row">
        <nav class="floor-tabs" aria-label="Khu vực bàn">
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
          <select v-model="layoutMode" aria-label="Kiểu layout">
            <option value="free">Layout tự do</option>
            <option value="grid">Layout lưới</option>
            <option value="compact">Layout gọn</option>
          </select>
          <button class="soft-button" type="button" @click="editMode = !editMode">
            {{ editMode ? 'Xong' : 'Chỉnh sửa' }}
          </button>
          <button class="primary-button" type="button" @click="startAddTable">Thêm bàn</button>
        </div>
      </section>

      <section class="floor-content">
        <div class="floor-board">
          <div class="board-head">
            <div
              class="grid-settings"
              :class="{ 'is-hidden': layoutMode !== 'grid' }"
              :aria-hidden="layoutMode !== 'grid'"
              aria-label="Thiết lập lưới"
            >
              <label>
                Rộng
                <input v-model.number="gridCell.columns" type="number" min="6" max="32" step="1" />
              </label>
              <label>
                Dài
                <input v-model.number="gridCell.rows" type="number" min="5" max="24" step="1" />
              </label>
            </div>
            <div class="legend">
              <span><i class="legend-box available"></i>{{ t('tables.available') }}</span>
              <span><i class="legend-box occupied"></i>{{ t('tables.occupied') }}</span>
              <span><i class="legend-box reserved"></i>{{ t('tables.reserved') }}</span>
            </div>
            <p class="edit-hint" :class="{ 'is-hidden': !editMode }">Kéo bàn để đổi vị trí. Chọn nhiều bàn để ghép.</p>
          </div>

          <div
            ref="boardRef"
            class="table-map"
            :class="[layoutMode, { 'editing-grid': editMode && layoutMode === 'grid', 'dragging-grid': dragState && layoutMode === 'grid' }]"
            :style="tableMapStyle"
            @pointermove="dragTable"
            @pointerup="endDrag"
            @pointerleave="endDrag"
            @pointercancel="endDrag"
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
              <span>{{ table.capacity }} người</span>
              <small v-if="mergedChildren(table.id).length">+{{ mergedChildren(table.id).length }} bàn</small>
            </button>
            <p v-if="visibleTables.length === 0" class="empty-state">Không có bàn trong khu vực này</p>
          </div>

          <div class="status-summary">
            <article class="summary-card available">
              <strong>{{ t('tables.available') }}</strong>
              <span>{{ statusCounts.available }} bàn</span>
            </article>
            <article class="summary-card occupied">
              <strong>Đang phục vụ</strong>
              <span>{{ statusCounts.occupied }} bàn</span>
            </article>
            <article class="summary-card reserved">
              <strong>{{ t('tables.reserved') }}</strong>
              <span>{{ statusCounts.reserved }} bàn</span>
            </article>
          </div>
        </div>

        <aside class="side-panel">
          <section class="service-panel">
            <header>
              <span class="service-icon">!</span>
              <strong>Món cần phục vụ ({{ readyServiceCount }})</strong>
            </header>
            <div class="service-list">
              <article v-for="group in paginatedServiceGroups" :key="group.id" class="service-table">
                <div class="service-table-head">
                  <div class="service-table-title">
                    <button
                      class="service-toggle"
                      type="button"
                      :aria-label="serviceGroupOpen(group.id) ? 'Ẩn danh sách món' : 'Hiển thị danh sách món'"
                      :aria-expanded="serviceGroupOpen(group.id)"
                      @click="toggleServiceGroup(group.id)"
                    >
                      {{ serviceGroupOpen(group.id) ? '⌄' : '›' }}
                    </button>
                    <span class="service-table-label">
                      <strong>{{ group.label }}</strong>
                      <small v-if="showServiceGroupSection(group)">Khu vực: {{ group.section }}</small>
                    </span>
                  </div>
                  <button type="button" :disabled="servingIds.includes(group.id)" @click="markTableServed(group)">
                    Đã phục vụ
                  </button>
                </div>
                <div v-if="serviceGroupOpen(group.id)" class="service-items">
                  <div class="service-item" v-for="item in group.items" :key="item.id">
                    <span>{{ item.label }}</span>
                    <button type="button" :disabled="servingIds.includes(item.id)" @click="markItemServed(item)">
                      Đã phục vụ
                    </button>
                  </div>
                </div>
              </article>
              <p v-if="readyServiceCount === 0">không có món nào cần phục vụ</p>
              <div v-if="readyServiceCount > SERVICE_PAGE_SIZE" class="service-pagination" aria-label="Phân trang món cần phục vụ">
                <button
                  type="button"
                  aria-label="Trang trước"
                  :disabled="servicePage <= 1"
                  @click="goServicePage(-1)"
                >
                  ‹
                </button>
                <span>{{ servicePageStart }}-{{ servicePageEnd }} / {{ readyServiceCount }}</span>
                <button
                  type="button"
                  aria-label="Trang sau"
                  :disabled="servicePage >= servicePageCount"
                  @click="goServicePage(1)"
                >
                  ›
                </button>
              </div>
            </div>
          </section>

          <section class="editor-panel">
            <header>
              <strong>{{ editingTable ? 'Thông tin bàn' : 'Tạo bàn mới' }}</strong>
              <button v-if="editingTable" type="button" @click="clearSelection">Bỏ chọn</button>
            </header>

            <form class="table-form" @submit.prevent="saveTable">
              <label>
                Số bàn
                <input v-model.number="form.table_number" type="number" min="1" required />
              </label>
              <label>
                Số ghế
                <input v-model.number="form.capacity" type="number" min="1" required />
              </label>
              <label>
                Khu vực
                <input v-model.trim="form.section" type="text" placeholder="Tầng 1" />
              </label>
              <label>
                Kiểu bàn
                <select v-model="form.shape">
                  <option value="circle">Tròn</option>
                  <option value="square">Vuông</option>
                  <option value="rectangle">Chữ nhật</option>
                </select>
              </label>
              <label>
                Trạng thái
                <select v-model="form.status">
                  <option value="empty">Trống</option>
                  <option value="occupied">Có khách</option>
                  <option value="reserved">Đặt trước</option>
                </select>
              </label>

              <div class="form-actions">
                <button class="primary-button" type="submit">{{ editingTable ? 'Lưu' : 'Thêm bàn' }}</button>
                <button v-if="editingTable" class="danger-button" type="button" @click="removeTable">Xóa</button>
              </div>
            </form>

            <div class="merge-actions">
              <button class="soft-button" type="button" :disabled="selectedIds.length < 2" @click="mergeSelectedTables">
                Gộp bàn
              </button>
              <button class="soft-button" type="button" :disabled="!canUnmerge" @click="unmergeSelectedTable">
                Tách bàn
              </button>
            </div>
          </section>
        </aside>
      </section>
    </main>
  </MasterLayout>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useTableStore } from '@/stores/useTableStore'
import { useKitchenStore } from '@/stores/useKitchenStore'
import { orderAPI } from '@/api/order'
import MasterLayout from '@/components/MasterLayout.vue'
import { t, currentLanguage } from '@/languages'

const tableStore = useTableStore()
const kitchenStore = useKitchenStore()
const tables = computed(() => tableStore.tables)
const activeFloor = ref('')
const editMode = ref(false)
const layoutMode = ref('free')
const selectedIds = ref([])
const boardRef = ref(null)
const now = ref(new Date())
const dragState = ref(null)
const suppressNextClick = ref(false)
const servingIds = ref([])
const hiddenServedIds = ref([])
const collapsedServiceGroupIds = ref([])
const servicePage = ref(1)
const SERVICE_PAGE_SIZE = 6
const GRID_SETTINGS_KEY = 'floor-plan-grid-settings-by-floor'
const pendingLayouts = reactive({})
const DEFAULT_SECTION = 'Tầng 1'
const form = reactive(blankForm())
let unsubscribeTables
let unsubscribeKitchenQueue
let clock
let boardResizeObserver
let gridPersistTimer
let kitchenFallbackFetched = false
const gridCell = reactive({ columns: 12, rows: 10, span: 3, padding: 18 })
const boardSize = reactive({ width: 0, height: 0 })
const gridColumns = computed(() => clamp(Number(gridCell.columns) || 12, 6, 32))
const gridRows = computed(() => clamp(Number(gridCell.rows) || 10, 5, 24))
const gridWidth = computed(() => {
  if (!boardSize.width) return 56
  return Math.max(1, boardSize.width - gridCell.padding * 2) / gridColumns.value
})
const gridHeight = computed(() => gridWidth.value)
const gridMapHeight = computed(() => gridHeight.value * gridRows.value + gridCell.padding * 2)
const mapHeight = computed(() => gridMapHeight.value)
const tableMapStyle = computed(() => {
  if (!['free', 'grid'].includes(layoutMode.value)) return null
  return {
    '--grid-width': `${gridWidth.value}px`,
    '--grid-height': `${gridHeight.value}px`,
    '--grid-padding': `${gridCell.padding}px`,
    '--grid-area-width': `${gridWidth.value * gridColumns.value}px`,
    '--grid-area-height': `${gridHeight.value * gridRows.value}px`,
    height: `${mapHeight.value}px`,
  }
})

const currentDate = computed(() =>
  new Intl.DateTimeFormat(locale(), {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(now.value)
)

const floors = computed(() => {
  const names = tables.value.map((table) => table.section || DEFAULT_SECTION)
  return [...new Set(names)].sort((a, b) => String(a).localeCompare(String(b), 'vi', { numeric: true }))
})

const floorTables = computed(() =>
  tables.value
    .filter((table) => (table.section || DEFAULT_SECTION) === activeFloor.value)
    .sort((a, b) => Number(a.table_number || a.id || 0) - Number(b.table_number || b.id || 0))
)

const visibleTables = computed(() =>
  floorTables.value
    .filter((table) => !table.merged_into_table_id)
    .map((table, index) => withDefaultPosition(table, index))
)

const gridPlacements = computed(() => {
  if (!boardSize.width) return new Map()

  const occupied = new Set()
  const placements = new Map()
  const orderedTables = [...visibleTables.value].sort((a, b) => {
    const aOrigin = tableGridOrigin(a)
    const bOrigin = tableGridOrigin(b)
    return aOrigin.row - bOrigin.row
      || aOrigin.column - bOrigin.column
      || Number(a.table_number || a.id || 0) - Number(b.table_number || b.id || 0)
  })

  orderedTables.forEach((table) => {
    const span = tableGridSpan(table)
    const origin = tableGridOrigin(table)
    const placement = findOpenGridPosition(origin, span, occupied) || origin
    markGridCells(placement, span, occupied)
    placements.set(table.id, gridPositionToPixels(placement))
  })

  return placements
})

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

const tableServiceGroups = computed(() =>
  tables.value
    .map((table) => ({
      id: `table-${table.id}`,
      tableId: table.id,
      label: `${t('tables.table')} ${table.table_number}`,
      section: table.section || DEFAULT_SECTION,
      tableNumber: Number(table.table_number || table.id || 0),
      items: tableServiceItems(table),
    }))
    .filter((group) => group.items.length > 0)
)

const kitchenServiceGroups = computed(() => {
  const groups = new Map()

  kitchenStore.queue
    .filter((order) => order.status === 'ready')
    .forEach((order) => {
      const tableId = order.table_id
      const table = tables.value.find((entry) => Number(entry.id) === Number(tableId))
      const groupId = `table-${tableId || 'unknown'}`
      const items = orderItems(order)
        .map((item) => serviceItemFromOrderItem(order, item))
        .filter((item) => item.itemId && !hiddenServedIds.value.includes(item.id))

      if (items.length === 0) return

      if (!groups.has(groupId)) {
        groups.set(groupId, {
          id: groupId,
          tableId,
          label: `${t('tables.table')} ${table?.table_number || tableId || '?'}`,
          section: table?.section || DEFAULT_SECTION,
          tableNumber: Number(table?.table_number || tableId || 0),
          items: [],
        })
      }

      groups.get(groupId).items.push(...items)
    })

  return [...groups.values()]
})

const allServiceGroups = computed(() => {
  const groups = new Map()

  ;[...kitchenServiceGroups.value, ...tableServiceGroups.value].forEach((group) => {
    if (!groups.has(group.id)) {
      groups.set(group.id, { ...group, items: [] })
    }

    const current = groups.get(group.id)
    const currentItemIds = new Set(current.items.map((item) => item.id))
    group.items.forEach((item) => {
      if (!currentItemIds.has(item.id)) {
        current.items.push(item)
        currentItemIds.add(item.id)
      }
    })
  })

  return [...groups.values()]
    .filter((group) => group.items.length > 0)
    .sort(sortServiceGroups)
})

const readyServiceCount = computed(() =>
  allServiceGroups.value.reduce((total, group) => total + group.items.length, 0)
)

const flatServiceItems = computed(() =>
  allServiceGroups.value.flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      groupId: group.id,
      tableId: group.tableId,
      tableLabel: group.label,
      section: group.section,
      tableNumber: group.tableNumber,
    }))
  )
)

const servicePageCount = computed(() =>
  Math.max(1, Math.ceil(readyServiceCount.value / SERVICE_PAGE_SIZE))
)

const servicePageStart = computed(() =>
  readyServiceCount.value === 0 ? 0 : (servicePage.value - 1) * SERVICE_PAGE_SIZE + 1
)

const servicePageEnd = computed(() =>
  Math.min(servicePage.value * SERVICE_PAGE_SIZE, readyServiceCount.value)
)

const paginatedServiceGroups = computed(() => {
  const start = (servicePage.value - 1) * SERVICE_PAGE_SIZE
  const pageItems = flatServiceItems.value.slice(start, start + SERVICE_PAGE_SIZE)
  const groups = new Map()

  pageItems.forEach((item) => {
    if (!groups.has(item.groupId)) {
      groups.set(item.groupId, {
        id: item.groupId,
        tableId: item.tableId,
        label: item.tableLabel,
        section: item.section,
        tableNumber: item.tableNumber,
        items: [],
      })
    }
    groups.get(item.groupId).items.push(item)
  })

  return [...groups.values()]
})

onMounted(async () => {
  await Promise.all([
    tableStore.fetchTables(),
    kitchenStore.fetchQueue(),
  ])
  activeFloor.value = floors.value[0] || DEFAULT_SECTION
  applyGridSettingsForFloor(activeFloor.value)
  updateBoardSize()
  boardResizeObserver = new ResizeObserver(updateBoardSize)
  if (boardRef.value) boardResizeObserver.observe(boardRef.value)
  unsubscribeTables = tableStore.subscribeToTables()
  unsubscribeKitchenQueue = kitchenStore.subscribeToQueue({
    onUnavailable: refreshKitchenOnceAfterStreamIssue,
  })
  clock = window.setInterval(() => {
    now.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  unsubscribeTables?.()
  unsubscribeKitchenQueue?.()
  boardResizeObserver?.disconnect()
  window.clearInterval(clock)
  window.clearTimeout(gridPersistTimer)
})

watch(floors, (nextFloors) => {
  if (!nextFloors.includes(activeFloor.value)) {
    activeFloor.value = nextFloors[0] || DEFAULT_SECTION
  }
})

watch(activeFloor, (floor, previousFloor) => {
  if (previousFloor) persistGridSettings(previousFloor)
  applyGridSettingsForFloor(floor)
  selectedIds.value = []
})

watch(editingTable, (table) => {
  Object.assign(form, table ? tableToForm(table) : blankForm(activeFloor.value))
}, { immediate: true })

watch(() => [gridColumns.value, gridRows.value], () => {
  persistGridSettings()
  if (layoutMode.value === 'grid') {
    schedulePersistGridPositions()
  }
})

watch(layoutMode, async (mode, previousMode) => {
  await nextTick()
  updateBoardSize()
  if (mode === 'grid') {
    await persistGridPositions()
  }
  if (previousMode === 'grid' && mode === 'free') {
    applyGridPositionsToLayout()
  }
}, { flush: 'pre' })

watch(servicePageCount, (pageCount) => {
  if (servicePage.value > pageCount) servicePage.value = pageCount
  if (servicePage.value < 1) servicePage.value = 1
})

function blankForm(section = activeFloor.value || DEFAULT_SECTION) {
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
    section: table.section || activeFloor.value || DEFAULT_SECTION,
    shape: resolvedShape(table),
    status: table.status || 'empty',
  }
}

function tableServiceItems(table) {
  const readyItems = (table.orders || [])
    .flatMap((order) => readyOrderItems(order).map((item) => serviceItemFromOrderItem(order, item)))
    .filter((item) => !hiddenServedIds.value.includes(item.id))

  return readyItems
}

function orderItems(order) {
  return order.order_items || order.orderItems || order.items || []
}

function readyOrderItems(order) {
  const items = orderItems(order)
  if (order.status === 'ready') return items
  return items.filter((item) => item.status === 'ready')
}

function serviceItemFromOrderItem(order, item) {
  const orderId = item.order_id || order.id

  return {
    id: `${orderId}-${item.id}`,
    orderId,
    itemId: item.id,
    label: `${item.food?.name || item.food_name || item.name || `Mon #${item.food_id || item.id}`} x ${item.quantity || 1}`,
  }
}

async function markItemServed(item) {
  if (!item?.orderId || !item?.itemId || servingIds.value.includes(item.id)) return
  servingIds.value = [...servingIds.value, item.id]
  try {
    await orderAPI.updateOrderItemStatus(item.orderId, item.itemId, 'served')
    hideServedItems([item.id])
    await refreshServiceSources()
  } finally {
    servingIds.value = servingIds.value.filter((id) => id !== item.id)
  }
}

async function markTableServed(group) {
  if (!group?.items?.length || servingIds.value.includes(group.id)) return
  servingIds.value = [...servingIds.value, group.id, ...group.items.map((item) => item.id)]
  try {
    await Promise.all(group.items.map((item) =>
      orderAPI.updateOrderItemStatus(item.orderId, item.itemId, 'served')
    ))
    hideServedItems(group.items.map((item) => item.id))
    await refreshServiceSources()
  } finally {
    const doneIds = new Set([group.id, ...group.items.map((item) => item.id)])
    servingIds.value = servingIds.value.filter((id) => !doneIds.has(id))
  }
}

async function refreshServiceSources() {
  await Promise.all([
    tableStore.fetchTables(),
    kitchenStore.fetchQueue(),
  ])
}

async function refreshKitchenOnceAfterStreamIssue() {
  if (kitchenFallbackFetched) return
  kitchenFallbackFetched = true
  await kitchenStore.fetchQueue()
}

function hideServedItems(ids) {
  hiddenServedIds.value = [...new Set([...hiddenServedIds.value, ...ids])]
}

function goServicePage(direction) {
  servicePage.value = clamp(servicePage.value + direction, 1, servicePageCount.value)
}

function serviceGroupOpen(groupId) {
  return !collapsedServiceGroupIds.value.includes(groupId)
}

function toggleServiceGroup(groupId) {
  if (serviceGroupOpen(groupId)) {
    collapsedServiceGroupIds.value = [...collapsedServiceGroupIds.value, groupId]
    return
  }

  collapsedServiceGroupIds.value = collapsedServiceGroupIds.value.filter((id) => id !== groupId)
}

function showServiceGroupSection(group) {
  return group?.section && group.section !== activeFloor.value
}

function sortServiceGroups(left, right) {
  const leftInActiveFloor = left.section === activeFloor.value ? 0 : 1
  const rightInActiveFloor = right.section === activeFloor.value ? 0 : 1

  return leftInActiveFloor - rightInActiveFloor
    || String(left.section || '').localeCompare(String(right.section || ''), 'vi', { numeric: true })
    || Number(left.tableNumber || 0) - Number(right.tableNumber || 0)
    || String(left.label || '').localeCompare(String(right.label || ''), 'vi', { numeric: true })
}

function updateBoardSize() {
  const board = boardRef.value?.getBoundingClientRect()
  if (!board) return
  boardSize.width = board.width
  boardSize.height = board.height
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
    section: form.section || activeFloor.value || DEFAULT_SECTION,
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
  const position = tablePosition(table)
  event.preventDefault()
  dragState.value = {
    id: table.id,
    moved: false,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: event.clientX - board.left - position.x,
    offsetY: event.clientY - board.top - position.y,
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
    mapBounds(),
    table,
  )
  table.layout_x = next.x
  table.layout_y = next.y
  pendingLayouts[table.id] = next
}

async function endDrag() {
  if (!dragState.value) return
  suppressNextClick.value = dragState.value.moved
  const table = tables.value.find((item) => item.id === dragState.value.id)
  const currentLayoutMode = layoutMode.value
  dragState.value = null
  if (!table) return
  const pending = pendingLayouts[table.id]
  const position = normalizePosition(
    pending?.x ?? table.layout_x,
    pending?.y ?? table.layout_y,
    mapBounds(),
    table,
    currentLayoutMode,
  )
  table.layout_x = position.x
  table.layout_y = position.y
  pendingLayouts[table.id] = position
  try {
    await tableStore.updateTable(table.id, {
      layout_x: Math.round(position.x),
      layout_y: Math.round(position.y),
      shape: resolvedShape(table),
    })
    if (currentLayoutMode === 'grid') {
      await nextTick()
      await persistGridPositions()
    }
  } catch (error) {
    console.warn('Không thể lưu vị trí bàn, giữ vị trí mới tạm thời trên màn hình:', error)
  }
}

function withDefaultPosition(table, index) {
  if (table.layout_x !== null && table.layout_x !== undefined && table.layout_y !== null && table.layout_y !== undefined) {
    return table
  }
  return {
    ...table,
    layout_x: gridCell.padding + (index % 5) * gridWidth.value * gridCell.span,
    layout_y: gridCell.padding + Math.floor(index / 5) * gridHeight.value * gridCell.span,
  }
}

function tableStyle(table) {
  if (!['free', 'grid'].includes(layoutMode.value)) return null
  const size = tableSize(table)
  const position = tablePosition(table)
  const fontSize = clamp(Math.min(size.width, size.height) / 8, 11, 14)
  return {
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    fontSize: `${fontSize}px`,
  }
}

function tablePosition(table) {
  const layout = responsiveTableLayout(table)
  const x = layout.x
  const y = layout.y
  if (!boardSize.width) return { x, y }
  if (layoutMode.value !== 'grid') {
    return clampFreePosition(x, y, table)
  }
  const placed = gridPlacements.value.get(table.id)
  if (placed) return placed
  const snapped = normalizePosition(x, y, mapBounds(), table, 'grid')
  return snapped
}

function tableLayout(table) {
  const pending = pendingLayouts[table.id]
  return {
    x: Number(pending?.x ?? table.layout_x ?? gridCell.padding),
    y: Number(pending?.y ?? table.layout_y ?? gridCell.padding),
  }
}

function responsiveTableLayout(table) {
  if (pendingLayouts[table.id] || !boardSize.width) return tableLayout(table)
  const layout = tableLayout(table)
  const scale = layoutScale()

  return {
    x: gridCell.padding + (layout.x - gridCell.padding) * scale.x,
    y: gridCell.padding + (layout.y - gridCell.padding) * scale.y,
  }
}

function layoutScale() {
  const bounds = mapBounds()
  const maxContent = visibleTables.value.reduce((size, table) => {
    if (pendingLayouts[table.id]) return size
    const layout = tableLayout(table)
    const tableDimensions = tableSize(table)
    return {
      width: Math.max(size.width, layout.x + tableDimensions.width),
      height: Math.max(size.height, layout.y + tableDimensions.height),
    }
  }, { width: gridCell.padding, height: gridCell.padding })
  const availableWidth = Math.max(1, bounds.width - gridCell.padding * 2)
  const contentWidth = Math.max(1, maxContent.width - gridCell.padding * 2)
  const availableHeight = Math.max(1, bounds.height - gridCell.padding * 2)
  const contentHeight = Math.max(1, maxContent.height - gridCell.padding * 2)

  return {
    x: Math.min(1, availableWidth / contentWidth),
    y: Math.min(1, availableHeight / contentHeight),
  }
}

function normalizePosition(x, y, board, table = null, mode = layoutMode.value) {
  const size = tableSize(table)
  const maxX = Math.max(8, board.width - size.width)
  const maxY = Math.max(8, board.height - size.height)

  if (mode !== 'grid') {
    return {
      x: clamp(x, 8, maxX),
      y: clamp(y, 8, maxY),
    }
  }

  const span = tableGridSpan(table)
  const maxColumn = Math.max(0, gridColumns.value - span.columns)
  const maxRow = Math.max(0, gridRows.value - span.rows)
  const maxSnappedX = gridCell.padding + maxColumn * gridWidth.value
  const maxSnappedY = gridCell.padding + maxRow * gridHeight.value
  const snappedX = gridCell.padding + Math.round((x - gridCell.padding) / gridWidth.value) * gridWidth.value
  const snappedY = gridCell.padding + Math.round((y - gridCell.padding) / gridHeight.value) * gridHeight.value

  return {
    x: clamp(snappedX, gridCell.padding, maxSnappedX),
    y: clamp(snappedY, gridCell.padding, maxSnappedY),
  }
}

function clampFreePosition(x, y, table) {
  return normalizePosition(x, y, mapBounds(), table, 'free')
}

function applyGridPositionsToLayout() {
  if (!boardSize.width) return []
  const updates = []
  visibleTables.value.forEach((table) => {
    const gridPosition = gridPlacements.value.get(table.id)
      || normalizePosition(responsiveTableLayout(table).x, responsiveTableLayout(table).y, mapBounds(), table, 'grid')
    const nextPosition = {
      x: Math.round(gridPosition.x),
      y: Math.round(gridPosition.y),
    }
    const currentX = Math.round(Number(table.layout_x ?? 0))
    const currentY = Math.round(Number(table.layout_y ?? 0))
    table.layout_x = gridPosition.x
    table.layout_y = gridPosition.y
    pendingLayouts[table.id] = gridPosition
    if (currentX !== nextPosition.x || currentY !== nextPosition.y) {
      updates.push({ table, position: nextPosition })
    }
  })
  return updates
}

async function persistGridPositions() {
  const updates = applyGridPositionsToLayout()
  if (!updates?.length) return

  await Promise.all(updates.map(({ table, position }) => tableStore.updateTable(table.id, {
    layout_x: Math.round(position.x),
    layout_y: Math.round(position.y),
    shape: resolvedShape(table),
  })))
}

function schedulePersistGridPositions() {
  window.clearTimeout(gridPersistTimer)
  gridPersistTimer = window.setTimeout(() => {
    persistGridPositions().catch((error) => {
      console.warn('Không thể lưu vị trí lưới:', error)
    })
  }, 250)
}

function mapBounds() {
  const width = boardRef.value?.clientWidth || boardSize.width
  const height = boardRef.value?.clientHeight || mapHeight.value

  return {
    width,
    height,
  }
}

function tableGridSpan(table) {
  return resolvedShape(table) === 'rectangle'
    ? { columns: 3, rows: 2 }
    : { columns: 2, rows: 2 }
}

function tableGridOrigin(table) {
  const span = tableGridSpan(table)
  const { x, y } = responsiveTableLayout(table)
  const maxColumn = Math.max(0, gridColumns.value - span.columns)
  const maxRow = Math.max(0, gridRows.value - span.rows)

  return {
    column: clamp(Math.round((x - gridCell.padding) / gridWidth.value), 0, maxColumn),
    row: clamp(Math.round((y - gridCell.padding) / gridHeight.value), 0, maxRow),
  }
}

function gridPositionToPixels(position) {
  return {
    x: gridCell.padding + position.column * gridWidth.value,
    y: gridCell.padding + position.row * gridHeight.value,
  }
}

function findOpenGridPosition(origin, span, occupied) {
  const maxColumn = Math.max(0, gridColumns.value - span.columns)
  const maxRow = Math.max(0, gridRows.value - span.rows)
  const candidates = []

  for (let row = 0; row <= maxRow; row += 1) {
    for (let column = 0; column <= maxColumn; column += 1) {
      candidates.push({
        column,
        row,
        distance: Math.abs(column - origin.column) + Math.abs(row - origin.row),
      })
    }
  }

  candidates.sort((a, b) => a.distance - b.distance || a.row - b.row || a.column - b.column)
  return candidates.find((candidate) => !gridCellsOverlap(candidate, span, occupied)) || null
}

function gridCellsOverlap(position, span, occupied) {
  for (let row = position.row; row < position.row + span.rows; row += 1) {
    for (let column = position.column; column < position.column + span.columns; column += 1) {
      if (occupied.has(`${column}:${row}`)) return true
    }
  }
  return false
}

function markGridCells(position, span, occupied) {
  for (let row = position.row; row < position.row + span.rows; row += 1) {
    for (let column = position.column; column < position.column + span.columns; column += 1) {
      occupied.add(`${column}:${row}`)
    }
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

function tableSize(table) {
  const span = tableGridSpan(table)
  return {
    width: gridWidth.value * span.columns,
    height: gridHeight.value * span.rows,
  }
}

function gridPositionFromPixels(position, table = null) {
  const span = tableGridSpan(table)
  const maxColumn = Math.max(0, gridColumns.value - span.columns)
  const maxRow = Math.max(0, gridRows.value - span.rows)

  return {
    column: clamp(Math.round((position.x - gridCell.padding) / gridWidth.value), 0, maxColumn),
    row: clamp(Math.round((position.y - gridCell.padding) / gridHeight.value), 0, maxRow),
  }
}

function gridSettingsKey(floor = activeFloor.value || DEFAULT_SECTION) {
  return String(floor || DEFAULT_SECTION)
}

function loadGridSettings() {
  const fallback = { columns: 12, rows: 10 }
  if (typeof window === 'undefined') return fallback

  try {
    const saved = JSON.parse(window.localStorage.getItem(GRID_SETTINGS_KEY) || '{}')
    if (saved?.columns || saved?.rows) return normalizeGridSettings(saved, fallback)
    const floorSettings = saved?.[gridSettingsKey()]
    return normalizeGridSettings(floorSettings, fallback)
  } catch (error) {
    return fallback
  }
}

function normalizeGridSettings(settings, fallback = { columns: 12, rows: 10 }) {
  return {
    columns: clamp(Number(settings?.columns) || fallback.columns, 6, 32),
    rows: clamp(Number(settings?.rows) || fallback.rows, 5, 24),
  }
}

function applyGridSettingsForFloor(floor = activeFloor.value) {
  const settings = loadGridSettingsForFloor(floor)
  gridCell.columns = settings.columns
  gridCell.rows = settings.rows
}

function loadGridSettingsForFloor(floor) {
  const fallback = { columns: 12, rows: 10 }
  if (typeof window === 'undefined') return fallback

  try {
    const saved = JSON.parse(window.localStorage.getItem(GRID_SETTINGS_KEY) || '{}')
    if (saved?.columns || saved?.rows) return normalizeGridSettings(saved, fallback)
    return normalizeGridSettings(saved?.[gridSettingsKey(floor)], fallback)
  } catch (error) {
    return fallback
  }
}

function persistGridSettings(floor = activeFloor.value) {
  if (typeof window === 'undefined') return
  let saved = {}

  try {
    saved = JSON.parse(window.localStorage.getItem(GRID_SETTINGS_KEY) || '{}')
  } catch (error) {
    saved = {}
  }

  if (saved?.columns || saved?.rows) saved = {}

  saved[gridSettingsKey(floor)] = {
    columns: gridColumns.value,
    rows: gridRows.value,
  }
  window.localStorage.setItem(GRID_SETTINGS_KEY, JSON.stringify(saved))
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
.grid-settings { display: flex; align-items: center; gap: 10px; }
.grid-settings.is-hidden { visibility: hidden; pointer-events: none; }
.grid-settings label { display: flex; align-items: center; gap: 6px; color: #344054; font-size: 12px; font-weight: 800; white-space: nowrap; }
.grid-settings input { width: 64px; min-height: 32px; padding: 0 8px; }
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
.board-head { display: flex; align-items: center; justify-content: flex-start; gap: 16px; flex-wrap: nowrap; min-height: 58px; margin-bottom: 18px; }
.legend { display: flex; align-items: center; justify-content: flex-end; gap: 18px; color: #374151; font-size: 13px; }
.legend span { display: inline-flex; align-items: center; gap: 6px; }
.legend-box { width: 14px; height: 14px; border-radius: 3px; background: #fff; border: 2px solid currentColor; }
.legend-box.available { color: #00c853; }
.legend-box.occupied { color: #ff3d4f; }
.legend-box.reserved { color: #ffb300; }
.edit-hint { margin: 0; color: #667085; font-size: 13px; white-space: nowrap; }
.edit-hint.is-hidden { visibility: hidden; }
.table-map { position: relative; min-height: 0; border-radius: 8px; background-color: #fff; overflow: hidden; }
.table-map.grid { position: relative; }
.table-map.grid.editing-grid {
  background-image:
    repeating-linear-gradient(to right, rgba(31, 106, 188, .22) 0 1px, transparent 1px var(--grid-width)),
    repeating-linear-gradient(to bottom, rgba(31, 106, 188, .22) 0 1px, transparent 1px var(--grid-height));
  background-position: var(--grid-padding) var(--grid-padding);
  background-size: var(--grid-area-width) var(--grid-area-height);
  background-repeat: no-repeat;
}
.table-map.grid.dragging-grid {
  background-image:
    repeating-linear-gradient(to right, rgba(31, 106, 188, .38) 0 1px, transparent 1px var(--grid-width)),
    repeating-linear-gradient(to bottom, rgba(31, 106, 188, .38) 0 1px, transparent 1px var(--grid-height));
  background-size: var(--grid-area-width) var(--grid-area-height);
  background-repeat: no-repeat;
}
.table-map.compact { display: grid; position: static; align-items: center; justify-items: center; }
.table-map.compact { grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 18px; min-height: 380px; }
.table-node { position: absolute; z-index: 1; box-sizing: border-box; display: grid; place-items: center; align-content: center; gap: 4px; width: 168px; height: 120px; border: 3px solid #00c853; border-radius: 14px; background: #d8f8e2; color: #111827; cursor: pointer; transition: transform .1s ease, box-shadow .1s ease; touch-action: none; will-change: left, top; }
.table-map.grid .table-node { transition: left .2s ease, top .2s ease, transform .1s ease, box-shadow .1s ease; }
.table-map.grid .table-node.dragging { transition: left .12s ease-out, top .12s ease-out, transform .1s ease, box-shadow .1s ease; }
.table-map.compact .table-node { position: static; }
.table-node.circle { width: 120px; height: 120px; border-radius: 50%; }
.table-node.square { width: 120px; height: 120px; border-radius: 14px; }
.table-node.rectangle { width: 168px; height: 120px; border-radius: 14px; }
.table-map.grid .table-node.circle, .table-map.grid .table-node.square, .table-map.grid .table-node.rectangle { width: auto; height: auto; }
.table-node strong { font-size: 1em; line-height: 1.1; }
.table-node span, .table-node small { font-size: .86em; color: #111827; }
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
.service-list article { display: grid; gap: 10px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: #f8fafc; }
.service-table-head, .service-item { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; }
.service-table-head button, .service-item button { width: auto; min-height: 30px; padding: 0 10px; border-color: #16a34a; background: #dcfce7; color: #15803d; font-size: 12px; }
.service-table-title { display: flex; align-items: center; gap: 8px; min-width: 0; }
.service-table-label { display: grid; gap: 2px; min-width: 0; }
.service-table-label small { color: #667085; font-size: 12px; font-weight: 800; }
.service-toggle { display: grid; flex: 0 0 28px; place-items: center; width: 28px; min-height: 28px; padding: 0; border-color: #d0d5dd; background: #fff; color: #344054; font-size: 22px; line-height: 1; }
.service-items { display: grid; gap: 8px; margin-left: 36px; padding-left: 12px; border-left: 2px solid #bbf7d0; }
.service-item { padding-top: 8px; border-top: 1px solid #e5e7eb; }
.service-item:first-child { border-top: 0; padding-top: 0; }
.service-item span { min-width: 0; color: #111827; font-weight: 800; }
.service-pagination { display: grid; grid-template-columns: 36px 1fr 36px; gap: 10px; align-items: center; padding-top: 2px; }
.service-pagination button { display: grid; place-items: center; min-height: 36px; padding: 0; border-color: #bbf7d0; background: #f0fdf4; color: #15803d; font-size: 24px; line-height: 1; }
.service-pagination span { color: #344054; font-size: 13px; font-weight: 800; text-align: center; }
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

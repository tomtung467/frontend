import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { firestoreDb } from '@/config/firebase'

const kitchenStatuses = new Set(['pending', 'confirmed', 'in_progress', 'ready'])
let permissionWarningShown = false

function cleanForFirestore(value) {
  if (Array.isArray(value)) {
    return value.map(cleanForFirestore)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, cleanForFirestore(entryValue)])
    )
  }

  return value
}

function collectionRef(path) {
  const segments = path.split('/').filter(Boolean)

  if (segments[0] === 'tableOrders' && segments[1]) {
    return collection(firestoreDb, 'tableOrders', String(segments[1]), 'orders')
  }

  return collection(firestoreDb, path)
}

function docRef(path, id) {
  const segments = path.split('/').filter(Boolean)

  if (segments[0] === 'tableOrders' && segments[1]) {
    return doc(firestoreDb, 'tableOrders', String(segments[1]), 'orders', String(id))
  }

  return doc(firestoreDb, path, String(id))
}

function sortRecords(records) {
  return records.sort((a, b) => {
    const left = new Date(a.created_at || a.updated_at || 0).getTime()
    const right = new Date(b.created_at || b.updated_at || 0).getTime()
    return right - left
  })
}

function snapshotList(snapshot) {
  return sortRecords(snapshot.docs.map((item) => ({
    id: item.data().id ?? item.id,
    ...item.data(),
  })))
}

function isPermissionError(error) {
  return error?.code === 'permission-denied' || error?.message?.toLowerCase().includes('permission')
}

async function safeWrite(write) {
  try {
    await write()
  } catch (error) {
    if (isPermissionError(error)) {
      if (!permissionWarningShown) {
        permissionWarningShown = true
        console.info('Firestore writes are blocked by security rules. Falling back to API data.')
      }
      return
    }

    console.warn('Firestore sync failed:', error)
  }
}

export function subscribeFirestoreList(path, callback, options = {}) {
  return onSnapshot(
    collectionRef(path),
    (snapshot) => callback(snapshotList(snapshot)),
    (error) => {
      if (!isPermissionError(error)) {
        console.warn(`Firestore listener failed for ${path}:`, error)
      }
      options.onUnavailable?.(error)
    }
  )
}

export async function replaceFirestoreCollection(path, records) {
  if (!Array.isArray(records)) return

  await safeWrite(async () => {
    const reference = collectionRef(path)
    const snapshot = await getDocs(reference)
    const nextIds = new Set(records.filter((record) => record?.id != null).map((record) => String(record.id)))
    const batch = writeBatch(firestoreDb)

    snapshot.docs.forEach((item) => {
      if (!nextIds.has(item.id)) {
        batch.delete(item.ref)
      }
    })

    records.forEach((record) => {
      if (record?.id == null) return
      batch.set(docRef(path, record.id), cleanForFirestore({
        ...record,
        synced_at: serverTimestamp(),
      }), { merge: true })
    })

    await batch.commit()
  })
}

export async function upsertFirestoreRecord(path, record) {
  if (!record?.id) return

  await safeWrite(() => setDoc(docRef(path, record.id), cleanForFirestore({
    ...record,
    synced_at: serverTimestamp(),
  }), { merge: true }))
}

export async function removeFirestoreRecord(path, id) {
  if (!id) return
  await safeWrite(() => deleteDoc(docRef(path, id)))
}

export async function syncOrderFirestore(order) {
  if (!order?.id) return

  await upsertFirestoreRecord('orders', order)

  if (order.table_id) {
    await upsertFirestoreRecord(`tableOrders/${order.table_id}`, order)
  }

  if (kitchenStatuses.has(order.status)) {
    await upsertFirestoreRecord('kitchenQueue', order)
  } else {
    await removeFirestoreRecord('kitchenQueue', order.id)
  }
}

export async function syncOrdersFirestore(orders) {
  if (!Array.isArray(orders)) return

  await replaceFirestoreCollection('orders', orders)

  const kitchenOrders = orders.filter((order) => kitchenStatuses.has(order.status))
  await replaceFirestoreCollection('kitchenQueue', kitchenOrders)

  const ordersByTable = orders.reduce((result, order) => {
    if (!order?.table_id) return result
    const key = String(order.table_id)
    result[key] = result[key] || []
    result[key].push(order)
    return result
  }, {})

  await Promise.all(
    Object.entries(ordersByTable).map(([tableId, tableOrders]) =>
      replaceFirestoreCollection(`tableOrders/${tableId}`, tableOrders)
    )
  )
}

export async function syncKitchenQueueFirestore(queue) {
  if (!Array.isArray(queue)) return
  await replaceFirestoreCollection('kitchenQueue', queue)
  await Promise.all(queue.map(syncOrderFirestore))
}

export async function syncTablesFirestore(tables) {
  if (!Array.isArray(tables)) return
  await replaceFirestoreCollection('tables', tables)
}

export async function syncTableFirestore(table) {
  await upsertFirestoreRecord('tables', table)
}

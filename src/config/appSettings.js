import { reactive } from 'vue'

const STORAGE_KEY = 'restaurant_app_settings'

const defaults = {
  navLayout: 'top',
}

function readSettings() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  } catch {
    return { ...defaults }
  }
}

export const appSettings = reactive(readSettings())

export function saveAppSettings(settings) {
  Object.assign(appSettings, settings)
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...appSettings }))
}

export function resetAppSettings() {
  Object.assign(appSettings, defaults)
  localStorage.removeItem(STORAGE_KEY)
}

const cache = new Map()
const inFlight = new Map()

function normalizeParams(params = {}) {
  return Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
}

export function getCacheKey(basePath, endpoint, config = {}) {
  return `${basePath}${endpoint}?${normalizeParams(config.params)}`
}

export function getCachedValue(key, ttl) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.time > ttl) {
    cache.delete(key)
    return null
  }
  return entry.value
}

export function setCachedValue(key, value) {
  cache.set(key, { value, time: Date.now() })
}

export function getInFlight(key) {
  return inFlight.get(key)
}

export function setInFlight(key, promise) {
  inFlight.set(key, promise)
}

export function clearInFlight(key) {
  inFlight.delete(key)
}

export function clearAllInFlight() {
  inFlight.clear()
}

export function clearGetCache(prefix = '') {
  for (const key of cache.keys()) {
    if (!prefix || key.startsWith(prefix)) cache.delete(key)
  }
}

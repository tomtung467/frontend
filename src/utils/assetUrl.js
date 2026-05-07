import api from '@/api'

function apiOrigin() {
  try {
    return new URL(api.defaults.baseURL).origin
  } catch {
    return window.location.origin
  }
}

export function resolveAssetUrl(value) {
  if (!value) return ''

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value
  }

  if (value.startsWith('/')) {
    return `${apiOrigin()}${value}`
  }

  return `${apiOrigin()}/${value}`
}

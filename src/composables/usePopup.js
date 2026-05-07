export function showPopup({ type = 'info', title = '', message = '', confirmText = 'OK' }) {
  if (isRouteCancelNotice({ title, message })) return
  window.dispatchEvent(new CustomEvent('restaurant-notification', {
    detail: { type, title, message, confirmText },
  }))
}

export function showNotification({ type = 'info', title = '', message = '', duration = 4200 }) {
  if (isRouteCancelNotice({ title, message })) return
  window.dispatchEvent(new CustomEvent('restaurant-notification', {
    detail: { type, title, message, duration },
  }))
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

const pendingControllers = new Map()
let currentRouteScope = 0

export function attachAbortController(config) {
  if (config.signal || config.cancelOnRouteChange === false) return config
  if ((config.method || 'get').toLowerCase() !== 'get' && config.cancelOnRouteChange !== true) return config

  const controller = new AbortController()
  config.signal = controller.signal
  config.__abortController = controller
  config.__routeScope = currentRouteScope
  pendingControllers.set(controller, currentRouteScope)
  return config
}

export function releaseAbortController(config) {
  const controller = config?.__abortController
  if (controller) pendingControllers.delete(controller)
}

export function abortPendingRequests() {
  pendingControllers.forEach((scope, controller) => {
    if (scope !== currentRouteScope) {
      controller.abort()
      pendingControllers.delete(controller)
    }
  })
}

export function beginRouteScope() {
  currentRouteScope += 1
  pendingControllers.forEach((scope, controller) => {
    if (scope !== currentRouteScope) {
      controller.abort()
      pendingControllers.delete(controller)
    }
  })
  return currentRouteScope
}

export function getCurrentRouteScope() {
  return currentRouteScope
}

export function abortAllPendingRequests() {
  pendingControllers.forEach((scope, controller) => controller.abort())
  pendingControllers.clear()
}

export function isAbortError(error) {
  return error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError'
}

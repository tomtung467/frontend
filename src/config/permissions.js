const STORAGE_KEY = 'restaurant_role_permissions'

export const ROLES = [
  { key: 'admin', label: 'Admin' },
  { key: 'manager', label: 'Manager' },
  { key: 'staff', label: 'Staff' },
  { key: 'chef', label: 'Chef' },
  { key: 'customer', label: 'Customer' },
]

export const NAV_ITEMS = [
  { key: 'customer-menu', labelKey: 'nav.customerMenu', icon: 'mdi-silverware-fork-knife', path: '/menu', roles: ['customer'] },
  { key: 'customer-cart', labelKey: 'nav.customerCart', icon: 'mdi-cart', path: '/cart', roles: ['customer'] },
  { key: 'customer-orders', labelKey: 'nav.customerOrders', icon: 'mdi-clipboard-text-clock', path: '/orders', roles: ['customer'] },
  { key: 'dashboard', labelKey: 'nav.dashboard', icon: 'mdi-chart-box', path: '/dashboard', roles: ['manager', 'admin'] },
  { key: 'orders', labelKey: 'nav.orders', icon: 'mdi-clipboard-list', path: '/orders', roles: ['staff', 'manager', 'admin'] },
  { key: 'kitchen', labelKey: 'nav.kitchen', icon: 'mdi-chef-hat', path: '/kitchen', roles: ['chef', 'admin'] },
  { key: 'tables', labelKey: 'nav.tables', icon: 'mdi-table-furniture', path: '/tables', roles: ['staff', 'manager', 'admin'] },
  { key: 'menu-management', labelKey: 'nav.menuManagement', icon: 'mdi-food', path: '/menu-management', roles: ['manager', 'admin'] },
  { key: 'inventory', labelKey: 'nav.inventory', icon: 'mdi-package-variant', path: '/inventory', roles: ['manager', 'chef', 'admin'] },
  { key: 'employees', labelKey: 'nav.employees', icon: 'mdi-account-group', path: '/employees', roles: ['manager', 'admin'] },
  { key: 'payments', labelKey: 'nav.payments', icon: 'mdi-cash-register', path: '/payments', roles: ['staff', 'manager', 'admin'] },
  { key: 'invoices', labelKey: 'nav.invoices', icon: 'mdi-receipt-text', path: '/invoices', roles: ['staff', 'manager', 'admin'] },
  { key: 'reports', labelKey: 'nav.reports', icon: 'mdi-chart-line', path: '/reports', roles: ['manager', 'admin'] },
  { key: 'settings', labelKey: 'nav.settings', icon: 'mdi-cog', path: '/settings', roles: ['customer', 'staff', 'chef', 'manager', 'admin'] },
]

export function getDefaultPermissions() {
  return NAV_ITEMS.reduce((matrix, item) => {
    matrix[item.key] = [...item.roles]
    return matrix
  }, {})
}

export function getPermissionMatrix() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return { ...getDefaultPermissions(), ...saved }
  } catch {
    return getDefaultPermissions()
  }
}

export function savePermissionMatrix(matrix) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matrix))
}

export function resetPermissionMatrix() {
  localStorage.removeItem(STORAGE_KEY)
}

export function canAccessPermission(role, permissionKey) {
  if (!permissionKey) return true
  if (role === 'admin') return true
  const matrix = getPermissionMatrix()
  return Boolean(matrix[permissionKey]?.includes(role))
}

export function getVisibleNavItems(role) {
  return NAV_ITEMS.filter((item) => canAccessPermission(role, item.key))
}

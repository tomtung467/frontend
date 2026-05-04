import { useAuthStore } from '@/stores/useAuthStore'

export function useAuth() {
  const authStore = useAuthStore()

  const isAuthenticated = () => authStore.isAuthenticated
  const getUser = () => authStore.user
  const getToken = () => authStore.token
  const logout = () => authStore.logout()
  const hasRole = (role) => {
    if (!authStore.user) return false
    if (Array.isArray(role)) {
      return role.includes(authStore.user.role)
    }
    return authStore.user.role === role
  }

  return {
    isAuthenticated,
    getUser,
    getToken,
    logout,
    hasRole,
  }
}

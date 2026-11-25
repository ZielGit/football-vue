import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi } from '@/api/auth'
import { TOKEN_KEY } from '@/api/http'
import type { Me } from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<Me | null>(null)

  const isAuthenticated = computed(() => token.value !== null)
  const permissions = computed(() => new Set(user.value?.permissions ?? []))

  /** Solo mejora la experiencia: el servidor vuelve a validar cada permiso. */
  function can(permission: string): boolean {
    return permissions.value.has(permission)
  }

  function canAny(list: string[]): boolean {
    return list.some(can)
  }

  async function login(email: string, password: string): Promise<void> {
    const result = await authApi.login(email, password)
    token.value = result.access_token
    localStorage.setItem(TOKEN_KEY, result.access_token)
    user.value = result.user
  }

  /** Recupera el perfil tras recargar la página. Si el token ya no sirve, limpia la sesión. */
  async function restore(): Promise<void> {
    if (!token.value || user.value) return
    try {
      user.value = await authApi.me()
    } catch {
      clear()
    }
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout()
    } catch {
      // Si el token ya venció, igualmente cerramos sesión localmente.
    }
    clear()
  }

  function clear(): void {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  return { token, user, isAuthenticated, permissions, can, canAny, login, restore, logout, clear }
})

import type { Directive } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * v-can="'users.manage'" oculta el elemento si la persona no tiene el permiso.
 * Es solo UX: la API siempre rechaza con 403 lo que no corresponde.
 */
export const vCan: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    apply(el, binding.value)
  },
  updated(el, binding) {
    apply(el, binding.value)
  },
}

function apply(el: HTMLElement, value: string | string[]): void {
  const auth = useAuthStore()
  const allowed = Array.isArray(value) ? auth.canAny(value) : auth.can(value)
  el.style.display = allowed ? '' : 'none'
}

import { useAuthStore } from '@/stores/auth'

/** Acceso corto a las verificaciones de permisos en JS puro (sin CASL). */
export function usePermissions() {
  const auth = useAuthStore()
  return { can: auth.can, canAny: auth.canAny }
}

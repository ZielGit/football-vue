import { ref, shallowRef, watch } from 'vue'
import { toMessage } from '@/api/errors'
import type { PageMeta, Paginated } from '@/types/api'

/** Lista paginada con estados de carga y error, reutilizable por equipos, jugadores y usuarios. */
export function usePagedList<T>(fetcher: (page: number) => Promise<Paginated<T>>) {
  const items = shallowRef<T[]>([])
  const meta = ref<PageMeta | null>(null)
  const page = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)
  let ticket = 0

  async function load(): Promise<void> {
    const mine = ++ticket
    loading.value = true
    error.value = null
    try {
      const result = await fetcher(page.value)
      if (mine !== ticket) return // llegó una respuesta más nueva
      items.value = result.items
      meta.value = result.meta
    } catch (e) {
      if (mine !== ticket) return
      error.value = toMessage(e)
    } finally {
      if (mine === ticket) loading.value = false
    }
  }

  /** Vuelve a la página 1 (al cambiar filtros) y recarga. */
  function reset(): void {
    if (page.value === 1) void load()
    else page.value = 1
  }

  watch(page, () => void load())

  return { items, meta, page, loading, error, load, reset }
}

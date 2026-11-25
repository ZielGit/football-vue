import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: number
  text: string
  color: 'success' | 'error' | 'warning' | 'info'
}

export const useNotificationsStore = defineStore('notifications', () => {
  const current = ref<Toast | null>(null)
  const queue: Toast[] = []
  let seq = 0

  function next(): void {
    current.value = queue.shift() ?? null
  }

  function push(text: string, color: Toast['color']): void {
    queue.push({ id: ++seq, text, color })
    if (!current.value) next()
  }

  return {
    current,
    next,
    success: (text: string) => push(text, 'success'),
    error: (text: string) => push(text, 'error'),
    warning: (text: string) => push(text, 'warning'),
    info: (text: string) => push(text, 'info'),
  }
})

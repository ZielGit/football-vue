<script setup lang="ts">
import { computed } from 'vue'
import type { ImportStatusValue } from '@/types/api'

const props = defineProps<{ status: ImportStatusValue }>()

const config = computed(() => {
  switch (props.status) {
    case 'queued':
      return { text: 'En cola', color: 'info', icon: 'mdi-clock-outline' }
    case 'running':
      return { text: 'Importando…', color: 'info', icon: 'mdi-progress-download' }
    case 'waiting_rate_limit':
      return { text: 'Esperando cupo de football-data', color: 'warning', icon: 'mdi-timer-sand' }
    case 'completed':
      return { text: 'Importada', color: 'success', icon: 'mdi-check-circle-outline' }
    default:
      return { text: 'Falló', color: 'error', icon: 'mdi-alert-circle-outline' }
  }
})
</script>

<template>
  <v-chip :color="config.color" :prepend-icon="config.icon" variant="tonal" label>{{ config.text }}</v-chip>
</template>

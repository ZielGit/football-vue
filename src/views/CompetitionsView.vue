<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { footballApi, type CompetitionList } from '@/api/football'
import { toMessage } from '@/api/errors'
import EmptyState from '@/components/EmptyState.vue'
import ErrorAlert from '@/components/ErrorAlert.vue'
import PageHeader from '@/components/PageHeader.vue'
import SearchField from '@/components/SearchField.vue'
import { formatDate } from '@/utils/format'

const data = ref<CompetitionList | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('')
let timer: number | undefined
let polls = 0

const filtered = computed(() => {
  const term = (search.value ?? '').toLowerCase()
  return (data.value?.items ?? []).filter(
    (c) => !term || [c.name, c.area, c.code].some((v) => v?.toLowerCase().includes(term)),
  )
})

async function load(initial = true): Promise<void> {
  if (initial) loading.value = true
  error.value = null
  try {
    data.value = await footballApi.competitions()
    schedulePoll()
  } catch (e) {
    error.value = toMessage(e)
  } finally {
    loading.value = false
  }
}

// Si la lista se está sincronizando en segundo plano, volvemos a consultar unas cuantas veces.
function schedulePoll(): void {
  window.clearTimeout(timer)
  if (data.value?.refreshing && polls < 15) {
    polls++
    timer = window.setTimeout(() => void load(false), 4000)
  }
}

onMounted(() => void load())
onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <page-header
    title="Competiciones"
    :subtitle="data?.lastSyncedAt ? `Última actualización: ${formatDate(data.lastSyncedAt)}` : undefined"
  />

  <error-alert v-if="error" :message="error" @retry="load()" />

  <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

  <template v-else-if="data">
    <v-alert v-if="data.refreshing" type="info" variant="tonal" class="mb-4" icon="mdi-sync">
      Actualizando la lista desde football-data.org. Se mostrará aquí en cuanto esté lista.
    </v-alert>

    <search-field v-if="data.items.length" v-model="search" label="Buscar por nombre, país o código" class="mb-4" />

    <empty-state
      v-if="!filtered.length"
      icon="mdi-trophy-outline"
      :title="data.items.length ? 'Sin resultados' : 'Aún no hay competiciones guardadas'"
      :text="data.items.length ? 'Prueba con otra búsqueda.' : 'La lista se sincroniza en segundo plano; vuelve en unos instantes.'"
    />

    <v-row v-else>
      <v-col v-for="c in filtered" :key="c.id" cols="12" sm="6" lg="4" xl="3">
        <v-card :to="{ name: 'competition', params: { id: c.id } }" height="100%" hover>
          <v-card-item>
            <template #prepend>
              <v-avatar color="grey-lighten-3" rounded="lg" size="48">
                <v-img v-if="c.emblem" :src="c.emblem" contain />
                <v-icon v-else icon="mdi-trophy" />
              </v-avatar>
            </template>
            <v-card-title class="text-wrap">{{ c.name }}</v-card-title>
            <v-card-subtitle>{{ c.area ?? '—' }}</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <v-chip v-if="c.code" size="small" class="mr-1" label>{{ c.code }}</v-chip>
            <v-chip v-if="c.type" size="small" label variant="tonal">{{ c.type }}</v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </template>
</template>

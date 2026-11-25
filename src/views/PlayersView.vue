<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { footballApi } from '@/api/football'
import EmptyState from '@/components/EmptyState.vue'
import ErrorAlert from '@/components/ErrorAlert.vue'
import PageHeader from '@/components/PageHeader.vue'
import SearchField from '@/components/SearchField.vue'
import { usePagedList } from '@/composables/usePagedList'
import type { Player } from '@/types/api'
import { POSITION_OPTIONS, formatDay, positionLabel } from '@/utils/format'

const route = useRoute()
const search = ref('')
const position = ref<string | null>(null)
const competitionId = ref<number | null>(route.query.competition_id ? Number(route.query.competition_id) : null)

const list = usePagedList<Player>((page) =>
  footballApi.players({
    page,
    per_page: 20,
    search: search.value,
    position: position.value,
    competition_id: competitionId.value,
  }),
)

watch([search, position], () => list.reset())
onMounted(() => void list.load())
</script>

<template>
  <page-header title="Jugadores" subtitle="Jugadores guardados en la base de datos propia">
    <template #actions>
      <v-chip v-if="competitionId" closable color="primary" variant="tonal" @click:close="(competitionId = null), list.reset()">
        Filtrado por competición {{ competitionId }}
      </v-chip>
    </template>
  </page-header>

  <v-row class="mb-2">
    <v-col cols="12" sm="8"><search-field v-model="search" label="Buscar jugador" /></v-col>
    <v-col cols="12" sm="4">
      <v-select v-model="position" :items="POSITION_OPTIONS" label="Posición" clearable hide-details />
    </v-col>
  </v-row>

  <error-alert v-if="list.error.value" :message="list.error.value" @retry="list.load" />
  <v-progress-linear v-if="list.loading.value" indeterminate color="primary" class="mb-2" />

  <empty-state
    v-if="!list.loading.value && !list.error.value && !list.items.value.length"
    icon="mdi-account-off-outline"
    title="No hay jugadores para mostrar"
    text="Importa una liga o cambia los filtros."
  />

  <v-card v-else>
    <v-table density="comfortable">
      <thead>
        <tr>
          <th class="text-right">#</th>
          <th>Nombre</th>
          <th>Posición</th>
          <th>Equipo</th>
          <th class="d-none d-sm-table-cell">Nacionalidad</th>
          <th class="d-none d-md-table-cell">Nacimiento</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in list.items.value" :key="p.id">
          <td class="text-right">{{ p.shirt_number ?? '—' }}</td>
          <td>{{ p.name }}</td>
          <td>{{ positionLabel(p.position) }}</td>
          <td><router-link :to="{ name: 'team', params: { id: p.team_id } }">{{ p.team_name ?? p.team_id }}</router-link></td>
          <td class="d-none d-sm-table-cell">{{ p.nationality ?? '—' }}</td>
          <td class="d-none d-md-table-cell">{{ formatDay(p.date_of_birth) }}</td>
        </tr>
      </tbody>
    </v-table>
  </v-card>

  <v-pagination
    v-if="list.meta.value && list.meta.value.last_page > 1"
    v-model="list.page.value"
    :length="list.meta.value.last_page"
    :total-visible="5"
    class="mt-4"
  />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { footballApi } from '@/api/football'
import EmptyState from '@/components/EmptyState.vue'
import ErrorAlert from '@/components/ErrorAlert.vue'
import PageHeader from '@/components/PageHeader.vue'
import SearchField from '@/components/SearchField.vue'
import { usePagedList } from '@/composables/usePagedList'
import type { Team } from '@/types/api'

const route = useRoute()
const search = ref('')
const competitionId = ref<number | null>(route.query.competition_id ? Number(route.query.competition_id) : null)

const list = usePagedList<Team>((page) =>
  footballApi.teams({ page, per_page: 20, search: search.value, competition_id: competitionId.value }),
)

watch(search, () => list.reset())
onMounted(() => void list.load())
</script>

<template>
  <page-header title="Equipos" subtitle="Equipos guardados en la base de datos propia">
    <template #actions>
      <v-chip v-if="competitionId" closable color="primary" variant="tonal" @click:close="(competitionId = null), list.reset()">
        Filtrado por competición {{ competitionId }}
      </v-chip>
    </template>
  </page-header>

  <search-field v-model="search" label="Buscar equipo" class="mb-4" />
  <error-alert v-if="list.error.value" :message="list.error.value" @retry="list.load" />
  <v-progress-linear v-if="list.loading.value" indeterminate color="primary" class="mb-2" />

  <empty-state
    v-if="!list.loading.value && !list.error.value && !list.items.value.length"
    icon="mdi-shield-off-outline"
    title="No hay equipos guardados"
    text="Importa una liga desde Competiciones para ver sus equipos aquí."
  >
    <v-btn color="primary" :to="{ name: 'competitions' }">Ir a competiciones</v-btn>
  </empty-state>

  <v-row v-else>
    <v-col v-for="team in list.items.value" :key="team.id" cols="12" sm="6" md="4" xl="3">
      <v-card :to="{ name: 'team', params: { id: team.id } }" height="100%" hover>
        <v-card-item>
          <template #prepend>
            <v-avatar color="grey-lighten-3" rounded="lg" size="48">
              <v-img v-if="team.crest" :src="team.crest" contain />
              <v-icon v-else icon="mdi-shield-half-full" />
            </v-avatar>
          </template>
          <v-card-title class="text-wrap">{{ team.name }}</v-card-title>
          <v-card-subtitle>{{ team.venue ?? team.tla ?? '' }}</v-card-subtitle>
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>

  <v-pagination
    v-if="list.meta.value && list.meta.value.last_page > 1"
    v-model="list.page.value"
    :length="list.meta.value.last_page"
    :total-visible="5"
    class="mt-4"
  />
</template>

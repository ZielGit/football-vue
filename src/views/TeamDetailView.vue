<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { footballApi } from '@/api/football'
import { toMessage } from '@/api/errors'
import ErrorAlert from '@/components/ErrorAlert.vue'
import PageHeader from '@/components/PageHeader.vue'
import type { TeamDetail } from '@/types/api'
import { formatDay, positionLabel } from '@/utils/format'

const route = useRoute()
const team = ref<TeamDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    team.value = await footballApi.team(Number(route.params.id))
  } catch (e) {
    error.value = toMessage(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => void load())
</script>

<template>
  <v-btn variant="text" prepend-icon="mdi-arrow-left" :to="{ name: 'teams' }" class="mb-2">Equipos</v-btn>
  <v-progress-linear v-if="loading" indeterminate color="primary" />
  <error-alert v-if="error" :message="error" @retry="load" />

  <template v-if="team">
    <page-header :title="team.name" :subtitle="[team.venue, team.founded ? `Fundado en ${team.founded}` : null].filter(Boolean).join(' · ')" />

    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center">
            <v-avatar size="96" rounded="lg" color="grey-lighten-3" class="mb-3">
              <v-img v-if="team.crest" :src="team.crest" contain />
              <v-icon v-else icon="mdi-shield-half-full" size="48" />
            </v-avatar>
            <div class="text-body-2">{{ team.address ?? '' }}</div>
            <div v-if="team.club_colors" class="text-caption text-medium-emphasis">{{ team.club_colors }}</div>
            <v-btn v-if="team.website" variant="text" size="small" :href="team.website" target="_blank" rel="noopener" class="mt-2">
              Sitio web
            </v-btn>
            <div class="mt-3">
              <v-chip v-for="c in team.competitions" :key="c.id" size="small" class="ma-1" label :to="{ name: 'competition', params: { id: c.id } }">
                {{ c.name }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card :title="`Plantilla (${team.players.length})`">
          <v-table v-if="team.players.length" density="comfortable">
            <thead>
              <tr>
                <th class="text-right">#</th>
                <th>Nombre</th>
                <th>Posición</th>
                <th class="d-none d-sm-table-cell">Nacionalidad</th>
                <th class="d-none d-md-table-cell">Nacimiento</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in team.players" :key="p.id">
                <td class="text-right">{{ p.shirt_number ?? '—' }}</td>
                <td>{{ p.name }}</td>
                <td>{{ positionLabel(p.position) }}</td>
                <td class="d-none d-sm-table-cell">{{ p.nationality ?? '—' }}</td>
                <td class="d-none d-md-table-cell">{{ formatDay(p.date_of_birth) }}</td>
              </tr>
            </tbody>
          </v-table>
          <v-card-text v-else class="text-medium-emphasis">Este equipo no tiene jugadores guardados.</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </template>
</template>

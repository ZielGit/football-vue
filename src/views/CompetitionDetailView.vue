<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { footballApi } from '@/api/football'
import { toMessage } from '@/api/errors'
import ErrorAlert from '@/components/ErrorAlert.vue'
import ImportStatusChip from '@/components/ImportStatusChip.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import type { CompetitionDetail, LeagueImport } from '@/types/api'
import { formatDate } from '@/utils/format'

const route = useRoute()
const auth = useAuthStore()
const notify = useNotificationsStore()

const id = computed(() => Number(route.params.id))
const detail = ref<CompetitionDetail | null>(null)
const importState = ref<LeagueImport | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
let timer: number | undefined

const canImport = computed(() => auth.can('competitions.import'))
const active = computed(() => importState.value?.active === true)

/** Pide la liga: devuelve lo guardado y, si el rol puede, deja encolada su importación. */
async function load(): Promise<void> {
  loading.value = detail.value === null
  error.value = null
  try {
    const result = await footballApi.competition(id.value)
    detail.value = result.detail
    importState.value = result.import
    schedulePoll()
  } catch (e) {
    error.value = toMessage(e)
  } finally {
    loading.value = false
  }
}

function schedulePoll(): void {
  window.clearTimeout(timer)
  if (active.value) timer = window.setTimeout(() => void poll(), 3000)
}

async function poll(): Promise<void> {
  try {
    const status = await footballApi.importStatus(id.value)
    importState.value = status

    if (status?.active) {
      schedulePoll()
      return
    }
    if (status?.status === 'completed') {
      notify.success('Importación terminada.')
      await load() // ya es reciente: no vuelve a encolar
    } else if (status?.status === 'failed') {
      notify.error(status.message ?? 'La importación falló.')
    }
  } catch (e) {
    error.value = toMessage(e)
  }
}

watch(id, () => {
  detail.value = null
  importState.value = null
  void load()
}, { immediate: true })

onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <v-btn variant="text" prepend-icon="mdi-arrow-left" :to="{ name: 'competitions' }" class="mb-2">Competiciones</v-btn>

  <v-progress-linear v-if="loading" indeterminate color="primary" />
  <error-alert v-if="error" :message="error" @retry="load" />

  <v-alert
    v-if="!loading && !detail && importState && importState.status !== 'failed'"
    type="info"
    variant="tonal"
    icon="mdi-progress-download"
    class="mb-4"
  >
    Esta liga aún no está guardada. Se está importando desde football-data.org; verás los datos aquí al terminar.
  </v-alert>
  <v-alert
    v-if="importState?.status === 'failed' && !detail"
    type="error"
    variant="tonal"
    class="mb-4"
    :text="importState.message ?? 'La importación falló.'"
  />

  <template v-if="detail">
    <page-header :title="detail.name" :subtitle="[detail.area, detail.code].filter(Boolean).join(' · ')">
      <template #actions>
        <v-btn v-if="canImport" color="primary" prepend-icon="mdi-cloud-download-outline" :loading="active" @click="load">
          Importar / actualizar
        </v-btn>
      </template>
    </page-header>

    <v-row>
      <v-col cols="12" md="4">
        <v-card height="100%">
          <v-card-text class="d-flex align-center ga-4">
            <v-avatar size="72" rounded="lg" color="grey-lighten-3">
              <v-img v-if="detail.emblem" :src="detail.emblem" contain />
              <v-icon v-else icon="mdi-trophy" size="36" />
            </v-avatar>
            <div>
              <div class="text-body-2 text-medium-emphasis">Tipo</div>
              <div class="font-weight-medium">{{ detail.type ?? '—' }}</div>
              <div class="text-caption text-medium-emphasis mt-2">Lista actualizada: {{ formatDate(detail.synced_at) }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card height="100%" title="Estado de la importación">
          <v-card-text>
            <div v-if="importState" class="d-flex flex-wrap align-center ga-3">
              <import-status-chip :status="importState.status" />
              <span v-if="importState.status === 'waiting_rate_limit'" class="text-body-2">
                Se alcanzó el límite de 10 peticiones por minuto de football-data. Reintento automático
                <template v-if="importState.retry_after_seconds">en ~{{ importState.retry_after_seconds }} s</template>.
              </span>
              <span v-else-if="importState.status === 'failed'" class="text-body-2 text-error">{{ importState.message }}</span>
              <span v-else-if="importState.finished_at" class="text-body-2">Terminó: {{ formatDate(importState.finished_at) }}</span>
            </div>
            <p v-else class="text-body-2 text-medium-emphasis">
              {{ canImport ? 'Esta liga aún no se ha importado.' : 'Tu rol es de solo consulta: se muestran los datos ya guardados.' }}
            </p>
            <v-progress-linear v-if="active" indeterminate class="mt-4" color="primary" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6">
        <v-card :to="auth.can('teams.view') ? { name: 'teams', query: { competition_id: detail.id } } : undefined">
          <v-card-text class="d-flex align-center ga-4">
            <v-icon icon="mdi-shield-half-full" size="40" color="primary" />
            <div>
              <div class="text-h5 font-weight-bold">{{ detail.teams_count }}</div>
              <div class="text-body-2 text-medium-emphasis">Equipos guardados</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6">
        <v-card :to="auth.can('players.view') ? { name: 'players', query: { competition_id: detail.id } } : undefined">
          <v-card-text class="d-flex align-center ga-4">
            <v-icon icon="mdi-account-group" size="40" color="primary" />
            <div>
              <div class="text-h5 font-weight-bold">{{ detail.players_count }}</div>
              <div class="text-body-2 text-medium-emphasis">Jugadores guardados</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </template>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { adminApi } from '@/api/admin'
import { toMessage } from '@/api/errors'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorAlert from '@/components/ErrorAlert.vue'
import PageHeader from '@/components/PageHeader.vue'
import SearchField from '@/components/SearchField.vue'
import UserFormDialog from '@/components/UserFormDialog.vue'
import { usePagedList } from '@/composables/usePagedList'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import type { Role, User } from '@/types/api'
import { formatDate } from '@/utils/format'

const auth = useAuthStore()
const notify = useNotificationsStore()

const search = ref('')
const roles = ref<Role[]>([])
const formOpen = ref(false)
const editing = ref<User | null>(null)
const toggling = ref<User | null>(null)
const confirmOpen = ref(false)
const busy = ref(false)

const list = usePagedList<User>((page) => adminApi.users({ page, per_page: 15, search: search.value }))

watch(search, () => list.reset())

function openForm(user: User | null): void {
  editing.value = user
  formOpen.value = true
}

function askToggle(user: User): void {
  toggling.value = user
  if (user.is_active) confirmOpen.value = true
  else void applyToggle() // activar no necesita confirmación
}

async function applyToggle(): Promise<void> {
  const user = toggling.value
  if (!user) return
  busy.value = true
  try {
    await adminApi.setUserActive(user.id, !user.is_active)
    notify.success(user.is_active ? 'Usuario desactivado.' : 'Usuario activado.')
    confirmOpen.value = false
    await list.load()
  } catch (e) {
    notify.error(toMessage(e))
    confirmOpen.value = false
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  void list.load()
  try {
    roles.value = await adminApi.roles()
  } catch (e) {
    notify.error(toMessage(e))
  }
})
</script>

<template>
  <page-header title="Usuarios" subtitle="Crea usuarios, asigna roles y desactiva cuentas">
    <template #actions>
      <v-btn color="primary" prepend-icon="mdi-account-plus" @click="openForm(null)">Nuevo usuario</v-btn>
    </template>
  </page-header>

  <search-field v-model="search" label="Buscar por nombre o correo" class="mb-4" />
  <error-alert v-if="list.error.value" :message="list.error.value" @retry="list.load" />
  <v-progress-linear v-if="list.loading.value" indeterminate color="primary" class="mb-2" />

  <empty-state
    v-if="!list.loading.value && !list.error.value && !list.items.value.length"
    icon="mdi-account-search-outline"
    title="No se encontraron usuarios"
  />

  <v-card v-else>
    <v-table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Roles</th>
          <th>Estado</th>
          <th class="d-none d-md-table-cell">Último acceso</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in list.items.value" :key="u.id">
          <td>
            <div class="font-weight-medium">{{ u.name }}</div>
            <div class="text-caption text-medium-emphasis">{{ u.email }}</div>
          </td>
          <td>
            <v-chip v-for="r in u.roles" :key="r" size="small" class="mr-1" color="primary" variant="tonal">{{ r }}</v-chip>
            <span v-if="!u.roles.length" class="text-medium-emphasis">Sin rol</span>
          </td>
          <td>
            <v-chip size="small" :color="u.is_active ? 'success' : 'grey'" variant="tonal" label>
              {{ u.is_active ? 'Activo' : 'Desactivado' }}
            </v-chip>
          </td>
          <td class="d-none d-md-table-cell">{{ formatDate(u.last_login_at) }}</td>
          <td class="text-right text-no-wrap">
            <v-btn icon="mdi-pencil" size="small" variant="text" title="Editar" @click="openForm(u)" />
            <v-btn
              :icon="u.is_active ? 'mdi-account-off' : 'mdi-account-check'"
              size="small"
              variant="text"
              :title="u.is_active ? 'Desactivar' : 'Activar'"
              :disabled="u.id === auth.user?.id"
              @click="askToggle(u)"
            />
          </td>
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

  <user-form-dialog v-model="formOpen" :user="editing" :roles="roles" @saved="list.load" />
  <confirm-dialog
    v-model="confirmOpen"
    title="Desactivar usuario"
    :text="`¿Desactivar a ${toggling?.name}? Su sesión actual se cerrará y no podrá volver a ingresar.`"
    confirm-label="Desactivar"
    :loading="busy"
    @confirm="applyToggle"
  />
</template>

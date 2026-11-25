<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { adminApi } from '@/api/admin'
import { ApiError, toMessage } from '@/api/errors'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorAlert from '@/components/ErrorAlert.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useNotificationsStore } from '@/stores/notifications'
import type { Permission, Role } from '@/types/api'
import { permissionLabel } from '@/utils/permissions'

const PROTECTED = 'Admin'
const notify = useNotificationsStore()

const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Selección editable por rol (id -> permisos marcados)
const draft = reactive<Record<number, string[]>>({})
const saving = ref<number | null>(null)

const createOpen = ref(false)
const newName = ref('')
const newPermissions = ref<string[]>([])
const createError = ref<string | null>(null)
const creating = ref(false)

const deleting = ref<Role | null>(null)
const deleteOpen = ref(false)
const deletingBusy = ref(false)

const dirty = computed(() => (role: Role) => {
  const a = [...(draft[role.id] ?? [])].sort().join('|')
  const b = [...role.permissions].sort().join('|')
  return a !== b
})

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const [r, p] = await Promise.all([adminApi.roles(), adminApi.permissions()])
    roles.value = r
    permissions.value = p
    r.forEach((role) => (draft[role.id] = [...role.permissions]))
  } catch (e) {
    error.value = toMessage(e)
  } finally {
    loading.value = false
  }
}

async function saveRole(role: Role): Promise<void> {
  saving.value = role.id
  try {
    const updated = await adminApi.updateRole(role.id, { permissions: draft[role.id] })
    Object.assign(role, updated)
    draft[role.id] = [...updated.permissions]
    notify.success(`Permisos de ${role.name} actualizados.`)
  } catch (e) {
    notify.error(toMessage(e))
  } finally {
    saving.value = null
  }
}

async function createRole(): Promise<void> {
  creating.value = true
  createError.value = null
  try {
    await adminApi.createRole({ name: newName.value.trim(), permissions: newPermissions.value })
    createOpen.value = false
    newName.value = ''
    newPermissions.value = []
    notify.success('Rol creado.')
    await load()
  } catch (e) {
    createError.value = e instanceof ApiError ? (Object.values(e.fieldErrors).flat()[0] ?? e.userMessage) : toMessage(e)
  } finally {
    creating.value = false
  }
}

function askDelete(role: Role): void {
  deleting.value = role
  deleteOpen.value = true
}

async function confirmDelete(): Promise<void> {
  if (!deleting.value) return
  deletingBusy.value = true
  try {
    await adminApi.deleteRole(deleting.value.id)
    notify.success('Rol eliminado.')
    deleteOpen.value = false
    await load()
  } catch (e) {
    notify.error(e instanceof ApiError ? (Object.values(e.fieldErrors).flat()[0] ?? e.userMessage) : toMessage(e))
    deleteOpen.value = false
  } finally {
    deletingBusy.value = false
  }
}

onMounted(() => void load())
</script>

<template>
  <page-header title="Roles y permisos" subtitle="Define qué puede hacer cada rol. La API aplica estos permisos en cada petición.">
    <template #actions>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="createOpen = true">Nuevo rol</v-btn>
    </template>
  </page-header>

  <error-alert v-if="error" :message="error" @retry="load" />
  <v-progress-linear v-if="loading" indeterminate color="primary" />

  <empty-state v-if="!loading && !error && !roles.length" icon="mdi-shield-off-outline" title="No hay roles" />

  <v-row>
    <v-col v-for="role in roles" :key="role.id" cols="12" md="6" xl="4">
      <v-card height="100%">
        <v-card-item>
          <v-card-title>{{ role.name }}</v-card-title>
          <v-card-subtitle>{{ role.users_count }} usuario(s)</v-card-subtitle>
          <template #append>
            <v-chip v-if="role.name === PROTECTED" size="small" label color="secondary" variant="tonal">Protegido</v-chip>
            <v-btn
              v-else
              icon="mdi-delete-outline"
              size="small"
              variant="text"
              title="Eliminar rol"
              @click="askDelete(role)"
            />
          </template>
        </v-card-item>
        <v-card-text>
          <v-checkbox
            v-for="p in permissions"
            :key="p.id"
            v-model="draft[role.id]"
            :value="p.name"
            :label="permissionLabel(p.name)"
            :disabled="role.name === PROTECTED"
            density="compact"
            hide-details
            color="primary"
          />
        </v-card-text>
        <v-card-actions v-if="role.name !== PROTECTED">
          <v-spacer />
          <v-btn color="primary" :disabled="!dirty(role)" :loading="saving === role.id" @click="saveRole(role)">
            Guardar cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>

  <v-dialog v-model="createOpen" max-width="460">
    <v-card title="Nuevo rol">
      <v-card-text>
        <v-alert v-if="createError" type="error" variant="tonal" class="mb-4" :text="createError" />
        <v-text-field v-model="newName" label="Nombre del rol" />
        <v-select
          v-model="newPermissions"
          :items="permissions.map((p) => ({ value: p.name, title: permissionLabel(p.name) }))"
          label="Permisos"
          multiple
          chips
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="createOpen = false">Cancelar</v-btn>
        <v-btn color="primary" :loading="creating" :disabled="!newName.trim()" @click="createRole">Crear</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <confirm-dialog
    v-model="deleteOpen"
    title="Eliminar rol"
    :text="`¿Eliminar el rol ${deleting?.name}? Solo es posible si no tiene usuarios asignados.`"
    confirm-label="Eliminar"
    :loading="deletingBusy"
    @confirm="confirmDelete"
  />
</template>

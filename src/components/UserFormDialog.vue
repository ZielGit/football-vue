<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { adminApi } from '@/api/admin'
import { ApiError, toMessage } from '@/api/errors'
import type { Role, User } from '@/types/api'

const props = defineProps<{ user: User | null; roles: Role[] }>()
const open = defineModel<boolean>({ required: true })
const emit = defineEmits<{ saved: [user: User] }>()

const isEdit = computed(() => props.user !== null)
const form = reactive({ name: '', email: '', password: '', is_active: true, roles: [] as string[] })
const showPassword = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const fieldErrors = ref<Record<string, string[]>>({})

watch(open, (value) => {
  if (!value) return
  error.value = null
  fieldErrors.value = {}
  form.name = props.user?.name ?? ''
  form.email = props.user?.email ?? ''
  form.password = ''
  form.is_active = props.user?.is_active ?? true
  form.roles = [...(props.user?.roles ?? [])]
})

async function save(): Promise<void> {
  saving.value = true
  error.value = null
  fieldErrors.value = {}
  try {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      is_active: form.is_active,
      roles: form.roles,
      ...(form.password ? { password: form.password } : {}),
    }
    const saved = props.user
      ? await adminApi.updateUser(props.user.id, payload)
      : await adminApi.createUser({ ...payload, password: form.password })
    emit('saved', saved)
    open.value = false
  } catch (e) {
    if (e instanceof ApiError) fieldErrors.value = e.fieldErrors
    error.value = toMessage(e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-dialog v-model="open" max-width="520" scrollable>
    <v-card :title="isEdit ? 'Editar usuario' : 'Nuevo usuario'">
      <v-card-text>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />
        <v-text-field v-model="form.name" label="Nombre" :error-messages="fieldErrors.name" />
        <v-text-field v-model="form.email" label="Correo" type="email" :error-messages="fieldErrors.email" />
        <v-text-field
          v-model="form.password"
          :label="isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          hint="Mínimo 8 caracteres, con letras y números"
          persistent-hint
          autocomplete="new-password"
          :error-messages="fieldErrors.password"
          @click:append-inner="showPassword = !showPassword"
        />
        <v-select
          v-model="form.roles"
          :items="roles.map((r) => r.name)"
          label="Roles"
          multiple
          chips
          class="mt-4"
          :error-messages="fieldErrors.roles"
        />
        <v-switch v-model="form.is_active" label="Cuenta activa" color="primary" hide-details />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" :disabled="saving" @click="open = false">Cancelar</v-btn>
        <v-btn color="primary" :loading="saving" @click="save">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiError, toMessage } from '@/api/errors'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({ email: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const fieldErrors = ref<Record<string, string[]>>({})

async function submit(): Promise<void> {
  loading.value = true
  error.value = null
  fieldErrors.value = {}
  try {
    await auth.login(form.email.trim(), form.password)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
    await router.push(redirect ?? { name: 'home' })
  } catch (e) {
    if (e instanceof ApiError && e.fieldErrors) fieldErrors.value = e.fieldErrors
    error.value = toMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-main class="d-flex align-center justify-center" style="min-height: 100vh">
    <v-card width="100%" max-width="420" class="pa-2 mx-4" elevation="4">
      <v-card-item>
        <div class="d-flex align-center ga-2 mb-1">
          <v-icon icon="mdi-soccer" color="primary" size="32" />
          <span class="text-h5 font-weight-bold">Football</span>
        </div>
        <v-card-subtitle class="px-0">Inicia sesión para continuar</v-card-subtitle>
      </v-card-item>

      <v-card-text>
        <v-alert
          v-if="route.query.reason === 'expired'"
          type="warning"
          variant="tonal"
          class="mb-4"
          text="Tu sesión venció. Inicia sesión nuevamente."
        />
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />

        <v-text-field
          v-model="form.email"
          label="Correo"
          type="email"
          autocomplete="username"
          prepend-inner-icon="mdi-email-outline"
          :error-messages="fieldErrors.email"
          @keyup.enter="submit"
        />
        <v-text-field
          v-model="form.password"
          label="Contraseña"
          autocomplete="current-password"
          prepend-inner-icon="mdi-lock-outline"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          :error-messages="fieldErrors.password"
          @click:append-inner="showPassword = !showPassword"
          @keyup.enter="submit"
        />
        <v-btn block size="large" color="primary" :loading="loading" :disabled="!form.email || !form.password" @click="submit">
          Ingresar
        </v-btn>
      </v-card-text>
    </v-card>
  </v-main>
</template>

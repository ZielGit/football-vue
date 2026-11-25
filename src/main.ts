import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

import { vCan } from './directives/can'
import { setUnauthorizedHandler } from './api/http'
import { useAuthStore } from './stores/auth'
import { useNotificationsStore } from './stores/notifications'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia).use(router).use(vuetify)
app.directive('can', vCan)

// Sesión vencida (401 en cualquier llamada): limpiar, avisar con claridad y volver al login.
setUnauthorizedHandler(() => {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) return
  auth.clear()
  useNotificationsStore().warning('Tu sesión venció. Inicia sesión nuevamente.')
  void router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
})

app.mount('#app')

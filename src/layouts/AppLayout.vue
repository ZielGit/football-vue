<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import { routes } from '@/router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const { lgAndUp } = useDisplay()
const drawer = ref(lgAndUp.value)

interface NavItem {
  name: string
  title: string
  icon: string
  group: 'football' | 'admin'
}

// Menú construido desde las rutas: cada persona ve solo lo que su rol permite.
const items = computed<NavItem[]>(() => {
  const list: NavItem[] = []
  for (const child of routes.find((r) => r.path === '/')?.children ?? []) {
    const nav = child.meta?.nav
    const permission = child.meta?.permission
    if (!nav || typeof child.name !== 'string') continue
    const allowed = !permission || (Array.isArray(permission) ? auth.canAny(permission) : auth.can(permission))
    if (allowed) list.push({ name: child.name, ...nav })
  }
  return list
})

const football = computed(() => items.value.filter((i) => i.group === 'football'))
const admin = computed(() => items.value.filter((i) => i.group === 'admin'))

async function logout(): Promise<void> {
  await auth.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <v-navigation-drawer v-model="drawer" :permanent="lgAndUp" :temporary="!lgAndUp" color="primary">
    <v-list-item class="py-4" title="Football" subtitle="Plataforma interna" prepend-icon="mdi-soccer" />
    <v-divider />
    <v-list nav density="comfortable">
      <v-list-item
        v-for="item in football"
        :key="item.name"
        :to="{ name: item.name }"
        :prepend-icon="item.icon"
        :title="item.title"
        rounded="lg"
        @click="drawer = lgAndUp"
      />
      <template v-if="admin.length">
        <v-list-subheader class="mt-2">ADMINISTRACIÓN</v-list-subheader>
        <v-list-item
          v-for="item in admin"
          :key="item.name"
          :to="{ name: item.name }"
          :prepend-icon="item.icon"
          :title="item.title"
          rounded="lg"
          @click="drawer = lgAndUp"
        />
      </template>
    </v-list>
  </v-navigation-drawer>

  <v-app-bar flat border>
    <v-app-bar-nav-icon v-if="!lgAndUp" @click="drawer = !drawer" />
    <v-spacer />
    <v-menu>
      <template #activator="{ props }">
        <v-btn v-bind="props" variant="text" prepend-icon="mdi-account-circle" class="text-none">
          <span class="d-none d-sm-inline">{{ auth.user?.name }}</span>
        </v-btn>
      </template>
      <v-card min-width="240">
        <v-card-text>
          <div class="font-weight-bold">{{ auth.user?.name }}</div>
          <div class="text-caption text-medium-emphasis">{{ auth.user?.email }}</div>
          <div class="mt-2">
            <v-chip v-for="role in auth.user?.roles" :key="role" size="small" class="mr-1" color="primary" variant="tonal">
              {{ role }}
            </v-chip>
          </div>
        </v-card-text>
        <v-divider />
        <v-list density="compact">
          <v-list-item prepend-icon="mdi-logout" title="Cerrar sesión" @click="logout" />
        </v-list>
      </v-card>
    </v-menu>
  </v-app-bar>

  <v-main>
    <v-container fluid class="pa-4 pa-md-6">
      <router-view />
    </v-container>
  </v-main>
</template>

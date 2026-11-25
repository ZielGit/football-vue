import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    permission?: string | string[]
    nav?: { title: string; icon: string; group: 'football' | 'admin' }
  }
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    children: [
      { path: '', name: 'home', redirect: () => ({ name: 'competitions' }) },
      {
        path: 'competitions',
        name: 'competitions',
        component: () => import('@/views/CompetitionsView.vue'),
        meta: {
          permission: 'competitions.view',
          nav: { title: 'Competiciones', icon: 'mdi-trophy', group: 'football' },
        },
      },
      {
        path: 'competitions/:id(\\d+)',
        name: 'competition',
        component: () => import('@/views/CompetitionDetailView.vue'),
        meta: { permission: 'competitions.view' },
      },
      {
        path: 'teams',
        name: 'teams',
        component: () => import('@/views/TeamsView.vue'),
        meta: {
          permission: 'teams.view',
          nav: { title: 'Equipos', icon: 'mdi-shield-half-full', group: 'football' },
        },
      },
      {
        path: 'teams/:id(\\d+)',
        name: 'team',
        component: () => import('@/views/TeamDetailView.vue'),
        meta: { permission: 'teams.view' },
      },
      {
        path: 'players',
        name: 'players',
        component: () => import('@/views/PlayersView.vue'),
        meta: {
          permission: 'players.view',
          nav: { title: 'Jugadores', icon: 'mdi-account-group', group: 'football' },
        },
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/UsersView.vue'),
        meta: {
          permission: 'users.manage',
          nav: { title: 'Usuarios', icon: 'mdi-account-cog', group: 'admin' },
        },
      },
      {
        path: 'roles',
        name: 'roles',
        component: () => import('@/views/RolesView.vue'),
        meta: {
          permission: 'roles.manage',
          nav: { title: 'Roles y permisos', icon: 'mdi-shield-key', group: 'admin' },
        },
      },
      {
        path: 'forbidden',
        name: 'forbidden',
        component: () => import('@/views/ForbiddenView.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { public: true },
  },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.restore()

  if (to.meta.public) {
    if (to.name === 'login' && auth.isAuthenticated) return { name: 'home' }
    return true
  }

  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  const required = to.meta.permission
  if (required) {
    const allowed = Array.isArray(required) ? auth.canAny(required) : auth.can(required)
    if (!allowed) return { name: 'forbidden' }
  }

  return true
})

export default router

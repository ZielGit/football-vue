# football-vue · SPA (Vue 3 + Vuetify + Pinia + TypeScript)

Frontend de la prueba técnica. Consume la API de **[football-laravel](../football-laravel)** (el README de ese repositorio explica cómo levantar todo con un solo `docker compose up`).

## Ejecutarlo

**Con Docker:** se construye y sirve desde el `compose.yml` de `football-laravel` (http://localhost:8080).

**En local (desarrollo):**

```bash
cp .env.example .env      # VITE_API_URL=http://localhost:8000/api
npm install
npm run dev               # http://localhost:5173
npm run build             # chequeo de tipos + build de producción
```

Requiere Node 20.19+ (probado con Node 22). La API debe estar en marcha y permitir el origen de la SPA (`CORS_ALLOWED_ORIGINS`).

Usuarios de prueba: `admin@football.test / Admin123!`, `editor@football.test / Editor123!`, `viewer@football.test / Viewer123!`.

## Qué incluye

| Requisito                               | Dónde                                                                                                                                                           |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1 · SPA Vue 3 + Vue Router, responsive | `src/router`, `src/layouts/AppLayout.vue` (menú lateral en escritorio, cajón en móvil; tarjetas y tablas que se adaptan)                                        |
| F2 · Login y sesión vencida             | `src/views/LoginView.vue`; un 401 en cualquier llamada limpia la sesión y vuelve al login con aviso (`src/main.ts`, `src/api/http.ts`)                          |
| F3 · Ligas, equipos y jugadores         | `CompetitionsView`, `CompetitionDetailView` (importar y ver el avance), `TeamsView`, `TeamDetailView`, `PlayersView`                                            |
| F4 · Usuarios, roles y permisos         | `UsersView` + `UserFormDialog`, `RolesView`; menú y rutas según permisos                                                                                        |
| F5 · Experiencia de uso                 | Carga, listas vacías, errores con _Reintentar_, búsqueda con _debounce_, filtros, paginación, avisos claros para el límite de football-data (429) y caída (503) |

## Decisiones

- **Permisos en JS puro (sin CASL):** `GET /me` entrega `permissions`; el _store_ de sesión expone `can()`/`canAny()`, la directiva `v-can` y el _guard_ del router usan `meta.permission`. Es solo UX: el servidor decide siempre (403).
- **Importar una liga** es asíncrono: la SPA consulta `import-status` cada 3 s mostrando el estado (en cola, importando, esperando cupo, importada, fallida).
- **Errores normalizados:** `ApiError` (`src/api/errors.ts`) traduce el formato de error de la API a mensajes entendibles; las vistas nunca manejan errores de Axios.
- **Reutilización:** `usePagedList` (listas paginadas), `PageHeader`, `EmptyState`, `ErrorAlert`, `ConfirmDialog`, `SearchField`, `ImportStatusChip`.
- **Versiones:** Vue 3.5, Vue Router 4, Pinia 3, **Vuetify 3** (acordado), Vite 7, TypeScript 5.9.

## CI

`.github/workflows/ci.yml`: `npm ci`, chequeo de tipos (`vue-tsc`) y build de producción.

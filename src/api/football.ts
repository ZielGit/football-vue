import { http } from './http'
import type {
  Competition,
  CompetitionDetail,
  LeagueImport,
  PageMeta,
  Paginated,
  Player,
  Team,
  TeamDetail,
} from '@/types/api'

export interface CompetitionList {
  items: Competition[]
  lastSyncedAt: string | null
  refreshing: boolean
}

export interface CompetitionResult {
  /** null cuando la liga todavía se está importando por primera vez (HTTP 202). */
  detail: CompetitionDetail | null
  import: LeagueImport | null
}

export interface TeamFilters {
  page?: number
  per_page?: number
  search?: string
  competition_id?: number | null
}

export interface PlayerFilters extends TeamFilters {
  team_id?: number | null
  position?: string | null
}

function clean<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== ''),
  ) as Partial<T>
}

export const footballApi = {
  async competitions(): Promise<CompetitionList> {
    const { data } = await http.get<{
      data: Competition[]
      meta: { last_synced_at: string | null; refreshing: boolean }
    }>('/competitions')
    return { items: data.data, lastSyncedAt: data.meta.last_synced_at, refreshing: data.meta.refreshing }
  },

  /** GET /competitions/{id}: devuelve lo guardado y (si el rol puede) encola la importación. */
  async competition(id: number): Promise<CompetitionResult> {
    const response = await http.get<{
      data: CompetitionDetail | null
      meta?: { import: LeagueImport }
    }>(`/competitions/${id}`)

    if (response.data.data === null) {
      return { detail: null, import: response.data.meta?.import ?? null }
    }
    return { detail: response.data.data, import: response.data.data.import }
  },

  async importStatus(id: number): Promise<LeagueImport | null> {
    const { data } = await http.get<{ data: LeagueImport | null }>(`/competitions/${id}/import-status`)
    return data.data
  },

  async teams(filters: TeamFilters): Promise<Paginated<Team>> {
    const { data } = await http.get<{ data: Team[]; meta: PageMeta }>('/team', { params: clean(filters) })
    return { items: data.data, meta: data.meta }
  },

  async team(id: number): Promise<TeamDetail> {
    const { data } = await http.get<{ data: TeamDetail }>(`/team/${id}`)
    return data.data
  },

  async players(filters: PlayerFilters): Promise<Paginated<Player>> {
    const { data } = await http.get<{ data: Player[]; meta: PageMeta }>('/players', { params: clean(filters) })
    return { items: data.data, meta: data.meta }
  },
}

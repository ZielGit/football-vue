export interface Me {
  id: number
  name: string
  email: string
  is_active: boolean
  roles: string[]
  permissions: string[]
  abilities: { action: string; subject: string }[]
}

export interface LoginResponse {
  token_type: string
  access_token: string
  expires_at: string | null
  user: Me
}

export interface Competition {
  id: number
  name: string
  code: string | null
  type: string | null
  area: string | null
  emblem: string | null
  synced_at: string | null
}

export type ImportStatusValue = 'queued' | 'running' | 'waiting_rate_limit' | 'completed' | 'failed'

export interface LeagueImport {
  competition_id: number
  status: ImportStatusValue
  active: boolean
  message: string | null
  retry_after_seconds: number | null
  teams_imported: number | null
  players_imported: number | null
  updated_at: string
  finished_at: string | null
}

export interface CompetitionDetail extends Competition {
  teams_count: number
  players_count: number
  import: LeagueImport | null
}

export interface Team {
  id: number
  name: string
  short_name: string | null
  tla: string | null
  crest: string | null
  address: string | null
  website: string | null
  founded: number | null
  club_colors: string | null
  venue: string | null
}

export interface Player {
  id: number
  name: string
  position: string | null
  shirt_number: number | null
  date_of_birth: string | null
  nationality: string | null
  team_id: number
  team_name: string | null
}

export interface TeamDetail extends Team {
  competitions: Competition[]
  players: Player[]
}

export interface PageMeta {
  page: number
  per_page: number
  total: number
  last_page: number
}

export interface Paginated<T> {
  items: T[]
  meta: PageMeta
}

export interface User {
  id: number
  name: string
  email: string
  is_active: boolean
  roles: string[]
  last_login_at: string | null
  created_at: string | null
}

export interface UserPayload {
  name: string
  email: string
  password?: string | null
  is_active: boolean
  roles: string[]
}

export interface Role {
  id: number
  name: string
  permissions: string[]
  users_count: number
}

export interface Permission {
  id: number
  name: string
}

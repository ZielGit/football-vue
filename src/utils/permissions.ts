const LABELS: Record<string, string> = {
  'competitions.view': 'Ver competiciones',
  'competitions.import': 'Importar ligas',
  'teams.view': 'Ver equipos',
  'players.view': 'Ver jugadores',
  'users.manage': 'Gestionar usuarios',
  'roles.manage': 'Gestionar roles y permisos',
}

export function permissionLabel(name: string): string {
  return LABELS[name] ?? name
}

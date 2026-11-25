export function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function formatDay(value: string | null): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

const POSITIONS: Record<string, string> = {
  Goalkeeper: 'Portero',
  Defence: 'Defensa',
  Midfield: 'Mediocampista',
  Offence: 'Delantero',
}

export function positionLabel(position: string | null): string {
  if (!position) return '—'
  return POSITIONS[position] ?? position
}

export const POSITION_OPTIONS = Object.entries(POSITIONS).map(([value, title]) => ({ value, title }))

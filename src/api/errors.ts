export interface ApiErrorBody {
  error: { code: string; message: string; details?: Record<string, unknown> }
}

/** Error normalizado de la API: la UI solo trabaja con esto, nunca con AxiosError. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: Record<string, unknown> = {},
  ) {
    super(message)
    this.name = 'ApiError'
  }

  get retryAfter(): number | null {
    const value = this.details.retry_after
    return typeof value === 'number' ? value : null
  }

  get fieldErrors(): Record<string, string[]> {
    const fields = this.details.fields
    return fields && typeof fields === 'object' ? (fields as Record<string, string[]>) : {}
  }

  /** Mensaje entendible para la persona usuaria según el tipo de fallo. */
  get userMessage(): string {
    switch (this.code) {
      case 'EXTERNAL_RATE_LIMIT':
      case 'TOO_MANY_REQUESTS': {
        const wait = this.retryAfter ? ` Vuelve a intentarlo en ${this.retryAfter} s.` : ''
        return this.code === 'EXTERNAL_RATE_LIMIT'
          ? `Se alcanzó el límite de peticiones a football-data.org.${wait} Los datos ya guardados siguen disponibles.`
          : `Demasiadas peticiones seguidas.${wait}`
      }
      case 'EXTERNAL_SERVICE_UNAVAILABLE':
        return 'football-data.org no está disponible en este momento. Mostramos solo los datos ya guardados.'
      case 'FORBIDDEN':
        return 'No tienes permiso para realizar esta acción.'
      case 'UNAUTHENTICATED':
        return 'Tu sesión venció. Inicia sesión nuevamente.'
      case 'NETWORK_ERROR':
        return 'No se pudo conectar con el servidor. Revisa tu conexión o que la API esté en marcha.'
      default:
        return this.message
    }
  }
}

export function toMessage(error: unknown): string {
  if (error instanceof ApiError) return error.userMessage
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado.'
}

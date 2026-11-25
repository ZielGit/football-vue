import axios, { AxiosError } from 'axios'
import { ApiError, type ApiErrorBody } from './errors'

export const TOKEN_KEY = 'football.token'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { Accept: 'application/json' },
  timeout: 20000,
})

let onUnauthorized: (() => void) | null = null

/** El store de sesión registra aquí qué hacer cuando la API responde 401 (sesión vencida). */
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler
}

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (!error.response) {
      return Promise.reject(new ApiError(0, 'NETWORK_ERROR', 'Sin conexión con el servidor.'))
    }

    const { status, data } = error.response
    const apiError = new ApiError(
      status,
      data?.error?.code ?? 'HTTP_ERROR',
      data?.error?.message ?? 'Error inesperado del servidor.',
      data?.error?.details ?? {},
    )

    const isLogin = error.config?.url?.includes('/login')
    if (status === 401 && !isLogin) onUnauthorized?.()

    return Promise.reject(apiError)
  },
)

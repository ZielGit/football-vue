import { http } from './http'
import type { LoginResponse, Me } from '@/types/api'

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await http.post<{ data: LoginResponse }>('/login', { email, password })
    return data.data
  },
  async logout(): Promise<void> {
    await http.post('/logout')
  },
  async me(): Promise<Me> {
    const { data } = await http.get<{ data: Me }>('/me')
    return data.data
  },
}

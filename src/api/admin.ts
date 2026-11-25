import { http } from './http'
import type { PageMeta, Paginated, Permission, Role, User, UserPayload } from '@/types/api'

export const adminApi = {
  async users(params: { page?: number; per_page?: number; search?: string }): Promise<Paginated<User>> {
    const { data } = await http.get<{ data: User[]; meta: PageMeta }>('/users', { params })
    return { items: data.data, meta: data.meta }
  },
  async createUser(payload: UserPayload): Promise<User> {
    const { data } = await http.post<{ data: User }>('/users', payload)
    return data.data
  },
  async updateUser(id: number, payload: Partial<UserPayload>): Promise<User> {
    const { data } = await http.put<{ data: User }>(`/users/${id}`, payload)
    return data.data
  },
  async setUserActive(id: number, active: boolean): Promise<User> {
    const { data } = await http.patch<{ data: User }>(`/users/${id}/${active ? 'activate' : 'deactivate'}`)
    return data.data
  },
  async roles(): Promise<Role[]> {
    const { data } = await http.get<{ data: Role[] }>('/roles')
    return data.data
  },
  async permissions(): Promise<Permission[]> {
    const { data } = await http.get<{ data: Permission[] }>('/permissions')
    return data.data
  },
  async createRole(payload: { name: string; permissions: string[] }): Promise<Role> {
    const { data } = await http.post<{ data: Role }>('/roles', payload)
    return data.data
  },
  async updateRole(id: number, payload: { name?: string; permissions?: string[] }): Promise<Role> {
    const { data } = await http.put<{ data: Role }>(`/roles/${id}`, payload)
    return data.data
  },
  async deleteRole(id: number): Promise<void> {
    await http.delete(`/roles/${id}`)
  },
}

import { api } from './client'
import type { Token, UserRead } from '@/types'

export const authApi = {
  sendRegisterCode: (email: string) =>
    api.post<{ detail: string }>('/auth/register/code', { email }),

  register: (payload: { email: string; code: string; password: string; password_repeat: string }) =>
    api.post<UserRead>('/auth/register', payload),

  login: (email: string, password: string) => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    return api.post<Token>('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },

  refresh: (refresh_token: string) =>
    api.post<Token>('/auth/refresh', { refresh_token }),

  me: () => api.get<UserRead>('/auth/me'),

  sendPasswordReset: (email: string) =>
    api.post<{ detail: string }>('/auth/password/forgot', { email }),

  resetPassword: (payload: { email: string; code: string; new_password: string }) =>
    api.post<{ detail: string }>('/auth/password/reset', payload),
}

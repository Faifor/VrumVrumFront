import { create } from 'zustand'
import { authApi } from '@/api/auth.api'
import { tokenStorage } from '@/api/client'
import type { UserRead } from '@/types'

interface AuthState {
  me: UserRead | null
  isLoading: boolean
  isInitialized: boolean

  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  me: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    const token = tokenStorage.getAccess()
    if (!token) {
      set({ isInitialized: true })
      return
    }
    try {
      const { data } = await authApi.me()
      set({ me: data, isInitialized: true })
    } catch {
      tokenStorage.clear()
      set({ me: null, isInitialized: true })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data: tokens } = await authApi.login(email, password)
      tokenStorage.set(tokens.access_token, tokens.refresh_token)
      const { data: me } = await authApi.me()
      set({ me, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  logout: () => {
    tokenStorage.clear()
    set({ me: null })
  },

  refreshMe: async () => {
    const { data } = await authApi.me()
    set({ me: data })
  },
}))

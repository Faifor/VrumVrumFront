import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Token helpers ────────────────────────────────────────────────────────────

const TOKEN_KEY = 'vrum_access'
const REFRESH_KEY = 'vrum_refresh'

export const tokenStorage = {
  getAccess: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

// ─── Request interceptor — attach Bearer token ────────────────────────────────

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response interceptor — refresh on 401, human-readable errors ─────────────

let isRefreshing = false
let waitQueue: Array<(token: string) => void> = []

function processQueue(token: string) {
  waitQueue.forEach((cb) => cb(token))
  waitQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !original._retry) {
      const refreshToken = tokenStorage.getRefresh()

      if (!refreshToken) {
        tokenStorage.clear()
        window.dispatchEvent(new Event('vrum:logout'))
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          waitQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(api(original))
          })
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        })
        tokenStorage.set(data.access_token, data.refresh_token)
        processQueue(data.access_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch {
        tokenStorage.clear()
        window.dispatchEvent(new Event('vrum:logout'))
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

// ─── Error message extractor ──────────────────────────────────────────────────

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const detail = error.response?.data?.detail

    if (status === 403) return 'Недостаточно прав'
    if (status === 429) return 'Слишком много запросов. Подождите немного.'
    if (status === 404) return 'Объект не найден'

    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail.map((d: { msg: string }) => d.msg).join('; ')
    }
    if (status === 400) return 'Некорректный запрос'
    if (status === 500) return 'Ошибка сервера. Попробуйте позже.'
  }
  return 'Неизвестная ошибка'
}

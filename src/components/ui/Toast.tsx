import { create } from 'zustand'
import { useEffect } from 'react'
import clsx from 'clsx'

type ToastType = 'success' | 'error' | 'info'

interface Toast { id: number; message: string; type: ToastType }
interface ToastState {
  toasts: Toast[]
  add: (message: string, type?: ToastType) => void
  remove: (id: number) => void
}

let nextId = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (message, type = 'info') => {
    const id = ++nextId
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000)
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  success: (msg: string) => useToastStore.getState().add(msg, 'success'),
  error:   (msg: string) => useToastStore.getState().add(msg, 'error'),
  info:    (msg: string) => useToastStore.getState().add(msg, 'info'),
}

const typeConfig: Record<ToastType, { base: string; icon: React.ReactNode }> = {
  success: {
    base: 'bg-emerald-500 dark:bg-emerald-600',
    icon: (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    ),
  },
  error: {
    base: 'bg-red-500 dark:bg-red-600',
    icon: (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    ),
  },
  info: {
    base: 'bg-slate-800 dark:bg-slate-700',
    icon: (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
    ),
  },
}

export function ToastContainer() {
  const { toasts, remove } = useToastStore()
  return (
    <div className="fixed bottom-20 right-3 z-[200] flex flex-col gap-2 w-[calc(100%-1.5rem)] max-w-xs sm:bottom-5 sm:right-5 sm:w-80">
      {toasts.map((t) => {
        const cfg = typeConfig[t.type]
        return (
          <div
            key={t.id}
            className={clsx(
              'flex items-center gap-3 rounded-2xl pl-3 pr-4 py-3',
              'text-white shadow-xl animate-fade-up',
              cfg.base,
            )}
          >
            {cfg.icon}
            <span className="flex-1 text-sm font-medium leading-snug">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="opacity-50 hover:opacity-100 transition-opacity p-0.5"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function useAutoError(error: string | null) {
  useEffect(() => { if (error) toast.error(error) }, [error])
}

import { create } from 'zustand'
import { useEffect } from 'react'
import clsx from 'clsx'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

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
  error: (msg: string) => useToastStore.getState().add(msg, 'error'),
  info: (msg: string) => useToastStore.getState().add(msg, 'info'),
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-gray-800 text-white',
}

export function ToastContainer() {
  const { toasts, remove } = useToastStore()
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            'flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg',
            'animate-in slide-in-from-bottom-2 duration-200',
            typeStyles[t.type],
          )}
        >
          <span className="flex-1 text-sm leading-snug">{t.message}</span>
          <button onClick={() => remove(t.id)} className="mt-0.5 opacity-70 hover:opacity-100">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

// Hook for auto-removing error on unmount
export function useAutoError(error: string | null) {
  useEffect(() => {
    if (error) toast.error(error)
  }, [error])
}

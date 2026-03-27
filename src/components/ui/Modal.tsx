import { useEffect } from 'react'
import clsx from 'clsx'

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'sm:max-w-sm', md: 'sm:max-w-md', lg: 'sm:max-w-2xl' }

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: Props) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet / Dialog */}
      <div
        className={clsx(
          'relative z-10 w-full flex flex-col animate-fade-up',
          // Mobile: bottom sheet — only top corners rounded, sticks to bottom
          'rounded-t-3xl sm:rounded-2xl',
          'max-h-[92vh] sm:max-h-[85vh]',
          'bg-white dark:bg-slate-900',
          'border border-slate-200/80 dark:border-slate-700/60',
          'shadow-2xl',
          sizes[size],
        )}
      >
        {/* Drag handle — visible only on mobile */}
        <div className="flex-none flex justify-center pt-3 sm:hidden" aria-hidden>
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Header — fixed, never scrolls */}
        <div className="flex-none flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className={clsx(
              'p-2 -mr-1 rounded-xl transition-all duration-150',
              'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
              'hover:bg-slate-100 dark:hover:bg-slate-800',
              'active:scale-90',
            )}
            aria-label="Закрыть"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 py-5">
          {children}
          {/* Extra bottom padding for mobile home indicator */}
          <div className="h-4 sm:h-0" aria-hidden />
        </div>
      </div>
    </div>
  )
}

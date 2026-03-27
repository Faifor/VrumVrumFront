import clsx from 'clsx'
import { forwardRef } from 'react'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, hint, className, id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'block w-full rounded-xl border px-3.5 py-2.5 text-sm',
            'transition-all duration-200',
            'bg-white dark:bg-slate-800/80',
            'text-slate-900 dark:text-slate-100',
            'placeholder:text-slate-400 dark:placeholder:text-slate-600',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
            'dark:focus:ring-brand-400/40 dark:focus:border-brand-400',
            error
              ? 'border-red-400 dark:border-red-500/70 bg-red-50 dark:bg-red-950/20'
              : 'border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600',
            className,
          )}
          {...rest}
        />
        {error && (
          <p className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
            <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
export default Input

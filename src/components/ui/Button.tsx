import clsx from 'clsx'
import LoadingSpinner from './LoadingSpinner'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const variants: Record<string, string> = {
  primary: clsx(
    'relative overflow-hidden',
    'bg-gradient-to-r from-brand-500 to-brand-600',
    'text-white font-semibold',
    'shadow-[0_2px_12px_rgba(59,130,246,0.35)]',
    'hover:from-brand-600 hover:to-indigo-600',
    'hover:shadow-[0_4px_20px_rgba(59,130,246,0.5)]',
    'active:scale-[0.97] active:shadow-none',
    'focus:ring-2 focus:ring-brand-400 focus:ring-offset-2',
    'dark:focus:ring-offset-slate-900',
  ),
  secondary: clsx(
    'bg-white dark:bg-slate-800',
    'text-slate-700 dark:text-slate-200 font-medium',
    'border border-slate-200 dark:border-slate-700',
    'shadow-sm',
    'hover:bg-slate-50 dark:hover:bg-slate-700',
    'hover:border-slate-300 dark:hover:border-slate-600',
    'active:scale-[0.97]',
    'focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
    'dark:focus:ring-offset-slate-900',
  ),
  danger: clsx(
    'bg-gradient-to-r from-red-500 to-rose-500',
    'text-white font-semibold',
    'shadow-[0_2px_12px_rgba(239,68,68,0.3)]',
    'hover:from-red-600 hover:to-rose-600',
    'hover:shadow-[0_4px_20px_rgba(239,68,68,0.4)]',
    'active:scale-[0.97]',
    'focus:ring-2 focus:ring-red-400 focus:ring-offset-2',
    'dark:focus:ring-offset-slate-900',
  ),
  ghost: clsx(
    'text-brand-600 dark:text-brand-400 font-medium',
    'hover:bg-brand-50 dark:hover:bg-brand-500/10',
    'active:scale-[0.97]',
    'focus:ring-2 focus:ring-brand-400 focus:ring-offset-2',
    'dark:focus:ring-offset-slate-900',
  ),
  outline: clsx(
    'border border-brand-500 dark:border-brand-400',
    'text-brand-600 dark:text-brand-400 font-medium',
    'hover:bg-brand-50 dark:hover:bg-brand-500/10',
    'active:scale-[0.97]',
    'focus:ring-2 focus:ring-brand-400 focus:ring-offset-2',
    'dark:focus:ring-offset-slate-900',
  ),
}

const sizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg  gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl  gap-2',
  lg: 'px-5 py-3   text-base rounded-xl gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  children,
  className,
  ...rest
}: Props) {
  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center transition-all duration-150',
        'focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  )
}

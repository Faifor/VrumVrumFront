import clsx from 'clsx'

interface Props {
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-7 w-7 border-[3px]',
  lg: 'h-12 w-12 border-4',
}

export default function LoadingSpinner({ fullScreen, size = 'md' }: Props) {
  const spinner = (
    <div
      className={clsx(
        'animate-spin rounded-full',
        'border-brand-200 dark:border-brand-900/60',
        'border-t-brand-500 dark:border-t-brand-400',
        sizeMap[size],
      )}
    />
  )

  if (fullScreen) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-navy-900">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-4 border-brand-100 dark:border-brand-900/40" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-brand-500 dark:border-t-brand-400" />
          </div>
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Загрузка...</p>
        </div>
      </div>
    )
  }

  return spinner
}

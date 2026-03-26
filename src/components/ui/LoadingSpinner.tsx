import clsx from 'clsx'

interface Props {
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({ fullScreen, size = 'md' }: Props) {
  const sizeClass = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }[size]

  if (fullScreen) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className={clsx('animate-spin rounded-full border-4 border-brand-200 border-t-brand-500', sizeClass)} />
      </div>
    )
  }

  return (
    <div className={clsx('animate-spin rounded-full border-4 border-brand-200 border-t-brand-500', sizeClass)} />
  )
}

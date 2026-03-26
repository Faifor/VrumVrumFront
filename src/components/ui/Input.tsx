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
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
            error
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 bg-white',
            className,
          )}
          {...rest}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
export default Input

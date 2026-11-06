import type { ComponentProps } from 'react'

export type ButtonVariant = 'solid' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export function Button({
  variant = 'solid',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={['zx-button', className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-size={size}
      aria-busy={loading || props['aria-busy']}
      disabled={disabled || loading}
    >
      {loading && <span className="zx-button__spinner" aria-hidden="true" />}
      {children}
    </button>
  )
}

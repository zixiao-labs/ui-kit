import type { ComponentProps } from 'react'
import { EffectLayers, useSurfaceEffects } from './effects'
import type { ButtonEffects } from './effects'

export type ButtonVariant = 'solid' | 'tonal' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  effects?: ButtonEffects
}

export function Button({
  variant = 'solid',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className,
  children,
  effects,
  ref,
  ...props
}: ButtonProps) {
  const effectProps = useSurfaceEffects(effects, ref, disabled || loading)
  return (
    <button
      {...props}
      {...effectProps}
      type={type}
      className={['zx-button', className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-size={size}
      aria-busy={loading || props['aria-busy']}
      disabled={disabled || loading}
    >
      <EffectLayers effects={effects} />
      {loading && <span className="zx-button__spinner" aria-hidden="true" />}
      {children}
    </button>
  )
}

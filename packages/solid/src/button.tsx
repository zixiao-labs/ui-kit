import { Show, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { cx } from './utils'

export type ButtonVariant = 'solid' | 'tonal' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'
export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, [
    'class',
    'children',
    'variant',
    'size',
    'loading',
    'disabled',
    'type',
  ])
  return (
    <button
      {...rest}
      type={local.type ?? 'button'}
      class={cx('zx-button', local.class)}
      data-variant={local.variant ?? 'solid'}
      data-size={local.size ?? 'md'}
      disabled={local.disabled || local.loading}
      aria-busy={local.loading || rest['aria-busy']}
    >
      <Show when={local.loading}>
        <span class="zx-button__spinner" aria-hidden="true" />
      </Show>
      {local.children}
    </button>
  )
}

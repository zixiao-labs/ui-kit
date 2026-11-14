import { createUniqueId, Show, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { patternTraces } from '../../react/src/optional/pattern-traces'
import { cx } from './utils'

export type BackgroundPattern = 'hui' | 'yunlei' | 'lei'
export interface PatternBackgroundProps extends JSX.HTMLAttributes<HTMLDivElement> {
  pattern?: BackgroundPattern
}
export function PatternBackground(props: PatternBackgroundProps) {
  const [local, rest] = splitProps(props, ['class', 'children', 'pattern'])
  const id = `zx-pattern-${createUniqueId()}`
  const motif = () => (local.pattern ? patternTraces[local.pattern] : undefined)
  return (
    <div {...rest} class={cx('zx-pattern-background', local.class)} data-zx-pattern={local.pattern}>
      <Show when={motif()}>
        {(trace) => {
          const scale = () => 48 / trace().height
          return (
            <svg class="zx-pattern-ink" width="100%" height="100%" aria-hidden="true">
              <defs>
                <pattern
                  id={id}
                  width={trace().width * scale()}
                  height="72"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={trace().path}
                    transform={`translate(0 12) scale(${scale()}) translate(${-trace().offsetX} 0)`}
                    fill="currentColor"
                    fill-rule="evenodd"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${id})`} />
            </svg>
          )
        }}
      </Show>
      {local.children}
    </div>
  )
}

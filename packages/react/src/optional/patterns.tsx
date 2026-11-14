import { useId } from 'react'
import type { ComponentProps } from 'react'
import { patternTraces } from './pattern-traces'

export type BackgroundPattern = 'hui' | 'yunlei' | 'lei'

export interface PatternBackgroundProps extends ComponentProps<'div'> {
  /** Omit to render a plain background without SVG or decoration. */
  pattern?: BackgroundPattern
}

/** Optional, non-interactive pattern beneath the caller's unchanged content. */
export function PatternBackground({
  pattern,
  className,
  children,
  ...props
}: PatternBackgroundProps) {
  const id = `zx-pattern-${useId().replace(/:/g, '')}`
  const motif = pattern ? patternTraces[pattern] : undefined
  const scale = motif ? 48 / motif.height : 1
  return (
    <div
      {...props}
      className={['zx-pattern-background', className].filter(Boolean).join(' ')}
      data-zx-pattern={pattern}
    >
      {motif && (
        <svg
          className="zx-pattern-ink"
          width="100%"
          height="100%"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <pattern id={id} width={motif.width * scale} height="72" patternUnits="userSpaceOnUse">
              <path
                d={motif.path}
                transform={`translate(0 12) scale(${scale}) translate(${-motif.offsetX} 0)`}
                fill="currentColor"
                fillRule="evenodd"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${id})`} />
        </svg>
      )}
      {children}
    </div>
  )
}

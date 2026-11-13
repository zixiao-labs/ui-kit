import { useId } from 'react'
import type { ComponentProps } from 'react'

export type BackgroundPattern = 'hui' | 'yunlei' | 'lei'

export interface PatternBackgroundProps extends ComponentProps<'div'> {
  /** Omit to render a plain background without SVG or decoration. */
  pattern?: BackgroundPattern
}

// Contemporary geometric interpretations, not archaeological reproductions.
// The endpoints meet at each tile boundary; cloud-and-thunder mixes square
// turns and rounded spirals on one continuous line.
const motifs = {
  hui: {
    width: 64,
    path: 'M0 56H48V8H8V40H32V24H24V32H16V16H40V56H64',
  },
  yunlei: {
    width: 128,
    path: 'M0 48H12Q20 48 20 40V24Q20 12 32 12H48Q60 12 60 24V36Q60 44 52 44H40Q32 44 32 36V32Q32 28 36 28H44V36H40 M60 36V48H76V8H112V40H88V24H104V32H96 M112 40V48H128',
  },
  lei: {
    width: 64,
    path: 'M0 40H12V8H52V24H36V56H20V24H12 M52 24V40H64',
  },
} as const

/** Optional, non-interactive pattern beneath the caller's unchanged content. */
export function PatternBackground({
  pattern,
  className,
  children,
  ...props
}: PatternBackgroundProps) {
  const id = `zx-pattern-${useId().replace(/:/g, '')}`
  const motif = pattern ? motifs[pattern] : undefined
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
            <pattern id={id} width={motif.width} height="72" patternUnits="userSpaceOnUse">
              <path
                d={motif.path}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
                strokeLinejoin={pattern === 'yunlei' ? 'round' : 'miter'}
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

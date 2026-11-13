import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { ComponentProps } from 'react'
import type LiquidGlass from 'liquid-glass-react'

export interface LiquidGlassSurfaceProps extends ComponentProps<'div'> {
  cornerRadius?: number
  displacementScale?: number
}

const still = { x: 0, y: 0 }

/**
 * Optional Liquid Glass React backend. Its DOM is decoration only: children
 * never remount when loading succeeds/fails or the displacement map resizes.
 * The upstream library reads navigator during render, so load after hydration.
 */
export function LiquidGlassSurface({
  children,
  className,
  style,
  ref,
  cornerRadius = 16,
  displacementScale = 32,
  ...props
}: LiquidGlassSurfaceProps) {
  const host = useRef<HTMLDivElement>(null)
  const [Engine, setEngine] = useState<typeof LiquidGlass | null>(null)
  const [failed, setFailed] = useState(false)
  const [size, setSize] = useState('')
  useImperativeHandle(ref, () => host.current!, [])
  useEffect(() => {
    let disposed = false
    void import('liquid-glass-react')
      .then(({ default: engine }) => {
        if (!disposed) setEngine(() => engine)
      })
      .catch(() => {
        if (!disposed) setFailed(true)
      })
    return () => {
      disposed = true
    }
  }, [])
  useEffect(() => {
    const node = host.current
    if (!node) return
    const observer = new ResizeObserver(() => {
      setSize(`${node.offsetWidth}:${node.offsetHeight}`)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return (
    <div
      {...props}
      ref={host}
      className={['zx-liquid-glass', className].filter(Boolean).join(' ')}
      style={{ borderRadius: cornerRadius, ...style }}
      data-zx-liquid-glass={Engine ? 'ready' : failed ? 'fallback' : 'loading'}
    >
      <div className="zx-liquid-glass-layer" aria-hidden="true">
        {Engine && (
          <Engine
            key={size}
            className="zx-liquid-glass-engine"
            cornerRadius={cornerRadius}
            displacementScale={displacementScale}
            elasticity={0}
            saturation={100}
            aberrationIntensity={0}
            globalMousePos={still}
            mouseOffset={still}
            padding="0"
            style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '100%' }}
          >
            <span />
          </Engine>
        )}
      </div>
      <div className="zx-liquid-glass-content">{children}</div>
    </div>
  )
}

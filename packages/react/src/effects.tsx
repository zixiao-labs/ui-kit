import { useEffect, useId, useImperativeHandle, useRef } from 'react'
import type { Ref } from 'react'

/** Decorative effects are independent of the component's semantic variant. */
export interface SurfaceEffects {
  shadow?: 'gpu'
  tilt?: boolean
  backlight?: boolean
  glass?: boolean
}

/** Small action targets stay still; tilt belongs on larger content surfaces. */
export type ButtonEffects = Omit<SurfaceEffects, 'tilt'>

function attachTilt(node: HTMLElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const fine = matchMedia('(hover: hover) and (pointer: fine)')
  let frame = 0
  let clientX = 0
  let clientY = 0
  function reset() {
    cancelAnimationFrame(frame)
    frame = 0
    node.style.removeProperty('--zx-effect-rotate-x')
    node.style.removeProperty('--zx-effect-rotate-y')
    node.style.removeProperty('--zx-effect-pointer-x')
    node.style.removeProperty('--zx-effect-pointer-y')
    node.removeAttribute('data-zx-tilting')
  }
  function move(event: PointerEvent) {
    // Nested opted-in surfaces own their own movement. Never capture touch/scroll.
    if (
      reduced.matches ||
      !fine.matches ||
      event.pointerType !== 'mouse' ||
      (event.target instanceof Element && event.target.closest('[data-zx-tilt]') !== node)
    ) {
      reset()
      return
    }
    clientX = event.clientX
    clientY = event.clientY
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      const bounds = node.getBoundingClientRect()
      const x = Math.max(-1, Math.min(1, ((clientX - bounds.left) / bounds.width) * 2 - 1))
      const y = Math.max(-1, Math.min(1, ((clientY - bounds.top) / bounds.height) * 2 - 1))
      node.style.setProperty('--zx-effect-rotate-x', `${-y * 5}deg`)
      node.style.setProperty('--zx-effect-rotate-y', `${x * 5}deg`)
      node.style.setProperty('--zx-effect-pointer-x', `${50 + x * 35}%`)
      node.style.setProperty('--zx-effect-pointer-y', `${50 + y * 35}%`)
      node.setAttribute('data-zx-tilting', '')
    })
  }
  node.addEventListener('pointermove', move, { passive: true })
  node.addEventListener('pointerleave', reset)
  node.addEventListener('pointercancel', reset)
  node.addEventListener('focusin', reset)
  window.addEventListener('blur', reset)
  reduced.addEventListener('change', reset)
  fine.addEventListener('change', reset)
  return () => {
    reset()
    node.removeEventListener('pointermove', move)
    node.removeEventListener('pointerleave', reset)
    node.removeEventListener('pointercancel', reset)
    node.removeEventListener('focusin', reset)
    window.removeEventListener('blur', reset)
    reduced.removeEventListener('change', reset)
    fine.removeEventListener('change', reset)
  }
}

function attachShadow(node: HTMLElement, canvas: HTMLCanvasElement) {
  let disposed = false
  let stop: (() => void) | undefined
  // No GPU code, parser, adapter request or render loop on the default path.
  void import('./gpu-shadow')
    .then(({ startGpuShadow }) => {
      if (!disposed) stop = startGpuShadow(node, canvas)
    })
    .catch(() => {
      // The CSS shadow remains usable if the optional chunk cannot be loaded.
    })
  return () => {
    disposed = true
    stop?.()
  }
}

export function useSurfaceEffects<T extends HTMLElement>(
  effects: SurfaceEffects | undefined,
  forwardedRef: Ref<T> | undefined,
  disabled = false,
) {
  const host = useRef<T | null>(null)
  const shadow = effects?.shadow === 'gpu'
  const tilt = effects?.tilt === true
  const backlight = effects?.backlight === true
  const glass = effects?.glass === true
  const enabled = shadow || tilt || backlight || glass
  useImperativeHandle(forwardedRef, () => host.current!, [])

  useEffect(() => {
    const node = host.current
    if (!node || !tilt || disabled) return
    return attachTilt(node)
  }, [tilt, disabled])

  useEffect(() => {
    const node = host.current
    const canvas = node?.querySelector<HTMLCanvasElement>(':scope > .zx-effect-shadow')
    if (!node || !canvas || !shadow || disabled || !navigator.gpu) return
    return attachShadow(node, canvas)
  }, [shadow, disabled])

  return {
    ref: host,
    'data-zx-effects': enabled || undefined,
    'data-zx-shadow': shadow || undefined,
    'data-zx-tilt': tilt || undefined,
    'data-zx-backlight': backlight || undefined,
    'data-zx-glass': glass || undefined,
  }
}

/**
 * A signed rounded-rectangle normal map, neutral in the center. Only the narrow
 * rim displaces the backdrop; text and controls are never passed through a filter.
 */
function glassDisplacement(width: number, height: number, radius: number) {
  const scale = Math.min(1, 192 / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  const context = canvas.getContext('2d')
  if (!context) return undefined
  const image = context.createImageData(canvas.width, canvas.height)
  const halfX = width / 2
  const halfY = height / 2
  const r = Math.min(radius, halfX, halfY)
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const px = (x + 0.5) / scale - halfX
      const py = (y + 0.5) / scale - halfY
      const qx = Math.abs(px) - halfX + r
      const qy = Math.abs(py) - halfY + r
      const nx = Math.max(qx, 0)
      const ny = Math.max(qy, 0)
      const length = Math.hypot(nx, ny)
      const distance = length + Math.min(Math.max(qx, qy), 0) - r
      const rim = Math.exp(-Math.abs(distance) / 5) * 96
      const dx = length ? nx / length : Number(qx > qy)
      const dy = length ? ny / length : Number(qy >= qx)
      const offset = (y * canvas.width + x) * 4
      image.data[offset] = 128 + Math.sign(px) * dx * rim
      image.data[offset + 1] = 128 + Math.sign(py) * dy * rim
      image.data[offset + 2] = 128
      image.data[offset + 3] = 255
    }
  }
  context.putImageData(image, 0, 0)
  return canvas.toDataURL()
}

function attachGlassMap(node: HTMLElement, map: SVGFEImageElement) {
  let previous = ''
  function update() {
    const width = node.offsetWidth
    const height = node.offsetHeight
    if (width <= 0 || height <= 0) return
    const radius = Number.parseFloat(getComputedStyle(node).borderTopLeftRadius) || 0
    const key = `${width}:${height}:${radius}`
    if (key === previous) return
    previous = key
    const source = glassDisplacement(width, height, radius)
    if (source) map.setAttribute('href', source)
  }
  const observer = new ResizeObserver(update)
  observer.observe(node)
  // Radius can change independently of size when switching style or custom theme.
  const theme = new MutationObserver(update)
  for (let scope: HTMLElement | null = node; scope; scope = scope.parentElement) {
    theme.observe(scope, {
      attributes: true,
      attributeFilter: ['data-zx-style', 'data-zx-color-mode', 'style'],
    })
  }
  update()
  return () => {
    observer.disconnect()
    theme.disconnect()
  }
}

function GlassLayer() {
  const id = `zx-glass-${useId().replace(/:/g, '')}`
  const layer = useRef<HTMLSpanElement>(null)
  const map = useRef<SVGFEImageElement>(null)
  useEffect(() => {
    const node = layer.current?.parentElement
    if (node && map.current) return attachGlassMap(node, map.current)
  }, [])
  return (
    <span ref={layer} className="zx-effect-glass" aria-hidden="true">
      <svg className="zx-effect-defs" width="0" height="0" focusable="false">
        <defs>
          <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feImage ref={map} result="rim" width="100%" height="100%" preserveAspectRatio="none" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="rim"
              scale="16"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <span className="zx-effect-glass-warp" style={{ filter: `url("#${id}")` }} />
    </span>
  )
}

export function EffectLayers({ effects }: { effects?: SurfaceEffects }) {
  return (
    <>
      {effects?.shadow === 'gpu' && <canvas className="zx-effect-shadow" aria-hidden="true" />}
      {effects?.glass && <GlassLayer />}
      {effects?.backlight && <span className="zx-effect-backlight" aria-hidden="true" />}
      {effects?.tilt && <span className="zx-effect-sheen" aria-hidden="true" />}
    </>
  )
}

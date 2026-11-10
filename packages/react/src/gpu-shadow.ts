import { effect, frame, init, surface } from 'vgpu'
import type { Gpu } from 'vgpu'
import shadowShader from './shadow.shader'

// All opted-in surfaces share one low-power device. The last unmount releases it,
// including when unmounted while requestAdapter/requestDevice is still pending.
let shared: { ready: Promise<Gpu>; users: number; lossListeners: Set<() => void> } | undefined
function acquire() {
  if (!shared) {
    const entry = {
      ready: init({ powerPreference: 'low-power' }),
      users: 0,
      lossListeners: new Set<() => void>(),
    }
    shared = entry
    void entry.ready.then(
      (gpu) => {
        // One listener per device, not a pending promise retaining every past host.
        void gpu.lost.then(() => {
          for (const listener of entry.lossListeners) listener()
        })
      },
      () => {},
    )
  }
  const entry = shared
  entry.users++
  return {
    ready: entry.ready,
    onLoss(listener: () => void) {
      entry.lossListeners.add(listener)
      return () => entry.lossListeners.delete(listener)
    },
    release() {
      entry.users--
      if (entry.users === 0) {
        if (shared === entry) shared = undefined
        void entry.ready.then(
          (gpu) => gpu.dispose(),
          () => {},
        )
      }
    },
  }
}

export function startGpuShadow(host: HTMLElement, canvas: HTMLCanvasElement): () => void {
  const lease = acquire()
  let disposed = false
  let cleanup: (() => void) | undefined
  const offLoss = lease.onLoss(stop)
  host.removeAttribute('data-zx-shadow-error')
  function fail(cause: unknown) {
    if (disposed) return
    host.setAttribute(
      'data-zx-shadow-error',
      cause instanceof Error ? cause.message : String(cause),
    )
    stop()
  }
  function stop() {
    if (disposed) return
    disposed = true
    offLoss()
    try {
      cleanup?.()
    } finally {
      host.removeAttribute('data-zx-shadow-renderer')
      lease.release()
    }
  }
  void lease.ready
    .then(async (gpu) => {
      if (disposed) return
      const output = surface(gpu, canvas, {
        dpr: [1, 2],
        alphaMode: 'premultiplied',
        clearColor: [0, 0, 0, 0],
      })
      cleanup = () => output.dispose()
      const shader = effect(gpu, shadowShader, {
        label: 'zx-surface-shadow',
        set: { params: { size: [1, 1], radius: 0, opacity: 0.18 } },
      })
      let pending = 0
      let visible = true
      let compiled = false
      let previous = ''
      const render = () => {
        pending = 0
        if (disposed || !compiled || !visible || document.hidden) return
        try {
          const css = getComputedStyle(host)
          const size = [host.offsetWidth, host.offsetHeight]
          const radius = Number.parseFloat(css.borderTopLeftRadius) || 0
          const opacity =
            Number.parseFloat(css.getPropertyValue('--zx-effect-shadow-opacity')) || 0.18
          const key = `${size}:${radius}:${opacity}:${devicePixelRatio}`
          if (key === previous) return
          previous = key
          shader.set({
            params: {
              size,
              radius,
              opacity,
            },
          })
          frame(gpu, (current) => current.pass(output, shader))
          host.setAttribute('data-zx-shadow-renderer', 'gpu')
        } catch (cause) {
          fail(cause)
        }
      }
      const schedule = () => {
        if (!pending && !disposed) pending = requestAnimationFrame(render)
      }
      const resize = new ResizeObserver(schedule)
      resize.observe(host)
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        if (visible) {
          previous = ''
          schedule()
        }
      })
      intersection.observe(host)
      const theme = new MutationObserver(schedule)
      for (let scope: HTMLElement | null = host; scope; scope = scope.parentElement) {
        theme.observe(scope, {
          attributes: true,
          attributeFilter: ['data-zx-style', 'data-zx-color-mode', 'style', 'class'],
        })
      }
      const offError = gpu.onError(fail)
      document.addEventListener('visibilitychange', schedule)
      window.addEventListener('resize', schedule)
      cleanup = () => {
        cancelAnimationFrame(pending)
        resize.disconnect()
        intersection.disconnect()
        theme.disconnect()
        document.removeEventListener('visibilitychange', schedule)
        window.removeEventListener('resize', schedule)
        offError()
        shader.dispose()
        output.dispose()
      }
      await shader.compile(output)
      compiled = true
      if (!disposed) schedule()
    })
    .catch(fail)
  return stop
}

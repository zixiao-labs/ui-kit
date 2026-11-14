import { createContext, createSignal, onCleanup, onMount, useContext } from 'solid-js'
import type { Accessor, JSX } from 'solid-js'

// Nest floating portals inside the actual dialog, never an empty body host that
// an outer modal can asynchronously aria-hide before its content is registered.
export const FloatingPortalMount = createContext<Accessor<HTMLElement | undefined>>()

/**
 * Apply the trigger's effective zx contract to the actual portaled surface.
 * No custom portal container: Kobalte keeps ownership of focus/inertness.
 */
export function portalTheme() {
  const parentMount = useContext(FloatingPortalMount)
  let source: HTMLElement | undefined
  const [attributes, setAttributes] = createSignal<{
    'data-zx-style'?: string
    'data-zx-color-mode'?: string
    style?: JSX.CSSProperties
  }>({})
  onMount(() => {
    if (!source) return
    const element = source
    const sync = () => {
      const computed = getComputedStyle(element)
      const tokens: Record<string, string> = { 'color-scheme': computed.colorScheme }
      for (const name of Array.from(computed)) {
        if (name.startsWith('--zx-')) tokens[name] = computed.getPropertyValue(name)
      }
      setAttributes({
        'data-zx-style':
          element.closest('[data-zx-style]')?.getAttribute('data-zx-style') ?? undefined,
        'data-zx-color-mode': computed.colorScheme === 'dark' ? 'dark' : 'light',
        style: tokens,
      })
    }
    sync()
    const observer = new MutationObserver(sync)
    for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
      observer.observe(ancestor, { attributes: true })
    }
    onCleanup(() => observer.disconnect())
  })
  return {
    ref: (element: HTMLElement) => {
      source = element
    },
    attributes,
    mount: () => parentMount?.(),
  }
}

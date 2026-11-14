import { createSignal } from 'solid-js'

export const cx = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ')

/** Read through accessors: destructuring a Solid prop would freeze its first value. */
export function controllable<T>(
  value: () => T | undefined,
  initial: T,
  onChange: () => ((value: T) => void) | undefined,
) {
  const [internal, setInternal] = createSignal(initial)
  const current = () => (value() === undefined ? internal() : (value() as T))
  const set = (next: T) => {
    if (Object.is(next, current())) return
    if (value() === undefined) setInternal(() => next)
    onChange()?.(next)
  }
  return [current, set] as const
}

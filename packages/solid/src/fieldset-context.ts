import { createContext, useContext } from 'solid-js'
import type { Accessor } from 'solid-js'

export const FieldsetDisabledContext = createContext<Accessor<boolean>>()

/** Custom controls must honor fieldsets too, not just their hidden native input. */
export function fieldsetDisabled(own: () => boolean | undefined) {
  const inherited = useContext(FieldsetDisabledContext)
  return () => (inherited?.() ? true : own())
}

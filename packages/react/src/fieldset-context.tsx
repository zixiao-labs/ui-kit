import { createContext, useContext } from 'react'

/** Shared by Fieldset and interactive wrappers, including controls in other modules. */
export const FieldsetDisabledContext = createContext(false)

/**
 * A disabled ancestor always wins, including over an explicit false.
 * Preserve undefined otherwise so RAC's own field/group contexts can still supply
 * their disabled state instead of being overridden by a new false default.
 */
export function useFieldsetDisabled(isDisabled?: boolean): boolean | undefined {
  return useContext(FieldsetDisabledContext) || isDisabled
}

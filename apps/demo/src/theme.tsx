import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { brandTheme, createTheme } from '@zixiao-labs/ui-kits-react/theme'

export interface ThemeSettings {
  primary: string
  secondary: string
  radius: number
  customized: boolean
  dark: boolean
}

const defaults: ThemeSettings = { ...brandTheme, customized: false, dark: false }
const storageKey = 'zx-ui-theme-v1'

function validSettings(value: unknown): value is ThemeSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<ThemeSettings>
  return (
    typeof item.primary === 'string' &&
    /^#[\da-f]{6}$/i.test(item.primary) &&
    typeof item.secondary === 'string' &&
    /^#[\da-f]{6}$/i.test(item.secondary) &&
    typeof item.radius === 'number' &&
    Number.isFinite(item.radius) &&
    item.radius >= 0 &&
    item.radius <= 32 &&
    typeof item.customized === 'boolean' &&
    typeof item.dark === 'boolean'
  )
}

interface ThemeState {
  settings: ThemeSettings
  update: (values: Partial<ThemeSettings>) => void
  reset: () => void
  previewStyle: (dark: boolean) => CSSProperties | undefined
  storageError: boolean
}

const ThemeContext = createContext<ThemeState | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaults)
  const [storageError, setStorageError] = useState(false)
  // Browser-only storage is intentionally hydrated after the matching SSR render.
  /* oxlint-disable react/set-state-in-effect */
  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
      if (validSettings(stored)) setSettings(stored)
    } catch {
      setStorageError(true)
    }
  }, [])
  /* oxlint-enable react/set-state-in-effect */
  useEffect(() => {
    const root = document.documentElement
    const tokens = settings.customized ? createTheme(settings, settings.dark) : {}
    root.dataset.zxColorMode = settings.dark ? 'dark' : 'light'
    for (const [key, value] of Object.entries(tokens)) root.style.setProperty(key, value)
    return () => {
      for (const key of Object.keys(tokens)) root.style.removeProperty(key)
      root.removeAttribute('data-zx-color-mode')
    }
  }, [settings])
  const value = useMemo<ThemeState>(() => {
    const save = (next: ThemeSettings) => {
      setSettings(next)
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
        setStorageError(false)
      } catch {
        setStorageError(true)
      }
    }
    return {
      settings,
      update: (values) => save({ ...settings, ...values }),
      reset: () => save(defaults),
      previewStyle: (dark) =>
        settings.customized ? (createTheme(settings, dark) as CSSProperties) : undefined,
      storageError,
    }
  }, [settings, storageError])
  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme requires ThemeProvider')
  return context
}

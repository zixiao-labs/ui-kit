import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { brandTheme, createTheme } from '@zixiao-labs/ui-kits-react/theme'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeSettings {
  primary: string
  secondary: string
  radius: number
  customized: boolean
  mode: ThemeMode
}

const defaults: ThemeSettings = { ...brandTheme, customized: false, mode: 'system' }
const storageKey = 'zx-ui-theme-v1'
const systemThemeQuery = '(prefers-color-scheme: dark)'

function readSettings(value: unknown): ThemeSettings | undefined {
  if (!value || typeof value !== 'object') return undefined
  const item = value as Partial<ThemeSettings> & { dark?: boolean }
  if (
    !(
      typeof item.primary === 'string' &&
      /^#[\da-f]{6}$/i.test(item.primary) &&
      typeof item.secondary === 'string' &&
      /^#[\da-f]{6}$/i.test(item.secondary) &&
      typeof item.radius === 'number' &&
      Number.isFinite(item.radius) &&
      item.radius >= 0 &&
      item.radius <= 32 &&
      typeof item.customized === 'boolean'
    )
  )
    return undefined
  // Preserve explicit light/dark preferences saved before system mode was added.
  const mode =
    item.mode ?? (typeof item.dark === 'boolean' ? (item.dark ? 'dark' : 'light') : undefined)
  if (mode !== 'light' && mode !== 'dark' && mode !== 'system') return undefined
  return {
    primary: item.primary,
    secondary: item.secondary,
    radius: item.radius,
    customized: item.customized,
    mode,
  }
}

function subscribeToSystemTheme(onChange: () => void) {
  const query = window.matchMedia(systemThemeQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function getSystemDark() {
  return window.matchMedia(systemThemeQuery).matches
}

function getServerDark() {
  return false
}

interface ThemeState {
  settings: ThemeSettings
  dark: boolean
  update: (values: Partial<ThemeSettings>) => void
  reset: () => void
  previewStyle: CSSProperties | undefined
  storageError: boolean
}

const ThemeContext = createContext<ThemeState | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaults)
  const [storageError, setStorageError] = useState(false)
  const systemDark = useSyncExternalStore(subscribeToSystemTheme, getSystemDark, getServerDark)
  const dark = settings.mode === 'system' ? systemDark : settings.mode === 'dark'
  const tokens = useMemo(
    () => (settings.customized ? createTheme(settings, dark) : undefined),
    [settings, dark],
  )
  // Browser-only storage is intentionally hydrated after the matching SSR render.
  /* oxlint-disable react/set-state-in-effect */
  useEffect(() => {
    try {
      const stored = readSettings(JSON.parse(localStorage.getItem(storageKey) ?? 'null'))
      if (stored) setSettings(stored)
    } catch {
      setStorageError(true)
    }
  }, [])
  /* oxlint-enable react/set-state-in-effect */
  useEffect(() => {
    const root = document.documentElement
    root.dataset.zxColorMode = dark ? 'dark' : 'light'
    for (const [key, value] of Object.entries(tokens ?? {})) root.style.setProperty(key, value)
    return () => {
      for (const key of Object.keys(tokens ?? {})) root.style.removeProperty(key)
      root.removeAttribute('data-zx-color-mode')
    }
  }, [dark, tokens])
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
      dark,
      update: (values) => save({ ...settings, ...values }),
      reset: () => save(defaults),
      previewStyle: tokens as CSSProperties | undefined,
      storageError,
    }
  }, [settings, dark, tokens, storageError])
  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme requires ThemeProvider')
  return context
}

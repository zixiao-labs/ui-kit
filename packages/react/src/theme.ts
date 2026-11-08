import { argbFromHex, Hct, hexFromArgb, TonalPalette } from '@material/material-color-utilities'
import type { CSSProperties } from 'react'

export interface ThemeOptions {
  primary?: string
  secondary?: string
  radius?: number
}

export const brandTheme = { primary: '#8b5cf6', secondary: '#fcd34d', radius: 12 } as const

const hexPattern = /^#[\da-f]{6}$/i

export function contrastRatio(a: string, b: string) {
  function luminance(hex: string) {
    const channels = [1, 3, 5].map((offset) => {
      const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
  }
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

function foreground(background: string) {
  return contrastRatio(background, '#ffffff') >= contrastRatio(background, '#000000')
    ? '#ffffff'
    : '#000000'
}

/**
 * HCT tonal surfaces, with exact brand fills and contrast-safe foregrounds.
 * Returns the neutral zx contract only; no DOM access or global theme mutation.
 * Import this optional entry separately from the components.
 */
export function createTheme(
  options: ThemeOptions = {},
  dark = false,
): CSSProperties & Record<`--zx-${string}`, string> {
  const { primary = brandTheme.primary, secondary = brandTheme.secondary, radius = 12 } = options
  if (!hexPattern.test(primary) || !hexPattern.test(secondary)) {
    throw new TypeError('Theme colors must be six-digit hex values, e.g. #8b5cf6.')
  }
  if (!Number.isFinite(radius) || radius < 0 || radius > 32) {
    throw new RangeError('Theme radius must be between 0 and 32.')
  }
  const seed = Hct.fromInt(argbFromHex(primary))
  const neutral = TonalPalette.fromHueAndChroma(seed.hue, 6)
  const variant = TonalPalette.fromHueAndChroma(seed.hue, 10)
  const accent = TonalPalette.fromInt(argbFromHex(primary))
  const supporting = TonalPalette.fromInt(argbFromHex(secondary))
  const tone = (palette: TonalPalette, value: number) => hexFromArgb(palette.tone(value))
  const onAccent = foreground(primary)
  return {
    '--zx-accent': primary.toLowerCase(),
    '--zx-on-accent': onAccent,
    '--zx-accent-hover': tone(
      accent,
      Math.max(0, Math.min(100, seed.tone + (onAccent === '#000000' ? 5 : -5))),
    ),
    '--zx-accent-ink': tone(accent, dark ? 80 : 35),
    '--zx-secondary': secondary.toLowerCase(),
    '--zx-on-secondary': foreground(secondary),
    '--zx-tonal': tone(supporting, dark ? 30 : 90),
    '--zx-on-tonal': tone(supporting, dark ? 95 : 10),
    '--zx-surface': tone(neutral, dark ? 6 : 98),
    '--zx-surface-subtle': tone(neutral, dark ? 17 : 94),
    '--zx-surface-raised': tone(neutral, dark ? 12 : 100),
    '--zx-text': tone(neutral, dark ? 90 : 10),
    '--zx-muted': tone(variant, dark ? 80 : 35),
    '--zx-border': tone(variant, dark ? 30 : 82),
    '--zx-control-border': tone(variant, dark ? 65 : 45),
    '--zx-focus': tone(accent, dark ? 80 : 40),
    '--zx-radius': `${radius}px`,
    '--zx-radius-sm': `${Math.max(4, radius - 4)}px`,
    '--zx-radius-md': `${radius}px`,
    '--zx-radius-lg': `${radius + 4}px`,
  }
}

/** Apply after the base/theme styles; explicit nested scopes remain isolated. */
export function themeToCSS(options: ThemeOptions = {}, selector = '[data-zx-theme="custom"]') {
  const block = (scope: string, dark: boolean) =>
    `${scope} {\n${Object.entries(createTheme(options, dark))
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')}\n}`
  return `${block(selector, false)}\n\n${block(`${selector}[data-zx-color-mode="dark"]`, true)}\n`
}

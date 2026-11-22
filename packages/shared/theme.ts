import { argbFromHex, Hct, hexFromArgb, TonalPalette } from '@material/material-color-utilities'

export interface ThemeColors {
  primary: string
  secondary: string
}

export interface ThemeOptions {
  primary?: string
  secondary?: string
  radius?: number
  /** Optional exact fills used only in dark mode; tonal roles still derive from HCT. */
  darkColors?: ThemeColors
  /** CSS font-family lists. Load licensed font files in the consuming application. */
  fontFamily?: string
  displayFontFamily?: string
}
export const brandTheme = { primary: '#8b5cf6', secondary: '#fcd34d', radius: 12 } as const
export const zixiaoDarkColors = { primary: '#422256', secondary: '#d7a547' } as const
export const themePresets = {
  zixiao: { name: '紫霄', primary: brandTheme.primary, secondary: brandTheme.secondary },
  pine: { name: '松林', primary: '#28745b', secondary: '#e8b86d' },
  coast: { name: '海岸', primary: '#3269b1', secondary: '#edb9a2' },
  cinnabar: { name: '朱砂', primary: '#b84842', secondary: '#e1bb67' },
  hepo: { name: '鹤坡', primary: '#3f5662', secondary: '#c4a787' },
  hepoInterior: { name: '鹤坡·室内', primary: '#82503d', secondary: '#d8bd88' },
  qingdaoPengxian: { name: '青岛蓬仙', primary: '#47b79c', secondary: '#8f1d22' },
  niyiYunjun: { name: '霓衣云君', primary: '#f3a694', secondary: '#2e59a7' },
  danluFeilong: { name: '丹炉飞龙', primary: '#e94829', secondary: '#5aa4ae' },
} as const
const hexPattern = /^#[\da-f]{6}$/i
// A deliberately bounded font-family grammar, not arbitrary CSS. In particular,
// CSS exports must never accept declarations, comments, URLs or var() expressions.
const fontPattern =
  /^(?:"[\p{L}\p{N} _.,-]+"|'[\p{L}\p{N} _.,-]+'|-?[\p{L}_][\p{L}\p{N}_ -]*)(?:\s*,\s*(?:"[\p{L}\p{N} _.,-]+"|'[\p{L}\p{N} _.,-]+'|-?[\p{L}_][\p{L}\p{N}_ -]*))*$/u

export function isFontFamily(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= 512 &&
    fontPattern.test(value.trim()) &&
    // Tokenize quoted families as a whole, including names with commas. CSS-wide
    // keywords are not family names unless quoted, even within a fallback list.
    (value.match(/"[^"]+"|'[^']+'|[^"',]+/g) ?? []).every(
      (family) => !/^(inherit|initial|unset|revert|revert-layer|default)$/i.test(family.trim()),
    )
  )
}

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

/** Shared HCT computation; only neutral zx tokens, no framework or DOM dependency. */
export function createTheme(
  options: ThemeOptions = {},
  dark = false,
): Record<`--zx-${string}`, string> {
  const { radius = 12, fontFamily, displayFontFamily, darkColors } = options
  if (
    ![options.primary ?? brandTheme.primary, options.secondary ?? brandTheme.secondary].every(
      (color) => hexPattern.test(color),
    ) ||
    (darkColors && (!hexPattern.test(darkColors.primary) || !hexPattern.test(darkColors.secondary)))
  ) {
    throw new TypeError('Theme colors must be six-digit hex values, e.g. #8b5cf6.')
  }
  if (!Number.isFinite(radius) || radius < 0 || radius > 32)
    throw new RangeError('Theme radius must be between 0 and 32.')
  for (const font of [fontFamily, displayFontFamily]) {
    if (font !== undefined && !isFontFamily(font))
      throw new TypeError('Theme fonts must be CSS font-family lists of at most 512 characters.')
  }
  const { primary = brandTheme.primary, secondary = brandTheme.secondary } =
    dark && darkColors ? darkColors : options
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
    '--zx-tonal': tone(supporting, dark ? 80 : 90),
    '--zx-on-tonal': tone(supporting, 10),
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
    ...(fontFamily ? { '--zx-font': fontFamily.trim() } : {}),
    ...(displayFontFamily
      ? { '--zx-font-display': displayFontFamily.trim() }
      : fontFamily
        ? { '--zx-font-display': fontFamily.trim() }
        : {}),
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

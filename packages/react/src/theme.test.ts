import { expect, test } from '@lightning-js/lightning'
import { argbFromHex, Hct } from '@material/material-color-utilities'
import {
  brandTheme,
  contrastRatio,
  createTheme,
  isFontFamily,
  themePresets,
  themeToCSS,
  zixiaoDarkColors,
} from './theme'

test('keeps the exact company fills and generates tonal light and dark surfaces', () => {
  for (const dark of [false, true]) {
    const tokens = createTheme(brandTheme, dark)
    expect(tokens['--zx-accent']).toBe('#8b5cf6')
    expect(tokens['--zx-secondary']).toBe('#fcd34d')
    for (const [foreground, background] of [
      ['--zx-on-accent', '--zx-accent'],
      ['--zx-on-secondary', '--zx-secondary'],
      ['--zx-on-tonal', '--zx-tonal'],
      ['--zx-text', '--zx-surface'],
      ['--zx-muted', '--zx-surface-subtle'],
      ['--zx-accent-ink', '--zx-surface'],
    ] as const) {
      expect(contrastRatio(tokens[foreground], tokens[background])).toBeGreaterThanOrEqual(4.5)
    }
    expect(
      contrastRatio(tokens['--zx-control-border'], tokens['--zx-surface-subtle']),
    ).toBeGreaterThanOrEqual(3)
  }
  expect(createTheme()['--zx-surface']).not.toBe(createTheme({}, true)['--zx-surface'])
})

test('keeps supporting colors bright in dark mode, including brand yellow and cinnabar gold', () => {
  for (const secondary of [
    '#fcd34d',
    '#e8b86d',
    '#edb9a2',
    '#e1bb67',
    '#c4a787',
    '#ffffff',
    '#000000',
    '#0000ff',
    '#777777',
  ]) {
    for (const dark of [false, true]) {
      const tokens = createTheme({ secondary }, dark)
      expect(tokens['--zx-secondary']).toBe(secondary)
      expect(
        Math.abs(Hct.fromInt(argbFromHex(tokens['--zx-tonal'])).tone - (dark ? 80 : 90)),
      ).toBeLessThan(0.5)
      expect(contrastRatio(tokens['--zx-on-tonal'], tokens['--zx-tonal'])).toBeGreaterThanOrEqual(
        4.5,
      )
    }
  }
})

test('adapts the full neutral ramp, handles extreme seeds and rejects invalid inputs', () => {
  expect(createTheme({ primary: '#28745b' })['--zx-surface']).not.toBe(
    createTheme()['--zx-surface'],
  )
  for (const primary of ['#ffffff', '#000000', '#ffff00', '#0000ff', '#777777']) {
    for (const dark of [false, true]) {
      const tokens = createTheme({ primary }, dark)
      expect(contrastRatio(tokens['--zx-on-accent'], primary)).toBeGreaterThanOrEqual(4.5)
      expect(
        contrastRatio(tokens['--zx-accent-ink'], tokens['--zx-surface']),
      ).toBeGreaterThanOrEqual(4.5)
    }
  }
  expect(() => createTheme({ primary: 'red' })).toThrow(TypeError)
  expect(() => createTheme({ secondary: '#fff' })).toThrow(TypeError)
  expect(() => createTheme({ radius: Number.NaN })).toThrow(RangeError)
  expect(() => createTheme({ radius: 33 })).toThrow(RangeError)
})

test('exports isolated CSS scopes with both modes and no design-language dependency', () => {
  const css = themeToCSS({ primary: '#28745b', radius: 20 })
  expect(css).toContain('[data-zx-theme="custom"] {')
  expect(css).toContain('[data-zx-theme="custom"][data-zx-color-mode="dark"] {')
  expect(css).toContain('--zx-accent: #28745b;')
  expect(css).toContain('--zx-radius: 20px;')
  expect(css).not.toContain('--md-')
})

test('shares exact preset fills with readable semantic roles in both modes', () => {
  expect(themePresets.qingdaoPengxian).toEqual({
    name: '青岛蓬仙',
    primary: '#47b79c',
    secondary: '#8f1d22',
  })
  expect(themePresets.niyiYunjun).toEqual({
    name: '霓衣云君',
    primary: '#f3a694',
    secondary: '#2e59a7',
  })
  expect(themePresets.danluFeilong).toEqual({
    name: '丹炉飞龙',
    primary: '#e94829',
    secondary: '#5aa4ae',
  })
  for (const preset of Object.values(themePresets)) {
    for (const dark of [false, true]) {
      const tokens = createTheme(preset, dark)
      expect(tokens['--zx-accent']).toBe(preset.primary)
      expect(tokens['--zx-secondary']).toBe(preset.secondary)
      for (const [foreground, background] of [
        ['--zx-on-accent', '--zx-accent'],
        ['--zx-on-secondary', '--zx-secondary'],
        ['--zx-on-tonal', '--zx-tonal'],
        ['--zx-accent-ink', '--zx-surface'],
        ['--zx-muted', '--zx-surface-subtle'],
      ] as const) {
        expect(contrastRatio(tokens[foreground], tokens[background])).toBeGreaterThanOrEqual(4.5)
      }
    }
  }
})

test('opts into exact Zixiao dark fills without changing light colors or the default', () => {
  const options = { ...themePresets.zixiao, darkColors: zixiaoDarkColors }
  expect(createTheme(options)).toEqual(createTheme(themePresets.zixiao))
  expect(createTheme(themePresets.zixiao, true)['--zx-accent']).toBe('#8b5cf6')
  const tokens = createTheme(options, true)
  expect(tokens['--zx-accent']).toBe('#422256')
  expect(tokens['--zx-secondary']).toBe('#d7a547')
  expect(contrastRatio(tokens['--zx-on-accent'], tokens['--zx-accent'])).toBeGreaterThanOrEqual(4.5)
  expect(
    contrastRatio(tokens['--zx-on-secondary'], tokens['--zx-secondary']),
  ).toBeGreaterThanOrEqual(4.5)
  expect(contrastRatio(tokens['--zx-accent-ink'], tokens['--zx-surface'])).toBeGreaterThanOrEqual(
    4.5,
  )
  const css = themeToCSS(options)
  expect(css).toContain('--zx-accent: #8b5cf6;')
  expect(css).toContain('--zx-accent: #422256;')
  expect(css).toContain('--zx-secondary: #d7a547;')
  for (const dark of [false, true]) {
    expect(() =>
      createTheme({ darkColors: { primary: 'red', secondary: '#ffffff' } }, dark),
    ).toThrow(TypeError)
  }
})

test('accepts bounded CSS font stacks, preserves native type by default and exports both font roles', () => {
  expect(createTheme()['--zx-font']).toBeUndefined()
  expect(createTheme()['--zx-font-display']).toBeUndefined()
  for (const fontFamily of [
    '"Noto Sans SC", "思源黑体", sans-serif',
    "'IBM Plex Sans', system-ui",
    '-apple-system, BlinkMacSystemFont, sans-serif',
    '"Family, inherit, serif", sans-serif',
    'system-ui, sans-serif',
    '霞鹜文楷, serif',
  ]) {
    expect(isFontFamily(fontFamily)).toBe(true)
    const tokens = createTheme({ fontFamily })
    expect(tokens['--zx-font']).toBe(fontFamily)
    expect(tokens['--zx-font-display']).toBe(fontFamily)
  }
  const options = { fontFamily: 'system-ui', displayFontFamily: '"Noto Serif SC", serif' }
  expect(createTheme(options, true)['--zx-font-display']).toBe(options.displayFontFamily)
  expect(themeToCSS(options)).toContain('--zx-font: system-ui;')
  expect(themeToCSS(options)).toContain('--zx-font-display: "Noto Serif SC", serif;')
  expect(createTheme({ displayFontFamily: 'serif' })['--zx-font']).toBeUndefined()
  for (const fontFamily of [
    '',
    'sans-serif; color: red',
    'serif } body { display: none',
    'url(https://example.com/font)',
    'var(--custom-font)',
    '"unterminated',
    'inherit',
    'inherit, serif',
    'serif, revert-layer',
    'a'.repeat(513),
  ]) {
    expect(isFontFamily(fontFamily)).toBe(false)
    expect(() => createTheme({ fontFamily })).toThrow(TypeError)
    expect(() => themeToCSS({ displayFontFamily: fontFamily })).toThrow(TypeError)
  }
})

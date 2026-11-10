import { expect, test } from '@lightning-js/lightning'
import { argbFromHex, Hct } from '@material/material-color-utilities'
import { brandTheme, contrastRatio, createTheme, themeToCSS } from './theme'

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

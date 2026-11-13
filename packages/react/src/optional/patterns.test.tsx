import { expect, test } from '@lightning-js/lightning'
import { renderToStaticMarkup } from 'react-dom/server'
import { PatternBackground } from './patterns'
import { LiquidGlassSurface } from './liquid-glass'

test('patterns are opt-in and preserve native content and div attributes', () => {
  const plain = renderToStaticMarkup(
    <PatternBackground aria-label="项目">
      <button type="button">打开</button>
    </PatternBackground>,
  )
  expect(plain).not.toContain('<svg')
  expect(plain).toContain('aria-label="项目"')
  expect(plain).toContain('<button type="button">打开</button>')
  const paths = new Set<string>()
  for (const pattern of ['hui', 'yunlei', 'lei'] as const) {
    const html = renderToStaticMarkup(<PatternBackground pattern={pattern}>档案</PatternBackground>)
    expect(html).toContain(`data-zx-pattern="${pattern}"`)
    expect(html).toContain('patternUnits="userSpaceOnUse"')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('focusable="false"')
    paths.add(html.match(/<path d="([^"]+)"/)![1])
  }
  expect(paths.size).toBe(3)
})

test('multiple patterns use unique SSR-stable references', () => {
  const html = renderToStaticMarkup(
    <>
      <PatternBackground pattern="hui" />
      <PatternBackground pattern="yunlei" />
    </>,
  )
  const ids = [...html.matchAll(/<pattern id="([^"]+)"/g)].map((match) => match[1])
  expect(ids.length).toBe(2)
  expect(new Set(ids).size).toBe(2)
  for (const id of ids) expect(html).toContain(`url(#${id})`)
})

test('Liquid Glass React renders usable SSR fallback without evaluating the browser library', () => {
  const html = renderToStaticMarkup(
    <LiquidGlassSurface aria-label="档案" cornerRadius={12}>
      <button type="submit" disabled>
        保存
      </button>
    </LiquidGlassSurface>,
  )
  expect(html).toContain('data-zx-liquid-glass="loading"')
  expect(html).toContain('border-radius:12px')
  expect(html).toContain('<button type="submit" disabled="">保存</button>')
  expect(html).not.toContain('glass__warp')
})

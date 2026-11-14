import { expect, test } from '@lightning-js/lightning'
import { renderToStaticMarkup } from 'react-dom/server'
import { PatternBackground } from './patterns'
import { LiquidGlassSurface } from './liquid-glass'
import { patternTraces } from './pattern-traces'

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

test('uses traced filled contours without restroking the outline or distorting its aspect ratio', () => {
  for (const pattern of ['hui', 'yunlei', 'lei'] as const) {
    const motif = patternTraces[pattern]
    const html = renderToStaticMarkup(<PatternBackground pattern={pattern} />)
    expect(html).toContain(`d="${motif.path}"`)
    expect(html).toContain('fill="currentColor" fill-rule="evenodd"')
    expect(html).not.toContain('stroke=')
    // Multiplication order can change the last floating-point decimal in SVG.
    const width = Number(html.match(/<pattern[^>]*width="([^"]+)"/)?.[1])
    expect(Math.abs(width - (motif.width * 48) / motif.height) < 1e-10).toBe(true)
    expect(html).toContain(
      `translate(0 12) scale(${48 / motif.height}) translate(${-motif.offsetX} 0)`,
    )
  }
  // The supplied cloud band is irregular, not one square plus one rounded tile.
  expect(patternTraces.yunlei.offsetX).toBe(0)
  expect(patternTraces.yunlei.width / patternTraces.yunlei.height > 4).toBe(true)
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

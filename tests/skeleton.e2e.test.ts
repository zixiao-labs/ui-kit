import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, afterEach, beforeAll, beforeEach, expect, test } from '@lightning-js/lightning'
import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'
import { startDemo } from './dev-server'
import { chooseDemoSelect } from './select-helpers'

let app: Awaited<ReturnType<typeof startDemo>>
let browser: Browser
let page: Page
let errors: string[]

beforeAll(async () => {
  app = await startDemo()
  browser = await chromium.launch({ args: ['--use-mock-keychain', '--password-store=basic'] })
})

afterAll(async () => {
  try {
    await browser?.close()
  } finally {
    app?.close()
  }
})

beforeEach(async () => {
  page = await browser.newPage({
    baseURL: app.url,
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  })
  page.setDefaultTimeout(5000)
  errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await page.getByRole('button', { name: '触发交互', exact: true }).click()
  await expect.poll(() => page.locator('.click-count').textContent()).toBe('已触发 1 次交互')
  await page
    .locator('.directory-groups')
    .getByRole('button', { name: 'Skeleton', exact: true })
    .click()
})

afterEach(async () => {
  try {
    expect(errors).toEqual([])
  } finally {
    await page?.context().close()
  }
})

for (const mode of ['light', 'dark']) {
  test(`keeps skeleton placeholders visible on each theme's surfaces in ${mode} mode`, async () => {
    await chooseDemoSelect(page, '样本主题', mode)
    const blocks = page.locator('.demo-stage .zx-skeleton')
    expect(await blocks.count()).toBe(4)
    expect(await blocks.first().getAttribute('aria-hidden')).toBe('true')
    const square = await blocks.first().boundingBox()
    expect(square!.width).toBe(64)
    expect(square!.height).toBe(64)

    for (const theme of ['clean', 'minimal', 'soft', 'brutalist']) {
      for (const surface of [
        '--zx-surface-subtle',
        '--zx-surface',
        '--zx-surface-raised',
        '--zx-tonal',
      ]) {
        const readings = await page.locator('.component-demo').evaluate(
          (container, options) => {
            container.setAttribute('data-zx-style', options.theme)
            ;(container as HTMLElement).style.backgroundColor = `var(${options.surface})`
            return Array.from(container.querySelectorAll<HTMLElement>('.zx-skeleton')).map(
              (block) => {
                // Resolve modern CSS colors and alpha compositing through the browser,
                // rather than treating different CSS strings as proof of visibility.
                const canvas = document.createElement('canvas')
                canvas.width = canvas.height = 1
                const context = canvas.getContext('2d')!
                const paint = (color: string) => {
                  context.fillStyle = color
                  context.fillRect(0, 0, 1, 1)
                }
                const ancestors: Element[] = []
                for (let element = block.parentElement; element; element = element.parentElement) {
                  ancestors.unshift(element)
                }
                for (const ancestor of ancestors) paint(getComputedStyle(ancestor).backgroundColor)
                const background = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3)
                paint(getComputedStyle(block).backgroundColor)
                const fill = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3)
                const luminance = (color: number[]) => {
                  const channels = color.map((channel) => {
                    const value = channel / 255
                    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
                  })
                  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
                }
                const a = luminance(background)
                const b = luminance(fill)
                return {
                  background,
                  fill,
                  contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
                }
              },
            )
          },
          { theme, surface },
        )
        // A decorative placeholder visibility floor, not a WCAG text requirement.
        expect(readings.filter((reading) => reading.contrast < 1.2)).toEqual([])
      }
    }

    await page.locator('.component-demo').evaluate((container) => {
      container.setAttribute('data-zx-style', 'clean')
      ;(container as HTMLElement).style.removeProperty('background-color')
    })
    const directory = process.env.UI_KITS_SCREENSHOT_DIR
    if (directory) {
      await mkdir(directory, { recursive: true })
      await page
        .locator('.component-demo')
        .screenshot({ path: join(directory, `skeleton-${mode}-desktop.png`) })
    }
    await page.setViewportSize({ width: 390, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    for (const block of await blocks.all()) {
      const bounds = await block.boundingBox()
      expect(bounds!.height).toBeGreaterThanOrEqual(24)
      expect(bounds!.width).toBeGreaterThan(0)
    }
    if (directory) {
      await page
        .locator('.component-demo')
        .screenshot({ path: join(directory, `skeleton-${mode}-mobile.png`) })
    }
  })
}

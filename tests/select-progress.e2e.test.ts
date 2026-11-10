import { afterAll, beforeAll, expect, test } from '@lightning-js/lightning'
import { chromium } from 'playwright'
import type { Browser } from 'playwright'
import { startDemo } from './dev-server'
import { chooseDemoSelect } from './select-helpers'

let app: Awaited<ReturnType<typeof startDemo>>
let browser: Browser
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

test('all demo configuration pickers open themed library menus, including nested, effect and mobile controls', async () => {
  const page = await browser.newPage({ baseURL: app.url, viewport: { width: 1440, height: 1000 } })
  try {
    await page.goto('/?component=Card')
    await chooseDemoSelect(page, '页面主题', 'dark')
    await chooseDemoSelect(page, '样本主题', 'light')
    await chooseDemoSelect(page, '效果样本明暗', 'dark')
    expect(await page.locator('.effects-stage').getAttribute('data-zx-color-mode')).toBe('dark')
    await page.locator('.theme-composition > summary').click()
    await chooseDemoSelect(page, '嵌套风格', 'hepo-interior')
    await chooseDemoSelect(page, '嵌套明暗', 'light')
    expect(await page.locator('.composition-inner').getAttribute('data-zx-style')).toBe(
      'hepo-interior',
    )
    expect(await page.locator('.composition-inner').getAttribute('data-zx-color-mode')).toBe(
      'light',
    )
    await page.setViewportSize({ width: 390, height: 844 })
    await chooseDemoSelect(page, '选择组件', 'ProgressCircle')
    expect(await page.locator('h1').textContent()).toBe('ProgressCircle')
    // Hidden form selects are part of RAC accessibility; none may be clickable chrome.
    const visibleNative = await page.locator('select').evaluateAll(
      (nodes) =>
        nodes.filter((node) => {
          const rect = node.getBoundingClientRect()
          const css = getComputedStyle(node)
          return (
            rect.width > 1 &&
            rect.height > 1 &&
            css.opacity !== '0' &&
            !node.closest('[aria-hidden="true"]')
          )
        }).length,
    )
    expect(visibleNative).toBe(0)
  } finally {
    await page.context().close()
  }
})

test('ProgressCircle rotates exactly one turn with no backward jump at the loop seam', async () => {
  const page = await browser.newPage({ baseURL: app.url })
  try {
    await page.goto('/?component=ProgressCircle')
    const spinner = page.locator('.component-demo .zx-progress-circle svg[data-indeterminate]')
    await spinner.waitFor()
    const readings = await spinner.evaluate((node) => {
      const animation = node.getAnimations()[0]
      animation.pause()
      return [0, 250, 500, 750, 999, 1001].map((time) => {
        animation.currentTime = time
        const matrix = new DOMMatrix(getComputedStyle(node).transform)
        return (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI
      })
    })
    const forward = (a: number, b: number) => (b - a + 360) % 360
    for (let index = 1; index < 4; index++) {
      expect(Math.abs(forward(readings[index - 1], readings[index]) - 90)).toBeLessThan(0.1)
    }
    expect(Math.abs(forward(readings[4], readings[5]) - 0.72)).toBeLessThan(0.1)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    expect(await spinner.evaluate((node) => getComputedStyle(node).animationName)).toBe('none')
  } finally {
    await page.context().close()
  }
})

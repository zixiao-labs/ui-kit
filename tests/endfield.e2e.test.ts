import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, afterEach, beforeAll, beforeEach, expect, test } from '@lightning-js/lightning'
import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'
import { contrastRatio } from '../packages/react/src/theme'
import { styleOptions } from '../apps/demo/src/style-options'
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
    viewport: { width: 1440, height: 1000 },
    colorScheme: 'light',
    reducedMotion: 'reduce',
  })
  page.setDefaultTimeout(5000)
  errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await page.getByRole('button', { name: '触发交互', exact: true }).click()
  await expect.poll(() => page.locator('.click-count').textContent()).toBe('已触发 1 次交互')
  await chooseStyle('全局风格', 'endfield')
})
afterEach(async () => {
  try {
    expect(errors).toEqual([])
  } finally {
    await page?.context().close()
  }
})

async function chooseStyle(label: string, value: string) {
  const name =
    value === 'inherit' ? '跟随全局' : styleOptions.find((item) => item.id === value)!.name
  await page.getByRole('button', { name: new RegExp(label) }).click()
  const menu = page.getByRole('listbox', { name: label, exact: true })
  await menu.getByRole('option', { name, exact: true }).click()
  await menu.waitFor({ state: 'detached' })
}

async function select(name: string) {
  const mobile = page.viewportSize()!.width <= 800
  if (mobile) await chooseDemoSelect(page, '选择组件', name)
  else await page.locator('.directory-groups').getByRole('button', { name, exact: true }).click()
  await expect.poll(() => page.locator('h1').textContent()).toBe(name)
}

async function token(selector: string, property: string) {
  return page
    .locator(selector)
    .evaluate((element, name) => getComputedStyle(element).getPropertyValue(name).trim(), property)
}

test('reserves condensed type for display headings rather than Endfield controls', async () => {
  const fonts = await page
    .locator('h1, .workspace-toolbar .zx-select-trigger')
    .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).fontFamily))
  expect(fonts[0]).toContain('Condensed')
  expect(fonts[1]).toContain('Space Grotesk')
  expect(fonts[1]).toContain('system-ui')
  expect(fonts[1]).not.toContain('DIN Alternate')
  expect(fonts[1]).not.toContain('Condensed')
})

for (const mode of ['light', 'dark'] as const) {
  for (const width of [1440, 390]) {
    test(`covers every Endfield catalogue entry at ${width}px in ${mode} mode`, async () => {
      const names = await page.locator('.directory-groups button').allTextContents()
      expect(names.length).toBe(74)
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 })
      await chooseDemoSelect(page, '页面主题', mode)
      for (const name of names) {
        await select(name)
        const sample = name === 'Button' ? '[data-testid="preview"]' : '.component-demo'
        expect(await page.locator(sample).getAttribute('data-zx-style')).toBe('endfield')
        expect(await token(sample, '--zx-accent')).toBe('#fffa00')
        expect(await token(sample, '--zx-radius-md')).toBe('2px')
        expect(await token(sample, '--zx-switch-radius')).toBe('2px')
        expect(await page.locator(sample).getAttribute('data-zx-color-mode')).toBe(mode)
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        )
        expect(await page.getByLabel('当前组件代码', { exact: true }).textContent()).toContain(
          'data-zx-style="endfield"',
        )
      }
    })
  }
}

test('switches global and preview styles independently without resetting component input', async () => {
  await select('TextField')
  const input = page.locator('.demo-stage input').first()
  await input.fill('保留输入内容')
  for (const style of ['soft', 'minimal', 'brutalist', 'clean', 'endfield']) {
    await chooseStyle('全局风格', style)
    expect(await page.locator('html').getAttribute('data-zx-style')).toBe(style)
    expect(await page.locator('.component-demo').getAttribute('data-zx-style')).toBe(style)
    expect(await input.inputValue()).toBe('保留输入内容')
  }
  await chooseStyle('预览风格', 'soft')
  await page.getByRole('button', { name: '松林配色', exact: true }).click()
  expect(await token('html', '--zx-accent')).toBe('#28745b')
  expect(await token('.component-demo', '--zx-accent')).toBe('#71509a')
  await select('Modal')
  await page.getByRole('button', { name: '项目详情', exact: true }).click()
  expect(await page.locator('.zx-modal-overlay').getAttribute('data-zx-style')).toBe('soft')
  expect(await token('.zx-modal-overlay', '--zx-accent')).toBe('#71509a')
  await page.keyboard.press('Escape')
  await page.locator('.zx-modal-overlay').waitFor({ state: 'detached' })
  await page.reload()
  await expect.poll(() => token('html', '--zx-accent')).toBe('#28745b')
  expect(await page.getByRole('button', { name: /全局风格/ }).textContent()).toBe('Endfield')
  expect(await page.getByRole('button', { name: /预览风格/ }).textContent()).toBe('Soft')
  await chooseStyle('预览风格', 'inherit')
  expect(await token('.component-demo', '--zx-accent')).toBe('#28745b')
  // Re-selecting the current value is not a change; switch presets to restore their tokens.
  await chooseStyle('全局风格', 'clean')
  await chooseStyle('全局风格', 'endfield')
  expect(await token('.component-demo', '--zx-accent')).toBe('#fffa00')
})

test('keeps nested styles, modes, live changes and portal focus isolated in both directions', async () => {
  await page.locator('.theme-composition > summary').click()
  for (const [outer, inner] of [
    ['clean', 'endfield'],
    ['endfield', 'clean'],
  ]) {
    await chooseStyle('全局风格', outer)
    await chooseDemoSelect(page, '嵌套风格', inner)
    await chooseDemoSelect(page, '嵌套明暗', 'dark')
    expect(await token('.composition-outer', '--zx-radius')).toBe(
      outer === 'clean' ? '9999px' : '0px',
    )
    expect(await token('.composition-inner', '--zx-radius')).toBe(
      inner === 'clean' ? '9999px' : '0px',
    )
    expect(await token('.composition-inner', '--zx-switch-radius')).toBe(
      inner === 'clean' ? '999px' : '2px',
    )
    expect(await page.locator('.composition-outer').getAttribute('data-zx-color-mode')).toBe(
      'light',
    )
    const trigger = page.getByRole('button', { name: '打开嵌套浮层', exact: true })
    await trigger.click()
    expect(await page.locator('.zx-modal-overlay').getAttribute('data-zx-style')).toBe(inner)
    expect(await page.locator('.zx-modal-overlay').getAttribute('data-zx-color-mode')).toBe('dark')
    expect(
      await page.locator('.zx-modal').evaluate((element) => element.getAnimations().length),
    ).toBe(0)
    await page.locator('.zx-modal .zx-select-trigger').click()
    expect(await page.locator('.zx-picker-popover').getAttribute('data-zx-style')).toBe(inner)
    // Exercise the same live updates that a consuming app can make while overlays are open.
    await page.locator('.composition-inner').evaluate((element) => {
      element.setAttribute('data-zx-style', 'minimal')
      element.removeAttribute('data-zx-color-mode')
    })
    await expect
      .poll(() => page.locator('.zx-modal-overlay').getAttribute('data-zx-style'))
      .toBe('minimal')
    await expect
      .poll(() => page.locator('.zx-picker-popover').getAttribute('data-zx-style'))
      .toBe('minimal')
    expect(await token('.zx-picker-popover', '--zx-accent')).toBe('#25563f')
    expect(await page.locator('.zx-picker-popover').getAttribute('data-zx-color-mode')).toBe(
      'light',
    )
    await page.getByRole('option', { name: '同步评审', exact: true }).click()
    await page.getByRole('button', { name: '完成预览', exact: true }).click()
    await page.locator('.zx-modal-overlay').waitFor({ state: 'detached' })
    await expect
      .poll(() => trigger.evaluate((element) => element === document.activeElement))
      .toBe(true)
    // Restore the React-owned boundary before the next combination.
    await chooseDemoSelect(page, '嵌套明暗', 'light')
    await chooseDemoSelect(page, '嵌套风格', 'soft')
  }
})

test('exports native Endfield CSS separately from custom tokens and restores saved selections', async () => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByRole('button', { name: '复制主题 CSS', exact: true }).click()
  const native = await page.evaluate(() => navigator.clipboard.readText())
  expect(native).toContain('/themes/endfield.css')
  expect(native).not.toContain('--zx-radius: 4px')
  await chooseStyle('设计风格', 'minimal')
  await chooseDemoSelect(page, '页面主题', 'dark')
  await page.reload()
  await expect.poll(() => page.locator('html').getAttribute('data-zx-style')).toBe('endfield')
  expect(await page.getByTestId('preview').getAttribute('data-zx-style')).toBe('minimal')
  expect(await page.locator('html').getAttribute('data-zx-color-mode')).toBe('dark')
  await page.getByRole('button', { name: '恢复默认主题', exact: true }).click()
  expect(await page.locator('html').getAttribute('data-zx-style')).toBe('clean')
  expect(await page.getByRole('button', { name: /设计风格/ }).textContent()).toBe('跟随全局')
})

test('keeps Endfield text, focus, small indicators and control boundaries contrast-safe', async () => {
  for (const mode of ['light', 'dark']) {
    await chooseDemoSelect(page, '页面主题', mode)
    for (const [foreground, background] of [
      ['--zx-text', '--zx-surface'],
      ['--zx-muted', '--zx-surface-subtle'],
      ['--zx-on-accent', '--zx-accent'],
      ['--zx-on-accent', '--zx-accent-hover'],
      ['--zx-on-tonal', '--zx-tonal'],
      ['--zx-on-secondary', '--zx-secondary'],
      ['--zx-accent-ink', '--zx-surface-raised'],
    ]) {
      expect(
        contrastRatio(await token('html', foreground), await token('html', background)),
      ).toBeGreaterThanOrEqual(4.5)
    }
    for (const foreground of [
      '--zx-focus',
      '--zx-selection-border',
      '--zx-indicator',
      '--zx-control-border',
    ]) {
      expect(
        contrastRatio(await token('html', foreground), await token('html', '--zx-surface-subtle')),
      ).toBeGreaterThanOrEqual(3)
    }
  }
})

test('captures Endfield desktop, portrait, dark, nested and 200% reflow evidence', async () => {
  const directory = process.env.UI_KITS_SCREENSHOT_DIR
  if (directory) await mkdir(directory, { recursive: true })
  async function capture(name: string) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (directory) await page.screenshot({ path: join(directory, `${name}.png`) })
  }
  await capture('endfield-desktop')
  for (const name of ['TextField', 'Calendar', 'Tabs', 'Table']) {
    await select(name)
    await capture(`endfield-${name.toLowerCase()}`)
  }
  await select('Button')
  await chooseDemoSelect(page, '页面主题', 'dark')
  await capture('endfield-dark')
  await chooseDemoSelect(page, '页面主题', 'light')
  await page.setViewportSize({ width: 390, height: 844 })
  await capture('endfield-mobile')
  await page.setViewportSize({ width: 720, height: 450 })
  await select('Tabs')
  await capture('endfield-reflow')
  await page.setViewportSize({ width: 1440, height: 1000 })
  await chooseStyle('全局风格', 'clean')
  await page.locator('.theme-composition > summary').click()
  await page.locator('.composition-outer').scrollIntoViewIfNeeded()
  await capture('endfield-mixed')
  await page.getByRole('button', { name: '打开嵌套浮层', exact: true }).click()
  await page.locator('.zx-modal .zx-select-trigger').click()
  await capture('endfield-nested-portal')
})

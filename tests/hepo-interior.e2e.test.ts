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
  await chooseStyle('全局风格', 'hepo-interior')
})
afterEach(async () => {
  try {
    expect(errors).toEqual([])
  } finally {
    await page?.context().close()
  }
})

async function chooseStyle(label: string, value: string) {
  await page.getByRole('button', { name: new RegExp(label) }).click()
  const menu = page.getByRole('listbox', { name: label, exact: true })
  await menu
    .getByRole('option', {
      name: styleOptions.find((item) => item.id === value)!.name,
      exact: true,
    })
    .click()
  await menu.waitFor({ state: 'detached' })
}

async function select(name: string) {
  if (page.viewportSize()!.width <= 800) {
    await chooseDemoSelect(page, '选择组件', name)
  } else {
    await page.locator('.directory-groups').getByRole('button', { name, exact: true }).click()
  }
  await expect.poll(() => page.locator('h1').textContent()).toBe(name)
}

async function token(selector: string, property: string) {
  return page
    .locator(selector)
    .evaluate((element, name) => getComputedStyle(element).getPropertyValue(name).trim(), property)
}

for (const mode of ['light', 'dark'] as const) {
  for (const width of [1440, 390]) {
    test(`covers every interior catalogue entry at ${width}px in ${mode} mode`, async () => {
      const names = await page.locator('.directory-groups button').allTextContents()
      expect(names.length).toBe(74)
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 })
      await chooseDemoSelect(page, '页面主题', mode)
      for (const name of names) {
        await select(name)
        const sample = name === 'Button' ? '[data-testid="preview"]' : '.component-demo'
        expect(await page.locator(sample).getAttribute('data-zx-style')).toBe('hepo-interior')
        expect(await page.locator(sample).getAttribute('data-zx-color-mode')).toBe(mode)
        expect(await token(sample, '--zx-accent')).toBe(mode === 'dark' ? '#e6b993' : '#82503d')
        expect(await token(sample, '--zx-radius-md')).toBe('4px')
        expect(await token(sample, '--zx-font-display')).toContain('Noto Serif SC')
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        )
        expect(await page.getByLabel('当前组件代码', { exact: true }).textContent()).toContain(
          'data-zx-style="hepo-interior"',
        )
      }
    })
  }
}

test('isolates interior, original Hepo and Clean scopes through nested body portals', async () => {
  await page.locator('.theme-composition > summary').click()
  for (const [outer, inner, accent, family] of [
    ['hepo', 'hepo-interior', '#e6b993', 'Noto Sans SC'],
    ['hepo-interior', 'hepo', '#b8cccf', 'Noto Sans SC'],
    ['clean', 'hepo-interior', '#e6b993', 'Noto Sans SC'],
    ['hepo-interior', 'clean', '#8b5cf6', 'Roboto'],
  ]) {
    await chooseStyle('全局风格', outer)
    await chooseDemoSelect(page, '嵌套风格', inner)
    await chooseDemoSelect(page, '嵌套明暗', 'dark')
    const trigger = page.getByRole('button', { name: '打开嵌套浮层', exact: true })
    await trigger.click()
    expect(await page.locator('.zx-modal-overlay').getAttribute('data-zx-style')).toBe(inner)
    expect(await page.locator('.zx-modal-overlay').getAttribute('data-zx-color-mode')).toBe('dark')
    expect(await token('.zx-modal-overlay', '--zx-accent')).toBe(accent)
    expect(await token('.zx-modal-overlay', '--zx-font-display')).toBe(
      await token('.composition-inner', '--zx-font-display'),
    )
    expect(
      await page
        .locator('.zx-modal .zx-select-trigger')
        .evaluate((element) => getComputedStyle(element).fontFamily),
    ).toContain(family)
    await page.locator('.zx-modal .zx-select-trigger').click()
    expect(await page.locator('.zx-picker-popover').getAttribute('data-zx-style')).toBe(inner)
    expect(await token('.zx-picker-popover', '--zx-accent')).toBe(accent)
    await page.getByRole('option', { name: '同步评审', exact: true }).click()
    await page.getByRole('button', { name: '完成预览', exact: true }).click()
    await page.locator('.zx-modal-overlay').waitFor({ state: 'detached' })
    await expect
      .poll(() => trigger.evaluate((element) => element === document.activeElement))
      .toBe(true)
  }
})

test('persists and exports the interior style separately from its color-only preset', async () => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByRole('button', { name: '复制主题 CSS', exact: true }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    '/themes/hepo-interior.css',
  )
  await chooseStyle('设计风格', 'hepo')
  await chooseDemoSelect(page, '页面主题', 'dark')
  await page.reload()
  await expect.poll(() => token('html', '--zx-accent')).toBe('#e6b993')
  expect(await token('[data-testid="preview"]', '--zx-accent')).toBe('#b8cccf')
  await chooseStyle('全局风格', 'clean')
  await page.getByRole('button', { name: '鹤坡·室内配色', exact: true }).click()
  expect(await page.locator('html').getAttribute('data-zx-style')).toBe('clean')
  expect(await token('html', '--zx-accent')).toBe('#82503d')
  expect(await token('html', '--zx-secondary')).toBe('#d8bd88')
  expect(await token('[data-testid="preview"]', '--zx-accent')).toBe('#b8cccf')
  await page.getByRole('button', { name: '复制主题 CSS', exact: true }).click()
  const custom = await page.evaluate(() => navigator.clipboard.readText())
  expect(custom).toContain('--zx-accent: #82503d')
  expect(custom).toContain('[data-zx-theme="custom"][data-zx-color-mode="dark"]')
  expect(custom).not.toContain('/themes/hepo-interior.css')
  await page.reload()
  await expect.poll(() => token('html', '--zx-secondary')).toBe('#d8bd88')
  await chooseStyle('全局风格', 'hepo-interior')
  expect(await token('html', '--zx-accent')).toBe('#e6b993')
  expect(await token('html', '--zx-tonal')).toBe('#e7d7b9')
  expect(await token('[data-testid="preview"]', '--zx-accent')).toBe('#b8cccf')
})

test('keeps text and boundaries readable without dark yellow-brown interaction fills', async () => {
  for (const mode of ['light', 'dark']) {
    await chooseDemoSelect(page, '页面主题', mode)
    for (const background of ['--zx-surface', '--zx-surface-subtle', '--zx-surface-raised']) {
      for (const foreground of ['--zx-text', '--zx-muted', '--zx-accent-ink']) {
        expect(
          contrastRatio(await token('html', foreground), await token('html', background)),
        ).toBeGreaterThanOrEqual(4.5)
      }
      for (const foreground of [
        '--zx-control-border',
        '--zx-focus',
        '--zx-selection-border',
        '--zx-indicator',
      ]) {
        expect(
          contrastRatio(await token('html', foreground), await token('html', background)),
        ).toBeGreaterThanOrEqual(3)
      }
    }
    for (const [foreground, background] of [
      ['--zx-on-accent', '--zx-accent'],
      ['--zx-on-accent', '--zx-accent-hover'],
      ['--zx-on-secondary', '--zx-secondary'],
      ['--zx-on-tonal', '--zx-tonal'],
    ]) {
      expect(
        contrastRatio(await token('html', foreground), await token('html', background)),
      ).toBeGreaterThanOrEqual(4.5)
    }
  }
  for (const variant of ['solid', 'tonal']) {
    const button = page.locator(`.variant-grid .zx-button[data-variant="${variant}"]`)
    for (const state of ['default', 'hover', 'pressed']) {
      if (state === 'hover') await button.hover()
      if (state === 'pressed') await page.mouse.down()
      const colors = await button.evaluate((element) => {
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = 1
        const context = canvas.getContext('2d')!
        const hex = (color: string) => {
          context.fillStyle = color
          context.fillRect(0, 0, 1, 1)
          return `#${Array.from(context.getImageData(0, 0, 1, 1).data)
            .slice(0, 3)
            .map((value) => value.toString(16).padStart(2, '0'))
            .join('')}`
        }
        const style = getComputedStyle(element)
        return { background: hex(style.backgroundColor), foreground: hex(style.color) }
      })
      // A luminance floor excludes the entire muddy gold class, not only three hex values.
      expect(contrastRatio(colors.background, '#000000')).toBeGreaterThanOrEqual(10)
      expect(contrastRatio(colors.foreground, colors.background)).toBeGreaterThanOrEqual(4.5)
    }
    await page.mouse.up()
    await page.mouse.move(0, 0)
  }
  await page.getByRole('button', { name: /全局风格/ }).click()
  expect(
    await page.locator('.zx-picker-option[data-selected]').evaluate((element) => {
      const probe = document.createElement('span')
      probe.style.background = 'var(--zx-tonal)'
      element.append(probe)
      const matches =
        getComputedStyle(element).backgroundColor === getComputedStyle(probe).backgroundColor
      probe.remove()
      return matches
    }),
  ).toBe(true)
  await page.keyboard.press('Escape')
})

test('captures interior desktop, mobile, typography, inputs, reflow and portal evidence', async () => {
  const directory = process.env.UI_KITS_SCREENSHOT_DIR
  if (directory) await mkdir(directory, { recursive: true })
  async function capture(name: string) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (directory) await page.screenshot({ path: join(directory, `hepo-interior-${name}.png`) })
  }
  await capture('light')
  await chooseDemoSelect(page, '页面主题', 'dark')
  await capture('dark')
  await select('Typography')
  await capture('type-dark')
  await chooseDemoSelect(page, '页面主题', 'light')
  await capture('type-light')
  await select('Button')
  await page.setViewportSize({ width: 390, height: 844 })
  await capture('mobile')
  await page.locator('.theme-panel').scrollIntoViewIfNeeded()
  const presets = page.locator('.theme-presets button')
  const tops = await presets.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().top),
  )
  expect(tops.length).toBe(6)
  expect(new Set(tops).size).toBe(2)
  for (const top of new Set(tops)) expect(tops.filter((row) => row === top).length).toBe(3)
  await capture('mobile-theme')
  await chooseDemoSelect(page, '页面主题', 'dark')
  await select('Input')
  const input = page.getByRole('textbox', { name: '协作成员', exact: true })
  await input.fill('林舒')
  expect(await input.inputValue()).toBe('林舒')
  await input.fill('')
  await page.locator('#interactive').scrollIntoViewIfNeeded()
  await capture('mobile-input-dark')
  await page.setViewportSize({ width: 720, height: 450 })
  await select('Tabs')
  await page
    .locator('.demo-stage')
    .evaluate((element) => element.scrollIntoView({ block: 'center' }))
  await capture('reflow')
  await page.setViewportSize({ width: 1440, height: 1000 })
  await chooseStyle('全局风格', 'hepo')
  await page.locator('.theme-composition > summary').click()
  await chooseDemoSelect(page, '嵌套风格', 'hepo-interior')
  await chooseDemoSelect(page, '嵌套明暗', 'light')
  await page.getByRole('button', { name: '打开嵌套浮层', exact: true }).click()
  await page.locator('.zx-modal .zx-select-trigger').click()
  await capture('portal')
})

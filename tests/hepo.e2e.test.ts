import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, afterEach, beforeAll, beforeEach, expect, test } from '@lightning-js/lightning'
import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'
import { contrastRatio } from '../packages/react/src/theme'
import { styleOptions } from '../apps/demo/src/style-options'
import { startDemo } from './dev-server'

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
  await chooseStyle('全局风格', 'hepo')
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
  if (page.viewportSize()!.width <= 800) {
    await page.getByLabel('选择组件', { exact: true }).selectOption(name)
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

async function font(selector: string) {
  return page.locator(selector).evaluate((element) => getComputedStyle(element).fontFamily)
}

for (const mode of ['light', 'dark'] as const) {
  for (const width of [1440, 390]) {
    test(`covers every Hepo catalogue entry at ${width}px in ${mode} mode`, async () => {
      const names = await page.locator('.directory-groups button').allTextContents()
      expect(names.length).toBe(74)
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 })
      await page.getByLabel('页面主题', { exact: true }).selectOption(mode)
      for (const name of names) {
        await select(name)
        const sample = name === 'Button' ? '[data-testid="preview"]' : '.component-demo'
        expect(await page.locator(sample).getAttribute('data-zx-style')).toBe('hepo')
        expect(await page.locator(sample).getAttribute('data-zx-color-mode')).toBe(mode)
        expect(await token(sample, '--zx-accent')).toBe(mode === 'dark' ? '#b8cccf' : '#3f5662')
        expect(await token(sample, '--zx-radius-md')).toBe('4px')
        expect(await token(sample, '--zx-font-display')).toContain('Noto Serif SC')
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        )
        expect(await page.getByLabel('当前组件代码', { exact: true }).textContent()).toContain(
          'data-zx-style="hepo"',
        )
      }
    })
  }
}

test('pairs Song display with sans controls and isolates nested fonts and body portals', async () => {
  expect(await font('.preview-stage h3')).toContain('Noto Serif SC')
  expect(await font('.preview-actions .zx-button:first-child')).toContain('Noto Sans SC')
  await select('Typography')
  expect(await font('.zx-typography[data-variant="headline"]')).toContain('Noto Serif SC')
  expect(await font('.zx-typography[data-variant="title"]')).toContain('Noto Serif SC')
  expect(await font('.zx-typography[data-variant="body"]')).toContain('Noto Sans SC')
  await page.locator('.theme-composition > summary').click()
  for (const [outer, inner] of [
    ['clean', 'hepo'],
    ['hepo', 'clean'],
  ]) {
    await chooseStyle('全局风格', outer)
    await page.getByLabel('嵌套风格', { exact: true }).selectOption(inner)
    await page.getByLabel('嵌套明暗', { exact: true }).selectOption('dark')
    const trigger = page.getByRole('button', { name: '打开嵌套浮层', exact: true })
    await trigger.click()
    expect(await page.locator('.zx-modal-overlay').getAttribute('data-zx-style')).toBe(inner)
    expect(await page.locator('.zx-modal-overlay').getAttribute('data-zx-color-mode')).toBe('dark')
    expect((await font('.zx-dialog__title')).includes('Noto Serif SC')).toBe(inner === 'hepo')
    const controlFont = await font('.zx-modal .zx-select-trigger')
    expect(controlFont).toContain(inner === 'hepo' ? 'Noto Sans SC' : 'Roboto')
    expect(controlFont).not.toContain('Noto Serif SC')
    expect(await token('.zx-modal-overlay', '--zx-accent')).toBe(
      inner === 'hepo' ? '#b8cccf' : '#8b5cf6',
    )
    expect(
      await page.locator('.zx-modal').evaluate((element) => element.getAnimations().length),
    ).toBe(0)
    await page.locator('.zx-modal .zx-select-trigger').click()
    expect(await page.locator('.zx-picker-popover').getAttribute('data-zx-style')).toBe(inner)
    expect(await token('.zx-picker-popover', '--zx-font-display')).toBe(
      await token('.composition-inner', '--zx-font-display'),
    )
    await page.getByRole('option', { name: '同步评审', exact: true }).click()
    await page.getByRole('button', { name: '完成预览', exact: true }).click()
    await page.locator('.zx-modal-overlay').waitFor({ state: 'detached' })
    await expect
      .poll(() => trigger.evaluate((element) => element === document.activeElement))
      .toBe(true)
  }
})

test('exports the native theme, persists selections and keeps color-only presets independent', async () => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByRole('button', { name: '复制主题 CSS', exact: true }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('/themes/hepo.css')
  await chooseStyle('设计风格', 'soft')
  await page.getByLabel('页面主题', { exact: true }).selectOption('dark')
  await page.reload()
  await expect.poll(() => token('html', '--zx-accent')).toBe('#b8cccf')
  expect(await page.getByTestId('preview').getAttribute('data-zx-style')).toBe('soft')
  expect(await token('[data-testid="preview"]', '--zx-accent')).toBe('#d6b7f4')
  await chooseStyle('全局风格', 'clean')
  await page.getByRole('button', { name: '鹤坡配色', exact: true }).click()
  expect(await page.locator('html').getAttribute('data-zx-style')).toBe('clean')
  expect(await token('html', '--zx-accent')).toBe('#3f5662')
  expect(await token('html', '--zx-secondary')).toBe('#c4a787')
  expect(await token('[data-testid="preview"]', '--zx-accent')).toBe('#d6b7f4')
  await page.getByRole('button', { name: '复制主题 CSS', exact: true }).click()
  const custom = await page.evaluate(() => navigator.clipboard.readText())
  expect(custom).toContain('--zx-accent: #3f5662')
  expect(custom).toContain('[data-zx-theme="custom"][data-zx-color-mode="dark"]')
  expect(custom).not.toContain('/themes/hepo.css')
  await page.reload()
  await expect.poll(() => token('html', '--zx-secondary')).toBe('#c4a787')
  await chooseStyle('设计风格', 'hepo')
  expect(await token('[data-testid="preview"]', '--zx-accent')).toBe('#b8cccf')
})

test('keeps text and state boundaries readable and dark wood fills bright through interaction', async () => {
  for (const mode of ['light', 'dark']) {
    await page.getByLabel('页面主题', { exact: true }).selectOption(mode)
    for (const background of ['--zx-surface', '--zx-surface-subtle', '--zx-surface-raised']) {
      for (const foreground of ['--zx-text', '--zx-muted', '--zx-accent-ink']) {
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
  const tonal = page.locator('.variant-grid .zx-button[data-variant="tonal"]')
  const background = async () =>
    tonal.evaluate((element) => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 1
      const context = canvas.getContext('2d')!
      context.fillStyle = getComputedStyle(element).backgroundColor
      context.fillRect(0, 0, 1, 1)
      const channels = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3)
      return `#${channels.map((value) => value.toString(16).padStart(2, '0')).join('')}`
    })
  // A luminance floor catches the whole muddy low-tone yellow/brown class, not just three hexes.
  expect(contrastRatio(await background(), '#000000')).toBeGreaterThanOrEqual(10)
  await tonal.hover()
  expect(contrastRatio(await background(), '#000000')).toBeGreaterThanOrEqual(10)
  await page.mouse.down()
  expect(contrastRatio(await background(), '#000000')).toBeGreaterThanOrEqual(10)
  await page.mouse.up()
  expect(
    await page.locator('.preview-actions .zx-button:first-child').getAttribute('data-variant'),
  ).toBe('tonal')
  expect(await token('[data-testid="preview"]', '--zx-tonal')).toBe('#d8c3aa')
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

test('captures Hepo light, dark, Chinese type, mobile, reflow and nested portal evidence', async () => {
  const directory = process.env.UI_KITS_SCREENSHOT_DIR
  if (directory) await mkdir(directory, { recursive: true })
  async function capture(name: string) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (directory) await page.screenshot({ path: join(directory, `${name}.png`) })
  }
  // All five presets should share a row in the desktop theme sidebar.
  const rows = await page
    .locator('.theme-presets button')
    .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().top))
  expect(rows.length).toBe(5)
  expect(new Set(rows).size).toBe(1)
  await capture('hepo-light')
  await page.getByLabel('页面主题', { exact: true }).selectOption('dark')
  await capture('hepo-dark')
  await select('Typography')
  await capture('hepo-type-dark')
  await page.getByLabel('页面主题', { exact: true }).selectOption('light')
  await capture('hepo-type-light')
  await select('Button')
  await page.setViewportSize({ width: 390, height: 844 })
  await capture('hepo-mobile')
  await page.locator('.theme-panel').scrollIntoViewIfNeeded()
  await capture('hepo-mobile-theme')
  await select('Typography')
  await page.getByLabel('页面主题', { exact: true }).selectOption('dark')
  await page.locator('#interactive').scrollIntoViewIfNeeded()
  await capture('hepo-mobile-type-dark')
  await page.getByLabel('页面主题', { exact: true }).selectOption('light')
  await page.setViewportSize({ width: 720, height: 450 })
  await select('Tabs')
  await page
    .locator('.demo-stage')
    .evaluate((element) => element.scrollIntoView({ block: 'center' }))
  await capture('hepo-reflow')
  await page.setViewportSize({ width: 1440, height: 1000 })
  await chooseStyle('全局风格', 'clean')
  await page.locator('.theme-composition > summary').click()
  await page.getByLabel('嵌套风格', { exact: true }).selectOption('hepo')
  await page.getByRole('button', { name: '打开嵌套浮层', exact: true }).click()
  await page.locator('.zx-modal .zx-select-trigger').click()
  await capture('hepo-portal')
})

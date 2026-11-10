import { readFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, afterEach, beforeAll, beforeEach, expect, test } from '@lightning-js/lightning'
import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'
import { inputContrastFixture } from '../packages/react/tests/input-contrast-fixture'
import { contrastRatio, createTheme } from '../packages/react/src/theme'
import { hepoColors, styleOptions } from '../apps/demo/src/style-options'
import { startDemo } from './dev-server'

let app: Awaited<ReturnType<typeof startDemo>>
let browser: Browser
let page: Page

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
    reducedMotion: 'reduce',
  })
  page.setDefaultTimeout(5000)
})
afterEach(async () => page?.context().close())

async function readings() {
  return page.locator('#fields').evaluate((scope) =>
    Array.from(
      scope.querySelectorAll<HTMLElement>(
        '.zx-input:not(:disabled), .zx-input-group__adornment, .zx-field-button:not([data-disabled])',
      ),
    ).map((element) => {
      // Resolve CSS colors and transparent input/group backgrounds through the browser.
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 1
      const context = canvas.getContext('2d')!
      const paint = (color: string) => {
        context.fillStyle = color
        context.fillRect(0, 0, 1, 1)
      }
      const hex = () =>
        `#${Array.from(context.getImageData(0, 0, 1, 1).data)
          .slice(0, 3)
          .map((value) => value.toString(16).padStart(2, '0'))
          .join('')}`
      const ancestors: Element[] = []
      for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
        ancestors.unshift(ancestor)
      }
      paint('#ffffff')
      for (const ancestor of ancestors) paint(getComputedStyle(ancestor).backgroundColor)
      const background = hex()
      const style = getComputedStyle(element)
      paint(style.color)
      const foreground = hex()
      const placeholderStyle = getComputedStyle(element, '::placeholder')
      paint(background)
      paint(placeholderStyle.color)
      return {
        name: element.getAttribute('aria-label') ?? element.className,
        background,
        foreground,
        placeholder: element.matches('.zx-input') ? hex() : null,
        placeholderOpacity: placeholderStyle.opacity,
      }
    }),
  )
}

for (const mode of ['light', 'dark'] as const) {
  test(`keeps input text, placeholders, adornments and step buttons readable across themes and presets in ${mode}`, async () => {
    await page.setContent(`<!doctype html><html lang="zh-CN"><head><style>
      ${readFileSync('packages/react/src/styles.css', 'utf8')}
      #fields { padding: 24px; background: var(--zx-surface-raised); }
    </style></head><body>${inputContrastFixture}</body></html>`)
    const palettes = [
      null,
      { primary: '#8b5cf6', secondary: '#fcd34d' },
      { primary: '#28745b', secondary: '#e8b86d' },
      { primary: '#3269b1', secondary: '#edb9a2' },
      { primary: '#b84842', secondary: '#e1bb67' },
      hepoColors,
    ]
    for (const theme of styleOptions) {
      for (const palette of palettes) {
        await page.locator('#fields').evaluate(
          (scope, options) => {
            scope.setAttribute('data-zx-style', options.theme)
            scope.setAttribute('data-zx-color-mode', options.mode)
            scope.removeAttribute('style')
            for (const [name, value] of Object.entries(options.tokens)) {
              ;(scope as HTMLElement).style.setProperty(name, String(value))
            }
          },
          { theme: theme.id, mode, tokens: palette ? createTheme(palette, mode === 'dark') : {} },
        )
        const colors = await readings()
        expect(colors.filter((color) => color.placeholder !== null).length).toBe(13)
        const failures = colors.flatMap((color) => {
          const text = contrastRatio(color.foreground, color.background)
          const placeholder = color.placeholder
            ? contrastRatio(color.placeholder, color.background)
            : null
          return text < 4.5 ||
            (placeholder !== null && (placeholder < 4.5 || color.placeholderOpacity !== '1'))
            ? [{ theme: theme.id, mode, palette, ...color, text, placeholderContrast: placeholder }]
            : []
        })
        expect(failures).toEqual([])
      }
    }
    expect(await page.getByRole('textbox', { name: '禁用项目', exact: true }).isDisabled()).toBe(
      true,
    )
    expect(
      await page.getByRole('textbox', { name: '只读项目', exact: true }).getAttribute('readonly'),
    ).not.toBeNull()
  })
}

test('preserves real input editing and captures the reported Clean and Hepo dark cases', async () => {
  await page.goto('/')
  await page.getByRole('button', { name: '触发交互', exact: true }).click()
  await expect.poll(() => page.locator('.click-count').textContent()).toBe('已触发 1 次交互')
  await page
    .locator('.directory-groups')
    .getByRole('button', { name: 'Input', exact: true })
    .click()
  await page.getByLabel('页面主题', { exact: true }).selectOption('dark')
  const directory = process.env.UI_KITS_SCREENSHOT_DIR
  if (directory) await mkdir(directory, { recursive: true })
  for (const name of ['Clean', '鹤坡']) {
    if (name === '鹤坡') {
      await page.getByRole('button', { name: /全局风格/ }).click()
      const menu = page.getByRole('listbox', { name: '全局风格', exact: true })
      await menu.getByRole('option', { name, exact: true }).click()
      await menu.waitFor({ state: 'detached' })
    }
    const input = page.getByRole('textbox', { name: '协作成员', exact: true })
    await input.fill('林舒')
    expect(await input.inputValue()).toBe('林舒')
    await input.fill('')
    await input.press('Tab')
    expect(await input.getAttribute('placeholder')).toBe('陈予安或林舒')
    expect(
      await page.getByRole('textbox', { name: '归档项目名称', exact: true }).isDisabled(),
    ).toBe(true)
    if (directory)
      await page.locator('.component-demo').screenshot({
        path: join(directory, `input-${name === 'Clean' ? 'clean' : 'hepo'}-dark.png`),
      })
  }
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  if (directory)
    await page
      .locator('.component-demo')
      .screenshot({ path: join(directory, 'input-hepo-dark-mobile.png') })
  await page.getByLabel('选择组件', { exact: true }).selectOption('SearchField')
  const search = page.getByRole('searchbox', { name: '搜索成员', exact: true })
  await search.fill('林舒')
  const clear = page.locator('.zx-search-field').filter({ has: search }).getByRole('button', {
    name: '清除搜索',
    exact: true,
  })
  await clear.hover()
  expect(
    await clear.evaluate(
      (button) => getComputedStyle(button).color === getComputedStyle(button.parentElement!).color,
    ),
  ).toBe(true)
  await clear.click()
  expect(await search.inputValue()).toBe('')
})

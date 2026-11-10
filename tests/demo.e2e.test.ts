import { mkdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, afterEach, beforeAll, beforeEach, expect, test } from '@lightning-js/lightning'
import { chromium } from 'playwright'
import type { Browser, BrowserContext, Page } from 'playwright'
import { startDemo } from './dev-server'
import { chooseDemoSelect, demoSelectValue } from './select-helpers'
import { styleOptions } from '../apps/demo/src/style-options'

let app: Awaited<ReturnType<typeof startDemo>> | undefined
let browser: Browser
let context: BrowserContext
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
  context = await browser.newContext({ baseURL: app!.url, viewport: { width: 1440, height: 900 } })
  page = await context.newPage()
  page.setDefaultTimeout(5000)
  errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  // Wait for a real hydrated action, not for a fixed delay after navigation.
  await page.getByRole('button', { name: '触发交互' }).click()
  await expect.poll(() => page.locator('.click-count').textContent()).toBe('已触发 1 次交互')
  await page.getByRole('button', { name: '重置计数' }).click()
})

afterEach(async () => {
  try {
    expect(errors).toEqual([])
  } finally {
    await context?.close()
  }
})

const styleLabels: Record<string, string> = {
  clean: 'Clean',
  endfield: 'Endfield',
  minimal: 'Minimal',
  soft: 'Soft',
  brutalist: 'Brutalist',
}

function configTrigger(label: string) {
  return page.getByRole('button', { name: new RegExp(label) })
}

async function chooseConfig(label: string, option: string) {
  await configTrigger(label).click()
  const menu = page.getByRole('listbox', { name: new RegExp(label) })
  await menu.getByRole('option', { name: option, exact: true }).click()
  await menu.waitFor({ state: 'detached' })
}

test('keeps component behavior across all five expressions', async () => {
  expect(await page.title()).toContain('Zixiao Laboratories UI Kits')
  expect(await page.getByRole('heading', { level: 1 }).textContent()).toBe('Button')
  const action = page.getByRole('button', { name: '触发交互' })
  expect(await action.getAttribute('type')).toBe('button')

  for (const [index, style] of ['soft', 'brutalist', 'minimal', 'endfield', 'clean'].entries()) {
    await chooseConfig('设计风格', styleLabels[style])
    await expect.poll(() => page.getByTestId('preview').getAttribute('data-zx-style')).toBe(style)
    expect(await page.locator('.preview-style-label').textContent()).toBe(
      `${styleLabels[style]} / Button`,
    )
    await action.click()
    await expect
      .poll(() => page.locator('.click-count').textContent())
      .toBe(`已触发 ${index + 1} 次交互`)
  }
  await page.getByRole('button', { name: '重置计数' }).click()
  await expect.poll(() => page.locator('.click-count').textContent()).toBe('已触发 0 次交互')
})

test('updates variants, sizes, loading and disabled without losing keyboard behavior', async () => {
  const action = page.getByRole('button', { name: '触发交互' })
  await chooseConfig('变体', 'Tonal')
  await page.getByRole('radio', { name: '大', exact: true }).check()
  await expect.poll(() => action.getAttribute('data-variant')).toBe('tonal')
  expect(await action.getAttribute('data-size')).toBe('lg')
  await page.getByRole('checkbox', { name: /加载状态/ }).check()
  await expect.poll(() => action.getAttribute('aria-busy')).toBe('true')
  expect(await action.isDisabled()).toBe(true)
  expect(await page.getByLabel('当前组件代码', { exact: true }).textContent()).toContain(' loading')
  await page.getByRole('checkbox', { name: /禁用状态/ }).check()
  await page.getByRole('checkbox', { name: /加载状态/ }).uncheck()
  expect(await action.isDisabled()).toBe(true)
  await page.getByRole('checkbox', { name: /禁用状态/ }).uncheck()
  await expect.poll(() => action.isEnabled()).toBe(true)
  await action.focus()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Space')
  await expect.poll(() => page.locator('.click-count').textContent()).toBe('已触发 2 次交互')
  expect(await action.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid')
})

test('reflects variant selection in the samples, preview and current code', async () => {
  const outlined = page.getByRole('button', { name: '预览 Outlined' })
  await outlined.click()
  await expect.poll(() => configTrigger('变体').textContent()).toBe('Outlined')
  expect(await outlined.getAttribute('aria-pressed')).toBe('true')
  expect(await page.getByRole('button', { name: '预览 Filled' }).getAttribute('aria-pressed')).toBe(
    'false',
  )
  expect(await page.locator('.variant-example[data-selected="true"]').count()).toBe(1)
  expect(await page.locator('.preview-properties').textContent()).toBe('outline / md')
  expect(await page.getByLabel('当前组件代码', { exact: true }).textContent()).toContain(
    'variant="outline"',
  )

  await chooseConfig('变体', 'Text')
  await page.getByRole('radio', { name: '小', exact: true }).check()
  expect(await outlined.getAttribute('aria-pressed')).toBe('false')
  expect(await page.getByRole('button', { name: '预览 Text' }).getAttribute('aria-pressed')).toBe(
    'true',
  )
  expect(await page.locator('.preview-properties').textContent()).toBe('ghost / sm')
})

test('uses aligned themed configuration menus instead of native system popups', async () => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const panel = page.getByRole('complementary', { name: '组件配置' })
  const styleTrigger = configTrigger('设计风格')
  const variantTrigger = configTrigger('变体')
  expect(await panel.getByRole('combobox').count()).toBe(0)
  expect((await styleTrigger.boundingBox())!.height).toBe(44)
  expect((await variantTrigger.boundingBox())!.height).toBe(44)

  for (const style of ['clean', 'endfield', 'minimal', 'soft', 'brutalist']) {
    await chooseConfig('全局风格', styleLabels[style])
    for (const mode of ['light', 'dark']) {
      await chooseDemoSelect(page, '页面主题', mode)
      await styleTrigger.click()
      const menu = page.getByRole('listbox', { name: '设计风格' })
      await menu.waitFor()
      const popover = page.locator('.zx-options-popover')
      const triggerBox = (await styleTrigger.boundingBox())!
      const menuBox = (await popover.boundingBox())!
      expect(Math.abs(menuBox.x - triggerBox.x)).toBeLessThanOrEqual(1)
      expect(Math.abs(menuBox.width - triggerBox.width)).toBeLessThanOrEqual(1)
      expect(menuBox.y).toBeGreaterThanOrEqual(triggerBox.y + triggerBox.height)
      expect(await popover.getAttribute('data-zx-style')).toBe(style)
      expect(await popover.getAttribute('data-zx-color-mode')).toBe(mode)
      expect(
        await popover.evaluate((element) =>
          getComputedStyle(element).getPropertyValue('--zx-text'),
        ),
      ).toBe(
        await styleTrigger.evaluate((element) =>
          getComputedStyle(element).getPropertyValue('--zx-text'),
        ),
      )
      expect(await popover.evaluate((element) => getComputedStyle(element).backdropFilter)).toBe(
        'none',
      )
      expect(await menu.getByRole('option').allTextContents()).toEqual([
        '跟随全局',
        ...styleOptions.map((item) => item.name),
      ])
      expect(await menu.getByRole('option', { selected: true }).textContent()).toBe('跟随全局')
      expect(await menu.locator('.zx-picker-option-check').count()).toBe(1)
      await page.keyboard.press('Escape')
      await expect.poll(() => styleTrigger.getAttribute('aria-expanded')).toBe('false')
      await expect
        .poll(() => styleTrigger.evaluate((element) => element === document.activeElement))
        .toBe(true)
    }
  }
})

test('supports keyboard selection, cancellation and focus return in configuration menus', async () => {
  const trigger = configTrigger('变体')
  await trigger.focus()
  await page.keyboard.press('Enter')
  await page.getByRole('listbox').waitFor()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await expect.poll(() => trigger.textContent()).toBe('Text')
  expect(await page.getByRole('button', { name: '触发交互' }).getAttribute('data-variant')).toBe(
    'ghost',
  )
  expect(await page.getByLabel('当前组件代码', { exact: true }).textContent()).toContain(
    'variant="ghost"',
  )
  await expect
    .poll(() => trigger.evaluate((element) => element === document.activeElement))
    .toBe(true)
  expect(await trigger.getAttribute('data-focus-visible')).not.toBeNull()
  expect(await trigger.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid')

  await page.keyboard.press('Space')
  await page.getByRole('listbox').waitFor()
  await page.keyboard.press('Home')
  await page.keyboard.press('Escape')
  await expect.poll(() => trigger.getAttribute('aria-expanded')).toBe('false')
  expect(await trigger.textContent()).toBe('Text')
  await expect
    .poll(() => trigger.evaluate((element) => element === document.activeElement))
    .toBe(true)
  await page.keyboard.press('Tab')
  expect(
    await page
      .getByRole('radio', { name: '中', exact: true })
      .evaluate((element) => element === document.activeElement),
  ).toBe(true)

  await chooseConfig('设计风格', 'Soft')
  await configTrigger('设计风格').click()
  expect(
    await page.getByRole('listbox').getByRole('option', { selected: true }).textContent(),
  ).toBe('Soft')
  await page.mouse.click(8, 8)
  await expect.poll(() => configTrigger('设计风格').getAttribute('aria-expanded')).toBe('false')
  expect(await configTrigger('设计风格').textContent()).toBe('Soft')
})

test('keeps configuration menus touch-sized and inside narrow and zoom-equivalent viewports', async () => {
  const touchContext = await browser.newContext({
    baseURL: app!.url,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
  })
  try {
    const touchPage = await touchContext.newPage()
    touchPage.on('pageerror', (error) => errors.push(error.message))
    touchPage.setDefaultTimeout(5000)
    await touchPage.goto('/')
    await touchPage.getByRole('button', { name: '触发交互', exact: true }).tap()
    for (const width of [390, 320, 720]) {
      await touchPage.setViewportSize({ width, height: width === 720 ? 450 : 844 })
      const trigger = touchPage.getByRole('button', { name: /变体/ })
      expect((await trigger.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      await trigger.tap()
      const menu = touchPage.getByRole('listbox')
      await menu.waitFor()
      const box = (await menu.boundingBox())!
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(width)
      expect(box.y).toBeGreaterThanOrEqual(0)
      expect(box.y + box.height).toBeLessThanOrEqual(width === 720 ? 450 : 844)
      for (const option of await menu.getByRole('option').all()) {
        expect((await option.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      }
      await menu.getByRole('option', { name: 'Outlined', exact: true }).tap()
      expect(await trigger.textContent()).toBe('Outlined')
      expect(
        await touchPage.getByRole('button', { name: '触发交互' }).getAttribute('data-variant'),
      ).toBe('outline')
      expect(
        await touchPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      ).toBe(true)
    }
  } finally {
    await touchContext.close()
  }
})

test('shares light and dark colors between every expression and the page theme', async () => {
  const preview = page.getByTestId('preview')
  for (const style of ['clean', 'minimal', 'soft', 'brutalist', 'endfield']) {
    await chooseConfig('设计风格', styleLabels[style])
    await chooseDemoSelect(page, '页面主题', 'light')
    const light = await preview.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--zx-surface'),
    )
    await chooseDemoSelect(page, '页面主题', 'dark')
    await expect.poll(() => preview.getAttribute('data-zx-color-mode')).toBe('dark')
    expect(await demoSelectValue(page, '预览主题')).toBe('dark')
    const dark = await preview.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--zx-surface'),
    )
    expect(dark).not.toBe(light)
    expect(await page.locator('html').getAttribute('data-zx-color-mode')).toBe('dark')
    expect(await page.getByLabel('当前组件代码', { exact: true }).textContent()).toContain(
      'data-zx-color-mode="dark"',
    )
    await chooseDemoSelect(page, '预览主题', 'light')
    await expect.poll(() => page.locator('html').getAttribute('data-zx-color-mode')).toBe('light')
    expect(await demoSelectValue(page, '页面主题')).toBe('light')
    expect(
      await preview.evaluate((element) =>
        getComputedStyle(element).getPropertyValue('--zx-surface'),
      ),
    ).toBe(light)
  }
})

test('keeps Clean text and control boundaries legible in both color modes', async () => {
  for (const mode of ['light', 'dark']) {
    await chooseDemoSelect(page, '预览主题', mode)
    const contrasts = await page.getByTestId('preview').evaluate((preview) => {
      const probe = document.createElement('span')
      preview.append(probe)
      function luminance(color: string) {
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = 1
        const context = canvas.getContext('2d')!
        context.fillStyle = color
        context.fillRect(0, 0, 1, 1)
        const channels = Array.from(context.getImageData(0, 0, 1, 1).data)
          .slice(0, 3)
          .map((value) => {
            const srgb = value / 255
            return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
          })
        return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
      }
      function contrast(foreground: string, background: string) {
        probe.style.color = `var(${foreground})`
        probe.style.backgroundColor = `var(${background})`
        const computed = getComputedStyle(probe)
        const a = luminance(computed.color)
        const b = luminance(computed.backgroundColor)
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
      }
      const result = {
        filled: contrast('--zx-on-accent', '--zx-accent'),
        hovered: contrast('--zx-on-accent', '--zx-accent-hover'),
        tonal: contrast('--zx-on-tonal', '--zx-tonal'),
        body: contrast('--zx-text', '--zx-surface-subtle'),
        supporting: contrast('--zx-muted', '--zx-surface-subtle'),
        outlined: contrast('--zx-control-border', '--zx-surface-subtle'),
      }
      probe.remove()
      return result
    })
    for (const key of ['filled', 'hovered', 'tonal', 'body', 'supporting'] as const) {
      expect(contrasts[key]).toBeGreaterThanOrEqual(4.5)
    }
    expect(contrasts.outlined).toBeGreaterThanOrEqual(3)
  }
})

test('resets nested clean and legacy scopes instead of inheriting dark or brutalist tokens', async () => {
  const result = await page.evaluate(() => {
    const outer = document.createElement('div')
    outer.dataset.zxStyle = 'brutalist'
    outer.dataset.zxColorMode = 'dark'
    const read = (style: string, mode?: string) => {
      const inner = document.createElement('div')
      inner.dataset.zxStyle = style
      if (mode) inner.dataset.zxColorMode = mode
      inner.style.background = 'var(--zx-surface)'
      const button = document.createElement('button')
      button.className = 'zx-button'
      inner.append(button)
      outer.append(inner)
      const computed = getComputedStyle(button)
      return {
        surface: getComputedStyle(inner).backgroundColor,
        radius: computed.borderRadius,
        shadow: computed.boxShadow,
        border: computed.borderTopWidth,
        scheme: getComputedStyle(inner).colorScheme,
        weight: computed.fontWeight,
        height: computed.minHeight,
        easing: computed.transitionTimingFunction,
      }
    }
    document.body.append(outer)
    const tokens = { clean: read('clean'), dark: read('clean', 'dark'), minimal: read('minimal') }
    outer.remove()
    return tokens
  })
  expect(result.clean).toEqual({
    surface: 'rgb(254, 247, 255)',
    radius: '9999px',
    shadow: 'none',
    border: '1px',
    scheme: 'light',
    weight: '500',
    height: '48px',
    easing: 'cubic-bezier(0.2, 0, 0, 1), cubic-bezier(0.2, 0, 0, 1), cubic-bezier(0.2, 0, 0, 1)',
  })
  expect(result.dark.surface).toBe('rgb(20, 18, 24)')
  expect(result.dark.scheme).toBe('dark')
  expect(result.minimal.surface).toBe('rgb(255, 255, 255)')
  expect(result.minimal.radius).toBe('6px')
  expect(result.minimal.weight).toBe('600')
  expect(result.minimal.height).toBe('44px')
  expect(result.minimal.easing).toBe('ease, ease, ease')
})

test('renders non-Material and new design languages without loading Clean', async () => {
  const styles = await Promise.all(
    [
      'base.css',
      'themes/minimal.css',
      'themes/soft.css',
      'themes/brutalist.css',
      'themes/endfield.css',
    ].map((path) => readFile(`packages/react/src/${path}`, 'utf8')),
  )
  const independent = await context.newPage()
  independent.on('pageerror', (error) => errors.push(error.message))
  try {
    await independent.setContent(`<!doctype html>
      <html lang="zh-CN"><head><style>
        ${styles.join('\n')}
        [data-zx-style='custom'] {
          --zx-accent: #75482f;
          --zx-on-accent: #ffffff;
          --zx-radius: 2px;
          --zx-label-size: 18px;
          --zx-label-weight: 700;
          --zx-label-line-height: 1.75;
          --zx-motion-duration-short: 450ms;
          --zx-motion-easing: linear;
          --zx-button-height: 60px;
        }
      </style></head><body>
        ${['minimal', 'soft', 'brutalist', 'endfield', 'custom']
          .map(
            (style) =>
              `<div data-zx-style="${style}">
            <button class="zx-button">${style}</button>
          </div>`,
          )
          .join('')}
        <div data-zx-style="soft" data-zx-color-mode="dark">
          <button class="zx-button" disabled aria-busy="true">
            <span class="zx-button__spinner"></span>正在保存
          </button>
        </div>
      </body></html>`)
    expect(
      await independent
        .locator('html')
        .evaluate((root) => getComputedStyle(root).getPropertyValue('--md-sys-color-primary')),
    ).toBe('')
    const endfield = await independent
      .getByRole('button', { name: 'endfield', exact: true })
      .evaluate((element) => {
        const style = getComputedStyle(element)
        return { color: style.backgroundColor, radius: style.borderRadius, height: style.minHeight }
      })
    expect(endfield).toEqual({ color: 'rgb(255, 250, 0)', radius: '0px', height: '48px' })

    for (const [style, color] of Object.entries({
      minimal: 'rgb(37, 86, 63)',
      soft: 'rgb(113, 80, 154)',
      brutalist: 'rgb(229, 243, 106)',
    })) {
      const properties = await independent
        .getByRole('button', { name: style, exact: true })
        .evaluate((button) => {
          const computed = getComputedStyle(button)
          return {
            color: computed.backgroundColor,
            size: computed.fontSize,
            weight: computed.fontWeight,
            height: computed.minHeight,
          }
        })
      expect(properties).toEqual({ color, size: '14px', weight: '600', height: '44px' })
    }
    const custom = await independent
      .getByRole('button', { name: 'custom', exact: true })
      .evaluate((button) => {
        const computed = getComputedStyle(button)
        return {
          color: computed.backgroundColor,
          radius: computed.borderRadius,
          size: computed.fontSize,
          weight: computed.fontWeight,
          lineHeight: computed.lineHeight,
          height: computed.minHeight,
          duration: computed.transitionDuration,
          easing: computed.transitionTimingFunction,
        }
      })
    expect(custom).toEqual({
      color: 'rgb(117, 72, 47)',
      radius: '2px',
      size: '18px',
      weight: '700',
      lineHeight: '31.5px',
      height: '60px',
      duration: '0.45s, 0.45s, 0.45s',
      easing: 'linear, linear, linear',
    })
    expect(
      await independent
        .locator('.zx-button__spinner')
        .evaluate((spinner) => getComputedStyle(spinner).borderRadius),
    ).toBe('50%')
    expect(
      await independent
        .getByRole('button', { name: '正在保存' })
        .evaluate((button) => getComputedStyle(button).backgroundColor),
    ).toBe('rgb(214, 183, 244)')
  } finally {
    await independent.close()
  }
})

test('allows explicit legacy themes on the root element as well as nested scopes', async () => {
  const palettes = await page.evaluate(() => {
    const root = document.documentElement
    const original = root.getAttribute('data-zx-style')
    const colors: Record<string, string> = {}
    for (const style of ['clean', 'minimal', 'soft', 'brutalist']) {
      root.dataset.zxStyle = style
      colors[style] = getComputedStyle(root).getPropertyValue('--zx-accent').trim()
    }
    if (original === null) root.removeAttribute('data-zx-style')
    else root.setAttribute('data-zx-style', original)
    return colors
  })
  expect(palettes).toEqual({
    clean: '#8b5cf6',
    minimal: '#25563f',
    soft: '#71509a',
    brutalist: '#e5f36a',
  })
})

test('copies the current code and reports a recoverable clipboard failure', async () => {
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          document.documentElement.dataset.copiedCode = text
        },
      },
    })
  })
  await chooseConfig('变体', 'Tonal')
  await page.getByRole('button', { name: '复制代码' }).click()
  await expect.poll(() => page.getByRole('status').filter({ hasText: '已复制' }).count()).toBe(1)
  expect(await page.getByRole('button', { name: '已复制', exact: true }).count()).toBe(1)
  expect(await page.locator('html').getAttribute('data-copied-code')).toBe(
    await page.getByLabel('当前组件代码', { exact: true }).textContent(),
  )
  await chooseConfig('变体', 'Outlined')
  await expect.poll(() => page.getByRole('status').filter({ hasText: '已复制' }).count()).toBe(0)

  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('Permission denied')
        },
      },
    })
  })
  await page.getByRole('button', { name: '复制代码' }).click()
  await expect
    .poll(() => page.getByRole('status').filter({ hasText: '请选中代码手动复制' }).count())
    .toBe(1)
  expect(await page.getByRole('button', { name: '复制失败，重试', exact: true }).count()).toBe(1)
  expect(await configTrigger('变体').textContent()).toBe('Outlined')
})

test('fits mobile, navigates and respects reduced motion', async () => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(
    await page
      .getByTestId('preview')
      .evaluate((element) => getComputedStyle(element).transitionDuration),
  ).toBe('0s')
  await page.getByRole('link', { name: '设计原则', exact: true }).click()
  await expect
    .poll(() => page.getByRole('heading', { level: 1 }).textContent())
    .toBe('先统一行为，再表达风格。')
  await page.reload()
  expect(await page.getByRole('heading', { level: 1 }).textContent()).toBe(
    '先统一行为，再表达风格。',
  )
  await page.getByRole('link', { name: '组件', exact: true }).click()
  await expect.poll(() => page.getByRole('heading', { level: 1 }).textContent()).toBe('Button')
})

test('serves meaningful SSR content with JavaScript disabled', async () => {
  const noJS = await browser.newContext({ javaScriptEnabled: false })
  try {
    const ssr = await noJS.newPage()
    const response = await ssr.goto(app!.url)
    expect(response?.status()).toBe(200)
    expect(await ssr.getByRole('heading', { level: 1 }).textContent()).toBe('Button')
    // Nasti injects development CSS through JavaScript. This checks SSR semantics;
    // no-JS production styling requires a separate build/preview validation.
    expect(await ssr.getByRole('button', { name: '触发交互' }).getAttribute('type')).toBe('button')
    expect(await ssr.getByRole('button', { name: '触发交互' }).getAttribute('data-variant')).toBe(
      'solid',
    )
  } finally {
    await noJS.close()
  }
})

test('captures the real desktop, mobile, dark and zoomed layouts with Playwright', async () => {
  const directory = process.env.UI_KITS_SCREENSHOT_DIR
  if (directory) await mkdir(directory, { recursive: true })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  async function capture(name: string, fullPage = false) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (directory) await page.screenshot({ path: join(directory, `${name}.png`), fullPage })
  }
  expect((await page.getByTestId('preview').boundingBox())!.y).toBeLessThan(420)
  await capture('desktop')
  await capture('desktop-full', true)
  await chooseDemoSelect(page, '预览主题', 'dark')
  await capture('desktop-dark')
  await chooseDemoSelect(page, '预览主题', 'light')
  for (const style of ['minimal', 'soft', 'brutalist']) {
    await chooseConfig('设计风格', styleLabels[style])
    if (directory)
      await page
        .getByTestId('preview')
        .screenshot({ path: join(directory, `preview-${style}.png`) })
  }
  await chooseConfig('设计风格', 'Clean')
  await page.setViewportSize({ width: 390, height: 844 })
  expect((await page.getByTestId('preview').boundingBox())!.y).toBeLessThan(480)
  await capture('mobile')
  await capture('mobile-full', true)
  // A 1440×900 window at 200% zoom has a 720×450 CSS viewport.
  // Halve the viewport as well as doubling pixel density, so breakpoints reflow.
  const zoomContext = await browser.newContext({
    baseURL: app!.url,
    viewport: { width: 720, height: 450 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  })
  try {
    const zoomPage = await zoomContext.newPage()
    await zoomPage.goto('/')
    await zoomPage.getByRole('button', { name: '触发交互' }).click()
    await expect.poll(() => zoomPage.locator('.click-count').textContent()).toBe('已触发 1 次交互')
    expect(await zoomPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    )
    if (directory) await zoomPage.screenshot({ path: join(directory, 'desktop-200-percent.png') })
  } finally {
    await zoomContext.close()
  }
})

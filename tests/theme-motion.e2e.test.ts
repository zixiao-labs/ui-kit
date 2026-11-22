import { afterAll, afterEach, beforeAll, beforeEach, expect, test } from '@lightning-js/lightning'
import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'
import { contrastRatio, createTheme } from '../packages/react/src/theme'
import { startDemo } from './dev-server'
import { chooseDemoSelect, demoSelectValue } from './select-helpers'

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
    colorScheme: 'light',
  })
  page.setDefaultTimeout(5000)
  errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await page.getByRole('button', { name: '触发交互', exact: true }).click()
  await expect.poll(() => page.locator('.click-count').textContent()).toBe('已触发 1 次交互')
})
afterEach(async () => {
  try {
    expect(errors).toEqual([])
  } finally {
    await page?.context().close()
  }
})

async function select(name: string) {
  await page.locator('.directory-groups').getByRole('button', { name, exact: true }).click()
  await expect.poll(() => page.locator('h1').textContent()).toBe(name)
}

async function token(selector: string, name: string) {
  return page
    .locator(selector)
    .evaluate(
      (element, property) => getComputedStyle(element).getPropertyValue(property).trim(),
      name,
    )
}

async function expectMode(mode: 'light' | 'dark') {
  const scopes = page.locator(
    'html, [data-testid="preview"], .variant-grid, .color-grid, .component-demo',
  )
  const expected = Array<string>(await scopes.count()).fill(mode)
  await expect
    .poll(() =>
      scopes.evaluateAll((elements) =>
        elements.map((element) => element.getAttribute('data-zx-color-mode')),
      ),
    )
    .toEqual(expected)
}

async function observeMotion() {
  await page.evaluate(() => {
    document.documentElement.dataset.motionLog = '[]'
    for (const eventName of ['animationstart', 'transitionrun']) {
      document.addEventListener(eventName, (event) => {
        const target = event.target
        if (!(target instanceof Element)) return
        const log: string[] = JSON.parse(document.documentElement.dataset.motionLog!)
        const motion =
          event instanceof AnimationEvent
            ? event.animationName
            : (event as TransitionEvent).propertyName
        log.push(`${target.tagName}:${motion}`)
        for (const name of target.classList) log.push(`${name}:${motion}`)
        document.documentElement.dataset.motionLog = JSON.stringify(log)
      })
    }
  })
}

async function sawMotion(value: string) {
  await expect.poll(() => page.locator('html').getAttribute('data-motion-log')).toContain(value)
}

test('shows bright supporting selections and exact secondary swatches in native and custom themes', async () => {
  for (const preset of [
    { name: null, secondary: '#fcd34d' },
    { name: '紫霄', secondary: '#fcd34d' },
    { name: '松林', secondary: '#e8b86d' },
    { name: '海岸', secondary: '#edb9a2' },
    { name: '朱砂', secondary: '#e1bb67' },
    { name: '鹤坡', secondary: '#c4a787' },
    { name: '鹤坡·室内', secondary: '#d8bd88' },
    { name: '青岛蓬仙', secondary: '#8f1d22' },
    { name: '霓衣云君', secondary: '#2e59a7' },
    { name: '丹炉飞龙', secondary: '#5aa4ae' },
  ]) {
    if (preset.name) {
      await page.getByRole('button', { name: `${preset.name}配色`, exact: true }).click()
    }
    for (const mode of ['light', 'dark'] as const) {
      await chooseDemoSelect(page, '页面主题', mode)
      const expected = createTheme({ secondary: preset.secondary }, mode === 'dark')
      expect(await token('html', '--zx-tonal')).toBe(expected['--zx-tonal'])
      expect(await token('html', '--zx-on-tonal')).toBe(expected['--zx-on-tonal'])
      expect(
        contrastRatio(expected['--zx-on-tonal'], expected['--zx-tonal']),
      ).toBeGreaterThanOrEqual(4.5)
      const swatch = page.locator('.token-swatches [title="Secondary"]')
      expect(await swatch.count()).toBe(1)
      expect(
        await swatch.evaluate((element) => {
          const probe = document.createElement('span')
          probe.style.background = 'var(--zx-secondary)'
          element.append(probe)
          const matches =
            getComputedStyle(element).backgroundColor === getComputedStyle(probe).backgroundColor
          probe.remove()
          return matches
        }),
      ).toBe(true)
      expect(await token('[data-testid="preview"]', '--zx-secondary')).toBe(preset.secondary)
      await page.getByRole('button', { name: /全局风格/ }).click()
      const menu = page.getByRole('listbox', { name: '全局风格', exact: true })
      expect(await token('.zx-picker-option[data-selected]', '--zx-tonal')).toBe(
        expected['--zx-tonal'],
      )
      expect(
        await menu.getByRole('option', { name: 'Clean', exact: true }).evaluate((element) => {
          const probe = document.createElement('span')
          probe.style.background = 'var(--zx-tonal)'
          probe.style.color = 'var(--zx-on-tonal)'
          element.append(probe)
          const selected = getComputedStyle(element)
          const paired = getComputedStyle(probe)
          const matches =
            selected.backgroundColor === paired.backgroundColor && selected.color === paired.color
          probe.remove()
          return matches
        }),
      ).toBe(true)
      await page.keyboard.press('Escape')
      await menu.waitFor({ state: 'detached' })
    }
  }
})

test('adapts shell and preview, persists settings, exports both modes and resets', async () => {
  const before = await token('html', '--zx-surface')
  await page.getByRole('button', { name: '松林配色', exact: true }).click()
  expect(await token('html', '--zx-accent')).toBe('#28745b')
  expect(await token('html', '--zx-surface')).not.toBe(before)
  expect(await token('[data-testid="preview"]', '--zx-accent')).toBe('#28745b')
  await page.getByLabel('主色', { exact: true }).fill('#3269b1')
  await page.getByLabel('辅助色', { exact: true }).fill('#fcd34d')
  await page.getByLabel('主题圆角', { exact: true }).fill('20')
  await chooseDemoSelect(page, '页面主题', 'dark')
  await page.reload()
  await expect.poll(() => token('html', '--zx-accent')).toBe('#3269b1')
  expect(await page.getByLabel('主色', { exact: true }).inputValue()).toBe('#3269b1')
  expect(await page.getByLabel('主题圆角').inputValue()).toBe('20')
  expect(await page.locator('html').getAttribute('data-zx-color-mode')).toBe('dark')
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByRole('button', { name: '复制主题 CSS', exact: true }).click()
  const css = await page.evaluate(() => navigator.clipboard.readText())
  expect(css).toContain('--zx-accent: #3269b1')
  expect(css).toContain('--zx-radius: 20px')
  expect(css).toContain('[data-zx-color-mode="dark"]')
  await page.getByRole('button', { name: '恢复默认主题', exact: true }).click()
  await page.reload()
  await expect.poll(() => token('html', '--zx-accent')).toBe('#8b5cf6')
  expect(await page.locator('html').getAttribute('data-zx-color-mode')).toBe('light')
})

test('opts into Zixiao dark optimization, exports Tailwind setup and leaves other palettes alone', async () => {
  const lightSurface = await token('html', '--zx-surface')
  await page.getByRole('checkbox', { name: /紫霄深色优化/ }).check()
  expect(await token('html', '--zx-accent')).toBe('#8b5cf6')
  expect(await token('html', '--zx-surface')).toBe(lightSurface)
  await chooseDemoSelect(page, '页面主题', 'dark')
  await expect.poll(() => token('html', '--zx-accent')).toBe('#422256')
  expect(await token('html', '--zx-secondary')).toBe('#d7a547')
  expect(await token('[data-testid="preview"]', '--zx-accent')).toBe('#422256')
  await page.reload()
  await expect.poll(() => token('html', '--zx-accent')).toBe('#422256')
  expect(await page.getByRole('checkbox', { name: /紫霄深色优化/ }).isChecked()).toBe(true)
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByRole('checkbox', { name: 'Tailwind CSS 导出', exact: true }).check()
  await page.getByRole('button', { name: '复制主题 CSS', exact: true }).click()
  const native = await page.evaluate(() => navigator.clipboard.readText())
  expect(native).toContain("@import 'tailwindcss';")
  expect(native).toContain("@import '@zixiao-labs/ui-kits-react/tailwind.css';")
  expect(native).toContain("themes/clean.css' layer(components)")
  expect(native).toContain('[data-zx-theme="custom"][data-zx-color-mode="dark"]')
  expect(native).toContain('--zx-accent: #422256;')
  expect(native).not.toContain('[data-zx-theme="custom"] {')
  await page.getByRole('button', { name: '紫霄配色', exact: true }).click()
  await page.getByRole('button', { name: '复制主题 CSS', exact: true }).click()
  const custom = await page.evaluate(() => navigator.clipboard.readText())
  expect(custom).toContain('--zx-accent: #8b5cf6;')
  expect(custom).toContain('--zx-accent: #422256;')
  expect(custom).toContain('[data-zx-theme="custom"][data-zx-color-mode="dark"]')
  for (const [name, primary, secondary] of [
    ['青岛蓬仙', '#47b79c', '#8f1d22'],
    ['霓衣云君', '#f3a694', '#2e59a7'],
    ['丹炉飞龙', '#e94829', '#5aa4ae'],
  ]) {
    await page.getByRole('button', { name: `${name}配色`, exact: true }).click()
    expect(await token('html', '--zx-accent')).toBe(primary)
    expect(await token('html', '--zx-secondary')).toBe(secondary)
    expect(await page.getByRole('checkbox', { name: /紫霄深色优化/ }).count()).toBe(0)
  }
  await page.getByRole('button', { name: '紫霄配色', exact: true }).click()
  await page.getByRole('checkbox', { name: /紫霄深色优化/ }).uncheck()
  expect(await token('html', '--zx-accent')).toBe('#8b5cf6')
})

test('customizes both font roles without recoloring native styles, persists, exports and themes portals', async () => {
  await page.getByText('自定义字体', { exact: true }).click()
  const bodyFont = '"Noto Sans SC", sans-serif'
  const titleFont = '"Noto Serif SC", serif'
  const nativeRadius = await token('html', '--zx-radius')
  await page.getByLabel('正文字体', { exact: true }).fill(bodyFont)
  await page.getByLabel('标题字体', { exact: true }).fill(titleFont)
  expect(await token('html', '--zx-font')).toBe(bodyFont)
  expect(await token('[data-testid="preview"]', '--zx-font-display')).toBe(titleFont)
  expect(await token('html', '--zx-radius')).toBe(nativeRadius)
  expect(await page.getByLabel('当前组件代码', { exact: true }).textContent()).toContain(
    '--zx-font',
  )
  await chooseDemoSelect(page, '设计风格', 'hepo')
  expect(await token('[data-testid="preview"]', '--zx-font')).not.toBe(bodyFont)
  expect(await token('[data-testid="preview"]', '--zx-font-display')).not.toBe(titleFont)
  await chooseDemoSelect(page, '设计风格', 'clean')
  expect(await token('[data-testid="preview"]', '--zx-font')).toBe(bodyFont)
  await page.getByLabel('正文字体', { exact: true }).fill('serif; color: red')
  expect(await page.getByLabel('正文字体', { exact: true }).getAttribute('aria-invalid')).toBe(
    'true',
  )
  expect(await token('html', '--zx-font')).toBe(bodyFont)
  await page.reload()
  await expect.poll(() => token('html', '--zx-font')).toBe(bodyFont)
  expect(await token('html', '--zx-font-display')).toBe(titleFont)
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByRole('button', { name: '复制主题 CSS', exact: true }).click()
  const css = await page.evaluate(() => navigator.clipboard.readText())
  expect(css).toContain('--zx-font: "Noto Sans SC", sans-serif;')
  expect(css).toContain('--zx-font-display: "Noto Serif SC", serif;')
  expect(css).toContain('[data-zx-theme="custom"] {')
  expect(css).not.toContain('--zx-accent:')
  await select('Modal')
  await page.getByRole('button', { name: '项目详情', exact: true }).click()
  expect(await token('.zx-modal-overlay', '--zx-font')).toBe(bodyFont)
  await page.locator('.zx-modal .zx-select-trigger').click()
  expect(await token('.zx-picker-popover', '--zx-font-display')).toBe(titleFont)
  await page.keyboard.press('Escape')
  await page.locator('.zx-picker-popover').waitFor({ state: 'detached' })
  await page.keyboard.press('Escape')
  await page.locator('.zx-modal-overlay').waitFor({ state: 'detached' })
  await page.getByRole('button', { name: '恢复默认主题', exact: true }).click()
  expect(await token('html', '--zx-font')).not.toBe(bodyFont)
  expect(await token('html', '--zx-font-display')).not.toBe(titleFont)
  await page.evaluate(() => {
    const stored = JSON.parse(localStorage.getItem('zx-ui-theme-v1')!)
    stored.fontFamily = 'serif; color: red'
    stored.displayFontFamily = 'url(https://example.com/font)'
    localStorage.setItem('zx-ui-theme-v1', JSON.stringify(stored))
  })
  await page.reload()
  await expect.poll(() => page.locator('html').getAttribute('data-zx-style')).toBe('clean')
  expect(await token('html', '--zx-font')).not.toContain('color:')
  expect(await token('html', '--zx-font-display')).not.toContain('url(')
})

test('defaults to the system theme and updates every preview and custom token live', async () => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.reload()
  await expectMode('dark')
  expect(await demoSelectValue(page, '页面主题')).toBe('system')
  expect(await demoSelectValue(page, '预览主题')).toBe('system')
  expect(await page.getByLabel('当前组件代码', { exact: true }).textContent()).toContain(
    'data-zx-color-mode="dark"',
  )
  const darkSurface = await token('[data-testid="preview"]', '--zx-surface')
  await page.emulateMedia({ colorScheme: 'light' })
  await expectMode('light')
  expect(await token('[data-testid="preview"]', '--zx-surface')).not.toBe(darkSurface)
  expect(await page.getByLabel('当前组件代码', { exact: true }).textContent()).toContain(
    'data-zx-color-mode="light"',
  )

  await page.getByRole('button', { name: '松林配色', exact: true }).click()
  const lightSurface = await token('html', '--zx-surface')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expectMode('dark')
  expect(await token('html', '--zx-surface')).not.toBe(lightSurface)
  for (const selector of ['[data-testid="preview"]', '.variant-grid', '.color-grid']) {
    expect(await token(selector, '--zx-surface')).toBe(await token('html', '--zx-surface'))
    expect(await token(selector, '--zx-accent')).toBe('#28745b')
  }
  await page.reload()
  await expectMode('dark')
  expect(await demoSelectValue(page, '页面主题')).toBe('system')
  await page.emulateMedia({ colorScheme: 'light' })
  await expectMode('light')
  expect(await token('html', '--zx-surface')).toBe(lightSurface)
})

test('persists explicit modes, ignores system changes until reselected and resets to system', async () => {
  for (const mode of ['dark', 'light'] as const) {
    const opposite = mode === 'dark' ? 'light' : 'dark'
    await chooseDemoSelect(page, '页面主题', mode)
    await expectMode(mode)
    await page.emulateMedia({ colorScheme: opposite })
    await expectMode(mode)
    await page.reload()
    await expectMode(mode)
    expect(await demoSelectValue(page, '预览主题')).toBe(mode)
    await chooseDemoSelect(page, '预览主题', 'system')
    await expectMode(opposite)
    expect(await demoSelectValue(page, '页面主题')).toBe('system')
    await page.emulateMedia({ colorScheme: mode })
    await expectMode(mode)
  }
  await chooseDemoSelect(page, '页面主题', 'system')
  await page.reload()
  await expectMode('light')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expectMode('dark')
  await chooseDemoSelect(page, '页面主题', 'light')
  await page.getByRole('button', { name: '恢复默认主题', exact: true }).click()
  await expectMode('dark')
  expect(await demoSelectValue(page, '页面主题')).toBe('system')
})

test('shares theme selection across component navigation and the mobile controls', async () => {
  await chooseDemoSelect(page, '页面主题', 'dark')
  await select('TextField')
  await expectMode('dark')
  expect(await demoSelectValue(page, '样本主题')).toBe('dark')
  await chooseDemoSelect(page, '样本主题', 'light')
  await expectMode('light')
  expect(await demoSelectValue(page, '页面主题')).toBe('light')
  await select('Button')
  await expectMode('light')
  await page.setViewportSize({ width: 390, height: 844 })
  await chooseDemoSelect(page, '预览主题', 'system')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expectMode('dark')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await chooseDemoSelect(page, '选择组件', 'TextField')
  await expectMode('dark')
  expect(await demoSelectValue(page, '样本主题')).toBe('system')
})

test('preserves legacy light and dark preferences with their custom theme settings', async () => {
  for (const dark of [true, false]) {
    await page.evaluate((legacyDark) => {
      localStorage.setItem(
        'zx-ui-theme-v1',
        JSON.stringify({
          primary: '#28745b',
          secondary: '#e8b86d',
          radius: 20,
          customized: true,
          dark: legacyDark,
        }),
      )
    }, dark)
    await page.emulateMedia({ colorScheme: dark ? 'light' : 'dark' })
    await page.reload()
    await expectMode(dark ? 'dark' : 'light')
    expect(await demoSelectValue(page, '页面主题')).toBe(dark ? 'dark' : 'light')
    expect(await token('html', '--zx-accent')).toBe('#28745b')
    expect(await token('[data-testid="preview"]', '--zx-radius')).toBe('20px')
  }
})

test('keeps open nested portals in sync with system theme changes', async () => {
  await page.getByRole('button', { name: '松林配色', exact: true }).click()
  await select('Modal')
  await page.getByRole('button', { name: '项目详情', exact: true }).click()
  await page.locator('.zx-modal .zx-select-trigger').click()
  for (const mode of ['dark', 'light'] as const) {
    await page.emulateMedia({ colorScheme: mode })
    await expectMode(mode)
    const surface = await token('html', '--zx-surface')
    for (const selector of ['.zx-modal-overlay', '.zx-picker-popover']) {
      await expect.poll(() => token(selector, '--zx-surface')).toBe(surface)
      expect(await token(selector, '--zx-accent')).toBe('#28745b')
    }
  }
})

test('keeps invalid colors out of the active theme and recovers from storage failure', async () => {
  const input = page.getByLabel('主色', { exact: true })
  await input.fill('#oops')
  expect(await input.getAttribute('aria-invalid')).toBe('true')
  expect(await token('html', '--zx-accent')).toBe('#8b5cf6')
  await input.fill('#28745b')
  expect(await input.getAttribute('aria-invalid')).toBe('false')
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error('Storage blocked')
    }
  })
  await page.getByRole('button', { name: '海岸配色', exact: true }).click()
  expect(await token('html', '--zx-accent')).toBe('#3269b1')
  expect(await page.getByText('浏览器未允许保存，主题仍可预览和复制').count()).toBe(1)
  await page.reload()
  await expect.poll(() => input.inputValue()).toBe('#28745b')
})

test('runs modal, drawer, sheet and anchored enter/exit lifecycles and restores focus', async () => {
  await observeMotion()
  for (const [name, triggerName, surface] of [
    ['Modal', '项目详情', '.zx-modal'],
    ['Drawer', '团队成员', '.zx-modal'],
    ['Sheet', '选择分享方式', '.zx-modal'],
    ['Popover', '项目说明', '.zx-popover'],
    ['Select', '', '.zx-picker-popover'],
  ]) {
    await select(name)
    const trigger =
      name === 'Select'
        ? page.getByRole('button', { name: /北岸设计负责人/ })
        : page.getByRole('button', { name: triggerName, exact: true })
    await trigger.click()
    await sawMotion(`${surface.slice(1)}:zx-overlay-in`)
    await page.keyboard.press('Escape')
    await sawMotion('zx-overlay-out')
    await expect.poll(() => page.locator(surface).count()).toBe(0)
    await expect
      .poll(() => trigger.evaluate((element) => element === document.activeElement))
      .toBe(true)
    await page.locator('html').evaluate((element) => {
      ;(element as HTMLElement).dataset.motionLog = '[]'
    })
  }
})

test('animates disclosure geometry, tab indicator and selection feedback without losing state', async () => {
  await observeMotion()
  await select('Disclosure')
  const trigger = page.getByRole('button', { name: '发布说明', exact: true })
  await trigger.click()
  await sawMotion('zx-disclosure__panel:height')
  expect(await trigger.getAttribute('aria-expanded')).toBe('true')
  await trigger.click()
  await trigger.click()
  await trigger.click()
  await expect.poll(() => trigger.getAttribute('aria-expanded')).toBe('false')
  await expect
    .poll(() =>
      page
        .locator('.zx-disclosure__panel')
        .first()
        .evaluate((element) => element.getBoundingClientRect().height),
    )
    .toBe(0)
  await select('Tabs')
  await page.getByRole('tab', { name: '项目', exact: true }).first().focus()
  await page.keyboard.press('ArrowRight')
  await sawMotion('zx-tabs__indicator:translate')
  expect(
    await page
      .getByRole('tab', { name: '成员', exact: true })
      .first()
      .getAttribute('aria-selected'),
  ).toBe('true')
  await select('Checkbox')
  const checkbox = page.locator('.demo-stage .zx-checkbox').first()
  const initial = await checkbox.getAttribute('data-selected')
  await checkbox.click()
  await sawMotion('zx-checkbox__box')
  expect(await checkbox.getAttribute('data-selected')).not.toBe(initial)
})

test('propagates dynamic tokens into nested portals and respects reduced motion', async () => {
  await page.getByRole('button', { name: '松林配色', exact: true }).click()
  await select('Modal')
  await chooseDemoSelect(page, '样本主题', 'dark')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const trigger = page.getByRole('button', { name: '项目详情', exact: true })
  await trigger.click()
  expect(await token('.zx-modal-overlay', '--zx-accent')).toBe('#28745b')
  expect(
    await page.locator('.zx-modal').evaluate((element) => element.getAnimations().length),
  ).toBe(0)
  await page.locator('.zx-modal .zx-select-trigger').click()
  expect(await token('.zx-picker-popover', '--zx-accent')).toBe('#28745b')
  expect(
    await page.locator('.zx-picker-popover').evaluate((element) => element.getAnimations().length),
  ).toBe(0)
  await page.keyboard.press('Escape')
  await page.locator('.zx-picker-popover').waitFor({ state: 'detached' })
  await expect
    .poll(() =>
      page
        .locator('.zx-modal .zx-select-trigger')
        .evaluate((element) => element === document.activeElement),
    )
    .toBe(true)
  await page.keyboard.press('Escape')
  await expect.poll(() => page.locator('.zx-modal-overlay').count()).toBe(0)
  await expect
    .poll(() => trigger.evaluate((element) => element === document.activeElement))
    .toBe(true)
})

test('animates tooltip and toast feedback, with a working no-view-transition fallback', async () => {
  await observeMotion()
  await select('Tooltip')
  const trigger = page.getByRole('button', { name: '了解成员权限', exact: true })
  await trigger.hover()
  await sawMotion('zx-tooltip:zx-overlay-in')
  await page.mouse.move(0, 0)
  await sawMotion('zx-tooltip:zx-overlay-out')
  await page.locator('.zx-tooltip').waitFor({ state: 'detached' })
  await select('Toast')
  await page.getByRole('button', { name: '显示评审提醒', exact: true }).click()
  await page.locator('.zx-toast').waitFor()
  const nativeTransition = await page.evaluate(
    () =>
      typeof document.startViewTransition === 'function' &&
      CSS.supports('view-transition-class', 'zx-toast'),
  )
  await sawMotion(nativeTransition ? 'HTML:zx-content-in' : 'zx-toast:zx-content-in')
  await page.getByRole('button', { name: '关闭通知', exact: true }).click()
  await expect.poll(() => page.locator('.zx-toast').count()).toBe(0)
  await page.evaluate(() => {
    Object.defineProperty(document, 'startViewTransition', { value: undefined, configurable: true })
  })
  await page.getByRole('button', { name: '可操作通知', exact: true }).click()
  await page.getByRole('button', { name: '撤销', exact: true }).click()
  expect(await page.locator('.demo-stage output').textContent()).toContain('已撤销归档')
  await page.getByRole('button', { name: '关闭通知', exact: true }).click()
  await expect.poll(() => page.locator('.zx-toast').count()).toBe(0)
})

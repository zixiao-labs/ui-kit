import { afterAll, afterEach, beforeAll, beforeEach, expect, test } from '@lightning-js/lightning'
import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'
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
  page = await browser.newPage({ baseURL: app.url, viewport: { width: 1440, height: 900 } })
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

test('adapts shell and preview, persists settings, exports both modes and resets', async () => {
  const before = await token('html', '--zx-surface')
  await page.getByRole('button', { name: '松林配色', exact: true }).click()
  expect(await token('html', '--zx-accent')).toBe('#28745b')
  expect(await token('html', '--zx-surface')).not.toBe(before)
  expect(await token('[data-testid="preview"]', '--zx-accent')).toBe('#28745b')
  await page.getByLabel('主色', { exact: true }).fill('#3269b1')
  await page.getByLabel('辅助色', { exact: true }).fill('#fcd34d')
  await page.getByLabel('主题圆角', { exact: true }).fill('20')
  await page.getByRole('button', { name: '切换页面明暗', exact: true }).click()
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
        ? page.locator('.zx-select-trigger').first()
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
  await page.getByRole('button', { name: '样本深色模式', exact: true }).click()
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

import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, afterEach, beforeAll, beforeEach, expect, test } from '@lightning-js/lightning'
import { chromium } from 'playwright'
import type { Browser, BrowserContext, Page } from 'playwright'
import { startDemo } from './dev-server'

let app: Awaited<ReturnType<typeof startDemo>>
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
  context = await browser.newContext({
    baseURL: app.url,
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  })
  page = await context.newPage()
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
    await context?.close()
  }
})

async function select(name: string) {
  await page.locator('.directory-groups').getByRole('button', { name, exact: true }).click()
  try {
    await expect
      .poll(() => page.getByRole('heading', { level: 1 }).textContent(), { timeout: 5000 })
      .toBe(name)
  } catch {
    throw new Error(
      `Selecting ${name} left heading ${await page.locator('h1').textContent()} at ${page.url()}`,
    )
  }
}

test('renders the complete catalogue, maintains deep links and filters by name', async () => {
  const names = await page.locator('.directory-groups button').allTextContents()
  expect(names.length).toBeGreaterThanOrEqual(73)
  expect(new Set(names).size).toBe(names.length)
  for (const name of names) {
    await select(name)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (name !== 'Button') {
      expect((await page.getByRole('code').textContent())!.length).toBeGreaterThan(40)
      expect(await page.locator('.demo-stage > *').count()).toBeGreaterThan(0)
    }
  }
  await select('Select')
  await page.reload()
  expect(await page.getByRole('heading', { level: 1 }).textContent()).toBe('Select')
  await page.getByRole('searchbox', { name: '检索组件', exact: true }).fill('date')
  expect(await page.locator('.directory-groups button').count()).toBe(3)
  await page.getByRole('searchbox', { name: '检索组件', exact: true }).fill('not-a-component')
  await expect.poll(() => page.getByRole('status').filter({ hasText: '没有匹配' }).count()).toBe(1)
})

test('reflows every component on mobile without horizontal document overflow', async () => {
  const names = await page.locator('.directory-groups button').allTextContents()
  await page.setViewportSize({ width: 390, height: 844 })
  for (const name of names) {
    await page.getByLabel('选择组件', { exact: true }).selectOption(name)
    try {
      await expect
        .poll(() => page.getByRole('heading', { level: 1 }).textContent(), { timeout: 5000 })
        .toBe(name)
    } catch {
      throw new Error(
        `Mobile selection ${name}: ${(await page.locator('body').innerText()).slice(0, 500)}`,
      )
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
})

test('toggles, removable chips and sortable tables have observable results', async () => {
  await select('ToggleButton')
  const toggle = page.getByRole('button', { name: '粗体', exact: true })
  expect(await toggle.getAttribute('aria-pressed')).toBe('false')
  await toggle.click()
  expect(await toggle.getAttribute('aria-pressed')).toBe('true')
  await select('Chip')
  await page.getByRole('button', { name: '移除 界面设计', exact: true }).click()
  expect(await page.getByRole('button', { name: '移除 界面设计', exact: true }).count()).toBe(0)
  await page.getByRole('button', { name: '重置标签', exact: true }).click()
  expect(await page.getByRole('button', { name: '移除 界面设计', exact: true }).count()).toBe(1)
  await select('Table')
  await page.getByRole('columnheader', { name: /项目/ }).click()
  expect(await page.getByRole('columnheader', { name: /项目/ }).getAttribute('aria-sort')).toBe(
    'descending',
  )
})

test('captures representative light, dark, mobile and zoom-equivalent evidence', async () => {
  const directory = process.env.UI_KITS_SCREENSHOT_DIR
  if (directory) await mkdir(directory, { recursive: true })
  async function capture(name: string) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (directory) await page.screenshot({ path: join(directory, `${name}.png`) })
  }
  await capture('catalogue-button-desktop')
  await select('TextField')
  await capture('catalogue-textfield-desktop')
  await page.getByLabel('样本主题', { exact: true }).selectOption('dark')
  await capture('catalogue-textfield-dark')
  await page.getByLabel('样本主题', { exact: true }).selectOption('light')
  await select('Calendar')
  await capture('catalogue-calendar-desktop')
  await select('ColorPicker')
  await capture('catalogue-color-desktop')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByLabel('选择组件', { exact: true }).selectOption('TextField')
  await capture('catalogue-textfield-mobile')
  await page.getByLabel('选择组件', { exact: true }).selectOption('Calendar')
  await capture('catalogue-calendar-mobile')
  // Equivalent CSS reflow to a 1440px desktop at 200%; not a native browser zoom claim.
  await page.setViewportSize({ width: 720, height: 450 })
  await capture('catalogue-200-percent-reflow')
})

test('validates forms and preserves OTP native editing and clipboard behavior', async () => {
  await select('Form')
  await page.getByRole('button', { name: '检查填写内容', exact: true }).click()
  await expect
    .poll(() => page.getByText('请填写至少两个字的项目名称。', { exact: true }).count())
    .toBe(1)
  await page.getByRole('textbox', { name: '项目名称', exact: true }).fill('北岸设计')
  await page.getByRole('textbox', { name: '负责人邮箱', exact: true }).fill('not-an-email')
  await page.getByRole('button', { name: '检查填写内容', exact: true }).click()
  expect(await page.getByRole('textbox', { name: '项目名称', exact: true }).inputValue()).toBe(
    '北岸设计',
  )
  await page.getByRole('textbox', { name: '负责人邮箱', exact: true }).fill('chen@example.com')
  await page.getByText('我已检查示例内容', { exact: true }).click()
  expect(
    await page.getByRole('checkbox', { name: '我已检查示例内容', exact: true }).isChecked(),
  ).toBe(true)
  await page.getByRole('button', { name: '检查填写内容', exact: true }).click()
  await expect
    .poll(() => page.locator('.demo-stage output').textContent())
    .toContain('已通过本页校验')
  await page.getByRole('button', { name: '重置', exact: true }).click()
  expect(await page.getByRole('textbox', { name: '项目名称', exact: true }).inputValue()).toBe('')
  await select('InputOTP')
  const otp = page.getByRole('textbox', { name: '六位协作码', exact: true })
  await otp.fill('02a4-681')
  expect(await otp.inputValue()).toBe('024681')
  await otp.press('End')
  await otp.press('Backspace')
  expect(await otp.inputValue()).toBe('02468')
  await otp.press('x')
  expect(await otp.inputValue()).toBe('02468')
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.evaluate(() => navigator.clipboard.writeText('00a1-234'))
  await otp.selectText()
  await otp.press(process.platform === 'darwin' ? 'Meta+v' : 'Control+v')
  expect(await otp.inputValue()).toBe('001234')
  expect(await otp.evaluate((input) => (input as HTMLInputElement).scrollLeft)).toBe(0)
})

test('keeps nested modal portals themed and restores focus to native triggers', async () => {
  await select('Modal')
  await page.getByLabel('样本主题', { exact: true }).selectOption('dark')
  const trigger = page.getByRole('button', { name: '项目详情', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: '北岸设计', exact: true })
  await dialog.waitFor()
  expect(
    await dialog.evaluate((element) =>
      element.closest('[data-zx-color-mode]')?.getAttribute('data-zx-color-mode'),
    ),
  ).toBe('dark')
  await page.locator('.component-demo').evaluate((element) => {
    element.setAttribute('data-zx-style', 'soft')
    ;(element as HTMLElement).style.setProperty('--zx-surface-raised', 'rgb(31, 32, 33)')
  })
  await expect
    .poll(() =>
      dialog.evaluate((element) =>
        getComputedStyle(element).getPropertyValue('--zx-surface-raised').trim(),
      ),
    )
    .toBe('rgb(31, 32, 33)')
  await dialog.locator('.zx-select-trigger').click()
  const option = page.getByRole('option', { name: '林舒', exact: true })
  await option.waitFor()
  expect(await option.evaluate((element) => Boolean(element.closest('[inert]')))).toBe(false)
  await option.click()
  expect(await dialog.locator('.zx-select-value').textContent()).toBe('林舒')
  await dialog.getByRole('button', { name: '团队说明', exact: true }).click()
  const nested = page.getByRole('dialog', { name: '访问范围', exact: true })
  await nested.waitFor()
  expect(
    await nested.evaluate((element) =>
      element.closest('[data-zx-style]')?.getAttribute('data-zx-style'),
    ),
  ).toBe('soft')
  await page.keyboard.press('Escape')
  // Exiting portals become inaccessible before RAC finishes unmounting them.
  // A second Escape belongs to the parent only after the top overlay is detached.
  await page.locator('.zx-popover').waitFor({ state: 'detached' })
  await expect.poll(() => nested.count()).toBe(0)
  await expect.poll(() => dialog.count()).toBe(1)
  await expect
    .poll(() =>
      dialog
        .getByRole('button', { name: '团队说明', exact: true })
        .evaluate((element) => element === document.activeElement),
    )
    .toBe(true)
  await page.keyboard.press('Escape')
  await expect.poll(() => dialog.count()).toBe(0)
  await expect
    .poll(() => trigger.evaluate((element) => element === document.activeElement))
    .toBe(true)
})

test('retains failed confirmations and provides working native menu and toast actions', async () => {
  await select('AlertDialog')
  await page.getByRole('button', { name: '删除草稿', exact: true }).click()
  const dialog = page.getByRole('alertdialog')
  expect(
    await dialog
      .getByRole('button', { name: '取消', exact: true })
      .evaluate((element) => element === document.activeElement),
  ).toBe(true)
  await dialog.getByRole('button', { name: '删除草稿', exact: true }).click()
  await expect.poll(() => dialog.getByRole('alert').textContent()).toContain('此草稿正在被林舒编辑')
  expect(await dialog.count()).toBe(1)
  await dialog.getByRole('button', { name: '取消', exact: true }).click()
  await select('Dropdown')
  await page.getByRole('button', { name: '项目操作', exact: true }).click()
  await page.getByRole('menuitem', { name: '编辑项目', exact: true }).click()
  await expect
    .poll(() => page.locator('.demo-stage output').textContent())
    .toBe('当前操作：编辑项目')
  await select('Toast')
  await page.getByRole('button', { name: '显示评审提醒', exact: true }).click()
  await page.getByText('北岸设计评审', { exact: true }).waitFor()
  await page.getByRole('button', { name: '关闭通知', exact: true }).click()
  await expect.poll(() => page.getByText('北岸设计评审', { exact: true }).count()).toBe(0)
})

test('disabled fieldsets block label, track and stepper callbacks', async () => {
  await select('Fieldset')
  for (const name of ['保留评审记录', '保留版本说明', '选中文件']) {
    const bounds = await page.getByText(name, { exact: true }).boundingBox()
    expect(Boolean(bounds)).toBe(true)
    await page.mouse.click(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2)
  }
  const archived = page.getByRole('group', { name: '归档设置', exact: true })
  const track = await archived.locator('.zx-slider__track').boundingBox()
  await page.mouse.click(track!.x + track!.width * 0.8, track!.y + track!.height / 2)
  const stepper = archived.locator('.zx-number-field button').last()
  await stepper.scrollIntoViewIfNeeded()
  const stepperBounds = await stepper.boundingBox()
  await page.mouse.click(
    stepperBounds!.x + stepperBounds!.width / 2,
    stepperBounds!.y + stepperBounds!.height / 2,
  )
  expect(await page.getByRole('checkbox', { name: '保留评审记录', exact: true }).isChecked()).toBe(
    true,
  )
  expect(await page.getByRole('switch', { name: '保留版本说明', exact: true }).isChecked()).toBe(
    true,
  )
  expect(await page.getByRole('radio', { name: '全部文件', exact: true }).isChecked()).toBe(true)
  expect(await page.locator('.demo-stage output.example-note').textContent()).toBe(
    '归档设置修改次数：0',
  )
})

test('filled and destructive confirmation labels stay legible on hover', async () => {
  await select('AlertDialog')
  for (const [triggerName, actionName] of [
    ['归档项目', '确认归档'],
    ['删除草稿', '删除草稿'],
  ]) {
    await page.getByRole('button', { name: triggerName, exact: true }).click()
    const dialog = page.getByRole('alertdialog')
    const action = dialog.getByRole('button', { name: actionName, exact: true })
    await action.hover()
    await expect.poll(() => action.getAttribute('data-hovered')).toBe('true')
    expect(await action.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
    expect(await action.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(
      'rgb(237, 237, 242)',
    )
    await dialog.getByRole('button', { name: '取消', exact: true }).click()
  }
})

test('supports date keyboard editing, selection callbacks and color keyboard control', async () => {
  await select('DateField')
  await page.locator('.zx-date-segment[data-type="day"]').first().focus()
  await page.keyboard.press('ArrowUp')
  await expect.poll(() => page.locator('.demo-stage output').textContent()).toContain('2026-06-19')
  await select('Select')
  await page.locator('.zx-select-trigger').first().click()
  await page.getByRole('option', { name: '林舒', exact: true }).click()
  await expect.poll(() => page.locator('.demo-stage output').textContent()).toContain('林舒')
  await select('DatePicker')
  await page.locator('.demo-stage [aria-label="打开日历"]').first().click()
  await page.getByRole('dialog', { name: '选择日期', exact: true }).waitFor()
  await page.keyboard.press('Escape')
  await select('ColorSlider')
  const color = page.locator('.demo-stage output.example-note')
  const before = await color.textContent()
  await page.locator('.zx-color-slider input[type="range"]').first().focus()
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => color.textContent()).not.toBe(before)
})

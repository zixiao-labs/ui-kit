import { afterAll, beforeAll, expect, test } from '@lightning-js/lightning'
import { chromium, webkit } from 'playwright'
import type { Browser, Page } from 'playwright'
import { startDemo } from './dev-server'

let browser: Browser
let demo: Awaited<ReturnType<typeof startDemo>>
beforeAll(async () => {
  demo = await startDemo('@zixiao-labs/ui-kits-solid-demo')
  browser = await (process.env.UI_KITS_TEST_WEBKIT ? webkit : chromium).launch()
})
afterAll(async () => {
  await browser?.close()
  demo?.close()
})

async function open(name = 'Button', options: { mobile?: boolean; dark?: boolean } = {}) {
  const page = await browser.newPage({
    viewport: options.mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
    colorScheme: options.dark ? 'dark' : 'light',
  })
  await page.goto(`${demo.url}/?component=${name}`)
  await page.locator('h1').waitFor()
  return page
}
async function navigate(page: Page, name: string) {
  await page.evaluate((value) => {
    const url = new URL(location.href)
    url.searchParams.set('component', value)
    history.replaceState(null, '', url)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, name)
  expect(await page.locator('h1').textContent()).toBe(name)
}

test('Solid button props remain reactive, loading blocks duplicates, and state survives appearance changes', async () => {
  const page = await open()
  try {
    const button = page.getByRole('button', { name: '创建项目', exact: true })
    await button.click()
    expect(await page.locator('.specimen-count').textContent()).toContain('1')
    await page.getByRole('switch', { name: '加载中', exact: true }).focus()
    await page.keyboard.press('Space')
    expect(await button.isDisabled()).toBe(true)
    expect(await button.getAttribute('aria-busy')).toBe('true')
    expect(await button.textContent()).toContain('创建项目')
    await page.getByRole('switch', { name: '加载中', exact: true }).press('Space')
    await page.getByRole('button', { name: /^尺寸/ }).click()
    await page.getByRole('option', { name: 'Large', exact: true }).click()
    expect(await button.getAttribute('data-size')).toBe('lg')
    expect(await button.evaluate((element) => element.getBoundingClientRect().height)).toBe(56)
    await page.getByRole('button', { name: /^全局风格/ }).click()
    await page.getByRole('option', { name: 'Endfield', exact: true }).click()
    expect(await page.locator('html').getAttribute('data-zx-style')).toBe('endfield')
    expect(await page.locator('.specimen-count').textContent()).toContain('1')
    await page.getByRole('checkbox', { name: '禁用', exact: true }).press('Space')
    expect(await button.isDisabled()).toBe(true)
  } finally {
    await page.close()
  }
})

test('Solid forms preserve validation, form values, OTP filtering and number bounds', async () => {
  const page = await open('Form')
  try {
    await page.getByLabel('项目名称', { exact: true }).fill('')
    await page.getByRole('button', { name: '检查表单' }).click()
    expect(
      await page
        .locator('input[name=project]')
        .evaluate((element) => (element as HTMLInputElement).validity.valueMissing),
    ).toBe(true)
    await page.getByLabel('项目名称', { exact: true }).fill('Solid workspace')
    await page.getByRole('button', { name: '检查表单' }).click()
    expect(await page.locator('.preview-canvas output').textContent()).toContain('Solid workspace')
    await navigate(page, 'NumberField')
    await page.getByRole('button', { name: '增加', exact: true }).click()
    expect(await page.getByRole('spinbutton').inputValue()).toBe('5')
    await page.getByRole('spinbutton').fill('999')
    await page.getByRole('spinbutton').press('Tab')
    expect(await page.getByRole('spinbutton').inputValue()).toBe('20')
    await navigate(page, 'InputOTP')
    await page.getByLabel('验证码', { exact: true }).fill('a1b2c3456789')
    expect(await page.getByLabel('验证码', { exact: true }).inputValue()).toBe('123456')
    expect(await page.locator('.preview-canvas output').textContent()).toContain('123456')
    await navigate(page, 'Fieldset')
    expect(await page.getByLabel('项目名称', { exact: true }).isDisabled()).toBe(true)
    expect(await page.getByRole('checkbox', { name: '锁定编辑' }).isDisabled()).toBe(true)
  } finally {
    await page.close()
  }
})

test('Solid switches and checkboxes toggle exactly once on track, thumb and label pointer clicks', async () => {
  const page = await open()
  try {
    const button = page.getByRole('button', { name: '创建项目', exact: true })
    const loading = page.locator('.preview-canvas .zx-switch')
    await loading.locator('.zx-switch__track').click()
    expect(await loading.getByRole('switch').isChecked()).toBe(true)
    expect(await button.isDisabled()).toBe(true)
    await loading.locator('.zx-switch__thumb').click()
    expect(await loading.getByRole('switch').isChecked()).toBe(false)
    expect(await button.isDisabled()).toBe(false)
    await loading.locator('.zx-choice__label').click()
    expect(await loading.getByRole('switch').isChecked()).toBe(true)
    await loading.locator('.zx-choice__label').click()
    expect(await loading.getByRole('switch').isChecked()).toBe(false)
    const disabled = page.locator('.preview-canvas .zx-checkbox')
    await disabled.locator('.zx-checkbox__box').click()
    expect(await disabled.getByRole('checkbox').isChecked()).toBe(true)
    expect(await button.isDisabled()).toBe(true)
    await disabled.locator('.zx-choice__label').click()
    expect(await disabled.getByRole('checkbox').isChecked()).toBe(false)
    const theme = page.locator('.theme-panel > .zx-switch')
    await theme.locator('.zx-switch__track').click()
    expect(await page.getByLabel('主色十六进制值').isEnabled()).toBe(true)
    await theme.locator('.zx-switch__track').click()
    expect(await page.getByLabel('主色十六进制值').isDisabled()).toBe(true)
    await navigate(page, 'Switch')
    await page.locator('.preview-canvas .zx-switch__track').click()
    expect(await page.getByRole('switch', { name: '保留本地草稿' }).isChecked()).toBe(false)
    await page.locator('.preview-canvas .zx-choice__label').click()
    expect(await page.getByRole('switch', { name: '保留本地草稿' }).isChecked()).toBe(true)
    await navigate(page, 'Fieldset')
    await page.locator('.preview-canvas .zx-checkbox__box').click()
    expect(await page.getByRole('checkbox', { name: '锁定编辑' }).isChecked()).toBe(true)
  } finally {
    await page.close()
  }
})

test('Solid configuration and mobile directory open themed listboxes instead of system menus', async () => {
  const page = await open('Button', { mobile: true })
  try {
    await page.getByRole('button', { name: /^尺寸/ }).click()
    await page.getByRole('listbox', { name: '尺寸' }).waitFor()
    await page.getByRole('option', { name: 'Large', exact: true }).click()
    expect(
      await page.getByRole('button', { name: '创建项目', exact: true }).getAttribute('data-size'),
    ).toBe('lg')
    await page.getByRole('button', { name: /^明暗模式/ }).click()
    await page.getByRole('listbox', { name: '明暗模式' }).waitFor()
    await page.getByRole('option', { name: '深色', exact: true }).click()
    expect(await page.locator('html').getAttribute('data-zx-color-mode')).toBe('dark')
    await page.getByRole('button', { name: /^选择组件/ }).click()
    await page.getByRole('listbox', { name: '选择组件' }).waitFor()
    await page.getByRole('option', { name: 'Switch', exact: true }).click()
    expect(await page.locator('h1').textContent()).toBe('Switch')
    expect(
      await page
        .locator('select')
        .evaluateAll((elements) =>
          elements.every((element) => !!element.closest('[aria-hidden="true"]')),
        ),
    ).toBe(true)
  } finally {
    await page.close()
  }
})

test('Solid choices, tabs and accordion expose keyboard-operable state', async () => {
  const page = await open('RadioGroup')
  try {
    const team = page.getByRole('radio', { name: '团队成员' })
    await team.focus()
    await page.keyboard.press('ArrowDown')
    expect(await page.getByRole('radio', { name: '公开访问' }).isChecked()).toBe(true)
    await navigate(page, 'ToggleButton')
    const toggle = page.getByRole('button', { name: '收藏项目' })
    expect(await toggle.getAttribute('aria-pressed')).toBe('true')
    await toggle.click()
    expect(await toggle.getAttribute('aria-pressed')).toBe('false')
    await navigate(page, 'Tabs')
    await page.getByRole('tab', { name: '概览' }).focus()
    await page.keyboard.press('ArrowRight')
    expect(await page.getByRole('tab', { name: '动态' }).getAttribute('aria-selected')).toBe('true')
    expect(await page.getByRole('tabpanel').textContent()).toContain('今天更新')
    await navigate(page, 'Accordion')
    await page.getByRole('button', { name: '如何切换设计风格' }).click()
    expect(
      await page.getByRole('button', { name: '如何切换设计风格' }).getAttribute('aria-expanded'),
    ).toBe('true')
    expect(await page.getByRole('region', { name: '如何切换设计风格' }).textContent()).toContain(
      '右侧',
    )
  } finally {
    await page.close()
  }
})

test('Solid selects support keyboard selection, filtering and disabled options', async () => {
  const page = await open('Select')
  try {
    const select = page.getByRole('button', { name: /^项目类型/ })
    await select.focus()
    await page.keyboard.press('ArrowDown')
    await page.getByRole('option', { name: '品牌网站', exact: true }).click()
    expect(await page.locator('.preview-canvas output').textContent()).toContain('website')
    await select.click()
    expect(await page.getByRole('option', { name: '项目归档' }).getAttribute('aria-disabled')).toBe(
      'true',
    )
    await page.keyboard.press('Escape')
    expect(await select.evaluate((element) => document.activeElement === element)).toBe(true)
    await navigate(page, 'ComboBox')
    await page.getByRole('combobox', { name: '搜索项目' }).fill('品牌')
    expect(await page.locator('.zx-select__content [role=option]').count()).toBe(1)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    expect(await page.locator('.preview-canvas output').textContent()).toContain('website')
  } finally {
    await page.close()
  }
})

test('Solid nested modal and Select portals preserve local theme, focus trap and restoration', async () => {
  const page = await open('ThemeScope')
  try {
    const trigger = page.getByRole('button', { name: '打开局部弹窗' })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: '项目设置' })
    await dialog.waitFor()
    expect(await dialog.getAttribute('data-zx-style')).toBe('endfield')
    expect(await dialog.getAttribute('data-zx-color-mode')).toBe('dark')
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)
    await page.keyboard.press('Shift+Tab')
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)
    await page.getByRole('button', { name: /^工作区/ }).click()
    const content = page.locator('.zx-select__content')
    expect(await content.getAttribute('data-zx-style')).toBe('endfield')
    expect(await content.getAttribute('data-zx-color-mode')).toBe('dark')
    await page.getByRole('option', { name: '品牌网站', exact: true }).click()
    await page.keyboard.press('Escape')
    await dialog.waitFor({ state: 'hidden' })
    expect(await trigger.evaluate((element) => document.activeElement === element)).toBe(true)
  } finally {
    await page.close()
  }
})

test('Solid theme settings persist, track system changes and do not fail when storage is blocked', async () => {
  const page = await open()
  try {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.waitForFunction(() => document.documentElement.dataset.zxColorMode === 'dark')
    await page.getByRole('button', { name: /^明暗模式/ }).click()
    await page.getByRole('option', { name: '浅色', exact: true }).click()
    await page.getByRole('switch', { name: '自定义配色' }).press('Space')
    await page.getByLabel('主色十六进制值').fill('#245548')
    await page.getByLabel('主色十六进制值').press('Tab')
    await page.reload()
    await page.locator('h1').waitFor()
    expect(await page.locator('html').getAttribute('data-zx-color-mode')).toBe('light')
    expect(
      await page
        .locator('html')
        .evaluate((element) => element.style.getPropertyValue('--zx-accent')),
    ).toBe('#245548')
    await page.getByRole('button', { name: '恢复默认' }).click()
    expect(await page.locator('html').getAttribute('data-zx-color-mode')).toBe('dark')
    await page.addInitScript(() => {
      Object.defineProperty(Storage.prototype, 'setItem', {
        value: () => {
          throw new DOMException('blocked')
        },
      })
    })
    await page.reload()
    await page.locator('h1').waitFor()
    expect(await page.locator('.settings-notice').textContent()).toContain('禁止本地存储')
  } finally {
    await page.close()
  }
})

test('Solid open portals track live ancestor theme changes and nested light resets', async () => {
  const page = await open('ThemeScope', { dark: true })
  try {
    await page.getByRole('button', { name: '打开局部弹窗' }).click()
    await page.getByRole('dialog', { name: '项目设置' }).waitFor()
    await page.evaluate(() => {
      const scope = document.querySelector<HTMLElement>('.preview-canvas [data-zx-style]')!
      scope.dataset.zxStyle = 'hepo'
      scope.removeAttribute('data-zx-color-mode')
    })
    await page.waitForFunction(() => {
      const dialog = document.querySelector('.zx-modal')
      return (
        dialog?.getAttribute('data-zx-style') === 'hepo' &&
        dialog.getAttribute('data-zx-color-mode') === 'light'
      )
    })
    await page.getByRole('button', { name: /^工作区/ }).click()
    const popup = page.locator('.zx-select__content')
    expect(await popup.getAttribute('data-zx-style')).toBe('hepo')
    expect(await popup.getAttribute('data-zx-color-mode')).toBe('light')
    expect(await popup.evaluate((element) => getComputedStyle(element).colorScheme)).toBe('light')
  } finally {
    await page.close()
  }
})

test('Solid directory search, deep links, browser history, clipboard and toast stay functional', async () => {
  const page = await open()
  try {
    await page.keyboard.press('/')
    expect(
      await page
        .getByPlaceholder('检索组件')
        .evaluate((element) => element === document.activeElement),
    ).toBe(true)
    await page.getByPlaceholder('检索组件').fill('modal')
    expect(await page.locator('.directory-item').count()).toBe(1)
    await page.getByRole('button', { name: 'Modal', exact: true }).click()
    expect(new URL(page.url()).searchParams.get('component')).toBe('Modal')
    await page.goBack()
    expect(await page.locator('h1').textContent()).toBe('Button')
    await page.getByRole('button', { name: '复制代码', exact: true }).click()
    expect(await page.locator('.copy-message').textContent()).toMatch(/已复制|复制失败/)
    await navigate(page, 'Toast')
    await page.getByRole('button', { name: '显示通知', exact: true }).click()
    expect(await page.locator('.zx-toast').textContent()).toContain('预览已更新')
    await page.getByRole('button', { name: '关闭 预览已更新' }).click()
    expect(await page.locator('.zx-toast').count()).toBe(0)
  } finally {
    await page.close()
  }
})

for (const style of ['Clean', 'Endfield', '鹤坡', '鹤坡 · 室内', 'Minimal', 'Soft', 'Brutalist']) {
  for (const mode of ['light', 'dark'] as const) {
    for (const mobile of [false, true]) {
      // One page per theme bounds navigation and mirrors a real browsing session;
      // WebKit correctly rate-limits >100 synthetic history writes in 10 seconds.
      test(`Solid ${style} catalogue renders every entry at ${mobile ? '390px' : '1440px'} in ${mode} mode without runtime errors or overflow`, async () => {
        const page = await open('Button', { mobile, dark: mode === 'dark' })
        const errors: string[] = []
        page.on('pageerror', (error) => errors.push(error.message))
        try {
          const names = await page
            .locator('.directory-item')
            .evaluateAll((elements) =>
              elements.map((element) => element.textContent!.replace('↗', '').trim()),
            )
          expect(names.length).toBe(49)
          await page.getByRole('button', { name: /^全局风格/ }).click()
          await page.getByRole('option', { name: style, exact: true }).click()
          for (const name of names) {
            await navigate(page, name)
            expect(
              await page
                .locator('.preview-canvas')
                .evaluate((element) => element.childElementCount > 0),
            ).toBe(true)
            expect(
              await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            ).toBe(true)
          }
          expect(errors).toEqual([])
        } finally {
          await page.close()
        }
      })
    }
  }
}

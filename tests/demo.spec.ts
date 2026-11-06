import { expect, test } from '@playwright/test'

test('hydrates and keeps behavior when styles change', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('不止一种表达')
  const action = page.getByRole('button', { name: '开始创造' })
  await expect(action).toHaveAttribute('type', 'button')
  await action.click()
  await expect(page.getByRole('status')).toHaveText('已触发 1 次交互')

  for (const [index, style] of ['Soft', 'Brutalist', 'Minimal'].entries()) {
    await page.getByRole('radio', { name: new RegExp(style) }).check()
    await expect(page.getByTestId('preview')).toHaveAttribute('data-zx-style', style.toLowerCase())
    await expect(page.getByRole('status')).toHaveText(`已触发 ${index + 1} 次交互`)
    await action.click()
  }

  await expect(page.getByRole('status')).toHaveText('已触发 4 次交互')
  await page.getByRole('button', { name: '重置计数' }).click()
  await expect(page.getByRole('status')).toHaveText('已触发 0 次交互')
  expect(errors).toEqual([])
})

test('updates props, loading and disabled states', async ({ page }) => {
  await page.goto('/')
  const action = page.getByRole('button', { name: '开始创造' })
  await page.getByLabel('变体').selectOption('outline')
  await page.getByLabel('尺寸').selectOption('lg')
  await expect(action).toHaveAttribute('data-variant', 'outline')
  await expect(action).toHaveAttribute('data-size', 'lg')
  await page.getByRole('checkbox', { name: /加载状态/ }).check()
  await expect(action).toHaveAttribute('aria-busy', 'true')
  await expect(action).toBeDisabled()
  await expect(page.getByRole('code')).toContainText(' loading')
  await page.getByRole('checkbox', { name: /禁用状态/ }).check()
  await page.getByRole('checkbox', { name: /加载状态/ }).uncheck()
  await expect(action).toBeDisabled()
  await page.getByRole('checkbox', { name: /禁用状态/ }).uncheck()
  await expect(action).toBeEnabled()
  await action.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('status')).toHaveText('已触发 1 次交互')
  await page.keyboard.press('Space')
  await expect(page.getByRole('status')).toHaveText('已触发 2 次交互')
})

test('switches scoped light and dark tokens for every style', async ({ page }) => {
  await page.goto('/')
  const preview = page.getByTestId('preview')
  const darkSurfaces = {
    Minimal: 'rgb(26, 33, 29)',
    Soft: 'rgb(37, 30, 48)',
    Brutalist: 'rgb(36, 37, 30)',
  }
  for (const [style, surface] of Object.entries(darkSurfaces)) {
    await page.getByRole('radio', { name: new RegExp(style) }).check()
    const light = await preview.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--zx-surface'),
    )
    await page.getByRole('button', { name: '深色模式' }).click()
    await expect(preview).toHaveAttribute('data-zx-color-mode', 'dark')
    await expect(page.getByRole('button', { name: '深色模式' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    const dark = await preview.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--zx-surface'),
    )
    expect(dark).not.toBe(light)
    await expect(preview).toHaveCSS('background-color', surface)
    await page.getByRole('button', { name: '深色模式' }).click()
    await expect(preview).toHaveAttribute('data-zx-color-mode', 'light')
  }
})

test('fits mobile and navigates to the principles page', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '从一个 Button 开始' })).toBeVisible()
  await page.getByRole('radio', { name: /Brutalist/ }).check()
  await page.getByRole('button', { name: '开始创造' }).click()
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(overflows).toBe(false)
  await page.getByRole('link', { name: '设计原则' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('先统一行为，再表达风格。')
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('先统一行为，再表达风格。')
})

test('renders content and styles without client JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  const page = await context.newPage()
  try {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('不止一种表达')
    await expect(page.getByRole('button', { name: '开始创造' })).toHaveCSS('min-height', '44px')
  } finally {
    await context.close()
  }
})

test('resets nested scopes without leaking ancestor styles', async ({ page }) => {
  await page.goto('/')
  const tokens = await page.evaluate(() => {
    const outer = document.createElement('div')
    outer.dataset.zxStyle = 'brutalist'
    outer.dataset.zxColorMode = 'dark'
    outer.style.backgroundColor = 'var(--zx-surface)'
    const inner = document.createElement('div')
    inner.dataset.zxStyle = 'minimal'
    inner.style.backgroundColor = 'var(--zx-surface)'
    const button = document.createElement('button')
    button.className = 'zx-button'
    button.dataset.variant = 'solid'
    button.textContent = 'Nested theme'
    inner.append(button)
    outer.append(inner)
    document.body.append(outer)
    const result = {
      outerSurface: getComputedStyle(outer).backgroundColor,
      innerSurface: getComputedStyle(inner).backgroundColor,
      innerBorder: getComputedStyle(button).borderTopColor,
      innerRadius: getComputedStyle(button).borderRadius,
    }
    outer.remove()
    return result
  })
  expect(tokens.outerSurface).toBe('rgb(36, 37, 30)')
  expect(tokens.innerSurface).toBe('rgb(255, 255, 255)')
  expect(tokens.innerBorder).toBe('rgba(0, 0, 0, 0)')
  expect(tokens.innerRadius).toBe('6px')
})

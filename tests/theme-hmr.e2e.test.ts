import { afterAll, beforeAll, expect, test } from '@lightning-js/lightning'
import { chromium } from 'playwright'
import type { Browser, WebSocketRoute } from 'playwright'
import { startDemo } from './dev-server'

let app: Awaited<ReturnType<typeof startDemo>>
let browser: Browser

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

test('keeps old and refreshed theme consumers connected across repeated partial hot updates', async () => {
  const context = await browser.newContext({
    baseURL: app.url,
    viewport: { width: 1440, height: 900 },
    colorScheme: 'light',
  })
  try {
    const page = await context.newPage()
    page.setDefaultTimeout(5000)
    const errors: string[] = []
    let hotSocket: WebSocketRoute | undefined
    let refreshes = 0
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (
        message.type() === 'error' ||
        /A component changed from (uncontrolled to controlled|controlled to uncontrolled)/.test(
          message.text(),
        )
      )
        errors.push(message.text())
      if (message.text().startsWith('[Fast Refresh] done')) refreshes++
    })
    await page.routeWebSocket('**', (socket) => {
      if (socket.protocols().includes('nasti-hmr')) hotSocket = socket
      socket.connectToServer()
    })
    await page.goto('/')
    await page.getByRole('button', { name: '触发交互', exact: true }).click()
    await expect.poll(() => page.locator('.click-count').textContent()).toBe('已触发 1 次交互')
    await page.getByRole('button', { name: '松林配色', exact: true }).click()
    await page.getByLabel('主题圆角', { exact: true }).fill('20')
    await expect.poll(() => Boolean(hotSocket)).toBe(true)

    for (const [index, mode] of (['dark', 'light', 'system'] as const).entries()) {
      const timestamp = Date.now()
      // Re-evaluate the theme module, then refresh only one consumer through the
      // real Nasti client. This leaves old and new module closures in the tree,
      // without editing shared source files or relying on watcher timing.
      // Keep the browser import out of Lightning's server-side import transform.
      await page.evaluate(`import("/src/theme.tsx?t=${timestamp}").then(() => {})`)
      hotSocket!.send(
        JSON.stringify({
          type: 'update',
          updates: [
            {
              type: 'js-update',
              path: '/src/theme-mode-select.tsx',
              acceptedPath: '/src/theme-mode-select.tsx',
              timestamp,
            },
          ],
        }),
      )
      await expect.poll(() => refreshes).toBe(index + 1)
      // Router-caught render errors appear in console, not necessarily pageerror.
      expect(errors).toEqual([])
      expect(await page.locator('.click-count').textContent()).toBe('已触发 1 次交互')
      expect(await page.getByLabel('主色', { exact: true }).inputValue()).toBe('#28745b')
      expect(await page.getByLabel('主题圆角', { exact: true }).inputValue()).toBe('20')
      await page.getByLabel('页面主题', { exact: true }).selectOption(mode)
      await expect.poll(() => page.getByLabel('预览主题', { exact: true }).inputValue()).toBe(mode)
      await expect
        .poll(() => page.locator('html').getAttribute('data-zx-color-mode'))
        .toBe(mode === 'dark' ? 'dark' : 'light')
    }

    await page.emulateMedia({ colorScheme: 'dark' })
    await expect.poll(() => page.locator('html').getAttribute('data-zx-color-mode')).toBe('dark')
    await page.getByRole('link', { name: '设计原则', exact: true }).click()
    await expect
      .poll(() => page.getByRole('heading', { level: 1 }).textContent())
      .toBe('先统一行为，再表达风格。')
    await page.getByRole('link', { name: '组件', exact: true }).click()
    await expect
      .poll(() => page.getByLabel('预览主题', { exact: true }).inputValue())
      .toBe('system')
    expect(await page.getByLabel('主色', { exact: true }).inputValue()).toBe('#28745b')
    expect(errors).toEqual([])
  } finally {
    await context.close()
  }
})

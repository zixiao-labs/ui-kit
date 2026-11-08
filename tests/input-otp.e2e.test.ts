import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, beforeAll, expect, test } from '@lightning-js/lightning'
import { chromium, webkit } from 'playwright'
import type { Locator } from 'playwright'
import { startDemo } from './dev-server'

let app: Awaited<ReturnType<typeof startDemo>>

beforeAll(async () => {
  app = await startDemo()
})

afterAll(() => app?.close())

async function expectUnshiftedCells(input: Locator) {
  // Allow the browser's caret-reveal scrolling to finish before measuring.
  await input.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))
  const geometry = await input.evaluate((element) => {
    const control = element.closest<HTMLElement>('.zx-otp__control')!
    const viewport = element.closest<HTMLElement>('.zx-otp__viewport')!
    const firstCell = control.querySelector('.zx-otp__slot')!
    return {
      inputScroll: element.scrollLeft,
      controlScroll: control.scrollLeft,
      viewportScroll: viewport.scrollLeft,
      cellOffset: firstCell.getBoundingClientRect().left - control.getBoundingClientRect().left,
    }
  })
  // Checking only input.scrollLeft missed the ancestor's automatic scrolling.
  expect(geometry).toEqual({
    inputScroll: 0,
    controlScroll: 0,
    viewportScroll: 0,
    cellOffset: 0,
  })
}

// Keep the default suite Chromium-only; WebKit is an explicit additional check.
const engines = process.env.UI_KITS_TEST_WEBKIT === '1' ? [chromium, webkit] : [chromium]

for (const engine of engines) {
  test(`keeps full OTP cells aligned through typing, blur and reflow in ${engine.name()}`, async () => {
    const browser = await engine.launch(
      engine === chromium ? { args: ['--use-mock-keychain', '--password-store=basic'] } : {},
    )
    try {
      const page = await browser.newPage({
        baseURL: app.url,
        viewport: { width: 1440, height: 1200 },
        reducedMotion: 'reduce',
      })
      page.setDefaultTimeout(5000)
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto('/')
      await page.getByRole('button', { name: '触发交互', exact: true }).click()
      await expect.poll(() => page.locator('.click-count').textContent()).toBe('已触发 1 次交互')
      await page
        .locator('.directory-groups')
        .getByRole('button', { name: 'InputOTP', exact: true })
        .click()
      const controlled = page.getByRole('textbox', { name: '六位协作码', exact: true })
      const invalid = page.getByRole('textbox', { name: '格式错误示例', exact: true })
      const disabled = page.getByRole('textbox', { name: '只读归档码', exact: true })

      await controlled.pressSequentially('114514')
      expect(await controlled.inputValue()).toBe('114514')
      await expectUnshiftedCells(controlled)
      await invalid.fill('')
      await invalid.pressSequentially('024345')
      expect(await invalid.inputValue()).toBe('024345')
      await expectUnshiftedCells(invalid)
      await page.getByRole('heading', { level: 1 }).click()
      await expectUnshiftedCells(controlled)
      await expectUnshiftedCells(invalid)
      await expectUnshiftedCells(disabled)

      const directory = process.env.UI_KITS_SCREENSHOT_DIR
      if (directory) {
        await mkdir(directory, { recursive: true })
        await page
          .locator('.component-demo')
          .screenshot({ path: join(directory, `otp-${engine.name()}-desktop.png`) })
      }

      for (const viewport of [
        { width: 390, height: 844 },
        { width: 720, height: 450 },
      ]) {
        await page.setViewportSize(viewport)
        for (const input of [controlled, invalid]) {
          await input.click()
          await input.press('End')
          await expectUnshiftedCells(input)
          await page.getByRole('heading', { level: 1 }).click()
          await expectUnshiftedCells(input)
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        )
        if (directory && viewport.width === 390) {
          await page
            .locator('.component-demo')
            .screenshot({ path: join(directory, `otp-${engine.name()}-mobile.png`) })
        }
      }
      expect(errors).toEqual([])
    } finally {
      await browser.close()
    }
  })
}

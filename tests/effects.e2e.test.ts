import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, afterEach, beforeAll, beforeEach, expect, test } from '@lightning-js/lightning'
import { chromium } from 'playwright'
import { PNG } from 'pngjs'
import type { Browser, Page } from 'playwright'
import { startDemo } from './dev-server'
import { chooseDemoSelect } from './select-helpers'

let app: Awaited<ReturnType<typeof startDemo>>
let browser: Browser
let page: Page
let errors: string[]

beforeAll(async () => {
  app = await startDemo()
  browser = await chromium.launch({
    args: [
      '--enable-unsafe-webgpu',
      ...(process.platform === 'darwin' ? ['--use-angle=metal'] : []),
      '--use-mock-keychain',
      '--password-store=basic',
    ],
  })
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
    viewport: { width: 1440, height: 1100 },
    colorScheme: 'light',
  })
  page.setDefaultTimeout(7000)
  errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
})
afterEach(async () => {
  try {
    expect(errors).toEqual([])
  } finally {
    await page?.context().close()
  }
})

const sample = () => page.getByTestId('effect-sample')
const lab = (name = 'Card') => page.getByRole('region', { name: `${name} 可选效果` })
async function open(name = 'Card') {
  await page.goto(`/?component=${name}`)
  await lab(name).getByRole('checkbox', { name: 'GPU 阴影' }).waitFor()
}
async function renderer() {
  return sample().getAttribute('data-zx-shadow-renderer')
}
async function screenshot(name: string, component = 'Card') {
  if (!process.env.UI_KITS_SCREENSHOT_DIR) return
  await mkdir(process.env.UI_KITS_SCREENSHOT_DIR, { recursive: true })
  await lab(component).screenshot({ path: join(process.env.UI_KITS_SCREENSHOT_DIR, `${name}.png`) })
}

test('default components request no GPU chunk and all effects are explicit, composable and resettable', async () => {
  const chunks: string[] = []
  page.on('request', (request) => {
    // Nasti may preload optimized dependencies while discovering its dev graph.
    // The optional backend itself must not execute or request an adapter.
    if (/gpu-shadow|shadow\.shader/.test(request.url())) chunks.push(request.url())
  })
  await page.addInitScript(() => {
    if (!navigator.gpu) return
    const original = navigator.gpu.requestAdapter.bind(navigator.gpu)
    navigator.gpu.requestAdapter = (options) => {
      Object.assign(window, { unexpectedAdapterRequest: true })
      return original(options)
    }
  })
  await open()
  expect(await page.locator('[data-zx-effects]').count()).toBe(0)
  expect(await page.locator('canvas').count()).toBe(0)
  expect(chunks).toEqual([])
  expect(await page.evaluate(() => 'unexpectedAdapterRequest' in window)).toBe(false)
  for (const name of ['指针倾斜', '深色背光', '液态玻璃']) {
    await lab().getByRole('checkbox', { name }).check()
  }
  expect(await sample().getAttribute('data-variant')).toBe('outline')
  expect(await sample().getAttribute('data-zx-tilt')).toBe('true')
  expect(await sample().locator('canvas').count()).toBe(0)
  expect(chunks).toEqual([])
  await lab().getByRole('button', { name: '添加素材', exact: true }).click()
  expect(await lab().locator('.effects-result').textContent()).toBe('已添加 1 份素材')
  await lab().getByRole('button', { name: '恢复无效果' }).click()
  expect(await sample().getAttribute('data-zx-effects')).toBe(null)
  expect(await sample().locator('[aria-hidden="true"]').count()).toBe(1) // action icon only
  expect(await page.locator('.component-demo [data-zx-effects]').count()).toBe(0)
})

test('renders real transparent GPU shadow pixels, stays idle and releases devices on toggle, loss and unmount', async () => {
  await page.addInitScript(() => {
    const gpu = navigator.gpu
    const stats = { requests: 0, destroyed: 0, submits: 0 }
    Object.assign(window, { shadowStats: stats })
    const request = gpu.requestAdapter.bind(gpu)
    gpu.requestAdapter = async (options) => {
      stats.requests++
      const adapter = await request(options)
      if (!adapter) return null
      const create = adapter.requestDevice.bind(adapter)
      adapter.requestDevice = async (descriptor) => {
        const device = await create(descriptor)
        const destroy = device.destroy.bind(device)
        device.destroy = () => {
          stats.destroyed++
          destroy()
        }
        const submit = device.queue.submit.bind(device.queue)
        device.queue.submit = (commands) => {
          stats.submits++
          submit(commands)
        }
        Object.assign(window, { loseShadowDevice: () => device.destroy() })
        return device
      }
      return adapter
    }
  })
  await open()
  await sample().scrollIntoViewIfNeeded()
  const stage = page.locator('.effects-stage')
  const before = PNG.sync.read(await stage.screenshot())
  await lab().getByRole('checkbox', { name: 'GPU 阴影' }).check()
  await sample().scrollIntoViewIfNeeded()
  await page.waitForFunction(() => {
    const node = document.querySelector('[data-testid="effect-sample"]')
    return (
      node?.hasAttribute('data-zx-shadow-renderer') || node?.hasAttribute('data-zx-shadow-error')
    )
  })
  expect(await sample().getAttribute('data-zx-shadow-error')).toBe(null)
  expect(await renderer()).toBe('gpu')
  // Read compositor pixels, not drawImage(canvas) after WebGPU's swapchain has
  // already presented and discarded its current texture.
  const after = PNG.sync.read(await stage.screenshot())
  const bounds = await sample().boundingBox()
  const origin = await stage.boundingBox()
  const x = Math.round(bounds!.x - origin!.x + bounds!.width / 2)
  const y = Math.round(bounds!.y - origin!.y + bounds!.height + 8)
  const rgb = (image: PNG, left: number, top: number) => {
    const offset = (top * image.width + left) * 4
    return [...image.data.subarray(offset, offset + 3)]
  }
  expect(rgb(after, x, y)[0]).toBeLessThan(rgb(before, x, y)[0])
  expect(rgb(after, 4, 4)).toEqual(rgb(before, 4, 4))
  const innerX = Math.round(bounds!.x - origin!.x + 12)
  const innerY = Math.round(bounds!.y - origin!.y + 12)
  expect(rgb(after, innerX, innerY)).toEqual(rgb(before, innerX, innerY))
  await screenshot('effects-gpu-light')
  const idle = await page.evaluate(async () => {
    const stats = (window as unknown as { shadowStats: { submits: number } }).shadowStats
    await new Promise(requestAnimationFrame)
    const before = stats.submits
    await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)
    return stats.submits === before
  })
  expect(idle).toBe(true)
  for (let index = 0; index < 2; index++) {
    await lab().getByRole('checkbox', { name: 'GPU 阴影' }).uncheck()
    expect(await sample().locator('canvas').count()).toBe(0)
    await lab().getByRole('checkbox', { name: 'GPU 阴影' }).check()
    await expect.poll(renderer, { timeout: 10000 }).toBe('gpu')
  }
  await page.evaluate(() =>
    (window as unknown as { loseShadowDevice: () => void }).loseShadowDevice(),
  )
  await expect.poll(renderer).toBe(null)
  expect(await sample().evaluate((node) => getComputedStyle(node).boxShadow)).not.toBe('none')
  await page
    .locator('.directory-groups')
    .getByRole('button', { name: 'Surface', exact: true })
    .click()
  await expect
    .poll(() =>
      page.evaluate(() => {
        const stats = (
          window as unknown as { shadowStats: { requests: number; destroyed: number } }
        ).shadowStats
        return stats.requests === stats.destroyed
      }),
    )
    .toBe(true)
})

test('falls back without WebGPU and cancels a pending adapter request without leaking a device', async () => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'gpu', { value: undefined }))
  await open()
  await lab().getByRole('checkbox', { name: 'GPU 阴影' }).check()
  expect(await renderer()).toBe(null)
  expect(await sample().evaluate((node) => getComputedStyle(node).boxShadow)).not.toBe('none')
  await lab().getByRole('button', { name: '添加素材', exact: true }).click()
  expect(await lab().locator('.effects-result').textContent()).toBe('已添加 1 份素材')

  // A new context restores the native GPU; initialization finishes after opt-out.
  const pending = await browser.newPage({ baseURL: app.url })
  try {
    await pending.addInitScript(() => {
      const gpu = navigator.gpu
      const original = gpu.requestAdapter.bind(gpu)
      gpu.requestAdapter = async (options) => {
        await new Promise<void>((resolve) => Object.assign(window, { resumeShadow: resolve }))
        const adapter = await original(options)
        if (!adapter) return null
        const create = adapter.requestDevice.bind(adapter)
        adapter.requestDevice = async (descriptor) => {
          const device = await create(descriptor)
          const destroy = device.destroy.bind(device)
          device.destroy = () => {
            Object.assign(window, { shadowReleased: true })
            destroy()
          }
          return device
        }
        return adapter
      }
    })
    await pending.goto('/?component=Card')
    const checkbox = pending.getByRole('checkbox', { name: 'GPU 阴影' })
    await checkbox.check()
    await pending.waitForFunction(() => 'resumeShadow' in window)
    await checkbox.uncheck()
    await pending.evaluate(() => (window as unknown as { resumeShadow: () => void }).resumeShadow())
    await pending.waitForFunction(() => 'shadowReleased' in window)
    expect(await pending.getByTestId('effect-sample').locator('canvas').count()).toBe(0)
  } finally {
    await pending.context().close()
  }
})

test('tilts with a mouse, resets on leave/cancel, and disables movement for keyboard, touch and reduced motion', async () => {
  await open()
  await lab().getByRole('checkbox', { name: '指针倾斜' }).check()
  const card = sample()
  await card.hover({ position: { x: 32, y: 40 } })
  await expect.poll(() => card.getAttribute('data-zx-tilting')).toBe('')
  expect(
    await card.evaluate((node) => node.style.getPropertyValue('--zx-effect-rotate-y')),
  ).not.toBe('0deg')
  await screenshot('effects-tilt')
  await card.dispatchEvent('pointercancel')
  expect(await card.getAttribute('data-zx-tilting')).toBe(null)
  await card.hover({ position: { x: 40, y: 48 } })
  await page.mouse.move(0, 0)
  expect(await card.getAttribute('data-zx-tilting')).toBe(null)
  const action = lab().getByRole('button', { name: '添加素材', exact: true })
  await action.focus()
  await page.keyboard.press('Enter')
  expect(await lab().locator('.effects-result').textContent()).toBe('已添加 1 份素材')
  expect(await card.getAttribute('data-zx-tilting')).toBe(null)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await card.hover({ position: { x: 32, y: 40 } })
  expect(await card.evaluate((node) => getComputedStyle(node).transform)).toBe('none')
  expect(await card.getAttribute('data-zx-tilting')).toBe(null)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await card.dispatchEvent('pointermove', { pointerType: 'touch', clientX: 100, clientY: 100 })
  expect(await card.getAttribute('data-zx-tilting')).toBe(null)
})

test('keeps backlight local to dark scopes across all styles and glass maps correct after resize', async () => {
  await open()
  await lab().getByRole('checkbox', { name: '深色背光' }).check()
  await lab().getByRole('checkbox', { name: '液态玻璃' }).check()
  await expect
    .poll(() => sample().locator('feImage').getAttribute('href'))
    .toContain('data:image/png')
  for (const style of [
    'clean',
    'endfield',
    'hepo',
    'hepo-interior',
    'minimal',
    'soft',
    'brutalist',
  ]) {
    for (const mode of ['light', 'dark']) {
      await page.locator('.effects-stage').evaluate(
        (node, values) => {
          node.setAttribute('data-zx-style', values.style)
          node.setAttribute('data-zx-color-mode', values.mode)
        },
        { style, mode },
      )
      expect(
        await sample()
          .locator('.zx-effect-backlight')
          .evaluate((node) => getComputedStyle(node).opacity),
      ).toBe(mode === 'light' ? '0' : '0.85')
      expect(await lab().getByRole('button', { name: '添加素材', exact: true }).isEnabled()).toBe(
        true,
      )
    }
  }
  // A nested style boundary resets the dark-only token, even under a dark parent.
  await sample().evaluate((node) => node.setAttribute('data-zx-style', 'minimal'))
  expect(
    await sample()
      .locator('.zx-effect-backlight')
      .evaluate((node) => getComputedStyle(node).opacity),
  ).toBe('0')
  await sample().evaluate((node) => node.removeAttribute('data-zx-style'))
  await page
    .locator('.effects-stage')
    .evaluate((node) => node.setAttribute('data-zx-style', 'hepo'))
  await screenshot('effects-backlight-glass-dark')
  const original = await sample().locator('feImage').getAttribute('href')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => sample().locator('feImage').getAttribute('href')).not.toBe(original)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await screenshot('effects-mobile')
  await page.setViewportSize({ width: 720, height: 550 })
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2'
  })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await screenshot('effects-zoom-200')
  await page.emulateMedia({ forcedColors: 'active' })
  expect(
    await sample()
      .locator('.zx-effect-glass')
      .evaluate((node) => getComputedStyle(node).display),
  ).toBe('none')
})

test('glass buttons retain native focus, disabled/loading and clipboard behavior', async () => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await open('Button')
  const region = lab('Button')
  expect(await region.getByRole('checkbox', { name: '指针倾斜' }).count()).toBe(0)
  await region.getByRole('checkbox', { name: '液态玻璃' }).check()
  await region.getByRole('checkbox', { name: '深色背光' }).check()
  await chooseDemoSelect(page, '效果样本明暗', 'dark')
  await sample().focus()
  await page.keyboard.press('Space')
  expect(await region.locator('.effects-result').textContent()).toBe('已添加 1 份素材')
  expect(await sample().evaluate((node) => node.tagName)).toBe('BUTTON')
  await region.getByRole('checkbox', { name: '禁用按钮' }).check()
  expect(await sample().isDisabled()).toBe(true)
  expect(
    await sample()
      .locator('.zx-effect-backlight')
      .evaluate((node) => getComputedStyle(node).display),
  ).toBe('none')
  await region.getByRole('checkbox', { name: '禁用按钮' }).uncheck()
  await region.getByRole('checkbox', { name: '加载中' }).check()
  expect(await sample().isDisabled()).toBe(true)
  expect(await sample().getAttribute('aria-busy')).toBe('true')
  await region.getByRole('button', { name: '复制效果代码' }).click()
  const code = await page.evaluate(() => navigator.clipboard.readText())
  expect(code).toContain('backlight: true')
  expect(code).toContain('glass: true')
  expect(code).toContain(' loading')
  expect(code).not.toContain('tilt:')
})

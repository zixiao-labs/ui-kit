import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, beforeAll, expect, test } from '@lightning-js/lightning'
import { chromium, webkit } from 'playwright'
import type { Browser, Page } from 'playwright'
import { styleOptions } from '../apps/demo/src/style-options'
import { startDemo } from './dev-server'

type Framework = 'react' | 'solid'
let browser: Browser
const demos: Partial<Record<Framework, Awaited<ReturnType<typeof startDemo>>>> = {}
beforeAll(async () => {
  demos.react = await startDemo()
  demos.solid = await startDemo('@zixiao-labs/ui-kits-solid-demo')
  browser = await (process.env.UI_KITS_TEST_WEBKIT ? webkit : chromium).launch()
})
afterAll(async () => {
  try {
    await browser?.close()
  } finally {
    demos.react?.close()
    demos.solid?.close()
  }
})

async function open(framework: Framework, component: string, mode: 'light' | 'dark') {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
    colorScheme: mode,
  })
  await page.addInitScript(
    ({ framework, mode }) => {
      localStorage.setItem(
        framework === 'react' ? 'zx-ui-theme-v1' : 'zx-solid-demo-theme-v1',
        JSON.stringify({
          style: 'clean',
          mode,
          primary: '#8b5cf6',
          secondary: '#fcd34d',
          radius: 12,
          customized: false,
          custom: false,
          preview: 'inherit',
        }),
      )
    },
    { framework, mode },
  )
  await page.goto(`${demos[framework]!.url}/?component=${component}`)
  await expect.poll(() => page.locator('html').getAttribute('data-zx-color-mode')).toBe(mode)
  return page
}

async function chooseStyle(page: Page, framework: Framework, id: string) {
  const label = styleOptions.find((style) => style.id === id)!.name
  await page.getByRole('button', { name: /全局风格/ }).click()
  await page
    .getByRole('option', {
      name: framework === 'solid' && id === 'hepo-interior' ? '鹤坡 · 室内' : label,
      exact: true,
    })
    .click()
  await expect.poll(() => page.locator('html').getAttribute('data-zx-style')).toBe(id)
}

/** Resolve color-mix through a canvas, not a string comparison of CSS syntax. */
async function stateColors(page: Page, selector: string) {
  return page.locator(selector).evaluate((element) => {
    const css = getComputedStyle(element)
    const context = document.createElement('canvas').getContext('2d')!
    const rgb = (value: string) => {
      context.clearRect(0, 0, 1, 1)
      context.fillStyle = value
      context.fillRect(0, 0, 1, 1)
      return Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3)
    }
    const luminance = (color: number[]) =>
      color
        .map((channel) => {
          const x = channel / 255
          return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
        })
        .reduce((sum, x, i) => sum + x * [0.2126, 0.7152, 0.0722][i], 0)
    const background = rgb(css.backgroundColor)
    const a = luminance(background)
    const b = luminance(rgb(css.color))
    return {
      background,
      contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
      transform: css.transform,
    }
  })
}

for (const framework of ['react', 'solid'] as const) {
  for (const mode of ['light', 'dark'] as const) {
    test(`${framework} keeps selected toggle hover readable in all seven ${mode} themes`, async () => {
      const page = await open(framework, 'ToggleButton', mode)
      const selector = `${framework === 'react' ? '.demo-stage' : '.preview-canvas'} .zx-toggle-button[aria-pressed='true']`
      try {
        for (const { id } of styleOptions) {
          await chooseStyle(page, framework, id)
          const current = await stateColors(
            page,
            framework === 'react'
              ? '.directory-group button[aria-current]'
              : '.directory-item[aria-current]',
          )
          expect(current.contrast).toBeGreaterThanOrEqual(4.5)
          const selected = page.locator(selector).first()
          // Only one default-selected button in each framework's specimen.
          expect(await selected.count()).toBe(1)
          await page.mouse.move(0, 0)
          const before = await stateColors(page, selector)
          expect(before.transform).toBe('none')
          expect(before.contrast).toBeGreaterThanOrEqual(4.5)
          await selected.hover()
          const hover = await stateColors(page, selector)
          expect(hover.background).not.toEqual(before.background)
          expect(hover.contrast).toBeGreaterThanOrEqual(4.5)
          expect(await selected.getAttribute('aria-pressed')).toBe('true')
          // Pointer feedback must not persist as a scale on a selected Solid toggle.
          expect(hover.transform).toBe('none')
          const directory = process.env.UI_KITS_SCREENSHOT_DIR
          if (directory) {
            await mkdir(directory, { recursive: true })
            await page.screenshot({
              path: join(directory, `${framework}-${id}-toggle-${mode}.png`),
            })
          }
          await selected.focus()
          await page.keyboard.press('Space')
          expect(await page.locator(selector).count()).toBe(0)
          await page.keyboard.press('Space')
          expect(await page.locator(selector).count()).toBe(1)
        }
      } finally {
        await page.close()
      }
    })
  }

  test(`${framework} switch uses quiet off fill and retains each theme's checked geometry`, async () => {
    const page = await open(framework, 'Switch', 'dark')
    const stage = framework === 'react' ? '.demo-stage' : '.preview-canvas'
    try {
      for (const { id } of styleOptions) {
        await chooseStyle(page, framework, id)
        const control = page.locator(`${stage} .zx-switch`).first()
        const input = control.getByRole('switch')
        if (await input.isChecked()) await input.press('Space')
        const off = await control.locator('.zx-switch__track').evaluate((element) => {
          const css = getComputedStyle(element)
          const probe = document.createElement('span')
          probe.style.background = 'var(--zx-surface-subtle)'
          element.append(probe)
          const expected = getComputedStyle(probe).backgroundColor
          probe.remove()
          return { actual: css.backgroundColor, expected, radius: css.borderRadius }
        })
        expect(off.actual).toBe(off.expected)
        await control.locator('.zx-switch__track').click()
        expect(await input.isChecked()).toBe(true)
        expect(
          await control
            .locator('.zx-switch__track')
            .evaluate((element) => getComputedStyle(element).backgroundColor),
        ).not.toBe(off.actual)
        expect(
          await control
            .locator('.zx-switch__track')
            .evaluate((element) => getComputedStyle(element).borderRadius),
        ).toBe(off.radius)
      }
    } finally {
      await page.close()
    }
  })

  test(`${framework} workbench preserves equal edges, readable code and responsive theme identity`, async () => {
    const page = await open(framework, 'Button', 'light')
    const directory = process.env.UI_KITS_SCREENSHOT_DIR
    if (directory) await mkdir(directory, { recursive: true })
    try {
      for (const { id } of styleOptions) {
        await chooseStyle(page, framework, id)
        for (const width of [1440, 1024, 820, 768, 390, 320, 720]) {
          await page.setViewportSize({ width, height: width === 720 ? 450 : 900 })
          await page.evaluate(() => window.scrollTo(0, 0))
          const layout = await page.evaluate((framework) => {
            const root = document.documentElement
            const header = document.querySelector('.site-header')!.getBoundingClientRect()
            const workbench = document
              .querySelector(framework === 'react' ? '.catalog' : '.workbench')!
              .getBoundingClientRect()
            const button = document.querySelector<HTMLElement>(
              framework === 'react' ? '.preview .zx-button' : '.preview-canvas .zx-button',
            )!
            const code = getComputedStyle(document.querySelector('pre')!)
            const heading = getComputedStyle(document.querySelector('h1')!)
            const segment = document.querySelector('.segment-indicator')
            return {
              overflow: root.scrollWidth > innerWidth,
              headerLeft: header.left,
              headerRight: innerWidth - header.right,
              contentLeft: workbench.left,
              contentRight: innerWidth - workbench.right,
              codeSize: parseFloat(code.fontSize),
              displayFont: heading.fontFamily,
              buttonRadius: getComputedStyle(button).borderRadius,
              segmentVisible:
                !segment ||
                getComputedStyle(segment).backgroundColor !==
                  getComputedStyle(segment.parentElement!).backgroundColor,
            }
          }, framework)
          expect(layout.overflow).toBe(false)
          expect(layout.headerLeft).toBe(layout.headerRight)
          expect(layout.contentLeft).toBe(layout.contentRight)
          expect(layout.headerLeft).toBe(layout.contentLeft)
          expect(layout.codeSize).toBeGreaterThanOrEqual(12)
          expect({ framework, id, width, segmentVisible: layout.segmentVisible }).toEqual({
            framework,
            id,
            width,
            segmentVisible: true,
          })
          if (id.startsWith('hepo')) expect(layout.displayFont).toContain('Serif')
          if (id === 'endfield' || id === 'brutalist') expect(layout.buttonRadius).toBe('0px')
          if (directory && (width === 1440 || width === 390))
            await page.screenshot({ path: join(directory, `${framework}-${id}-${width}.png`) })
        }
      }
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.reload()
      // WebKit follows Safari's default: Option-Tab includes links, Tab skips them.
      await page.keyboard.press(process.env.UI_KITS_TEST_WEBKIT ? 'Alt+Tab' : 'Tab')
      const skip = page.locator('.skip-link')
      const focus = await skip.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        return {
          focused: document.activeElement === element,
          unobscured: element.contains(document.elementFromPoint(rect.x + 8, rect.y + 8)),
          active: document.activeElement?.outerHTML.slice(0, 180),
        }
      })
      expect(focus).toEqual({ ...focus, focused: true, unobscured: true })
    } finally {
      await page.close()
    }
  }, 60_000)
}

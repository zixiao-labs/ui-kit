import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { afterAll, beforeAll, expect, test } from '@lightning-js/lightning'
import { chromium } from 'playwright'
import type { Browser } from 'playwright'
import { compile } from 'tailwindcss'
import { themePresets, themeToCSS, zixiaoDarkColors } from '../packages/react/src/theme'

let browser: Browser
beforeAll(async () => {
  browser = await chromium.launch({ args: ['--use-mock-keychain', '--password-store=basic'] })
})
afterAll(async () => {
  await browser?.close()
})

test('real Tailwind imports follow presets, custom colors, fonts and nested scopes in the browser', async () => {
  const fromDemo = createRequire(resolve('apps/demo/package.json'))
  const compiler = await compile(
    `@import 'tailwindcss';
@import '@zixiao-labs/ui-kits-react/tailwind.css';
@import '@zixiao-labs/ui-kits-react/base.css' layer(components);
@import '@zixiao-labs/ui-kits-react/themes/clean.css' layer(components);`,
    {
      base: resolve('apps/demo'),
      loadStylesheet: async (id, base) => {
        const path = id.startsWith('.')
          ? resolve(base, id)
          : fromDemo.resolve(id === 'tailwindcss' ? 'tailwindcss/index.css' : id)
        return { path, base: dirname(path), content: readFileSync(path, 'utf8') }
      },
    },
  )
  const css = compiler.build([
    'bg-zx-accent',
    'text-zx-on-accent',
    'bg-zx-surface',
    'text-zx-text',
    'font-zx',
    'font-zx-display',
    'rounded-zx',
    'rounded-none',
    'p-6',
  ])
  const themes = [
    themeToCSS({ ...themePresets.qingdaoPengxian, fontFamily: 'monospace' }, '#outer'),
    themeToCSS({ primary: '#3269b1', secondary: '#edb9a2', displayFontFamily: 'serif' }, '#inner'),
    themeToCSS({ ...themePresets.zixiao, darkColors: zixiaoDarkColors }, '#zixiao'),
  ].join('\n')
  const page = await browser.newPage()
  try {
    await page.setContent(`<style>${css}\n${themes}</style>
<section id="outer" data-zx-style="clean" data-zx-color-mode="dark" class="bg-zx-surface text-zx-text p-6">
  <button id="preset" class="bg-zx-accent text-zx-on-accent font-zx rounded-zx">青岛蓬仙</button>
  <div id="inner" data-zx-style="clean" data-zx-color-mode="light">
    <button id="custom" class="bg-zx-accent text-zx-on-accent font-zx-display">自定义主题</button>
  </div>
  <div data-zx-style="clean"><button id="native" class="bg-zx-accent">原生主题</button></div>
</section>
<div id="zixiao" data-zx-style="clean" data-zx-color-mode="dark">
  <button id="optimized" class="bg-zx-accent text-zx-on-accent">紫霄</button>
  <button id="override" class="zx-button rounded-none">工具类覆盖组件形状</button>
</div>`)
    const styles = await page.evaluate(() =>
      Object.fromEntries(
        ['preset', 'custom', 'native', 'optimized', 'override', 'outer'].map((id) => {
          const style = getComputedStyle(document.getElementById(id)!)
          return [
            id,
            {
              background: style.backgroundColor,
              color: style.color,
              font: style.fontFamily,
              radius: style.borderRadius,
              padding: style.padding,
            },
          ]
        }),
      ),
    )
    expect(styles.preset.background).toBe('rgb(71, 183, 156)')
    expect(styles.preset.font).toBe('monospace')
    expect(styles.preset.radius).toBe('12px')
    expect(styles.custom.background).toBe('rgb(50, 105, 177)')
    expect(styles.custom.font).toBe('serif')
    expect(styles.native.background).toBe('rgb(139, 92, 246)')
    expect(styles.optimized.background).toBe('rgb(66, 34, 86)')
    expect(styles.optimized.color).toBe('rgb(255, 255, 255)')
    expect(styles.override.radius).toBe('0px')
    expect(styles.outer.padding).toBe('24px')
    await page.locator('#zixiao').evaluate((element) => {
      element.setAttribute('data-zx-color-mode', 'light')
    })
    expect(
      await page
        .locator('#optimized')
        .evaluate((element) => getComputedStyle(element).backgroundColor),
    ).toBe('rgb(139, 92, 246)')
  } finally {
    await page.close()
  }
})

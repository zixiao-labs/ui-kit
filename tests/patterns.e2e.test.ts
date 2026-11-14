import { readFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, beforeAll, expect, test } from '@lightning-js/lightning'
import { chromium } from 'playwright'
import type { Browser } from 'playwright'
import { PNG } from 'pngjs'
import { patternTraces } from '../packages/react/src/optional/pattern-traces'

let browser: Browser
beforeAll(async () => {
  browser = await chromium.launch()
})
afterAll(async () => {
  await browser?.close()
})

for (const name of ['hui', 'yunlei', 'lei'] as const) {
  test(`${name} preserves the reference ink contours and repeats without a traced cut-edge cap`, async () => {
    const motif = patternTraces[name]
    const reference = PNG.sync.read(
      readFileSync(`packages/react/tests/fixtures/patterns/${name}.png`),
    )
    expect([reference.width, reference.height]).toEqual([motif.width, motif.height])
    const page = await browser.newPage({
      viewport: { width: motif.width * 3, height: motif.height },
    })
    try {
      // Render the actual shipped paths at the reference's native pixel scale.
      // Three tiles exercise both joins rather than inspecting an isolated icon.
      await page.setContent(`<style>body{margin:0;background:white}svg{display:block}</style>
        <svg xmlns="http://www.w3.org/2000/svg" width="${motif.width * 3}" height="${motif.height}">
          <defs><pattern id="p" width="${motif.width}" height="${motif.height}" patternUnits="userSpaceOnUse">
            <path d="${motif.path}" transform="translate(${-motif.offsetX} 0)" fill="black" fill-rule="evenodd"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#p)"/>
        </svg>`)
      const bytes = await page.screenshot()
      const actual = PNG.sync.read(bytes)
      let intersection = 0
      let union = 0
      for (let y = 0; y < actual.height; y++) {
        for (let x = 0; x < actual.width; x++) {
          const a = actual.data[(y * actual.width + x) * 4] < 128
          const b = reference.data[(y * reference.width + (x % reference.width)) * 4] < 128
          intersection += Number(a && b)
          union += Number(a || b)
        }
      }
      // Compare ink, not mostly-empty canvas pixels: a thin/wrong glyph cannot
      // pass just because its background is white.
      const inkIoU = intersection / union
      console.log(`${name}: reference ink IoU ${(inkIoU * 100).toFixed(2)}%`)
      expect(inkIoU > 0.93).toBe(true)
      if (motif.offsetX) {
        for (const boundary of [motif.width, motif.width * 2]) {
          let mismatches = 0
          for (let y = 0; y < actual.height; y++) {
            const left = actual.data[(y * actual.width + boundary - 1) * 4] < 128
            const right = actual.data[(y * actual.width + boundary) * 4] < 128
            mismatches += Number(left !== right)
          }
          expect(mismatches <= 1).toBe(true)
        }
      }
      if (process.env.UI_KITS_SCREENSHOT_DIR) {
        mkdirSync(process.env.UI_KITS_SCREENSHOT_DIR, { recursive: true })
        await page.screenshot({
          path: join(process.env.UI_KITS_SCREENSHOT_DIR, `${name}-traced-strip.png`),
        })
      }
      // Standalone SVGs also need an explicit crop: resizing to a different
      // aspect ratio must not expose the neighboring periods in letterbox space.
      const asset = readFileSync(`packages/react/assets/patterns/${name}.svg`, 'utf8').replace(
        `width="${motif.width}"`,
        `width="${motif.width + 80}"`,
      )
      await page.setContent(
        `<style>body{margin:0;background:white}svg{display:block}</style>${asset}`,
      )
      const letterboxed = PNG.sync.read(await page.locator('svg').screenshot())
      let escapedInk = 0
      for (let y = 0; y < letterboxed.height; y++) {
        for (let x = 0; x < letterboxed.width; x++) {
          if (x < 39 || x >= letterboxed.width - 39) {
            escapedInk += Number(letterboxed.data[(y * letterboxed.width + x) * 4] < 128)
          }
        }
      }
      expect(escapedInk).toBe(0)
    } finally {
      await page.close()
    }
  })
}

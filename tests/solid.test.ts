import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { expect, test } from '@lightning-js/lightning'
import { createTheme, themeToCSS } from '../packages/solid/src/theme'
import { createTheme as reactTheme } from '../packages/react/src/theme'

test('Solid and React share the exact HCT implementation rather than forked palettes', () => {
  expect(createTheme).toBe(reactTheme)
  expect(createTheme()['--zx-accent']).toBe('#8b5cf6')
  expect(themeToCSS()).toContain('[data-zx-theme="custom"][data-zx-color-mode="dark"]')
})

test('Solid demo configuration uses library Select controls rather than OS menus', () => {
  for (const path of ['app.tsx', 'examples.tsx']) {
    expect(readFileSync(`apps/solid-demo/src/${path}`, 'utf8')).not.toMatch(/<select(?:\s|>)/)
  }
})

test('Solid copies the canonical styles and traced motifs without a React runtime dependency', () => {
  execFileSync(process.execPath, ['packages/solid/scripts/generate-styles.mjs'])
  for (const name of ['base', 'styles']) {
    const source = readFileSync(`packages/react/src/${name}.css`, 'utf8')
    const result = readFileSync(`packages/solid/styles/${name}.css`, 'utf8')
    expect(result.startsWith(source)).toBe(true)
    expect(result).toContain(readFileSync('packages/solid/src/solid.css', 'utf8'))
  }
  for (const name of readdirSync('packages/react/src/themes')) {
    expect(readFileSync(`packages/solid/styles/themes/${name}`, 'utf8')).toBe(
      readFileSync(`packages/react/src/themes/${name}`, 'utf8'),
    )
  }
  const manifest = JSON.parse(readFileSync('packages/solid/package.json', 'utf8'))
  expect(manifest.peerDependencies['solid-js']).toBe('^1.9.8')
  expect(Object.keys(manifest.dependencies).some((name) => /react/.test(name))).toBe(false)
  expect(readFileSync('packages/solid/src/patterns.tsx', 'utf8')).toContain(
    "from '../../react/src/optional/pattern-traces'",
  )
  expect(readFileSync('packages/solid/styles/patterns.css', 'utf8')).toBe(
    readFileSync('packages/react/src/optional/patterns.css', 'utf8'),
  )
})

import { readFileSync, readdirSync } from 'node:fs'
import { expect, test } from '@lightning-js/lightning'

test('demo configuration never falls back to a raw system select', () => {
  const visit = (directory: string): string[] =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const path = `${directory}/${entry.name}`
      return entry.isDirectory() ? visit(path) : path.endsWith('.tsx') ? [path] : []
    })
  for (const path of visit('apps/demo/src')) {
    expect(readFileSync(path, 'utf8')).not.toContain('<select')
  }
})

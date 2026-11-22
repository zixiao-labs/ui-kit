import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { bundleStyles } from '../../shared/styles.mjs'

// The existing framework-neutral CSS and traced paths remain the source of truth.
// Never maintain a second handwritten theme or redraw the traced patterns.
const react = new URL('../../react/src/', import.meta.url)
const output = new URL('../styles/', import.meta.url)
await mkdir(new URL('css/', output), { recursive: true })
await mkdir(new URL('themes/', output), { recursive: true })
const { base, styles } = await bundleStyles(react)
for (const name of [
  'foundation',
  'display',
  'forms',
  'navigation',
  'pickers',
  'motion',
  'effects',
]) {
  await cp(new URL(`${name}.css`, react), new URL(`css/${name}.css`, output))
}
await cp(new URL('themes/', react), new URL('themes/', output), { recursive: true })
await cp(new URL('optional/patterns.css', react), new URL('patterns.css', output))
await cp(new URL('optional/tailwind.css', react), new URL('tailwind.css', output))
const bridge = await readFile(new URL('../src/solid.css', import.meta.url), 'utf8')
await writeFile(new URL('css/solid.css', output), bridge)
for (const [name, content] of [
  ['base.css', base],
  ['styles.css', styles],
]) {
  await writeFile(new URL(name, output), `${content}\n${bridge}`)
}

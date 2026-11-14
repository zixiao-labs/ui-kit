import { writeFile } from 'node:fs/promises'
import { bundleStyles } from '../../shared/styles.mjs'

// Both public entries are flat: Nasti's dev CSS injection does not resolve
// relative CSS @imports. Component sources and theme adapters stay independent.
const source = new URL('../src/', import.meta.url)
const { base, styles } = await bundleStyles(source)
await writeFile(new URL('base.css', source), base)
await writeFile(new URL('styles.css', source), styles)

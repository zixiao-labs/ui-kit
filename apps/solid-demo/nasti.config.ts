import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { defineConfig } from '@nasti-toolchain/nasti'

const require = createRequire(import.meta.url)
const fromLibrary = createRequire(require.resolve('@zixiao-labs/ui-kits-solid'))

export default defineConfig({
  framework: 'solid',
  // As in the React workbench, Nasti's independent subpath prebundles duplicate
  // shared focus-scope stacks. Resolve Kobalte's browser ESM entries together so
  // a Select portal pauses its parent Dialog trap rather than closing instantly.
  // This bridge is local to the SPA, not part of the component package.
  resolve: { alias: { '@kobalte/core': dirname(fromLibrary.resolve('@kobalte/core')) } },
  build: { minify: true, rolldownOptions: { treeshake: true } },
})

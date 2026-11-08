import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { defineConfig, tanstackStart } from '@nasti-toolchain/nasti'

const require = createRequire(import.meta.url)
const fromLibrary = createRequire(require.resolve('@zixiao-labs/ui-kits-react'))
// Resolve Adobe's public ESM entries together. Independent per-subpath
// prebundles otherwise duplicate their shared collection and focus contexts.
// Keep this Demo-only bridge until Nasti shares overlapping dependency chunks.
const ariaEntries = dirname(fromLibrary.resolve('react-aria/CollectionBuilder'))

export default defineConfig({
  framework: 'react',
  resolve: {
    alias: {
      'react-aria-components': dirname(fromLibrary.resolve('react-aria-components')),
      'react-aria/i18n': dirname(fromLibrary.resolve('react-aria/i18n')),
      'react-aria': ariaEntries,
    },
  },
  plugins: [tanstackStart()],
})

import { defineConfig } from '@lightning-js/lightning/config'

export default defineConfig({
  test: {
    include: ['tests/package.test.ts', 'tests/solid.package.test.ts'],
    environment: 'node',
    testTimeout: 120_000,
  },
})

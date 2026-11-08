import { defineConfig } from '@lightning-js/lightning/config'

export default defineConfig({
  test: {
    include: [
      'packages/*/src/**/*.test.tsx',
      'packages/*/src/**/*.test.ts',
      'tests/styles.test.ts',
      'tests/component-catalogue.test.ts',
    ],
    environment: 'node',
  },
})

import { defineConfig } from '@lightning-js/lightning/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    maxWorkers: 1,
    testTimeout: 30_000,
  },
})

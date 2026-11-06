import { defineConfig } from '@lightning-js/lightning/config'

export default defineConfig({
  test: {
    include: ['packages/*/src/**/*.test.tsx'],
    environment: 'node',
  },
})

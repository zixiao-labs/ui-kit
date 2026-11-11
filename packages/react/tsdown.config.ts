import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    theme: 'src/theme.ts',
  },
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  dts: true,
  sourcemap: true,
  clean: true,
  // Runtime and peer dependencies stay external, including React subpaths.
  deps: { onlyBundle: [] },
  copy: [
    { from: ['src/base.css', 'src/styles.css'], to: 'dist' },
    { from: 'src/themes/*.css', to: 'dist/themes' },
  ],
})

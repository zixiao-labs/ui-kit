import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    theme: 'src/theme.ts',
    patterns: 'src/optional/patterns.tsx',
    'liquid-glass': 'src/optional/liquid-glass.tsx',
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
    { from: 'src/*.css', to: 'dist/css' },
    { from: 'src/optional/*.css', to: 'dist' },
    { from: 'src/themes/*.css', to: 'dist/themes' },
  ],
})

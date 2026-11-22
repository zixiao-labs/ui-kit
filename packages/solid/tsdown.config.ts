import { defineConfig } from 'tsdown'

// Preserve JSX so the consumer's Solid compiler chooses DOM or SSR output.
// Precompiling DOM instructions here would break SolidStart/SSR consumers.
export default defineConfig({
  entry: { index: 'src/index.ts', theme: 'src/theme.ts', patterns: 'src/patterns.tsx' },
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  dts: true,
  sourcemap: true,
  clean: true,
  deps: { onlyBundle: [] },
  inputOptions: { transform: { jsx: 'preserve' } },
  outputOptions: {
    entryFileNames: (chunk) => (chunk.name === 'theme' ? '[name].js' : '[name].jsx'),
  },
  copy: [
    {
      from: ['styles/styles.css', 'styles/base.css', 'styles/patterns.css', 'styles/tailwind.css'],
      to: 'dist',
    },
    { from: 'styles/css/*.css', to: 'dist/css' },
    { from: 'styles/themes/*.css', to: 'dist/themes' },
  ],
})

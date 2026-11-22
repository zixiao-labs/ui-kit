import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { expect, test } from '@lightning-js/lightning'

const library = resolve('packages/solid')
const fromDemo = createRequire(resolve('apps/solid-demo/package.json'))
const fromLibrary = createRequire(join(library, 'package.json'))
const version = (name: string, from = fromDemo) =>
  JSON.parse(
    readFileSync(
      name === '@nasti-toolchain/nasti'
        ? join(dirname(dirname(from.resolve(name))), 'package.json')
        : from.resolve(`${name}/package.json`),
      'utf8',
    ),
  ).version
function pnpm(args: string[], cwd: string) {
  try {
    return execFileSync(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', args, {
      cwd,
      shell: process.platform === 'win32',
      encoding: 'utf8',
      timeout: 90_000,
      maxBuffer: 4 * 1024 * 1024,
    })
  } catch (error) {
    const output = error as { stdout?: string; stderr?: string }
    throw new Error(
      `pnpm ${args.join(' ')} failed:\n${output.stdout ?? ''}\n${output.stderr ?? ''}`,
      { cause: error },
    )
  }
}
test('Solid tarball supports isolated types, CSS subpaths, DOM compilation and real Node SSR compilation', () => {
  mkdirSync('test-results', { recursive: true })
  const fixture = mkdtempSync(resolve('test-results/solid-package-'))
  try {
    const archive = join(fixture, 'ui-kits-solid.tgz')
    pnpm(['pack', '--out', archive], library)
    writeFileSync(
      join(fixture, 'package.json'),
      JSON.stringify({
        type: 'module',
        private: true,
        dependencies: {
          '@zixiao-labs/ui-kits-solid': `file:${archive}`,
          'solid-js': version('solid-js'),
        },
        devDependencies: Object.fromEntries(
          ['@babel/core', 'babel-preset-solid', '@nasti-toolchain/nasti', 'typescript'].map(
            (name) => [name, version(name)],
          ),
        ),
      }),
    )
    pnpm(
      ['install', '--ignore-workspace', '--ignore-scripts', '--no-lockfile', '--prefer-offline'],
      fixture,
    )
    const packed = join(fixture, 'node_modules/@zixiao-labs/ui-kits-solid')
    const manifest = JSON.parse(readFileSync(join(packed, 'package.json'), 'utf8'))
    expect(manifest.exports).toEqual(
      JSON.parse(readFileSync(join(library, 'package.json'), 'utf8')).publishConfig.exports,
    )
    expect(existsSync(join(packed, 'src'))).toBe(false)
    expect(existsSync(join(fixture, 'node_modules/react'))).toBe(false)
    const entry = readFileSync(join(packed, 'dist/index.jsx'), 'utf8')
    expect(entry).toContain('from "solid-js"')
    expect(entry).not.toContain('react')
    expect(entry).not.toContain('@material/material-color-utilities')
    const consumer = createRequire(join(fixture, 'package.json'))
    for (const path of [
      'styles.css',
      'base.css',
      'patterns.css',
      'tailwind.css',
      'css/forms.css',
      'css/solid.css',
      ...readdirSync('packages/react/src/themes').map((name) => `themes/${name}`),
    ]) {
      expect(readFileSync(consumer.resolve(`@zixiao-labs/ui-kits-solid/${path}`), 'utf8')).toBe(
        readFileSync(join(library, 'styles', path), 'utf8'),
      )
    }
    writeFileSync(
      join(fixture, 'consumer.tsx'),
      readFileSync(join(library, 'tests/consumer.tsx'), 'utf8'),
    )
    for (const [module, moduleResolution] of [
      ['ESNext', 'Bundler'],
      ['NodeNext', 'NodeNext'],
    ]) {
      writeFileSync(
        join(fixture, 'tsconfig.json'),
        JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            module,
            moduleResolution,
            jsx: 'preserve',
            jsxImportSource: 'solid-js',
            strict: true,
            // Match the workspace: Kobalte 0.13.14's namespace declaration
            // aliases fail under TS 7 with skipLibCheck:false (TS2693).
            // Consumer TSX and our public prop types are still checked strictly.
            skipLibCheck: true,
            noEmit: true,
            types: [],
          },
          include: ['consumer.tsx'],
        }),
      )
      pnpm(['exec', 'tsc'], fixture)
    }
    writeFileSync(
      join(fixture, 'index.html'),
      '<div id="app"></div><script type="module" src="/index.tsx"></script>',
    )
    writeFileSync(
      join(fixture, 'index.tsx'),
      `import { render } from 'solid-js/web'; import { Sample } from './consumer.jsx'; import '@zixiao-labs/ui-kits-solid/styles.css'; render(() => <Sample />, document.getElementById('app')!);`,
    )
    writeFileSync(
      join(fixture, 'server.tsx'),
      `import { renderToString } from 'solid-js/web'; import { Sample } from './consumer.jsx'; console.log(renderToString(() => <Sample />));`,
    )
    // Native Solid source exports need the consuming compiler for DOM and SSR,
    // including Kobalte's own preserved-JSX exports on the server.
    writeFileSync(
      join(fixture, 'nasti.config.ts'),
      `import { defineConfig } from '@nasti-toolchain/nasti';
export default defineConfig({
  framework: 'solid',
  environments: {
    server: {
      consumer: 'server', entry: 'server.tsx',
      resolve: { conditions: ['solid', 'node'], noExternal: true },
      build: { outDir: 'server', rolldownOptions: { output: { entryFileNames: 'index.mjs' } } },
    },
  },
});`,
    )
    pnpm(['exec', 'nasti', 'build'], fixture)
    const assets = readdirSync(join(fixture, 'dist/assets'))
    expect(assets.some((name) => name.endsWith('.css'))).toBe(true)
    const html = execFileSync(process.execPath, ['server/index.mjs'], {
      cwd: fixture,
      encoding: 'utf8',
      timeout: 30_000,
    })
    expect(html).toContain('Solid tarball consumer')
    expect(html).toContain('value="Packed workspace"')
    expect(html).toContain('data-zx-pattern="hui"')
    expect(html).toContain('Open settings')
    expect(html).not.toContain('role="dialog"')
    console.log(
      `Solid tarball: ${assets.length} browser assets; SSR ${html.length} characters; solid-js ${version('solid-js', fromLibrary)}`,
    )
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
})

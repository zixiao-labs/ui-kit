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
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'
import { expect, test } from '@lightning-js/lightning'
import * as source from '../packages/react/src/index'

const library = resolve('packages/react')
const fromLibrary = createRequire(join(library, 'package.json'))
const manifest = JSON.parse(readFileSync(join(library, 'package.json'), 'utf8'))
const installedVersion = (name: string) =>
  JSON.parse(readFileSync(fromLibrary.resolve(`${name}/package.json`), 'utf8')).version

function pnpm(args: string[], cwd: string) {
  return execFileSync(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', args, {
    cwd,
    shell: process.platform === 'win32',
    encoding: 'utf8',
    timeout: 90_000,
    maxBuffer: 4 * 1024 * 1024,
  })
}

test('packs a source-free library usable through its public JS, type and CSS exports', async () => {
  mkdirSync('test-results', { recursive: true })
  const fixture = mkdtempSync(resolve('test-results/package-'))
  try {
    const archive = join(fixture, 'ui-kits-react.tgz')
    // Run the real lifecycle: prepack must build JS, declarations and current CSS.
    pnpm(['pack', '--out', archive], library)
    writeFileSync(
      join(fixture, 'package.json'),
      JSON.stringify({
        private: true,
        type: 'module',
        dependencies: {
          [manifest.name]: `file:${archive}`,
          react: installedVersion('react'),
          'react-dom': installedVersion('react-dom'),
        },
        devDependencies: {
          '@types/react': installedVersion('@types/react'),
          '@types/react-dom': installedVersion('@types/react-dom'),
          typescript: installedVersion('typescript'),
        },
      }),
    )
    pnpm(
      ['install', '--ignore-workspace', '--ignore-scripts', '--no-lockfile', '--prefer-offline'],
      fixture,
    )

    const fromConsumer = createRequire(join(fixture, 'package.json'))
    const packed = join(fixture, 'node_modules', manifest.name)
    const packedManifest = JSON.parse(readFileSync(join(packed, 'package.json'), 'utf8'))
    expect(packedManifest.exports).toEqual(manifest.publishConfig.exports)
    expect(packedManifest.sideEffects).toEqual(['**/*.css'])
    // Do not resolve upward here: a developer's ancestor checkout can contain
    // the peer even though this isolated consumer did not install it.
    expect(existsSync(join(fixture, 'node_modules/liquid-glass-react'))).toBe(false)
    expect(existsSync(join(packed, 'src'))).toBe(false)
    expect(existsSync(join(packed, 'tsdown.config.ts'))).toBe(false)
    for (const entry of ['', '/theme', '/patterns', '/liquid-glass']) {
      expect(fromConsumer.resolve(`${manifest.name}${entry}`)).toContain(
        `${join('dist', entry ? entry.slice(1) : 'index')}.js`,
      )
    }
    expect(packedManifest.peerDependenciesMeta['liquid-glass-react'].optional).toBe(true)

    for (const path of [
      'base.css',
      'styles.css',
      ...readdirSync(join(library, 'src/themes'))
        .filter((name) => name.endsWith('.css'))
        .map((name) => `themes/${name}`),
    ]) {
      expect(readFileSync(fromConsumer.resolve(`${manifest.name}/${path}`), 'utf8')).toBe(
        readFileSync(join(library, 'src', path), 'utf8'),
      )
    }
    for (const name of ['patterns', 'liquid-glass']) {
      expect(readFileSync(fromConsumer.resolve(`${manifest.name}/${name}.css`), 'utf8')).toBe(
        readFileSync(join(library, 'src/optional', `${name}.css`), 'utf8'),
      )
      expect(
        readFileSync(fromConsumer.resolve(`${manifest.name}/styles.css`), 'utf8'),
      ).not.toContain(name === 'patterns' ? '.zx-pattern-background' : '.zx-liquid-glass')
    }
    for (const name of [
      'foundation',
      'display',
      'effects',
      'forms',
      'motion',
      'navigation',
      'pickers',
    ]) {
      expect(readFileSync(fromConsumer.resolve(`${manifest.name}/css/${name}.css`), 'utf8')).toBe(
        readFileSync(join(library, 'src', `${name}.css`), 'utf8'),
      )
    }

    const entry = readFileSync(join(packed, 'dist/index.js'), 'utf8')
    expect(entry).toContain('from "react"')
    expect(entry).toContain('from "react/jsx-runtime"')
    expect(entry).not.toContain('from "vgpu"')
    expect(entry).not.toContain('@material/material-color-utilities')
    const gpuChunk = entry.match(/import\("(\.\/gpu-shadow-[^"]+\.js)"\)/)?.[1]
    expect(gpuChunk).toBeDefined()
    expect(readFileSync(join(packed, 'dist', gpuChunk!), 'utf8')).toContain('from "vgpu"')

    writeFileSync(
      join(fixture, 'consumer.tsx'),
      readFileSync(join(library, 'tests/package-consumer.tsx'), 'utf8'),
    )
    const compiler = {
      target: 'ES2022',
      jsx: 'react-jsx',
      strict: true,
      skipLibCheck: false,
      types: [],
      outDir: 'compiled',
    }
    for (const [module, moduleResolution] of [
      ['ESNext', 'Bundler'],
      ['NodeNext', 'NodeNext'],
    ]) {
      writeFileSync(
        join(fixture, 'tsconfig.json'),
        JSON.stringify({
          compilerOptions: { ...compiler, module, moduleResolution },
          include: ['consumer.tsx'],
        }),
      )
      pnpm(['exec', 'tsc', '--project', 'tsconfig.json'], fixture)
    }

    const output = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '--eval',
        `
          import * as components from '@zixiao-labs/ui-kits-react'
          import { createTheme } from '@zixiao-labs/ui-kits-react/theme'
          import { renderToStaticMarkup } from 'react-dom/server'
          import { sample, optionalSample, css } from './compiled/consumer.js'
          console.log(JSON.stringify({
            exports: Object.keys(components).sort(),
            html: renderToStaticMarkup(sample),
            optionalHtml: renderToStaticMarkup(optionalSample),
            primary: createTheme()['--zx-accent'],
            css,
          }))
        `,
      ],
      { cwd: fixture, encoding: 'utf8', timeout: 30_000 },
    )
    const result = JSON.parse(output)
    expect(result.exports).toEqual(Object.keys(source).sort())
    expect(result.html).toContain('Packed component')
    expect(result.html).toContain('zx-select')
    expect(result.html).toContain('zx-date-input')
    expect(result.html).toContain('value="2026-11-11"')
    expect(result.primary).toBe('#8b5cf6')
    expect(result.css).toContain('[data-zx-theme="custom"]')
    expect(result.optionalHtml).toContain('data-zx-pattern="yunlei"')
    expect(result.optionalHtml).toContain('data-zx-liquid-glass="loading"')

    // Exercise real dead-export elimination on the packed entry points, without
    // installing the optional peer. Runtime dependencies remain external here;
    // this is an isolation regression, not a complete app-size benchmark.
    const fromBuilder = createRequire(fromLibrary.resolve('tsdown'))
    const { rolldown } = await import(pathToFileURL(fromBuilder.resolve('rolldown')).href)
    const reports: Record<string, { bytes: number; gzip: number }> = {}
    for (const name of ['button', 'unused', 'pattern']) {
      const input = join(fixture, `${name}.mjs`)
      writeFileSync(
        input,
        `
        import { Button } from '${manifest.name}'
        ${
          name === 'unused'
            ? `
          import { PatternBackground } from '${manifest.name}/patterns'
          import { LiquidGlassSurface } from '${manifest.name}/liquid-glass'
          import { createTheme } from '${manifest.name}/theme'
        `
            : ''
        }
        ${name === 'pattern' ? `import { PatternBackground } from '${manifest.name}/patterns'` : ''}
        export { Button ${name === 'pattern' ? ', PatternBackground' : ''} }
      `,
      )
      const bundle = await rolldown({
        input,
        treeshake: true,
        external: (id: string) =>
          !id.startsWith(manifest.name) && !id.startsWith('.') && !id.startsWith('/'),
      })
      try {
        const { output } = await bundle.generate({ format: 'esm', minify: true })
        const code = output
          .map((chunk: { type: string; code?: string }) => chunk.code ?? '')
          .join('\n')
        expect(code).not.toContain('liquid-glass-react')
        expect(code).not.toContain('zx-liquid-glass')
        expect(code).not.toContain('@material/material-color-utilities')
        if (name === 'pattern') expect(code).toContain('zx-pattern-')
        else expect(code).not.toContain('zx-pattern-')
        reports[name] = { bytes: Buffer.byteLength(code), gzip: gzipSync(code).byteLength }
      } finally {
        await bundle.close()
      }
    }
    expect(reports.unused).toEqual(reports.button)
    console.log('Packed ESM isolation (runtime dependencies external):', JSON.stringify(reports))
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
})

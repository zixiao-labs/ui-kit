import { execFileSync, spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { join, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'
import { expect, test } from '@lightning-js/lightning'
import * as source from '../packages/react/src/index'

const library = resolve('packages/react')
const fromLibrary = createRequire(join(library, 'package.json'))
const manifest = JSON.parse(readFileSync(join(library, 'package.json'), 'utf8'))
const { packageManager } = JSON.parse(readFileSync('package.json', 'utf8'))
const skillName = 'zixiao-new-chinese-design'
const installedVersion = (name: string) =>
  JSON.parse(readFileSync(fromLibrary.resolve(`${name}/package.json`), 'utf8')).version

function pnpm(args: string[], cwd: string) {
  const result = spawnSync(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', args, {
    cwd,
    shell: process.platform === 'win32',
    encoding: 'utf8',
    timeout: 90_000,
    maxBuffer: 4 * 1024 * 1024,
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(`pnpm ${args.join(' ')} failed:\n${result.stdout}${result.stderr}`)
  }
}

test('packs a source-free library with working public exports and a pnpm-approved skill', async () => {
  mkdirSync('test-results', { recursive: true })
  const fixture = mkdtempSync(resolve('test-results/package-'))
  try {
    const archive = process.env.UI_KITS_REACT_TARBALL
      ? resolve(process.env.UI_KITS_REACT_TARBALL)
      : join(fixture, 'ui-kits-react.tgz')
    // CI tests the exact archive later uploaded for publishing. Local runs also
    // exercise the real prepack lifecycle, including JS, declarations and CSS.
    if (!process.env.UI_KITS_REACT_TARBALL) pnpm(['pack', '--out', archive], library)
    const tarball = `file:${relative(fixture, archive).split(sep).join('/')}`
    writeFileSync(
      join(fixture, 'package.json'),
      JSON.stringify({
        private: true,
        type: 'module',
        packageManager,
        dependencies: {
          [manifest.name]: tarball,
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
    const workspace = join(fixture, 'pnpm-workspace.yaml')
    const skillSettings = 'skills:\n  dirs:\n    - .agents/skills\n'
    const install = ['install', '--ignore-scripts', '--no-frozen-lockfile', '--prefer-offline']
    writeFileSync(workspace, skillSettings)
    pnpm(install, fixture)
    const linkedSkill = join(fixture, '.agents/skills', skillName)
    expect(existsSync(linkedSkill)).toBe(false)

    // A local tarball requires approval of its exact source, not just the npm name.
    writeFileSync(
      workspace,
      `${skillSettings}permissions:\n  "${manifest.name}@${tarball}":\n    skills: [${skillName}]\n`,
    )
    pnpm(install, fixture)

    const fromConsumer = createRequire(join(fixture, 'package.json'))
    const packed = join(fixture, 'node_modules', manifest.name)
    const packedSkill = join(packed, 'skills', skillName)
    expect(realpathSync(linkedSkill)).toBe(realpathSync(packedSkill))
    const skill = readFileSync(join(linkedSkill, 'SKILL.md'), 'utf8')
    expect(skill).toMatch(/^---\r?\nname: zixiao-new-chinese-design\r?\ndescription: [^\r\n]+\r?\n/)
    expect(readFileSync(join(linkedSkill, 'references/react-ui.md'), 'utf8')).toContain(
      'data-zx-style="hepo"',
    )
    const planPath = join(linkedSkill, 'assets/workspace-plan.json')
    const planScript = join(linkedSkill, 'scripts/check-plan.mjs')
    expect(execFileSync(process.execPath, [planScript, planPath], { encoding: 'utf8' })).toContain(
      '仍需在真实页面',
    )
    const plan = JSON.parse(readFileSync(planPath, 'utf8'))
    const changedPlan = join(fixture, 'changed-plan.json')
    writeFileSync(changedPlan, JSON.stringify({ ...plan, taste: ['hero', 'random-palette'] }))
    const drift = spawnSync(process.execPath, [planScript, changedPlan], { encoding: 'utf8' })
    expect(drift.status).toBe(1)
    expect(drift.stderr).toContain('"hero"')
    expect(drift.stderr).toContain('"random-palette"')
    writeFileSync(changedPlan, JSON.stringify({ ...plan, page: 'landing', taste: ['hero'] }))
    expect(spawnSync(process.execPath, [planScript, changedPlan]).status).toBe(0)

    const packedManifest = JSON.parse(readFileSync(join(packed, 'package.json'), 'utf8'))
    expect(packedManifest.exports).toEqual(manifest.publishConfig.exports)
    expect(packedManifest.sideEffects).toEqual(['**/*.css'])
    expect(packedManifest.name).toBe('@zixiao-labs/ui-kits-react')
    expect(packedManifest.version).toBe(manifest.version)
    expect(packedManifest.private === true).toBe(false)
    expect(packedManifest.license).toBe('MIT')
    expect(packedManifest.author).toBe('Zixiao Laboratories')
    expect(packedManifest.repository).toEqual(manifest.repository)
    expect(readFileSync(join(packed, 'LICENSE'), 'utf8')).toBe(readFileSync('LICENSE', 'utf8'))
    for (const version of Object.values(packedManifest.dependencies) as string[]) {
      expect(version.startsWith('workspace:')).toBe(false)
    }
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
    for (const name of ['patterns', 'liquid-glass', 'tailwind']) {
      expect(readFileSync(fromConsumer.resolve(`${manifest.name}/${name}.css`), 'utf8')).toBe(
        readFileSync(join(library, 'src/optional', `${name}.css`), 'utf8'),
      )
      expect(
        readFileSync(fromConsumer.resolve(`${manifest.name}/styles.css`), 'utf8'),
      ).not.toContain(
        name === 'patterns'
          ? '.zx-pattern-background'
          : name === 'tailwind'
            ? '@theme'
            : '.zx-liquid-glass',
      )
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
    // Compile the actual shipped examples, each in its own module as copied by a reader.
    // A bundler supplies CSS declarations in real apps; check CSS exports separately here.
    const cssImports = new Set<string>()
    const examples = ['consumer.tsx', 'css.d.ts']
    for (const path of ['docs/usage.md', 'docs/components.md', 'docs/styles.md']) {
      const doc = readFileSync(join(packed, path), 'utf8')
      expect(doc).toBe(readFileSync(join(library, path), 'utf8'))
      const snippets = [...doc.matchAll(/^```(tsx?)\r?\n([\s\S]+?)\r?\n```$/gm)]
      if (path !== 'docs/styles.md') expect(snippets.length).toBeGreaterThan(0)
      for (const [index, [, language, code]] of snippets.entries()) {
        const name = `${path.slice('docs/'.length, -'.md'.length)}-${index + 1}.${language}`
        writeFileSync(join(fixture, name), code)
        examples.push(name)
        for (const [, cssImport] of code.matchAll(/^import ['"]([^'"]+\.css)['"]/gm)) {
          expect(fromConsumer.resolve(cssImport)).toContain(`${sep}dist${sep}`)
          cssImports.add(cssImport)
        }
      }
    }
    writeFileSync(
      join(fixture, 'css.d.ts'),
      [...cssImports].map((name) => `declare module ${JSON.stringify(name)} {}`).join('\n'),
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
          include: examples,
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

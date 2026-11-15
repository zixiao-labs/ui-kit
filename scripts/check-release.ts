import assert from 'node:assert/strict'
import { appendFileSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

interface PackageManifest {
  name: string
  version?: string
  private?: boolean
  license?: string
  author?: string
  repository?: { url?: string; directory?: string }
  publishConfig?: { access?: string; registry?: string }
}

export function validateRelease(
  manifest: PackageManifest,
  privatePackages: PackageManifest[],
  tag?: string,
) {
  assert.equal(
    manifest.name,
    '@zixiao-labs/ui-kits-react',
    'Only the React package may be published',
  )
  assert.notEqual(manifest.private, true, 'The React package must be publishable')
  assert.equal(manifest.license, 'MIT', 'The React package must declare its MIT license')
  assert.equal(manifest.author, 'Zixiao Laboratories')
  assert.equal(manifest.repository?.url, 'git+https://github.com/zixiao-labs/ui-kit.git')
  assert.equal(manifest.repository?.directory, 'packages/react')
  assert.equal(manifest.publishConfig?.access, 'public')
  assert.equal(manifest.publishConfig?.registry, 'https://registry.npmjs.org/')
  for (const other of privatePackages) {
    assert.equal(
      other.private,
      true,
      `${other.name} must remain private; Solid is not released yet`,
    )
  }

  // Deliberately support stable versions and named prereleases, not build metadata.
  const version = manifest.version ?? ''
  assert.match(
    version,
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[a-zA-Z][a-zA-Z0-9-]*(\.(0|[1-9]\d*|[a-zA-Z-][a-zA-Z0-9-]*))*)?$/,
    'Use X.Y.Z or X.Y.Z-beta.N; build metadata is not supported',
  )
  assert.notEqual(version.split('-')[0], '0.0.0', 'Replace the workspace placeholder version')
  if (tag !== undefined) {
    assert.equal(tag, `react-v${version}`, 'Release tag must match the React package version')
  }
  return { version, distTag: version.includes('-') ? 'next' : 'latest' }
}

function main() {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const readManifest = (path: string): PackageManifest =>
    JSON.parse(readFileSync(resolve(root, path, 'package.json'), 'utf8'))
  const privatePackages = [
    readManifest('.'),
    ...['apps', 'packages'].flatMap((directory) =>
      readdirSync(resolve(root, directory), { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && `${directory}/${entry.name}` !== 'packages/react')
        .map((entry) => readManifest(`${directory}/${entry.name}`)),
    ),
  ]
  const license = readFileSync(resolve(root, 'LICENSE'), 'utf8')
  assert.equal(readFileSync(resolve(root, 'packages/react/LICENSE'), 'utf8'), license)
  assert.match(license, /MIT License\n\nCopyright \(c\) \d{4} Zixiao Laboratories/)
  const release = validateRelease(readManifest('packages/react'), privatePackages, process.argv[2])
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `version=${release.version}\ndist-tag=${release.distTag}\n`,
    )
  }
  console.log(
    `React ${release.version} → npm ${release.distTag}; all other packages remain private`,
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main()
}

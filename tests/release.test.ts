import { readFileSync } from 'node:fs'
import { expect, test } from '@lightning-js/lightning'
import { validateRelease } from '../scripts/check-release'

const manifest = JSON.parse(readFileSync('packages/react/package.json', 'utf8'))
const privatePackages = [
  '.',
  'packages/shared',
  'packages/solid',
  'apps/demo',
  'apps/solid-demo',
].map((directory) => JSON.parse(readFileSync(`${directory}/package.json`, 'utf8')))

test('only React is public, with MIT metadata and matching licenses in the package', () => {
  expect(validateRelease(manifest, privatePackages)).toEqual({
    version: manifest.version,
    distTag: manifest.version.includes('-') ? 'next' : 'latest',
  })
  expect(readFileSync('packages/react/LICENSE', 'utf8')).toBe(readFileSync('LICENSE', 'utf8'))
  expect(readFileSync('LICENSE', 'utf8')).toContain('Zixiao Laboratories')
})

test('release tags must match the package and cannot publish Solid or another package', () => {
  for (const tag of ['v0.1.0', 'solid-v0.1.0', 'react-v0.0.0', 'react-v999.0.0']) {
    expect(() => validateRelease(manifest, privatePackages, tag)).toThrow()
  }
  expect(() => validateRelease({ ...manifest, private: true }, privatePackages)).toThrow()
  expect(() =>
    validateRelease({ ...manifest, name: '@zixiao-labs/ui-kits-solid' }, privatePackages),
  ).toThrow()
  for (const other of privatePackages) {
    expect(() => validateRelease(manifest, [{ ...other, private: false }])).toThrow()
  }
})

test('stable releases use latest, named prereleases use next, invalid versions are rejected', () => {
  expect(
    validateRelease({ ...manifest, version: '0.1.0' }, privatePackages, 'react-v0.1.0').distTag,
  ).toBe('latest')
  expect(
    validateRelease(
      { ...manifest, version: '0.2.0-beta.1' },
      privatePackages,
      'react-v0.2.0-beta.1',
    ).distTag,
  ).toBe('next')
  for (const version of ['0.0.0', '01.2.3', '1.2', '1.2.3+build', '1.2.3-beta.01', '1.2.3;echo']) {
    expect(() => validateRelease({ ...manifest, version }, privatePackages)).toThrow()
  }
})

test('release metadata cannot drift to a private registry or another repository or license', () => {
  for (const changed of [
    { license: undefined },
    { author: 'Someone else' },
    { repository: { url: 'git+https://github.com/other/ui-kit.git', directory: 'packages/react' } },
    { publishConfig: { ...manifest.publishConfig, access: 'restricted' } },
    { publishConfig: { ...manifest.publishConfig, registry: 'https://npm.pkg.github.com/' } },
  ]) {
    expect(() => validateRelease({ ...manifest, ...changed }, privatePackages)).toThrow()
  }
})

import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { expect, test } from '@lightning-js/lightning'
import shadowShader from '../packages/react/src/shadow.shader'

const fromLibrary = createRequire(resolve('packages/react/package.json'))
const { prepareShader } = await import(fromLibrary.resolve('@vgpu/wgsl/prepare'))

test('the prepared GPU artifact stays in sync without importing a browser WGSL parser', () => {
  const source = readFileSync('packages/react/src/shadow.wgsl', 'utf8')
  expect(shadowShader).toEqual(prepareShader(source, 'shadow.wgsl'))
  const backend = readFileSync('packages/react/src/gpu-shadow.ts', 'utf8')
  expect(backend).not.toContain('frameLoop')
  expect(backend).not.toContain('prepareShader')
})

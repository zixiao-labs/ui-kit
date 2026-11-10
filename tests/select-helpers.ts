import type { Page } from 'playwright'
import { styleOptions } from '../apps/demo/src/style-options'

const modes: Record<string, string> = {
  light: '浅色',
  dark: '深色',
  system: '跟随系统',
  auto: '跟随页面',
}

/** Exercise the visible library picker, not React Aria's hidden form select. */
export async function chooseDemoSelect(page: Page, label: string, value: string) {
  const text = label.includes('风格')
    ? (styleOptions.find((item) => item.id === value)?.name ?? value)
    : (modes[value] ?? value)
  await page.getByRole('button', { name: new RegExp(label) }).click()
  const menu = page.getByRole('listbox', { name: new RegExp(label) })
  await menu.getByRole('option', { name: text, exact: true }).click()
  await menu.waitFor({ state: 'detached' })
}

export async function demoSelectValue(page: Page, label: string) {
  const text = (
    await page
      .getByRole('button', { name: new RegExp(label) })
      .locator('.zx-select-value')
      .textContent()
  )?.trim()
  return Object.entries(modes).find(([, name]) => name === text)?.[0] ?? text
}

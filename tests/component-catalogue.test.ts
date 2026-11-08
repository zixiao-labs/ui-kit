import { readFileSync } from 'node:fs'
import { expect, test } from '@lightning-js/lightning'
import * as components from '../packages/react/src/index'

// HeroUI 3.2.7 All Components, checked 2026-11-07. Breadth baseline, not API compatibility.
const required = `Accordion Alert AlertDialog Autocomplete Avatar AvatarGroup Badge Breadcrumbs
Button ButtonGroup Calendar Card Checkbox CheckboxGroup Chip CloseButton ColorArea ColorField
ColorPicker ColorSlider ColorSwatch ColorSwatchPicker ComboBox DateField DatePicker DateRangePicker
Description Disclosure DisclosureGroup Drawer Dropdown ErrorMessage FieldError Fieldset Form Input
InputGroup InputOTP Kbd Label Link ListBox Meter Modal NumberField Pagination Popover ProgressBar
ProgressCircle RadioGroup RangeCalendar ScrollShadow SearchField Select Separator Sheet Skeleton
Slider Spinner Surface Switch Table Tabs TagGroup TextArea TextField TimeField Toast ToggleButton
ToggleButtonGroup Toolbar Tooltip Typography`.split(/\s+/)

test('exports every component from the HeroUI breadth baseline', () => {
  for (const name of required)
    expect(typeof components[name as keyof typeof components]).toBe('function')
})

// Actual rendering and non-empty usage code are checked by catalogue.e2e.test.ts.
test('declares a unique Demo catalogue entry for every baseline component', () => {
  const sources = ['display', 'forms', 'navigation', 'pickers']
    .map((name) => readFileSync(`apps/demo/src/examples/${name}.tsx`, 'utf8'))
    .join('\n')
  const names = [...sources.matchAll(/name:\s*['"]([^'"]+)['"]/g)]
    .map((match) => match[1])
    .filter((name) => required.includes(name) || name === 'Radio')
  for (const name of required.filter((item) => item !== 'Button')) expect(names).toContain(name)
  expect(new Set(names).size).toBe(names.length)
})

import { createRef } from 'react'
import {
  Button,
  Card,
  DatePicker,
  Modal,
  Select,
  Slider,
  TextField,
  parseDate,
} from '@zixiao-labs/ui-kits-react'
import type { ButtonProps, SelectProps, SurfaceEffects } from '@zixiao-labs/ui-kits-react'
import { createTheme, themeToCSS } from '@zixiao-labs/ui-kits-react/theme'
import type { ThemeOptions } from '@zixiao-labs/ui-kits-react/theme'
import { PatternBackground } from '@zixiao-labs/ui-kits-react/patterns'
import { LiquidGlassSurface } from '@zixiao-labs/ui-kits-react/liquid-glass'

const options: ThemeOptions = { primary: '#8b5cf6', radius: 12 }
const button: ButtonProps = { variant: 'tonal', ref: createRef<HTMLButtonElement>() }
const effects: SurfaceEffects = { shadow: 'gpu', tilt: true }
const select: SelectProps = {
  label: 'Style',
  items: [{ id: 'clean', label: 'Clean' }],
  value: 'clean',
  onChange: (key) => void key,
}

export const sample = (
  <Card effects={effects} style={createTheme(options)}>
    <Button {...button}>Packed component</Button>
    <TextField label="Project" defaultValue="UI Kits" />
    <Select {...select} />
    <DatePicker label="Date" defaultValue={parseDate('2026-11-11')} />
    <Slider<number[]>
      label="Range"
      defaultValue={[10, 30]}
      onChange={(value) => value.map(Number)}
    />
    <Modal title="Details" trigger={<Button>Open</Button>}>
      Details
    </Modal>
  </Card>
)

export const css = themeToCSS(options)
export const optionalSample = (
  <PatternBackground pattern="yunlei">
    <LiquidGlassSurface>
      <Button>Optional material</Button>
    </LiquidGlassSurface>
  </PatternBackground>
)

// Ensure the emitted declarations still reject invalid public API values.
// @ts-expect-error Not a supported Button variant.
const invalidVariant: ButtonProps['variant'] = 'not-a-variant'
void invalidVariant

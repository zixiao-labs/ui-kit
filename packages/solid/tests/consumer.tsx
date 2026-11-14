import { createSignal } from 'solid-js'
import {
  Button,
  Card,
  Checkbox,
  ComboBox,
  InputOTP,
  Modal,
  NumberField,
  Select,
  Slider,
  Switch,
  Tabs,
  TextField,
} from '@zixiao-labs/ui-kits-solid'
import { PatternBackground } from '@zixiao-labs/ui-kits-solid/patterns'
import { createTheme } from '@zixiao-labs/ui-kits-solid/theme'

const options = [{ id: 'solid', label: 'Solid workspace' }]

export function Sample() {
  const [value, setValue] = createSignal('solid')
  return (
    <div data-zx-style="hepo" style={createTheme()}>
      <Card>
        <Button>Solid tarball consumer</Button>
      </Card>
      <TextField label="Project" name="project" defaultValue="Packed workspace" />
      <NumberField label="Members" defaultValue={4} minValue={1} maxValue={10} />
      <InputOTP label="Code" defaultValue="123456" />
      <Checkbox defaultChecked name="notify">
        Notify me
      </Checkbox>
      <Switch defaultChecked>Keep draft</Switch>
      <Slider label="Volume" value={40} />
      <Select
        label="Workspace"
        options={options}
        value={value()}
        onChange={(id) => setValue(id ?? '')}
      />
      <ComboBox label="Search" options={options} />
      <Modal trigger="Open settings" title="Settings">
        Dialog content
      </Modal>
      <Tabs
        label="Sections"
        defaultValue="one"
        items={[{ id: 'one', label: 'Overview', content: <p>Tab content</p> }]}
      />
      <PatternBackground pattern="hui">
        <Button variant="outline">Traced pattern</Button>
      </PatternBackground>
    </div>
  )
}

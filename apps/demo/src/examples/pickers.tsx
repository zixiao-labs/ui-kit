import { useState } from 'react'
import { Briefcase, Person } from '@gravity-ui/icons'
import {
  Autocomplete,
  Calendar,
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  ComboBox,
  DateField,
  DatePicker,
  DateRangePicker,
  RangeCalendar,
  Select,
  TimeField,
  parseColor,
  parseDate,
  parseTime,
} from '@zixiao-labs/ui-kits-react'
import type { ComponentExample } from '../catalog-types'

const people = [
  { id: 'chen', label: '陈予安', icon: <Person /> },
  { id: 'lin', label: '林舒', icon: <Person /> },
  { id: 'guest', label: '访客（暂不可选）', icon: <Person />, disabled: true },
]

const projects = [
  { id: 'north', label: '北岸设计', icon: <Briefcase /> },
  { id: 'brand', label: '北岸品牌手册', icon: <Briefcase /> },
  { id: 'archive', label: '往期归档', icon: <Briefcase />, disabled: true },
]

const swatches = [
  { color: '#2563eb', label: '海蓝' },
  { color: '#0f766e', label: '松绿' },
  { color: '#d97706', label: '琥珀' },
  { color: '#be123c', label: '绛红' },
  { color: '#64748b', label: '岩灰（暂不可选）', disabled: true },
]

function CalendarDemo() {
  const [date, setDate] = useState<ReturnType<typeof parseDate> | null>(parseDate('2026-06-18'))
  return (
    <div className="example-stack">
      <Calendar label="北岸设计评审日期" value={date} onChange={setDate} />
      <output className="example-note">评审日期：{date?.toString() ?? '未选择'}</output>
    </div>
  )
}

function DateFieldDemo() {
  const [date, setDate] = useState<ReturnType<typeof parseDate> | null>(parseDate('2026-06-18'))
  return (
    <div className="example-stack">
      <DateField
        label="项目开始日期"
        value={date}
        onChange={setDate}
        description="使用方向键调整年月日。"
      />
      <output className="example-note">开始日期：{date?.toString() ?? '未填写'}</output>
      <DateField label="归档日期" defaultValue={parseDate('2026-06-30')} disabled />
    </div>
  )
}

function TimeFieldDemo() {
  const [time, setTime] = useState<ReturnType<typeof parseTime> | null>(parseTime('09:30'))
  return (
    <div className="example-stack">
      <TimeField label="与林舒的评审时间" value={time} onChange={setTime} hourCycle={24} />
      <output className="example-note">评审时间：{time?.toString() ?? '未填写'}</output>
      <TimeField label="不可预约时段" defaultValue={parseTime('18:00')} disabled hourCycle={24} />
    </div>
  )
}

function DatePickerDemo() {
  const [date, setDate] = useState<ReturnType<typeof parseDate> | null>(parseDate('2026-06-18'))
  return (
    <div className="example-stack">
      <DatePicker
        label="北岸设计交付日期"
        value={date}
        onChange={setDate}
        minValue={parseDate('2026-06-01')}
      />
      <output className="example-note">交付日期：{date?.toString() ?? '未选择'}</output>
      <DatePicker label="已锁定的交付日期" defaultValue={parseDate('2026-06-30')} disabled />
    </div>
  )
}

function DateRangePickerDemo() {
  const [range, setRange] = useState<{
    start: ReturnType<typeof parseDate>
    end: ReturnType<typeof parseDate>
  } | null>({ start: parseDate('2026-06-08'), end: parseDate('2026-06-18') })
  return (
    <div className="example-stack">
      <DateRangePicker
        label="北岸设计迭代周期"
        value={range}
        onChange={setRange}
        description="选择开始和结束日期，或直接编辑日期。"
      />
      <output className="example-note">
        迭代周期：{range ? `${range.start} 至 ${range.end}` : '未选择'}
      </output>
      <DateRangePicker
        label="已归档周期"
        defaultValue={{ start: parseDate('2026-05-01'), end: parseDate('2026-05-15') }}
        disabled
      />
    </div>
  )
}

function SelectDemo() {
  const [owner, setOwner] = useState<string | null>('chen')
  return (
    <div className="example-stack">
      <Select label="北岸设计负责人" items={people} value={owner} onChange={setOwner} />
      <output className="example-note">
        当前负责人：{people.find((item) => item.id === owner)?.label ?? '未选择'}
      </output>
      <Select label="已锁定的负责人" items={people} defaultValue="lin" disabled />
    </div>
  )
}

function ComboBoxDemo() {
  const [project, setProject] = useState<string | null>('north')
  return (
    <div className="example-stack">
      <ComboBox
        label="关联项目"
        items={projects}
        value={project}
        onChange={setProject}
        placeholder="输入项目名称"
        description="输入“北岸”筛选项目。"
      />
      <output className="example-note">
        关联项目：{projects.find((item) => item.id === project)?.label ?? '未选择'}
      </output>
      <ComboBox label="已锁定的项目" items={projects} defaultValue="north" disabled />
    </div>
  )
}

function AutocompleteDemo() {
  const [person, setPerson] = useState<string | null>('chen')
  return (
    <div className="example-stack">
      <Autocomplete
        label="查找协作成员"
        items={people}
        value={person}
        onChange={setPerson}
        placeholder="输入成员姓名"
        description="方向键浏览，回车选择；搜索框保留焦点。"
      />
      <output className="example-note">
        协作成员：{people.find((item) => item.id === person)?.label ?? '未选择'}
      </output>
      <Autocomplete label="暂停成员搜索" items={people} disabled />
    </div>
  )
}

function ColorAreaDemo() {
  const [color, setColor] = useState(parseColor('#2563eb'))
  return (
    <div className="example-stack">
      <ColorArea label="北岸设计品牌色" value={color} onChange={setColor} />
      <output className="example-note">品牌色：{color.toString('hex')}</output>
      <ColorArea label="已锁定的品牌色" defaultValue="#0f766e" disabled />
    </div>
  )
}

function ColorFieldDemo() {
  const [color, setColor] = useState<ReturnType<typeof parseColor> | null>(parseColor('#2563eb'))
  return (
    <div className="example-stack">
      <ColorField
        label="北岸设计品牌色值"
        value={color}
        onChange={setColor}
        description="输入十六进制颜色值，例如 #2563eb。"
      />
      <output className="example-note">当前颜色：{color?.toString('hex') ?? '未填写'}</output>
      <ColorField label="归档色值" defaultValue="#0f766e" disabled />
    </div>
  )
}

function ColorPickerDemo() {
  const [color, setColor] = useState(parseColor('#2563eb'))
  return (
    <div className="example-stack">
      <ColorPicker label="北岸设计品牌色" value={color} onChange={setColor} swatches={swatches} />
      <output className="example-note">品牌色：{color.toString('hexa')}</output>
      <ColorPicker label="已锁定的品牌色" defaultValue="#0f766e" disabled />
    </div>
  )
}

function ColorSliderDemo() {
  const [color, setColor] = useState(parseColor('hsb(220, 84%, 92%)'))
  return (
    <div className="example-stack">
      <ColorSlider label="北岸设计色相" channel="hue" value={color} onChange={setColor} />
      <ColorSlider label="不透明度" channel="alpha" value={color} onChange={setColor} />
      <output className="example-note">当前颜色：{color.toString('hexa')}</output>
      <ColorSlider
        label="已锁定的饱和度"
        channel="saturation"
        defaultValue="hsb(172, 87%, 46%)"
        disabled
      />
    </div>
  )
}

function ColorSwatchPickerDemo() {
  const [color, setColor] = useState(parseColor('#2563eb'))
  return (
    <div className="example-stack">
      <ColorSwatchPicker
        label="北岸设计项目标记色"
        items={swatches}
        value={color}
        onChange={setColor}
      />
      <output className="example-note">标记色：{color.toString('hex')}</output>
      <ColorSwatchPicker label="已锁定的标记色" items={swatches} defaultValue="#0f766e" disabled />
    </div>
  )
}

const peopleCode = `const people = [
  { id: 'chen', label: '陈予安', icon: <Person /> },
  { id: 'lin', label: '林舒', icon: <Person /> },
  { id: 'guest', label: '访客（暂不可选）', icon: <Person />, disabled: true },
]`

const swatchesCode = `const swatches = [
  { color: '#2563eb', label: '海蓝' },
  { color: '#0f766e', label: '松绿' },
  { color: '#d97706', label: '琥珀' },
  { color: '#be123c', label: '绛红' },
  { color: '#64748b', label: '岩灰（暂不可选）', disabled: true },
]`

export const pickersExamples: ComponentExample[] = [
  {
    name: 'Calendar',
    category: 'Date and time',
    description: '单月日历，支持键盘浏览、日期限制与受控选择。',
    demo: <CalendarDemo />,
    code: `import { useState } from 'react'
import { Calendar, parseDate, type CalendarDate } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [date, setDate] = useState<CalendarDate | null>(parseDate('2026-06-18'))
  return (
    <div className="example-stack">
      <Calendar label="北岸设计评审日期" value={date} onChange={setDate} />
      <output>评审日期：{date?.toString() ?? '未选择'}</output>
    </div>
  )
}`,
  },
  {
    name: 'RangeCalendar',
    category: 'Date and time',
    description: '选择连续日期范围，清晰区分开始、结束和区间。',
    demo: (
      <div className="example-row">
        <RangeCalendar
          label="北岸设计排期"
          defaultValue={{ start: parseDate('2026-06-08'), end: parseDate('2026-06-18') }}
        />
        <RangeCalendar
          label="已归档排期"
          defaultValue={{ start: parseDate('2026-06-01'), end: parseDate('2026-06-05') }}
          disabled
        />
      </div>
    ),
    code: `import { RangeCalendar, parseDate } from '@zixiao-labs/ui-kits-react'

export function Example() {
  return (
    <div className="example-row">
      <RangeCalendar label="北岸设计排期" defaultValue={{
        start: parseDate('2026-06-08'), end: parseDate('2026-06-18'),
      }} />
      <RangeCalendar label="已归档排期" defaultValue={{
        start: parseDate('2026-06-01'), end: parseDate('2026-06-05'),
      }} disabled />
    </div>
  )
}`,
  },
  {
    name: 'DateField',
    category: 'Date and time',
    description: '分段输入年月日，保留本地化格式、键盘编辑和校验语义。',
    demo: <DateFieldDemo />,
    code: `import { useState } from 'react'
import { DateField, parseDate, type CalendarDate } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [date, setDate] = useState<CalendarDate | null>(parseDate('2026-06-18'))
  return (
    <div className="example-stack">
      <DateField label="项目开始日期" value={date} onChange={setDate}
        description="使用方向键调整年月日。" />
      <output>开始日期：{date?.toString() ?? '未填写'}</output>
      <DateField label="归档日期" defaultValue={parseDate('2026-06-30')} disabled />
    </div>
  )
}`,
  },
  {
    name: 'TimeField',
    category: 'Date and time',
    description: '可编辑的时间分段，支持 24 小时制、只读和禁用状态。',
    demo: <TimeFieldDemo />,
    code: `import { useState } from 'react'
import { TimeField, parseTime, type Time } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [time, setTime] = useState<Time | null>(parseTime('09:30'))
  return (
    <div className="example-stack">
      <TimeField label="与林舒的评审时间" value={time} onChange={setTime} hourCycle={24} />
      <output>评审时间：{time?.toString() ?? '未填写'}</output>
      <TimeField label="不可预约时段" defaultValue={parseTime('18:00')} disabled hourCycle={24} />
    </div>
  )
}`,
  },
  {
    name: 'DatePicker',
    category: 'Date and time',
    description: '日期输入与日历浮层组合，浮层继承所在区域的风格和配色。',
    demo: <DatePickerDemo />,
    code: `import { useState } from 'react'
import { DatePicker, parseDate, type CalendarDate } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [date, setDate] = useState<CalendarDate | null>(parseDate('2026-06-18'))
  return (
    <div className="example-stack">
      <DatePicker label="北岸设计交付日期" value={date} onChange={setDate}
        minValue={parseDate('2026-06-01')} />
      <output>交付日期：{date?.toString() ?? '未选择'}</output>
      <DatePicker label="已锁定的交付日期" defaultValue={parseDate('2026-06-30')} disabled />
    </div>
  )
}`,
  },
  {
    name: 'DateRangePicker',
    category: 'Date and time',
    description: '双日期输入与范围日历联动，适用于项目周期和预约。',
    demo: <DateRangePickerDemo />,
    code: `import { useState } from 'react'
import { DateRangePicker, parseDate, type CalendarDate } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [range, setRange] = useState<{ start: CalendarDate; end: CalendarDate } | null>({
    start: parseDate('2026-06-08'), end: parseDate('2026-06-18'),
  })
  return (
    <div className="example-stack">
      <DateRangePicker label="北岸设计迭代周期" value={range} onChange={setRange}
        description="选择开始和结束日期，或直接编辑日期。" />
      <output>迭代周期：{range ? \`\${range.start} 至 \${range.end}\` : '未选择'}</output>
      <DateRangePicker label="已归档周期" defaultValue={{
        start: parseDate('2026-05-01'), end: parseDate('2026-05-15'),
      }} disabled />
    </div>
  )
}`,
  },
  {
    name: 'Select',
    category: 'Pickers',
    description: '统一的数据项结构，支持图标、禁用选项和受控值。',
    demo: <SelectDemo />,
    code: `import { useState } from 'react'
import { Person } from '@gravity-ui/icons'
import { Select } from '@zixiao-labs/ui-kits-react'

${peopleCode}

export function Example() {
  const [owner, setOwner] = useState<string | null>('chen')
  return (
    <div className="example-stack">
      <Select label="北岸设计负责人" items={people} value={owner} onChange={setOwner} />
      <output>当前负责人：{people.find(item => item.id === owner)?.label ?? '未选择'}</output>
      <Select label="已锁定的负责人" items={people} defaultValue="lin" disabled />
    </div>
  )
}`,
  },
  {
    name: 'ComboBox',
    category: 'Pickers',
    description: '输入筛选与下拉选择组合；使用同一套项目数据。',
    demo: <ComboBoxDemo />,
    code: `import { useState } from 'react'
import { Briefcase } from '@gravity-ui/icons'
import { ComboBox } from '@zixiao-labs/ui-kits-react'

const projects = [
  { id: 'north', label: '北岸设计', icon: <Briefcase /> },
  { id: 'brand', label: '北岸品牌手册', icon: <Briefcase /> },
  { id: 'archive', label: '往期归档', icon: <Briefcase />, disabled: true },
]

export function Example() {
  const [project, setProject] = useState<string | null>('north')
  return (
    <div className="example-stack">
      <ComboBox label="关联项目" items={projects} value={project} onChange={setProject}
        placeholder="输入项目名称" description="输入“北岸”筛选项目。" />
      <output>关联项目：{projects.find(item => item.id === project)?.label ?? '未选择'}</output>
      <ComboBox label="已锁定的项目" items={projects} defaultValue="north" disabled />
    </div>
  )
}`,
  },
  {
    name: 'Autocomplete',
    category: 'Pickers',
    description: '内联搜索建议，方向键和回车在输入框内完成结果选择。',
    demo: <AutocompleteDemo />,
    code: `import { useState } from 'react'
import { Person } from '@gravity-ui/icons'
import { Autocomplete } from '@zixiao-labs/ui-kits-react'

${peopleCode}

export function Example() {
  const [person, setPerson] = useState<string | null>('chen')
  return (
    <div className="example-stack">
      <Autocomplete label="查找协作成员" items={people} value={person} onChange={setPerson}
        placeholder="输入成员姓名" description="方向键浏览，回车选择；搜索框保留焦点。" />
      <output>协作成员：{people.find(item => item.id === person)?.label ?? '未选择'}</output>
      <Autocomplete label="暂停成员搜索" items={people} disabled />
    </div>
  )
}`,
  },
  {
    name: 'ColorArea',
    category: 'Colors',
    description: '可独立使用的二维颜色区域，拖动或使用键盘调整饱和度与明度。',
    demo: <ColorAreaDemo />,
    code: `import { useState } from 'react'
import { ColorArea, parseColor } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [color, setColor] = useState(parseColor('#2563eb'))
  return (
    <div className="example-stack">
      <ColorArea label="北岸设计品牌色" value={color} onChange={setColor} />
      <output>品牌色：{color.toString('hex')}</output>
      <ColorArea label="已锁定的品牌色" defaultValue="#0f766e" disabled />
    </div>
  )
}`,
  },
  {
    name: 'ColorField',
    category: 'Colors',
    description: '输入十六进制颜色，支持受控颜色对象和字段校验。',
    demo: <ColorFieldDemo />,
    code: `import { useState } from 'react'
import { ColorField, parseColor, type Color } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [color, setColor] = useState<Color | null>(parseColor('#2563eb'))
  return (
    <div className="example-stack">
      <ColorField label="北岸设计品牌色值" value={color} onChange={setColor}
        description="输入十六进制颜色值，例如 #2563eb。" />
      <output>当前颜色：{color?.toString('hex') ?? '未填写'}</output>
      <ColorField label="归档色值" defaultValue="#0f766e" disabled />
    </div>
  )
}`,
  },
  {
    name: 'ColorPicker',
    category: 'Colors',
    description: '颜色区域、色相、透明度、色值和预设在同一浮层中同步。',
    demo: <ColorPickerDemo />,
    code: `import { useState } from 'react'
import { ColorPicker, parseColor } from '@zixiao-labs/ui-kits-react'

${swatchesCode}

export function Example() {
  const [color, setColor] = useState(parseColor('#2563eb'))
  return (
    <div className="example-stack">
      <ColorPicker label="北岸设计品牌色" value={color} onChange={setColor} swatches={swatches} />
      <output>品牌色：{color.toString('hexa')}</output>
      <ColorPicker label="已锁定的品牌色" defaultValue="#0f766e" disabled />
    </div>
  )
}`,
  },
  {
    name: 'ColorSlider',
    category: 'Colors',
    description: '可独立使用的颜色通道滑杆，支持色相、透明度与其他通道。',
    demo: <ColorSliderDemo />,
    code: `import { useState } from 'react'
import { ColorSlider, parseColor } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [color, setColor] = useState(parseColor('hsb(220, 84%, 92%)'))
  return (
    <div className="example-stack">
      <ColorSlider label="北岸设计色相" channel="hue" value={color} onChange={setColor} />
      <ColorSlider label="不透明度" channel="alpha" value={color} onChange={setColor} />
      <output>当前颜色：{color.toString('hexa')}</output>
      <ColorSlider label="已锁定的饱和度" channel="saturation"
        defaultValue="hsb(172, 87%, 46%)" disabled />
    </div>
  )
}`,
  },
  {
    name: 'ColorSwatch',
    category: 'Colors',
    description: '带可访问颜色名称的只读色块，支持透明色预览。',
    demo: (
      <div className="example-row">
        <ColorSwatch color="#2563eb" label="北岸设计海蓝" />
        <ColorSwatch color="#0f766e" label="北岸设计松绿" />
        <ColorSwatch color="#2563eb80" label="半透明海蓝" />
      </div>
    ),
    code: `import { ColorSwatch } from '@zixiao-labs/ui-kits-react'

export function Example() {
  return (
    <div className="example-row">
      <ColorSwatch color="#2563eb" label="北岸设计海蓝" />
      <ColorSwatch color="#0f766e" label="北岸设计松绿" />
      <ColorSwatch color="#2563eb80" label="半透明海蓝" />
    </div>
  )
}`,
  },
  {
    name: 'ColorSwatchPicker',
    category: 'Colors',
    description: '键盘可操作的颜色预设，支持单项禁用和受控选择。',
    demo: <ColorSwatchPickerDemo />,
    code: `import { useState } from 'react'
import { ColorSwatchPicker, parseColor } from '@zixiao-labs/ui-kits-react'

${swatchesCode}

export function Example() {
  const [color, setColor] = useState(parseColor('#2563eb'))
  return (
    <div className="example-stack">
      <ColorSwatchPicker label="北岸设计项目标记色" items={swatches}
        value={color} onChange={setColor} />
      <output>标记色：{color.toString('hex')}</output>
      <ColorSwatchPicker label="已锁定的标记色" items={swatches} defaultValue="#0f766e" disabled />
    </div>
  )
}`,
  },
]

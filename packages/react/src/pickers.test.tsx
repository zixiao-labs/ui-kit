import { describe, expect, test } from '@lightning-js/lightning'
import { userEvent } from '@lightning-js/lightning/browser'
import { act, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { Fieldset } from './forms'
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
  parseDateTime,
  parseTime,
  parseZonedDateTime,
} from './pickers'

const people = [
  { id: 'chen', label: '陈予安' },
  { id: 'lin', label: '林舒' },
  { id: 'guest', label: '访客', disabled: true },
]

const swatches = [
  { color: '#2563eb', label: '海蓝' },
  { color: '#0f766e', label: '松绿' },
  { color: '#64748b', label: '岩灰', disabled: true },
]

describe('picker public contracts', () => {
  test('disabled fieldsets also disable custom picker interactions', () => {
    const html = renderToStaticMarkup(
      <Fieldset disabled>
        <Select label="负责人" items={people} isDisabled={false} />
        <ColorArea label="色彩" isDisabled={false} />
        <ColorSwatchPicker label="预设" items={swatches} />
        <DateField label="日期" isDisabled={false} />
      </Fieldset>,
    )
    expect(html).toContain('data-disabled="true"')
    expect(html).toContain('disabled=""')
    expect(html).toContain('aria-disabled="true"')
    expect(html).not.toContain('data-disabled="false"')
  })
  test('exports immutable internationalized date and color helpers', () => {
    expect(parseDate('2026-06-18').add({ days: 1 }).toString()).toBe('2026-06-19')
    expect(parseDateTime('2026-06-18T09:30').hour).toBe(9)
    expect(parseTime('09:30').minute).toBe(30)
    expect(parseZonedDateTime('2026-06-18T09:30[Asia/Shanghai]').timeZone).toBe('Asia/Shanghai')
    expect(parseColor('#2563eb').toString('hex')).toBe('#2563EB')
  })

  test('renders localized single-date and range calendar grids', () => {
    const html = renderToStaticMarkup(
      <>
        <Calendar label="评审日期" defaultValue={parseDate('2026-06-18')} />
        <RangeCalendar
          label="项目周期"
          defaultValue={{ start: parseDate('2026-06-08'), end: parseDate('2026-06-18') }}
        />
      </>,
    )
    expect(html).toContain('role="grid"')
    expect(html).toContain('aria-label="评审日期, 2026年6月"')
    expect(html).toContain('aria-label="项目周期, 2026年6月"')
    expect(html).toContain('上个月')
    expect(html).toContain('下个月')
    expect(html).toContain('zx-range-calendar')
    expect(html).toContain('data-selected="true"')
    expect(html).toContain('data-selection-start="true"')
    expect(html).toContain('data-selection-end="true"')
  })

  test('retains calendar limits, disabled and unavailable semantics', () => {
    const html = renderToStaticMarkup(
      <Calendar
        label="受限日期"
        defaultValue={parseDate('2026-06-18')}
        minValue={parseDate('2026-06-10')}
        maxValue={parseDate('2026-06-25')}
        isDateUnavailable={(date) => date.day === 20}
        className="custom"
      />,
    )
    expect(html).toContain('zx-calendar custom')
    expect(html).toContain('data-disabled="true"')
    expect(html).toContain('data-unavailable="true"')
    expect(
      renderToStaticMarkup(
        <RangeCalendar label="归档日期" disabled defaultFocusedValue={parseDate('2026-06-01')} />,
      ),
    ).toContain('data-disabled="true"')
  })

  test('renders labeled date/time segments and forwards form attributes', () => {
    const html = renderToStaticMarkup(
      <>
        <DateField
          label="开始日期"
          name="start"
          defaultValue={parseDate('2026-06-18')}
          description="按方向键编辑"
        />
        <TimeField
          label="评审时间"
          name="meeting"
          defaultValue={parseTime('09:30')}
          hourCycle={24}
        />
      </>,
    )
    expect(html).toContain('开始日期')
    expect(html).toContain('评审时间')
    expect(html).toContain('按方向键编辑')
    expect(html).toContain('role="spinbutton"')
    expect(html).toContain('data-type="year"')
    expect(html).toContain('data-type="hour"')
    expect(html).toContain('name="start"')
    expect(html).toContain('name="meeting"')
    expect(html).toContain('value="2026-06-18"')
  })

  test('respects controlled values, disabled, readonly and invalid fields', () => {
    const html = renderToStaticMarkup(
      <>
        <DateField
          label="截止日期"
          value={parseDate('2026-06-18')}
          onChange={() => {}}
          isInvalid
          errorMessage="请选择工作日"
        />
        <DateField label="归档日期" defaultValue={parseDate('2026-06-18')} disabled />
        <TimeField label="只读时间" defaultValue={parseTime('09:30')} isReadOnly />
      </>,
    )
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('请选择工作日')
    expect(html).toContain('data-disabled="true"')
    expect(html).toContain('aria-readonly="true"')
  })

  test('date pickers provide named calendar triggers without SSR-open portals', () => {
    const html = renderToStaticMarkup(
      <>
        <DatePicker label="交付日期" defaultValue={parseDate('2026-06-18')} />
        <DateRangePicker
          label="迭代周期"
          defaultValue={{ start: parseDate('2026-06-08'), end: parseDate('2026-06-18') }}
        />
        <DatePicker label="归档日期" disabled />
      </>,
    )
    expect(html).toContain('aria-label="打开日历"')
    expect(html).toContain('aria-label="打开日期范围日历"')
    expect(html).toContain('slot="start"')
    expect(html).toContain('slot="end"')
    expect(html).toContain('aria-haspopup="dialog"')
    expect(html).not.toContain('zx-picker-popover')
    expect(html).not.toContain('data-zx-style="clean"')
  })

  test('Select and ComboBox accept the same item and value contracts', () => {
    const html = renderToStaticMarkup(
      <>
        <Select label="负责人" items={people} defaultValue="chen" />
        <ComboBox label="协作成员" items={people} value="lin" onChange={() => {}} />
      </>,
    )
    expect(html).toContain('负责人')
    expect(html).toContain('陈予安')
    expect(html).toContain('协作成员')
    expect(html).toContain('value="林舒"')
    expect(html).toContain('role="combobox"')
  })

  test('Select and ComboBox forward validation, disabled and descriptions', () => {
    const html = renderToStaticMarkup(
      <>
        <Select label="负责人" items={people} disabled description="项目已归档" />
        <ComboBox label="协作成员" items={people} isInvalid errorMessage="请选择成员" />
      </>,
    )
    expect(html).toContain('disabled=""')
    expect(html).toContain('项目已归档')
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('请选择成员')
  })

  test('Autocomplete renders an accessible inline search and named suggestion list', () => {
    const html = renderToStaticMarkup(
      <Autocomplete
        label="查找成员"
        items={people}
        defaultValue="chen"
        defaultInputValue=""
        description="输入姓名"
      />,
    )
    expect(html).toContain('查找成员')
    expect(html).toContain('aria-label="查找成员结果"')
    expect(html).toContain('role="listbox"')
    expect(html).toContain('role="option"')
    expect(html).toContain('aria-selected="true"')
    expect(html).toContain('aria-disabled="true"')
    expect(html).toContain('输入姓名')
    expect(
      renderToStaticMarkup(<Autocomplete label="查找成员" items={people} disabled />),
    ).toContain('disabled=""')
  })

  test('ColorArea and ColorSlider work without a ColorPicker provider', () => {
    const html = renderToStaticMarkup(
      <>
        <ColorArea label="品牌色" defaultValue="#2563eb" />
        <ColorSlider label="色相" channel="hue" defaultValue="#2563eb" />
        <ColorSlider label="透明度" channel="alpha" defaultValue="#2563eb80" />
      </>,
    )
    expect(html).toContain('zx-color-area')
    expect(html).toContain('linear-gradient')
    expect(html).toContain('type="range"')
    expect(html).toContain('色相')
    expect(html).toContain('透明度')
    expect(html).toContain('aria-valuetext=')
  })

  test('standalone color controls supply localized accessible names by default', () => {
    const html = renderToStaticMarkup(
      <>
        <ColorArea />
        <ColorSlider />
        <ColorField />
      </>,
    )
    expect(html).toContain('颜色区域')
    expect(html).toContain('颜色值')
    expect(html).toContain('type="range"')
  })

  test('color fields and sliders preserve validation, custom channels and disabled state', () => {
    const html = renderToStaticMarkup(
      <>
        <ColorArea label="禁用颜色" defaultValue="#2563eb" disabled />
        <ColorSlider
          label="红色通道"
          channel="red"
          colorSpace="rgb"
          defaultValue="#2563eb"
          disabled
        />
        <ColorField
          label="色值"
          value={parseColor('#2563eb')}
          onChange={() => {}}
          isInvalid
          errorMessage="请检查品牌色"
        />
      </>,
    )
    expect(html).toContain('data-disabled="true"')
    expect(html).toContain('disabled=""')
    expect(html).toContain('value="#2563EB"')
    expect(html).toContain('请检查品牌色')
  })

  test('ColorSwatch renders an accessible read-only preview', () => {
    const html = renderToStaticMarkup(<ColorSwatch color="#2563eb80" label="半透明海蓝" />)
    expect(html).toContain('role="img"')
    expect(html).toContain('半透明海蓝')
    expect(html).toContain('background-color:')
    expect(html).not.toContain('tabindex=')
  })

  test('ColorSwatchPicker exposes named, selected and disabled presets', () => {
    const html = renderToStaticMarkup(
      <ColorSwatchPicker label="品牌预设" items={swatches} defaultValue="#2563eb" />,
    )
    expect(html).toContain('aria-label="品牌预设"')
    expect(html).toContain('aria-label="海蓝"')
    expect(html).toContain('aria-selected="true"')
    expect(html).toContain('aria-disabled="true"')
    const disabled = renderToStaticMarkup(<ColorSwatchPicker items={swatches} disabled />)
    expect(disabled.match(/aria-disabled="true"/g)?.length).toBe(3)
  })

  test('ColorPicker renders a named preview trigger and supports disabled', () => {
    const html = renderToStaticMarkup(
      <>
        <ColorPicker label="品牌色" defaultValue="#2563eb" swatches={swatches} />
        <ColorPicker label="归档色" value="#0f766e" onChange={() => {}} disabled />
      </>,
    )
    expect(html).toContain('品牌色')
    expect(html).toContain('#2563EBFF')
    expect(html).toContain('aria-haspopup="dialog"')
    expect(html).toContain('disabled=""')
    expect(html).not.toContain('data-zx-style="clean"')
  })
})

// The same Lightning file runs in Node for SSR and in Lightning's real browser
// mode for RAC event/state integration. No substitute DOM or focus implementation.
if (typeof document !== 'undefined') {
  describe('picker browser integration', () => {
    async function mount(children: ReactNode) {
      const host = document.createElement('div')
      host.dataset.zxStyle = 'soft'
      host.dataset.zxColorMode = 'dark'
      host.style.setProperty('--zx-accent', 'rgb(17, 34, 51)')
      document.body.append(host)
      const root = createRoot(host)
      await act(async () => root.render(children))
      return {
        host,
        async close() {
          await act(async () => root.unmount())
          host.remove()
        },
      }
    }

    async function press(element: HTMLElement, key: string) {
      await act(async () => {
        await userEvent.focus(element)
        await userEvent.keyboard(element, key)
      })
    }

    test('date segments use RAC keyboard editing and controlled callbacks', async () => {
      let result = ''
      const app = await mount(
        <DateField
          label="开始日期"
          defaultValue={parseDate('2026-06-18')}
          onChange={(date) => {
            result = date?.toString() ?? ''
          }}
        />,
      )
      try {
        await press(app.host.querySelector<HTMLElement>('[data-type="day"]')!, 'ArrowUp')
        expect(result).toBe('2026-06-19')
      } finally {
        await app.close()
      }
    })

    test('standalone color controls use RAC keyboard state and disabled semantics', async () => {
      let result = ''
      const app = await mount(
        <>
          <ColorSlider
            label="色相"
            defaultValue="hsb(220, 84%, 92%)"
            onChange={(color) => {
              result = color.toString('hsb')
            }}
          />
          <ColorSlider label="禁用色相" defaultValue="hsb(220, 84%, 92%)" disabled />
        </>,
      )
      try {
        const inputs = app.host.querySelectorAll<HTMLInputElement>('input[type="range"]')
        await press(inputs[0], 'ArrowRight')
        expect(result).toContain('221')
        expect(inputs[1].disabled).toBe(true)
      } finally {
        await app.close()
      }
    })

    test('selection popover inherits nearest theme and closes through RAC', async () => {
      let result: string | null = null
      const app = await mount(
        <Select
          label="负责人"
          items={people}
          defaultValue="chen"
          onChange={(value) => {
            result = value
          }}
        />,
      )
      try {
        const button = app.host.querySelector<HTMLButtonElement>('button')!
        await act(async () => userEvent.click(button))
        const list = document.querySelector<HTMLElement>('.zx-picker-popover')!
        expect(Boolean(list)).toBe(true)
        expect(list.closest('[data-zx-style]')?.getAttribute('data-zx-style')).toBe('soft')
        expect(list.closest('[data-zx-color-mode]')?.getAttribute('data-zx-color-mode')).toBe(
          'dark',
        )
        expect(getComputedStyle(list).getPropertyValue('--zx-accent').trim()).toBe(
          'rgb(17, 34, 51)',
        )
        await act(async () => {
          const options = list.querySelectorAll<HTMLElement>('[role="option"]')
          await userEvent.click(options[1])
        })
        expect(result).toBe('lin')
        expect(document.querySelector('.zx-picker-popover')).toBe(null)
      } finally {
        await app.close()
      }
    })
  })
}

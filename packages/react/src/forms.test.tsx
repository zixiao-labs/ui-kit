import { describe, expect, test } from '@lightning-js/lightning'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  Checkbox,
  CheckboxGroup,
  Description,
  ErrorMessage,
  FieldError,
  Fieldset,
  Form,
  Input,
  InputGroup,
  InputOTP,
  Label,
  NumberField,
  Radio,
  RadioGroup,
  SearchField,
  Slider,
  Switch,
  TextArea,
  TextField,
} from './forms'
import { Button } from './button'
import { useFieldsetDisabled } from './fieldset-context'

function FieldsetState({ isDisabled }: { isDisabled?: boolean }) {
  const disabled = useFieldsetDisabled(isDisabled)
  return <output>{disabled === undefined ? 'unset' : String(disabled)}</output>
}

const inputTags = (html: string) => html.match(/<(?:input|textarea|button)\b[^>]*>/g) ?? []

describe('Form and control public contracts', () => {
  test('TextField supplies a labeled input, description and uncontrolled value', () => {
    const html = renderToStaticMarkup(
      <TextField
        label="项目名称"
        name="project"
        description="仅用于本页示例"
        defaultValue="北岸设计"
        placeholder="填写名称"
        className="custom"
      />,
    )
    expect(html).toContain('class="zx-field custom"')
    expect(html).toContain('<label')
    expect(html).toContain('项目名称')
    expect(html).toContain('name="project"')
    expect(html).toContain('value="北岸设计"')
    expect(html).toContain('aria-describedby=')
    expect(html).toContain('填写名称')
    expect(html).not.toContain('zx-error-message')
  })

  test('controlled, disabled and invalid fields preserve RAC semantics', () => {
    const html = renderToStaticMarkup(
      <TextField
        label="负责人"
        value="陈予安"
        onChange={() => {}}
        isDisabled
        isInvalid
        errorMessage="请重新选择负责人"
      />,
    )
    expect(html).toContain('value="陈予安"')
    expect(html).toContain('disabled=""')
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('data-invalid="true"')
    expect(html).toContain('请重新选择负责人')
    expect(html).toContain('zx-error-message')
  })

  test('compound fields replace the automatic control without duplicating inputs', () => {
    const html = renderToStaticMarkup(
      <TextField defaultValue="陈予安与林舒共同整理" isReadOnly>
        <Label>项目说明</Label>
        <TextArea rows={6} />
        <Description>保留换行</Description>
      </TextField>,
    )
    expect(html).toContain('<textarea')
    expect(html).toContain('rows="6"')
    expect(html).toContain('readOnly=""')
    expect(html).toContain('陈予安与林舒共同整理')
    expect(html).not.toContain('<input')
  })

  test('Input and InputGroup combine classes, adornments and neutral appearance props', () => {
    const html = renderToStaticMarkup(
      <InputGroup
        aria-label="项目地址"
        startContent="北岸 /"
        endContent=".design"
        variant="tonal"
        size="lg"
      >
        <Input aria-label="短名称" className="custom" htmlSize={12} defaultValue="north" />
      </InputGroup>,
    )
    expect(html).toContain('zx-input-group')
    expect(html).toContain('北岸 /')
    expect(html).toContain('.design')
    expect(html).toContain('data-variant="tonal"')
    expect(html).toContain('data-size="lg"')
    expect(html).toContain('class="zx-input custom"')
    expect(html).toContain('size="12"')
  })

  test('checkboxes expose selected, mixed and disabled states', () => {
    const selected = renderToStaticMarkup(<Checkbox defaultSelected>交互稿</Checkbox>)
    const mixed = renderToStaticMarkup(
      <Checkbox isIndeterminate isDisabled>
        部分成员
      </Checkbox>,
    )
    expect(selected).toContain('type="checkbox"')
    expect(selected).toContain('checked=""')
    expect(selected).toContain('data-selected="true"')
    expect(selected).toContain('zx-checkbox__box')
    expect(mixed).toContain('data-indeterminate="true"')
    expect(mixed).toContain('disabled=""')
    expect(mixed).toContain('aria-hidden="true"')
  })

  test('CheckboxGroup submits named values and associates validation feedback', () => {
    const html = renderToStaticMarkup(
      <CheckboxGroup
        label="协作成员"
        name="members"
        defaultValue={['chen']}
        orientation="horizontal"
        isInvalid
        errorMessage="至少选择两名成员"
      >
        <Checkbox value="chen">陈予安</Checkbox>
        <Checkbox value="lin">林舒</Checkbox>
      </CheckboxGroup>,
    )
    expect(html).toContain('role="group"')
    expect(html).toContain('data-orientation="horizontal"')
    expect(html).toContain('name="members"')
    expect(html).toContain('value="chen"')
    expect(html).toContain('至少选择两名成员')
    expect(html).toContain('aria-describedby=')
  })

  test('Switch uses a native checkable control with switch semantics', () => {
    const html = renderToStaticMarkup(
      <Switch isSelected onChange={() => {}} name="reminders">
        评审提醒
      </Switch>,
    )
    expect(html).toContain('role="switch"')
    expect(html).toContain('checked=""')
    expect(html).toContain('name="reminders"')
    expect(html).toContain('zx-switch__track')
    expect(html).toContain('评审提醒')
  })

  test('RadioGroup associates named options and controlled selection', () => {
    const html = renderToStaticMarkup(
      <RadioGroup label="评审方式" name="review" value="async" onChange={() => {}}>
        <Radio value="live">现场讨论</Radio>
        <Radio value="async">异步批注</Radio>
        <Radio value="archived" isDisabled>
          已归档
        </Radio>
      </RadioGroup>,
    )
    expect(html).toContain('role="radiogroup"')
    expect(html).toContain('type="radio"')
    expect(html).toContain('name="review"')
    expect(html).toContain('value="async"')
    expect(html).toContain('checked=""')
    expect(html).toContain('zx-radio__circle')
    expect(html).toContain('disabled=""')
  })

  test('Slider renders keyboard-operable native range inputs and output', () => {
    const html = renderToStaticMarkup(
      <Slider
        label="评审区间"
        defaultValue={[20, 80]}
        minValue={0}
        maxValue={100}
        thumbLabels={['起点', '终点']}
      />,
    )
    expect(html).toContain('type="range"')
    expect(html).toContain('value="20"')
    expect(html).toContain('value="80"')
    expect(html).toContain('aria-label="起点"')
    expect(html).toContain('aria-label="终点"')
    expect(html).toContain('<output')
    expect(html).toContain('zx-slider__fill')
  })

  test('SearchField supplies search semantics and an accessible clear button', () => {
    const html = renderToStaticMarkup(
      <SearchField label="搜索项目" defaultValue="北岸" clearLabel="清空项目搜索" />,
    )
    expect(html).toContain('type="search"')
    expect(html).toContain('value="北岸"')
    expect(html).toContain('aria-label="清空项目搜索"')
    expect(html).toContain('zx-search-field__clear')
    expect(html).toContain('type="button"')
  })

  test('NumberField supplies bounds, formatted input and named stepper buttons', () => {
    const html = renderToStaticMarkup(
      <NumberField label="评审人数" defaultValue={4} minValue={1} maxValue={12} name="count" />,
    )
    expect(html).toContain('value="4"')
    expect(html).toContain('aria-label="增加"')
    expect(html).toContain('aria-label="减少"')
    expect(html).toContain('zx-number-field')
    expect(html).toContain('name="count"')
  })

  test('OTP has one accessible text input, digit cells and normalized initial values', () => {
    const html = renderToStaticMarkup(
      <InputOTP label="六位协作码" name="code" defaultValue="0a12-345678" description="支持粘贴" />,
    )
    expect(html).toContain('value="012345"')
    expect(html).toContain('inputMode="numeric"')
    expect(html).toContain('autoComplete="one-time-code"')
    expect(html).toContain('pattern="[0-9]{6}"')
    expect(html).toContain('name="code"')
    expect(html.match(/<input /g)?.length).toBe(1)
    expect(html.match(/class="zx-otp__slot"/g)?.length).toBe(6)
    // No HTML maxlength: paste must filter letters/separators before truncating digits.
    expect(html).not.toContain('maxLength=')
  })

  test('OTP supports controlled values, disabled/error state and safe length bounds', () => {
    const html = renderToStaticMarkup(
      <InputOTP
        label="协作码"
        value="00x123456789"
        onChange={() => {}}
        length={99}
        isDisabled
        isInvalid
        errorMessage="请检查协作码"
      />,
    )
    expect(html).toContain('value="00123456"')
    expect(html).toContain('pattern="[0-9]{8}"')
    expect(html).toContain('disabled=""')
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('请检查协作码')
  })

  test('Form/Fieldset preserve native form and submit button contracts', () => {
    const html = renderToStaticMarkup(
      <Form aria-label="项目表单" validationBehavior="aria">
        <Fieldset legend="北岸设计" disabled>
          <TextField label="项目名称" name="project" isRequired />
          <Button type="submit">检查填写内容</Button>
        </Fieldset>
      </Form>,
    )
    expect(html).toContain('<form')
    expect(html).toContain('class="zx-form"')
    expect(html).toContain('<fieldset')
    expect(html).toContain('<legend')
    expect(html).toContain('aria-required="true"')
    expect(html).toContain('type="submit"')
    expect(html).toContain('disabled=""')
  })

  test('Description/ErrorMessage/FieldError support explicit composed associations', () => {
    const html = renderToStaticMarkup(
      <TextField isInvalid aria-label="负责人">
        <Input />
        <Description>选择一名协作成员</Description>
        <FieldError>{() => '请选择陈予安或林舒'}</FieldError>
      </TextField>,
    )
    const message = renderToStaticMarkup(<ErrorMessage id="problem">请检查填写内容</ErrorMessage>)
    expect(html).toContain('请选择陈予安或林舒')
    expect(html).toContain('选择一名协作成员')
    expect(html).toContain('aria-describedby=')
    expect(message).toContain('id="problem"')
    expect(message).toContain('zx-error-message')
    expect(message).toContain('请检查填写内容')
  })

  test('RAC state render functions retain the built-in styling and structure', () => {
    const html = renderToStaticMarkup(
      <Checkbox defaultSelected className={({ isSelected }) => (isSelected ? 'chosen' : 'idle')}>
        {({ isSelected }) => (isSelected ? '已选择' : '未选择')}
      </Checkbox>,
    )
    expect(html).toContain('class="zx-choice zx-checkbox chosen"')
    expect(html).toContain('zx-checkbox__box')
    expect(html).toContain('已选择')
  })
})

describe('Fieldset disabled state reaches RAC behavior', () => {
  test.each([
    ['Checkbox', () => <Checkbox isDisabled={false}>陈予安</Checkbox>],
    [
      'CheckboxGroup',
      () => (
        <CheckboxGroup label="成员" isDisabled={false}>
          <Checkbox value="chen" isDisabled={false}>
            陈予安
          </Checkbox>
          <Checkbox value="lin">林舒</Checkbox>
        </CheckboxGroup>
      ),
    ],
    ['Switch', () => <Switch isDisabled={false}>显示批注</Switch>],
    [
      'RadioGroup and Radio',
      () => (
        <RadioGroup label="负责人" defaultValue="chen" isDisabled={false}>
          <Radio value="chen" isDisabled={false}>
            陈予安
          </Radio>
          <Radio value="lin" isDisabled={false}>
            林舒
          </Radio>
        </RadioGroup>
      ),
    ],
    ['Slider', () => <Slider label="预览比例" defaultValue={40} isDisabled={false} />],
    ['TextField', () => <TextField label="项目名称" defaultValue="北岸设计" isDisabled={false} />],
    ['Input', () => <Input aria-label="项目名称" disabled={false} />],
    [
      'InputGroup',
      () => (
        <InputGroup aria-label="项目名称" isDisabled={false}>
          <Input aria-label="项目名称" disabled={false} />
        </InputGroup>
      ),
    ],
    ['TextArea', () => <TextArea aria-label="项目说明" disabled={false} />],
    ['SearchField', () => <SearchField label="搜索项目" defaultValue="北岸" isDisabled={false} />],
    ['NumberField', () => <NumberField label="评审人数" defaultValue={4} isDisabled={false} />],
    ['InputOTP', () => <InputOTP label="协作码" defaultValue="024681" isDisabled={false} />],
  ] satisfies [string, () => ReactNode][])(
    '%s cannot override an ancestor disabled fieldset with false',
    (_name, control) => {
      const html = renderToStaticMarkup(<Fieldset disabled>{control()}</Fieldset>)
      const controls = inputTags(html)
      expect(controls.length).toBeGreaterThan(0)
      for (const tag of controls) expect(tag).toContain('disabled=""')
      // RAC render state drives label/track/stepper press handlers, not native
      // :disabled alone. This marker must be present before any client hydration.
      expect(html).toContain('data-disabled="true"')
    },
  )

  test('the shared helper preserves undefined and explicit false outside disabled ancestors', () => {
    const html = renderToStaticMarkup(
      <Fieldset disabled={false}>
        <FieldsetState />
        <FieldsetState isDisabled={false} />
        <FieldsetState isDisabled />
      </Fieldset>,
    )
    expect(html).toContain('<output>unset</output>')
    expect(html).toContain('<output>false</output>')
    expect(html).toContain('<output>true</output>')
  })

  test('ordinary RAC disabled field/group contexts are not replaced by a false default', () => {
    const html = renderToStaticMarkup(
      <>
        <CheckboxGroup label="成员" isDisabled>
          <Checkbox value="chen">陈予安</Checkbox>
        </CheckboxGroup>
        <RadioGroup label="负责人" isDisabled>
          <Radio value="lin">林舒</Radio>
        </RadioGroup>
        <TextField label="项目名称" isDisabled>
          <Input />
        </TextField>
        <TextField label="项目说明" isDisabled>
          <TextArea />
        </TextField>
      </>,
    )
    expect(inputTags(html).length).toBe(4)
    for (const tag of inputTags(html)) expect(tag).toContain('disabled=""')
  })

  test('generated first-legend controls stay enabled while the fieldset body is disabled', () => {
    const html = renderToStaticMarkup(
      <Fieldset disabled legend={<Checkbox isDisabled={false}>编辑本组设置</Checkbox>}>
        <Checkbox isDisabled={false}>包含交互稿</Checkbox>
        <Slider label="预览比例" defaultValue={40}>
          {({ isDisabled }) => <span>{isDisabled ? '轨道已禁用' : '轨道可操作'}</span>}
        </Slider>
        <InputGroup aria-label="项目名称">
          {({ isDisabled }) => <span>{isDisabled ? '分组已禁用' : '分组可操作'}</span>}
        </InputGroup>
      </Fieldset>,
    )
    const [legendInput, bodyInput] = inputTags(html)
    expect(legendInput).not.toContain('disabled=""')
    expect(bodyInput).toContain('disabled=""')
    expect(html).toContain('轨道已禁用')
    expect(html).toContain('分组已禁用')
  })

  test('an enabled nested fieldset and its legend cannot escape a disabled outer body', () => {
    const html = renderToStaticMarkup(
      <Fieldset disabled legend="北岸设计">
        <Fieldset disabled={false} legend={<Checkbox isDisabled={false}>内组设置</Checkbox>}>
          <Checkbox isDisabled={false}>包含交互稿</Checkbox>
          <FieldsetState isDisabled={false} />
        </Fieldset>
      </Fieldset>,
    )
    expect(inputTags(html).length).toBe(2)
    for (const tag of inputTags(html)) expect(tag).toContain('disabled=""')
    expect(html).toContain('<output>true</output>')
  })

  test('nested disabled scopes retain their legend exception and do not leak to siblings', () => {
    const html = renderToStaticMarkup(
      <>
        <Fieldset legend="北岸设计">
          <Fieldset disabled legend={<Switch>内组设置</Switch>}>
            <Switch>内组批注</Switch>
          </Fieldset>
          <Checkbox>外组稿件</Checkbox>
        </Fieldset>
        <Checkbox>组外稿件</Checkbox>
      </>,
    )
    const [innerLegend, innerBody, outerBody, sibling] = inputTags(html)
    expect(innerLegend).not.toContain('disabled=""')
    expect(innerBody).toContain('disabled=""')
    expect(outerBody).not.toContain('disabled=""')
    expect(sibling).not.toContain('disabled=""')
  })
})

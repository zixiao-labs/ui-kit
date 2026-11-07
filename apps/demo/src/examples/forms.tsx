import { useState } from 'react'
import { Envelope, Lock, Person } from '@gravity-ui/icons'
import {
  Button,
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
} from '@zixiao-labs/ui-kits-react'
import type { ComponentExample } from '../catalog-types'

function CheckboxDemo() {
  const [selected, setSelected] = useState(true)
  return (
    <div className="example-stack">
      <Checkbox isSelected={selected} onChange={setSelected}>
        包含交互说明
      </Checkbox>
      <div className="example-row">
        <Checkbox>包含组件标注</Checkbox>
        <Checkbox isIndeterminate>部分稿件已整理</Checkbox>
        <Checkbox isDisabled defaultSelected>
          已归档稿件
        </Checkbox>
      </div>
      <p className="example-note">受控选项：{selected ? '包含交互说明' : '暂不包含交互说明'}</p>
    </div>
  )
}

function CheckboxGroupDemo() {
  const [members, setMembers] = useState(['chen'])
  return (
    <div className="example-stack">
      <CheckboxGroup
        label="北岸设计 · 协作成员"
        value={members}
        onChange={setMembers}
        description="可选择多名成员。"
      >
        <Checkbox value="chen">陈予安</Checkbox>
        <Checkbox value="lin">林舒</Checkbox>
        <Checkbox value="archive" isDisabled>
          归档成员
        </Checkbox>
      </CheckboxGroup>
      <CheckboxGroup
        label="稿件范围"
        isInvalid
        errorMessage="请至少选择一项稿件。"
        orientation="horizontal"
      >
        <Checkbox value="web">网页</Checkbox>
        <Checkbox value="mobile">移动端</Checkbox>
      </CheckboxGroup>
      <p className="example-note">已选 {members.length} 名成员，仅影响本页示例。</p>
    </div>
  )
}

function SwitchDemo() {
  const [enabled, setEnabled] = useState(true)
  return (
    <div className="example-stack">
      <Switch isSelected={enabled} onChange={setEnabled}>
        显示评审批注
      </Switch>
      <div className="example-row">
        <Switch>紧凑预览</Switch>
        <Switch isDisabled>归档后不可编辑</Switch>
        <Switch isDisabled defaultSelected>
          保留版本说明
        </Switch>
      </div>
      <p className="example-note">批注显示{enabled ? '已开启' : '已关闭'}，不发送通知。</p>
    </div>
  )
}

function RadioGroupDemo() {
  const [mode, setMode] = useState('async')
  return (
    <div className="example-stack">
      <RadioGroup
        label="北岸设计 · 评审方式"
        value={mode}
        onChange={setMode}
        description="每次选择一种方式。"
      >
        <Radio value="async">异步批注</Radio>
        <Radio value="live">现场讨论</Radio>
        <Radio value="archive" isDisabled>
          归档复盘
        </Radio>
      </RadioGroup>
      <RadioGroup
        label="发布范围"
        orientation="horizontal"
        isInvalid
        errorMessage="请选择一个范围。"
      >
        <Radio value="team">项目成员</Radio>
        <Radio value="self">仅自己</Radio>
      </RadioGroup>
      <p className="example-note">当前方式：{mode === 'async' ? '异步批注' : '现场讨论'}</p>
    </div>
  )
}

function SliderDemo() {
  const [zoom, setZoom] = useState(60)
  return (
    <div className="example-stack">
      <Slider
        label="稿件预览比例"
        value={zoom}
        onChange={setZoom}
        minValue={20}
        maxValue={100}
        step={5}
        description="使用方向键微调，Home / End 跳至边界。"
      />
      <Slider
        label="评审页码区间"
        defaultValue={[2, 8]}
        minValue={1}
        maxValue={12}
        thumbLabels={['起始页', '结束页']}
      />
      <Slider label="归档预览比例" defaultValue={40} isDisabled />
    </div>
  )
}

function TextFieldDemo() {
  const [name, setName] = useState('北岸设计')
  return (
    <div className="example-stack">
      <TextField
        label="项目名称"
        value={name}
        onChange={setName}
        description="受控值会在下方同步显示。"
        startContent={<Person aria-hidden="true" width={20} height={20} />}
      />
      <TextField label="协作邮箱" type="email" variant="tonal" placeholder="name@example.com" />
      <TextField label="负责人" defaultValue="陈予安" isDisabled />
      <TextField
        label="项目简称"
        defaultValue="北岸设计 · 春季视觉整理"
        isInvalid
        errorMessage="简称请控制在八个字以内。"
      />
      <p className="example-note">当前名称：{name || '尚未填写'}</p>
    </div>
  )
}

function InputGroupDemo() {
  const [visible, setVisible] = useState(false)
  return (
    <div className="example-stack">
      <TextField label="协作邮箱">
        <InputGroup
          startContent={<Envelope aria-hidden="true" width={20} height={20} />}
          endContent="@example.com"
        >
          <Input placeholder="chen" />
        </InputGroup>
      </TextField>
      <TextField
        label="本地示例口令"
        type={visible ? 'text' : 'password'}
        defaultValue="north-coast"
      >
        <InputGroup startContent={<Lock aria-hidden="true" width={20} height={20} />}>
          <Input />
          <Button
            variant="ghost"
            aria-label={visible ? '隐藏示例口令' : '显示示例口令'}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            {visible ? '隐藏' : '显示'}
          </Button>
        </InputGroup>
      </TextField>
      <p className="example-note">装饰图标对读屏隐藏；交互按钮保留独立名称。</p>
    </div>
  )
}

function SearchFieldDemo() {
  const [query, setQuery] = useState('北岸')
  const [submitted, setSubmitted] = useState('')
  return (
    <div className="example-stack">
      <SearchField
        label="搜索项目"
        value={query}
        onChange={setQuery}
        onSubmit={setSubmitted}
        placeholder="输入项目名称"
        description="回车仅回显关键词，不访问后端。"
      />
      <SearchField label="搜索成员" variant="tonal" placeholder="陈予安、林舒" />
      <SearchField label="归档项目搜索" defaultValue="北岸设计" isDisabled />
      <output className="example-note">
        {submitted ? `本页搜索词：${submitted}` : '可输入、回车，或使用清除按钮。'}
      </output>
    </div>
  )
}

function NumberFieldDemo() {
  const [count, setCount] = useState(4)
  return (
    <div className="example-stack">
      <NumberField
        label="评审人数"
        value={count}
        onChange={setCount}
        minValue={1}
        maxValue={12}
        step={1}
        description="一至十二人，支持键盘与加减按钮。"
      />
      <NumberField
        label="稿件缩放"
        defaultValue={0.75}
        minValue={0.25}
        maxValue={2}
        step={0.25}
        formatOptions={{ style: 'percent' }}
        variant="tonal"
      />
      <NumberField label="归档页数" defaultValue={12} isDisabled />
      <NumberField
        label="计划页数"
        defaultValue={0}
        isInvalid
        errorMessage="请填写大于零的页数。"
      />
    </div>
  )
}

function OTPDemo() {
  const [code, setCode] = useState('')
  const [complete, setComplete] = useState(false)
  return (
    <div className="example-stack">
      <InputOTP
        label="六位协作码"
        value={code}
        onChange={(next) => {
          setCode(next)
          setComplete(false)
        }}
        onComplete={() => setComplete(true)}
        description="试着粘贴 02a4-681：仅保留前六位数字。支持退格、方向键、选区替换。"
      />
      <output className="example-note">
        {complete ? '已填满六位，可继续编辑；本页不验证协作码。' : `已填写 ${code.length} / 6 位。`}
      </output>
      <InputOTP
        label="格式错误示例"
        defaultValue="024"
        isInvalid
        errorMessage="请填写完整的六位数字。"
      />
      <InputOTP label="只读归档码" defaultValue="024681" isDisabled />
    </div>
  )
}

function FormDemo() {
  const [result, setResult] = useState('')
  return (
    <Form
      className="example-stack"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        setResult(`「${data.get('project')}」已通过本页校验，未发送任何数据。`)
      }}
      onReset={() => setResult('已重置本页内容。')}
    >
      <TextField
        label="项目名称"
        name="project"
        isRequired
        minLength={2}
        errorMessage="请填写至少两个字的项目名称。"
        placeholder="北岸设计"
      />
      <TextField
        label="负责人邮箱"
        name="email"
        type="email"
        isRequired
        errorMessage="请输入有效的邮箱地址。"
        placeholder="chen@example.com"
      />
      <Checkbox name="confirm" isRequired>
        我已检查示例内容
      </Checkbox>
      <div className="example-row">
        <Button type="submit">检查填写内容</Button>
        <Button type="reset" variant="outline">
          重置
        </Button>
      </div>
      <output className="example-note">
        {result || '空白提交可查看必填提示；只做浏览器端演示。'}
      </output>
    </Form>
  )
}

function FieldErrorDemo() {
  const [name, setName] = useState('')
  return (
    <div className="example-stack">
      <TextField label="负责人" value={name} onChange={setName} isInvalid={!name.trim()}>
        <Input placeholder="陈予安或林舒" />
        <Description>填入内容后，下方错误提示会消失。</Description>
        <FieldError>请填写一名负责人。</FieldError>
      </TextField>
      <Form onSubmit={(event) => event.preventDefault()}>
        <TextField label="项目名称" name="project" isRequired>
          <Input placeholder="北岸设计" />
          <FieldError>
            {({ validationDetails }) =>
              validationDetails.valueMissing ? '项目名称不能为空。' : '请检查项目名称。'
            }
          </FieldError>
        </TextField>
        <Button type="submit" variant="outline">
          查看必填提示
        </Button>
      </Form>
    </div>
  )
}

function FieldsetDemo() {
  const [changes, setChanges] = useState(0)
  const changed = () => setChanges((value) => value + 1)
  return (
    <div className="example-stack">
      <Fieldset legend="北岸设计 · 项目信息">
        <TextField label="项目名称" defaultValue="北岸设计" />
        <TextField label="负责人" defaultValue="陈予安" />
      </Fieldset>
      <Fieldset legend="归档设置" disabled>
        <TextField label="协作成员" defaultValue="林舒" />
        <Checkbox defaultSelected onChange={changed}>
          保留评审记录
        </Checkbox>
        <Switch defaultSelected onChange={changed}>
          保留版本说明
        </Switch>
        <RadioGroup label="归档范围" defaultValue="all" onChange={changed}>
          <Radio value="all">全部文件</Radio>
          <Radio value="selected">选中文件</Radio>
        </RadioGroup>
        <Slider label="归档预览比例" defaultValue={40} onChange={changed} />
        <NumberField label="保留版本数" defaultValue={4} onChange={changed} />
      </Fieldset>
      <output className="example-note">归档设置修改次数：{changes}</output>
    </div>
  )
}

/**
 * All fields use RAC's isDisabled/isInvalid/isRequired and value callbacks.
 * TextField/SearchField/NumberField accept label/description/errorMessage and
 * create their control automatically; children replace the control and default
 * error slot. Supply FieldError for compound validation, or errorMessage on the root.
 * Input/TextArea remain composable primitives, not independent labeled fields.
 */
export const formsExamples: ComponentExample[] = [
  {
    name: 'Checkbox',
    category: 'Controls',
    description: '单项选择、受控值、部分选择与禁用状态；整行提供至少 44px 的点击区域。',
    demo: <CheckboxDemo />,
    code: `import { useState } from 'react'
import { Checkbox } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [selected, setSelected] = useState(true)
  return (
    <div className="example-stack">
      <Checkbox isSelected={selected} onChange={setSelected}>包含交互说明</Checkbox>
      <Checkbox isIndeterminate>部分稿件已整理</Checkbox>
      <Checkbox isDisabled defaultSelected>已归档稿件</Checkbox>
    </div>
  )
}`,
  },
  {
    name: 'CheckboxGroup',
    category: 'Controls',
    description: '命名的多选分组，支持数组值、横向布局、说明与校验信息。',
    demo: <CheckboxGroupDemo />,
    code: `import { useState } from 'react'
import { Checkbox, CheckboxGroup } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [members, setMembers] = useState(['chen'])
  return (
    <CheckboxGroup
      label="北岸设计 · 协作成员"
      name="members"
      value={members}
      onChange={setMembers}
      description="可选择多名成员。"
    >
      <Checkbox value="chen">陈予安</Checkbox>
      <Checkbox value="lin">林舒</Checkbox>
      <Checkbox value="archive" isDisabled>归档成员</Checkbox>
    </CheckboxGroup>
  )
}`,
  },
  {
    name: 'Switch',
    category: 'Controls',
    description: '即时切换本页设置；支持受控、未选中、已选中与禁用状态。',
    demo: <SwitchDemo />,
    code: `import { useState } from 'react'
import { Switch } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [enabled, setEnabled] = useState(true)
  return (
    <div className="example-stack">
      <Switch isSelected={enabled} onChange={setEnabled}>显示评审批注</Switch>
      <Switch>紧凑预览</Switch>
      <Switch isDisabled defaultSelected>保留版本说明</Switch>
    </div>
  )
}`,
  },
  {
    name: 'RadioGroup',
    category: 'Controls',
    description: '互斥选项共用一个值，提供键盘方向键导航与组级校验。',
    demo: <RadioGroupDemo />,
    code: `import { useState } from 'react'
import { Radio, RadioGroup } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [mode, setMode] = useState('async')
  return (
    <RadioGroup label="北岸设计 · 评审方式" value={mode} onChange={setMode}>
      <Radio value="async">异步批注</Radio>
      <Radio value="live">现场讨论</Radio>
      <Radio value="archive" isDisabled>归档复盘</Radio>
    </RadioGroup>
  )
}`,
  },
  {
    name: 'Radio',
    category: 'Controls',
    description: '必须放在 RadioGroup 内；选中、未选中与禁用选项共享分组语义。',
    demo: (
      <RadioGroup label="稿件负责人" defaultValue="chen" orientation="horizontal">
        <Radio value="chen">陈予安</Radio>
        <Radio value="lin">林舒</Radio>
        <Radio value="archive" isDisabled>
          归档成员
        </Radio>
      </RadioGroup>
    ),
    code: `import { Radio, RadioGroup } from '@zixiao-labs/ui-kits-react'

export function Example() {
  return (
    <RadioGroup label="稿件负责人" defaultValue="chen" orientation="horizontal">
      <Radio value="chen">陈予安</Radio>
      <Radio value="lin">林舒</Radio>
      <Radio value="archive" isDisabled>归档成员</Radio>
    </RadioGroup>
  )
}`,
  },
  {
    name: 'Slider',
    category: 'Controls',
    description: '单值或数组范围，支持步长、值展示、格式化、禁用与键盘调节。',
    demo: <SliderDemo />,
    code: `import { useState } from 'react'
import { Slider } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [zoom, setZoom] = useState(60)
  return (
    <div className="example-stack">
      <Slider label="稿件预览比例" value={zoom} onChange={setZoom} minValue={20} maxValue={100} step={5} />
      <Slider label="评审页码区间" defaultValue={[2, 8]} minValue={1} maxValue={12} thumbLabels={['起始页', '结束页']} />
      <Slider label="归档预览比例" defaultValue={40} isDisabled />
    </div>
  )
}`,
  },
  {
    name: 'TextField',
    category: 'Forms',
    description: '开箱即用的标签、输入框与反馈；onChange 接收字符串，支持 outline / tonal。',
    demo: <TextFieldDemo />,
    code: `import { useState } from 'react'
import { Person } from '@gravity-ui/icons'
import { TextField } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [name, setName] = useState('北岸设计')
  return (
    <div className="example-stack">
      <TextField label="项目名称" value={name} onChange={setName} startContent={<Person aria-hidden="true" width={20} height={20} />} />
      <TextField label="协作邮箱" type="email" variant="tonal" placeholder="name@example.com" />
      <TextField label="负责人" defaultValue="陈予安" isDisabled />
      <TextField label="项目简称" isInvalid errorMessage="请检查项目简称。" />
    </div>
  )
}`,
  },
  {
    name: 'Input',
    category: 'Forms',
    description: '带样式的 RAC 输入原语；单独使用时需 aria-label，或通过 Label 的 htmlFor 关联。',
    demo: (
      <div className="example-stack">
        <div className="example-stack">
          <Label htmlFor="forms-project-input">项目名称</Label>
          <Input id="forms-project-input" defaultValue="北岸设计" />
        </div>
        <Input aria-label="协作成员" placeholder="陈予安或林舒" variant="tonal" size="lg" />
        <Input aria-label="归档项目名称" defaultValue="北岸设计" disabled />
      </div>
    ),
    code: `import { Input, Label } from '@zixiao-labs/ui-kits-react'

export function Example() {
  return (
    <div className="example-stack">
      <Label htmlFor="project-input">项目名称</Label>
      <Input id="project-input" defaultValue="北岸设计" />
      <Input aria-label="协作成员" placeholder="陈予安或林舒" variant="tonal" size="lg" />
      <Input aria-label="归档项目名称" defaultValue="北岸设计" disabled />
    </div>
  )
}`,
  },
  {
    name: 'InputGroup',
    category: 'Forms',
    description: '组合前后缀、Gravity 图标及交互按钮；输入状态与焦点统一呈现。',
    demo: <InputGroupDemo />,
    code: `import { useState } from 'react'
import { Lock } from '@gravity-ui/icons'
import { Button, Input, InputGroup, TextField } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [visible, setVisible] = useState(false)
  return (
    <TextField label="本地示例口令" type={visible ? 'text' : 'password'} defaultValue="north-coast">
      <InputGroup startContent={<Lock aria-hidden="true" width={20} height={20} />}>
        <Input />
        <Button variant="ghost" aria-label={visible ? '隐藏示例口令' : '显示示例口令'} aria-pressed={visible} onClick={() => setVisible(!visible)}>
          {visible ? '隐藏' : '显示'}
        </Button>
      </InputGroup>
    </TextField>
  )
}`,
  },
  {
    name: 'TextArea',
    category: 'Forms',
    description: '多行输入原语；在 TextField 内继承值、标签、描述与校验，可纵向调整高度。',
    demo: (
      <div className="example-stack">
        <TextField
          label="项目说明"
          defaultValue="北岸设计：由陈予安与林舒共同整理本轮视觉稿。"
          description="支持换行和纵向调整高度。"
        >
          <TextArea rows={4} />
        </TextField>
        <TextField label="归档备注" defaultValue="本轮稿件已整理" isReadOnly>
          <TextArea rows={3} variant="tonal" />
        </TextField>
        <TextField label="修改原因" isInvalid errorMessage="请填写修改原因。">
          <TextArea rows={3} placeholder="简要说明调整内容" />
        </TextField>
      </div>
    ),
    code: `import { TextArea, TextField } from '@zixiao-labs/ui-kits-react'

export function Example() {
  return (
    <div className="example-stack">
      <TextField label="项目说明" defaultValue="北岸设计：由陈予安与林舒共同整理本轮视觉稿。">
        <TextArea rows={4} />
      </TextField>
      <TextField label="归档备注" defaultValue="本轮稿件已整理" isReadOnly>
        <TextArea rows={3} variant="tonal" />
      </TextField>
    </div>
  )
}`,
  },
  {
    name: 'SearchField',
    category: 'Forms',
    description: '自带搜索图标与可访问的清除按钮，支持回车提交关键词和受控搜索值。',
    demo: <SearchFieldDemo />,
    code: `import { useState } from 'react'
import { SearchField } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [query, setQuery] = useState('北岸')
  const [submitted, setSubmitted] = useState('')
  return (
    <div className="example-stack">
      <SearchField label="搜索项目" value={query} onChange={setQuery} onSubmit={setSubmitted} placeholder="输入项目名称" />
      <SearchField label="搜索成员" variant="tonal" placeholder="陈予安、林舒" />
      <output>{submitted ? '本页搜索词：' + submitted : '回车回显关键词，不访问后端。'}</output>
    </div>
  )
}`,
  },
  {
    name: 'NumberField',
    category: 'Forms',
    description: '数字输入与加减按钮，支持边界、步长及 Intl 格式；onChange 接收数字。',
    demo: <NumberFieldDemo />,
    code: `import { useState } from 'react'
import { NumberField } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [count, setCount] = useState(4)
  return (
    <div className="example-stack">
      <NumberField label="评审人数" value={count} onChange={setCount} minValue={1} maxValue={12} step={1} />
      <NumberField label="稿件缩放" defaultValue={0.75} minValue={0.25} maxValue={2} step={0.25} formatOptions={{ style: 'percent' }} variant="tonal" />
      <NumberField label="归档页数" defaultValue={12} isDisabled />
    </div>
  )
}`,
  },
  {
    name: 'InputOTP',
    category: 'Forms',
    description:
      '一个真实输入框与分格外观：保留原生粘贴、选区、退格及自动填充；仅接受 ASCII 数字。',
    demo: <OTPDemo />,
    code: `import { useState } from 'react'
import { InputOTP } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [code, setCode] = useState('')
  const [complete, setComplete] = useState(false)
  return (
    <div className="example-stack">
      <InputOTP
        label="六位协作码"
        length={6}
        value={code}
        onChange={(next) => { setCode(next); setComplete(false) }}
        onComplete={() => setComplete(true)}
        description="试着粘贴 02a4-681；支持退格、方向键和选区替换。"
      />
      <output>{complete ? '已填满六位，本页不验证协作码。' : '已填写 ' + code.length + ' / 6 位。'}</output>
      <InputOTP label="格式错误示例" defaultValue="024" isInvalid errorMessage="请填写完整的六位数字。" />
      <InputOTP label="只读归档码" defaultValue="024681" isDisabled />
    </div>
  )
}`,
  },
  {
    name: 'Form',
    category: 'Forms',
    description: 'RAC 表单协调原生校验与字段错误；原有 Button 继续使用原生 type / onClick API。',
    demo: <FormDemo />,
    code: `import { useState } from 'react'
import { Button, Form, TextField } from '@zixiao-labs/ui-kits-react'

export function Example() {
  const [result, setResult] = useState('')
  return (
    <Form onSubmit={(event) => {
      event.preventDefault()
      const data = new FormData(event.currentTarget)
      setResult('「' + data.get('project') + '」已通过本页校验，未发送任何数据。')
    }}>
      <TextField label="项目名称" name="project" isRequired minLength={2} errorMessage="请填写至少两个字的项目名称。" placeholder="北岸设计" />
      <TextField label="负责人邮箱" name="email" type="email" isRequired errorMessage="请输入有效的邮箱地址。" placeholder="chen@example.com" />
      <Button type="submit">检查填写内容</Button>
      <output>{result}</output>
    </Form>
  )
}`,
  },
  {
    name: 'Fieldset',
    category: 'Forms',
    description: '原生分组语义，disabled 同时禁用原生控件与组合控件的交互',
    demo: <FieldsetDemo />,
    code: `import { Checkbox, Fieldset, TextField } from '@zixiao-labs/ui-kits-react'

export function Example() {
  return (
    <div className="example-stack">
      <Fieldset legend="北岸设计 · 项目信息">
        <TextField label="项目名称" defaultValue="北岸设计" />
        <TextField label="负责人" defaultValue="陈予安" />
      </Fieldset>
      <Fieldset legend="归档设置" disabled>
        <TextField label="协作成员" defaultValue="林舒" />
        <Checkbox defaultSelected>保留评审记录</Checkbox>
      </Fieldset>
    </div>
  )
}`,
  },
  {
    name: 'Label',
    category: 'Forms',
    description: '字段内自动关联标签，独立使用时通过 htmlFor 关联输入；不以占位符代替名称。',
    demo: (
      <div className="example-stack">
        <TextField defaultValue="北岸设计">
          <Label>项目名称</Label>
          <Input />
        </TextField>
        <div className="example-stack">
          <Label htmlFor="forms-owner-input">
            负责人 <span aria-hidden="true">（必填）</span>
          </Label>
          <Input id="forms-owner-input" placeholder="陈予安或林舒" required />
        </div>
      </div>
    ),
    code: `import { Input, Label, TextField } from '@zixiao-labs/ui-kits-react'

export function Example() {
  return (
    <TextField defaultValue="北岸设计">
      <Label>项目名称</Label>
      <Input />
    </TextField>
  )
}`,
  },
  {
    name: 'Description',
    category: 'Forms',
    description: '通过 description 槽位自动关联的辅助说明，与错误消息保持不同层级。',
    demo: (
      <div className="example-stack">
        <TextField label="项目名称" defaultValue="北岸设计">
          <Input />
          <Description>建议使用团队熟悉的项目名称，便于陈予安与林舒查找。</Description>
        </TextField>
        <TextField label="协作说明">
          <TextArea rows={3} placeholder="补充本轮设计范围" />
          <Description>可留空；这里只展示文字，不会发送给成员。</Description>
        </TextField>
      </div>
    ),
    code: `import { Description, Input, TextField } from '@zixiao-labs/ui-kits-react'

export function Example() {
  return (
    <TextField label="项目名称" defaultValue="北岸设计">
      <Input />
      <Description>建议使用团队熟悉的项目名称，便于陈予安与林舒查找。</Description>
    </TextField>
  )
}`,
  },
  {
    name: 'ErrorMessage',
    category: 'Forms',
    description: '始终可见的语义错误消息；字段内自动关联，独立使用时显式设置 aria-describedby。',
    demo: (
      <div className="example-stack">
        <TextField label="项目简称" defaultValue="北岸设计 · 春季视觉整理" isInvalid>
          <Input />
          <ErrorMessage>简称过长，请保留八个字以内。</ErrorMessage>
        </TextField>
        <div className="example-stack">
          <Label htmlFor="forms-code-error">协作码</Label>
          <Input
            id="forms-code-error"
            defaultValue="024"
            aria-invalid="true"
            aria-describedby="forms-code-message"
          />
          <ErrorMessage id="forms-code-message">请填写完整的六位数字。</ErrorMessage>
        </div>
      </div>
    ),
    code: `import { ErrorMessage, Input, TextField } from '@zixiao-labs/ui-kits-react'

export function Example() {
  return (
    <TextField label="项目简称" defaultValue="北岸设计 · 春季视觉整理" isInvalid>
      <Input />
      <ErrorMessage>简称过长，请保留八个字以内。</ErrorMessage>
    </TextField>
  )
}`,
  },
  {
    name: 'FieldError',
    category: 'Forms',
    description: '仅在 RAC 字段无效时显示；可按 validationDetails 自定义必填与格式提示。',
    demo: <FieldErrorDemo />,
    code: `import { Button, Description, FieldError, Form, Input, TextField } from '@zixiao-labs/ui-kits-react'

export function Example() {
  return (
    <Form onSubmit={(event) => event.preventDefault()}>
      <TextField label="项目名称" name="project" isRequired>
        <Input placeholder="北岸设计" />
        <Description>空白提交可查看必填提示。</Description>
        <FieldError>
          {({ validationDetails }) => validationDetails.valueMissing ? '项目名称不能为空。' : '请检查项目名称。'}
        </FieldError>
      </TextField>
      <Button type="submit">查看必填提示</Button>
    </Form>
  )
}`,
  },
]

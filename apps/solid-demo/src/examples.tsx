import { createSignal, For } from 'solid-js'
import type { Component, JSX } from 'solid-js'
import {
  Accordion,
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Card,
  Cell,
  Checkbox,
  Chip,
  CloseButton,
  Column,
  ComboBox,
  Description,
  Disclosure,
  Drawer,
  Dropdown,
  ErrorMessage,
  FieldError,
  Fieldset,
  Form,
  Input,
  InputGroup,
  InputOTP,
  Kbd,
  Label,
  Link,
  ListBox,
  Meter,
  Modal,
  NumberField,
  Pagination,
  Popover,
  ProgressBar,
  ProgressCircle,
  Radio,
  RadioGroup,
  ScrollShadow,
  SearchField,
  Select,
  Separator,
  Sheet,
  Skeleton,
  Slider,
  Spinner,
  Surface,
  Switch,
  Table,
  TableBody,
  TableHeader,
  Tabs,
  TagGroup,
  TextArea,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupItem,
  Toolbar,
  Tooltip,
  Typography,
  Row,
  useToast,
} from '@zixiao-labs/ui-kits-solid'
import { PatternBackground } from '@zixiao-labs/ui-kits-solid/patterns'

export interface Example {
  name: string
  category: string
  description: string
  render: Component
  code: string
}
const options = [
  { id: 'design', label: '设计系统' },
  { id: 'website', label: '品牌网站' },
  { id: 'archive', label: '项目归档', disabled: true },
]
const optionsCode = `const options = [
  { id: 'design', label: '设计系统' },
  { id: 'website', label: '品牌网站' },
  { id: 'archive', label: '项目归档', disabled: true },
]`

export function ButtonExample() {
  const [size, setSize] = createSignal<'sm' | 'md' | 'lg'>('md')
  const [loading, setLoading] = createSignal(false)
  const [disabled, setDisabled] = createSignal(false)
  const [count, setCount] = createSignal(0)
  return (
    <div class="button-example">
      <div class="specimen-buttons">
        <Button
          size={size()}
          loading={loading()}
          disabled={disabled()}
          onClick={() => setCount(count() + 1)}
        >
          创建项目
        </Button>
        <Button variant="tonal" size={size()} disabled={disabled()}>
          保存草稿
        </Button>
        <Button variant="outline" size={size()} disabled={disabled()}>
          查看详情
        </Button>
        <Button variant="ghost" size={size()} disabled={disabled()}>
          取消操作
        </Button>
      </div>
      <div class="specimen-options">
        <Select
          class="compact-select"
          label="尺寸"
          options={[
            { id: 'sm', label: 'Small' },
            { id: 'md', label: 'Medium' },
            { id: 'lg', label: 'Large' },
          ]}
          value={size()}
          onChange={(value) => {
            if (value === 'sm' || value === 'md' || value === 'lg') setSize(value)
          }}
        />
        <Switch checked={loading()} onChange={setLoading}>
          加载中
        </Switch>
        <Checkbox checked={disabled()} onChange={setDisabled}>
          禁用
        </Checkbox>
        <output class="specimen-count">已创建 {count()} 次</output>
      </div>
    </div>
  )
}
function FormExample() {
  const [message, setMessage] = createSignal('仅在当前页面演示，不会提交到服务器')
  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        setMessage(`已读取本地表单：${String(data.get('project'))}`)
      }}
    >
      <TextField label="项目名称" name="project" required defaultValue="鹤坡设计系统" />
      <Checkbox name="notify" value="yes" defaultChecked>
        接收更新通知
      </Checkbox>
      <Button type="submit">检查表单</Button>
      <output class="zx-description">{message()}</output>
    </Form>
  )
}
function ToastExample() {
  const publish = useToast()
  return (
    <Button
      onClick={() =>
        publish({ title: '预览已更新', description: '这是本地演示通知，没有保存到服务器' })
      }
    >
      显示通知
    </Button>
  )
}
function TagExample() {
  const [items, setItems] = createSignal(
    options.slice(0, 2).map((item) => ({ id: item.id, label: item.label })),
  )
  return (
    <div class="example-stack">
      <TagGroup
        label="项目标签"
        items={items()}
        onRemove={(id) => setItems(items().filter((item) => item.id !== id))}
      />
      <Button variant="ghost" onClick={() => setItems(options.slice(0, 2))}>
        重置标签
      </Button>
    </div>
  )
}
function SelectionExample(props: { combo?: boolean; list?: boolean }) {
  const [value, setValue] = createSignal<string | null>('design')
  const control = (): JSX.Element =>
    props.combo ? (
      <ComboBox label="搜索项目" options={options} value={value()} onChange={setValue} />
    ) : props.list ? (
      <ListBox
        label="项目列表"
        options={options}
        value={value() ? [value()!] : []}
        onChange={(ids) => setValue(ids[0] ?? null)}
      />
    ) : (
      <Select label="项目类型" options={options} value={value()} onChange={setValue} />
    )
  return (
    <div class="example-stack">
      {control()}
      <output class="zx-description">当前值：{value() ?? '未选择'}</output>
    </div>
  )
}
function OTPExample() {
  const [value, setValue] = createSignal('')
  return (
    <div class="example-stack">
      <InputOTP
        label="验证码"
        value={value()}
        onChange={setValue}
        description="输入或粘贴六位数字"
      />
      <output class="zx-description">当前值：{value() || '等待输入'}</output>
    </div>
  )
}
function NestedExample() {
  return (
    <Card data-zx-style="endfield" data-zx-color-mode="dark">
      <Badge>局部作用域 · Endfield dark</Badge>
      <Typography variant="title">独立的项目设置</Typography>
      <Switch defaultChecked>保留本地草稿</Switch>
      <Modal
        trigger="打开局部弹窗"
        title="项目设置"
        description="浮层继续使用触发器的 Endfield 深色主题"
      >
        <Select label="工作区" options={options} defaultValue="design" />
      </Modal>
    </Card>
  )
}
const simple = (
  name: string,
  category: string,
  description: string,
  render: Component,
  code: string,
): Example => ({
  name,
  category,
  description,
  render,
  code,
})
export const examples: Example[] = [
  simple(
    'Button',
    '按钮',
    '四种操作层级，同一套尺寸、加载与禁用状态',
    ButtonExample,
    `import { createSignal } from 'solid-js'
import { Button } from '@zixiao-labs/ui-kits-solid'

export function Example() {
  const [count, setCount] = createSignal(0)
  return (
    <Button onClick={() => setCount(count() + 1)}>
      创建项目 · {count()}
    </Button>
  )
}`,
  ),
  simple(
    'ButtonGroup',
    '按钮',
    '用原生 fieldset 组合一组相关操作',
    () => (
      <ButtonGroup aria-label="项目操作">
        <Button>创建项目</Button>
        <Button variant="outline">导入项目</Button>
      </ButtonGroup>
    ),
    `import { Button, ButtonGroup } from '@zixiao-labs/ui-kits-solid'

export const Example = () => (
  <ButtonGroup aria-label="项目操作">
    <Button>创建项目</Button>
    <Button variant="outline">导入项目</Button>
  </ButtonGroup>
)`,
  ),
  simple(
    'ToggleButton',
    '按钮',
    '可切换的按压状态，支持键盘操作',
    () => <ToggleButton defaultPressed>收藏项目</ToggleButton>,
    `import { ToggleButton } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <ToggleButton defaultPressed>收藏项目</ToggleButton>`,
  ),
  simple(
    'ToggleButtonGroup',
    '按钮',
    '选项之间共享单选状态与方向键导航',
    () => (
      <ToggleButtonGroup defaultValue="list" aria-label="视图">
        <ToggleButtonGroupItem value="list">列表</ToggleButtonGroupItem>
        <ToggleButtonGroupItem value="grid">网格</ToggleButtonGroupItem>
      </ToggleButtonGroup>
    ),
    `import { ToggleButtonGroup, ToggleButtonGroupItem } from '@zixiao-labs/ui-kits-solid'
export const Example = () => (
  <ToggleButtonGroup defaultValue="list" aria-label="视图">
    <ToggleButtonGroupItem value="list">列表</ToggleButtonGroupItem>
    <ToggleButtonGroupItem value="grid">网格</ToggleButtonGroupItem>
  </ToggleButtonGroup>
)`,
  ),
  simple(
    'CloseButton',
    '按钮',
    '具有可访问名称的图标关闭按钮',
    () => <CloseButton aria-label="关闭预览" />,
    `import { CloseButton } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <CloseButton aria-label="关闭预览" />`,
  ),
  simple(
    'TextField',
    '表单',
    '自动关联标签、描述与错误信息的文本输入',
    () => <TextField label="项目名称" description="用于工作区内展示" defaultValue="鹤坡设计系统" />,
    `import { TextField } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <TextField label="项目名称" description="用于工作区内展示" defaultValue="鹤坡设计系统" />`,
  ),
  simple(
    'Input',
    '表单',
    '保留原生 input 属性与 Solid 的 onInput 事件',
    () => (
      <div class="example-stack">
        <Label for="project-input">项目代号</Label>
        <Input id="project-input" placeholder="例如 hepo-web" />
      </div>
    ),
    `import { Input, Label } from '@zixiao-labs/ui-kits-solid'
export const Example = () => (
  <div>
    <Label for="project-code">项目代号</Label>
    <Input id="project-code" placeholder="例如 hepo-web" />
  </div>
)`,
  ),
  simple(
    'TextArea',
    '表单',
    '多行输入，原生选择、换行与尺寸调整',
    () => (
      <div class="example-stack">
        <Label for="project-description">项目说明</Label>
        <TextArea id="project-description" placeholder="记录设计目标与使用场景" />
      </div>
    ),
    `import { TextField } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <TextField label="项目说明" multiline placeholder="记录设计目标与使用场景" />`,
  ),
  simple(
    'InputGroup',
    '表单',
    '前后缀与原生输入组合，不改变表单语义',
    () => (
      <div class="example-stack">
        <Label for="site-url">站点地址</Label>
        <InputGroup startContent="https://" endContent=".design">
          <Input id="site-url" value="hepo" />
        </InputGroup>
      </div>
    ),
    `import { Input, InputGroup, Label } from '@zixiao-labs/ui-kits-solid'
export const Example = () => (
  <div>
    <Label for="site-url">站点地址</Label>
    <InputGroup startContent="https://" endContent=".design">
      <Input id="site-url" value="hepo" />
    </InputGroup>
  </div>
)`,
  ),
  simple(
    'SearchField',
    '表单',
    '带清除操作的受控或非受控搜索输入',
    () => <SearchField label="搜索项目" defaultValue="鹤坡" />,
    `import { SearchField } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <SearchField label="搜索项目" defaultValue="鹤坡" />`,
  ),
  simple(
    'NumberField',
    '表单',
    '数值边界、递增递减与键盘调整',
    () => <NumberField label="成员数量" defaultValue={4} minValue={1} maxValue={20} />,
    `import { NumberField } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <NumberField label="成员数量" defaultValue={4} minValue={1} maxValue={20} />`,
  ),
  simple(
    'InputOTP',
    '表单',
    '一个真实输入框，保留数字粘贴与原生光标',
    OTPExample,
    `import { createSignal } from 'solid-js'
import { InputOTP } from '@zixiao-labs/ui-kits-solid'
export function Example() {
  const [code, setCode] = createSignal('')
  return <InputOTP label="验证码" value={code()} onChange={setCode} />
}`,
  ),
  simple(
    'Checkbox',
    '表单',
    '勾选、未勾选与半选，支持原生表单提交',
    () => (
      <div class="example-stack">
        <Checkbox defaultChecked>接收项目更新</Checkbox>
        <Checkbox indeterminate>部分项目已选择</Checkbox>
        <Checkbox disabled>只读归档</Checkbox>
      </div>
    ),
    `import { Checkbox } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <Checkbox name="updates" value="yes" defaultChecked>接收项目更新</Checkbox>`,
  ),
  simple(
    'RadioGroup',
    '表单',
    '共享名称与选择状态，方向键在选项间移动',
    () => (
      <RadioGroup label="访问权限" defaultValue="team">
        <Radio value="private">仅自己</Radio>
        <Radio value="team">团队成员</Radio>
        <Radio value="public">公开访问</Radio>
      </RadioGroup>
    ),
    `import { Radio, RadioGroup } from '@zixiao-labs/ui-kits-solid'
export const Example = () => (
  <RadioGroup label="访问权限" defaultValue="team" name="access">
    <Radio value="private">仅自己</Radio>
    <Radio value="team">团队成员</Radio>
    <Radio value="public">公开访问</Radio>
  </RadioGroup>
)`,
  ),
  simple(
    'Switch',
    '表单',
    '由 Kobalte 管理语义的二态开关',
    () => <Switch defaultChecked>保留本地草稿</Switch>,
    `import { Switch } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <Switch defaultChecked>保留本地草稿</Switch>`,
  ),
  simple(
    'Slider',
    '表单',
    '原生单滑块，保留键盘步进与数值反馈',
    () => {
      const [value, setValue] = createSignal(36)
      return <Slider label="预览比例" min={0} max={100} value={value()} onChange={setValue} />
    },
    `import { createSignal } from 'solid-js'
import { Slider } from '@zixiao-labs/ui-kits-solid'
export function Example() {
  const [value, setValue] = createSignal(36)
  return <Slider label="预览比例" min={0} max={100} value={value()} onChange={setValue} />
}`,
  ),
  simple(
    'Form',
    '表单',
    '原生验证与 FormData，本地处理提交结果',
    FormExample,
    `import { Button, Form, TextField } from '@zixiao-labs/ui-kits-solid'
export const Example = () => (
  <Form onSubmit={(event) => {
    event.preventDefault()
    console.log(new FormData(event.currentTarget).get('project'))
  }}>
    <TextField label="项目名称" name="project" required />
    <Button type="submit">检查表单</Button>
  </Form>
)`,
  ),
  simple(
    'Fieldset',
    '表单',
    '原生禁用级联与 legend 分组',
    () => (
      <Fieldset legend="归档设置" disabled>
        <TextField label="项目名称" defaultValue="归档项目" />
        <Checkbox defaultChecked>锁定编辑</Checkbox>
      </Fieldset>
    ),
    `import { Checkbox, Fieldset, TextField } from '@zixiao-labs/ui-kits-solid'
export const Example = () => (
  <Fieldset legend="归档设置" disabled>
    <TextField label="项目名称" defaultValue="归档项目" />
    <Checkbox defaultChecked>锁定编辑</Checkbox>
  </Fieldset>
)`,
  ),
  simple(
    'FieldFeedback',
    '表单',
    'Label、Description、ErrorMessage 与显式 FieldError',
    () => (
      <div class="example-stack">
        <Label for="invalid-input">项目代号</Label>
        <Input
          id="invalid-input"
          aria-invalid="true"
          aria-describedby="invalid-help invalid-error"
        />
        <Description id="invalid-help">使用小写字母与连字符</Description>
        <ErrorMessage id="invalid-error">项目代号不能为空</ErrorMessage>
        <FieldError invalid>可根据验证状态显示错误</FieldError>
      </div>
    ),
    `import { TextField } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <TextField label="项目代号" validationState="invalid" errorMessage="项目代号不能为空" />`,
  ),
  simple(
    'Select',
    '选择器',
    '键盘选择、禁用选项和原生隐藏 select',
    () => <SelectionExample />,
    `import { Select } from '@zixiao-labs/ui-kits-solid'
${optionsCode}
export const Example = () => <Select label="项目类型" options={options} defaultValue="design" />`,
  ),
  simple(
    'ComboBox',
    '选择器',
    '键入筛选与方向键选择，不引入 React 运行时',
    () => <SelectionExample combo />,
    `import { ComboBox } from '@zixiao-labs/ui-kits-solid'
${optionsCode}
export const Example = () => <ComboBox label="搜索项目" options={options} />`,
  ),
  simple(
    'ListBox',
    '选择器',
    '直接展示可选择集合，支持单选与多选',
    () => <SelectionExample list />,
    `import { ListBox } from '@zixiao-labs/ui-kits-solid'
${optionsCode}
export const Example = () => <ListBox label="项目列表" options={options} defaultValue={['design']} />`,
  ),
  simple(
    'TagGroup',
    '选择器',
    '带有明确移除操作的标签集合',
    TagExample,
    `import { createSignal } from 'solid-js'
import { TagGroup } from '@zixiao-labs/ui-kits-solid'
export function Example() {
  const [items, setItems] = createSignal([{ id: 'design', label: '设计系统' }])
  return <TagGroup label="项目标签" items={items()} onRemove={(id) => setItems(items().filter((item) => item.id !== id))} />
}`,
  ),
  simple(
    'Card',
    '展示',
    '共享中性表面、边界与排版契约',
    () => (
      <Card>
        <Badge tone="accent">设计系统</Badge>
        <Typography variant="title">鹤坡 · 组件规范</Typography>
        <Description>整理组件、主题与交互，让每次交付有据可依</Description>
        <Button variant="outline">查看规范</Button>
      </Card>
    ),
    `import { Button, Card, Typography } from '@zixiao-labs/ui-kits-solid'
export const Example = () => (
  <Card>
    <Typography variant="title">鹤坡 · 组件规范</Typography>
    <Button variant="outline">查看规范</Button>
  </Card>
)`,
  ),
  simple(
    'Surface',
    '展示',
    'Flat、Tonal 与 Outline 三种表面表达',
    () => (
      <div class="surface-samples">
        <For each={['flat', 'tonal', 'outline'] as const}>
          {(variant) => <Surface variant={variant}>{variant}</Surface>}
        </For>
      </div>
    ),
    `import { Surface } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <Surface variant="tonal">次级内容区域</Surface>`,
  ),
  simple(
    'Badge',
    '展示',
    '中性、强调与错误三种语义色彩',
    () => (
      <div class="example-row">
        <Badge>草稿</Badge>
        <Badge tone="accent">评审中</Badge>
        <Badge tone="error">需要修改</Badge>
      </div>
    ),
    `import { Badge } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <Badge tone="accent">评审中</Badge>`,
  ),
  simple(
    'Chip',
    '展示',
    '可移除标签，关闭按钮保留可访问名称',
    () => {
      const [visible, setVisible] = createSignal(true)
      return (
        <div class="example-row">
          {visible() ? (
            <Chip onRemove={() => setVisible(false)}>设计规范</Chip>
          ) : (
            <Button variant="ghost" onClick={() => setVisible(true)}>
              恢复标签
            </Button>
          )}
        </div>
      )
    },
    `import { createSignal, Show } from 'solid-js'
import { Chip } from '@zixiao-labs/ui-kits-solid'
export function Example() {
  const [visible, setVisible] = createSignal(true)
  return <Show when={visible()}><Chip onRemove={() => setVisible(false)}>设计规范</Chip></Show>
}`,
  ),
  simple(
    'Avatar',
    '展示',
    '头像与文字回退，图片失败时显示姓名缩写',
    () => (
      <AvatarGroup aria-label="项目成员">
        <Avatar name="林 青" />
        <Avatar name="周 宁" />
        <Avatar name="陈 安" />
      </AvatarGroup>
    ),
    `import { Avatar, AvatarGroup } from '@zixiao-labs/ui-kits-solid'
export const Example = () => (
  <AvatarGroup aria-label="项目成员">
    <Avatar name="林 青" /><Avatar name="周 宁" />
  </AvatarGroup>
)`,
  ),
  simple(
    'Table',
    '展示',
    '原生语义表格，不伪装为可编辑数据网格',
    () => (
      <Table aria-label="项目清单">
        <TableHeader>
          <Row>
            <Column>项目</Column>
            <Column>负责人</Column>
            <Column>状态</Column>
          </Row>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>鹤坡设计系统</Cell>
            <Cell>林青</Cell>
            <Cell>
              <Badge tone="accent">评审中</Badge>
            </Cell>
          </Row>
          <Row>
            <Cell>品牌网站</Cell>
            <Cell>周宁</Cell>
            <Cell>
              <Badge>草稿</Badge>
            </Cell>
          </Row>
        </TableBody>
      </Table>
    ),
    `import { Table, TableHeader, TableBody, Row, Column, Cell } from '@zixiao-labs/ui-kits-solid'
export const Example = () => (
  <Table aria-label="项目清单">
    <TableHeader><Row><Column>项目</Column><Column>负责人</Column></Row></TableHeader>
    <TableBody><Row><Cell>鹤坡设计系统</Cell><Cell>林青</Cell></Row></TableBody>
  </Table>
)`,
  ),
  simple(
    'Alert',
    '反馈',
    '以状态或警告语义传达结果，不依赖颜色',
    () => (
      <Alert title="当前为本地预览" tone="accent">
        你可以操作所有示例，但不会向服务器提交数据
      </Alert>
    ),
    `import { Alert } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <Alert title="当前为本地预览" tone="accent">不会向服务器提交数据</Alert>`,
  ),
  simple(
    'Progress',
    '反馈',
    '线形与圆形进度，支持范围与不确定状态',
    () => (
      <div class="example-stack">
        <ProgressBar label="组件整理进度" value={68} />
        <ProgressCircle label="评审进度" value={42} />
        <Meter label="存储使用量" value={24} />
      </div>
    ),
    `import { ProgressBar, ProgressCircle, Meter } from '@zixiao-labs/ui-kits-solid'
export const Example = () => (
  <div>
    <ProgressBar label="组件整理进度" value={68} />
    <ProgressCircle label="评审进度" value={42} />
    <Meter label="存储使用量" value={24} />
  </div>
)`,
  ),
  simple(
    'Loading',
    '反馈',
    '有语义的 Spinner 与纯装饰 Skeleton',
    () => (
      <div class="example-stack">
        <Spinner label="正在加载组件" />
        <Skeleton style={{ height: '20px', width: '72%' }} />
        <Skeleton style={{ height: '20px', width: '48%' }} />
      </div>
    ),
    `import { Skeleton, Spinner } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <div><Spinner label="正在加载" /><Skeleton style={{ height: '20px' }} /></div>`,
  ),
  simple(
    'Toast',
    '反馈',
    '作用域内的礼貌通知，保留至手动关闭',
    ToastExample,
    `import { Button, ToastProvider, useToast } from '@zixiao-labs/ui-kits-solid'
function Notify() {
  const toast = useToast()
  return <Button onClick={() => toast({ title: '预览已更新' })}>显示通知</Button>
}
export const Example = () => <ToastProvider><Notify /></ToastProvider>`,
  ),
  simple(
    'Tabs',
    '导航',
    '方向键导航与自动关联的 tabpanel',
    () => (
      <Tabs
        label="项目详情"
        defaultValue="overview"
        items={[
          { id: 'overview', label: '概览', content: <p>统一组件语义，保留每种设计语言的表达</p> },
          { id: 'activity', label: '动态', content: <p>今天更新了组件状态与示例代码</p> },
          { id: 'settings', label: '设置', content: <Switch defaultChecked>接收更新通知</Switch> },
        ]}
      />
    ),
    `import { Tabs } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <Tabs label="项目详情" defaultValue="overview" items={[
  { id: 'overview', label: '概览', content: <p>项目概览</p> },
  { id: 'activity', label: '动态', content: <p>项目动态</p> },
]} />`,
  ),
  simple(
    'Accordion',
    '导航',
    '单项或多项展开，内置键盘导航',
    () => (
      <Accordion
        items={[
          {
            id: 'theme',
            title: '如何切换设计风格',
            content: '选择右侧的全局风格，组件行为保持不变',
          },
          {
            id: 'solid',
            title: '是否依赖 React',
            content: 'Solid 组件使用原生响应式 props 与 Kobalte，不加载 React 运行时',
          },
        ]}
      />
    ),
    `import { Accordion } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <Accordion items={[
  { id: 'theme', title: '如何切换设计风格', content: '设置 data-zx-style 属性' },
  { id: 'solid', title: '是否依赖 React', content: '不加载 React 运行时' },
]} />`,
  ),
  simple(
    'Disclosure',
    '导航',
    '一个独立、可受控的展开区域',
    () => (
      <Disclosure title="使用说明">
        <p>通过 open 与 onOpenChange 控制展开状态</p>
      </Disclosure>
    ),
    `import { Disclosure } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <Disclosure title="使用说明">通过 open 与 onOpenChange 控制展开状态</Disclosure>`,
  ),
  simple(
    'Breadcrumbs',
    '导航',
    '原生链接与当前页面语义',
    () => (
      <Breadcrumbs
        items={[
          { id: 'workspace', label: '工作区', href: '?component=Card' },
          { id: 'components', label: '组件', href: '?component=Button' },
          { id: 'current', label: '使用规范' },
        ]}
      />
    ),
    `import { Breadcrumbs } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <Breadcrumbs items={[
  { id: 'workspace', label: '工作区', href: '/workspace' },
  { id: 'current', label: '使用规范' },
]} />`,
  ),
  simple(
    'Pagination',
    '导航',
    '有限数量的页码与省略标记，避免大数组',
    () => {
      const [page, setPage] = createSignal(1)
      return (
        <div class="example-stack">
          <Pagination page={page()} total={12} onChange={setPage} />
          <output class="zx-description">第 {page()} / 12 页</output>
        </div>
      )
    },
    `import { createSignal } from 'solid-js'
import { Pagination } from '@zixiao-labs/ui-kits-solid'
export function Example() {
  const [page, setPage] = createSignal(1)
  return <Pagination page={page()} total={12} onChange={setPage} />
}`,
  ),
  simple(
    'Link',
    '导航',
    '保留 href、target 与浏览器默认链接行为',
    () => <Link href="?component=Button">查看 Button 示例</Link>,
    `import { Link } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <Link href="/components">查看组件</Link>`,
  ),
  simple(
    'Modal',
    '浮层',
    '焦点陷阱、Escape 关闭、焦点恢复与主题继承',
    () => (
      <Modal trigger="打开项目设置" title="项目设置" description="此弹窗继承当前风格与明暗主题">
        <TextField label="项目名称" defaultValue="鹤坡设计系统" />
        <Select label="项目类型" options={options} defaultValue="design" />
      </Modal>
    ),
    `import { Modal, TextField } from '@zixiao-labs/ui-kits-solid'
export const Example = () => (
  <Modal trigger="打开项目设置" title="项目设置">
    <TextField label="项目名称" defaultValue="鹤坡设计系统" />
  </Modal>
)`,
  ),
  simple(
    'Drawer',
    '浮层',
    '从右侧展示内容，复用同一模态交互',
    () => (
      <Drawer trigger="打开项目抽屉" title="项目资料">
        <TextField label="项目说明" multiline defaultValue="组件规范与主题探索" />
      </Drawer>
    ),
    `import { Drawer, TextField } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <Drawer trigger="打开项目抽屉" title="项目资料"><TextField label="项目说明" multiline /></Drawer>`,
  ),
  simple(
    'Sheet',
    '浮层',
    '底部内容面板，保留安全区与模态语义',
    () => (
      <Sheet trigger="打开底部面板" title="分享项目">
        <TextField label="分享链接" defaultValue="https://example.com/hepo" readOnly />
      </Sheet>
    ),
    `import { Sheet, TextField } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <Sheet trigger="打开底部面板" title="分享项目"><TextField label="分享链接" defaultValue="https://example.com/hepo" readOnly /></Sheet>`,
  ),
  simple(
    'Popover',
    '浮层',
    '锚定触发器的内容面板，支持外部点击关闭',
    () => (
      <Popover trigger="查看项目信息" title="鹤坡设计系统" description="最近更新于今天">
        <Badge>本地演示</Badge>
      </Popover>
    ),
    `import { Popover } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <Popover trigger="查看项目信息" title="鹤坡设计系统" description="最近更新于今天">本地演示</Popover>`,
  ),
  simple(
    'Tooltip',
    '浮层',
    '鼠标悬停或键盘聚焦时显示简短说明',
    () => <Tooltip trigger="聚焦或悬停查看" content="示例不会向服务器提交数据" />,
    `import { Tooltip } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <Tooltip trigger="聚焦或悬停查看" content="示例不会向服务器提交数据" />`,
  ),
  simple(
    'Dropdown',
    '浮层',
    '方向键导航的操作菜单，不用链接伪装按钮',
    () => {
      const [result, setResult] = createSignal('等待选择')
      return (
        <div class="example-stack">
          <Dropdown
            trigger="项目操作"
            items={[
              { id: 'duplicate', label: '复制项目', onSelect: () => setResult('已选择：复制项目') },
              { id: 'archive', label: '归档项目', onSelect: () => setResult('已选择：归档项目') },
              { id: 'delete', label: '删除项目', disabled: true },
            ]}
          />
          <output class="zx-description">{result()}</output>
        </div>
      )
    },
    `import { Dropdown } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <Dropdown trigger="项目操作" items={[
  { id: 'duplicate', label: '复制项目', onSelect: () => console.log('duplicate') },
  { id: 'delete', label: '删除项目', disabled: true },
]} />`,
  ),
  simple(
    'ThemeScope',
    '主题与工具',
    '嵌套作用域与 body portal 下的主题隔离',
    NestedExample,
    `import { Card, Modal, Switch } from '@zixiao-labs/ui-kits-solid'
export const Example = () => (
  <Card data-zx-style="endfield" data-zx-color-mode="dark">
    <Switch defaultChecked>保留本地草稿</Switch>
    <Modal trigger="打开局部弹窗" title="项目设置">保持 Endfield 深色</Modal>
  </Card>
)`,
  ),
  simple(
    'PatternBackground',
    '主题与工具',
    '复用参考图描摹路径的可选背景，不影响点击',
    () => (
      <PatternBackground pattern="yunlei" class="pattern-sample">
        <Typography variant="title">鹤坡 · 项目档案</Typography>
        <p>纹样是可选内容，不随主题默认启用</p>
        <Button variant="outline">查看档案</Button>
      </PatternBackground>
    ),
    `import { Button } from '@zixiao-labs/ui-kits-solid'
import { PatternBackground } from '@zixiao-labs/ui-kits-solid/patterns'
import '@zixiao-labs/ui-kits-solid/patterns.css'
export const Example = () => <PatternBackground pattern="yunlei" style={{ padding: '32px' }}><Button>查看档案</Button></PatternBackground>`,
  ),
  simple(
    'Typography',
    '主题与工具',
    '标题、正文与标签复用当前风格字体',
    () => (
      <div class="example-stack">
        <Typography variant="headline">一套语义，多种表达</Typography>
        <Typography variant="title">鹤坡设计系统</Typography>
        <Typography>SolidJS 原生组件与可交互示例</Typography>
        <Kbd>⌘ K</Kbd>
      </div>
    ),
    `import { Kbd, Typography } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <div><Typography variant="title">鹤坡设计系统</Typography><Kbd>⌘ K</Kbd></div>`,
  ),
  simple(
    'Layout',
    '主题与工具',
    'Toolbar、Separator 与可键盘滚动的区域',
    () => (
      <div class="example-stack">
        <Toolbar aria-label="编辑操作">
          <Button variant="ghost">撤销</Button>
          <Button variant="ghost">重做</Button>
        </Toolbar>
        <Separator />
        <ScrollShadow style={{ 'max-height': '160px' }}>
          <For each={['设计原则', '基础规范', '组件状态', '主题适配', '交互验证', '交付记录']}>
            {(text) => <Typography>{text}</Typography>}
          </For>
        </ScrollShadow>
      </div>
    ),
    `import { Button, ScrollShadow, Separator, Toolbar } from '@zixiao-labs/ui-kits-solid'
export const Example = () => <div><Toolbar aria-label="编辑操作"><Button variant="ghost">撤销</Button></Toolbar><Separator /><ScrollShadow style={{ 'max-height': '160px' }}>可滚动内容</ScrollShadow></div>`,
  ),
]

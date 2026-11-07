import { useState } from 'react'
import { ArrowDownToLine, Bold, Italic, Plus, Check, Xmark } from '@gravity-ui/icons'
import {
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  ButtonGroup,
  Card,
  Cell,
  CloseButton,
  Column,
  Kbd,
  Meter,
  ProgressBar,
  ProgressCircle,
  Row,
  ScrollShadow,
  Separator,
  Skeleton,
  Spinner,
  Surface,
  Table,
  TableBody,
  TableHeader,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
  Chip,
} from '@zixiao-labs/ui-kits-react'
import type { ComponentExample } from '../catalog-types'

const code = (imports: string, body: string, setup = '') =>
  `${setup.includes('useState') ? "import { useState } from 'react'\n" : ''}import { ${imports} } from '@zixiao-labs/ui-kits-react'
import { Plus, ArrowDownToLine, Bold, Italic } from '@gravity-ui/icons'
import '@zixiao-labs/ui-kits-react/styles.css'

export function Example() {
${setup ? `  ${setup}\n` : ''}  return (
    <>
${body
  .split('\n')
  .map((line) => `      ${line}`)
  .join('\n')}
    </>
  )
}`

function CloseExample() {
  const [open, setOpen] = useState(true)
  return (
    <div className="example-stack">
      {open ? (
        <Surface variant="tonal">
          <div className="example-row">
            北岸设计 · 项目通知
            <CloseButton onClick={() => setOpen(false)} />
          </div>
        </Surface>
      ) : (
        <Button variant="outline" onClick={() => setOpen(true)}>
          重新显示通知
        </Button>
      )}
      <CloseButton disabled aria-label="关闭不可用" />
    </div>
  )
}

function ChipsExample() {
  const [tags, setTags] = useState(['界面设计', '待评审'])
  return (
    <div className="example-row">
      {tags.map((tag) => (
        <Chip key={tag} onRemove={() => setTags(tags.filter((item) => item !== tag))}>
          {tag}
        </Chip>
      ))}
      <Chip tone="accent">
        <Check aria-hidden="true" />
        已归档
      </Chip>
      <Button variant="ghost" onClick={() => setTags(['界面设计', '待评审'])}>
        重置标签
      </Button>
    </div>
  )
}

function TableExample() {
  const [sort, setSort] = useState<{ column: string; direction: 'ascending' | 'descending' }>({
    column: 'name',
    direction: 'ascending',
  })
  const projects = [
    { id: '1', name: '北岸设计', owner: '陈予安', status: '进行中' },
    { id: '2', name: '秋季品牌手册', owner: '林舒', status: '待评审' },
    { id: '3', name: '移动端规范', owner: '周知夏', status: '已归档' },
  ].sort((a, b) => (sort.direction === 'ascending' ? 1 : -1) * a.name.localeCompare(b.name, 'zh'))
  return (
    <Table
      aria-label="项目列表"
      sortDescriptor={sort}
      onSortChange={(value) =>
        setSort({ column: String(value.column), direction: value.direction })
      }
    >
      <TableHeader>
        <Column id="name" isRowHeader allowsSorting>
          项目
        </Column>
        <Column>负责人</Column>
        <Column>状态</Column>
      </TableHeader>
      <TableBody items={projects}>
        {(item) => (
          <Row id={item.id}>
            <Cell>{item.name}</Cell>
            <Cell>{item.owner}</Cell>
            <Cell>
              <Badge>{item.status}</Badge>
            </Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  )
}

export const displayExamples: ComponentExample[] = [
  {
    name: 'ButtonGroup',
    category: 'Buttons',
    description: '将相关操作归为一组，保持操作层级',
    demo: (
      <ButtonGroup aria-label="项目操作">
        <Button>
          <Plus aria-hidden="true" />
          创建项目
        </Button>
        <Button variant="outline">
          <ArrowDownToLine aria-hidden="true" />
          导出
        </Button>
        <Button variant="ghost" disabled>
          删除
        </Button>
      </ButtonGroup>
    ),
    code: code(
      'Button, ButtonGroup',
      '<ButtonGroup aria-label="项目操作">\n  <Button><Plus aria-hidden="true" />创建项目</Button>\n  <Button variant="outline">导出</Button>\n</ButtonGroup>',
    ),
  },
  {
    name: 'CloseButton',
    category: 'Buttons',
    description: '有可访问名称的关闭操作，支持禁用',
    demo: <CloseExample />,
    code: code(
      'CloseButton, Button',
      '{open && <CloseButton aria-label="关闭通知" onClick={() => setOpen(false)} />}\n<Button variant="outline" onClick={() => setOpen(true)}>重新显示通知</Button>\n<CloseButton disabled />',
      'const [open, setOpen] = useState(true)',
    ),
  },
  {
    name: 'ToggleButton',
    category: 'Buttons',
    description: '可保持选中状态的独立操作',
    demo: (
      <div className="example-row">
        <ToggleButton aria-label="粗体">
          <Bold aria-hidden="true" />
          粗体
        </ToggleButton>
        <ToggleButton defaultSelected>
          <Check aria-hidden="true" />
          关注项目
        </ToggleButton>
        <ToggleButton isDisabled>不可选</ToggleButton>
      </div>
    ),
    code: code(
      'ToggleButton',
      '<ToggleButton aria-label="粗体"><Bold aria-hidden="true" />粗体</ToggleButton>\n<ToggleButton defaultSelected>关注项目</ToggleButton>\n<ToggleButton isDisabled>不可选</ToggleButton>',
    ),
  },
  {
    name: 'ToggleButtonGroup',
    category: 'Buttons',
    description: '单选或多选的关联操作，支持方向键切换',
    demo: (
      <div className="example-stack">
        <ToggleButtonGroup
          aria-label="文字格式"
          selectionMode="multiple"
          defaultSelectedKeys={['bold']}
        >
          <ToggleButton id="bold">
            <Bold aria-hidden="true" />
            粗体
          </ToggleButton>
          <ToggleButton id="italic">
            <Italic aria-hidden="true" />
            斜体
          </ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          aria-label="对齐方式"
          selectionMode="single"
          defaultSelectedKeys={['left']}
        >
          <ToggleButton id="left">左对齐</ToggleButton>
          <ToggleButton id="center">居中</ToggleButton>
          <ToggleButton id="right">右对齐</ToggleButton>
        </ToggleButtonGroup>
      </div>
    ),
    code: code(
      'ToggleButton, ToggleButtonGroup',
      '<ToggleButtonGroup aria-label="文字格式" selectionMode="multiple" defaultSelectedKeys={[\'bold\']}>\n  <ToggleButton id="bold"><Bold aria-hidden="true" />粗体</ToggleButton>\n  <ToggleButton id="italic"><Italic aria-hidden="true" />斜体</ToggleButton>\n</ToggleButtonGroup>',
    ),
  },
  {
    name: 'Badge',
    category: 'Data display',
    description: '数量和状态的短标记，不单靠颜色区分含义',
    demo: (
      <div className="example-row">
        <Badge>12 条评论</Badge>
        <Badge tone="accent">
          <Check aria-hidden="true" />
          进行中
        </Badge>
        <Badge tone="error">
          <Xmark aria-hidden="true" />
          需修改
        </Badge>
      </div>
    ),
    code: code(
      'Badge',
      '<Badge>12 条评论</Badge>\n<Badge tone="accent">进行中</Badge>\n<Badge tone="error">需修改</Badge>',
    ),
  },
  {
    name: 'Chip',
    category: 'Data display',
    description: '内容标签与可移除的筛选条件',
    demo: <ChipsExample />,
    code: code(
      'Chip',
      '{tags.map(tag => <Chip key={tag} onRemove={() => setTags(tags.filter(item => item !== tag))}>{tag}</Chip>)}\n<Chip tone="accent">已归档</Chip>',
      'const [tags, setTags] = useState(["界面设计", "待评审"])',
    ),
  },
  {
    name: 'Table',
    category: 'Data display',
    description: '语义化项目表格，点击项目列排序',
    demo: <TableExample />,
    code: code(
      'Table, TableHeader, Column, TableBody, Row, Cell',
      '<Table aria-label="项目列表">\n  <TableHeader>\n    <Column isRowHeader>项目</Column><Column>负责人</Column>\n  </TableHeader>\n  <TableBody>\n    <Row id="north"><Cell>北岸设计</Cell><Cell>陈予安</Cell></Row>\n    <Row id="autumn"><Cell>秋季品牌手册</Cell><Cell>林舒</Cell></Row>\n  </TableBody>\n</Table>',
    ),
  },
  {
    name: 'Alert',
    category: 'Feedback',
    description: '传达状态或可恢复的错误，错误使用 alert 语义',
    demo: (
      <div className="example-stack">
        <Alert title="项目已归档" tone="accent">
          北岸设计的文件仍可在归档目录查阅
        </Alert>
        <Alert title="无法保存更改" tone="error">
          请检查网络后重试，已填写的内容不会被清除
        </Alert>
        <Alert title="评审安排">
          <span className="example-row">
            <Check aria-hidden="true" />
            周五 14:30 在团队空间进行
          </span>
        </Alert>
      </div>
    ),
    code: code(
      'Alert',
      '<Alert title="无法保存更改" tone="error">\n  请检查网络后重试\n</Alert>\n<Alert title="评审安排">周五 14:30 在团队空间进行</Alert>',
    ),
  },
  {
    name: 'Meter',
    category: 'Feedback',
    description: '显示已知范围内的测量值，而非任务进度',
    demo: (
      <div className="example-stack">
        <Meter
          label="团队存储空间"
          value={6.4}
          maxValue={10}
          formatOptions={{ style: 'unit', unit: 'gigabyte' }}
        />
        <Meter label="本周评审额度" value={4} maxValue={8} />
      </div>
    ),
    code: code(
      'Meter',
      '<Meter label="团队存储空间" value={6.4} maxValue={10}\n  formatOptions={{ style: "unit", unit: "gigabyte" }} />',
    ),
  },
  {
    name: 'ProgressBar',
    category: 'Feedback',
    description: '展示已知进度或不确定的加载过程',
    demo: (
      <div className="example-stack">
        <ProgressBar label="上传品牌素材" value={68} />
        <ProgressBar label="等待文件处理" isIndeterminate />
      </div>
    ),
    code: code(
      'ProgressBar',
      '<ProgressBar label="上传品牌素材" value={68} />\n<ProgressBar label="等待文件处理" isIndeterminate />',
    ),
  },
  {
    name: 'ProgressCircle',
    category: 'Feedback',
    description: '紧凑空间内的环形任务进度',
    demo: (
      <div className="example-row">
        <ProgressCircle label="已上传" value={72} />
        <ProgressCircle aria-label="等待处理" isIndeterminate />
      </div>
    ),
    code: code(
      'ProgressCircle',
      '<ProgressCircle label="已上传" value={72} />\n<ProgressCircle aria-label="等待处理" isIndeterminate />',
    ),
  },
  {
    name: 'Skeleton',
    category: 'Feedback',
    description: '加载内容前保留布局，避免无意义的循环闪烁',
    demo: (
      <div className="example-stack">
        <Skeleton style={{ width: 64, height: 64 }} />
        <Skeleton style={{ width: '70%' }} />
        <Skeleton />
        <Skeleton style={{ width: '85%' }} />
        <p className="example-note">加载占位元素对辅助技术隐藏</p>
      </div>
    ),
    code: code(
      'Skeleton',
      '<Skeleton style={{ width: 64, height: 64 }} />\n<Skeleton style={{ width: "70%" }} />\n<Skeleton />',
    ),
  },
  {
    name: 'Spinner',
    category: 'Feedback',
    description: '等待中的状态指示器，向辅助技术提供描述',
    demo: (
      <div className="example-row">
        <Spinner label="正在上传文件" />
        <span>正在上传品牌素材</span>
        <Button loading>正在保存</Button>
      </div>
    ),
    code: code(
      'Spinner, Button',
      '<Spinner label="正在上传文件" />\n<Button loading>正在保存</Button>',
    ),
  },
  {
    name: 'Card',
    category: 'Layout',
    description: '用描边或色调表面组织相关内容，操作保持清晰',
    demo: (
      <div className="example-row">
        <Card style={{ maxWidth: 320 }}>
          <Badge>设计项目</Badge>
          <Typography variant="title">北岸设计</Typography>
          <p>品牌识别与数字体验，下一轮评审在周五</p>
          <Button variant="tonal">
            <Plus aria-hidden="true" />
            添加素材
          </Button>
        </Card>
        <Card variant="tonal" style={{ maxWidth: 280 }}>
          <Typography variant="title">团队空间</Typography>
          <p>陈予安、林舒与周知夏共同协作</p>
        </Card>
      </div>
    ),
    code: code(
      'Card, Typography, Button',
      '<Card variant="outline">\n  <Typography variant="title">北岸设计</Typography>\n  <p>品牌识别与数字体验</p>\n  <Button variant="tonal">添加素材</Button>\n</Card>',
    ),
  },
  {
    name: 'Separator',
    category: 'Layout',
    description: '使用低强调的边界分隔内容，支持水平与垂直方向',
    demo: (
      <div className="example-stack">
        <p>项目文件</p>
        <Separator />
        <p>归档文件</p>
        <div className="example-row">
          <span>编辑</span>
          <Separator orientation="vertical" />
          <span>查看</span>
        </div>
      </div>
    ),
    code: code('Separator', '<Separator />\n<Separator orientation="vertical" />'),
  },
  {
    name: 'Surface',
    category: 'Layout',
    description: '提供平面、tonal 和描边三种基础容器',
    demo: (
      <div className="example-row">
        <Surface>默认表面</Surface>
        <Surface variant="tonal">色调表面</Surface>
        <Surface variant="outline">描边表面</Surface>
      </div>
    ),
    code: code(
      'Surface',
      '<Surface>默认表面</Surface>\n<Surface variant="tonal">色调表面</Surface>\n<Surface variant="outline">描边表面</Surface>',
    ),
  },
  {
    name: 'Toolbar',
    category: 'Layout',
    description: '相关操作的键盘导航区域，支持方向键',
    demo: (
      <Toolbar aria-label="编辑工具">
        <ToggleButton aria-label="粗体">
          <Bold aria-hidden="true" />
        </ToggleButton>
        <ToggleButton aria-label="斜体">
          <Italic aria-hidden="true" />
        </ToggleButton>
        <Separator orientation="vertical" />
        <ToggleButton>
          <Plus aria-hidden="true" />
          添加段落
        </ToggleButton>
      </Toolbar>
    ),
    code: code(
      'Toolbar, ToggleButton',
      '<Toolbar aria-label="编辑工具">\n  <ToggleButton aria-label="粗体"><Bold aria-hidden="true" /></ToggleButton>\n  <ToggleButton aria-label="斜体"><Italic aria-hidden="true" /></ToggleButton>\n</Toolbar>',
    ),
  },
  {
    name: 'Avatar',
    category: 'Media',
    description: '姓名缩写、图片及加载失败回退，支持三个尺寸',
    demo: (
      <div className="example-row">
        <Avatar name="陈予安" size="sm" />
        <Avatar name="林舒" />
        <Avatar name="周知夏" size="lg" />
        <Avatar name="Alex Chen" />
      </div>
    ),
    code: code(
      'Avatar',
      '<Avatar name="陈予安" size="sm" />\n<Avatar name="林舒" />\n<Avatar name="Alex Chen" src="/team/alex.jpg" size="lg" />',
    ),
  },
  {
    name: 'AvatarGroup',
    category: 'Media',
    description: '重叠展示团队成员，保留每个成员的可访问名称',
    demo: (
      <div className="example-row">
        <AvatarGroup aria-label="北岸设计成员">
          <Avatar name="陈予安" />
          <Avatar name="林舒" />
          <Avatar name="周知夏" />
        </AvatarGroup>
        <span className="example-note">3 位协作者</span>
      </div>
    ),
    code: code(
      'Avatar, AvatarGroup',
      '<AvatarGroup aria-label="北岸设计成员">\n  <Avatar name="陈予安" /><Avatar name="林舒" /><Avatar name="周知夏" />\n</AvatarGroup>',
    ),
  },
  {
    name: 'Kbd',
    category: 'Typography',
    description: '在说明文字中表达键盘快捷键',
    demo: (
      <div className="example-stack">
        <div className="example-row">
          <span>快速检索</span>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </div>
        <div className="example-row">
          <span>切换组件</span>
          <Kbd>Tab</Kbd>
          <span>关闭浮层</span>
          <Kbd>Esc</Kbd>
        </div>
      </div>
    ),
    code: code('Kbd', '<span>快速检索 <Kbd>⌘</Kbd> <Kbd>K</Kbd></span>\n<Kbd>Esc</Kbd>'),
  },
  {
    name: 'Typography',
    category: 'Typography',
    description: '通过字号与语义角色建立稳定的文字层级',
    demo: (
      <div className="example-stack">
        <Typography variant="headline">北岸设计</Typography>
        <Typography variant="title">品牌与数字体验</Typography>
        <Typography>为团队统一视觉语言，记录每一次设计决定</Typography>
        <Typography variant="label">下次评审 · 周五 14:30</Typography>
      </div>
    ),
    code: code(
      'Typography',
      '<Typography variant="headline">北岸设计</Typography>\n<Typography variant="title">品牌与数字体验</Typography>\n<Typography>记录每一次设计决定</Typography>\n<Typography variant="label">下次评审 · 周五 14:30</Typography>',
    ),
  },
  {
    name: 'ScrollShadow',
    category: 'Utilities',
    description: '可滚动区域保留边缘提示，键盘可聚焦和滚动',
    demo: (
      <ScrollShadow aria-label="项目活动" style={{ width: '100%', maxWidth: 480 }}>
        {[
          '陈予安更新了品牌手册',
          '林舒添加了首页草图',
          '周知夏完成了交互标注',
          '陈予安安排了周五评审',
          '林舒整理了图标资源',
          '周知夏归档了上一版设计',
          '陈予安补充了移动端规范',
          '林舒上传了交付文件',
        ].map((item) => (
          <p key={item} style={{ paddingBlock: 12 }}>
            {item}
          </p>
        ))}
      </ScrollShadow>
    ),
    code: code(
      'ScrollShadow',
      '<ScrollShadow aria-label="项目活动" style={{ maxHeight: 200 }}>\n  {activities.map(activity => <p key={activity.id}>{activity.text}</p>)}\n</ScrollShadow>',
      'const activities = [{ id: "brand", text: "陈予安更新了品牌手册" }, { id: "review", text: "林舒安排了周五评审" }]',
    ),
  },
]

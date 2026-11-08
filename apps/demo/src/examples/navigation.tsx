import { useState } from 'react'
import {
  Accordion,
  AlertDialog,
  Breadcrumbs,
  Button,
  Disclosure,
  DisclosureGroup,
  Drawer,
  Dropdown,
  Link,
  ListBox,
  Modal,
  Pagination,
  Popover,
  Sheet,
  Select,
  Tabs,
  TagGroup,
  ToastProvider,
  Tooltip,
  useToast,
} from '@zixiao-labs/ui-kits-react'
import {
  ArrowUpRight,
  CircleInfo,
  Ellipsis,
  Folder,
  PencilToSquare,
  Persons,
  TrashBin,
} from '@gravity-ui/icons'
import type { ComponentExample } from '../catalog-types'

const projectSections = [
  { id: 'overview', title: '项目概览', content: '北岸设计正在整理下一次发布的组件规范。' },
  { id: 'members', title: '团队协作', content: '陈予安负责设计，林舒负责交互与实现。' },
  { id: 'archive', title: '归档记录', content: '归档后可查看历史版本。', disabled: true },
]

function AccordionExample() {
  return (
    <div className="example-stack">
      <Accordion items={projectSections} defaultExpandedKeys={['overview']} />
      <Accordion
        items={projectSections.slice(0, 2)}
        allowsMultipleExpanded
        defaultExpandedKeys={['overview', 'members']}
      />
      <p className="example-note">单项展开 / 多项展开；归档记录暂不可用。</p>
    </div>
  )
}

function DisclosureExample() {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="example-stack">
      <Disclosure title="发布说明" isExpanded={expanded} onExpandedChange={setExpanded}>
        新版本包含导航、集合与无障碍浮层组件。
      </Disclosure>
      <Disclosure title="审批后可见" isDisabled>
        等待陈予安审批。
      </Disclosure>
      <output className="example-note">发布说明：{expanded ? '已展开' : '已收起'}</output>
    </div>
  )
}

function DisclosureGroupExample() {
  const [expanded, setExpanded] = useState(new Set<string | number>(['overview']))
  return (
    <div className="example-stack">
      <DisclosureGroup
        items={projectSections}
        expandedKeys={expanded}
        onExpandedChange={setExpanded}
        allowsMultipleExpanded
      />
      <output className="example-note">已展开 {expanded.size} 项</output>
    </div>
  )
}

const workspaceTabs = [
  { id: 'projects', label: '项目', icon: <Folder />, content: '北岸设计 · 品牌规范与组件整理' },
  { id: 'team', label: '成员', icon: <Persons />, content: '陈予安 · 林舒' },
  { id: 'history', label: '历史', content: '暂无归档记录', disabled: true },
]

function TabsExample() {
  const [selected, setSelected] = useState<string | number>('projects')
  return (
    <div className="example-stack">
      <Tabs
        label="项目内容"
        items={workspaceTabs}
        selectedKey={selected}
        onSelectionChange={setSelected}
      />
      <output className="example-note">
        当前栏目：{selected === 'projects' ? '项目' : '成员'}
      </output>
      <Tabs label="紧凑内容" items={workspaceTabs} variant="tonal" defaultSelectedKey="team" />
    </div>
  )
}

function BreadcrumbsExample() {
  const [location, setLocation] = useState('品牌规范')
  return (
    <div className="example-stack">
      <Breadcrumbs
        items={[
          { id: 'workspace', label: '工作空间', icon: <Folder /> },
          { id: 'team', label: '北岸设计' },
          { id: 'brand', label: '品牌规范' },
        ]}
        onAction={(key) => setLocation(key === 'workspace' ? '工作空间' : '北岸设计')}
      />
      <output className="example-note">最近访问：{location}。当前页不会重复触发导航。</output>
    </div>
  )
}

function PaginationExample() {
  const [page, setPage] = useState(3)
  return (
    <div className="example-stack">
      <Pagination totalPages={12} page={page} onPageChange={setPage} />
      <output className="example-note">第 {page} 页，共 12 页</output>
      <Pagination totalPages={3} defaultPage={1} disabled label="暂不可用的分页" />
    </div>
  )
}

const projectActions = [
  { id: 'edit', label: '编辑项目', icon: <PencilToSquare /> },
  { id: 'members', label: '管理成员', icon: <Persons /> },
  { id: 'delete', label: '删除项目', icon: <TrashBin />, disabled: true },
]

function DropdownExample() {
  const [action, setAction] = useState('尚未选择操作')
  return (
    <div className="example-stack">
      <div className="example-row">
        <Dropdown
          label="项目操作"
          trigger={
            <Button variant="tonal">
              <Ellipsis width={20} height={20} /> 项目操作
            </Button>
          }
          items={projectActions}
          onAction={(key) =>
            setAction(key === 'edit' ? '当前操作：编辑项目' : '当前操作：管理成员')
          }
        />
        <Dropdown
          label="只读项目操作"
          trigger={
            <Button disabled variant="outline">
              只读项目
            </Button>
          }
          items={projectActions}
        />
      </div>
      <output className="example-note">{action}</output>
    </div>
  )
}

const teamMembers = [
  { id: 'chen', label: '陈予安', icon: <Persons /> },
  { id: 'lin', label: '林舒', icon: <Persons /> },
  { id: 'guest', label: '访客（暂停访问）', disabled: true },
]

function ListBoxExample() {
  const [selected, setSelected] = useState<'all' | Set<string | number>>(new Set(['chen']))
  return (
    <div className="example-stack">
      <ListBox
        label="选择协作成员"
        items={teamMembers}
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={setSelected}
      />
      <output className="example-note">
        已选：
        {selected === 'all'
          ? '全部成员'
          : [...selected].map((id) => (id === 'chen' ? '陈予安' : '林舒')).join('、') || '暂无'}
      </output>
      <ListBox label="空团队" items={[]} />
    </div>
  )
}

function TagGroupExample() {
  const [items, setItems] = useState([
    { id: 'design', label: '设计规范', icon: <Folder /> },
    { id: 'review', label: '待林舒确认' },
    { id: 'locked', label: '已锁定', disabled: true },
  ])
  return (
    <div className="example-stack">
      <TagGroup
        label="项目标签"
        items={items}
        onRemove={(keys) => setItems((current) => current.filter((item) => !keys.has(item.id)))}
      />
      <TagGroup label="参与成员" items={teamMembers.slice(0, 2)} />
      <output className="example-note">
        保留 {items.length} 个标签。可按 Delete 删除选中的可用标签。
      </output>
    </div>
  )
}

function ModalExample() {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [owner, setOwner] = useState<string | null>('chen')
  return (
    <div className="example-stack">
      <div className="example-row">
        <Modal
          trigger={<Button>项目详情</Button>}
          title="北岸设计"
          description="品牌设计系统 · 由陈予安维护"
          isOpen={open}
          onOpenChange={setOpen}
        >
          {({ close }) => (
            <div className="example-stack">
              <p>邀请林舒共同完善导航与集合规范。</p>
              <Select label="项目负责人" items={teamMembers} value={owner} onChange={setOwner} />
              <Popover trigger={<Button variant="outline">团队说明</Button>} title="访问范围">
                <p>陈予安与林舒可以共同编辑项目内容。</p>
              </Popover>
              <div className="example-row">
                <Button
                  onClick={() => {
                    setSaved(true)
                    close()
                  }}
                >
                  确认并关闭
                </Button>
                <Button variant="outline" onClick={close}>
                  返回
                </Button>
              </div>
            </div>
          )}
        </Modal>
        <Modal trigger={<Button variant="outline">阅读发布说明</Button>} title="发布说明">
          <p>按 Escape 或点击关闭按钮返回，焦点会回到触发按钮。</p>
        </Modal>
      </div>
      <output className="example-note">
        {open ? '详情已打开' : saved ? '项目详情已确认' : '详情已关闭'}；关闭后恢复触发器焦点。
      </output>
    </div>
  )
}

function AlertDialogExample() {
  const [archived, setArchived] = useState(false)
  return (
    <div className="example-stack">
      <div className="example-row">
        <AlertDialog
          trigger={<Button variant="outline">归档项目</Button>}
          title="归档北岸设计？"
          confirmLabel="确认归档"
          onConfirm={() => setArchived(true)}
        >
          <p>归档后项目转为只读，陈予安与林舒仍可查阅历史版本。</p>
        </AlertDialog>
        <AlertDialog
          trigger={
            <Button variant="ghost">
              <TrashBin width={20} height={20} /> 删除草稿
            </Button>
          }
          title="删除未发布草稿？"
          confirmLabel="删除草稿"
          destructive
          onConfirm={() => {
            throw new Error('此草稿正在被林舒编辑，请稍后重试。')
          }}
        >
          <p>此操作不可撤销。此示例展示提交失败后保留对话框的状态。</p>
        </AlertDialog>
      </div>
      <output className="example-note">
        {archived ? '北岸设计已归档' : '项目尚未归档'}。只有确认才执行业务操作；取消与 Escape
        不会确认。
      </output>
    </div>
  )
}

function DrawerExample() {
  return (
    <div className="example-row">
      <Drawer
        trigger={
          <Button variant="tonal">
            <Persons width={20} height={20} /> 团队成员
          </Button>
        }
        title="北岸设计团队"
        description="2 位成员参与当前项目"
      >
        {({ close }) => (
          <div className="example-stack">
            <p>陈予安 · 设计负责人</p>
            <p>林舒 · 交互设计师</p>
            <Button variant="outline" onClick={close}>
              完成
            </Button>
          </div>
        )}
      </Drawer>
      <Drawer
        trigger={<Button variant="outline">项目权限</Button>}
        title="项目权限"
        isDismissable={false}
      >
        <p>团队成员可编辑；访客只读。此变体不允许点击背景关闭。</p>
      </Drawer>
    </div>
  )
}

function SheetExample() {
  const [selection, setSelection] = useState('尚未选择')
  return (
    <div className="example-stack">
      <Sheet
        trigger={<Button variant="tonal">选择分享方式</Button>}
        title="分享北岸设计"
        description="仅团队成员可以访问项目内容。"
      >
        {({ close }) => (
          <div className="example-stack">
            <Button
              onClick={() => {
                setSelection('分享对象：林舒')
                close()
              }}
            >
              选择林舒
            </Button>
            <Button variant="outline" onClick={close}>
              暂不分享
            </Button>
          </div>
        )}
      </Sheet>
      <output className="example-note">{selection}。这是模态底部面板，不包含拖拽手势。</output>
    </div>
  )
}

function PopoverExample() {
  const [followed, setFollowed] = useState(false)
  return (
    <div className="example-stack">
      <div className="example-row">
        <Popover
          trigger={
            <Button variant="outline">
              <CircleInfo width={20} height={20} /> 项目说明
            </Button>
          }
          title="北岸设计"
          description="品牌体验与组件协作空间"
        >
          {({ close }) => (
            <div className="example-stack">
              <p>陈予安邀请你关注本周的设计进展。</p>
              <Button
                variant="tonal"
                onClick={() => {
                  setFollowed(true)
                  close()
                }}
              >
                关注并关闭
              </Button>
            </div>
          )}
        </Popover>
        <Popover trigger={<Button variant="ghost">负责人</Button>} title="陈予安" placement="top">
          <p>设计负责人 · 北岸设计</p>
        </Popover>
      </div>
      <output className="example-note">{followed ? '已关注北岸设计' : '尚未关注项目'}</output>
    </div>
  )
}

function ToastActions() {
  const toast = useToast()
  const [result, setResult] = useState('尚未发送通知')
  return (
    <div className="example-stack">
      <div className="example-row">
        <Button
          onClick={() => {
            toast.add(
              { title: '北岸设计评审', description: '周五 14:30，与林舒讨论品牌规范。' },
              { timeout: 6000 },
            )
            setResult('已显示评审提醒')
          }}
        >
          显示评审提醒
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.add({
              title: '草稿已归档',
              description: '可以撤销本次操作。',
              actionLabel: '撤销',
              onAction: () => setResult('已撤销归档'),
            })
            setResult('已发送可撤销通知')
          }}
        >
          可操作通知
        </Button>
        <Button variant="ghost" onClick={toast.clear}>
          清空通知
        </Button>
      </div>
      <output className="example-note">
        {result}。操作通知持续显示，直到手动关闭；普通通知 6 秒后消失，聚焦或悬停时暂停。
      </output>
    </div>
  )
}

export const navigationExamples: ComponentExample[] = [
  {
    name: 'Accordion',
    category: 'Navigation',
    description: '可单项或多项展开的内容分组，支持禁用项目。',
    demo: <AccordionExample />,
    code: `import { Accordion } from '@zixiao-labs/ui-kits-react'

<Accordion
  defaultExpandedKeys={['overview']}
  items={[
    { id: 'overview', title: '项目概览', content: '北岸设计正在整理组件规范。' },
    { id: 'team', title: '团队协作', content: '陈予安 · 林舒' },
    { id: 'archive', title: '归档记录', content: '暂无记录', disabled: true },
  ]}
/>
// 多项展开：增加 allowsMultipleExpanded`,
  },
  {
    name: 'Disclosure',
    category: 'Navigation',
    description: '独立的可折叠说明，原生按钮语义与受控展开状态。',
    demo: <DisclosureExample />,
    code: `import { useState } from 'react'
import { Disclosure } from '@zixiao-labs/ui-kits-react'

function Example() {
  const [expanded, setExpanded] = useState(false)
  return <Disclosure title="发布说明" isExpanded={expanded} onExpandedChange={setExpanded}>
    新版本包含导航、集合与无障碍浮层组件。
  </Disclosure>
}`,
  },
  {
    name: 'DisclosureGroup',
    category: 'Navigation',
    description: 'Accordion 的集合 API，使用 expandedKeys 控制多个面板。',
    demo: <DisclosureGroupExample />,
    code: `import { useState } from 'react'
import { DisclosureGroup } from '@zixiao-labs/ui-kits-react'

function Example() {
  const [keys, setKeys] = useState(new Set<string | number>(['overview']))
  return <DisclosureGroup allowsMultipleExpanded expandedKeys={keys} onExpandedChange={setKeys}
    items={[
      { id: 'overview', title: '项目概览', content: '北岸设计' },
      { id: 'team', title: '团队协作', content: '陈予安 · 林舒' },
    ]}
  />
}`,
  },
  {
    name: 'Tabs',
    category: 'Navigation',
    description: '下划线与 tonal 两种导航；方向键切换，禁用项不可选择。',
    demo: <TabsExample />,
    code: `import { Folder, Persons } from '@gravity-ui/icons'
import { Tabs } from '@zixiao-labs/ui-kits-react'

<Tabs label="项目内容" variant="tonal" defaultSelectedKey="projects" items={[
  { id: 'projects', label: '项目', icon: <Folder />, content: '北岸设计' },
  { id: 'team', label: '成员', icon: <Persons />, content: '陈予安 · 林舒' },
  { id: 'history', label: '历史', content: '暂无归档', disabled: true },
]} />`,
  },
  {
    name: 'Breadcrumbs',
    category: 'Navigation',
    description: '显示当前位置，末项自动标记为当前页。',
    demo: <BreadcrumbsExample />,
    code: `import { Breadcrumbs } from '@zixiao-labs/ui-kits-react'

<Breadcrumbs items={[
  { id: 'workspace', label: '工作空间', href: '/workspace' },
  { id: 'team', label: '北岸设计', href: '/workspace/team' },
  { id: 'brand', label: '品牌规范' },
]} />`,
  },
  {
    name: 'Link',
    category: 'Navigation',
    description: '导航链接、图标链接与禁用状态，支持键盘可见焦点。',
    demo: (
      <div className="example-row">
        <Link href="#tabs">查看内容导航</Link>
        <Link href="https://react-aria.adobe.com/" target="_blank" rel="noreferrer">
          无障碍参考 <ArrowUpRight width={20} height={20} aria-hidden="true" />
        </Link>
        <Link href="#archive" isDisabled>
          归档暂不可用
        </Link>
      </div>
    ),
    code: `import { Link } from '@zixiao-labs/ui-kits-react'

<Link href="#tabs">查看内容导航</Link>
<Link href="#archive" isDisabled>归档暂不可用</Link>`,
  },
  {
    name: 'Pagination',
    category: 'Navigation',
    description: '有界页码窗口，支持受控页码与不可用状态。',
    demo: <PaginationExample />,
    code: `import { useState } from 'react'
import { Pagination } from '@zixiao-labs/ui-kits-react'

function Example() {
  const [page, setPage] = useState(3)
  return <Pagination totalPages={12} page={page} onPageChange={setPage} />
}`,
  },
  {
    name: 'Dropdown',
    category: 'Collections',
    description: '基于 RAC Menu 的操作菜单，自动恢复焦点并支持字符导航。',
    demo: <DropdownExample />,
    code: `import { useState } from 'react'
import { Button, Dropdown } from '@zixiao-labs/ui-kits-react'

function Example() {
  const [action, setAction] = useState('')
  return <>
    <Dropdown label="项目操作" trigger={<Button variant="tonal">项目操作</Button>}
      items={[{ id: 'edit', label: '编辑项目' }, { id: 'delete', label: '删除项目', disabled: true }]}
      onAction={(key) => setAction(String(key))} />
    <output>{action}</output>
  </>
}`,
  },
  {
    name: 'ListBox',
    category: 'Collections',
    description: '单选、多选与空集合；完整的键盘导航与选择语义。',
    demo: <ListBoxExample />,
    code: `import { ListBox } from '@zixiao-labs/ui-kits-react'

<ListBox label="选择协作成员" selectionMode="multiple" defaultSelectedKeys={['chen']}
  items={[
    { id: 'chen', label: '陈予安' },
    { id: 'lin', label: '林舒' },
    { id: 'guest', label: '访客（暂停访问）', disabled: true },
  ]}
/>`,
  },
  {
    name: 'TagGroup',
    category: 'Collections',
    description: '可选择或移除的标签集合，移除后由调用方更新 items。',
    demo: <TagGroupExample />,
    code: `import { useState } from 'react'
import { TagGroup } from '@zixiao-labs/ui-kits-react'

function Example() {
  const [items, setItems] = useState([{ id: 'design', label: '设计规范' }, { id: 'review', label: '待林舒确认' }])
  return <TagGroup label="项目标签" items={items}
    onRemove={(keys) => setItems((current) => current.filter((item) => !keys.has(item.id)))}
  />
}`,
  },
  {
    name: 'Modal',
    category: 'Overlays',
    description: '模态对话框，包含关闭按钮、焦点限制、Escape 与焦点恢复。',
    demo: <ModalExample />,
    code: `import { Button, Modal } from '@zixiao-labs/ui-kits-react'

<Modal trigger={<Button>项目详情</Button>} title="北岸设计" description="由陈予安维护">
  {({ close }) => <><p>邀请林舒共同完善设计规范。</p><Button onClick={close}>完成</Button></>}
</Modal>`,
  },
  {
    name: 'AlertDialog',
    category: 'Overlays',
    description: '明确确认与取消的语义；等待异步确认，失败时保留并宣布错误。',
    demo: <AlertDialogExample />,
    code: `import { useState } from 'react'
import { AlertDialog, Button } from '@zixiao-labs/ui-kits-react'

function Example() {
  const [archived, setArchived] = useState(false)
  return <>
    <AlertDialog trigger={<Button variant="outline">归档项目</Button>} title="归档北岸设计？"
      confirmLabel="确认归档" onConfirm={() => setArchived(true)}>
      <p>归档后项目转为只读，历史版本仍可查阅。</p>
    </AlertDialog>
    <output>{archived ? '已归档' : '未归档'}</output>
  </>
}
// onConfirm 成功后自动关闭；抛出或拒绝时保留；取消/Escape 不调用 onConfirm。`,
  },
  {
    name: 'Drawer',
    category: 'Overlays',
    description: '侧边模态面板，适合团队详情与辅助设置。',
    demo: <DrawerExample />,
    code: `import { Button, Drawer } from '@zixiao-labs/ui-kits-react'

<Drawer trigger={<Button variant="tonal">团队成员</Button>} title="北岸设计团队">
  {({ close }) => <><p>陈予安 · 林舒</p><Button onClick={close}>完成</Button></>}
</Drawer>`,
  },
  {
    name: 'Sheet',
    category: 'Overlays',
    description: '底部模态面板，适合短任务；复用安全的 RAC 对话框交互。',
    demo: <SheetExample />,
    code: `import { Button, Sheet } from '@zixiao-labs/ui-kits-react'

<Sheet trigger={<Button variant="tonal">选择分享方式</Button>} title="分享北岸设计">
  {({ close }) => <><p>仅团队成员可以访问。</p><Button onClick={close}>暂不分享</Button></>}
</Sheet>`,
  },
  {
    name: 'Popover',
    category: 'Overlays',
    description: '锚定触发器的可交互说明，自动避让视口并继承最近主题。',
    demo: <PopoverExample />,
    code: `import { Button, Popover } from '@zixiao-labs/ui-kits-react'

<Popover trigger={<Button variant="outline">项目说明</Button>} title="北岸设计" placement="bottom start">
  {({ close }) => <><p>陈予安负责本周设计进展。</p><Button onClick={close}>知道了</Button></>}
</Popover>`,
  },
  {
    name: 'Tooltip',
    category: 'Overlays',
    description: '悬停与键盘聚焦显示的补充文字；交互内容请使用 Popover。',
    demo: (
      <div className="example-row">
        <Tooltip
          trigger={
            <Button variant="outline">
              <CircleInfo width={20} height={20} /> 项目权限
            </Button>
          }
        >
          仅陈予安与林舒可以编辑项目。
        </Tooltip>
        <Tooltip
          trigger={
            <Button variant="ghost" aria-label="了解成员权限">
              <Persons width={20} height={20} />
            </Button>
          }
          placement="bottom"
          delay={0}
        >
          查看北岸设计的成员权限
        </Tooltip>
      </div>
    ),
    code: `import { Button, Tooltip } from '@zixiao-labs/ui-kits-react'

<Tooltip trigger={<Button variant="outline">项目权限</Button>} placement="top">
  仅陈予安与林舒可以编辑项目。
</Tooltip>`,
  },
  {
    name: 'Toast',
    category: 'Overlays',
    description: 'RAC 通知队列，支持操作、手动关闭与悬停/聚焦暂停计时。',
    demo: (
      <ToastProvider>
        <ToastActions />
      </ToastProvider>
    ),
    code: `import { Button, ToastProvider, useToast } from '@zixiao-labs/ui-kits-react'

function SaveAction() {
  const toast = useToast()
  return <Button onClick={() => toast.add({
    title: '规范已保存',
    description: '陈予安的修改已同步到北岸设计。',
  }, { timeout: 6000 })}>保存并通知</Button>
}

<ToastProvider><SaveAction /></ToastProvider>
// 每个独立主题作用域内放一个 Provider；不设置 timeout 的操作通知持续显示。`,
  },
]

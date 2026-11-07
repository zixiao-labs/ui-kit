import { describe, expect, test } from '@lightning-js/lightning'
import { renderToStaticMarkup } from 'react-dom/server'
import { Folder } from '@gravity-ui/icons'
import { Button } from './button'
import {
  Accordion,
  AlertDialog,
  Breadcrumbs,
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
  Tabs,
  TagGroup,
  ThemePopover,
  ThemeScope,
  ToastProvider,
  Tooltip,
  useToast,
} from './navigation'

describe('navigation and collection contracts', () => {
  test('disclosure renders a linked accessible trigger and controlled expansion', () => {
    const html = renderToStaticMarkup(
      <Disclosure title="项目说明" isExpanded>
        北岸设计
      </Disclosure>,
    )
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('aria-controls=')
    expect(html).toContain('aria-labelledby=')
    expect(html).toContain('项目说明')
    expect(html).toContain('北岸设计')
  })

  test.each([Accordion, DisclosureGroup])(
    'group supports multiple expanded items and disabled content',
    (Component) => {
      const html = renderToStaticMarkup(
        <Component
          allowsMultipleExpanded
          defaultExpandedKeys={['a', 'b']}
          items={[
            { id: 'a', title: '项目说明', content: '北岸设计' },
            { id: 'b', title: '团队成员', content: '陈予安 · 林舒' },
            { id: 'c', title: '归档记录', content: '尚不可用', disabled: true },
          ]}
        />,
      )
      expect(html.match(/aria-expanded="true"/g)?.length).toBe(2)
      expect(html).toContain('disabled=""')
    },
  )

  test('tabs link their panels and honor controlled selection and disabled items', () => {
    const html = renderToStaticMarkup(
      <Tabs
        label="项目内容"
        selectedKey="team"
        variant="tonal"
        items={[
          { id: 'project', label: '项目', icon: <Folder />, content: '项目面板' },
          { id: 'team', label: '成员', content: '陈予安 · 林舒' },
          { id: 'archive', label: '归档', content: '禁用面板', disabled: true },
        ]}
      />,
    )
    expect(html).toContain('role="tablist"')
    expect(html).toContain('role="tabpanel"')
    expect(html).toContain('aria-label="项目内容"')
    expect(html).toContain('aria-selected="true"')
    expect(html).toContain('aria-disabled="true"')
    expect(html).toContain('陈予安 · 林舒')
    expect(html).not.toContain('项目面板')
    expect(html).not.toContain('禁用面板')
  })

  test('breadcrumbs identify current page and hide decorative separators', () => {
    const html = renderToStaticMarkup(
      <Breadcrumbs
        items={[
          { id: 'workspace', label: '工作空间', href: '/workspace' },
          { id: 'team', label: '北岸设计' },
        ]}
      />,
    )
    expect(html).toContain('aria-label="面包屑导航"')
    expect(html).toContain('href="/workspace"')
    expect(html).toContain('aria-current="page"')
    expect(html).toContain('aria-hidden="true"')
  })

  test('Link preserves href, classes and disabled semantics', () => {
    const html = renderToStaticMarkup(
      <Link href="/projects" className="custom" isDisabled>
        项目
      </Link>,
    )
    expect(html).toContain('class="zx-link custom"')
    expect(html).toContain('aria-disabled="true"')
    expect(html).not.toContain('<a ')
  })

  test('pagination bounds large windows and clamps invalid page inputs', () => {
    const html = renderToStaticMarkup(<Pagination totalPages={1000000} page={500000} />)
    expect(html).toContain('aria-label="分页导航"')
    expect(html).toContain('aria-label="第 500000 页" aria-current="page"')
    expect(html.match(/aria-label="第 /g)?.length).toBe(5)
    const end = renderToStaticMarkup(<Pagination totalPages={8} page={7} />)
    expect(end).toContain('aria-label="第 7 页" aria-current="page"')
    const invalid = renderToStaticMarkup(<Pagination totalPages={Number.NaN} page={-2} />)
    expect(invalid).toContain('aria-label="第 1 页" aria-current="page"')
    expect(invalid.match(/disabled=""/g)?.length).toBe(2)
  })

  test('ListBox exposes multi-selection, text values and disabled items', () => {
    const html = renderToStaticMarkup(
      <ListBox
        label="团队成员"
        selectionMode="multiple"
        selectedKeys={new Set(['chen'])}
        items={[
          { id: 'chen', label: '陈予安', icon: <Folder /> },
          { id: 'lin', label: '林舒', disabled: true },
        ]}
      />,
    )
    expect(html).toContain('role="listbox"')
    expect(html).toContain('aria-multiselectable="true"')
    expect(html).toContain('role="option"')
    expect(html).toContain('aria-selected="true"')
    expect(html).toContain('aria-disabled="true"')
    expect(html).toContain('陈予安')
  })

  test('TagGroup provides labeled removal controls only when removable', () => {
    const props = { label: '项目标签', items: [{ id: 'design', label: '设计规范' }] }
    const removable = renderToStaticMarkup(<TagGroup {...props} onRemove={() => {}} />)
    expect(removable).toContain('项目标签')
    expect(removable).toContain('aria-label="移除设计规范"')
    const readonly = renderToStaticMarkup(<TagGroup {...props} />)
    expect(readonly).not.toContain('zx-tag__remove')
  })
})

describe('overlay SSR safety', () => {
  test.each([Modal, Drawer, Sheet, Popover])(
    'open overlays render only their trigger on the server',
    (Component) => {
      const html = renderToStaticMarkup(
        <div data-zx-style="soft" data-zx-color-mode="dark">
          <Component trigger={<Button>打开项目</Button>} title="项目详情" defaultOpen>
            机密内容
          </Component>
        </div>,
      )
      expect(html).toContain('打开项目')
      expect(html).toContain('data-zx-style="soft"')
      expect(html).not.toContain('机密内容')
      expect(html).not.toContain('role="dialog"')
      expect(html).not.toContain('data-zx-style="clean"')
    },
  )

  test('menu and tooltip are SSR safe and retain native trigger semantics', () => {
    const html = renderToStaticMarkup(
      <>
        <Dropdown
          label="项目操作"
          trigger={<Button>项目操作</Button>}
          items={[{ id: 'edit', label: '编辑项目' }]}
          defaultOpen
        />
        <Tooltip trigger={<Button>权限说明</Button>} defaultOpen>
          补充说明
        </Tooltip>
      </>,
    )
    expect(html).toContain('type="button"')
    expect(html).toContain('aria-haspopup="true"')
    expect(html).not.toContain('role="menuitem"')
    expect(html).not.toContain('补充说明')
  })

  test('alert confirmation is never invoked during SSR', () => {
    let calls = 0
    const html = renderToStaticMarkup(
      <AlertDialog
        trigger={<Button>归档</Button>}
        title="归档项目？"
        onConfirm={() => {
          calls++
        }}
        defaultOpen
      >
        确认后只读
      </AlertDialog>,
    )
    expect(calls).toBe(0)
    expect(html).toContain('归档')
    expect(html).not.toContain('确认后只读')
  })

  test('ThemeScope renders without document and starts without a portal host', () => {
    const html = renderToStaticMarkup(
      <ThemeScope>{(container) => <span>{container ? '已挂载' : '等待客户端'}</span>}</ThemeScope>,
    )
    expect(html).toContain('等待客户端')
    expect(html).not.toContain('data-zx-style')
    expect(html).not.toContain('zx-theme-portal')
    expect(html).not.toContain('data-react-aria-top-layer')
  })

  test('ThemePopover waits for measured theme without mounting an intermediary host', () => {
    const html = renderToStaticMarkup(
      <ThemeScope>
        <Button>项目说明</Button>
        <ThemePopover isOpen style={({ placement }) => ({ opacity: placement ? 1 : 0 })}>
          未测量主题的内容
        </ThemePopover>
      </ThemeScope>,
    )
    expect(html).toContain('项目说明')
    expect(html).not.toContain('未测量主题的内容')
    expect(html).not.toContain('zx-theme-portal')
  })

  test('toast queues are provider-local and missing providers fail explicitly', () => {
    function Action() {
      const toast = useToast()
      return <Button onClick={() => toast.add({ title: '已保存' })}>保存</Button>
    }
    const html = renderToStaticMarkup(
      <ToastProvider>
        <Action />
      </ToastProvider>,
    )
    expect(html).toContain('保存')
    expect(html).not.toContain('已保存')
    expect(() => renderToStaticMarkup(<Action />)).toThrow(
      'useToast must be used inside ToastProvider.',
    )
  })
})

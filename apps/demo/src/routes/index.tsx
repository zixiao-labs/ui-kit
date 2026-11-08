import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowUpRight, ChevronRight, Copy, Magnifier, Moon, Sun } from '@gravity-ui/icons'
import { Button } from '@zixiao-labs/ui-kits-react'
import { useTheme } from '../theme'
import { ThemePanel } from '../theme-panel'
import { ButtonPlayground } from '../examples/button-playground'
import { displayExamples } from '../examples/display'
import { formsExamples } from '../examples/forms'
import { navigationExamples } from '../examples/navigation'
import { pickersExamples } from '../examples/pickers'
import type { ComponentExample } from '../catalog-types'

export const componentExamples: ComponentExample[] = [
  {
    name: 'Button',
    category: 'Buttons',
    description: '切换风格、尺寸与状态，查看 React 用法',
    demo: <ButtonPlayground />,
    code: '',
  },
  ...displayExamples,
  ...formsExamples,
  ...navigationExamples,
  ...pickersExamples,
]

const categoryOrder = [
  'Buttons',
  'Collections',
  'Colors',
  'Controls',
  'Data display',
  'Date and time',
  'Feedback',
  'Forms',
  'Layout',
  'Media',
  'Navigation',
  'Overlays',
  'Pickers',
  'Typography',
  'Utilities',
]
const categoryLabels: Record<string, string> = {
  Buttons: '按钮',
  Collections: '集合',
  Colors: '颜色',
  Controls: '控件',
  'Data display': '数据展示',
  'Date and time': '日期与时间',
  Feedback: '反馈',
  Forms: '表单',
  Layout: '布局',
  Media: '媒体',
  Navigation: '导航',
  Overlays: '浮层',
  Pickers: '选择器',
  Typography: '排版',
  Utilities: '工具',
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): { component?: string } => ({
    component: typeof search.component === 'string' ? search.component : undefined,
  }),
  component: Home,
})

function Home() {
  const { component } = Route.useSearch()
  const navigate = useNavigate({ from: '/' })
  const [query, setQuery] = useState('')
  const [dark, setDark] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const { previewStyle } = useTheme()
  const active = componentExamples.find((item) => item.name === component) ?? componentExamples[0]
  const filtered = componentExamples.filter((item) =>
    `${item.name} ${item.description} ${categoryLabels[item.category]}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  )
  function select(name: string) {
    setCopyState('idle')
    void navigate({ search: { component: name }, replace: true })
  }
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(active.code)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
  }
  return (
    <main className="catalog">
      <aside className="catalog-nav component-directory" aria-label="组件目录">
        <div className="directory-heading">
          <span>组件目录</span>
          <span>{componentExamples.length}</span>
        </div>
        <label className="directory-search">
          <Magnifier aria-hidden="true" />
          <input
            aria-label="检索组件"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="检索组件"
          />
        </label>
        <label className="mobile-component-picker">
          <span className="zx-sr-only">选择组件</span>
          <select
            aria-label="选择组件"
            value={filtered.some((item) => item.name === active.name) ? active.name : ''}
            onChange={(event) => select(event.target.value)}
          >
            <option value="" disabled>
              选择匹配组件
            </option>
            {filtered.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <div className="directory-groups">
          {categoryOrder.map((category) => {
            const items = filtered
              .filter((item) => item.category.toLowerCase() === category.toLowerCase())
              .sort((a, b) => a.name.localeCompare(b.name))
            return (
              items.length > 0 && (
                <div className="directory-group" key={category}>
                  <h2>{categoryLabels[category]}</h2>
                  {items.map((item) => (
                    <button
                      type="button"
                      key={item.name}
                      aria-current={active.name === item.name ? 'page' : undefined}
                      onClick={() => select(item.name)}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )
            )
          })}
        </div>
        {filtered.length === 0 && (
          <output className="directory-empty">没有匹配的组件，请换个名称</output>
        )}
      </aside>
      <div className="catalog-content">
        <div className="page-intro">
          <div>
            <p className="component-category">
              组件 <ChevronRight aria-hidden="true" />{' '}
              {categoryLabels[active.category] ?? active.category}
            </p>
            <h1>{active.name}</h1>
            <p className="intro-description">{active.description.replace(/。$/, '')}</p>
          </div>
          <a
            className="reference-link"
            href="https://react-aria.adobe.com/"
            target="_blank"
            rel="noreferrer"
          >
            React Aria <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
        {active.name !== 'Button' && (
          <div className="section-heading" id="interactive">
            <h2>交互预览</h2>
            <Button
              className="preview-theme-toggle"
              variant="outline"
              aria-label="样本深色模式"
              aria-pressed={dark}
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
              <span className="theme-mode-label">{dark ? '浅色样本' : '深色样本'}</span>
            </Button>
          </div>
        )}
        {active.name === 'Button' ? (
          active.demo
        ) : (
          <div key={active.name}>
            <section
              className="component-demo"
              aria-label={`${active.name} 用法`}
              data-zx-style="clean"
              data-zx-color-mode={dark ? 'dark' : 'light'}
              style={previewStyle(dark)}
            >
              <div className="demo-heading">
                <span>预览</span>
                <span>Clean / {dark ? 'Dark' : 'Light'}</span>
              </div>
              <div className="demo-stage">{active.demo}</div>
            </section>
            <section className="code-panel" id="usage" aria-label="使用代码">
              <div className="code-heading">
                <span>使用代码 / TSX</span>
                <button type="button" className="copy-button" onClick={copyCode}>
                  <Copy aria-hidden="true" />
                  {copyState === 'copied'
                    ? '已复制'
                    : copyState === 'error'
                      ? '复制失败，重试'
                      : '复制代码'}
                </button>
              </div>
              <pre tabIndex={0} aria-label="当前组件代码">
                <code>{active.code}</code>
              </pre>
              {copyState !== 'idle' && (
                <output className="copy-feedback">
                  {copyState === 'copied' ? '已复制当前代码' : '无法访问剪贴板，请选中代码手动复制'}
                </output>
              )}
            </section>
          </div>
        )}
        <div className="catalog-footnote">
          <span>{componentExamples.length} 个组件条目 · 共用行为与主题合同</span>
          <a href="https://www.heroui.com/docs/components" target="_blank" rel="noreferrer">
            覆盖基准：HeroUI All Components ↗
          </a>
        </div>
      </div>
      <ThemePanel />
    </main>
  )
}

import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowUpRight, ChevronRight, Copy, Magnifier } from '@gravity-ui/icons'
import { Select } from '@zixiao-labs/ui-kits-react'
import { useTheme } from '../theme'
import { ThemePanel } from '../theme-panel'
import { ThemeModeSelect } from '../theme-mode-select'
import { GlobalStyleSelect, StyleSelect } from '../style-select'
import { ThemeComposition } from '../theme-composition'
import { ButtonPlayground } from '../examples/button-playground'
import { EffectPlayground } from '../examples/effect-playground'
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
  const [copyResult, setCopyResult] = useState<{ code: string; state: 'copied' | 'error' } | null>(
    null,
  )
  const { previewStyle, previewExpression, previewImport, dark, sampleStyle } = useTheme()
  const active = componentExamples.find((item) => item.name === component) ?? componentExamples[0]
  const filtered = componentExamples.filter((item) =>
    `${item.name} ${item.description} ${categoryLabels[item.category]}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  )
  const code = `import type { ReactNode } from 'react'
${previewStyle && previewImport ? `${previewImport.trim()}\n` : ''}${active.code}

// 用此作用域包裹上方组件 JSX；不改变组件的状态与行为
export function ThemedScope({ children }: { children: ReactNode }) {
  return (
    <div data-zx-style="${sampleStyle.id}" data-zx-color-mode="${dark ? 'dark' : 'light'}"${previewStyle ? `\n      style={${previewExpression}}` : ''}>
      {children}
    </div>
  )
}`
  const copyState = copyResult?.code === code ? copyResult.state : 'idle'
  function select(name: string) {
    setCopyResult(null)
    void navigate({ search: { component: name }, replace: true })
  }
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setCopyResult({ code, state: 'copied' })
    } catch {
      setCopyResult({ code, state: 'error' })
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
        <Select
          className="mobile-component-picker"
          label="选择组件"
          placeholder="选择匹配组件"
          value={filtered.some((item) => item.name === active.name) ? active.name : null}
          onChange={(value) => {
            if (value) select(value)
          }}
          items={filtered.map(({ name }) => ({ id: name, label: name }))}
        />
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
        <div className="workspace-toolbar">
          <GlobalStyleSelect />
          <a href="#theme-composition">风格混用实验</a>
        </div>
        {active.name !== 'Button' && (
          <div className="section-heading" id="interactive">
            <h2>交互预览</h2>
            <div className="preview-selectors">
              <StyleSelect />
              <ThemeModeSelect label="样本主题" />
            </div>
          </div>
        )}
        {active.name === 'Button' ? (
          active.demo
        ) : (
          <div key={active.name}>
            <section
              className="component-demo"
              aria-label={`${active.name} 用法`}
              data-zx-style={sampleStyle.id}
              data-zx-color-mode={dark ? 'dark' : 'light'}
              style={previewStyle}
            >
              <div className="demo-heading">
                <span>预览</span>
                <span>
                  {sampleStyle.name} / {dark ? 'Dark' : 'Light'}
                </span>
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
                <code>{code}</code>
              </pre>
              {copyState !== 'idle' && (
                <output className="copy-feedback">
                  {copyState === 'copied' ? '已复制当前代码' : '无法访问剪贴板，请选中代码手动复制'}
                </output>
              )}
            </section>
          </div>
        )}
        {(active.name === 'Button' || active.name === 'Card' || active.name === 'Surface') && (
          <EffectPlayground key={`effects-${active.name}`} component={active.name} />
        )}
        <ThemeComposition />
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

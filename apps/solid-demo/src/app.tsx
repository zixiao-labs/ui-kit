import { createEffect, createMemo, createSignal, For, onCleanup, onMount, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { Button, Select, Slider, Switch, ToastProvider } from '@zixiao-labs/ui-kits-solid'
import { brandTheme, createTheme, themeToCSS } from '@zixiao-labs/ui-kits-solid/theme'
import { examples } from './examples'

const styles = [
  { id: 'clean', label: 'Clean', note: '语义色彩 · 柔和表面' },
  { id: 'endfield', label: 'Endfield', note: '工程秩序 · 信号黄' },
  { id: 'hepo', label: '鹤坡', note: '石白黛青 · 宋体标题' },
  { id: 'hepo-interior', label: '鹤坡 · 室内', note: '暖石红木 · 香槟色' },
  { id: 'minimal', label: 'Minimal', note: '紧凑轮廓 · 绿色强调' },
  { id: 'soft', label: 'Soft', note: '圆润轮廓 · 柔和层次' },
  { id: 'brutalist', label: 'Brutalist', note: '硬边界 · 高对比' },
]
type Mode = 'light' | 'dark' | 'system'
interface Preferences {
  style: string
  mode: Mode
  custom: boolean
  primary: string
  secondary: string
  radius: number
}
const defaults: Preferences = { style: 'clean', mode: 'system', custom: false, ...brandTheme }
const storageKey = 'zx-solid-demo-theme-v1'
const isColor = (value: unknown): value is string =>
  typeof value === 'string' && /^#[\da-f]{6}$/i.test(value)

function readPreferences(): Preferences {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    if (!value || typeof value !== 'object') return defaults
    const saved = value as Record<string, unknown>
    return {
      style: styles.some((style) => style.id === saved.style)
        ? String(saved.style)
        : defaults.style,
      mode: saved.mode === 'light' || saved.mode === 'dark' ? saved.mode : 'system',
      custom: saved.custom === true,
      primary: isColor(saved.primary) ? saved.primary : defaults.primary,
      secondary: isColor(saved.secondary) ? saved.secondary : defaults.secondary,
      radius:
        typeof saved.radius === 'number' && Number.isFinite(saved.radius)
          ? Math.max(0, Math.min(32, saved.radius))
          : defaults.radius,
    }
  } catch {
    return defaults
  }
}
function componentFromURL() {
  return (
    examples.find(
      (example) => example.name === new URL(location.href).searchParams.get('component'),
    )?.name ?? 'Button'
  )
}

export function App() {
  const [preferences, setPreferences] = createSignal(readPreferences())
  const [selected, setSelected] = createSignal(componentFromURL())
  const [query, setQuery] = createSignal('')
  const [systemDark, setSystemDark] = createSignal(
    matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const [notice, setNotice] = createSignal('')
  const [copy, setCopy] = createSignal<{ code: string; message: string }>()
  const dark = () =>
    preferences().mode === 'dark' || (preferences().mode === 'system' && systemDark())
  const active = createMemo(
    () => examples.find((example) => example.name === selected()) ?? examples[0],
  )
  const filtered = createMemo(() =>
    examples.filter((example) =>
      `${example.name} ${example.description} ${example.category}`
        .toLowerCase()
        .includes(query().trim().toLowerCase()),
    ),
  )
  const categories = createMemo(() => [...new Set(filtered().map((example) => example.category))])
  const code = () =>
    `${active().code}\n\n// 应用入口只需加载一次样式\nimport '@zixiao-labs/ui-kits-solid/styles.css'\n\n// 将组件置于此作用域中\n// data-zx-style="${preferences().style}"\n// data-zx-color-mode="${dark() ? 'dark' : 'light'}"\n`
  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setPreferences((current) => ({ ...current, [key]: value }))
  function selectComponent(name: string) {
    setSelected(name)
    const url = new URL(location.href)
    url.searchParams.set('component', name)
    history.pushState(null, '', url)
  }
  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopy({ code: text, message: '已复制' })
    } catch {
      setCopy({ code: text, message: '复制失败，请手动选择代码' })
    }
  }
  createEffect(() => {
    const settings = preferences()
    const root = document.documentElement
    root.dataset.zxStyle = settings.style
    root.dataset.zxColorMode = dark() ? 'dark' : 'light'
    // Remove old overrides before switching back to a style's native tokens.
    for (const name of Array.from(root.style))
      if (name.startsWith('--zx-')) root.style.removeProperty(name)
    if (settings.custom)
      for (const [name, value] of Object.entries(createTheme(settings, dark())))
        root.style.setProperty(name, value)
    try {
      localStorage.setItem(storageKey, JSON.stringify(settings))
    } catch {
      setNotice('浏览器禁止本地存储，主题仅在当前页面生效')
    }
  })
  onMount(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const onMode = () => setSystemDark(media.matches)
    const onPopState = () => setSelected(componentFromURL())
    const onSearchShortcut = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return
      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      )
        return
      event.preventDefault()
      const input = document.querySelector<HTMLInputElement>('.directory-search input')
      if (input?.offsetParent) input.focus()
      else
        document.querySelector<HTMLButtonElement>('#mobile-component .zx-select__trigger')?.focus()
    }
    media.addEventListener('change', onMode)
    window.addEventListener('popstate', onPopState)
    window.addEventListener('keydown', onSearchShortcut)
    onCleanup(() => {
      media.removeEventListener('change', onMode)
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('keydown', onSearchShortcut)
    })
  })
  return (
    <ToastProvider>
      <a class="skip-link" href="#main-content">
        跳转到组件预览
      </a>
      <header class="site-header">
        <a class="brand" href="?component=Button">
          <span class="brand-mark" aria-hidden="true">
            子
          </span>
          <span>
            Zixiao Laboratories<small>UI Kits · 组件工作台</small>
          </span>
        </a>
        <div class="framework-label">
          <span class="framework-mark" aria-hidden="true">
            S
          </span>
          SolidJS<span class="header-note">原生响应式组件</span>
        </div>
        <span class="version-label">v0.0.0 · Workspace</span>
      </header>
      <div class="workbench">
        <aside class="component-nav" aria-label="组件目录">
          <div class="directory-heading">
            <h2>组件目录</h2>
            <span>{examples.length}</span>
          </div>
          <label class="directory-search">
            <span class="zx-sr-only">检索组件</span>
            <input
              type="search"
              placeholder="检索组件"
              value={query()}
              onInput={(event) => setQuery(event.currentTarget.value)}
            />
            <kbd>/</kbd>
          </label>
          <Show
            when={filtered().length}
            fallback={<p class="empty-results">没有匹配的组件，试试中文分类或组件名</p>}
          >
            <For each={categories()}>
              {(category) => (
                <section class="directory-group">
                  <h3>{category}</h3>
                  <For each={filtered().filter((example) => example.category === category)}>
                    {(example) => (
                      <button
                        type="button"
                        class="directory-item"
                        aria-current={selected() === example.name ? 'page' : undefined}
                        onClick={() => selectComponent(example.name)}
                      >
                        {example.name}
                      </button>
                    )}
                  </For>
                </section>
              )}
            </For>
          </Show>
          <div class="directory-footnote">
            Solid primitives
            <br />
            共享视觉，不共享框架运行时
          </div>
        </aside>
        <main id="main-content">
          <Select
            id="mobile-component"
            class="mobile-directory"
            label="选择组件"
            options={examples.map((example) => ({ id: example.name, label: example.name }))}
            value={selected()}
            onChange={(name) => {
              if (name) selectComponent(name)
            }}
          />
          <div class="page-breadcrumb">
            组件 <span aria-hidden="true">/</span> {active().category}{' '}
            <span aria-hidden="true">/</span> <span>{active().name}</span>
          </div>
          <div class="page-heading">
            <div>
              <h1>{active().name}</h1>
              <p>{active().description}</p>
            </div>
            <span class="source-label">Solid / TSX</span>
          </div>
          <section class="preview-panel" aria-labelledby="preview-heading">
            <div class="panel-heading">
              <h2 id="preview-heading">交互预览</h2>
              <span>
                {styles.find((style) => style.id === preferences().style)?.label}{' '}
                <span class="panel-divider">/</span> {dark() ? '深色' : '浅色'}
              </span>
            </div>
            <div class="preview-canvas">
              <Show when={active()} keyed>
                {(example) => <Dynamic component={example.render} />}
              </Show>
            </div>
          </section>
          <section class="code-panel" aria-labelledby="code-heading">
            <div class="panel-heading">
              <div class="code-title">
                <h2 id="code-heading">使用示例</h2>
                <span>example.tsx</span>
              </div>
              <button type="button" class="quiet-button" onClick={() => void copyText(code())}>
                复制代码
              </button>
            </div>
            <pre tabIndex={0} aria-label="Solid TSX 使用代码">
              <code>{code()}</code>
            </pre>
            <Show when={copy()?.code === code()}>
              <output class="copy-message">{copy()?.message}</output>
            </Show>
          </section>
          <section class="implementation-note">
            <h2>原生 Solid，不是 React 包装层</h2>
            <p>
              响应式属性使用 <code>splitProps</code> 保留追踪，复杂交互交给 Kobalte。使用 Solid 的{' '}
              <code>class</code>、<code>onInput</code> 和 <code>createSignal</code>
              ，组件行为不随设计风格改变。
            </p>
            <p class="scope-note">
              这是首批 Solid 组件，不代表 React 目录的全部能力已迁移。日期、颜色选择器与 GPU /
              液态玻璃增强尚未接入；表格使用原生语义，不提供数据网格交互。
            </p>
          </section>
        </main>
        <aside class="theme-panel" aria-label="主题设置">
          <div class="theme-heading">
            <h2>主题设置</h2>
            <span>7 种风格</span>
          </div>
          <p class="theme-intro">相同的组件，切换表达方式</p>
          <Select
            label="全局风格"
            options={styles}
            value={preferences().style}
            onChange={(id) => {
              if (id) setPreferences((current) => ({ ...current, style: id, custom: false }))
            }}
          />
          <p class="style-note">{styles.find((style) => style.id === preferences().style)?.note}</p>
          <Select
            label="明暗模式"
            options={[
              { id: 'system', label: '跟随系统' },
              { id: 'light', label: '浅色' },
              { id: 'dark', label: '深色' },
            ]}
            value={preferences().mode}
            onChange={(mode) => {
              if (mode === 'light' || mode === 'dark' || mode === 'system') update('mode', mode)
            }}
          />
          <div class="theme-separator" />
          <Switch checked={preferences().custom} onChange={(checked) => update('custom', checked)}>
            自定义配色
          </Switch>
          <p class="control-note">启用后覆盖颜色与圆角，字体保留当前风格</p>
          <fieldset class="seed-fields" disabled={!preferences().custom}>
            <legend class="zx-sr-only">自定义主题种子</legend>
            <For
              each={[
                { key: 'primary' as const, label: '主色' },
                { key: 'secondary' as const, label: '辅助色' },
              ]}
            >
              {(field) => (
                <label class="color-control">
                  <span>{field.label}</span>
                  <div>
                    <input
                      type="color"
                      aria-label={`${field.label}取色器`}
                      value={preferences()[field.key]}
                      onInput={(event) => update(field.key, event.currentTarget.value)}
                    />
                    <input
                      aria-label={`${field.label}十六进制值`}
                      value={preferences()[field.key]}
                      pattern="#[0-9a-fA-F]{6}"
                      onChange={(event) => {
                        if (isColor(event.currentTarget.value))
                          update(field.key, event.currentTarget.value)
                        else {
                          event.currentTarget.value = preferences()[field.key]
                          setNotice('请输入六位十六进制颜色，例如 #8b5cf6')
                        }
                      }}
                    />
                  </div>
                </label>
              )}
            </For>
            <Slider
              label="圆角"
              min={0}
              max={32}
              step={1}
              value={preferences().radius}
              disabled={!preferences().custom}
              onChange={(value) => update('radius', value)}
            />
          </fieldset>
          <div class="theme-separator" />
          <div class="token-heading">
            <span>有效色板</span>
            <span>--zx-*</span>
          </div>
          <div class="token-swatches">
            <For
              each={[
                ['accent', '操作'],
                ['tonal', '辅助'],
                ['surface', '表面'],
                ['text', '文字'],
              ]}
            >
              {([token, label]) => (
                <div>
                  <span class="token-swatch" style={{ background: `var(--zx-${token})` }} />
                  <small>{label}</small>
                </div>
              )}
            </For>
          </div>
          <div class="theme-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const css = preferences().custom
                  ? themeToCSS(preferences())
                  : `@import '@zixiao-labs/ui-kits-solid/base.css';\n@import '@zixiao-labs/ui-kits-solid/themes/${preferences().style}.css';\n\n/* 作用域：data-zx-style="${preferences().style}" data-zx-color-mode="${dark() ? 'dark' : 'light'}" */\n`
                void copyText(css).then(() => setNotice(copy()?.message ?? ''))
              }}
            >
              复制主题 CSS
            </Button>
            <button
              type="button"
              class="quiet-button"
              onClick={() => {
                setPreferences({ ...defaults })
                setNotice('已恢复默认主题，明暗跟随系统')
              }}
            >
              恢复默认
            </button>
          </div>
          <p class="theme-footer">设置仅保存在当前浏览器，不会上传</p>
          <output class="settings-notice">{notice()}</output>
        </aside>
      </div>
      <footer class="site-footer">
        <span>Zixiao Laboratories UI Kits</span>
        <span>SolidJS + Kobalte · Nasti</span>
        <span>一套语义，多种表达</span>
      </footer>
    </ToastProvider>
  )
}

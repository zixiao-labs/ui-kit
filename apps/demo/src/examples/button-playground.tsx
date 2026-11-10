import { useState } from 'react'
import { Copy, Plus } from '@gravity-ui/icons'
import { Button, Select } from '@zixiao-labs/ui-kits-react'
import type { ButtonSize, ButtonVariant } from '@zixiao-labs/ui-kits-react'
import { useTheme } from '../theme'
import { ThemeModeSelect } from '../theme-mode-select'
import { StyleSelect } from '../style-select'

const variants = [
  { id: 'solid', name: 'Filled', description: '主要操作' },
  { id: 'tonal', name: 'Tonal', description: '次要操作' },
  { id: 'outline', name: 'Outlined', description: '中等强调' },
  { id: 'ghost', name: 'Text', description: '低强调' },
] as const

export function ButtonPlayground() {
  const { previewStyle, dark, sampleStyle: style, settings } = useTheme()
  const [variant, setVariant] = useState<ButtonVariant>('solid')
  const [size, setSize] = useState<ButtonSize>('md')
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [withIcon, setWithIcon] = useState(false)
  const [count, setCount] = useState(0)
  const [copyResult, setCopyResult] = useState<{
    code: string
    state: 'copied' | 'error'
  } | null>(null)
  const example = `import { Button } from '@zixiao-labs/ui-kits-react'
import '@zixiao-labs/ui-kits-react/styles.css'${settings.customized && previewStyle ? "\nimport { createTheme } from '@zixiao-labs/ui-kits-react/theme'" : ''}${withIcon ? "\nimport { Plus } from '@gravity-ui/icons'" : ''}

<div data-zx-style="${style.id}" data-zx-color-mode="${dark ? 'dark' : 'light'}"${settings.customized && previewStyle ? `\n  style={createTheme(${JSON.stringify({ primary: settings.primary, secondary: settings.secondary, radius: settings.radius })}, ${dark})}` : ''}>
  <Button variant="${variant}" size="${size}"${loading ? ' loading' : ''}${disabled ? ' disabled' : ''}>
    ${withIcon ? '<Plus aria-hidden="true" />' : ''}触发交互
  </Button>
</div>`
  const copyState = copyResult?.code === example ? copyResult.state : 'idle'

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(example)
      setCopyResult({ code: example, state: 'copied' })
    } catch {
      setCopyResult({ code: example, state: 'error' })
    }
  }

  return (
    <div className="button-playground">
      <div>
        <section id="button" className="component-section" aria-labelledby="button-title">
          <div className="section-heading" id="interactive">
            <h2 id="button-title">交互预览</h2>
            <span className="section-caption">原生语义 · 键盘可用</span>
          </div>

          <div className="playground">
            <div
              className="preview"
              data-testid="preview"
              data-zx-style={style.id}
              data-zx-color-mode={dark ? 'dark' : 'light'}
              style={previewStyle}
            >
              <div className="preview-toolbar">
                <span className="preview-style-label">{style.name} / Button</span>
                <ThemeModeSelect label="预览主题" />
              </div>
              <div className="preview-stage">
                <h3>{style.description}</h3>
                <div className="preview-actions">
                  <Button
                    variant={variant}
                    size={size}
                    loading={loading}
                    disabled={disabled}
                    onClick={() => setCount((value) => value + 1)}
                  >
                    {withIcon && <Plus aria-hidden="true" />}
                    触发交互
                  </Button>
                  <Button variant="ghost" size={size} onClick={() => setCount(0)}>
                    重置计数
                  </Button>
                </div>
                <output className="click-count" aria-live="polite">
                  已触发 {count} 次交互
                </output>
              </div>
              <div className="preview-bottom">
                <span className="preview-properties">
                  {variant} / {size}
                </span>
                <div className="token-swatches" aria-label="当前主题色板">
                  <span className="token-accent" title="Primary" />
                  <span className="token-secondary" title="Secondary" />
                  <span className="token-text" title="On surface" />
                  <span className="token-surface" title="Surface" />
                </div>
              </div>
            </div>

            <aside className="lab-controls" aria-label="组件配置">
              <div className="controls-heading">
                <h3>配置</h3>
                <span>Props</span>
              </div>
              <StyleSelect label="设计风格" className="select-control" />
              <Select
                className="select-control"
                label={
                  <>
                    变体 <small>variant</small>
                  </>
                }
                items={variants.map(({ id, name }) => ({ id, label: name }))}
                value={variant}
                onChange={(value) => {
                  const selected = variants.find((item) => item.id === value)
                  if (selected) setVariant(selected.id)
                }}
              />
              <fieldset className="size-control">
                <legend>
                  尺寸 <small>size</small>
                </legend>
                <div className="segmented-control">
                  <span className="segment-indicator" data-size={size} aria-hidden="true" />
                  {(['sm', 'md', 'lg'] as const).map((item) => (
                    <label key={item}>
                      <input
                        type="radio"
                        name="size"
                        value={item}
                        checked={size === item}
                        onChange={() => setSize(item)}
                      />
                      <span>{{ sm: '小', md: '中', lg: '大' }[item]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="state-controls">
                <label className="switch-control">
                  <span>
                    加载状态 <small>loading</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={loading}
                    onChange={(event) => setLoading(event.target.checked)}
                  />
                  <span className="switch-track" aria-hidden="true" />
                </label>
                <label className="switch-control">
                  <span>
                    禁用状态 <small>disabled</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={disabled}
                    onChange={(event) => setDisabled(event.target.checked)}
                  />
                  <span className="switch-track" aria-hidden="true" />
                </label>
                <label className="switch-control">
                  <span>显示图标</span>
                  <input
                    type="checkbox"
                    checked={withIcon}
                    onChange={(event) => setWithIcon(event.target.checked)}
                  />
                  <span className="switch-track" aria-hidden="true" />
                </label>
              </div>
            </aside>
          </div>

          <div className="code-panel" id="usage">
            <div className="code-heading">
              <div>
                <span className="code-tab">使用代码</span>
                <span className="code-language">React / TSX</span>
              </div>
              <button className="copy-button" type="button" onClick={copyCode}>
                <Copy aria-hidden="true" />
                {copyState === 'copied'
                  ? '已复制'
                  : copyState === 'error'
                    ? '复制失败，重试'
                    : '复制代码'}
              </button>
            </div>
            <pre tabIndex={0} aria-label="当前组件代码">
              <code>{example}</code>
            </pre>
            {copyState !== 'idle' && (
              <output className="copy-feedback">
                {copyState === 'copied' ? '已复制当前代码' : '无法访问剪贴板，请选中代码手动复制'}
              </output>
            )}
          </div>
        </section>

        <section id="variants" className="variants-section" aria-labelledby="variants-title">
          <div className="section-heading">
            <h2 id="variants-title">按钮层级</h2>
            <span className="section-caption">{style.name} / 点击样本切换变体</span>
          </div>
          <div
            className="variant-grid"
            data-zx-style={style.id}
            data-zx-color-mode={dark ? 'dark' : 'light'}
            style={previewStyle}
          >
            {variants.map((item) => (
              <div className="variant-example" key={item.id} data-selected={variant === item.id}>
                <Button
                  variant={item.id}
                  aria-pressed={variant === item.id}
                  onClick={() => setVariant(item.id)}
                >
                  预览 {item.name}
                </Button>
                <span>
                  {item.name}
                  <small>{item.description}</small>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section id="colors" className="colors-section" aria-labelledby="colors-title">
          <div className="section-heading">
            <h2 id="colors-title">色彩与主题</h2>
            <span className="section-caption">品牌色与自适应表面</span>
          </div>
          <div
            className="color-grid"
            data-zx-style={style.id}
            data-zx-color-mode={dark ? 'dark' : 'light'}
            style={previewStyle}
          >
            <div className="color-sample color-primary">
              <span>Aa</span>
              <span>
                Primary<small>关键操作</small>
              </span>
            </div>
            <div className="color-sample color-secondary">
              <span>Aa</span>
              <span>
                Secondary container<small>柔和强调</small>
              </span>
            </div>
            <div className="color-sample color-surface">
              <span>Aa</span>
              <span>
                Surface<small>内容表面</small>
              </span>
            </div>
            <div className="color-sample color-container">
              <span>Aa</span>
              <span>
                Surface container<small>色调层次</small>
              </span>
            </div>
          </div>
          <p className="foundation-note">
            各风格共用组件行为。预览默认跟随全局，也可独立选择；下方可验证嵌套风格与浮层隔离。
          </p>
        </section>
        <section className="variants-section" aria-labelledby="icon-button-title">
          <div className="section-heading">
            <h2 id="icon-button-title">图标与状态</h2>
            <span className="section-caption">@gravity-ui/icons</span>
          </div>
          <div
            className="example-row"
            data-zx-style={style.id}
            data-zx-color-mode={dark ? 'dark' : 'light'}
            style={previewStyle}
          >
            <Button>
              <Plus aria-hidden="true" />
              创建项目
            </Button>
            <Button variant="outline" aria-label="添加成员">
              <Plus aria-hidden="true" />
            </Button>
            <Button loading>正在创建</Button>
            <Button disabled>暂不可用</Button>
          </div>
        </section>
      </div>
    </div>
  )
}

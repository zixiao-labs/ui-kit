import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@zixiao-labs/react'
import type { ButtonSize, ButtonVariant } from '@zixiao-labs/react'

export const Route = createFileRoute('/')({
  component: Home,
})

const styles = [
  { id: 'minimal', name: 'Minimal', description: '清晰、克制，让内容成为焦点。', number: '01' },
  { id: 'soft', name: 'Soft', description: '柔和的色彩，轻盈而亲近的触感。', number: '02' },
  {
    id: 'brutalist',
    name: 'Brutalist',
    description: '鲜明的边界，直接而有力的表达。',
    number: '03',
  },
] as const

function Home() {
  const [style, setStyle] = useState<(typeof styles)[number]>(styles[0])
  const [dark, setDark] = useState(false)
  const [variant, setVariant] = useState<ButtonVariant>('solid')
  const [size, setSize] = useState<ButtonSize>('md')
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [count, setCount] = useState(0)
  const example = `import { Button } from '@zixiao-labs/react'
import '@zixiao-labs/react/styles.css'

<div data-zx-style="${style.id}"
     data-zx-color-mode="${dark ? 'dark' : 'light'}">
  <Button variant="${variant}" size="${size}"${loading ? ' loading' : ''}${disabled ? ' disabled' : ''}>
    开始创造
  </Button>
</div>`

  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div>
          <p className="eyebrow">
            <span className="status-dot" /> ZIXIAO DESIGN EXPERIMENT / 001
          </p>
          <h1 id="hero-title">
            同一套组件，
            <br />
            <span>不止一种表达。</span>
          </h1>
          <p className="hero-description">
            把交互留给组件，把个性交给设计。
            <br />
            一个从零开始的多风格 React 组件实验室。
          </p>
        </div>
        <div className="hero-note">
          <span className="note-cross" aria-hidden="true">
            ＋
          </span>
          <p>
            One foundation.
            <br />
            Many expressions.
          </p>
          <span>BEHAVIOR × TOKENS × STYLE</span>
        </div>
      </section>

      <section className="lab-section" aria-labelledby="playground-title">
        <div className="section-heading">
          <div>
            <span className="section-number">01 / PLAYGROUND</span>
            <h2 id="playground-title">从一个 Button 开始</h2>
          </div>
          <span className="section-caption">切换风格，组件行为保持一致 ↙</span>
        </div>

        <div className="lab">
          <aside className="lab-controls" aria-label="组件配置">
            <fieldset className="style-picker">
              <legend>
                设计语言 <span>STYLE</span>
              </legend>
              {styles.map((item) => (
                <label className="style-option" key={item.id}>
                  <input
                    type="radio"
                    name="style"
                    value={item.id}
                    checked={style.id === item.id}
                    onChange={() => setStyle(item)}
                  />
                  <span className={`style-swatch swatch-${item.id}`} aria-hidden="true">
                    Aa
                  </span>
                  <span className="style-name">
                    {item.name}
                    <small>EXPRESSION {item.number}</small>
                  </span>
                  <span className="radio-indicator" aria-hidden="true" />
                </label>
              ))}
            </fieldset>

            <div className="control-divider" />
            <div className="select-grid">
              <label htmlFor="variant">
                变体 <span>VARIANT</span>
                <select
                  id="variant"
                  value={variant}
                  onChange={(event) => setVariant(event.target.value as ButtonVariant)}
                >
                  <option value="solid">Solid</option>
                  <option value="outline">Outline</option>
                  <option value="ghost">Ghost</option>
                </select>
              </label>
              <label htmlFor="size">
                尺寸 <span>SIZE</span>
                <select
                  id="size"
                  value={size}
                  onChange={(event) => setSize(event.target.value as ButtonSize)}
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </label>
            </div>
            <label className="checkbox-control">
              <span>
                加载状态 <small>Loading</small>
              </span>
              <input
                type="checkbox"
                checked={loading}
                onChange={(event) => setLoading(event.target.checked)}
              />
            </label>
            <label className="checkbox-control">
              <span>
                禁用状态 <small>Disabled</small>
              </span>
              <input
                type="checkbox"
                checked={disabled}
                onChange={(event) => setDisabled(event.target.checked)}
              />
            </label>
            <p className="controls-footnote">
              一个 API，三种表达。
              <br />
              风格仅改变外观，不改变语义。
            </p>
          </aside>

          <div className="lab-workspace">
            <div
              className="preview"
              data-testid="preview"
              data-zx-style={style.id}
              data-zx-color-mode={dark ? 'dark' : 'light'}
            >
              <div className="preview-toolbar">
                <span>
                  <span className="preview-dot" /> LIVE PREVIEW
                </span>
                <button
                  className="mode-toggle"
                  type="button"
                  aria-label="深色模式"
                  aria-pressed={dark}
                  onClick={() => setDark(!dark)}
                >
                  <span aria-hidden="true">{dark ? '◐' : '◑'}</span> {dark ? 'Dark' : 'Light'}
                </button>
              </div>
              <div className="preview-stage">
                <span className="preview-style-index">EXPRESSION / {style.number}</span>
                <h3>
                  {style.name}
                  <span>.</span>
                </h3>
                <p>{style.description}</p>
                <div className="preview-actions">
                  <Button
                    variant={variant}
                    size={size}
                    loading={loading}
                    disabled={disabled}
                    onClick={() => setCount((value) => value + 1)}
                  >
                    开始创造 <span aria-hidden="true">↗</span>
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
                <span>SCOPED CSS VARIABLES</span>
                <div className="token-swatches" aria-label="当前主题色板">
                  <span className="token-accent" title="Accent" />
                  <span className="token-text" title="Text" />
                  <span className="token-muted" title="Muted" />
                  <span className="token-surface" title="Surface" />
                </div>
              </div>
            </div>
            <div className="code-panel">
              <div className="code-heading">
                <span>使用示例</span>
                <span>TSX / WORKSPACE PACKAGE</span>
              </div>
              <pre tabIndex={0} aria-label="当前组件代码">
                <code>{example}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="foundation-section" aria-labelledby="foundation-title">
        <div>
          <span className="section-number">02 / FOUNDATION</span>
          <h2 id="foundation-title">先让基础，足够扎实。</h2>
          <p>不急着堆满组件。先把包边界、设计变量和开发体验连接起来。</p>
        </div>
        <div className="foundation-grid">
          <div>
            <span>01</span>
            <h3>共享行为</h3>
            <p>
              React 19 + TypeScript
              <br />
              保留原生 button 属性与 ref
            </p>
          </div>
          <div>
            <span>02</span>
            <h3>独立表达</h3>
            <p>
              局部主题 + 明暗模式
              <br />
              CSS tokens 驱动视觉变化
            </p>
          </div>
          <div>
            <span>03</span>
            <h3>轻量工具链</h3>
            <p>
              pnpm workspace + Nasti
              <br />
              Oxlint 检查，Oxfmt 格式化
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

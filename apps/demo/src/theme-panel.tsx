import { useState } from 'react'
import type { CSSProperties } from 'react'
import { ArrowRotateLeft, Check, Copy, Palette } from '@gravity-ui/icons'
import { themeToCSS } from '@zixiao-labs/ui-kits-react/theme'
import { useTheme } from './theme'

function SeedInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const [draft, setDraft] = useState(value)
  const [previous, setPrevious] = useState(value)
  if (previous !== value) {
    setPrevious(value)
    setDraft(value)
  }
  const invalid = !/^#[\da-f]{6}$/i.test(draft)
  return (
    <div className="seed-field">
      <label htmlFor={`seed-${label}`}>{label}</label>
      <div className="seed-input" data-invalid={invalid || undefined}>
        <input
          type="color"
          aria-label={`${label}取色器`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          id={`seed-${label}`}
          type="text"
          value={draft}
          spellCheck={false}
          maxLength={7}
          aria-invalid={invalid}
          aria-describedby={invalid ? `error-${label}` : undefined}
          onChange={(event) => {
            setDraft(event.target.value)
            if (/^#[\da-f]{6}$/i.test(event.target.value))
              onChange(event.target.value.toLowerCase())
          }}
        />
      </div>
      {invalid && (
        <p className="seed-error" id={`error-${label}`}>
          请输入 # 加六位十六进制颜色
        </p>
      )}
    </div>
  )
}

export function ThemePanel() {
  const { settings, update, reset, storageError } = useTheme()
  const [copy, setCopy] = useState<{ code: string; state: 'copied' | 'error' } | null>(null)
  const css = themeToCSS(settings)
  const copyState = copy?.code === css ? copy.state : 'idle'
  return (
    <aside className="docs-aside" aria-label="主题与本页导航">
      <nav className="page-toc" aria-label="本页内容">
        <h2>本页内容</h2>
        <a href="#interactive">交互预览</a>
        <a href="#usage">使用代码</a>
        <a href="#theme-customizer">主题定制</a>
      </nav>
      <section className="theme-panel" id="theme-customizer" aria-labelledby="theme-panel-title">
        <div className="theme-panel-heading">
          <Palette aria-hidden="true" />
          <h2 id="theme-panel-title">调一套你的主题</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="恢复默认主题"
            onClick={() => {
              reset()
              setCopy(null)
            }}
          >
            <ArrowRotateLeft aria-hidden="true" />
          </button>
        </div>
        <p>从品牌色出发，让表面、文字与组件自然呼应</p>
        <div className="theme-presets" aria-label="主题配色预设">
          {[
            { name: '紫霄', primary: '#8b5cf6', secondary: '#fcd34d' },
            { name: '松林', primary: '#28745b', secondary: '#e8b86d' },
            { name: '海岸', primary: '#3269b1', secondary: '#edb9a2' },
            { name: '朱砂', primary: '#b84842', secondary: '#e1bb67' },
          ].map((preset) => (
            <button
              type="button"
              key={preset.name}
              aria-label={`${preset.name}配色`}
              aria-pressed={
                settings.primary === preset.primary && settings.secondary === preset.secondary
              }
              style={
                {
                  '--preset-primary': preset.primary,
                  '--preset-secondary': preset.secondary,
                } as CSSProperties
              }
              onClick={() =>
                update({ primary: preset.primary, secondary: preset.secondary, customized: true })
              }
            >
              <span className="preset-colors" aria-hidden="true">
                <i />
                <i />
              </span>
              {preset.name}
            </button>
          ))}
        </div>
        <SeedInput
          label="主色"
          value={settings.primary}
          onChange={(primary) => update({ primary, customized: true })}
        />
        <SeedInput
          label="辅助色"
          value={settings.secondary}
          onChange={(secondary) => update({ secondary, customized: true })}
        />
        <label className="radius-control">
          <span>
            圆角 <span>{settings.radius}px</span>
          </span>
          <input
            type="range"
            aria-label="主题圆角"
            min="0"
            max="32"
            step="4"
            value={settings.radius}
            onChange={(event) => update({ radius: Number(event.target.value), customized: true })}
          />
        </label>
        <div className="tonal-preview" aria-label="自动生成的色调表面">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <span className="tonal-caption">HCT 色阶 · 自动适配明暗</span>
        <button
          className="theme-export"
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(css)
              setCopy({ code: css, state: 'copied' })
            } catch {
              setCopy({ code: css, state: 'error' })
            }
          }}
        >
          {copyState === 'copied' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copyState === 'copied' ? '已复制主题 CSS' : '复制主题 CSS'}
        </button>
        {copyState === 'error' && <output>无法访问剪贴板，请重试或允许剪贴板权限</output>}
        {storageError && <output>浏览器未允许保存，主题仍可预览和复制</output>}
      </section>
      <p className="aside-note">
        同一套组件，不同的表达
        <br />
        主题会应用到预览与浮层
      </p>
    </aside>
  )
}

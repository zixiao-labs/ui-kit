import { useState } from 'react'
import type { CSSProperties } from 'react'
import { ArrowRotateLeft, Check, Copy, Palette } from '@gravity-ui/icons'
import {
  createTheme,
  isFontFamily,
  themePresets,
  themeToCSS,
} from '@zixiao-labs/ui-kits-react/theme'
import { getThemeOptions, isZixiaoTheme, useTheme } from './theme'

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

function FontInput({
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
  const invalid = draft.trim() !== '' && !isFontFamily(draft)
  return (
    <div className="font-field">
      <label htmlFor={`font-${label}`}>{label}</label>
      <input
        id={`font-${label}`}
        value={draft}
        placeholder="留空使用风格默认字体"
        maxLength={512}
        spellCheck={false}
        aria-invalid={invalid}
        aria-describedby={invalid ? `font-error-${label}` : 'theme-font-help'}
        onChange={(event) => {
          const next = event.target.value
          setDraft(next)
          if (!next.trim() || isFontFamily(next)) onChange(next.trim())
        }}
      />
      {invalid && (
        <p className="seed-error" id={`font-error-${label}`}>
          请输入字体名称列表，如 "Noto Sans SC", sans-serif
        </p>
      )}
    </div>
  )
}

function cssBlock(selector: string, tokens: Record<string, string>) {
  return `${selector} {\n${Object.entries(tokens)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')}\n}\n`
}

export function ThemePanel() {
  const { settings, update, reset, storageError } = useTheme()
  const [copy, setCopy] = useState<{ code: string; state: 'copied' | 'error' } | null>(null)
  const [tailwind, setTailwind] = useState(false)
  const options = getThemeOptions(settings)
  const selector = '[data-zx-theme="custom"]'
  const fontTokens = Object.fromEntries(
    Object.entries(createTheme(options)).filter(
      ([key]) => key === '--zx-font' || key === '--zx-font-display',
    ),
  )
  const overrides = settings.customized
    ? themeToCSS(options)
    : (Object.keys(fontTokens).length ? cssBlock(selector, fontTokens) : '') +
      (settings.darkOptimized && isZixiaoTheme(settings)
        ? cssBlock(`${selector}[data-zx-color-mode="dark"]`, createTheme(options, true))
        : '')
  const css = `${tailwind ? `@import 'tailwindcss';\n@import '@zixiao-labs/ui-kits-react/tailwind.css';\n\n` : ''}/* Zixiao Laboratories UI Kits — ${settings.style}
 * 使用 data-zx-style="${settings.style}" 和 data-zx-color-mode="light" / "dark"
 * ${overrides ? '定制作用域还需添加 data-zx-theme="custom"。' : '嵌套作用域可选择其他风格。'}${tailwind ? '\n * 工具类示例：bg-zx-surface text-zx-text font-zx rounded-zx' : ''}
 */
@import '@zixiao-labs/ui-kits-react/base.css'${tailwind ? ' layer(components)' : ''};
@import '@zixiao-labs/ui-kits-react/themes/${settings.style}.css'${tailwind ? ' layer(components)' : ''};

${overrides}`
  const copyState = copy?.code === css ? copy.state : 'idle'
  return (
    <aside className="docs-aside" aria-label="主题与本页导航">
      <nav className="page-toc" aria-label="本页内容">
        <h2>本页内容</h2>
        <a href="#interactive">交互预览</a>
        <a href="#usage">使用代码</a>
        <a href="#theme-composition">风格混用实验</a>
        <a href="#theme-customizer">主题定制</a>
      </nav>
      <section className="theme-panel" id="theme-customizer" aria-labelledby="theme-panel-title">
        <div className="theme-panel-heading">
          <Palette aria-hidden="true" />
          <h2 id="theme-panel-title">主题设置</h2>
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
        <p>
          {settings.customized
            ? '自定义配色覆盖全局风格，同风格预览同步更新'
            : '当前使用风格原生配色与形状'}
        </p>
        <div className="theme-presets" aria-label="主题配色预设">
          {Object.values(themePresets).map((preset) => (
            <button
              type="button"
              key={preset.name}
              aria-label={`${preset.name}配色`}
              aria-pressed={
                settings.customized &&
                settings.primary === preset.primary &&
                settings.secondary === preset.secondary
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
        {isZixiaoTheme(settings) && (
          <label className="theme-option">
            <input
              type="checkbox"
              checked={settings.darkOptimized}
              onChange={(event) => update({ darkOptimized: event.target.checked })}
            />
            <span>
              紫霄深色优化
              <small>深色使用 #422256 + #D7A547，浅色不变</small>
            </span>
          </label>
        )}
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
        <details className="theme-fonts">
          <summary>自定义字体</summary>
          <p id="theme-font-help">填写 CSS 字体栈；字体须已安装或由应用加载，不会自动下载。</p>
          <FontInput
            label="正文字体"
            value={settings.fontFamily}
            onChange={(fontFamily) => update({ fontFamily })}
          />
          <FontInput
            label="标题字体"
            value={settings.displayFontFamily}
            onChange={(displayFontFamily) => update({ displayFontFamily })}
          />
        </details>
        <div className="tonal-preview" aria-label="自动生成的色调表面">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <span className="tonal-caption">
          {settings.customized ? 'HCT 色阶 · 自动适配明暗' : '原生风格 · 明暗配色'}
        </span>
        <label className="theme-option">
          <input
            type="checkbox"
            checked={tailwind}
            onChange={(event) => setTailwind(event.target.checked)}
          />
          <span>Tailwind CSS 导出</span>
        </label>
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
